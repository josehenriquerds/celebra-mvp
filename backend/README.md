# Celebre API - .NET 8 Backend

## Arquitetura

Solução .NET 8 com DDD e Clean Architecture para migração do backend Next.js/Prisma.

### Estrutura de Projetos

```
backend/
├── src/
│   ├── Celebre.Api/              # ASP.NET Core Web API
│   ├── Celebre.Application/      # CQRS, DTOs, Handlers
│   ├── Celebre.Domain/           # Entidades, Enums, Events
│   ├── Celebre.Infrastructure/   # EF Core, Repositories
│   ├── Celebre.Integrations/     # n8n, WhatsApp, Storage
│   └── Celebre.Shared/           # Result<T>, Helpers
├── tests/
│   ├── Celebre.UnitTests/
│   └── Celebre.IntegrationTests/
├── docker-compose.yml
└── Celebre.sln
```

## Requisitos

- .NET 8 SDK
- PostgreSQL 15+
- Docker & Docker Compose (opcional)

## Variáveis de Ambiente

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/celebre_db"

# n8n Integration
N8N_URL="http://localhost:5678"
N8N_API_KEY="your-api-key"
N8N_VENDOR_WEBHOOK_URL="${N8N_URL}/webhook/vendor-submitted"
N8N_SEND_MESSAGE_WEBHOOK_URL="${N8N_URL}/webhook/send-message"
N8N_GIFT_RECEIVED_WEBHOOK_URL="${N8N_URL}/webhook/gift-received"

# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID="your-phone-id"
WHATSAPP_ACCESS_TOKEN="your-token"
WHATSAPP_VERIFY_TOKEN="your-verify-token"
WHATSAPP_BUSINESS_ACCOUNT_ID="your-business-id"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,https://your-front-domain.com"

# JWT (futuro)
JWT_SECRET="your-secret-key"
JWT_ISSUER="https://api.celebre.com"
JWT_AUDIENCE="https://celebre.com"

# Guest Portal Token Secret (SHA256 generation)
NEXTAUTH_SECRET="your-nextauth-secret-for-token-generation"

# Timezone
TZ="America/Sao_Paulo"
```

## Começando - Início Rápido ⚡

### Opção 1: Usando o script (Windows) - Recomendado

```bash
cd backend
run.bat
```

Este script irá:
1. Aplicar migrations automaticamente
2. Iniciar a API

### Opção 2: Manual

#### 1. Restaurar pacotes

```bash
cd backend
dotnet restore
```

#### 2. Criar banco de dados

Por padrão, usa **SQLite** em desenvolvimento - não precisa instalar nada!

Para usar PostgreSQL:
```bash
# Via Docker Compose
docker-compose up -d db

# Ou instalar PostgreSQL localmente
```

#### 3. Aplicar Migrations

```bash
cd src/Celebre.Api
dotnet ef database update --project ../Celebre.Infrastructure --startup-project .
```

#### 4. Seed de dados (opcional)

```bash
cd src/Celebre.Api
dotnet run --seed
```

#### 5. Executar API

```bash
cd src/Celebre.Api
dotnet run
```

A API estará disponível em:

- HTTP: http://localhost:5000
- HTTPS: https://localhost:5001
- Swagger: http://localhost:5000/swagger (apenas em desenvolvimento)
- Health Check: http://localhost:5000/health

## Estrutura do Domínio

### Enums (em português, idênticos ao Prisma)

Todos os enums usam strings em pt-BR:

- **ContactRelation**: familia, amigo, trabalho, fornecedor
- **InviteStatus**: nao_enviado, enviado, entregue, lido
- **RsvpStatus**: pendente, sim, nao, talvez
- **Channel**: whatsapp, sms, email, web
- **InteractionKind**: mensagem, clique, foto, anexo, chamada
- **EngagementTier**: bronze, prata, ouro
- **TaskStatus**: aberta, em_andamento, concluida, atrasada
- **GiftStatus**: disponivel, reservado, comprado
- **VendorPartnerStatus**: pending_review, approved, rejected, suspended
- **TableShape**: round, square, rect

### Entidades Principais

```
Event → Guests → Contact
     → Tasks → Vendor
     → Tables → Seats → SeatAssignments
     → GiftRegistryItems
     → TimelineEntries
     → SegmentTags → GuestTags
     → Interactions
     → EngagementScores
     → Checkins

Contact → Household
        → ConsentLogs
        → EngagementScores
        → Interactions

VendorPartner → VendorMedia
              → VendorReview
              → VendorNote
              → VendorStatusLog
