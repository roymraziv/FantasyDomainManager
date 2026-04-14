using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using FantasyDomainManager.Services;
using FantasyDomainManager.DTOs;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using FantasyDomainManager.DbContexts;

namespace FantasyDomainManager.Controllers
{
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    public class ReadController(FinancialCalculationService financialService, DomainDb domainDb) : BaseApiController(domainDb)
    {
        // ========== DOMAIN ENDPOINTS ==========

        [HttpGet("domains")]
        public IActionResult GetDomains()
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var domains = context.Domains.Where(d => d.UserId == user!.Id).ToList();
            return Ok(domains);
        }

        [HttpGet("domains/{id}")]
        public IActionResult GetDomainById(string id)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var domain = context.Domains
                .Include(d => d.Heroes)
                .Include(d => d.Troops)
                .Include(d => d.Enterprises)
                .FirstOrDefault(d => d.Id == id);

            if (domain == null)
            {
                return NotFound();
            }

            if (domain.UserId != user!.Id)
            {
                return Forbid();
            }

            return Ok(domain);
        }

        [HttpPost("domains/{domainId}/calculate-financials")]
        public async Task<IActionResult> CalculateFinancials(string domainId, [FromBody] FinancialCalculationRequest request)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var domain = GetAndValidateDomainOwnership(domainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

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
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var heroes = context.Heroes
                .Include(h => h.Domain)
                .Where(h => h.Domain != null && h.Domain.UserId == user!.Id)
                .ToList();
            return Ok(heroes);
        }

        [HttpGet("heroes/{id}")]
        public IActionResult GetHeroById(int id)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var hero = context.Heroes
                .Include(h => h.Domain)
                .FirstOrDefault(h => h.Id == id);

            if (hero == null)
            {
                return NotFound();
            }

            if (hero.Domain == null || hero.Domain.UserId != user!.Id)
            {
                return Forbid();
            }

            return Ok(hero);
        }

        [HttpGet("domains/{domainId}/heroes")]
        public IActionResult GetHeroesByDomainId(string domainId)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var domain = GetAndValidateDomainOwnership(domainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            var heroes = context.Heroes.Where(h => h.DomainId == domainId).ToList();
            return Ok(heroes);
        }

        // ========== ENTERPRISE ENDPOINTS ==========

        [HttpGet("enterprises")]
        public IActionResult GetEnterprises()
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var enterprises = context.Enterprises
                .Include(e => e.Domain)
                .Where(e => e.Domain != null && e.Domain.UserId == user!.Id)
                .ToList();
            return Ok(enterprises);
        }

        [HttpGet("enterprises/{id}")]
        public IActionResult GetEnterpriseById(int id)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var enterprise = context.Enterprises
                .Include(e => e.Domain)
                .FirstOrDefault(e => e.Id == id);

            if (enterprise == null)
            {
                return NotFound();
            }

            if (enterprise.Domain == null || enterprise.Domain.UserId != user!.Id)
            {
                return Forbid();
            }

            return Ok(enterprise);
        }

        [HttpGet("domains/{domainId}/enterprises")]
        public IActionResult GetEnterprisesByDomainId(string domainId)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var domain = GetAndValidateDomainOwnership(domainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            var enterprises = context.Enterprises.Where(e => e.DomainId == domainId).ToList();
            return Ok(enterprises);
        }

        // ========== TROOP ENDPOINTS ==========

        [HttpGet("troops")]
        public IActionResult GetTroops()
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var troops = context.Troops
                .Include(t => t.Domain)
                .Where(t => t.Domain != null && t.Domain.UserId == user!.Id)
                .ToList();
            return Ok(troops);
        }

        [HttpGet("troops/{id}")]
        public IActionResult GetTroopById(int id)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var troop = context.Troops
                .Include(t => t.Domain)
                .FirstOrDefault(t => t.Id == id);

            if (troop == null)
            {
                return NotFound();
            }

            if (troop.Domain == null || troop.Domain.UserId != user!.Id)
            {
                return Forbid();
            }

            return Ok(troop);
        }

        [HttpGet("domains/{domainId}/troops")]
        public IActionResult GetTroopsByDomainId(string domainId)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var domain = GetAndValidateDomainOwnership(domainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            var troops = context.Troops.Where(t => t.DomainId == domainId).ToList();
            return Ok(troops);
        }
    }
}
