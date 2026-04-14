using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FantasyDomainManager.Models;

public class PasswordResetToken
{
  [Key]
  public int Id { get; set; }

  [Required]
  public string UserId { get; set; } = string.Empty;

  [ForeignKey(nameof(UserId))]
  public User User { get; set; } = null!;

  [Required]
  [MaxLength(256)]
  public string Token { get; set; } = string.Empty;

  [Required]
  public DateTime ExpiresAt { get; set; }

  [Required]
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public bool IsUsed { get; set; } = false;

  public DateTime? UsedAt { get; set; }

  [MaxLength(45)]
  public string? IpAddress { get; set; }

  // Indexes
  public bool IsExpired => DateTime.UtcNow > ExpiresAt;
  public bool IsValid => !IsUsed && !IsExpired;
}