```

## Application Layer - CQRS Pattern

### Estrutura de pastas

```
Celebre.Application/
├── Features/
│   ├── Guests/
│   │   ├── Queries/
│   │   │   ├── GetGuests/
│   │   │   │   ├── GetGuestsQuery.cs
│   │   │   │   ├── GetGuestsHandler.cs
│   │   │   │   └── GuestDto.cs
│   │   │   └── GetGuestById/
│   │   ├── Commands/
│   │   │   ├── UpdateGuest/
│   │   │   │   ├── UpdateGuestCommand.cs
│   │   │   │   ├── UpdateGuestHandler.cs
│   │   │   │   └── UpdateGuestValidator.cs
│   │   │   └── CreateCheckin/
│   ├── Segments/
│   ├── Tasks/
│   ├── Tables/
│   ├── Gifts/
│   ├── Vendors/
│   └── VendorPartners/
├── Common/
│   ├── Mappings/
│   ├── Behaviors/
│   └── Interfaces/
└── DependencyInjection.cs
```

### Exemplo de Query

```csharp
// GetGuestsQuery.cs
public record GetGuestsQuery(
    string EventId,
    string? Filter,
    string? Search,
    int Page = 1,
    int Limit = 50
) : IRequest<Result<PagedResult<GuestDto>>>;

// GetGuestsHandler.cs
public class GetGuestsHandler : IRequestHandler<GetGuestsQuery, Result<PagedResult<GuestDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetGuestsHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<GuestDto>>> Handle(
        GetGuestsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Guests
            .Include(g => g.Contact)
                .ThenInclude(c => c.Household)
            .Include(g => g.Contact)
                .ThenInclude(c => c.EngagementScores.Where(es => es.EventId == request.EventId))
            .Include(g => g.SeatAssignments)
                .ThenInclude(sa => sa.Seat)
                .ThenInclude(s => s.Table)
            .Include(g => g.Tags)
                .ThenInclude(gt => gt.Tag)
            .Where(g => g.EventId == request.EventId);

        // Apply filters
        query = ApplyFilters(query, request.Filter, request.Search);

        var total = await query.CountAsync(cancellationToken);

        var guests = await query
            .OrderByDescending(g => g.Contact.IsVip)
            .ThenBy(g => g.Rsvp)
            .ThenBy(g => g.Contact.FullName)
            .Skip((request.Page - 1) * request.Limit)
            .Take(request.Limit)
            .ProjectTo<GuestDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<PagedResult<GuestDto>>.Success(
            new PagedResult<GuestDto>(guests, total, request.Page, request.Limit)
        );
    }

    private IQueryable<Guest> ApplyFilters(IQueryable<Guest> query, string? filter, string? search)
    {
        if (!string.IsNullOrEmpty(filter))
        {
            query = filter switch
            {
                "vip" => query.Where(g => g.Contact.IsVip),
                "children" => query.Where(g => g.Children > 0),
                "pending" => query.Where(g => g.Rsvp == RsvpStatus.pendente),
                "confirmed" => query.Where(g => g.Rsvp == RsvpStatus.sim),
                "no_phone" => query.Where(g => string.IsNullOrEmpty(g.Contact.Phone)),
                _ => query
            };
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(g =>
                EF.Functions.ILike(g.Contact.FullName, $"%{search}%") ||
                EF.Functions.ILike(g.Contact.Phone, $"%{search}%") ||
                EF.Functions.ILike(g.Contact.Email ?? "", $"%{search}%")
            );
        }

        return query;
    }
}
```

### Exemplo de Command

```csharp
// UpdateGuestCommand.cs
public record UpdateGuestCommand(
    string GuestId,
    RsvpStatus? Rsvp,
    int? Seats,
    int? Children,
    bool? TransportNeeded,
    bool? OptOut,
    object? Restrictions,
    string? Notes
) : IRequest<Result<GuestDto>>;

