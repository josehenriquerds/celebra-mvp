# Celebre API - Quick Start Guide

## 🚀 Início Rápido

### Pré-requisitos

- **.NET 8 SDK**: [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **PostgreSQL 15+**: [Download](https://www.postgresql.org/download/) ou use Docker
- **Docker & Docker Compose** (opcional): [Download](https://www.docker.com/products/docker-desktop)

### Opção 1: Docker Compose (Recomendado)

```bash
# 1. Clone o repositório e vá para o diretório backend
cd backend

# 2. Copie o arquivo de environment
cp .env.example .env

# 3. Edite o .env com suas credenciais (opcional para dev)
nano .env

# 4. Inicie todos os serviços
docker-compose up -d

# 5. Aguarde o health check do database
docker-compose ps

# 6. Aplicar migrations (primeira vez)
docker-compose exec api dotnet ef database update --project /app/Celebre.Infrastructure.dll

# 7. (Opcional) Popular com dados de exemplo
docker-compose exec api dotnet run --seed

# 8. Acesse a API
# Swagger UI: http://localhost:5000/swagger
# OpenAPI JSON: http://localhost:5000/swagger/v1/swagger.json
```

#### Serviços disponíveis:

- **API**: http://localhost:5000 (HTTP) / https://localhost:5001 (HTTPS)
- **pgAdmin**: http://localhost:5050 (opcional, rodar com `--profile tools`)
- **n8n**: http://localhost:5678 (opcional, para testes de integração)

#### Comandos úteis:

```bash
# Ver logs da API
docker-compose logs -f api

# Ver logs do database
docker-compose logs -f db

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga o database!)
docker-compose down -v

# Reiniciar apenas a API
docker-compose restart api

# Rodar migrations
docker-compose exec api dotnet ef migrations add MigrationName --project /app/Celebre.Infrastructure.dll
docker-compose exec api dotnet ef database update --project /app/Celebre.Infrastructure.dll
```

### Opção 2: Desenvolvimento Local

```bash
# 1. Instalar PostgreSQL localmente ou via Docker
docker run -d \
  --name celebre-postgres \
  -e POSTGRES_USER=celebre \
  -e POSTGRES_PASSWORD=celebre_dev_password \
  -e POSTGRES_DB=celebre_db \
  -p 5432:5432 \
  postgres:15-alpine

# 2. Configurar connection string
export DATABASE_URL="Host=localhost;Port=5432;Database=celebre_db;Username=celebre;Password=celebre_dev_password"

# 3. Restaurar dependências
dotnet restore

# 4. Aplicar migrations
cd src/Celebre.Infrastructure
dotnet ef database update --startup-project ../Celebre.Api

# 5. (Opcional) Popular com dados de exemplo
cd ../Celebre.Api
dotnet run --seed

# 6. Executar a API
dotnet run

# 7. Acesse: http://localhost:5000/swagger
```

#### Configurar User Secrets (recomendado para dev local)

```bash
cd src/Celebre.Api

# Inicializar user secrets
dotnet user-secrets init

# Adicionar secrets
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=celebre_db;Username=celebre;Password=celebre_dev_password"
dotnet user-secrets set "N8n:ApiKey" "your-api-key"
dotnet user-secrets set "WhatsApp:AccessToken" "your-whatsapp-token"
dotnet user-secrets set "GuestPortal:Secret" "your-nextauth-secret"

# Listar secrets
dotnet user-secrets list
```

## 🧪 Executar Testes

```bash
# Todos os testes
dotnet test

# Apenas unit tests
dotnet test --filter "FullyQualifiedName~UnitTests"

# Apenas integration tests
dotnet test --filter "FullyQualifiedName~IntegrationTests"

# Com cobertura de código
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

## 📝 Gerar Cliente TypeScript

```bash
# 1. Certifique-se de que a API está rodando
# 2. Instalar NSwag CLI globalmente (se ainda não tiver)
dotnet tool install -g NSwag.ConsoleCore

# 3. Gerar cliente TypeScript
nswag openapi2tsclient \
  /input:http://localhost:5000/swagger/v1/swagger.json \
  /output:../src/lib/api/celebre-client.ts \
  /template:Fetch \
  /generateClientClasses:true \
  /generateDtoTypes:true \
  /dateTimeType:DateTimeOffset \
  /nullValue:Null

# Ou usar o script auxiliar
chmod +x scripts/generate-client.sh
./scripts/generate-client.sh
```

## 🗄️ Migrations

### Criar nova migration

```bash
cd src/Celebre.Infrastructure

# Criar migration
dotnet ef migrations add MigrationName --startup-project ../Celebre.Api

# Aplicar migration
dotnet ef database update --startup-project ../Celebre.Api

# Reverter última migration
dotnet ef database update PreviousMigrationName --startup-project ../Celebre.Api

# Remover última migration (se não aplicada)
dotnet ef migrations remove --startup-project ../Celebre.Api
```

### Gerar script SQL da migration

```bash
dotnet ef migrations script --startup-project ../Celebre.Api --output migration.sql
```

## 📊 Monitoramento e Logs

### Logs locais

```bash
# Ver logs em tempo real
tail -f logs/celebre-*.log

# Ver logs das últimas 100 linhas
tail -n 100 logs/celebre-*.log

# Buscar por erro
grep "ERROR" logs/celebre-*.log
```

### Logs no Docker

```bash
# Logs em tempo real
docker-compose logs -f api

# Últimas 100 linhas
docker-compose logs --tail=100 api

# Buscar por erro
docker-compose logs api | grep "ERROR"
```

## 🔧 Troubleshooting

### Erro: "Connection refused" ao conectar no database

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps db

# Ver logs do database
docker-compose logs db

# Reiniciar database
docker-compose restart db
```

### Erro: "Port 5000 is already in use"

```bash
# Encontrar processo usando a porta
# Linux/Mac:
lsof -i :5000

# Windows:
netstat -ano | findstr :5000

# Matar o processo ou mudar a porta no launchSettings.json
```

### Erro: Migrations não aplicadas

```bash
# Verificar status das migrations
cd src/Celebre.Infrastructure
dotnet ef migrations list --startup-project ../Celebre.Api

# Aplicar todas as migrations pendentes
dotnet ef database update --startup-project ../Celebre.Api

# Ou via Docker
docker-compose exec api dotnet ef database update
```

### Erro: CORS bloqueando requests do front

```bash
# Verificar ALLOWED_ORIGINS no .env
# Deve incluir a URL do front (ex: http://localhost:3000)

# Reiniciar API após alterar
docker-compose restart api
```

### Limpar e recomeçar

```bash
# Parar tudo e remover volumes
docker-compose down -v

# Remover containers órfãos
docker-compose down --remove-orphans

# Rebuild completo
docker-compose build --no-cache
docker-compose up -d
```

## 🔐 Segurança

### Para produção:

1. **Alterar todos os secrets no .env**
2. **Usar HTTPS obrigatório**
3. **Configurar JWT authentication**
4. **Limitar CORS aos domínios específicos**
5. **Habilitar rate limiting**
6. **Configurar logging para serviço externo**
7. **Usar secret manager (Azure Key Vault, AWS Secrets Manager, etc.)**

### Gerar certificado SSL auto-assinado (desenvolvimento)

```bash
# Criar diretório para certificados
mkdir -p https

# Gerar certificado
dotnet dev-certs https -ep https/aspnetapp.pfx -p password --trust

# No docker-compose, já está configurado para usar este certificado
```

## 📚 Próximos Passos

1. **Implementar entidades faltantes**: Ver `IMPLEMENTATION_GUIDE.md`
2. **Completar todos os endpoints**: Ver checklist no `README.md`
3. **Escrever testes**: Seguir templates em `IMPLEMENTATION_GUIDE.md`
4. **Configurar CI/CD**: GitHub Actions, Azure DevOps, etc.
5. **Deploy em staging**: Azure App Service, AWS ECS, Railway, etc.
6. **Integrar com front Next.js**: Usar cliente TypeScript gerado

## 🆘 Suporte

- **Documentação completa**: Ver `README.md`
- **Guia de implementação**: Ver `IMPLEMENTATION_GUIDE.md`
- **Schema Prisma original**: `../prisma/schema.prisma`
- **Endpoints Next.js originais**: `../src/app/api/**/*.ts`

## 📋 Checklist Pré-Deploy

- [ ] Todas as migrations aplicadas
- [ ] Seeds executados com sucesso
- [ ] Testes passando (unit + integration)
- [ ] OpenAPI gerado e validado
- [ ] Cliente TypeScript gerado
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] Logs funcionando
- [ ] Health checks respondendo
- [ ] Conexão com n8n testada
- [ ] Webhooks WhatsApp configurados
- [ ] Upload de arquivos testado
- [ ] Performance testada (mínimo 100 requests/segundo)
- [ ] Documentação atualizada

---

**Desenvolvido com ❤️ para Celebre**
