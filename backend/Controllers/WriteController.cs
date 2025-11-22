using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FantasyDomainManager.DTOs;
using FantasyDomainManager.DTOs.CreateDtos;
using FantasyDomainManager.Extensions;
using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Authorization;

namespace FantasyDomainManager.Controllers
{
    [Authorize]
    public class WriteController : BaseApiController
    {
        private readonly DbContexts.DomainDb _context;

        public WriteController(DbContexts.DomainDb context)
        {
            _context = context;
        }

        // ========== DOMAIN ENDPOINTS ==========

        [HttpPost("domains")]
        public IActionResult CreateDomain([FromBody] CreateDomainDto dto)
        {
            var userId = GetCurrentUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = dto.ToDomain(user);

            _context.Domains.Add(domain);
            _context.SaveChanges();
            return CreatedAtAction(nameof(CreateDomain), new { id = domain.Id }, domain);
        }

        [HttpPut("domains/{id}")]
        public IActionResult UpdateDomain(string id, [FromBody] UpdateDomainDto dto)
        {
            var error = VerifyDomainOwnership(_context, id, out var existingDomain);
            if (error != null) return error;

            existingDomain!.Name = dto.Name;
            existingDomain.Ruler = dto.Ruler;
            existingDomain.Population = dto.Population;
            existingDomain.UpkeepCost = dto.UpkeepCost;
            existingDomain.UpkeepCostLowerLimit = dto.UpkeepCostLowerLimit;
            existingDomain.UpkeepCostUpperLimit = dto.UpkeepCostUpperLimit;
            existingDomain.Income = dto.Income;
            existingDomain.IncomeLowerLimit = dto.IncomeLowerLimit;
            existingDomain.IncomeUpperLimit = dto.IncomeUpperLimit;
            existingDomain.Notes = dto.Notes;

            _context.SaveChanges();
            return Ok(existingDomain);
        }

        [HttpDelete("domains/{id}")]
        public IActionResult DeleteDomain(string id)
        {
            var error = VerifyDomainOwnership(_context, id, out var domain);
            if (error != null) return error;

            // Load related entities
            _context.Entry(domain!).Collection(d => d.Heroes).Load();
            _context.Entry(domain).Collection(d => d.Enterprises).Load();
            _context.Entry(domain).Collection(d => d.Troops).Load();

            // Check for connected records
            if (domain.Heroes.Any() || domain.Enterprises.Any() || domain.Troops.Any())
            {
                return BadRequest(new {
                    message = "Cannot delete domain with connected records",
                    heroes = domain.Heroes.Count,
                    enterprises = domain.Enterprises.Count,
                    troops = domain.Troops.Count
                });
            }

            _context.Domains.Remove(domain);
            _context.SaveChanges();
            return NoContent();
        }

        // ========== HERO ENDPOINTS ==========

        [HttpPost("heroes")]
        public IActionResult CreateHero([FromBody] Hero hero)
        {
            // Verify user owns the domain
            var error = VerifyDomainOwnership(_context, hero.DomainId);
            if (error != null) return error;

            _context.Heroes.Add(hero);
            _context.SaveChanges();
            return CreatedAtAction(nameof(CreateHero), new { id = hero.Id }, hero);
        }

        [HttpPut("heroes/{id}")]
        public IActionResult UpdateHero(int id, [FromBody] UpdateHeroDto dto)
        {
            var existingHero = _context.Heroes.FirstOrDefault(h => h.Id == id);
            if (existingHero == null)
            {
                return NotFound();
            }

            // Verify user owns the target domain
            var error = VerifyDomainOwnership(_context, dto.DomainId);
            if (error != null) return error;

            existingHero.Name = dto.Name;
            existingHero.Class = dto.Class;
            existingHero.Role = dto.Role;
            existingHero.Level = dto.Level;
            existingHero.Wage = dto.Wage;
            existingHero.Notes = dto.Notes;
            existingHero.DomainId = dto.DomainId;

            _context.SaveChanges();
            return Ok(existingHero);
        }

