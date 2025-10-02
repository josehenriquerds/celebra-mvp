# Guia de Implementação - Templates de Código

## Templates para Acelerar Desenvolvimento

### Template: Entidade do Domain

```csharp
// Celebre.Domain/Entities/{EntityName}.cs
using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class {EntityName}
{
    public string Id { get; set; } = string.Empty;

    // Properties conforme schema Prisma
    // Usar DateTimeOffset para datas
    // Usar List<string> para arrays
    // Usar decimal para float/money
    // Usar string para JSON (serializar/deserializar na app layer)

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<RelatedEntity> RelatedEntities { get; set; } = new List<RelatedEntity>();
}
```

### Template: Entity Configuration

```csharp
// Celebre.Infrastructure/Configurations/{EntityName}Configuration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Configurations;

public class {EntityName}Configuration : IEntityTypeConfiguration<{EntityName}>
{
    public void Configure(EntityTypeBuilder<{EntityName}> builder)
    {
        builder.ToTable("{table_name}"); // snake_case

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasMaxLength(25).IsRequired();

        // String properties
        builder.Property(e => e.SomeField)
            .HasMaxLength(255)
            .IsRequired();

        // Enum properties (converter para string)
        builder.Property(e => e.Status)
            .HasConversion<string>()
            .IsRequired();

        // Decimal properties
        builder.Property(e => e.Price)
            .HasPrecision(18, 2);

        // JSON properties (EF Core 7+)
        builder.Property(e => e.MetaJson)
            .HasColumnType("jsonb");

        // Arrays (PostgreSQL)
        builder.Property(e => e.Tags)
            .HasColumnType("text[]");

        // Timestamps
        builder.Property(e => e.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()");

        builder.Property(e => e.UpdatedAt)
            .IsRequired();

        // Relationships
        builder.HasOne(e => e.ParentEntity)
            .WithMany(p => p.ChildEntities)
            .HasForeignKey(e => e.ParentEntityId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.SomeField);
        builder.HasIndex(e => new { e.Field1, e.Field2 }).IsUnique();
    }
}
```

### Template: DTO

```csharp
// Celebre.Application/Features/{Feature}/DTOs/{EntityName}Dto.cs
namespace Celebre.Application.Features.{Feature}.DTOs;

public record {EntityName}Dto(
    string Id,
    string Field1,
    int Field2,
    DateTimeOffset CreatedAt
);

// Para responses paginados
public record PagedResponse<T>(
    List<T> Items,
    PaginationMeta Pagination
);

public record PaginationMeta(
    int Page,
    int Limit,
    int Total,
    int TotalPages
);
```

### Template: Query

```csharp
// Celebre.Application/Features/{Feature}/Queries/Get{EntityName}List/Get{EntityName}ListQuery.cs
using MediatR;
using Celebre.Shared;

namespace Celebre.Application.Features.{Feature}.Queries.Get{EntityName}List;

public record Get{EntityName}ListQuery(
    string EventId,
    string? Filter,
    string? Search,
    int Page = 1,
    int Limit = 50
) : IRequest<Result<PagedResult<{EntityName}Dto>>>;

// Handler
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;

public class Get{EntityName}ListHandler
    : IRequestHandler<Get{EntityName}ListQuery, Result<PagedResult<{EntityName}Dto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<Get{EntityName}ListHandler> _logger;

    public Get{EntityName}ListHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ILogger<Get{EntityName}ListHandler> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<PagedResult<{EntityName}Dto>>> Handle(
        Get{EntityName}ListQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var query = _context.{EntityName}s
                .Include(e => e.RelatedEntity)
                .Where(e => e.EventId == request.EventId);

            // Apply filters
            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = request.Filter switch
                {
                    "active" => query.Where(e => e.IsActive),
                    "inactive" => query.Where(e => !e.IsActive),
                    _ => query
                };
            }

            // Apply search
            if (!string.IsNullOrEmpty(request.Search))
            {
                query = query.Where(e =>
                    EF.Functions.ILike(e.Name, $"%{request.Search}%"));
            }

            var total = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderBy(e => e.Name)
                .Skip((request.Page - 1) * request.Limit)
                .Take(request.Limit)
                .ProjectTo<{EntityName}Dto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<PagedResult<{EntityName}Dto>>.Success(
                new PagedResult<{EntityName}Dto>(
                    items,
                    total,
                    request.Page,
                    request.Limit
                )
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching {EntityName} list");
            return Result<PagedResult<{EntityName}Dto>>.Failure(
                "Error fetching data"
            );
        }
    }
}
```

