using Celebre.Application.Common.Interfaces;
using Celebre.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Celebre.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? throw new InvalidOperationException("Database connection string not found");

        services.AddDbContext<CelebreDbContext>(options =>
        {
            // Support both SQLite (development) and PostgreSQL (production)
            if (connectionString.Contains("Data Source=") || connectionString.EndsWith(".db"))
            {
                options.UseSqlite(connectionString, sqliteOptions =>
                {
                    sqliteOptions.MigrationsAssembly(typeof(CelebreDbContext).Assembly.FullName);
                });
            }
            else
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                    npgsqlOptions.MigrationsAssembly(typeof(CelebreDbContext).Assembly.FullName);
                });
                options.UseSnakeCaseNamingConvention();
            }

            if (configuration.GetValue<bool>("EnableSensitiveDataLogging"))
            {
                options.EnableSensitiveDataLogging();
            }
        });

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<CelebreDbContext>());

        // Seeder
        services.AddScoped<DatabaseSeeder>();

        return services;
    }
}
