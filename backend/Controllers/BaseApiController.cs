using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using API.Extensions;
using FantasyDomainManager.DbContexts;
using FantasyDomainManager.Models;

namespace FantasyDomainManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseApiController : ControllerBase
    {
        /// <summary>
        /// Gets the current user's ID from the JWT claims.
        /// Throws UnauthorizedAccessException if user is not authenticated.
        /// </summary>
        protected string GetCurrentUserId()
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("User is not authenticated");
            }
            return userId;
        }

        /// <summary>
        /// Verifies that a domain exists and belongs to the current user.
        /// </summary>
        /// <returns>null if successful, or an IActionResult error to return</returns>
        protected IActionResult? VerifyDomainOwnership(DomainDb context, string domainId, out Domain? domain)
        {
            var userId = GetCurrentUserId();
            domain = context.Domains.FirstOrDefault(d => d.Id == domainId);

            if (domain == null)
            {
                return NotFound(new { message = "Domain not found" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            return null; // Success
        }

        /// <summary>
        /// Verifies that a domain exists and belongs to the current user.
        /// Simplified version when you don't need the domain object.
        /// </summary>
        protected IActionResult? VerifyDomainOwnership(DomainDb context, string domainId)
        {
            return VerifyDomainOwnership(context, domainId, out _);
        }

        /// <summary>
        /// Gets a domain by ID and verifies ownership. Returns appropriate error if not found or not owned.
        /// </summary>
        protected ActionResult<Domain> GetOwnedDomain(DomainDb context, string domainId)
        {
            var error = VerifyDomainOwnership(context, domainId, out var domain);
            if (error != null)
            {
                return error;
            }
            return domain!;
        }

        /// <summary>
        /// Verifies that the current user owns the domain associated with an entity.
        /// </summary>
        protected IActionResult? VerifyDomainOwnershipViaEntity(DomainDb context, string entityDomainId)
        {
            return VerifyDomainOwnership(context, entityDomainId);
        }
    }
}
