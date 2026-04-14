namespace FantasyDomainManager.Services;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody, string textBody);
    Task<bool> SendVerificationEmailAsync(string toEmail, string userName, string verificationLink);
    Task<bool> SendPasswordResetEmailAsync(string toEmail, string userName, string resetLink);
    Task<bool> SendPasswordChangedNotificationAsync(string toEmail, string userName);
}