### Template: Command

```csharp
// Celebre.Application/Features/{Feature}/Commands/Create{EntityName}/Create{EntityName}Command.cs
using MediatR;
using Celebre.Shared;

namespace Celebre.Application.Features.{Feature}.Commands.Create{EntityName};

public record Create{EntityName}Command(
    string EventId,
    string Name,
    string? Description
) : IRequest<Result<{EntityName}Dto>>;

// Request (para binding no controller)
public record Create{EntityName}Request(
    string Name,
    string? Description
);

// Validator
using FluentValidation;

public class Create{EntityName}Validator : AbstractValidator<Create{EntityName}Command>
{
    public Create{EntityName}Validator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome é obrigatório")
            .MaximumLength(255).WithMessage("Nome muito longo");

        RuleFor(x => x.EventId)
            .NotEmpty().WithMessage("EventId é obrigatório");
    }
}

// Handler
using Microsoft.EntityFrameworkCore;
using AutoMapper;

public class Create{EntityName}Handler
    : IRequestHandler<Create{EntityName}Command, Result<{EntityName}Dto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<Create{EntityName}Handler> _logger;

    public Create{EntityName}Handler(
        IApplicationDbContext context,
        IMapper mapper,
        ILogger<Create{EntityName}Handler> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<{EntityName}Dto>> Handle(
        Create{EntityName}Command request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Validate event exists
            var eventExists = await _context.Events
                .AnyAsync(e => e.Id == request.EventId, cancellationToken);

            if (!eventExists)
                return Result<{EntityName}Dto>.Failure("Event not found");

            // Create entity
            var entity = new {EntityName}
            {
                Id = GenerateCuid(),
                EventId = request.EventId,
                Name = request.Name,
                Description = request.Description,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _context.{EntityName}s.AddAsync(entity, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            var dto = _mapper.Map<{EntityName}Dto>(entity);
            return Result<{EntityName}Dto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating {EntityName}");
            return Result<{EntityName}Dto>.Failure("Error creating entity");
        }
    }

    private string GenerateCuid()
    {
        // Use Cuid.NET ou implemente geração compatível
        return Guid.NewGuid().ToString("N")[..25];
    }
}
```

### Template: Controller

```csharp
// Celebre.Api/Controllers/{Feature}Controller.cs
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Celebre.Application.Features.{Feature}.Queries.*;
using Celebre.Application.Features.{Feature}.Commands.*;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api/events/{eventId}/{feature}")]
[Produces("application/json")]
public class {Feature}Controller : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<{Feature}Controller> _logger;

    public {Feature}Controller(
        IMediator mediator,
        ILogger<{Feature}Controller> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all {feature} for an event
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<{EntityName}Dto>), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetList(
        [FromRoute] string eventId,
        [FromQuery] string? filter,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50)
    {
        var query = new Get{EntityName}ListQuery(eventId, filter, search, page, limit);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(new
        {
            {feature} = result.Value.Items,
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
    /// Get {entityName} by ID
    /// </summary>
    [HttpGet("../{feature}/{id}", Name = "Get{EntityName}ById")]
    [ProducesResponseType(typeof({EntityName}Dto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById([FromRoute] string id)
    {
        var query = new Get{EntityName}ByIdQuery(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Create new {entityName}
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof({EntityName}Dto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create(
        [FromRoute] string eventId,
        [FromBody] Create{EntityName}Request request)
    {
        var command = new Create{EntityName}Command(
            eventId,
            request.Name,
            request.Description
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return CreatedAtRoute(
            "Get{EntityName}ById",
            new { id = result.Value.Id },
            result.Value
        );
    }

    /// <summary>
    /// Update {entityName}
    /// </summary>
    [HttpPatch("../{feature}/{id}")]
    [ProducesResponseType(typeof({EntityName}Dto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(
        [FromRoute] string id,
        [FromBody] Update{EntityName}Request request)
    {
        var command = new Update{EntityName}Command(
            id,
            request.Name,
            request.Description
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete {entityName}
    /// </summary>
    [HttpDelete("../{feature}/{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete([FromRoute] string id)
    {
        var command = new Delete{EntityName}Command(id);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return NoContent();
    }
}
```

