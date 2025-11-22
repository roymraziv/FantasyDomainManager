using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FantasyDomainManager.Services;
using FantasyDomainManager.DTOs;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using FantasyDomainManager.DbContexts;

namespace FantasyDomainManager.Controllers
{
    [Authorize]
    public class ReadController(FinancialCalculationService financialService, DomainDb domainDb) : BaseApiController(domainDb)
    {
        private readonly DomainDb context = domainDb;
        // ========== DOMAIN ENDPOINTS ==========

        [HttpGet("domains")]
        public IActionResult GetDomains()
        {
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domains = context.Domains.Where(d => d.UserId == userId).ToList();
            return Ok(domains);
        }

        [HttpGet("domains/{id}")]
        public IActionResult GetDomainById(string id)
        {
            var domain = context.Domains
                .Include(d => d.Heroes)
                .Include(d => d.Troops)
                .Include(d => d.Enterprises)
                .FirstOrDefault(d => d.Id == id);
            if (domain == null)
            {
                return NotFound();
            }
            return Ok(domain);
        }

        [HttpPost("domains/{domainId}/calculate-financials")]
        public async Task<IActionResult> CalculateFinancials(string domainId, [FromBody] FinancialCalculationRequest request)
        {
            if (request.Months <= 0)
            {
                return BadRequest(new { message = "Months must be greater than 0" });
            }

            var result = await financialService.CalculateFinancials(domainId, request.Months);

            if (result == null)
            {
                return NotFound(new { message = "Domain not found" });
            }

            return Ok(result);
        }

        // ========== HERO ENDPOINTS ==========

        [HttpGet("heroes")]
        public IActionResult GetHeroes()
        {
            var heroes = context.Heroes.ToList();
            return Ok(heroes);
        }

        [HttpGet("heroes/{id}")]
        public IActionResult GetHeroById(int id)
        {
            var hero = context.Heroes.FirstOrDefault(h => h.Id == id);
            if (hero == null)
            {
                return NotFound();
            }
            return Ok(hero);
        }

        [HttpGet("domains/{domainId}/heroes")]
        public IActionResult GetHeroesByDomainId(string domainId)
        {
            var heroes = context.Heroes.Where(h => h.DomainId == domainId).ToList();
            return Ok(heroes);
        }

        // ========== ENTERPRISE ENDPOINTS ==========

        [HttpGet("enterprises")]
        public IActionResult GetEnterprises()
        {
            var enterprises = context.Enterprises.ToList();
            return Ok(enterprises);
        }

        [HttpGet("enterprises/{id}")]
        public IActionResult GetEnterpriseById(int id)
        {
            var enterprise = context.Enterprises.FirstOrDefault(e => e.Id == id);
            if (enterprise == null)
            {
                return NotFound();
            }
            return Ok(enterprise);
        }

        [HttpGet("domains/{domainId}/enterprises")]
        public IActionResult GetEnterprisesByDomainId(string domainId)
        {
            var enterprises = context.Enterprises.Where(e => e.DomainId == domainId).ToList();
            return Ok(enterprises);
        }

        // ========== TROOP ENDPOINTS ==========

        [HttpGet("troops")]
        public IActionResult GetTroops()
        {
            var troops = context.Troops.ToList();
            return Ok(troops);
        }

        [HttpGet("troops/{id}")]
        public IActionResult GetTroopById(int id)
        {
            var troop = context.Troops.FirstOrDefault(t => t.Id == id);
            if (troop == null)
            {
                return NotFound();
            }
            return Ok(troop);
        }

        [HttpGet("domains/{domainId}/troops")]
        public IActionResult GetTroopsByDomainId(string domainId)
        {
            var troops = context.Troops.Where(t => t.DomainId == domainId).ToList();
            return Ok(troops);
        }
    }
}
