using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FantasyDomainManager.Services;
using FantasyDomainManager.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace FantasyDomainManager.Controllers
{
    [Authorize]
    public class ReadController : BaseApiController
    {
        private readonly DbContexts.DomainDb _context;
        private readonly FinancialCalculationService _financialService;

        public ReadController(DbContexts.DomainDb context, FinancialCalculationService financialService)
        {
            _context = context;
            _financialService = financialService;
        }

        // ========== DOMAIN ENDPOINTS ==========

        [HttpGet("domains")]
        public IActionResult GetDomains()
        {
            var userId = GetCurrentUserId();
            var domains = _context.Domains.Where(d => d.UserId == userId).ToList();
            return Ok(domains);
        }

        [HttpGet("domains/{id}")]
        public IActionResult GetDomainById(string id)
        {
            var error = VerifyDomainOwnership(_context, id, out var domain);
            if (error != null) return error;

            var fullDomain = _context.Domains
                .Include(d => d.Heroes)
                .Include(d => d.Troops)
                .Include(d => d.Enterprises)
                .FirstOrDefault(d => d.Id == id);

            return Ok(fullDomain);
        }

        [HttpPost("domains/{domainId}/calculate-financials")]
        public async Task<IActionResult> CalculateFinancials(string domainId, [FromBody] FinancialCalculationRequest request)
        {
            if (request.Months <= 0)
            {
                return BadRequest(new { message = "Months must be greater than 0" });
            }

            // Verify ownership before calculation
            var error = VerifyDomainOwnership(_context, domainId);
            if (error != null) return error;

            var result = await _financialService.CalculateFinancials(domainId, request.Months);

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
            var userId = GetCurrentUserId();

            // Only return heroes from domains owned by the current user
            var heroes = _context.Heroes
                .Include(h => h.Domain)
                .Where(h => h.Domain!.UserId == userId)
                .ToList();

            return Ok(heroes);
        }

        [HttpGet("heroes/{id}")]
        public IActionResult GetHeroById(int id)
        {
            var hero = _context.Heroes
                .Include(h => h.Domain)
                .FirstOrDefault(h => h.Id == id);

            if (hero == null)
            {
                return NotFound();
            }

            // Verify the user owns the domain this hero belongs to
            var error = VerifyDomainOwnership(_context, hero.DomainId);
            if (error != null) return error;

            return Ok(hero);
        }

        [HttpGet("domains/{domainId}/heroes")]
        public IActionResult GetHeroesByDomainId(string domainId)
        {
            // Verify ownership of the domain first
            var error = VerifyDomainOwnership(_context, domainId);
            if (error != null) return error;

            var heroes = _context.Heroes.Where(h => h.DomainId == domainId).ToList();
            return Ok(heroes);
        }

        // ========== ENTERPRISE ENDPOINTS ==========

        [HttpGet("enterprises")]
        public IActionResult GetEnterprises()
        {
            var userId = GetCurrentUserId();

            // Only return enterprises from domains owned by the current user
            var enterprises = _context.Enterprises
                .Include(e => e.Domain)
                .Where(e => e.Domain!.UserId == userId)
                .ToList();

            return Ok(enterprises);
        }

        [HttpGet("enterprises/{id}")]
        public IActionResult GetEnterpriseById(int id)
        {
            var enterprise = _context.Enterprises
                .Include(e => e.Domain)
                .FirstOrDefault(e => e.Id == id);

            if (enterprise == null)
            {
                return NotFound();
            }

            // Verify the user owns the domain this enterprise belongs to
            var error = VerifyDomainOwnership(_context, enterprise.DomainId);
            if (error != null) return error;

            return Ok(enterprise);
        }

        [HttpGet("domains/{domainId}/enterprises")]
        public IActionResult GetEnterprisesByDomainId(string domainId)
        {
            // Verify ownership of the domain first
            var error = VerifyDomainOwnership(_context, domainId);
            if (error != null) return error;

            var enterprises = _context.Enterprises.Where(e => e.DomainId == domainId).ToList();
            return Ok(enterprises);
        }

        // ========== TROOP ENDPOINTS ==========

        [HttpGet("troops")]
        public IActionResult GetTroops()
        {
            var userId = GetCurrentUserId();

            // Only return troops from domains owned by the current user
            var troops = _context.Troops
                .Include(t => t.Domain)
                .Where(t => t.Domain!.UserId == userId)
                .ToList();

            return Ok(troops);
        }

        [HttpGet("troops/{id}")]
        public IActionResult GetTroopById(int id)
        {
            var troop = _context.Troops
                .Include(t => t.Domain)
                .FirstOrDefault(t => t.Id == id);

            if (troop == null)
            {
                return NotFound();
            }

            // Verify the user owns the domain this troop belongs to
            var error = VerifyDomainOwnership(_context, troop.DomainId);
            if (error != null) return error;

            return Ok(troop);
        }

        [HttpGet("domains/{domainId}/troops")]
        public IActionResult GetTroopsByDomainId(string domainId)
        {
            // Verify ownership of the domain first
            var error = VerifyDomainOwnership(_context, domainId);
            if (error != null) return error;

            var troops = _context.Troops.Where(t => t.DomainId == domainId).ToList();
            return Ok(troops);
        }
    }
}
