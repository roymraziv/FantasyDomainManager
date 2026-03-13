# Terraform Infrastructure for Lambda + API Gateway

This directory contains Terraform configuration to deploy the Fantasy Domain Manager API to AWS Lambda with API Gateway.

## Prerequisites

1. **Terraform** installed (>= 1.0)
   ```bash
   brew install terraform  # macOS
   # or download from https://www.terraform.io/downloads
   ```

2. **AWS CLI** configured with credentials
   ```bash
   aws configure
   ```

3. **.NET 8.0 SDK** (for building the Lambda package)
   ```bash
   # Already installed if you can build the backend
   ```

4. **ACM Certificate** for your custom domain
   - The certificate must be in `us-east-1` region (required for API Gateway)
   - You can create it manually in AWS Console or use Terraform
   - The certificate domain must match `api_domain` variable

## Setup Steps

### 0. Create Terraform Remote State (Required for CI/CD)

The Terraform configuration uses an S3 backend with DynamoDB locking. Create these once:

- S3 bucket for state (example: `fantasy-domain-manager-tf-state`)
- DynamoDB table for locks (example: `fantasy-domain-manager-tf-locks`, partition key `LockID` as String)

Example bootstrap commands:

```bash
aws s3api create-bucket --bucket fantasy-domain-manager-tf-state --region us-east-1
aws s3api put-bucket-versioning \
  --bucket fantasy-domain-manager-tf-state \
  --versioning-configuration Status=Enabled
aws dynamodb create-table \
  --table-name fantasy-domain-manager-tf-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 1. Configure Terraform Variables

Copy the example variables file and fill in your values:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your actual values:
- `database_connection_string`: Your Neon PostgreSQL connection string
- `token_key`: Your JWT signing key (64+ characters)
- `api_domain`: Your API domain (e.g., `api.fantasydomainmanager.com`)
- `cors_allowed_origins`: Your frontend URLs
- Other configuration values

### 2. Create ACM Certificate (if needed)

If you don't have an ACM certificate yet, create one:

**Option A: AWS Console**
1. Go to AWS Certificate Manager (ACM) in `us-east-1` region
2. Request a public certificate
3. Domain: `api.fantasydomainmanager.com` (or your API domain)
4. Complete DNS validation

**Option B: Terraform** (add to `main.tf` if you want to manage it)
```hcl
resource "aws_acm_certificate" "api_cert" {
  domain_name       = var.api_domain
  validation_method = "DNS"
  provider          = aws.us_east_1

  lifecycle {
    create_before_destroy = true
  }
}
```

### 3. Build Lambda Package

Build the Lambda deployment package:

```bash
./scripts/build-lambda.sh
```

This will create `backend/publish/lambda-package.zip`

### 4. Initialize Terraform

```bash
cd terraform
terraform init \
  -backend-config="bucket=<your-tf-state-bucket>" \
  -backend-config="key=fantasy-domain-manager/prod/terraform.tfstate" \
  -backend-config="region=us-east-1" \
  -backend-config="dynamodb_table=<your-tf-lock-table>" \
  -backend-config="encrypt=true"
```

### 5. Plan Deployment

Review what Terraform will create:

```bash
terraform plan
```

### 6. Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted.

### 7. Configure DNS

After deployment, Terraform will output the API Gateway domain target. You need to create a CNAME record:

**If using Route53:**
```bash
# Get the domain target from terraform output
terraform output api_gateway_domain_target
terraform output api_gateway_domain_zone_id

# Create CNAME record in Route53 pointing to the domain target
```

**If using external DNS:**
Create a CNAME record:
- Name: `api` (or your subdomain)
- Value: `{api_gateway_domain_target}` (from terraform output)
- TTL: 300

### 8. Verify Deployment

```bash
# Get the API URL
terraform output api_custom_domain_url

# Test the API (after DNS propagates, which can take 5-30 minutes)
curl https://api.fantasydomainmanager.com/api/account/validate-reset-token

# Tail Lambda logs for startup/runtime errors
aws logs tail /aws/lambda/fantasy-domain-manager-api --since 10m
```

### 9. Validate CI Idempotency (Before Cutover)

After first successful deploy:

1. Trigger the backend workflow again with no infrastructure changes.
2. Confirm `terraform plan` reports no changes (or expected code-only changes).
3. Trigger it a second time and confirm the same behavior.

This proves remote state and locking are working correctly.

## Updating the Deployment

When you make code changes:

1. **Build new Lambda package:**
   ```bash
   ./scripts/build-lambda.sh
   ```

2. **Update Terraform (if infrastructure changed):**
   ```bash
   cd terraform
   terraform plan
   terraform apply
   ```

3. **Update Lambda function code:**
   ```bash
   cd terraform
   terraform apply -replace=aws_lambda_function.api
   ```

Or update just the Lambda code without Terraform:
```bash
aws lambda update-function-code \
  --function-name fantasy-domain-manager-api \
  --zip-file fileb://../backend/publish/lambda-package.zip
```

## Terraform Outputs

After deployment, view outputs:

```bash
terraform output
```

Key outputs:
- `api_custom_domain_url`: Your API URL with custom domain
- `api_gateway_url`: API Gateway default URL (for testing)
- `lambda_function_name`: Lambda function name
- `api_gateway_domain_target`: DNS target for CNAME record

## Troubleshooting

### Lambda Cold Starts

If cold starts are too slow:
- Increase `memory_size` in `main.tf` (more memory = faster CPU)
- Consider using Lambda provisioned concurrency (adds cost)

### API Gateway Timeout

If requests timeout:
- Increase `timeout` in Lambda function (max 30 seconds for API Gateway)
- Optimize database queries
- Consider API Gateway caching

### CORS Issues

If CORS errors occur:
- Verify `cors_allowed_origins` in `terraform.tfvars`
- Check API Gateway CORS configuration
- Ensure frontend sends `credentials: 'include'`

### Certificate Issues

- Certificate must be in `us-east-1` region
- Certificate must be validated (DNS or email)
- Domain name must match exactly

### Database Connection Issues

- Verify connection string format
- Check Neon IP allowlist (may need to allow Lambda IPs)
- Verify SSL mode is set correctly

## Cost Estimation

**Lambda:**
- Free tier: 1M requests/month, 400K GB-seconds
- After free tier: ~$0.20 per 1M requests
- Memory: 512MB = ~$0.0000083 per GB-second

**API Gateway:**
- Free tier: 1M requests/month
- After free tier: ~$3.50 per 1M requests

**Total estimated cost:** $0-5/month for low-medium traffic

## Cleanup

To destroy all resources:

```bash
cd terraform
terraform destroy
```

**Warning:** This will delete everything including the Lambda function and API Gateway.

## File Structure

```
terraform/
├── main.tf                 # Main infrastructure resources
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── terraform.tfvars.example # Example configuration
├── .gitignore             # Git ignore file
└── README.md              # This file
```

