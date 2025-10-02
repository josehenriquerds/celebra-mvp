using Celebre.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Celebre.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Event> Events { get; }
    DbSet<Contact> Contacts { get; }
    DbSet<Household> Households { get; }
    DbSet<Guest> Guests { get; }
    DbSet<SegmentTag> SegmentTags { get; }
    DbSet<GuestTag> GuestTags { get; }
    DbSet<Interaction> Interactions { get; }
    DbSet<EngagementScore> EngagementScores { get; }
    DbSet<TimelineEntry> TimelineEntries { get; }
    DbSet<Domain.Entities.Task> Tasks { get; }
    DbSet<Vendor> Vendors { get; }
    DbSet<VendorPartner> VendorPartners { get; }
    DbSet<VendorMedia> VendorMedia { get; }
    DbSet<VendorReview> VendorReviews { get; }
    DbSet<VendorNote> VendorNotes { get; }
    DbSet<VendorStatusLog> VendorStatusLogs { get; }
    DbSet<GiftRegistryItem> GiftRegistryItems { get; }
    DbSet<ConsentLog> ConsentLogs { get; }
    DbSet<Table> Tables { get; }
    DbSet<Seat> Seats { get; }
    DbSet<SeatAssignment> SeatAssignments { get; }
    DbSet<Checkin> Checkins { get; }
    DbSet<MessageTemplate> MessageTemplates { get; }
    DbSet<EventLog> EventLogs { get; }

    System.Threading.Tasks.Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
