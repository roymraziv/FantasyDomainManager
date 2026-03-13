output "api_gateway_url" {
  description = "API Gateway invoke URL"
  value       = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.api_stage_name}"
}

output "api_custom_domain_url" {
  description = "API custom domain URL"
  value       = "https://${var.api_domain}"
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.api.arn
}

output "api_gateway_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.api.id
}

output "api_gateway_domain_name" {
  description = "API Gateway custom domain name"
  value       = aws_api_gateway_domain_name.api.domain_name
}

output "api_gateway_domain_target" {
  description = "API Gateway custom domain target (for DNS configuration)"
  value       = aws_api_gateway_domain_name.api.regional_domain_name
}

output "api_gateway_domain_zone_id" {
  description = "API Gateway custom domain hosted zone ID (for Route53)"
  value       = aws_api_gateway_domain_name.api.regional_hosted_zone_id
}

