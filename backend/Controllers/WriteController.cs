using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FantasyDomainManager.DTOs;
using FantasyDomainManager.DTOs.CreateDtos;
using API.Extensions;
using FantasyDomainManager.Extensions;
using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Authorization;
using FantasyDomainManager.DbContexts;

namespace FantasyDomainManager.Controllers
{
    [Authorize]
    public class WriteController(DomainDb context) : BaseApiController(context)
    {

        // ========== DOMAIN ENDPOINTS ==========

        [HttpPost("domains")]
        public IActionResult CreateDomain([FromBody] CreateDomainDto dto)
        {
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = dto.ToDomain(user);

            context.Domains.Add(domain);
            context.SaveChanges();
            return CreatedAtAction(nameof(CreateDomain), new { id = domain.Id }, domain);
        }

        [HttpPut("domains/{id}")]
        public IActionResult UpdateDomain(string id, [FromBody] UpdateDomainDto dto)
        {
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var existingDomain = context.Domains.FirstOrDefault(d => d.Id == id);

            if (existingDomain == null)
            {
                return NotFound();
            }

            if (existingDomain.UserId != userId)
            {
                return Forbid();
            }

            existingDomain.Name = dto.Name;
            existingDomain.Ruler = dto.Ruler;
            existingDomain.Population = dto.Population;
            existingDomain.UpkeepCost = dto.UpkeepCost;
            existingDomain.UpkeepCostLowerLimit = dto.UpkeepCostLowerLimit;
            existingDomain.UpkeepCostUpperLimit = dto.UpkeepCostUpperLimit;
            existingDomain.Income = dto.Income;
            existingDomain.IncomeLowerLimit = dto.IncomeLowerLimit;
            existingDomain.IncomeUpperLimit = dto.IncomeUpperLimit;
            existingDomain.Notes = dto.Notes;

            context.SaveChanges();
            return Ok(existingDomain);
        }

        [HttpDelete("domains/{id}")]
        public IActionResult DeleteDomain(string id)
        {
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = context.Domains
                .Include(d => d.Heroes)
                .Include(d => d.Enterprises)
                .Include(d => d.Troops)
                .FirstOrDefault(d => d.Id == id);

            if (domain == null)
            {
                return NotFound();
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

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

            context.Domains.Remove(domain);
            context.SaveChanges();
            return NoContent();
        }

        // ========== HERO ENDPOINTS ==========

        [HttpPost("heroes")]
        public IActionResult CreateHero([FromBody] Hero hero)
        {
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = context.Domains.FirstOrDefault(d => d.Id == hero.DomainId);

            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            context.Heroes.Add(hero);
            context.SaveChanges();
            return CreatedAtAction(nameof(CreateHero), new { id = hero.Id }, hero);
        }

        [HttpPut("heroes/{id}")]
        public IActionResult UpdateHero(int id, [FromBody] UpdateHeroDto dto)
        {
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var existingHero = context.Heroes.FirstOrDefault(h => h.Id == id);
            if (existingHero == null)
            {
                return NotFound();
            }

            var domain = context.Domains.FirstOrDefault(d => d.Id == dto.DomainId);
            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            existingHero.Name = dto.Name;
            existingHero.Class = dto.Class;
            existingHero.Role = dto.Role;
            existingHero.Level = dto.Level;
            existingHero.Wage = dto.Wage;
            existingHero.Notes = dto.Notes;
            existingHero.DomainId = dto.DomainId;

            context.SaveChanges();
            return Ok(existingHero);
        }

        [HttpDelete("heroes/{id}")]
        public IActionResult DeleteHero(int id)
        {
            var hero = context.Heroes.FirstOrDefault(h => h.Id == id);
            if (hero == null)
            {
                return NotFound();
            }

            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = context.Domains.FirstOrDefault(d => d.Id == hero.DomainId);

            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            context.Heroes.Remove(hero);
            context.SaveChanges();
            return NoContent();
        }

        // ========== ENTERPRISE ENDPOINTS ==========

        [HttpPost("enterprises")]
        public IActionResult CreateEnterprise([FromBody] Models.Enterprise enterprise)
        {
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = context.Domains.FirstOrDefault(d => d.Id == enterprise.DomainId);

            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            context.Enterprises.Add(enterprise);
            context.SaveChanges();
            return CreatedAtAction(nameof(CreateEnterprise), new { id = enterprise.Id }, enterprise);
        }

        [HttpPut("enterprises/{id}")]
        public IActionResult UpdateEnterprise(int id, [FromBody] UpdateEnterpriseDto dto)
        {
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = context.Domains.FirstOrDefault(d => d.Id == dto.DomainId);

            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            var existingEnterprise = context.Enterprises.FirstOrDefault(e => e.Id == id);
            if (existingEnterprise == null)
            {
                return NotFound();
            }

            existingEnterprise.Name = dto.Name;
            existingEnterprise.Income = dto.Income;
            existingEnterprise.IncomeLowerLimit = dto.IncomeLowerLimit;
            existingEnterprise.IncomeUpperLimit = dto.IncomeUpperLimit;
            existingEnterprise.UpkeepCost = dto.UpkeepCost;
            existingEnterprise.UpkeepCostLowerLimit = dto.UpkeepCostLowerLimit;
            existingEnterprise.UpkeepCostUpperLimit = dto.UpkeepCostUpperLimit;
            existingEnterprise.Notes = dto.Notes;
            existingEnterprise.DomainId = dto.DomainId;

            context.SaveChanges();
            return Ok(existingEnterprise);
        }

        [HttpDelete("enterprises/{id}")]
        public IActionResult DeleteEnterprise(int id)
        {
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var enterprise = context.Enterprises.FirstOrDefault(e => e.Id == id);

            if (enterprise == null)
            {
                return NotFound();
            }

            var domain = context.Domains.FirstOrDefault(d => d.Id == enterprise.DomainId);

            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            context.Enterprises.Remove(enterprise);
            context.SaveChanges();
            return NoContent();
        }

        // ========== TROOP ENDPOINTS ==========

        [HttpPost("troops")]
        public IActionResult CreateTroop([FromBody] Models.Troop troop)
        {
            // Validate that the domain exists
            var domainExists = context.Domains.Any(d => d.Id == troop.DomainId);
            if (!domainExists)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            context.Troops.Add(troop);
            context.SaveChanges();
            return CreatedAtAction(nameof(CreateTroop), new { id = troop.Id }, troop);
        }

        [HttpPut("troops/{id}")]
        public IActionResult UpdateTroop(int id, [FromBody] UpdateTroopDto dto)
        {
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var existingTroop = context.Troops.FirstOrDefault(t => t.Id == id);
            if (existingTroop == null)
            {
                return NotFound();
            }

            // Validate that the domain exists
            var domain = context.Domains.FirstOrDefault(d => d.Id == dto.DomainId);
            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            existingTroop.Type = dto.Type;
            existingTroop.Quantity = dto.Quantity;
            existingTroop.Wage = dto.Wage;
            existingTroop.Notes = dto.Notes;
            existingTroop.DomainId = dto.DomainId;

            context.SaveChanges();
            return Ok(existingTroop);
        }

        [HttpDelete("troops/{id}")]
        public IActionResult DeleteTroop(int id)
        {
            var userId = User.GetUserId();
            var user = context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var troop = context.Troops.FirstOrDefault(t => t.Id == id);
            if (troop == null)
            {
                return NotFound();
            }

            var domain = context.Domains.FirstOrDefault(d => d.Id == troop.DomainId);
            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            context.Troops.Remove(troop);
            context.SaveChanges();
            return NoContent();
        }
    }
}
