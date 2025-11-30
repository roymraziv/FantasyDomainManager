using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using FantasyDomainManager.DTOs;
using FantasyDomainManager.DTOs.CreateDtos;
using API.Extensions;
using FantasyDomainManager.Extensions;
using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Authorization;
using FantasyDomainManager.DbContexts;
using FantasyDomainManager.Services;

namespace FantasyDomainManager.Controllers
{
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    public class WriteController(DomainDb context, InputSanitizationService sanitizer) : BaseApiController(context)
    {

        // ========== DOMAIN ENDPOINTS ==========

        [HttpPost("domains")]
        public IActionResult CreateDomain([FromBody] CreateDomainDto dto)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            // Sanitize inputs
            dto.Name = sanitizer.StripHtml(dto.Name);
            dto.Ruler = sanitizer.StripHtml(dto.Ruler);
            dto.Notes = sanitizer.SanitizeHtml(dto.Notes);

            var domain = dto.ToDomain(user!);

            context.Domains.Add(domain);
            context.SaveChanges();
            return CreatedAtAction(nameof(CreateDomain), new { id = domain.Id }, domain);
        }

        [HttpPut("domains/{id}")]
        public IActionResult UpdateDomain(string id, [FromBody] UpdateDomainDto dto)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var existingDomain = GetEntityOrNotFound<Domain>(d => d.Id == id, out var domainError);
            if (domainError != null) return domainError;

            if (existingDomain!.UserId != user!.Id)
            {
                return Forbid();
            }

            // Sanitize inputs
            existingDomain.Name = sanitizer.StripHtml(dto.Name);
            existingDomain.Ruler = sanitizer.StripHtml(dto.Ruler);
            existingDomain.Population = dto.Population;
            existingDomain.UpkeepCost = dto.UpkeepCost;
            existingDomain.UpkeepCostLowerLimit = dto.UpkeepCostLowerLimit;
            existingDomain.UpkeepCostUpperLimit = dto.UpkeepCostUpperLimit;
            existingDomain.Income = dto.Income;
            existingDomain.IncomeLowerLimit = dto.IncomeLowerLimit;
            existingDomain.IncomeUpperLimit = dto.IncomeUpperLimit;
            existingDomain.Notes = sanitizer.SanitizeHtml(dto.Notes);

