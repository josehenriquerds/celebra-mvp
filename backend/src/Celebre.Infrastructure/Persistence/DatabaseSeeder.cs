using Celebre.Domain.Entities;
using Celebre.Domain.Enums;
using Celebre.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskEntity = Celebre.Domain.Entities.Task;

namespace Celebre.Infrastructure.Persistence;

public class DatabaseSeeder
{
    private readonly CelebreDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(CelebreDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task SeedAsync()
    {
        try
        {
            // Check if already seeded
            if (await _context.Events.AnyAsync())
            {
                _logger.LogInformation("Database already seeded, skipping...");
                return;
            }

            _logger.LogInformation("Seeding database...");

            // Create sample event
            var eventId = CuidGenerator.Generate();
            var sampleEvent = new Event
            {
                Id = eventId,
                Title = "Casamento João & Maria",
                DateTime = new DateTimeOffset(2025, 12, 15, 18, 0, 0, TimeSpan.FromHours(-3)),
                VenueName = "Espaço Green Garden",
                Address = "Av. Principal, 1000 - São Paulo, SP",
                BudgetTotal = 80000,
                Hosts = new List<string> { "João Silva", "Maria Santos" },
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _context.Events.AddAsync(sampleEvent);

            // Create households
            var household1Id = CuidGenerator.Generate();
            var household1 = new Household
            {
                Id = household1Id,
                Label = "Família Silva",
                SizeCached = 4,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            var household2Id = CuidGenerator.Generate();
            var household2 = new Household
            {
                Id = household2Id,
                Label = "Amigos da Faculdade",
                SizeCached = 3,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _context.Households.AddRangeAsync(household1, household2);

            // Create contacts
            var contact1Id = CuidGenerator.Generate();
            var contact1 = new Contact
            {
                Id = contact1Id,
                FullName = "Pedro Silva",
                Phone = "+5511999998888",
                Email = "pedro@example.com",
                Relation = ContactRelation.familia,
                IsVip = true,
                HouseholdId = household1Id,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            var contact2Id = CuidGenerator.Generate();
            var contact2 = new Contact
            {
                Id = contact2Id,
                FullName = "Ana Costa",
                Phone = "+5511988887777",
                Email = "ana@example.com",
                Relation = ContactRelation.amigo,
                IsVip = false,
                HouseholdId = household2Id,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _context.Contacts.AddRangeAsync(contact1, contact2);

            // Create guests
            var guest1 = new Guest
            {
                Id = CuidGenerator.Generate(),
                EventId = eventId,
                ContactId = contact1Id,
                InviteStatus = InviteStatus.enviado,
                Rsvp = RsvpStatus.sim,
                Seats = 2,
                Children = 1,
                TransportNeeded = false,
                OptOut = false,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            var guest2 = new Guest
            {
                Id = CuidGenerator.Generate(),
                EventId = eventId,
                ContactId = contact2Id,
                InviteStatus = InviteStatus.enviado,
                Rsvp = RsvpStatus.pendente,
                Seats = 1,
                Children = 0,
                TransportNeeded = true,
                OptOut = false,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _context.Guests.AddRangeAsync(guest1, guest2);

            // Create engagement scores
            var score1 = new EngagementScore
            {
                ContactId = contact1Id,
                EventId = eventId,
                Value = 10, // RSVP confirmado
                Tier = EngagementTier.bronze,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _context.EngagementScores.AddAsync(score1);

            // Create a table
            var tableId = CuidGenerator.Generate();
            var table1 = new Table
            {
                Id = tableId,
                EventId = eventId,
                Label = "Mesa 1",
                Capacity = 8,
                Zone = "Salão Principal",
                X = 100,
                Y = 100,
                Rotation = 0,
                Shape = TableShape.round,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _context.Tables.AddAsync(table1);

            // Create seats for the table
            var radius = 80.0;
            for (int i = 0; i < 8; i++)
            {
                var theta = 2 * Math.PI * i / 8;
                var seat = new Seat
                {
                    Id = CuidGenerator.Generate(),
                    TableId = tableId,
                    Index = i,
                    X = Math.Cos(theta) * radius,
                    Y = Math.Sin(theta) * radius,
                    Rotation = theta * (180 / Math.PI)
                };
                await _context.Seats.AddAsync(seat);
            }

            // Create timeline entry
            var timeline1 = new TimelineEntry
            {
                Id = CuidGenerator.Generate(),
                EventId = eventId,
                ActorType = ActorType.guest,
                Type = TimelineType.rsvp,
                RefId = guest1.Id,
                OccurredAt = DateTimeOffset.UtcNow,
                MetaJson = "{\"guestId\":\"" + guest1.Id + "\",\"contactName\":\"Pedro Silva\",\"newRsvp\":\"sim\"}"
            };

            await _context.TimelineEntries.AddAsync(timeline1);

            // Save all changes
            await _context.SaveChangesAsync();

            _logger.LogInformation("Database seeded successfully!");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding database");
            throw;
        }
    }
}
