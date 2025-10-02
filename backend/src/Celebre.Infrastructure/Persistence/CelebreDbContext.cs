using Celebre.Application.Common.Interfaces;
using Celebre.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using TaskEntity = Celebre.Domain.Entities.Task;

namespace Celebre.Infrastructure.Persistence;

public class CelebreDbContext : DbContext, IApplicationDbContext
{
    public CelebreDbContext(DbContextOptions<CelebreDbContext> options) : base(options)
    {
    }

    public DbSet<Event> Events => Set<Event>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<Household> Households => Set<Household>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<SegmentTag> SegmentTags => Set<SegmentTag>();
    public DbSet<GuestTag> GuestTags => Set<GuestTag>();
    public DbSet<Interaction> Interactions => Set<Interaction>();
    public DbSet<EngagementScore> EngagementScores => Set<EngagementScore>();
    public DbSet<TimelineEntry> TimelineEntries => Set<TimelineEntry>();
    public DbSet<TaskEntity> Tasks => Set<TaskEntity>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<VendorPartner> VendorPartners => Set<VendorPartner>();
    public DbSet<VendorMedia> VendorMedia => Set<VendorMedia>();
    public DbSet<VendorReview> VendorReviews => Set<VendorReview>();
    public DbSet<VendorNote> VendorNotes => Set<VendorNote>();
    public DbSet<VendorStatusLog> VendorStatusLogs => Set<VendorStatusLog>();
    public DbSet<GiftRegistryItem> GiftRegistryItems => Set<GiftRegistryItem>();
    public DbSet<ConsentLog> ConsentLogs => Set<ConsentLog>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Seat> Seats => Set<Seat>();
    public DbSet<SeatAssignment> SeatAssignments => Set<SeatAssignment>();
    public DbSet<Checkin> Checkins => Set<Checkin>();
    public DbSet<MessageTemplate> MessageTemplates => Set<MessageTemplate>();
    public DbSet<EventLog> EventLogs => Set<EventLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            // This shouldn't happen in production (configured via DI)
            // But useful for migrations and design-time
        }

        // Configure Npgsql for DateTimeOffset with timezone
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", false);
    }

    public override System.Threading.Tasks.Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Automatically set UpdatedAt for modified entities
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            var updatedAtProperty = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "UpdatedAt");
            if (updatedAtProperty != null)
            {
                updatedAtProperty.CurrentValue = DateTimeOffset.UtcNow;
            }

            if (entry.State == EntityState.Added)
            {
                var createdAtProperty = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "CreatedAt");
                if (createdAtProperty != null && createdAtProperty.CurrentValue == null)
                {
                    createdAtProperty.CurrentValue = DateTimeOffset.UtcNow;
                }
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
