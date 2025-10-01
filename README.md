# 🎉 Celebre - Event CRM MVP

**Um CRM de eventos centrado em WhatsApp para casamentos, aniversários e celebrações especiais.**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Instalação](#-instalação)
- [Modelo de Dados](#-modelo-de-dados)
- [APIs](#-apis)
- [Workflows n8n](#-workflows-n8n)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Estrutura do Projeto](#-estrutura-do-projeto)

---

## 🎯 Visão Geral

Celebre é uma plataforma completa de gerenciamento de eventos que centraliza toda a comunicação via WhatsApp, oferecendo:

- **Dashboard Interativo** com KPIs em tempo real
- **Gestão Inteligente de Convidados** com filtros dinâmicos e perfil 360°
- **Planner de Mesas** com drag-and-drop visual
- **Automação via WhatsApp** (convites, RSVP, lembretes, check-in)
- **Score de Engajamento** para priorizar comunicações
- **Lista de Presentes Integrada**
- **Timeline Unificada** de todas as interações
- **Relatórios e BI** com gráficos interativos
- **Conformidade LGPD** (opt-in/opt-out, portabilidade)

---

## ✨ Funcionalidades

### 🏠 Dashboard
**O que é:** Visão geral do evento com cards de KPIs principais.

**Como funciona:**
- Endpoint: `GET /api/events/:id/summary`
- Resposta em < 300ms com cache
- Cards: Welcome, RSVPs, Detalhes da Cerimônia, Progresso de Tarefas, Orçamento, Chat com Céle, Countdown

**Exemplo de Resposta:**
\`\`\`json
{
  "title": "Casamento Ana & Pedro",
  "dateTime": "2025-08-15T17:00:00Z",
  "rsvps": {
    "sim": 45,
    "nao": 10,
    "talvez": 5,
    "pendente": 60
  },
  "budget": {
    "total": 80000,
    "spent": 32500
  },
  "progress": 0.45,
  "nextTasks": [
    {
      "title": "Enviar convites digitais",
      "dueAt": "2025-10-01T12:00:00Z",
      "status": "em_andamento"
    }
  ]
}
\`\`\`

---

### 👥 Lista de Convidados
**O que é:** DataTable com filtros por chips (Confirmados, VIP, Crianças, Pendentes).

**Como funciona:**
- Endpoint: `GET /api/events/:id/guests?filter=vip|children|pending&search=nome`
- Paginação: 50 itens por página
- Busca full-text por nome, telefone, email
- Ações em massa: enviar template WhatsApp, exportar CSV

**Exemplo de Ação em Massa (Envio de Template):**
\`\`\`json
POST /api/events/:id/send-invites
{
  "guestIds": ["guest_001", "guest_002"],
  "templateId": "convite_padrao",
  "variables": {
    "event_title": "Casamento Ana & Pedro",
    "date": "15 de Agosto de 2025",
    "time": "17:00",
    "venue": "Quinta do Lago"
  }
}
\`\`\`

**Critérios de Aceite:**
- ✅ Seleção múltipla de convidados
- ✅ Filtros por status, VIP, crianças
- ✅ Busca com debounce de 300ms
- ✅ Export CSV completo
- ✅ Render < 300ms para 120 convidados

---

### 🔍 Perfil 360° do Convidado
**O que é:** Visão completa do convidado em um drawer/modal lateral.

**Abas:**
1. **Dados Gerais:** Nome, telefone, email, relação, restrições alimentares
2. **Timeline:** RSVP, mensagens enviadas/recebidas, presentes, check-ins
3. **Assentos:** Mesa alocada e posição visual
4. **Engajamento:** Score e tier (Bronze/Prata/Ouro)
5. **Consentimento:** Logs de opt-in/opt-out

**Endpoints:**
\`\`\`
GET /api/guests/:id
GET /api/guests/:id/timeline
PATCH /api/guests/:id
\`\`\`

**Exemplo de Edição:**
\`\`\`json
PATCH /api/guests/guest_001
{
  "restrictions_json": {
    "gluten_free": true,
    "note": "Alérgico a amendoim"
  },
  "rsvp": "sim",
  "seats": 2
}
\`\`\`

**Timeline Entry:**
\`\`\`json
{
  "type": "rsvp",
  "actorType": "guest",
  "occurredAt": "2025-09-20T10:30:00Z",
  "metaJson": {
    "contact": "João Silva",
    "oldValue": "pendente",
    "newValue": "sim"
  }
}
\`\`\`

---

### 🏷️ Segmentação Dinâmica
**O que é:** Grupos automáticos baseados em regras (ex: "VIP Confirmados").

**Como funciona:**
- Tabela \`segment_tag\` com \`rule_json\` (DSL simples)
- Reprocessamento via cron (n8n) a cada 5 minutos
- Usado para disparos segmentados

**Exemplo de Regra:**
\`\`\`json
{
  "name": "VIP Confirmados",
  "rule": "rsvp == 'sim' AND is_vip == true",
  "isDynamic": true
}
\`\`\`

**Outros Exemplos:**
- \`"children > 0"\` → Famílias com Crianças
- \`"rsvp == 'pendente' AND invite_status == 'lido'"\` → Leram mas não responderam
- \`"restrictions_json != null"\` → Com Restrições Alimentares

---

### 📊 Score de Engajamento
**O que é:** Pontuação automática de interações para priorizar comunicações.

**Fórmula:**
\`\`\`
+10 pontos → RSVP confirmado
+6 pontos → Foto enviada
+4 pontos → Clique em link
+2 pontos → Mensagem livre
-5 pontos → Opt-out
Decaimento: -1 ponto/dia (mínimo 0)
\`\`\`

**Tiers:**
- 🥉 **Bronze:** 0-24 pontos
- 🥈 **Prata:** 25-49 pontos
- 🥇 **Ouro:** 50+ pontos

**Técnico:**
- View materializada \`vw_engagement_scores\`
- Atualização via trigger n8n (webhook de interação)
- Visível como badge no perfil e na lista

---

### 🪑 Planner de Mesas (Drag & Drop)
**O que é:** Organizador visual de convidados em mesas com cadeiras.

**Tecnologias:**
- **dnd-kit** para drag-and-drop
- **Canvas HTML5** com zoom/pan (pinch no mobile)
- **dom-to-image** para export PNG

**Interações:**
1. **Lista Lateral:** Famílias (households) com contador de membros
2. **Canvas:** Mesas (round/rect) e cadeiras posicionadas
3. **Drag:** Arrasta pessoa da lista → solta em cadeira livre
4. **Auto-Alocar:** Heurística inteligente (VIPs perto da mesa principal, famílias juntas)
5. **Alertas:** Mesa cheia, cadeira ocupada, família fragmentada

**Heurística de Auto-Alocação:**
\`\`\`typescript
function autoAllocate(families, tables) {
  // 1. Ordenar famílias por tamanho (maiores primeiro)
  const sorted = families.sort((a, b) => b.size - a.size)

  // 2. VIPs na Mesa Principal
  const vips = sorted.filter(f => f.members.some(m => m.isVip))
  allocate(vips[0], tables.find(t => t.label === 'Mesa Principal'))

  // 3. Preencher mesas restantes por proximidade
  let tableIndex = 1
  for (const family of sorted.slice(1)) {
    const table = tables[tableIndex]
    if (table.availableSeats >= family.size) {
      allocate(family, table)
    } else {
      tableIndex++
    }
  }
}
\`\`\`

**Dados Salvos:**
\`\`\`json
{
  "tables": [
    {
      "id": "table_001",
      "label": "Mesa Principal",
      "shape": "round",
      "capacity": 10,
      "x": 400,
      "y": 200,
      "rotation": 0
    }
  ],
  "assignments": [
    {
      "guestId": "guest_ana",
      "seatId": "table_001_seat_3",
      "locked": false
    }
  ]
}
\`\`\`

**Acessibilidade:**
- ✅ Navegação por teclado (Tab, Setas, Enter para alocar)
- ✅ Foco visível em cadeiras
- ✅ Anúncio de ações via ARIA live regions

**Performance:**
- ✅ 100 convidados / 10 mesas a ~60fps
- ✅ Autosave com debounce de 1s

---

### 📋 Tarefas & SLA
**O que é:** Kanban de tarefas com lembretes automáticos via WhatsApp.

**Status:** Aberta → Em Andamento → Concluída / Atrasada

**SLA (Badges):**
- 🟢 Verde: > 24h restantes
- 🟡 Amarelo: 8-24h restantes
- 🔴 Vermelho: Vencida

**Exemplo de Criação:**
\`\`\`json
POST /api/tasks
{
  "eventId": "event_001",
  "title": "Negociar com DJ",
  "assigneeUserId": "user_001",
  "dueAt": "2025-10-15T17:00:00Z",
  "slaHours": 48,
  "relatedVendorId": "vendor_003"
}
\`\`\`

**Workflow n8n:**
- Cron a cada hora
- Se \`(dueAt - now) < slaHours\` → Enviar lembrete WhatsApp
- Log na timeline

---

### 🎁 Lista de Presentes
**Status:** Disponível → Reservado → Comprado

**Fluxo:**
1. Convidado vê lista no WhatsApp (link do convite)
2. Clica em presente → Status = "reservado"
3. Confirma compra → Status = "comprado"
4. n8n envia agradecimento automático

**Exemplo de Item:**
\`\`\`json
{
  "id": "gift_001",
  "title": "Jogo de Panelas Tramontina",
  "link": "https://loja.com/panelas",
  "price": 800,
  "status": "comprado",
  "buyerContactId": "contact_001"
}
\`\`\`

---

### 📈 Relatórios & BI
**Gráficos Implementados:**
1. **RSVP vs Presença Real** (bar chart)
2. **Mensagens por Dia** (line chart)
3. **Custo por Convidado** (donut)
4. **Conversão de Presentes** (progress bar)

**Tecnologia:** Recharts + queries agregadas

**Endpoint:**
\`\`\`
GET /api/events/:id/reports?type=rsvp_vs_checkin
\`\`\`

**Resposta:**
\`\`\`json
[
  { "date": "2025-09-20", "messages": 134 },
  { "date": "2025-09-21", "messages": 87 },
  { "date": "2025-09-22", "messages": 156 }
]
\`\`\`

---

### 🔐 LGPD: Consentimento & Opt-out
**Fluxos:**
1. **Opt-out via WhatsApp:** Comando "PARAR" ou "SAIR"
2. **Registro de Consentimento:** Form com texto completo aceito
3. **Portabilidade:** Export JSON de todos os dados do contato
4. **Direito ao Esquecimento:** Delete completo (soft delete)

**Tabela \`consent_log\`:**
\`\`\`json
{
  "contactId": "contact_001",
  "source": "whatsapp",
  "action": "opt_out",
  "text": "PARAR",
  "createdAt": "2025-09-29T22:00:00Z"
}
\`\`\`

**Badge no Perfil 360°:**
\`\`\`tsx
{guest.optOut && (
  <Badge variant="destructive">
    Opt-out - Não enviar mensagens
  </Badge>
)}
\`\`\`

---

## 🛠 Stack Tecnológica

### Frontend
- **Next.js 14** (App Router, Server Components)
- **React 18** + TypeScript
- **Tailwind CSS** + shadcn/ui (Design System)
- **dnd-kit** (Drag & Drop do Planner de Mesas)
- **Zustand** (Estado global de UI)
- **Recharts** (Gráficos de BI)
- **Framer Motion** (Animações)

### Backend
- **Next.js Route Handlers** (API Routes)
- **Prisma ORM** + PostgreSQL
- **Webhooks Públicos** para WhatsApp Cloud API

### Automação
- **n8n** (6 workflows principais)
- **WhatsApp Cloud API**
- **Cron Jobs** (segmentação, SLA, lembretes)

### Observabilidade
- **EventLog** (auditoria de ações)
- **PostHog** (telemetria - opcional)

### DevOps
- **Docker** + Docker Compose
- **Playwright** (Testes E2E)
- **GitHub Actions** (CI/CD - opcional)

---

## 🚀 Instalação

### Pré-requisitos
- **Node.js 18+**
- **PostgreSQL 14+** (ou Docker)
- **n8n** (via Docker ou Cloud)

### Passo a Passo

\`\`\`bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/celebre-mvp.git
cd celebre-mvp

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Configure o banco de dados
npx prisma generate
npx prisma migrate dev --name init

# 5. Popule com dados de exemplo
npm run db:seed

# 6. Inicie o servidor de desenvolvimento
npm run dev
\`\`\`

Acesse: **http://localhost:3000**

---

## 🗄 Modelo de Dados

### ERD (Entidade-Relacionamento)

\`\`\`
Event (1) ────< (N) Guest (N) >──── (1) Contact
                      │                    │
                      │                    ├──── (N) Interaction
                      │                    ├──── (1) EngagementScore
                      │                    └──── (N) ConsentLog
                      │
                      └──── (N) SeatAssignment (N) ──── (1) Seat (N) ──── (1) Table

Event (1) ────< (N) Task (N) >──── (1) Vendor
Event (1) ────< (N) GiftRegistryItem
Event (1) ────< (N) TimelineEntry
Event (1) ────< (N) SegmentTag
Event (1) ────< (N) MessageTemplate
Event (1) ────< (N) Checkin
Event (1) ────< (N) EventLog

Contact (1) ────< (N) Household
\`\`\`

### Principais Entidades

#### Event
\`\`\`prisma
model Event {
  id          String   @id @default(cuid())
  title       String
  dateTime    DateTime
  venueName   String
  address     String
  budgetTotal Float
  hosts       String[] // ["Ana Clara", "Pedro Henrique"]
}
\`\`\`

#### Contact
\`\`\`prisma
model Contact {
  id              String
  fullName        String
  phone           String @unique // Dedup por telefone
  email           String?
  relation        ContactRelation // familia|amigo|trabalho
  isVip           Boolean
  restrictionsJson Json? // { gluten_free: true, note: "..." }
  householdId     String?
}
\`\`\`

#### Guest
\`\`\`prisma
model Guest {
  id             String
  eventId        String
  contactId      String
  inviteStatus   InviteStatus // nao_enviado|enviado|entregue|lido
  rsvp           RsvpStatus   // pendente|sim|nao|talvez
  seats          Int
  children       Int
  transportNeeded Boolean
  optOut         Boolean
}
\`\`\`

#### Table & Seat
\`\`\`prisma
model Table {
  id       String
  eventId  String
  label    String // "Mesa Principal"
  capacity Int
  x        Float // Canvas position
  y        Float
  rotation Float
  shape    TableShape // round|square|rect
}

model Seat {
  id      String
  tableId String
  index   Int    // Seat number (0-based)
  x       Float  // Relative to table center
  y       Float
  rotation Float
}

model SeatAssignment {
  id      String
  guestId String
  seatId  String @unique // One guest per seat
  locked  Boolean // Prevent auto-reassignment
}
\`\`\`

---

## 📡 APIs

### Eventos

#### GET /api/events/:id/summary
Retorna resumo do evento com KPIs.

**Resposta:**
\`\`\`json
{
  "title": "Casamento Ana & Pedro",
  "dateTime": "2025-08-15T17:00:00Z",
  "rsvps": { "sim": 45, "nao": 10, "talvez": 5, "pendente": 60 },
  "budget": { "total": 80000, "spent": 32500 },
  "progress": 0.45,
  "nextTasks": [...]
}
\`\`\`

---

### Convidados

#### GET /api/events/:id/guests
Lista paginada com filtros.

**Query Params:**
- \`filter\`: \`vip|children|pending|confirmed|no_phone\`
- \`search\`: busca por nome/telefone/email
- \`page\`: número da página (default: 1)
- \`limit\`: itens por página (default: 50)

#### GET /api/guests/:id
Perfil completo de um convidado.

#### PATCH /api/guests/:id
Atualiza dados do convidado.

#### GET /api/guests/:id/timeline
Timeline de interações.

---

### Mesas

#### GET /api/events/:id/tables
Lista todas as mesas e assentos do evento.

#### POST /api/events/:id/tables
Cria nova mesa.

#### PATCH /api/tables/:id
Atualiza posição/shape da mesa.

#### POST /api/tables/:id/assign
Aloca convidado em assento.

**Body:**
\`\`\`json
{
  "guestId": "guest_001",
  "seatIndex": 3,
  "locked": false
}
\`\`\`

---

### Webhooks

#### POST /api/webhooks/whatsapp
Recebe eventos do WhatsApp Cloud API.

**Body (exemplo de mensagem):**
\`\`\`json
{
  "source": "whatsapp",
  "type": "message",
  "contactPhone": "+5527999001001",
  "payload": {
    "messageId": "wamid.12345",
    "text": "SIM",
    "timestamp": 1727649600
  }
}
\`\`\`

**Processamento:**
1. Buscar contato por telefone
2. Se texto = "SIM" → Atualizar RSVP
3. Se texto = "PARAR" → Opt-out
4. Registrar interaction + atualizar engagement score
5. Criar timeline entry
6. Retornar 200 OK (idempotência via messageId)

---

## 🤖 Workflows n8n

### 1. Convite / RSVP
**Trigger:** Manual ou via API
**Passos:**
1. **Webhook** recebe lista de \`guestIds\`
2. **Postgres** busca dados de contatos
3. **WhatsApp Cloud API** envia template com botões [SIM/NÃO/TALVEZ]
4. **Webhook de Resposta** atualiza \`guest.rsvp\`
5. **Timeline Entry** registra ação
6. **Segment Update** reprocessa segmentos dinâmicos
7. **Engagement Score** +10 pontos

**Arquivo:** \`n8n/workflows/convite-rsvp.json\`

---

### 2. Lembretes Automáticos
**Trigger:** Cron (D-14, D-7, D-3)
**Passos:**
1. **Schedule:** \`0 9 * * *\` (9h diariamente)
2. **Postgres:** \`SELECT * FROM guests WHERE rsvp = 'pendente' AND event.dateTime - NOW() IN (14, 7, 3) days\`
3. **WhatsApp:** Envia template \`lembrete_rsvp\`
4. **EventLog:** Registra envio

**Arquivo:** \`n8n/workflows/lembretes.json\`

---

### 3. Check-in via QR Code
**Trigger:** Webhook ao escanear QR
**Passos:**
1. **Webhook:** \`POST /n8n/webhook/checkin\` com \`{ guestId, eventId }\`
2. **Postgres:** \`INSERT INTO checkins\`
3. **WhatsApp:** Envia mensagem de boas-vindas
4. **Timeline Entry:** Registra check-in
5. **BI Update:** Incrementa contador de presença real

**Arquivo:** \`n8n/workflows/checkin-qr.json\`

---

### 4. Agradecimento por Presente
**Trigger:** Mudança de status \`gift_registry_item.status → 'comprado'\`
**Passos:**
1. **Postgres Trigger:** Notifica n8n
2. **Postgres:** Busca \`buyerContact\`
3. **WhatsApp:** Envia \`confirmacao_presente\` template
4. **Engagement Score:** +6 pontos
5. **Timeline Entry:** Registra presente

**Arquivo:** \`n8n/workflows/agradecimento-presente.json\`

---

### 5. SLA de Tarefas
**Trigger:** Cron a cada hora
**Passos:**
1. **Schedule:** \`0 * * * *\`
2. **Postgres:** \`SELECT * FROM tasks WHERE status != 'concluida' AND (dueAt - NOW()) < slaHours\`
3. **WhatsApp:** Notifica responsável
4. **Status Update:** \`atrasada\` se vencida

**Arquivo:** \`n8n/workflows/sla-tarefas.json\`

---

### 6. Comandos WhatsApp
**Trigger:** Webhook de mensagem
**Passos:**
1. **Webhook:** Recebe mensagem
2. **Switch:** Roteamento por comando
   - \`PARAR\` → Opt-out + ConsentLog
   - \`MESA\` → Responde com número da mesa
   - \`ENDEREÇO\` → Envia localização
   - \`HORÁRIO\` → Envia horário da cerimônia
3. **Postgres:** Atualiza dados conforme comando
4. **WhatsApp:** Envia resposta

**Arquivo:** \`n8n/workflows/comandos-whatsapp.json\`

---

## 🧪 Testes

### E2E com Playwright

**Instalação:**
\`\`\`bash
npx playwright install
\`\`\`

**Executar:**
\`\`\`bash
npm run test:e2e          # Headless
npm run test:e2e:ui       # Com UI
\`\`\`

**Testes Implementados:**

#### 1. RSVP Completo
\`\`\`typescript
// tests/rsvp-flow.spec.ts
test('fluxo completo de RSVP', async ({ page }) => {
  // 1. Navegar para lista de convidados
  await page.goto('/events/event_001/guests')

  // 2. Selecionar convidado pendente
  await page.click('[data-testid="guest-pendente-1"]')

  // 3. Abrir perfil 360°
  await expect(page.locator('[data-testid="guest-profile"]')).toBeVisible()

  // 4. Confirmar presença
  await page.selectOption('[data-testid="rsvp-select"]', 'sim')
  await page.click('[data-testid="save-rsvp"]')

  // 5. Verificar atualização na lista
  await expect(page.locator('[data-testid="rsvp-status-sim"]')).toBeVisible()

  // 6. Verificar timeline entry
  await page.click('[data-testid="tab-timeline"]')
  await expect(page.locator('text=RSVP confirmado')).toBeVisible()
})
\`\`\`

#### 2. Planner de Mesas
\`\`\`typescript
// tests/table-planner.spec.ts
test('arrasto, auto-alocar e exportar', async ({ page }) => {
  await page.goto('/events/event_001/tables')

  // Drag & Drop
  const guest = page.locator('[data-testid="guest-draggable-1"]')
  const seat = page.locator('[data-testid="seat-table1-3"]')
  await guest.dragTo(seat)

  // Verificar alocação
  await expect(seat).toHaveAttribute('data-occupied', 'true')

  // Auto-alocar
  await page.click('[data-testid="btn-auto-allocate"]')
  await expect(page.locator('[data-testid="alert-auto-complete"]')).toBeVisible()

  // Salvar
  await page.click('[data-testid="btn-save"]')
  await expect(page.locator('text=Salvo com sucesso')).toBeVisible()

  // Exportar PNG
  await page.click('[data-testid="btn-export-png"]')
  const download = await page.waitForEvent('download')
  expect(download.suggestedFilename()).toContain('.png')
})
\`\`\`

---

## 🐳 Deploy

### Docker

**Dockerfile:**
\`\`\`dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

**docker-compose.yml:**
\`\`\`yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: celebre
      POSTGRES_PASSWORD: celebre123
      POSTGRES_DB: celebre
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://celebre:celebre123@postgres:5432/celebre
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    volumes:
      - ./prisma:/app/prisma

  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      N8N_BASIC_AUTH_ACTIVE: true
      N8N_BASIC_AUTH_USER: admin
      N8N_BASIC_AUTH_PASSWORD: celebre123
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  postgres_data:
  n8n_data:
\`\`\`

**Executar:**
\`\`\`bash
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run db:seed
\`\`\`

---

## 📁 Estrutura do Projeto

\`\`\`
celebre-mvp/
├── prisma/
│   ├── schema.prisma          # Modelo de dados completo
│   └── seed.ts                # Dados de exemplo (2 eventos, 120 convidados)
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── events/[id]/
│   │   │   │   ├── page.tsx           # Dashboard principal
│   │   │   │   ├── guests/page.tsx    # Lista de convidados
│   │   │   │   ├── tables/page.tsx    # Planner de mesas
│   │   │   │   ├── tasks/page.tsx     # Kanban de tarefas
│   │   │   │   └── reports/page.tsx   # Relatórios & BI
│   │   ├── api/
│   │   │   ├── events/[id]/
│   │   │   │   ├── summary/route.ts
│   │   │   │   ├── guests/route.ts
│   │   │   │   ├── tables/route.ts
│   │   │   │   └── send-invites/route.ts
│   │   │   ├── guests/[id]/
│   │   │   │   ├── route.ts
│   │   │   │   └── timeline/route.ts
│   │   │   └── webhooks/
│   │   │       └── whatsapp/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx
│   │   │   ├── DonutProgress.tsx
│   │   │   └── StatCard.tsx
│   │   ├── guests/
│   │   │   ├── GuestTable.tsx
│   │   │   ├── GuestProfile360.tsx
│   │   │   └── EngagementBadge.tsx
│   │   └── tables/
│   │       ├── TableCanvas.tsx
│   │       ├── FamilyList.tsx
│   │       └── SeatDraggable.tsx
│   ├── lib/
│   │   ├── prisma.ts          # Client singleton
│   │   ├── utils.ts
│   │   └── whatsapp.ts        # WhatsApp API helpers
│   └── hooks/
│       └── use-toast.tsx
├── n8n/
│   └── workflows/
│       ├── convite-rsvp.json
│       ├── lembretes.json
│       ├── checkin-qr.json
│       ├── agradecimento-presente.json
│       ├── sla-tarefas.json
│       └── comandos-whatsapp.json
├── tests/
│   ├── rsvp-flow.spec.ts
│   └── table-planner.spec.ts
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
\`\`\`

---

## 📊 Dados de Seed

Ao executar \`npm run db:seed\`, você terá:

### Evento 1: "Casamento Ana & Pedro"
- **Data:** 15/08/2025 às 17:00
- **Local:** Quinta do Lago - Vitória/ES
- **Orçamento:** R$ 80.000
- **Convidados:** 120
  - 45 confirmados (sim)
  - 10 recusados (não)
  - 5 talvez
  - 60 pendentes
- **Famílias:** 10 (Silva, Costa, Almeida, Faculdade, Trabalho, Padrinhos, Vizinhos, Primos, Tios, Amigos de Infância)
- **Mesas:** 10 (80+ assentos)
- **30 convidados já alocados**
- **Tarefas:** 5 (concluídas, em andamento, abertas)
- **Fornecedores:** 4 (Buffet, Fotografia, DJ, Decoração)
- **Presentes:** 8 (3 comprados, 2 reservados, 3 disponíveis)
- **Interações:** 200+
- **Scores de Engajamento:** 20 (Bronze/Prata/Ouro)

### Evento 2: "Aniversário 15 Anos - Maria Eduarda"
- **Data:** 20/12/2025 às 19:00
- **Convidados:** 40

---

## 🎨 Design System

### Cores (CSS Variables)

\`\`\`css
:root {
  --bg: #FAF7F4;
  --card: #FFFFFF;
  --ink: #2A221F;
  --muted: #8E7B73;
  --accent: #F1D7C8;
  --accent-2: #EADFD7;
  --success: #DDF2E4;
  --danger: #FCE8E8;
  --brand: #863F44;
}
\`\`\`

### Tipografia
- **Base:** Inter / Lexend (16-18px)
- **Headings:** Playfair Display (24-28px)
- **Números:** Tabular (font-variant-numeric: tabular-nums)

### Componentes
- **Card:** \`rounded-2xl\` (~20px) + \`shadow-celebre\` (0 8px 24px rgba(0,0,0,0.06))
- **Button:** Suave, hover scale 1.02
- **Badge:** Tonal (Bronze/Prata/Ouro)
- **Progress:** Donut animado (Framer Motion)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: \`git checkout -b feature/nova-funcionalidade\`
3. Commit: \`git commit -m 'feat: adiciona nova funcionalidade'\`
4. Push: \`git push origin feature/nova-funcionalidade\`
5. Abra um Pull Request

---

## 📄 Licença

MIT © 2025 Celebre

---

## 📞 Suporte

- **Email:** suporte@celebre.app
- **WhatsApp:** +55 27 99684-3742
- **Docs:** https://docs.celebre.app

---

**Feito com ❤️ para transformar eventos em momentos inesquecíveis.**