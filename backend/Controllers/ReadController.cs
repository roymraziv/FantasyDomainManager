using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FantasyDomainManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReadController : ControllerBase
    {
        private readonly DbContexts.DomainDb _context;

        public ReadController(DbContexts.DomainDb context)
        {
            _context = context;
        }

        [HttpGet("domains")]
        public IActionResult GetDomains()
        {
            var domains = _context.Domains.ToList();
            return Ok(domains);
        }

        [HttpGet("domains/{id}")]
        public IActionResult GetDomainById(int id)
        {
            var domain = _context.Domains.FirstOrDefault(d => d.Id == id);
            if (domain == null)
            {
                return NotFound();
            }
            return Ok(domain);
        }
    }
}