// UpdateGuestHandler.cs
public class UpdateGuestHandler : IRequestHandler<UpdateGuestCommand, Result<GuestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IEngagementService _engagementService;

    public async Task<Result<GuestDto>> Handle(
        UpdateGuestCommand request,
        CancellationToken cancellationToken)
    {
        var guest = await _context.Guests
            .Include(g => g.Contact)
            .Include(g => g.Event)
            .FirstOrDefaultAsync(g => g.Id == request.GuestId, cancellationToken);

        if (guest == null)
            return Result<GuestDto>.Failure("Guest not found");

        // Update fields
        if (request.Rsvp.HasValue) guest.Rsvp = request.Rsvp.Value;
        if (request.Seats.HasValue) guest.Seats = request.Seats.Value;
        if (request.Children.HasValue) guest.Children = request.Children.Value;
        if (request.TransportNeeded.HasValue) guest.TransportNeeded = request.TransportNeeded.Value;
        if (request.OptOut.HasValue) guest.OptOut = request.OptOut.Value;

        // Update contact if provided
        if (request.Restrictions != null)
        {
            guest.Contact.RestrictionsJson = JsonSerializer.Serialize(request.Restrictions);
        }
        if (request.Notes != null)
        {
            guest.Contact.Notes = request.Notes;
        }

        // Create timeline entry if RSVP changed
        if (request.Rsvp.HasValue)
        {
            await _context.TimelineEntries.AddAsync(new TimelineEntry
            {
                EventId = guest.EventId,
                ActorType = ActorType.host,
                Type = TimelineType.rsvp,
                RefId = guest.Id,
                OccurredAt = DateTimeOffset.UtcNow,
                MetaJson = JsonSerializer.Serialize(new
                {
                    guestId = guest.Id,
                    contactName = guest.Contact.FullName,
                    newRsvp = request.Rsvp.Value.ToString()
                })
            }, cancellationToken);

            // Update engagement score if RSVP = sim
            if (request.Rsvp.Value == RsvpStatus.sim)
            {
                await _engagementService.IncrementScoreAsync(
                    guest.ContactId,
                    guest.EventId,
                    10,
                    cancellationToken
                );
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<GuestDto>(guest);
        return Result<GuestDto>.Success(dto);
    }
}
```

## Controllers

### Exemplo: GuestsController

```csharp
[ApiController]
[Route("api/events/{eventId}/guests")]
[Produces("application/json")]
public class GuestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GuestsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all guests for an event with pagination and filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<GuestDto>), 200)]
    public async Task<IActionResult> GetGuests(
        [FromRoute] string eventId,
        [FromQuery] string? filter,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50)
    {
        var query = new GetGuestsQuery(eventId, filter, search, page, limit);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(new
        {
            guests = result.Value.Items,
            pagination = new
            {
                page = result.Value.Page,
                limit = result.Value.Limit,
                total = result.Value.Total,
                totalPages = result.Value.TotalPages
            }
        });
    }

    /// <summary>
    /// Get guest by ID with full profile (360° view)
    /// </summary>
    [HttpGet("../guests/{id}", Name = "GetGuestById")]
    [ProducesResponseType(typeof(GuestDetailDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetGuestById([FromRoute] string id)
    {
        var query = new GetGuestByIdQuery(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Update guest details
    /// </summary>
    [HttpPatch("../guests/{id}")]
    [ProducesResponseType(typeof(SuccessResponse<GuestDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateGuest(
        [FromRoute] string id,
        [FromBody] UpdateGuestRequest request)
    {
        var command = new UpdateGuestCommand(
            id,
            request.Rsvp,
            request.Seats,
            request.Children,
            request.TransportNeeded,
            request.OptOut,
            request.Restrictions,
            request.Notes
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(new
        {
            success = true,
            guest = result.Value
        });
    }

    /// <summary>
    /// Get guest timeline
    /// </summary>
    [HttpGet("../guests/{id}/timeline")]
    [ProducesResponseType(typeof(GuestTimelineDto), 200)]
    public async Task<IActionResult> GetGuestTimeline([FromRoute] string id)
    {
        var query = new GetGuestTimelineQuery(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }
}
```

## Infrastructure Layer

### DbContext

```csharp
public class CelebreDbContext : DbContext, IApplicationDbContext
{
    public CelebreDbContext(DbContextOptions<CelebreDbContext> options) : base(options) { }

    public DbSet<Event> Events => Set<Event>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<Household> Households => Set<Household>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<SegmentTag> SegmentTags => Set<SegmentTag>();
    public DbSet<GuestTag> GuestTags => Set<GuestTag>();
    public DbSet<Interaction> Interactions => Set<Interaction>();
    public DbSet<EngagementScore> EngagementScores => Set<EngagementScore>();
    public DbSet<TimelineEntry> TimelineEntries => Set<TimelineEntry>();
    public DbSet<Task> Tasks => Set<Task>();
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
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CelebreDbContext).Assembly);

        // Configure snake_case naming convention
        // (handled by EFCore.NamingConventions package)
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            // This shouldn't happen in production (configured in DI)
            // But useful for migrations
            optionsBuilder.UseNpgsql();
        }

        // Configure timezone for DateTimeOffset
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", false);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Set UpdatedAt for modified entities
        foreach (var entry in ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified))
        {
            if (entry.Entity.GetType().GetProperty("UpdatedAt") != null)
            {
                entry.Property("UpdatedAt").CurrentValue = DateTimeOffset.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
```

### Entity Configuration Example

```csharp
public class GuestConfiguration : IEntityTypeConfiguration<Guest>
{
    public void Configure(EntityTypeBuilder<Guest> builder)
    {
        builder.ToTable("guests");

        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasMaxLength(25);

        builder.Property(g => g.EventId).IsRequired().HasMaxLength(25);
        builder.Property(g => g.ContactId).IsRequired().HasMaxLength(25);

        builder.Property(g => g.InviteStatus)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(g => g.Rsvp)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(g => g.Seats).HasDefaultValue(1);
        builder.Property(g => g.Children).HasDefaultValue(0);
        builder.Property(g => g.TransportNeeded).HasDefaultValue(false);
        builder.Property(g => g.OptOut).HasDefaultValue(false);

        builder.Property(g => g.CreatedAt).IsRequired();
        builder.Property(g => g.UpdatedAt).IsRequired();

        // Relationships
        builder.HasOne(g => g.Event)
            .WithMany(e => e.Guests)
            .HasForeignKey(g => g.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(g => g.Contact)
            .WithMany(c => c.Guests)
            .HasForeignKey(g => g.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        // Unique constraint
        builder.HasIndex(g => new { g.EventId, g.ContactId }).IsUnique();

        // Other indexes
        builder.HasIndex(g => g.EventId);
        builder.HasIndex(g => g.ContactId);
        builder.HasIndex(g => g.Rsvp);
    }
}
```

## Integrations Layer

### n8n Service

```csharp
public interface IN8nService
{
    Task<Result> SendMessageAsync(SendMessageRequest request, CancellationToken ct = default);
    Task<Result> NotifyGiftReceivedAsync(string giftId, string eventId, CancellationToken ct = default);
    Task<Result> NotifyVendorSubmittedAsync(string vendorId, CancellationToken ct = default);
}

public class N8nService : IN8nService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<N8nService> _logger;
    private readonly N8nOptions _options;

    public N8nService(
        HttpClient httpClient,
        IOptions<N8nOptions> options,
        ILogger<N8nService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _options = options.Value;
    }

    public async Task<Result> SendMessageAsync(SendMessageRequest request, CancellationToken ct)
    {
        try
        {
            var payload = new
            {
                phoneNumber = request.PhoneNumber,
                message = request.Message,
                eventId = request.EventId,
                guestId = request.GuestId
            };

            var response = await _httpClient.PostAsJsonAsync(
                "/webhook/send-message",
                payload,
                ct
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("n8n send message failed: {Error}", error);
                return Result.Failure("Failed to send message via n8n");
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling n8n send message webhook");
            return Result.Failure("Error communicating with n8n");
        }
    }

    // Similar methods for other webhooks...
}
```

### WhatsApp Webhook Handler

```csharp
public class WhatsAppWebhookHandler : IWhatsAppWebhookHandler
{
    private readonly IApplicationDbContext _context;
    private readonly IEngagementService _engagementService;
    private readonly ILogger<WhatsAppWebhookHandler> _logger;

    public async Task<Result> HandleWebhookAsync(WhatsAppWebhookPayload payload, CancellationToken ct)
    {
        // Check idempotency
        var messageId = payload.Entry[0].Changes[0].Value.Messages[0].Id;
        var existing = await _context.EventLogs
            .FirstOrDefaultAsync(
                el => el.Source == "whatsapp" &&
                      EF.Functions.JsonExists(el.PayloadJson, $"$.messageId") &&
                      EF.Functions.JsonContains(el.PayloadJson, $"\"{messageId}\"", "$.messageId"),
                ct
            );

        if (existing != null)
        {
            _logger.LogInformation("Duplicate WhatsApp message {MessageId}, skipping", messageId);
            return Result.Success();
        }

        // Log event for idempotency
        await _context.EventLogs.AddAsync(new EventLog
        {
            Source = "whatsapp",
            Type = "message_received",
            PayloadJson = JsonSerializer.Serialize(new { messageId, payload }),
            CreatedAt = DateTimeOffset.UtcNow
        }, ct);

        // Process message (RSVP commands, opt-out, etc.)
        // ... implementation ...

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
```

## Program.cs Configuration

```csharp
var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((context, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .WriteTo.Console();
});

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL");

builder.Services.AddDbContext<CelebreDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
    });
    options.UseSnakeCaseNamingConvention();
});

// CQRS
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(GetGuestsQuery).Assembly));

// Validation
builder.Services.AddValidatorsFromAssembly(typeof(UpdateGuestValidator).Assembly);

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// Integrations with Polly
builder.Services.AddHttpClient<IN8nService, N8nService>(client =>
{
    var n8nUrl = builder.Configuration["N8n:BaseUrl"]
        ?? Environment.GetEnvironmentVariable("N8N_URL");
    client.BaseAddress = new Uri(n8nUrl);
    client.DefaultRequestHeaders.Add("X-API-Key",
        builder.Configuration["N8n:ApiKey"] ?? Environment.GetEnvironmentVariable("N8N_API_KEY"));
})
.AddTransientHttpErrorPolicy(policy =>
    policy.WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))))
.AddTransientHttpErrorPolicy(policy =>
    policy.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));

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

// Controllers & Swagger
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "Celebre API";
    config.Version = "v1";
    config.Description = "Backend API for Celebre Event CRM";
});

