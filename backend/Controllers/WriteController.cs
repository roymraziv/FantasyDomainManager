using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FantasyDomainManager.DTOs;

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

        // ========== DOMAIN ENDPOINTS ==========

        [HttpPost("domains")]
        public IActionResult CreateDomain([FromBody] Models.Domain domain)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Domains.Add(domain);
            _context.SaveChanges();
            return CreatedAtAction(nameof(CreateDomain), new { id = domain.Id }, domain);
        }

        [HttpPut("domains/{id}")]
        public IActionResult UpdateDomain(int id, [FromBody] UpdateDomainDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingDomain = _context.Domains.FirstOrDefault(d => d.Id == id);
            if (existingDomain == null)
            {
                return NotFound();
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
        public IActionResult DeleteDomain(int id)
        {
            var domain = _context.Domains
                .Include(d => d.Heroes)
                .Include(d => d.Enterprises)
                .Include(d => d.Troops)
                .FirstOrDefault(d => d.Id == id);

            if (domain == null)
            {
                return NotFound();
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
        public IActionResult CreateHero([FromBody] Models.Hero hero)
        {
            // Validate that the domain exists
            var domainExists = _context.Domains.Any(d => d.Id == hero.DomainId);
            if (!domainExists)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            _context.Heroes.Add(hero);
            _context.SaveChanges();
            return CreatedAtAction(nameof(CreateHero), new { id = hero.Id }, hero);
        }

        [HttpPut("heroes/{id}")]
        public IActionResult UpdateHero(int id, [FromBody] UpdateHeroDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingHero = _context.Heroes.FirstOrDefault(h => h.Id == id);
            if (existingHero == null)
            {
                return NotFound();
            }

            // Validate that the domain exists
            var domainExists = _context.Domains.Any(d => d.Id == dto.DomainId);
            if (!domainExists)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            existingHero.Name = dto.Name;
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

            _context.Heroes.Remove(hero);
            _context.SaveChanges();
            return NoContent();
        }

        // ========== ENTERPRISE ENDPOINTS ==========

        [HttpPost("enterprises")]
        public IActionResult CreateEnterprise([FromBody] Models.Enterprise enterprise)
        {
            // Validate that the domain exists
            var domainExists = _context.Domains.Any(d => d.Id == enterprise.DomainId);
            if (!domainExists)
            {
                return BadRequest(new { message = "Domain does not exist" });
            }

            _context.Enterprises.Add(enterprise);
            _context.SaveChanges();
            return CreatedAtAction(nameof(CreateEnterprise), new { id = enterprise.Id }, enterprise);
        }

        [HttpPut("enterprises/{id}")]
        public IActionResult UpdateEnterprise(int id, [FromBody] UpdateEnterpriseDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingEnterprise = _context.Enterprises.FirstOrDefault(e => e.Id == id);
            if (existingEnterprise == null)
            {
                return NotFound();
            }

            // Validate that the domain exists
            var domainExists = _context.Domains.Any(d => d.Id == dto.DomainId);
            if (!domainExists)
            {
                return BadRequest(new { message = "Domain does not exist" });
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
            var enterprise = _context.Enterprises.FirstOrDefault(e => e.Id == id);
            if (enterprise == null)
            {
                return NotFound();
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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingTroop = _context.Troops.FirstOrDefault(t => t.Id == id);
            if (existingTroop == null)
            {
                return NotFound();
            }

            // Validate that the domain exists
            var domainExists = _context.Domains.Any(d => d.Id == dto.DomainId);
            if (!domainExists)
            {
                return BadRequest(new { message = "Domain does not exist" });
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
            var troop = _context.Troops.FirstOrDefault(t => t.Id == id);
            if (troop == null)
            {
                return NotFound();
            }

            _context.Troops.Remove(troop);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
