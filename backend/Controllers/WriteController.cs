using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FantasyDomainManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WriteController : ControllerBase
    {
        private readonly DbContexts.DomainDb _context;

        public WriteController(DbContexts.DomainDb context)
        {
            _context = context;
        }

        [HttpPost("domains")]
        public IActionResult CreateDomain([FromBody] Models.Domain domain)
        {
            _context.Domains.Add(domain);
            _context.SaveChanges();
            return CreatedAtAction(nameof(CreateDomain), new { id = domain.Id }, domain);
        }
    }
}
