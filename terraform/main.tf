terraform {
  required_version = ">= 1.0"

  # Use partial backend configuration. Supply bucket/key/region/table at init time.
  backend "s3" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data source for existing ACM certificate (if you already have one)
# If not, you'll need to create one manually or use terraform to create it
data "aws_acm_certificate" "api_cert" {
  domain   = var.api_domain
  statuses = ["ISSUED"]
  provider = aws.us_east_1 # ACM certificates for API Gateway must be in us-east-1
}

# IAM role for Lambda function
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for Lambda to write CloudWatch logs
resource "aws_iam_role_policy" "lambda_logging" {
  name = "${var.project_name}-lambda-logging"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# IAM policy for Lambda to access SES (for email sending)
resource "aws_iam_role_policy" "lambda_ses" {
  name = "${var.project_name}-lambda-ses"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda function
# Note: Build the Lambda package first: ./scripts/build-lambda.sh
resource "aws_lambda_function" "api" {
  filename         = "${path.module}/${var.lambda_package_path}"
  function_name    = "${var.project_name}-api"
  role             = aws_iam_role.lambda_role.arn
  handler          = "FantasyDomainManager::FantasyDomainManager.LambdaEntryPoint::FunctionHandlerAsync"
  source_code_hash = filebase64sha256("${path.module}/${var.lambda_package_path}")
  runtime          = "dotnet8"
  timeout          = 30
  memory_size      = 512

  environment {
    variables = {
      # Database connection string
      ConnectionStrings__Domains = var.database_connection_string

      # JWT token key
      TokenKey = var.token_key

      # CORS allowed origins
      CORS__AllowedOrigins = join(",", local.cors_origins_list)

      # AWS SES configuration
      AWS__SES__Region      = var.aws_ses_region
      AWS__SES__SenderEmail = var.aws_ses_sender_email
      AWS__SES__SenderName  = var.aws_ses_sender_name

      # Email configuration
      Email__BaseUrl                        = var.email_base_url
      Email__VerificationTokenExpiryMinutes = var.email_verification_token_expiry_minutes
      Email__ResetTokenExpiryMinutes        = var.email_reset_token_expiry_minutes

      # Admin seed configuration
      AdminSeed__Email     = var.admin_seed_email
      AdminSeed__FirstName = var.admin_seed_first_name
      AdminSeed__LastName  = var.admin_seed_last_name
      AdminSeed__Password  = var.admin_seed_password

      # Environment
      ASPNETCORE_ENVIRONMENT = var.environment
    }
  }

  depends_on = [
    aws_iam_role_policy.lambda_logging,
    aws_cloudwatch_log_group.lambda_logs
  ]
}

# CloudWatch log group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-api"
  retention_in_days = var.log_retention_days
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.project_name}-api"
  description = "Fantasy Domain Manager API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = var.api_stage_name

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_rest_api.api.body,
      aws_api_gateway_resource.proxy.id,
      aws_api_gateway_method.proxy.id,
      aws_api_gateway_integration.lambda.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_method.proxy,
    aws_api_gateway_integration.lambda,
  ]
}

# API Gateway proxy resource (catches all paths)
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "{proxy+}"
}

# API Gateway method for proxy resource
resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway method for root
resource "aws_api_gateway_method" "proxy_root" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_rest_api.api.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway integration with Lambda for proxy
resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

# API Gateway integration with Lambda for root
resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_rest_api.api.root_resource_id
  http_method = aws_api_gateway_method.proxy_root.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# API Gateway custom domain
resource "aws_api_gateway_domain_name" "api" {
  domain_name              = var.api_domain
  regional_certificate_arn = data.aws_acm_certificate.api_cert.arn

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# API Gateway base path mapping
resource "aws_api_gateway_base_path_mapping" "api" {
  api_id      = aws_api_gateway_rest_api.api.id
  stage_name  = aws_api_gateway_deployment.api.stage_name
  domain_name = aws_api_gateway_domain_name.api.domain_name
}

# Lambda package is built by ./scripts/build-lambda.sh
# The zip file is created at var.lambda_package_path
# We use filebase64sha256 to get the hash for change detection

# Provider for us-east-1 (required for ACM certificates used by API Gateway)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