            context.SaveChanges();
            return Ok(existingDomain);
        }

        [HttpDelete("domains/{id}")]
        public IActionResult DeleteDomain(string id)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var domain = context.Domains
                .Include(d => d.Heroes)
                .Include(d => d.Enterprises)
                .Include(d => d.Troops)
                .FirstOrDefault(d => d.Id == id);

            if (domain == null)
            {
                return NotFound();
            }

            if (domain.UserId != user!.Id)
            {
                return Forbid();
            }

            // Check for connected records
            if (domain.Heroes.Any() || domain.Enterprises.Any() || domain.Troops.Any())
            {
                return BadRequest(new
                {
                    message = "Cannot delete domain with connected records",
                    heroes = domain.Heroes.Count,
                    enterprises = domain.Enterprises.Count,
                    troops = domain.Troops.Count
                });
            }

            context.Domains.Remove(domain);
            context.SaveChanges();
            return NoContent();
        }

        // ========== HERO ENDPOINTS ==========

        [HttpPost("heroes")]
        public IActionResult CreateHero([FromBody] Hero hero)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var domain = GetAndValidateDomainOwnership(hero.DomainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            // Sanitize inputs
            hero.Name = sanitizer.StripHtml(hero.Name);
            hero.Class = sanitizer.StripHtml(hero.Class);
            hero.Role = sanitizer.StripHtml(hero.Role);
            hero.Notes = sanitizer.SanitizeHtml(hero.Notes);

            context.Heroes.Add(hero);
            context.SaveChanges();
            return CreatedAtAction(nameof(CreateHero), new { id = hero.Id }, hero);
        }

        [HttpPut("heroes/{id}")]
        public IActionResult UpdateHero(int id, [FromBody] UpdateHeroDto dto)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var existingHero = GetEntityOrNotFound<Hero>(h => h.Id == id, out var heroError);
            if (heroError != null) return heroError;

            var domain = GetAndValidateDomainOwnership(dto.DomainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            // Sanitize inputs
            existingHero!.Name = sanitizer.StripHtml(dto.Name);
            existingHero.Class = sanitizer.StripHtml(dto.Class);
            existingHero.Role = sanitizer.StripHtml(dto.Role);
            existingHero.Level = dto.Level;
            existingHero.Wage = dto.Wage;
            existingHero.Notes = sanitizer.SanitizeHtml(dto.Notes);
            existingHero.DomainId = dto.DomainId;

            context.SaveChanges();
            return Ok(existingHero);
        }

        [HttpDelete("heroes/{id}")]
        public IActionResult DeleteHero(int id)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var hero = GetEntityOrNotFound<Hero>(h => h.Id == id, out var heroError);
            if (heroError != null) return heroError;

            var domain = GetAndValidateDomainOwnership(hero!.DomainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            context.Heroes.Remove(hero);
            context.SaveChanges();
            return NoContent();
        }

        // ========== ENTERPRISE ENDPOINTS ==========

        [HttpPost("enterprises")]
        public IActionResult CreateEnterprise([FromBody] Models.Enterprise enterprise)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var domain = GetAndValidateDomainOwnership(enterprise.DomainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            // Sanitize inputs
            enterprise.Name = sanitizer.StripHtml(enterprise.Name);
            enterprise.Notes = sanitizer.SanitizeHtml(enterprise.Notes);

            context.Enterprises.Add(enterprise);
            context.SaveChanges();
            return CreatedAtAction(nameof(CreateEnterprise), new { id = enterprise.Id }, enterprise);
        }

        [HttpPut("enterprises/{id}")]
        public IActionResult UpdateEnterprise(int id, [FromBody] UpdateEnterpriseDto dto)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var existingEnterprise = GetEntityOrNotFound<Enterprise>(e => e.Id == id, out var enterpriseError);
            if (enterpriseError != null) return enterpriseError;

            var domain = GetAndValidateDomainOwnership(existingEnterprise!.DomainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            // Sanitize inputs
            existingEnterprise.Name = sanitizer.StripHtml(dto.Name);
            existingEnterprise.Income = dto.Income;
            existingEnterprise.IncomeLowerLimit = dto.IncomeLowerLimit;
            existingEnterprise.IncomeUpperLimit = dto.IncomeUpperLimit;
            existingEnterprise.UpkeepCost = dto.UpkeepCost;
            existingEnterprise.UpkeepCostLowerLimit = dto.UpkeepCostLowerLimit;
            existingEnterprise.UpkeepCostUpperLimit = dto.UpkeepCostUpperLimit;
            existingEnterprise.Notes = sanitizer.SanitizeHtml(dto.Notes);
            existingEnterprise.DomainId = dto.DomainId;

            context.SaveChanges();
            return Ok(existingEnterprise);
        }

        [HttpDelete("enterprises/{id}")]
        public IActionResult DeleteEnterprise(int id)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var enterprise = GetEntityOrNotFound<Enterprise>(e => e.Id == id, out var enterpriseError);
            if (enterpriseError != null) return enterpriseError;

            var domain = GetAndValidateDomainOwnership(enterprise!.DomainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            context.Enterprises.Remove(enterprise);
            context.SaveChanges();
            return NoContent();
        }

        // ========== TROOP ENDPOINTS ==========

        [HttpPost("troops")]
        public IActionResult CreateTroop([FromBody] Models.Troop troop)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var domain = GetAndValidateDomainOwnership(troop!.DomainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            // Sanitize inputs
            troop.Type = sanitizer.StripHtml(troop.Type);
            troop.Notes = sanitizer.SanitizeHtml(troop.Notes);

            context.Troops.Add(troop);
            context.SaveChanges();
            return CreatedAtAction(nameof(CreateTroop), new { id = troop.Id }, troop);
        }

        [HttpPut("troops/{id}")]
        public IActionResult UpdateTroop(int id, [FromBody] UpdateTroopDto dto)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var existingTroop = GetEntityOrNotFound<Troop>(t => t.Id == id, out var troopError);
            if (troopError != null) return troopError;

            var domain = GetAndValidateDomainOwnership(existingTroop!.DomainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            // Sanitize inputs
            existingTroop.Type = sanitizer.StripHtml(dto.Type);
            existingTroop.Quantity = dto.Quantity;
            existingTroop.Wage = dto.Wage;
            existingTroop.Notes = sanitizer.SanitizeHtml(dto.Notes);
            existingTroop.DomainId = dto.DomainId;

            context.SaveChanges();
            return Ok(existingTroop);
        }

        [HttpDelete("troops/{id}")]
        public IActionResult DeleteTroop(int id)
        {
            var user = GetAuthenticatedUser(out var userError);
            if (userError != null) return userError;

            var troop = GetEntityOrNotFound<Troop>(t => t.Id == id, out var troopError);
            if (troopError != null) return troopError;

            var domain = GetAndValidateDomainOwnership(troop!.DomainId, user!.Id, out var domainError);
            if (domainError != null) return domainError;

            context.Troops.Remove(troop);
            context.SaveChanges();
            return NoContent();
        }
    }
}
