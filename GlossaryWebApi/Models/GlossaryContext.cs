// Adding a database context, it's the main class corrdinating Entity Framework functionality for a data model

using Microsoft.EntityFrameworkCore;

namespace GlossaryWebApi.Models;

public class GlossaryContext : DbContext
{
    public GlossaryContext(DbContextOptions<GlossaryContext> options)
        : base(options)
    {
    }

    public DbSet<GlossaryItem> GlossaryItems { get; set; }
}
