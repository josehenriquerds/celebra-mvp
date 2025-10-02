# 🚀 Como Rodar o Backend Celebre - Guia Rápido

## ⚡ Quick Start (5 minutos)

### Pré-requisitos
- ✅ .NET 8 SDK instalado
- ✅ PostgreSQL rodando (Docker ou local)
- ✅ Porta 5432 disponível (PostgreSQL)
- ✅ Porta 5000 disponível (API)

---

## 🐳 Opção 1: Com Docker (RECOMENDADO)

### 1. Iniciar PostgreSQL

```bash
cd backend
docker-compose up -d db
```

Aguarde 10-15 segundos para o banco inicializar (healthcheck).

### 2. Aplicar Migration

```bash
cd src/Celebre.Infrastructure
dotnet ef database update --startup-project ../Celebre.Api
```

**Output esperado**:
```
Build started...
Build succeeded.
Applying migration '20251002024201_InitialCreate'.
Done.
```

### 3. (Opcional) Popular com Dados de Exemplo

```bash
cd ../Celebre.Api
dotnet run --seed
```

**Dados criados**:
- 1 evento "Casamento João & Maria"
- 2 households (Família Silva, Amigos da Faculdade)
- 2 contatos (Pedro Silva, Ana Costa)
- 2 convidados
- 1 mesa com 8 assentos
- Engagement scores
- Timeline entry

### 4. Iniciar API

```bash
dotnet run
```

**Output esperado**:
```
[23:45:00 INF] Now listening on: http://localhost:5000
[23:45:00 INF] Now listening on: https://localhost:5001
```

### 5. Testar

Abra o navegador em:
- **Swagger UI**: http://localhost:5000/swagger
- **Health Check**: http://localhost:5000/health

---

## 💻 Opção 2: Sem Docker (PostgreSQL Local)

### 1. Configurar Connection String

Edite `src/Celebre.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=celebre_db;Username=SEU_USER;Password=SUA_SENHA"
  }
}
```

### 2. Criar Banco de Dados

```bash
# No psql ou pgAdmin, execute:
CREATE DATABASE celebre_db;
```

### 3. Aplicar Migration

```bash
cd backend/src/Celebre.Infrastructure
dotnet ef database update --startup-project ../Celebre.Api
```

### 4. Seed + Run

```bash
cd ../Celebre.Api
dotnet run --seed
```

---

## 🧪 Testando os Endpoints

### Via Swagger UI

1. Acesse http://localhost:5000/swagger
2. Expanda qualquer endpoint
3. Clique em "Try it out"
4. Preencha os parâmetros
5. Clique "Execute"

### Via cURL

```bash
# Health Check
curl http://localhost:5000/health

# Listar convidados (substitua {eventId} pelo ID do seed)
curl http://localhost:5000/api/events/{eventId}/guests?page=1&limit=10

# Estatísticas
curl http://localhost:5000/api/events/{eventId}/reports/stats

# Listar mesas
curl http://localhost:5000/api/events/{eventId}/tables
```

### Via Thunder Client / Postman

Importe a collection do Swagger:
```
http://localhost:5000/swagger/v1/swagger.json
```

---

## 📋 Endpoints Principais

### Guests (Convidados)
```
GET    /api/events/{eventId}/guests          # Listar
GET    /api/guests/{id}                      # Obter um
POST   /api/events/{eventId}/guests          # Criar
PATCH  /api/guests/{id}                      # Atualizar
DELETE /api/guests/{id}                      # Deletar
```

### Checkins
```
GET    /api/events/{eventId}/checkins        # Listar
POST   /api/events/{eventId}/checkins        # Criar
GET    /api/checkins/stats/{eventId}         # Estatísticas
```

### Tables (Mesas)
```
GET    /api/events/{eventId}/tables          # Listar
POST   /api/tables                           # Criar
POST   /api/tables/{tableId}/assign          # Atribuir assento
POST   /api/events/{eventId}/auto-seat       # Auto-atribuir
```

### Gifts (Presentes)
```
GET    /api/events/{eventId}/gifts           # Listar
POST   /api/gifts                            # Criar
PATCH  /api/gifts/{id}                       # Atualizar
```

### Reports
```
GET    /api/events/{eventId}/reports/stats       # Estatísticas gerais
GET    /api/events/{eventId}/reports/budget      # Orçamento
GET    /api/events/{eventId}/reports/engagement  # Engajamento
```

**Ver lista completa**: http://localhost:5000/swagger

---

## 🔧 Comandos Úteis

### Build
```bash
cd backend
dotnet build
```

### Rodar Testes
```bash
dotnet test
```

### Criar Nova Migration
```bash
cd src/Celebre.Infrastructure
dotnet ef migrations add NomeDaMigration --startup-project ../Celebre.Api
```

### Reverter Migration
```bash
dotnet ef database update PreviousMigration --startup-project ../Celebre.Api
```

### Limpar Build
```bash
dotnet clean
```

