using FantasyDomainManager.DbContexts;
using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FantasyDomainManager.Controllers;

public class AdminController(UserManager<User> userManager, DomainDb context) : BaseApiController(context)
{
  [Authorize(Policy = "RequireAdminRole")]
  [HttpPost("edit-roles/{userId}")]
  public async Task<ActionResult<IList<string>>> EditRoles(string userId, [FromQuery] string roles)
  {
    if (string.IsNullOrEmpty(roles)) return BadRequest("You must select at least one role");

    var selectedRoles = roles.Split(",");

    var user = await userManager.FindByIdAsync(userId);
    if (user == null) return NotFound("User not found");

    var userRoles = await userManager.GetRolesAsync(user);
    var result = await userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));
    if (!result.Succeeded) return BadRequest(result.Errors);

    result = await userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));
    if (!result.Succeeded) return BadRequest(result.Errors);

    return Ok(await userManager.GetRolesAsync(user));
  }

  [Authorize(Policy = "RequireAdminRole")]
  [HttpGet("users-with-roles")]
  public async Task<ActionResult<List<User>>> GetUsersWithRoles()
  {
    var users = await userManager.Users.ToListAsync();
    var userList = new List<Object>();

    foreach (var user in users)
    {
      var userRoles = await userManager.GetRolesAsync(user);
      var userObj = new
      {
        user.Id,
        user.Email,
        Name = $"{user.FirstName} {user.LastName}",
        Roles = userRoles
      };
      userList.Add(userObj);
    }

    return Ok(userList);
  }

  [Authorize(Policy = "RequireAdminRole")]
  [HttpDelete("users/{userId}")]
  public async Task<ActionResult> DeleteUser(string userId)
  {
    var user = await userManager.FindByIdAsync(userId);
    if (user == null) return NotFound("User not found");

    // Delete all domains owned by this user (cascade delete)
    var userDomains = await context.Domains.Where(d => d.UserId == userId).ToListAsync();
    context.Domains.RemoveRange(userDomains);

    // Delete the user
    var result = await userManager.DeleteAsync(user);
    if (!result.Succeeded) return BadRequest(result.Errors);

    await context.SaveChangesAsync();
    return NoContent();
  }
}