# Admin User Setup Guide

This document explains how to configure the admin user for different environments.

## Overview

The application automatically creates an admin user on first startup if:
1. Admin credentials are configured
2. No user with that email exists in the database

This ensures **only one admin account** exists and prevents hardcoded credentials in source code.

---

## Development Environment

For local development, credentials are stored in `appsettings.Development.json`:

```json
{
  "AdminSeed": {
    "Email": "admin@fantasydomain.com",
    "FirstName": "System",
    "LastName": "Administrator",
    "Password": "Admin123!@#"
  }
}
```

**⚠️ Important:** Make sure `appsettings.Development.json` is in `.gitignore` to prevent committing credentials!

---

## Production Environment (Environment Variables)

For production, **NEVER** store credentials in appsettings files. Use environment variables instead:

### **Option 1: Environment Variables (Simple)**

```bash
# Linux/macOS
export AdminSeed__Email="admin@yourcompany.com"
export AdminSeed__FirstName="Admin"
export AdminSeed__LastName="User"
export AdminSeed__Password="YourSecurePassword123!@#"

# Windows PowerShell
$env:AdminSeed__Email="admin@yourcompany.com"
$env:AdminSeed__FirstName="Admin"
$env:AdminSeed__LastName="User"
$env:AdminSeed__Password="YourSecurePassword123!@#"

# Windows Command Prompt
set AdminSeed__Email=admin@yourcompany.com
set AdminSeed__FirstName=Admin
set AdminSeed__LastName=User
set AdminSeed__Password=YourSecurePassword123!@#
```

**Note:** Use double underscores `__` to represent nested configuration (`:` in appsettings).

### **Option 2: Azure Key Vault (Recommended for Production)**

1. **Create Key Vault secrets:**
   ```bash
   az keyvault secret set --vault-name "YourVaultName" --name "AdminSeed--Email" --value "admin@company.com"
   az keyvault secret set --vault-name "YourVaultName" --name "AdminSeed--FirstName" --value "Admin"
   az keyvault secret set --vault-name "YourVaultName" --name "AdminSeed--LastName" --value "User"
   az keyvault secret set --vault-name "YourVaultName" --name "AdminSeed--Password" --value "YourSecurePassword"
   ```

2. **Configure your app to use Key Vault:**
   ```csharp
   // In Program.cs (add before builder.Build())
   if (builder.Environment.IsProduction())
   {
       var keyVaultUrl = builder.Configuration["KeyVaultUrl"];
       if (!string.IsNullOrEmpty(keyVaultUrl))
       {
           builder.Configuration.AddAzureKeyVault(
               new Uri(keyVaultUrl),
               new DefaultAzureCredential());
       }
   }
   ```

### **Option 3: AWS Secrets Manager**

1. **Create secret in AWS:**
   ```bash
   aws secretsmanager create-secret \
       --name FantasyDomainManager/AdminSeed \
       --secret-string '{
         "Email":"admin@company.com",
         "FirstName":"Admin",
         "LastName":"User",
         "Password":"YourSecurePassword"
       }'
   ```

2. **Install NuGet package:**
   ```bash
   dotnet add package AWSSDK.SecretsManager
   ```

3. **Configure in Program.cs**

### **Option 4: Docker Secrets**

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    image: fantasy-domain-manager
    environment:
      - AdminSeed__Email=${ADMIN_EMAIL}
      - AdminSeed__FirstName=${ADMIN_FIRSTNAME}
      - AdminSeed__LastName=${ADMIN_LASTNAME}
      - AdminSeed__Password=${ADMIN_PASSWORD}
```

```bash
# .env file (add to .gitignore!)
ADMIN_EMAIL=admin@company.com
ADMIN_FIRSTNAME=Admin
ADMIN_LASTNAME=User
ADMIN_PASSWORD=YourSecurePassword123!
```

---

## Password Requirements

The admin password must meet ASP.NET Identity requirements:
- Minimum 8 characters (default, can be configured)
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character

**Example valid passwords:**
- `Admin123!@#`
- `SecureP@ssw0rd`
- `Sup3r$ecret!`

---

## How It Works

