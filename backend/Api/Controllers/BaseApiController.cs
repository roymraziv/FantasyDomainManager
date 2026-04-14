using API.Extensions;
using FantasyDomainManager.DbContexts;
using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FantasyDomainManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseApiController(DomainDb context) : ControllerBase
    {
        protected readonly DomainDb context = context;

        /// <summary>
        /// Gets the authenticated user from the database.
        /// Returns Unauthorized if user not found.
        /// </summary>
        protected User? GetAuthenticatedUser(out IActionResult? errorResult)
        {
            errorResult = null;
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                errorResult = Unauthorized();
                return null;
            }

            return user;
        }

        /// <summary>
        /// Validates that a domain exists and belongs to the specified user.
        /// Returns BadRequest if domain doesn't exist, Forbid if user doesn't own it.
        /// </summary>
        protected Domain? GetAndValidateDomainOwnership(string domainId, string userId, out IActionResult? errorResult)
        {
            errorResult = null;
            var domain = context.Domains.FirstOrDefault(d => d.Id == domainId);

            if (domain == null)
            {
                errorResult = BadRequest(new { message = "Domain does not exist" });
                return null;
            }

            if (domain.UserId != userId)
            {
                errorResult = Forbid();
                return null;
            }

            return domain;
        }

        /// <summary>
        /// Generic method to find an entity or return NotFound.
        /// </summary>
        protected T? GetEntityOrNotFound<T>(Func<T, bool> predicate, out IActionResult? errorResult) where T : class
        {
            errorResult = null;
            var entity = context.Set<T>().FirstOrDefault(predicate);

            if (entity == null)
            {
                errorResult = NotFound();
                return null;
            }

            return entity;
        }
    }
}