### Template: Mapping Profile

```csharp
// Celebre.Application/Common/Mappings/MappingProfile.cs
using AutoMapper;
using Celebre.Domain.Entities;
using Celebre.Application.Features.{Feature}.DTOs;

namespace Celebre.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // {EntityName} mappings
        CreateMap<{EntityName}, {EntityName}Dto>()
            .ForMember(dest => dest.RelatedEntityName,
                opt => opt.MapFrom(src => src.RelatedEntity.Name));

        // Complex mapping with nested objects
        CreateMap<Guest, GuestDto>()
            .ForMember(dest => dest.Contact, opt => opt.MapFrom(src => new ContactDto(
                src.Contact.Id,
                src.Contact.FullName,
                src.Contact.Phone,
                src.Contact.Email,
                src.Contact.Relation.ToString(),
                src.Contact.IsVip,
                src.Contact.RestrictionsJson != null
                    ? JsonSerializer.Deserialize<object>(src.Contact.RestrictionsJson)
                    : null
            )))
            .ForMember(dest => dest.EngagementScore, opt => opt.MapFrom(src =>
                src.Contact.EngagementScores.FirstOrDefault() != null
                    ? new EngagementScoreDto(
                        src.Contact.EngagementScores.First().Value,
                        src.Contact.EngagementScores.First().Tier.ToString()
                    )
                    : null
            ));
    }
}
```

## Shared Layer - Tipos Comuns

### Result<T> Pattern

```csharp
// Celebre.Shared/Result.cs
namespace Celebre.Shared;

public class Result
{
    public bool IsSuccess { get; }
    public string? Error { get; }

    protected Result(bool isSuccess, string? error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, null);
    public static Result Failure(string error) => new(false, error);
}

public class Result<T> : Result
{
    public T? Value { get; }

    private Result(bool isSuccess, T? value, string? error)
        : base(isSuccess, error)
    {
        Value = value;
    }

    public static Result<T> Success(T value) => new(true, value, null);
    public new static Result<T> Failure(string error) => new(false, default, error);
}
```

### PagedResult<T>

```csharp
// Celebre.Shared/PagedResult.cs
namespace Celebre.Shared;

public class PagedResult<T>
{
    public List<T> Items { get; set; }
    public int Total { get; set; }
    public int Page { get; set; }
    public int Limit { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)Total / Limit);

    public PagedResult(List<T> items, int total, int page, int limit)
    {
        Items = items;
        Total = total;
        Page = page;
        Limit = limit;
    }
}
```

### CUID Generator

```csharp
// Celebre.Shared/CuidGenerator.cs
using System.Security.Cryptography;
using System.Text;

namespace Celebre.Shared;

public static class CuidGenerator
{
    private static long _counter = 0;
    private static readonly object _lockObject = new();

    public static string Generate()
    {
        lock (_lockObject)
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var counter = Interlocked.Increment(ref _counter) % 1679616; // 36^4
            var random = RandomNumberGenerator.GetInt32(0, int.MaxValue);

            var cuid = $"c{ToBase36(timestamp)}{ToBase36(counter).PadLeft(4, '0')}{ToBase36(random)}";
            return cuid[..25]; // Trim to 25 characters
        }
    }

    private static string ToBase36(long value)
    {
        const string chars = "0123456789abcdefghijklmnopqrstuvwxyz";
        var result = new StringBuilder();

        do
        {
            result.Insert(0, chars[(int)(value % 36)]);
            value /= 36;
        } while (value > 0);

        return result.ToString();
    }
}
```

## Integrations - Templates

### HTTP Client Base

