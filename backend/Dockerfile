# ============================================
# Celebre API - Multi-stage Dockerfile
# ============================================

# Stage 1: Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Install timezone data
RUN apt-get update && apt-get install -y tzdata && rm -rf /var/lib/apt/lists/*

# Stage 2: Build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files for restore
COPY ["Celebre.sln", "./"]
COPY ["src/Celebre.Api/Celebre.Api.csproj", "src/Celebre.Api/"]
COPY ["src/Celebre.Application/Celebre.Application.csproj", "src/Celebre.Application/"]
COPY ["src/Celebre.Domain/Celebre.Domain.csproj", "src/Celebre.Domain/"]
COPY ["src/Celebre.Infrastructure/Celebre.Infrastructure.csproj", "src/Celebre.Infrastructure/"]
COPY ["src/Celebre.Integrations/Celebre.Integrations.csproj", "src/Celebre.Integrations/"]
COPY ["src/Celebre.Shared/Celebre.Shared.csproj", "src/Celebre.Shared/"]

# Restore dependencies
RUN dotnet restore "Celebre.sln"

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/src/Celebre.Api"
RUN dotnet build "Celebre.Api.csproj" -c Release -o /app/build

# Stage 3: Publish
FROM build AS publish
RUN dotnet publish "Celebre.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Final runtime image
FROM base AS final
WORKDIR /app

# Copy published files
COPY --from=publish /app/publish .

# Create directories for uploads and logs
RUN mkdir -p /app/uploads /app/logs && \
    chmod 755 /app/uploads /app/logs

# Set timezone
ENV TZ=America/Sao_Paulo
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Run as non-root user (optional, for security)
# RUN useradd -m -u 1000 celebre && chown -R celebre:celebre /app
# USER celebre

ENTRYPOINT ["dotnet", "Celebre.Api.dll"]