1. **On Startup**: The `DatabaseSeeder` service runs automatically
2. **Role Creation**: Creates "Admin" and "Member" roles if they don't exist
3. **Admin Check**: Looks for existing user with configured email
4. **Admin Creation**: If not found and credentials are configured, creates admin user
5. **Email Confirmed**: Admin email is auto-confirmed (no verification needed)

---

## Verifying Admin Creation

Check the logs on startup:

```
✅ Success:
[Information] Created role: Admin
[Information] Created role: Member
[Information] Admin user created successfully: admin@fantasydomain.com

⚠️ Already Exists:
[Information] Admin user already exists: admin@fantasydomain.com

❌ Not Configured:
[Warning] Admin user credentials not configured. Skipping admin user creation.
```

---

## Security Best Practices

### **DO:**
✅ Use environment variables or secrets management in production
✅ Use strong, unique passwords (20+ characters recommended)
✅ Rotate admin password after initial setup
✅ Enable MFA/2FA for admin account (future enhancement)
✅ Use different admin credentials per environment
✅ Store secrets in `.gitignore`d files for development

### **DON'T:**
❌ Commit credentials to source control
❌ Use the same password across environments
❌ Share admin credentials via email/Slack
❌ Use simple passwords like "Admin123"
❌ Leave default credentials in production

---

## Troubleshooting

### **Admin user not created**

**Check 1:** Verify environment variables are set correctly
```bash
# Linux/macOS
printenv | grep AdminSeed

# Windows PowerShell
Get-ChildItem Env: | Where-Object { $_.Name -like "AdminSeed*" }
```

**Check 2:** Check application logs for errors

**Check 3:** Verify password meets requirements

### **Multiple admin users exist**

The seeder only prevents creating duplicate emails. If you need to ensure only one admin:

```sql
-- Check all admins
SELECT u.Email, r.Name
FROM AspNetUsers u
JOIN AspNetUserRoles ur ON u.Id = ur.UserId
JOIN AspNetRoles r ON ur.RoleId = r.Id
WHERE r.Name = 'Admin';

-- Remove admin role from specific user (if needed)
DELETE FROM AspNetUserRoles
WHERE UserId = (SELECT Id FROM AspNetUsers WHERE Email = 'user@email.com')
  AND RoleId = (SELECT Id FROM AspNetRoles WHERE Name = 'Admin');
```

### **Need to reset admin password**

Delete the admin user and restart the app (it will be recreated):

```sql
DELETE FROM AspNetUsers WHERE Email = 'admin@fantasydomain.com';
```

Or use the `UserManager` to reset password programmatically.

---

## Manual Admin Creation (Alternative)

If you prefer not to use automatic seeding, you can create admin manually:

1. Register a normal user through the API/UI
2. Use SQL to promote them to admin:

```sql
-- Find user ID
SELECT Id, Email FROM AspNetUsers WHERE Email = 'user@email.com';

-- Find Admin role ID
SELECT Id FROM AspNetRoles WHERE Name = 'Admin';

-- Add user to Admin role
INSERT INTO AspNetUserRoles (UserId, RoleId)
VALUES ('user-id-here', 'admin-role-id-here');
```

---

## Environment-Specific Configuration

### **Development**
- Credentials in `appsettings.Development.json`
- Simple passwords acceptable
- Auto-seed enabled

### **Staging**
- Environment variables from CI/CD pipeline
- Strong passwords required
- Auto-seed enabled

### **Production**
- Azure Key Vault / AWS Secrets Manager
- Very strong passwords (20+ chars)
- Auto-seed enabled
- Consider manual creation instead for maximum security

---

## Disabling Auto-Seeding

To disable automatic admin creation, simply **don't configure** the `AdminSeed` section:

```json
{
  "AdminSeed": {
    "Email": "",
    "FirstName": "",
    "LastName": "",
    "Password": ""
  }
}
```

Or remove the section entirely. The seeder will log a warning and skip creation.

---

## Next Steps

After admin user is created:
1. ✅ Login with admin credentials
2. ✅ Verify admin access to protected resources
3. ✅ Change password in production (recommended)
4. ✅ Configure additional security settings
5. ✅ Create regular member accounts for other users
