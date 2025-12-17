using Amazon;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FantasyDomainManager.Services;

public class AwsSesEmailService : IEmailService
{
    private readonly IAmazonSimpleEmailService _sesClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AwsSesEmailService> _logger;
    private readonly string _senderEmail;
    private readonly string _senderName;

    public AwsSesEmailService(
        IConfiguration configuration,
        ILogger<AwsSesEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        var region = _configuration["AWS:SES:Region"] ?? "us-east-1";
        _senderEmail = _configuration["AWS:SES:SenderEmail"]
            ?? throw new InvalidOperationException("AWS:SES:SenderEmail not configured");
        _senderName = _configuration["AWS:SES:SenderName"] ?? "Fantasy Domain Manager";

        _sesClient = new AmazonSimpleEmailServiceClient(RegionEndpoint.GetBySystemName(region));
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody, string textBody)
    {
        try
        {
            var sendRequest = new SendEmailRequest
            {
                Source = $"{_senderName} <{_senderEmail}>",
                Destination = new Destination
                {
                    ToAddresses = new List<string> { toEmail }
                },
                Message = new Message
                {
                    Subject = new Content(subject),
                    Body = new Body
                    {
                        Html = new Content
                        {
                            Charset = "UTF-8",
                            Data = htmlBody
                        },
                        Text = new Content
                        {
                            Charset = "UTF-8",
                            Data = textBody
                        }
                    }
                }
            };

            var response = await _sesClient.SendEmailAsync(sendRequest);

            _logger.LogInformation(
                "Email sent successfully to {Email}. MessageId: {MessageId}",
                toEmail,
                response.MessageId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            return false;
        }
    }

    public async Task<bool> SendVerificationEmailAsync(string toEmail, string userName, string verificationLink)
    {
        var subject = "Verify Your Email - Fantasy Domain Manager";

        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Verify Your Email</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"">
    <table role=""presentation"" style=""width: 100%; border-collapse: collapse;"">
        <tr>
            <td style=""padding: 40px 0; text-align: center;"">
                <table role=""presentation"" style=""width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"">
                    <tr>
                        <td style=""padding: 40px 30px; text-align: center; background-color: #4F46E5; border-radius: 8px 8px 0 0;"">
                            <h1 style=""margin: 0; color: #ffffff; font-size: 24px;"">Fantasy Domain Manager</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 40px 30px;"">
                            <h2 style=""margin: 0 0 20px 0; color: #333333; font-size: 20px;"">Welcome, {userName}!</h2>
                            <p style=""margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;"">
                                Thank you for registering with Fantasy Domain Manager. To complete your registration and start building your fantasy empire, please verify your email address.
                            </p>
                            <table role=""presentation"" style=""margin: 30px 0;"">
                                <tr>
                                    <td style=""text-align: center;"">
                                        <a href=""{verificationLink}"" style=""display: inline-block; padding: 14px 32px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;"">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style=""margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 20px;"">
                                If the button doesn't work, copy and paste this link into your browser:<br>
                                <a href=""{verificationLink}"" style=""color: #4F46E5; word-break: break-all;"">{verificationLink}</a>
                            </p>
                            <p style=""margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 20px;"">
                                This link will expire in 24 hours.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 30px; text-align: center; background-color: #f8f8f8; border-radius: 0 0 8px 8px;"">
                            <p style=""margin: 0; color: #999999; font-size: 12px;"">
                                If you didn't create an account, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

        var textBody = $@"
Welcome to Fantasy Domain Manager, {userName}!

Thank you for registering. To complete your registration, please verify your email address by visiting this link:

{verificationLink}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

---
Fantasy Domain Manager
";

        return await SendEmailAsync(toEmail, subject, htmlBody, textBody);
    }

    public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string userName, string resetLink)
    {
        var subject = "Reset Your Password - Fantasy Domain Manager";

        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Reset Your Password</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"">
    <table role=""presentation"" style=""width: 100%; border-collapse: collapse;"">
        <tr>
            <td style=""padding: 40px 0; text-align: center;"">
                <table role=""presentation"" style=""width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"">
                    <tr>
                        <td style=""padding: 40px 30px; text-align: center; background-color: #4F46E5; border-radius: 8px 8px 0 0;"">
                            <h1 style=""margin: 0; color: #ffffff; font-size: 24px;"">Fantasy Domain Manager</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 40px 30px;"">
                            <h2 style=""margin: 0 0 20px 0; color: #333333; font-size: 20px;"">Password Reset Request</h2>
                            <p style=""margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;"">
                                Hello {userName},
                            </p>
                            <p style=""margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;"">
                                We received a request to reset your password. Click the button below to create a new password:
                            </p>
                            <table role=""presentation"" style=""margin: 30px 0;"">
                                <tr>
                                    <td style=""text-align: center;"">
                                        <a href=""{resetLink}"" style=""display: inline-block; padding: 14px 32px; background-color: #DC2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;"">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style=""margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 20px;"">
                                If the button doesn't work, copy and paste this link into your browser:<br>
                                <a href=""{resetLink}"" style=""color: #4F46E5; word-break: break-all;"">{resetLink}</a>
                            </p>
                            <p style=""margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 20px;"">
                                This link will expire in 1 hour.
                            </p>
                            <p style=""margin: 20px 0 0 0; color: #DC2626; font-size: 14px; line-height: 20px; font-weight: bold;"">
                                If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 30px; text-align: center; background-color: #f8f8f8; border-radius: 0 0 8px 8px;"">
                            <p style=""margin: 0; color: #999999; font-size: 12px;"">
                                This is an automated message. Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

        var textBody = $@"
Password Reset Request

Hello {userName},

We received a request to reset your password. Click the link below to create a new password:

{resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.

---
Fantasy Domain Manager
";

        return await SendEmailAsync(toEmail, subject, htmlBody, textBody);
    }

    public async Task<bool> SendPasswordChangedNotificationAsync(string toEmail, string userName)
    {
        var subject = "Your Password Has Been Changed - Fantasy Domain Manager";

        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Password Changed</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"">
    <table role=""presentation"" style=""width: 100%; border-collapse: collapse;"">
        <tr>
            <td style=""padding: 40px 0; text-align: center;"">
                <table role=""presentation"" style=""width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"">
                    <tr>
                        <td style=""padding: 40px 30px; text-align: center; background-color: #10B981; border-radius: 8px 8px 0 0;"">
                            <h1 style=""margin: 0; color: #ffffff; font-size: 24px;"">Fantasy Domain Manager</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 40px 30px;"">
                            <h2 style=""margin: 0 0 20px 0; color: #333333; font-size: 20px;"">Password Successfully Changed</h2>
                            <p style=""margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;"">
                                Hello {userName},
                            </p>
                            <p style=""margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;"">
                                This is a confirmation that your password has been successfully changed at {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC.
                            </p>
                            <p style=""margin: 20px 0 0 0; color: #DC2626; font-size: 14px; line-height: 20px; font-weight: bold;"">
                                If you did not make this change, please contact support immediately.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 30px; text-align: center; background-color: #f8f8f8; border-radius: 0 0 8px 8px;"">
                            <p style=""margin: 0; color: #999999; font-size: 12px;"">
                                This is an automated security notification.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

        var textBody = $@"
Password Successfully Changed

Hello {userName},

This is a confirmation that your password has been successfully changed at {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC.

If you did not make this change, please contact support immediately.

---
Fantasy Domain Manager
";

        return await SendEmailAsync(toEmail, subject, htmlBody, textBody);
    }
}

