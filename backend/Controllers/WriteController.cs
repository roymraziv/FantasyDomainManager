using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FantasyDomainManager.DTOs;
using FantasyDomainManager.DTOs.CreateDtos;
using API.Extensions;
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
            var userId = User.GetUserId();
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
            var userId = User.GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var existingDomain = _context.Domains.FirstOrDefault(d => d.Id == id);

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

            _context.SaveChanges();
            return Ok(existingDomain);
        }

        [HttpDelete("domains/{id}")]
        public IActionResult DeleteDomain(string id)
        {
            var userId = User.GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = _context.Domains
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

            _context.Domains.Remove(domain);
            _context.SaveChanges();
            return NoContent();
        }

        // ========== HERO ENDPOINTS ==========

        [HttpPost("heroes")]
        public IActionResult CreateHero([FromBody] Hero hero)
        {
            var userId = User.GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = _context.Domains.FirstOrDefault(d => d.Id == hero.DomainId);

            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            _context.Heroes.Add(hero);
            _context.SaveChanges();
            return CreatedAtAction(nameof(CreateHero), new { id = hero.Id }, hero);
        }

        [HttpPut("heroes/{id}")]
        public IActionResult UpdateHero(int id, [FromBody] UpdateHeroDto dto)
        {
            var userId = User.GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var existingHero = _context.Heroes.FirstOrDefault(h => h.Id == id);
            if (existingHero == null)
            {
                return NotFound();
            }

            var domain = _context.Domains.FirstOrDefault(d => d.Id == dto.DomainId);
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

            var userId = User.GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = _context.Domains.FirstOrDefault(d => d.Id == hero.DomainId);

            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            _context.Heroes.Remove(hero);
            _context.SaveChanges();
            return NoContent();
        }

        // ========== ENTERPRISE ENDPOINTS ==========

        [HttpPost("enterprises")]
        public IActionResult CreateEnterprise([FromBody] Models.Enterprise enterprise)
        {
            var userId = User.GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = _context.Domains.FirstOrDefault(d => d.Id == enterprise.DomainId);

            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            _context.Enterprises.Add(enterprise);
            _context.SaveChanges();
            return CreatedAtAction(nameof(CreateEnterprise), new { id = enterprise.Id }, enterprise);
        }

        [HttpPut("enterprises/{id}")]
        public IActionResult UpdateEnterprise(int id, [FromBody] UpdateEnterpriseDto dto)
        {
            var userId = User.GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var domain = _context.Domains.FirstOrDefault(d => d.Id == dto.DomainId);

            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            var existingEnterprise = _context.Enterprises.FirstOrDefault(e => e.Id == id);
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

            _context.SaveChanges();
            return Ok(existingEnterprise);
        }

        [HttpDelete("enterprises/{id}")]
        public IActionResult DeleteEnterprise(int id)
        {
            var userId = User.GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var enterprise = _context.Enterprises.FirstOrDefault(e => e.Id == id);

            if (enterprise == null)
            {
                return NotFound();
            }

            var domain = _context.Domains.FirstOrDefault(d => d.Id == enterprise.DomainId);

            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            _context.Enterprises.Remove(enterprise);
            _context.SaveChanges();
            return NoContent();
        }

        // ========== TROOP ENDPOINTS ==========

        [HttpPost("troops")]
        public IActionResult CreateTroop([FromBody] Models.Troop troop)
        {
            // Validate that the domain exists
            var domainExists = _context.Domains.Any(d => d.Id == troop.DomainId);
            if (!domainExists)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            _context.Troops.Add(troop);
            _context.SaveChanges();
            return CreatedAtAction(nameof(CreateTroop), new { id = troop.Id }, troop);
        }

        [HttpPut("troops/{id}")]
        public IActionResult UpdateTroop(int id, [FromBody] UpdateTroopDto dto)
        {
            var userId = User.GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var existingTroop = _context.Troops.FirstOrDefault(t => t.Id == id);
            if (existingTroop == null)
            {
                return NotFound();
            }

            // Validate that the domain exists
            var domain = _context.Domains.FirstOrDefault(d => d.Id == dto.DomainId);
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

            _context.SaveChanges();
            return Ok(existingTroop);
        }

        [HttpDelete("troops/{id}")]
        public IActionResult DeleteTroop(int id)
        {
            var userId = User.GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var troop = _context.Troops.FirstOrDefault(t => t.Id == id);
            if (troop == null)
            {
                return NotFound();
            }

            var domain = _context.Domains.FirstOrDefault(d => d.Id == troop.DomainId);
            if (domain == null)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            if (domain.UserId != userId)
            {
                return Forbid();
            }

            _context.Troops.Remove(troop);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