var app = builder.Build();

// Middleware pipeline
app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseCors();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

## Docker

### Dockerfile

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["Celebre.sln", "./"]
COPY ["src/Celebre.Api/Celebre.Api.csproj", "src/Celebre.Api/"]
COPY ["src/Celebre.Application/Celebre.Application.csproj", "src/Celebre.Application/"]
COPY ["src/Celebre.Domain/Celebre.Domain.csproj", "src/Celebre.Domain/"]
COPY ["src/Celebre.Infrastructure/Celebre.Infrastructure.csproj", "src/Celebre.Infrastructure/"]
COPY ["src/Celebre.Integrations/Celebre.Integrations.csproj", "src/Celebre.Integrations/"]
COPY ["src/Celebre.Shared/Celebre.Shared.csproj", "src/Celebre.Shared/"]

RUN dotnet restore "Celebre.sln"

# Copy all source code
COPY . .

WORKDIR "/src/src/Celebre.Api"
RUN dotnet build "Celebre.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Celebre.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set timezone
ENV TZ=America/Sao_Paulo

ENTRYPOINT ["dotnet", "Celebre.Api.dll"]
```

### docker-compose.yml

```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: celebre-db
    environment:
      POSTGRES_USER: celebre
      POSTGRES_PASSWORD: celebre_dev_password
      POSTGRES_DB: celebre_db
      TZ: America/Sao_Paulo
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U celebre']
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: celebre-api
    environment:
      DATABASE_URL: 'Host=db;Database=celebre_db;Username=celebre;Password=celebre_dev_password'
      N8N_URL: '${N8N_URL:-http://host.docker.internal:5678}'
      N8N_API_KEY: '${N8N_API_KEY}'
      WHATSAPP_PHONE_NUMBER_ID: '${WHATSAPP_PHONE_NUMBER_ID}'
      WHATSAPP_ACCESS_TOKEN: '${WHATSAPP_ACCESS_TOKEN}'
      WHATSAPP_VERIFY_TOKEN: '${WHATSAPP_VERIFY_TOKEN}'
      ALLOWED_ORIGINS: '${ALLOWED_ORIGINS:-http://localhost:3000}'
      NEXTAUTH_SECRET: '${NEXTAUTH_SECRET}'
      TZ: America/Sao_Paulo
      ASPNETCORE_ENVIRONMENT: Development
    ports:
      - '5000:80'
      - '5001:443'
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads

  # Optional: n8n for testing
  n8n:
    image: n8nio/n8n:latest
    container_name: celebre-n8n
    environment:
      N8N_BASIC_AUTH_ACTIVE: 'true'
      N8N_BASIC_AUTH_USER: admin
      N8N_BASIC_AUTH_PASSWORD: admin123
      TZ: America/Sao_Paulo
    ports:
      - '5678:5678'
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  postgres_data:
  n8n_data:
