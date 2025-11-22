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
        protected string GetUserIdOrFail()
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException();
            return userId;
        }

        protected IActionResult VerifyDomainOwnership(string domainId, out Domain? domain)
        {
            var userId = GetUserIdOrFail();
            domain = context.Domains.FirstOrDefault(d => d.Id == domainId);

            if (domain == null)
                return BadRequest(new { message = "Domain not found" });

            if (domain.UserId != userId)
                return Forbid();

            return null; // null means success
        }
    }
}