```csharp
// Celebre.Integrations/Common/HttpClientBase.cs
using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Celebre.Shared;

namespace Celebre.Integrations.Common;

public abstract class HttpClientBase
{
    protected readonly HttpClient HttpClient;
    protected readonly ILogger Logger;

    protected HttpClientBase(HttpClient httpClient, ILogger logger)
    {
        HttpClient = httpClient;
        Logger = logger;
    }

    protected async Task<Result<TResponse>> PostAsync<TRequest, TResponse>(
        string endpoint,
        TRequest request,
        CancellationToken ct = default)
    {
        try
        {
            var response = await HttpClient.PostAsJsonAsync(endpoint, request, ct);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                Logger.LogError("HTTP POST failed: {StatusCode} - {Error}",
                    response.StatusCode, error);
                return Result<TResponse>.Failure($"Request failed: {response.StatusCode}");
            }

            var result = await response.Content.ReadFromJsonAsync<TResponse>(ct);
            return result != null
                ? Result<TResponse>.Success(result)
                : Result<TResponse>.Failure("Invalid response");
        }
        catch (HttpRequestException ex)
        {
            Logger.LogError(ex, "HTTP request error");
            return Result<TResponse>.Failure("Network error");
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Unexpected error");
            return Result<TResponse>.Failure("Unexpected error");
        }
    }

    protected async Task<Result> PostAsync<TRequest>(
        string endpoint,
        TRequest request,
        CancellationToken ct = default)
    {
        try
        {
            var response = await HttpClient.PostAsJsonAsync(endpoint, request, ct);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                Logger.LogError("HTTP POST failed: {StatusCode} - {Error}",
                    response.StatusCode, error);
                return Result.Failure($"Request failed: {response.StatusCode}");
            }

            return Result.Success();
        }
        catch (HttpRequestException ex)
        {
            Logger.LogError(ex, "HTTP request error");
            return Result.Failure("Network error");
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Unexpected error");
            return Result.Failure("Unexpected error");
        }
    }
}
```

## Testes - Templates

### Unit Test Base

```csharp
// Celebre.UnitTests/Common/TestBase.cs
using AutoMapper;
using Moq;
using Celebre.Application.Common.Mappings;

namespace Celebre.UnitTests.Common;

public abstract class TestBase
{
    protected readonly Mock<IApplicationDbContext> ContextMock;
    protected readonly IMapper Mapper;

    protected TestBase()
    {
        ContextMock = new Mock<IApplicationDbContext>();

        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
        });
        Mapper = config.CreateMapper();
    }

    protected Mock<DbSet<T>> CreateMockDbSet<T>(List<T> data) where T : class
    {
        var queryable = data.AsQueryable();
        var mockSet = new Mock<DbSet<T>>();

        mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());

        return mockSet;
    }
}
```

### Integration Test Base

```csharp
// Celebre.IntegrationTests/Common/IntegrationTestBase.cs
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Celebre.Infrastructure.Persistence;

namespace Celebre.IntegrationTests.Common;

public abstract class IntegrationTestBase : IClassFixture<WebApplicationFactory<Program>>
{
    protected readonly WebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;

    protected IntegrationTestBase(WebApplicationFactory<Program> factory)
    {
        Factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove real DB
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<CelebreDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                // Add in-memory DB
                services.AddDbContext<CelebreDbContext>(options =>
                {
                    options.UseInMemoryDatabase($"TestDb_{Guid.NewGuid()}");
                });

                // Ensure DB is created
                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<CelebreDbContext>();
                db.Database.EnsureCreated();
            });
        });

        Client = Factory.CreateClient();
    }

    protected async Task<CelebreDbContext> GetDbContext()
    {
        var scope = Factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<CelebreDbContext>();
    }
}
```

## Checklist de Implementação por Endpoint

### Para cada endpoint REST:

1. [ ] Criar entidade no Domain (se ainda não existir)
2. [ ] Criar configuração EF Core no Infrastructure
3. [ ] Criar DTOs no Application
4. [ ] Criar Query ou Command no Application
5. [ ] Criar Validator (se for Command)
6. [ ] Criar Handler no Application
7. [ ] Adicionar mapeamento no MappingProfile
8. [ ] Criar Controller no Api
9. [ ] Testar endpoint manualmente via Swagger
10. [ ] Escrever unit test para Handler
11. [ ] Escrever integration test para Controller
12. [ ] Documentar no OpenAPI (via XML comments)