```

## Migrações e Seeds

### Gerar Migration

```bash
cd src/Celebre.Infrastructure
dotnet ef migrations add MigrationName --startup-project ../Celebre.Api
```

### Aplicar Migration

```bash
dotnet ef database update --startup-project ../Celebre.Api
```

### Seed Data

Implementar em `Celebre.Infrastructure/Data/Seeders/DataSeeder.cs`:

```csharp
public class DataSeeder
{
    private readonly CelebreDbContext _context;

    public DataSeeder(CelebreDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        if (await _context.Events.AnyAsync())
            return; // Already seeded

        // Create sample event
        var eventId = GenerateCuid();
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

        // Create sample contacts and guests
        // ... (similar to prisma seed)

        await _context.SaveChangesAsync();
    }

    private string GenerateCuid()
    {
        // Implement CUID generation or use a library like Cuid.NET
        return Guid.NewGuid().ToString("N")[..25];
    }
}
```

Chamar no `Program.cs`:

```csharp
if (args.Contains("--seed"))
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<CelebreDbContext>();
    var seeder = new DataSeeder(context);
    await seeder.SeedAsync();
    return;
}
```

## Endpoints REST (Checklist)

### ✅ Convidados e RSVP

- GET /api/events/{eventId}/guests
- GET /api/guests/{guestId}
- PATCH /api/guests/{guestId}
- GET /api/guests/{guestId}/timeline
- POST /api/checkins
- GET /api/events/{eventId}/checkins

### ✅ Guest Portal (Token SHA256)

- GET /api/guest-portal/{token}
- PATCH /api/guest-portal/{token}
- DELETE /api/guest-portal/{token}
- POST /api/guest-portal/{token}/opt-out
- GET /api/guest-portal/{token}/export

### ✅ Segmentos/Grupos/Mensageria

- GET /api/events/{eventId}/segments
- POST /api/events/{eventId}/segments
- POST /api/events/{eventId}/segments/preview
- POST /api/events/{eventId}/segments/{segmentId}/rebuild
- PATCH /api/segments/{segmentId}
- DELETE /api/segments/{segmentId}
- POST /api/segments/{segmentId}/send
- GET /api/events/{eventId}/groups
- POST /api/events/{eventId}/groups
- DELETE /api/events/{eventId}/groups/{groupId}
- POST /api/events/{eventId}/groups/{groupId}/assign

### ✅ Tarefas e Timeline

- GET /api/events/{eventId}/tasks
- POST /api/events/{eventId}/tasks
- PATCH /api/tasks/{taskId}
- DELETE /api/tasks/{taskId}
- GET /api/events/{eventId}/timeline

### ✅ Mesas / Seating

- GET /api/events/{eventId}/tables
- POST /api/events/{eventId}/tables
- PATCH /api/tables/{tableId}
- DELETE /api/tables/{tableId}
- POST /api/tables/{tableId}/assign
- DELETE /api/tables/{tableId}/assign?seatIndex=
- POST /api/seats/{seatId}/unassign

### ✅ Presentes (Gifts)

- GET /api/events/{eventId}/gifts
- POST /api/events/{eventId}/gifts
- PATCH /api/gifts/{giftId}
- DELETE /api/gifts/{giftId}

### ✅ Vendors internos

- GET /api/events/{eventId}/vendors
- POST /api/events/{eventId}/vendors
- PATCH /api/vendors/{vendorId}
- DELETE /api/vendors/{vendorId}

### ✅ Vendor Marketplace

- GET /api/vendors
- POST /api/vendors/apply
- GET /api/vendor-partners/{id}
- PATCH /api/vendor-partners/{id}
- DELETE /api/vendor-partners/{id}
- POST /api/vendor-partners/{id}/note
- POST /api/vendor-partners/{id}/status
- GET /api/vendor-partners/public/{slug}
- POST /api/vendor-partners/suggest
- GET /api/vendor-partners/suggest

### ✅ Relatórios e Settings

- GET /api/events/{eventId}/summary
- GET /api/events/{eventId}/reports
- GET /api/events/{eventId}/settings
- PATCH /api/events/{eventId}/settings

### ✅ Uploads e Webhooks

- POST /api/uploads
- GET /api/webhooks/whatsapp
- POST /api/webhooks/whatsapp

## Regras de Negócio Implementadas

### Engagement Scoring

- RSVP confirmado (sim): +10 pontos
- Check-in: +10 pontos
- Opt-out: -5 pontos

Tiers:

- Bronze: < 25
- Prata: 25-49
- Ouro: ≥ 50

### Segment DSL → SQL

Implementar parser de DSL em `Celebre.Application/Services/SegmentQueryBuilder.cs`:

```csharp
public class SegmentQueryBuilder
{
    public IQueryable<Guest> BuildQuery(IQueryable<Guest> baseQuery, SegmentRules rules)
    {
        if (rules.And == null || !rules.And.Any())
            return baseQuery;

        foreach (var rule in rules.And)
        {
            baseQuery = ApplyRule(baseQuery, rule);
        }

        return baseQuery;
    }

