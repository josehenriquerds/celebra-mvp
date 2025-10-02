using Celebre.Application;
using Celebre.Infrastructure;
using Serilog;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add layers
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// CORS
var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]
    ?? Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
    ?? "http://localhost:3000";

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins.Split(','))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Keep PascalCase
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();

// Swagger/OpenAPI with NSwag
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "Celebre API";
    config.Version = "v1";
    config.Description = "Backend API for Celebre Event CRM - Gerenciamento de Eventos";
    config.DocumentName = "v1";
});

// Health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<Celebre.Infrastructure.Persistence.CelebreDbContext>();

var app = builder.Build();

// Middleware pipeline
app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi(config =>
    {
        config.DocumentTitle = "Celebre API Documentation";
        config.DocExpansion = "list";
    });
}

app.UseCors();
app.UseHttpsRedirection();

// Static files for uploads
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// Seed database if requested
if (args.Contains("--seed"))
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<Celebre.Infrastructure.Persistence.DatabaseSeeder>();
    await seeder.SeedAsync();
    Log.Information("Database seeded successfully");
    return;
}

app.Run();

// Make Program accessible to tests
public partial class Program { }