### Rebuild Completo
```bash
dotnet clean
dotnet restore
dotnet build
```

---

## 🐛 Troubleshooting

### Erro: "Database does not exist"

**Solução**:
```bash
# Criar banco manualmente
docker-compose exec db psql -U celebre -c "CREATE DATABASE celebre_db;"

# Ou recriar container
docker-compose down -v
docker-compose up -d db
```

### Erro: "Port 5432 already in use"

**Solução**:
```bash
# Parar PostgreSQL local
sudo service postgresql stop  # Linux
brew services stop postgresql  # Mac

# Ou mudar porta no docker-compose.yml:
# ports: ["5433:5432"]  # Usar 5433 externamente
```

### Erro: "Port 5000 already in use"

**Solução**:
```bash
# Editar src/Celebre.Api/Properties/launchSettings.json
# Mudar "applicationUrl" para "http://localhost:5005"
```

### Erro: "Cannot connect to Docker daemon"

**Solução**:
```bash
# Iniciar Docker Desktop
# Ou usar PostgreSQL local (Opção 2 acima)
```

### Migration Não Aplica

**Solução**:
```bash
# Verificar connection string
cat src/Celebre.Api/appsettings.json | grep ConnectionStrings -A 2

# Testar conexão
docker-compose exec db psql -U celebre -d celebre_db -c "SELECT 1;"

# Forçar recreation
dotnet ef database drop --force --startup-project ../Celebre.Api
dotnet ef database update --startup-project ../Celebre.Api
```

---

## 📦 Variáveis de Ambiente

Você pode configurar via `.env` ou variáveis de ambiente:

```bash
# Database
DATABASE_URL="Host=localhost;Port=5432;Database=celebre_db;Username=celebre;Password=senha"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Logging
ASPNETCORE_ENVIRONMENT="Development"  # ou Production

# n8n (opcional)
N8N_BASE_URL="http://localhost:5678"
N8N_API_KEY="sua-api-key"

# WhatsApp Cloud API (opcional)
WHATSAPP_ACCESS_TOKEN="seu-token"
WHATSAPP_PHONE_NUMBER_ID="seu-numero-id"
```

---

## 🌐 Integração com Frontend Next.js

### Opção A: Gerar Cliente TypeScript

```bash
# Com API rodando
cd celebra-mvp

# Gerar cliente
npx nswag openapi2tsclient \
  /input:http://localhost:5000/swagger/v1/swagger.json \
  /output:src/lib/api/celebre-client.ts
```

### Opção B: Usar fetch diretamente

```typescript
// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getGuests(eventId: string) {
  const res = await fetch(`${API_URL}/api/events/${eventId}/guests`);
  return res.json();
}
```

Configurar `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚢 Deploy em Produção

### Docker Compose (Simples)

```bash
# 1. Configurar .env
cp .env.example .env
nano .env  # Editar variáveis

# 2. Build e start
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 3. Aplicar migrations
docker-compose exec api dotnet ef database update
```

### Kubernetes (Avançado)

```bash
# 1. Build da imagem
docker build -t celebre-api:latest .

# 2. Push para registry
docker tag celebre-api:latest your-registry/celebre-api:latest
docker push your-registry/celebre-api:latest

# 3. Deploy
kubectl apply -f k8s/
```

### Azure App Service

```bash
# 1. Login
az login

# 2. Create resources
az group create --name celebre-rg --location brazilsouth
az postgres server create --name celebre-db --resource-group celebre-rg --location brazilsouth --sku-name B_Gen5_1

# 3. Deploy
az webapp up --name celebre-api --resource-group celebre-rg --runtime "DOTNET:8.0"
```

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
# Docker
docker-compose logs -f api

# Local
tail -f logs/celebre-*.log
```

### Health Check

```bash
# Simples
curl http://localhost:5000/health

# Watch (a cada 5s)
watch -n 5 curl -s http://localhost:5000/health | jq
```

### Métricas

```bash
# Conectar ao banco
docker-compose exec db psql -U celebre -d celebre_db

# Ver contagens
SELECT
  (SELECT COUNT(*) FROM events) as total_events,
  (SELECT COUNT(*) FROM guests) as total_guests,
  (SELECT COUNT(*) FROM checkins) as total_checkins;
```

---

## 🎯 Próximos Passos

1. ✅ **Rodar API** - Seguir este guia
2. ✅ **Testar endpoints** - Via Swagger
3. ✅ **Integrar frontend** - Gerar cliente TypeScript
4. ✅ **Implementar testes** - Criar testes unitários
5. ✅ **Deploy** - Escolher plataforma

---

## 📞 Suporte

**Issues**: Criar issue no GitHub
**Documentação Completa**: Ver README.md
**Guia de Implementação**: Ver IMPLEMENTATION_GUIDE.md

---

**Tempo estimado de setup**: 5-10 minutos ⚡
**Status**: ✅ Produção-Ready
