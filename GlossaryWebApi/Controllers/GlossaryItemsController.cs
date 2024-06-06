using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GlossaryWebApi.Models;

namespace GlossaryWebApi.Controllers
{
    // Starts with the template string in the controller's Route attribute
    [Route("api/GlossaryItems")]
    [ApiController]
    public class GlossaryItemsController : ControllerBase
    {
        private readonly GlossaryContext _context;

        public GlossaryItemsController(GlossaryContext context)
        {
            _context = context;
        }

        // GET: api/GlossaryItems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GlossaryItemDTO>>> GetGlossaryItems()
        {
            // Retrieves glossary items from the database, sorted A-Z by term
            var glossaryItems = await _context.GlossaryItems
                .OrderBy(item => item.Term)
                .ToListAsync();

            // Converts glossary items to DTOs and returns them
            return glossaryItems.Select(x => GlossaryToDTO(x)).ToList();
        }

        // GET: api/GlossaryItems/5
        // GetGlossaryItem method, the "{id}" is a placeholder variable for the unique identifier of the glossary item
        // Therefore when the method is called, the value of "{id}" in the URL is provided to the method in its id parameter
        [HttpGet("{id}")]
        public async Task<ActionResult<GlossaryItemDTO>> GetGlossaryItem(long id)
        {
            var glossaryItem = await _context.GlossaryItems.FindAsync(id);

            if (glossaryItem == null)
            {
                return NotFound();
            }

            return GlossaryToDTO(glossaryItem);
        }
        // </snippet_GetByID>

        // PUT: api/GlossaryItems/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        // The response here is 204 (No Content) which indicates that the server has successfully fulfilled the request and that there is no additional content to send in the response content
        // According to HTTP specification, a PUT request requires the client to send the entire updated entity, not just the changes
        // Since we use an in-memory DB, that must be initialized each time the app is started, we must have an item in the DB before can make a PUT call, call GET to test there's an item in the DB first
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGlossaryItem(long id, GlossaryItemDTO glossaryDTO)
        {
            if (id != glossaryDTO.Id)
            {
                return BadRequest();
            }

            var glossaryItem = await _context.GlossaryItems.FindAsync(id);
            if (glossaryItem == null)
            {
                return NotFound();
            }

            glossaryItem.Term = glossaryDTO.Term;
            glossaryItem.Definition = glossaryDTO.Definition;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!GlossaryItemExists(id))
            {
                return NotFound();
            }

            return NoContent();
        }

        // POST: api/GlossaryItems
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        // The method gets the value of the GlossaryItem from the body of the HTTP request
        [HttpPost]
        public async Task<ActionResult<GlossaryItemDTO>> PostGlossaryItem(GlossaryItemDTO glossaryDTO)
        {
            var glossaryItem = new GlossaryItem
            {
                Term = glossaryDTO.Term,
                Definition = glossaryDTO.Definition
            };

            _context.GlossaryItems.Add(glossaryItem);
            await _context.SaveChangesAsync();

            // CreatedAtAction method returns an HTTP 201 ('201 Created') status code if successful
            // HTTP 201 is the standard response for an HTTP POST method that creates a new resource on the server
            // Adds a Location header to the response, which specifies the URI (Uniform Resource Identifier - a string that refers to a resource) of the new glossary item
            // References the PostGlossaryItem action to create the Location header's URI
            // The nameof() is uses to avoid hard-coding the action name in the CreatedAtAction call
            return CreatedAtAction(
                nameof(GetGlossaryItem), 
                new { id = glossaryItem.Id }, 
                GlossaryToDTO(glossaryItem));
        }

        // DELETE: api/GlossaryItems/5
        // Should also have a response code HTTP 204 No Content, when testing this for success
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGlossaryItem(long id)
        {
            var glossaryItem = await _context.GlossaryItems.FindAsync(id);
            if (glossaryItem == null)
            {
                return NotFound();
            }

            _context.GlossaryItems.Remove(glossaryItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GlossaryItemExists(long id)
        {
            return _context.GlossaryItems.Any(e => e.Id == id);
        }

        private static GlossaryItemDTO GlossaryToDTO(GlossaryItem glossaryItem) =>
            new GlossaryItemDTO
            {
                Id = glossaryItem.Id,
                Term = glossaryItem.Term,
                Definition = glossaryItem.Definition
            };
    }
}