    private IQueryable<Guest> ApplyRule(IQueryable<Guest> query, SegmentRule rule)
    {
        return rule.Field switch
        {
            "contact.isVip" => ApplyBoolFilter(query, g => g.Contact.IsVip, rule),
            "rsvp" => ApplyEnumFilter(query, g => g.Rsvp, rule),
            "children" => ApplyNumericFilter(query, g => g.Children, rule),
            "household" => ApplyHouseholdFilter(query, rule),
            // ... more fields
            _ => query
        };
    }

    // Helper methods for different filter types...
}
```

### Guest Portal Token Generation

```csharp
public class GuestPortalTokenService
{
    private readonly string _secret;

    public GuestPortalTokenService(IConfiguration configuration)
    {
        _secret = configuration["NEXTAUTH_SECRET"]
            ?? Environment.GetEnvironmentVariable("NEXTAUTH_SECRET")
            ?? throw new InvalidOperationException("NEXTAUTH_SECRET not configured");
    }

    public string GenerateToken(string guestId)
    {
        var input = $"{guestId}{_secret}";
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    public async Task<Guest?> ValidateTokenAsync(
        string token,
        IApplicationDbContext context,
        CancellationToken ct)
    {
        // Brute force search (optimize with cache/Redis in production)
        var guests = await context.Guests.ToListAsync(ct);
        return guests.FirstOrDefault(g => GenerateToken(g.Id) == token);
    }
}
```

### Seating Circular Generation

```csharp
public class SeatingService
{
    public List<Seat> GenerateSeats(string tableId, int capacity, int radius = 80)
    {
        var seats = new List<Seat>();
        var theta = 2 * Math.PI / capacity;

        for (int i = 0; i < capacity; i++)
        {
            seats.Add(new Seat
            {
                Id = GenerateCuid(),
                TableId = tableId,
                Index = i,
                X = Math.Cos(i * theta) * radius,
                Y = Math.Sin(i * theta) * radius,
                Rotation = i * theta * (180 / Math.PI)
            });
        }

        return seats;
    }
}
```

## Geração de Cliente TypeScript

### 1. Gerar OpenAPI JSON

No `Program.cs`, adicionar endpoint para servir OpenAPI:

```csharp
app.MapGet("/swagger/v1/swagger.json", async (IDocumentProvider documentProvider) =>
{
    var document = await documentProvider.GenerateAsync("v1");
    return Results.Content(document, "application/json");
});
```

### 2. Usar NSwag CLI para gerar cliente

```bash
# Instalar NSwag CLI globalmente
dotnet tool install -g NSwag.ConsoleCore

# Gerar cliente TypeScript
nswag openapi2tsclient /input:https://localhost:5001/swagger/v1/swagger.json /output:../src/lib/api/celebre-client.ts /template:Fetch /generateClientClasses:true /generateDtoTypes:true /dateTimeType:DateTimeOffset
```

### 3. Usar no front Next.js

```typescript
// lib/api/client.ts
import { CelebreClient } from './celebre-client'

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const apiClient = new CelebreClient(baseUrl)

// Uso em componente
import { apiClient } from '@/lib/api/client'

export async function getGuests(eventId: string) {
  const response = await apiClient.getGuests(eventId, {
    filter: 'confirmed',
    page: 1,
    limit: 50,
  })
  return response
}
```

## Testes

### Unit Test Example

```csharp
public class UpdateGuestHandlerTests
{
    private readonly Mock<IApplicationDbContext> _contextMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<IEngagementService> _engagementMock;
    private readonly UpdateGuestHandler _handler;