        [HttpDelete("heroes/{id}")]
        public IActionResult DeleteHero(int id)
        {
            var hero = _context.Heroes.FirstOrDefault(h => h.Id == id);
            if (hero == null)
            {
                return NotFound();
            }

            // Verify user owns the domain this hero belongs to
            var error = VerifyDomainOwnership(_context, hero.DomainId);
            if (error != null) return error;

            _context.Heroes.Remove(hero);
            _context.SaveChanges();
            return NoContent();
        }

        // ========== ENTERPRISE ENDPOINTS ==========

        [HttpPost("enterprises")]
        public IActionResult CreateEnterprise([FromBody] Models.Enterprise enterprise)
        {
            // Verify user owns the domain
            var error = VerifyDomainOwnership(_context, enterprise.DomainId);
            if (error != null) return error;

            _context.Enterprises.Add(enterprise);
            _context.SaveChanges();
            return CreatedAtAction(nameof(CreateEnterprise), new { id = enterprise.Id }, enterprise);
        }

        [HttpPut("enterprises/{id}")]
        public IActionResult UpdateEnterprise(int id, [FromBody] UpdateEnterpriseDto dto)
        {
            var existingEnterprise = _context.Enterprises.FirstOrDefault(e => e.Id == id);
            if (existingEnterprise == null)
            {
                return NotFound();
            }

            // Verify user owns the target domain
            var error = VerifyDomainOwnership(_context, dto.DomainId);
            if (error != null) return error;

            existingEnterprise.Name = dto.Name;
            existingEnterprise.Income = dto.Income;
            existingEnterprise.IncomeLowerLimit = dto.IncomeLowerLimit;
            existingEnterprise.IncomeUpperLimit = dto.IncomeUpperLimit;
            existingEnterprise.UpkeepCost = dto.UpkeepCost;
            existingEnterprise.UpkeepCostLowerLimit = dto.UpkeepCostLowerLimit;
            existingEnterprise.UpkeepCostUpperLimit = dto.UpkeepCostUpperLimit;
            existingEnterprise.Notes = dto.Notes;
            existingEnterprise.DomainId = dto.DomainId;

            _context.SaveChanges();
            return Ok(existingEnterprise);
        }

        [HttpDelete("enterprises/{id}")]
        public IActionResult DeleteEnterprise(int id)
        {
            var enterprise = _context.Enterprises.FirstOrDefault(e => e.Id == id);
            if (enterprise == null)
            {
                return NotFound();
            }

            // Verify user owns the domain this enterprise belongs to
            var error = VerifyDomainOwnership(_context, enterprise.DomainId);
            if (error != null) return error;

            _context.Enterprises.Remove(enterprise);
            _context.SaveChanges();
            return NoContent();
        }

        // ========== TROOP ENDPOINTS ==========

        [HttpPost("troops")]
        public IActionResult CreateTroop([FromBody] Models.Troop troop)
        {
            // Verify user owns the domain (SECURITY FIX: was missing ownership check!)
            var error = VerifyDomainOwnership(_context, troop.DomainId);
            if (error != null) return error;

            _context.Troops.Add(troop);
            _context.SaveChanges();
            return CreatedAtAction(nameof(CreateTroop), new { id = troop.Id }, troop);
        }

        [HttpPut("troops/{id}")]
        public IActionResult UpdateTroop(int id, [FromBody] UpdateTroopDto dto)
        {
            var existingTroop = _context.Troops.FirstOrDefault(t => t.Id == id);
            if (existingTroop == null)
            {
                return NotFound();
            }

            // Verify user owns the target domain
            var error = VerifyDomainOwnership(_context, dto.DomainId);
            if (error != null) return error;

            existingTroop.Type = dto.Type;
            existingTroop.Quantity = dto.Quantity;
            existingTroop.Wage = dto.Wage;
            existingTroop.Notes = dto.Notes;
            existingTroop.DomainId = dto.DomainId;

            _context.SaveChanges();
            return Ok(existingTroop);
        }

        [HttpDelete("troops/{id}")]
        public IActionResult DeleteTroop(int id)
        {
            var troop = _context.Troops.FirstOrDefault(t => t.Id == id);
            if (troop == null)
            {
                return NotFound();
            }

            // Verify user owns the domain this troop belongs to
            var error = VerifyDomainOwnership(_context, troop.DomainId);
            if (error != null) return error;

            _context.Troops.Remove(troop);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
