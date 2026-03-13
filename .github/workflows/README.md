# GitHub Actions CI/CD Setup

## Required GitHub Secrets

Add these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

### AWS Credentials
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key

### Terraform Remote State
- `TF_STATE_BUCKET` - S3 bucket name that stores Terraform state
- `TF_STATE_KEY` - State object key (example: `fantasy-domain-manager/prod/terraform.tfstate`)
- `TF_STATE_REGION` - Region for the state bucket (example: `us-east-1`)
- `TF_STATE_LOCK_TABLE` - DynamoDB table name used for state locking

### Application Configuration
- `DATABASE_CONNECTION_STRING` - Your Neon PostgreSQL connection string
  - Example: `Host=ep-xxx.neon.tech;Database=neondb;Username=user;Password=pass;SSL Mode=Require`
  
- `TOKEN_KEY` - JWT signing key (64+ characters)
  - Example: `YourSuperSecretProductionTokenKeyThatMustBeAtLeast64CharactersLongForJWTTokenSigning1234567890`

- `API_DOMAIN` - Your API custom domain
  - Example: `api.fantasydomainmanager.com`

- `CORS_ALLOWED_ORIGINS` - Comma-separated list of allowed origins
  - Example: `https://fantasydomainmanager.com,https://www.fantasydomainmanager.com`
  - Note: No spaces after commas

- `AWS_SES_SENDER_EMAIL` - Verified SES sender email
  - Example: `noreply@fantasydomainmanager.com`

- `EMAIL_BASE_URL` - Base URL for email links
  - Example: `https://fantasydomainmanager.com`

- `ADMIN_SEED_PASSWORD` - Admin user password for seeding
  - Example: `SecurePassword123!`

## How It Works

1. **Trigger**: Workflow runs on push to `main` branch when backend/terraform files change

2. **Build**: 
   - Restores .NET dependencies
   - Publishes the application
   - Creates Lambda deployment package at `backend/publish/lambda-package.zip`

3. **Deploy**:
   - Initializes Terraform with S3 remote state + DynamoDB locking
   - Plans changes (shows what will be created/updated)
   - Applies changes (creates/updates AWS resources)

4. **Result**: Lambda function updated with new code

## Manual Deployment

You can also deploy manually by running the workflow:
1. Go to Actions tab
2. Select "Deploy Backend to Lambda"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Troubleshooting

### Terraform Plan Fails
- Check that all required secrets are set
- Verify AWS credentials have proper permissions
- Verify `TF_STATE_BUCKET`, `TF_STATE_KEY`, `TF_STATE_REGION`, and `TF_STATE_LOCK_TABLE` are valid
- Check Terraform logs in Actions output

### Lambda Deployment Fails
- Verify Lambda package was created successfully
- Check Lambda function logs in CloudWatch
- Verify environment variables are set correctly

### Custom Domain Issues
- Ensure ACM certificate exists in us-east-1
- Verify DNS is configured correctly
- Check API Gateway domain name status

