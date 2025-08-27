using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InsightsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InsightsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Insights
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Insight>>> GetInsights()
        {
            return await _context.Insights.ToListAsync();
        }

        // GET: api/Insights/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Insight>> GetInsight(int id)
        {
            var insight = await _context.Insights.FindAsync(id);

            if (insight == null)
            {
                return NotFound();
            }

            return insight;
        }

        // PUT: api/Insights/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInsight(int id, Insight insight)
        {
            if (id != insight.Id)
            {
                return BadRequest();
            }

            _context.Entry(insight).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InsightExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Insights
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Insight>> PostInsight(Insight insight)
        {
            _context.Insights.Add(insight);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetInsight", new { id = insight.Id }, insight);
        }

        // DELETE: api/Insights/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInsight(int id)
        {
            var insight = await _context.Insights.FindAsync(id);
            if (insight == null)
            {
                return NotFound();
            }

            _context.Insights.Remove(insight);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InsightExists(int id)
        {
            return _context.Insights.Any(e => e.Id == id);
        }
    }
}
