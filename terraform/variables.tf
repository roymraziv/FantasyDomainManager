variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "fantasy-domain-manager"
}

variable "api_domain" {
  description = "Custom domain for the API (e.g., api.fantasydomainmanager.com)"
  type        = string
}

variable "api_stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "prod"
}

variable "environment" {
  description = "Environment name (e.g., Production, Development)"
  type        = string
  default     = "Production"
}

variable "lambda_package_path" {
  description = "Path to the Lambda deployment package (.zip file) relative to terraform directory"
  type        = string
  default     = "../backend/publish/lambda-package.zip"
}

# Database configuration
variable "database_connection_string" {
  description = "PostgreSQL connection string"
  type        = string
  sensitive   = true
}

# JWT configuration
variable "token_key" {
  description = "JWT token signing key (must be at least 64 characters)"
  type        = string
  sensitive   = true
}

# CORS configuration
# Can be provided as comma-separated string (from GitHub secrets) or list
variable "cors_allowed_origins" {
  description = "Comma-separated list of allowed CORS origins (or list)"
  type        = any
  default     = []

  # Convert string to list if needed
  validation {
    condition     = can(tolist(var.cors_allowed_origins)) || can(split(",", var.cors_allowed_origins))
    error_message = "cors_allowed_origins must be a list or comma-separated string"
  }
}

locals {
  # Convert comma-separated string to list if needed
  cors_origins_list = try(
    tolist(var.cors_allowed_origins),
    [for origin in split(",", var.cors_allowed_origins) : trimspace(origin)]
  )
}

# AWS SES configuration
variable "aws_ses_region" {
  description = "AWS region for SES"
  type        = string
  default     = "us-east-1"
}

variable "aws_ses_sender_email" {
  description = "SES sender email address"
  type        = string
}

variable "aws_ses_sender_name" {
  description = "SES sender name"
  type        = string
  default     = "Fantasy Domain Manager"
}

# Email configuration
variable "email_base_url" {
  description = "Base URL for email links"
  type        = string
}

variable "email_verification_token_expiry_minutes" {
  description = "Email verification token expiry in minutes"
  type        = string
  default     = "1440"
}

variable "email_reset_token_expiry_minutes" {
  description = "Password reset token expiry in minutes"
  type        = string
  default     = "60"
}

# Admin seed configuration
variable "admin_seed_email" {
  description = "Admin user email for seeding"
  type        = string
  default     = "admin@example.com"
}

variable "admin_seed_first_name" {
  description = "Admin user first name"
  type        = string
  default     = "Admin"
}

variable "admin_seed_last_name" {
  description = "Admin user last name"
  type        = string
  default     = "User"
}

variable "admin_seed_password" {
  description = "Admin user password"
  type        = string
  sensitive   = true
  default     = ""
}

# Logging configuration
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