## Ordem de Implementação Sugerida

### Fase 1 - Foundation (1-2 dias)

1. ✅ Criar todos os Enums
2. ✅ Criar Result<T> e PagedResult<T>
3. ✅ Criar CuidGenerator
4. [ ] Criar todas as entidades do Domain
5. [ ] Criar todas as Entity Configurations
6. [ ] Criar DbContext completo
7. [ ] Criar primeira Migration
8. [ ] Testar migração em DB local

### Fase 2 - Core Features (3-5 dias)

9. [ ] Implementar Guests (GET, PATCH)
10. [ ] Implementar Checkins (POST, GET)
11. [ ] Implementar EngagementService
12. [ ] Implementar Timeline (GET)
13. [ ] Implementar Tables/Seating (GET, POST, PATCH, DELETE, assign, unassign)
14. [ ] Implementar Gifts (CRUD + webhook)

### Fase 3 - Advanced Features (3-5 dias)

15. [ ] Implementar Segments (DSL → SQL)
16. [ ] Implementar Groups
17. [ ] Implementar Messaging (integração n8n)
18. [ ] Implementar Tasks (CRUD)
19. [ ] Implementar Vendors internos (CRUD)

### Fase 4 - Marketplace & Portal (2-3 dias)

20. [ ] Implementar VendorPartners (CRUD, apply, status management)
21. [ ] Implementar VendorMedia/Reviews/Notes
22. [ ] Implementar suggest algorithm
23. [ ] Implementar Guest Portal (token-based endpoints)
24. [ ] Implementar opt-out/export

### Fase 5 - Integrations (2-3 dias)

25. [ ] Implementar n8n Service
26. [ ] Implementar WhatsApp Webhook Handler (idempotência)
27. [ ] Implementar Upload Service
28. [ ] Implementar EventLog para idempotência

### Fase 6 - Reports & Settings (1-2 dias)

29. [ ] Implementar Summary endpoint
30. [ ] Implementar Reports endpoint
31. [ ] Implementar Settings (GET/PATCH stub)

### Fase 7 - Testing & Polish (2-3 dias)

32. [ ] Escrever unit tests para regras de negócio críticas
33. [ ] Escrever integration tests para todos os endpoints
34. [ ] Validar contratos REST com Next.js original
35. [ ] Ajustar acentuação e formatação de respostas

### Fase 8 - Deploy & Migration (1-2 dias)

36. [ ] Finalizar Docker Compose
37. [ ] Gerar OpenAPI final
38. [ ] Gerar cliente TypeScript
39. [ ] Criar Seeds compatíveis
40. [ ] Documentar migração do front

**Total estimado: 15-22 dias de desenvolvimento**

## Scripts Úteis

### Gerar Migration

```bash
#!/bin/bash
# scripts/add-migration.sh
cd src/Celebre.Infrastructure
dotnet ef migrations add $1 --startup-project ../Celebre.Api
```

### Aplicar Migration

```bash
#!/bin/bash
# scripts/update-database.sh
cd src/Celebre.Infrastructure
dotnet ef database update --startup-project ../Celebre.Api
```

### Gerar Cliente TypeScript

```bash
#!/bin/bash
# scripts/generate-client.sh
dotnet run --project src/Celebre.Api &
API_PID=$!
sleep 5
nswag openapi2tsclient \
  /input:https://localhost:5001/swagger/v1/swagger.json \
  /output:../src/lib/api/celebre-client.ts \
  /template:Fetch \
  /generateClientClasses:true \
  /generateDtoTypes:true \
  /dateTimeType:DateTimeOffset
kill $API_PID
```

### Rodar testes

```bash
#!/bin/bash
# scripts/test.sh
dotnet test --logger "console;verbosity=detailed"
```

## Próximos Passos

Use este guia como referência para implementar cada componente do sistema. Siga os templates, mantenha consistência nos padrões, e sempre valide contra o schema Prisma original e os endpoints Next.js.

Boa sorte na implementação! 🚀