    public UpdateGuestHandlerTests()
    {
        _contextMock = new Mock<IApplicationDbContext>();
        _mapperMock = new Mock<IMapper>();
        _engagementMock = new Mock<IEngagementService>();
        _handler = new UpdateGuestHandler(_contextMock.Object, _mapperMock.Object, _engagementMock.Object);
    }

    [Fact]
    public async Task Handle_GuestNotFound_ReturnsFailure()
    {
        // Arrange
        var command = new UpdateGuestCommand("non-existent-id", RsvpStatus.sim, null, null, null, null, null, null);
        _contextMock.Setup(c => c.Guests.FirstOrDefaultAsync(It.IsAny<Expression<Func<Guest, bool>>>(), default))
            .ReturnsAsync((Guest?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Guest not found", result.Error);
    }

    [Fact]
    public async Task Handle_RsvpSim_IncrementsEngagementScore()
    {
        // Arrange
        var guest = new Guest { Id = "guest-1", ContactId = "contact-1", EventId = "event-1" };
        var command = new UpdateGuestCommand("guest-1", RsvpStatus.sim, null, null, null, null, null, null);

        _contextMock.Setup(c => c.Guests.FirstOrDefaultAsync(It.IsAny<Expression<Func<Guest, bool>>>(), default))
            .ReturnsAsync(guest);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        _engagementMock.Verify(e => e.IncrementScoreAsync("contact-1", "event-1", 10, default), Times.Once);
    }
}
```

### Integration Test Example

```csharp
public class GuestsApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public GuestsApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Replace DB with in-memory for testing
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<CelebreDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                services.AddDbContext<CelebreDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                });
            });
        });
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetGuests_ReturnsOkWithPagination()
    {
        // Arrange
        var eventId = "test-event-1";

        // Act
        var response = await _client.GetAsync($"/api/events/{eventId}/guests");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GuestsResponse>(content);

        Assert.NotNull(result);
        Assert.NotNull(result.Guests);
        Assert.NotNull(result.Pagination);
    }
}
```

## Performance e Observabilidade

### Serilog Configuration (appsettings.json)

```json
{
  "Serilog": {
    "Using": ["Serilog.Sinks.Console", "Serilog.Sinks.File"],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/celebre-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 7
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"]
  }
}
```

### Request Correlation

```csharp
// Add correlation ID middleware
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private const string CorrelationIdHeader = "X-Correlation-ID";

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[CorrelationIdHeader].FirstOrDefault()
            ?? Guid.NewGuid().ToString();

        context.Items[CorrelationIdHeader] = correlationId;
        context.Response.Headers[CorrelationIdHeader] = correlationId;

        using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
