// In ASP.NET Core, services such as the DB context must be registered within the dependency injection (DI) container
// The container provides the service to controllers

using Microsoft.EntityFrameworkCore;
using GlossaryWebApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Adds 'using' directives
// Adds the DB context to the DI containter
// Specifies that the DB context will use an in-memory DB
// old code: UseInMemoryDatabase("GlossaryList")
builder.Services.AddDbContext<GlossaryContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// *Comment the following 2 lines out once process of frontend conversion to js occurs, rather than use swagger testing etc...
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

var app = builder.Build();

// *Same here - changed from : app.Environment.IsDevelopment()
// Configure the HTTP request pipeline.
if (builder.Environment.IsDevelopment())
{
    // *Same here - commented out
    // app.UseSwagger();
    // app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

// Enables default file mapping on the current path
app.UseDefaultFiles();
// Enables static file serving for the current request path
app.UseStaticFiles();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