```

## Migração do Front

### 1. Instalar cliente gerado

```bash
cd ../celebra-mvp # front Next.js
npm install --save-dev nswag
```

### 2. Atualizar .env

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Substituir fetchers

Antes:

```typescript
// app/guests/page.tsx
const response = await fetch(`/api/events/${eventId}/guests`)
const data = await response.json()
```

Depois:

```typescript
import { apiClient } from '@/lib/api/client'

const data = await apiClient.getGuests(eventId, { page: 1, limit: 50 })
```

### 4. Manter tipos sincronizados

```bash
# Regenerar cliente sempre que a API mudar
npm run generate:api-client
```

Adicionar ao package.json:

```json
{
  "scripts": {
    "generate:api-client": "nswag openapi2tsclient /input:http://localhost:5000/swagger/v1/swagger.json /output:./src/lib/api/celebre-client.ts"
  }
}
```

## Checklist de Aceite

- [ ] Todos os endpoints retornam contratos idênticos ao Next.js API
- [ ] Enums em strings pt-BR mantidos
- [ ] DSL de segmentos gera SQL correto
- [ ] Seating: assign/unassign/lock/colisões funcionam
- [ ] Webhook WhatsApp é idempotente (EventLog)
- [ ] Gifts: webhook gift-received disparado ao status="comprado"
- [ ] Settings GET retorna acentuação correta
- [ ] Tasks PATCH/DELETE retornam mock (marcados TODO)
- [ ] OpenAPI gerado + cliente TS funcional
- [ ] CORS configurado para domínio do front
- [ ] Timezone America/Sao_Paulo aplicado
- [ ] Erros padronizados com traceId
- [ ] Logs estruturados (Serilog)
- [ ] Testes passando
- [ ] Docker Compose funcional
- [ ] Migrations reproduzem schema Prisma
- [ ] Seeds compatíveis

## Próximos Passos

1. **Implementar todas as entidades do Domain** (26 classes)
2. **Criar todas as Entity Configurations** para EF Core
3. **Implementar todos os DTOs** (request/response para cada endpoint)
4. **Criar todos os Queries e Commands** (CQRS pattern)
5. **Implementar todos os 50+ endpoints REST**
6. **Escrever testes unitários** para lógica de negócio
7. **Escrever testes de integração** para endpoints críticos
8. **Implementar Migrations** que reproduzam exatamente o schema Prisma
9. **Portar Seeds** do Prisma para C#
10. **Documentar OpenAPI** com exemplos e descrições
11. **Gerar e testar cliente TypeScript**
12. **Deploy em staging** e validar com front

## Suporte

Para dúvidas sobre a implementação:

- Consultar schema Prisma original: `../prisma/schema.prisma`
- Consultar endpoints Next.js originais: `../src/app/api/**/*.ts`
- Seguir padrões estabelecidos neste README

## Licença

[Sua licença aqui]
