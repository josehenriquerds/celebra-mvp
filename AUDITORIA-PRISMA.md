# 📋 Auditoria de Uso do Prisma no Frontend

## ❌ Problema Identificado

O projeto possui **42 arquivos** com uso direto do Prisma no frontend Next.js, violando a separação de responsabilidades e acoplando a camada de apresentação ao banco de dados.

## 📍 Arquivos Afetados

### 🔴 **Rotas API do Next.js (BFF Anti-pattern)**
Estes arquivos usam Prisma diretamente como "proxy" ao banco:

#### **Vendors (Fornecedores)**
- `src/app/api/vendors/route.ts` - CRUD de fornecedores
- `src/app/api/vendors/[id]/route.ts` - Detalhes/Update/Delete
- `src/app/api/vendors/apply/route.ts` - Aplicação de parceiro
- `src/app/api/vendor-partners/[id]/route.ts` - Gestão de parceiros
- `src/app/api/vendor-partners/[id]/status/route.ts` - Mudança de status
- `src/app/api/vendor-partners/[id]/note/route.ts` - Notas
- `src/app/api/vendor-partners/public/[slug]/route.ts` - Página pública

#### **Events (Eventos)**
- `src/app/api/events/[id]/timeline/route.ts` - Timeline do evento
- `src/app/api/events/[id]/segments/route.ts` - Segmentos
- `src/app/api/events/[id]/segments/preview/route.ts` - Preview de segmentos
- `src/app/api/events/[id]/vendors/route.ts` - Fornecedores do evento
- `src/app/api/events/[id]/guests/route.ts` - Convidados
- `src/app/api/events/[id]/gifts/route.ts` - Presentes
- `src/app/api/events/[id]/groups/route.ts` - Grupos
- `src/app/api/events/[id]/groups/[groupId]/route.ts` - Detalhes do grupo
- `src/app/api/events/[id]/groups/[groupId]/assign/route.ts` - Atribuição
- `src/app/api/events/[id]/reports/route.ts` - Relatórios
- `src/app/api/events/[id]/settings/route.ts` - Configurações
- `src/app/api/events/[id]/summary/route.ts` - Resumo
- `src/app/api/events/[id]/tables/route.ts` - Mesas
- `src/app/api/events/[id]/tasks/route.ts` - Tarefas
- `src/app/api/events/[id]/checkins/route.ts` - Check-ins

#### **Guests (Convidados)**
- `src/app/api/guests/[id]/route.ts` - CRUD de convidado
- `src/app/api/guests/[id]/timeline/route.ts` - Timeline do convidado
- `src/app/api/guest-portal/[token]/route.ts` - Portal do convidado
- `src/app/api/guest-portal/[token]/export/route.ts` - Export de dados
- `src/app/api/guest-portal/[token]/opt-out/route.ts` - Opt-out

#### **Gifts (Presentes)**
- `src/app/api/gifts/[id]/route.ts` - CRUD de presente
- `src/app/api/gifts/[id]/offers/route.ts` - Ofertas de presentes

#### **Tables/Seats (Mesas/Assentos)**
- `src/app/api/tables/[id]/route.ts` - CRUD de mesa
- `src/app/api/tables/[id]/assign/route.ts` - Atribuição de mesa
- `src/app/api/seats/[id]/unassign/route.ts` - Desatribuir assento

#### **Segments (Segmentos)**
- `src/app/api/segments/[id]/route.ts` - CRUD de segmento
- `src/app/api/segments/[id]/send/route.ts` - Envio de mensagens

#### **Check-ins**
- `src/app/api/checkins/route.ts` - Gestão de check-ins

#### **Webhooks**
- `src/app/api/webhooks/whatsapp/route.ts` - Webhook WhatsApp

### 🟡 **Server Utilities (Lógica de Negócio no Front)**
- `src/server/gifts/offers.ts` - Lógica de ofertas de presentes
- `src/server/gifts/serializer.ts` - Serialização de gifts
- `src/lib/segment-engine.ts` - Engine de segmentação
- `src/lib/vendor-utils.ts` - Utilidades de vendors
- `src/lib/vendor-suggestions.ts` - Sugestões de vendors

### 🔵 **Prisma Client**
- `src/lib/prisma.ts` - Cliente Prisma singleton

## 🎯 Estratégia de Migração

### **Fase 1: Análise do Backend .NET** ✅
- [x] Backend possui estrutura Clean Architecture
- [x] Endpoints REST já implementados em `Celebre.Api`
- [x] DTOs e validação com FluentValidation
- [x] Base URL: `http://localhost:5000/api` (ou env `NEXT_PUBLIC_API_URL`)

### **Fase 2: Criar Camada HTTP Client**
1. **API Client** (`src/lib/apiClient.ts`)
   - Axios/ky com interceptores
   - Auth Bearer token
   - Normalização de erros
   - Retry strategy

2. **Services por Domínio**
   - `src/services/events.ts`
   - `src/services/guests.ts`
   - `src/services/gifts.ts`
   - `src/services/vendors.ts`
   - `src/services/tables.ts`
   - `src/services/tasks.ts`
   - `src/services/checkins.ts`
   - `src/services/segments.ts`
   - `src/services/notifications.ts`

### **Fase 3: TanStack Query Hooks**
Criar hooks com query keys estáveis:

```typescript
// Exemplo
useEvent(eventId) -> ['event', eventId]
useGuests(eventId, filters) -> ['guests', eventId, filters]
useGifts(eventId) -> ['gifts', eventId]
useTables(eventId) -> ['tables', eventId]
```

### **Fase 4: Migração por Módulo**
1. Home/Dashboard
2. Calendário/Tarefas
3. Convidados + Perfil
4. Presentes (Gifts)
5. Planner de Mesas
6. Fornecedores
7. Check-ins
8. Notificações

### **Fase 5: Remoção das Rotas API Next.js**
Após migração completa, remover:
- Toda pasta `src/app/api/*` (exceto webhooks se necessário)
- `src/server/*`
- `src/lib/prisma.ts`

## 📊 Métricas

| Categoria | Quantidade |
|-----------|-----------|
| Rotas API com Prisma | 38 |
| Server Utils com Prisma | 5 |
| Total de Arquivos | 42 |
| Módulos a Migrar | 9 |

## ⚠️ Riscos Identificados

1. **Sem autenticação unificada** - Implementar Bearer token + NextAuth
2. **Cache desatualizado** - TanStack Query resolverá
3. **Inconsistência de tipos** - Criar DTOs do backend no front
4. **Perda de funcionalidade** - Testar cada módulo após migração

## ✅ Próximos Passos

1. ✅ Criar `MAPA-ENDPOINTS.md` com todos os contratos
2. ⏳ Implementar API Client
3. ⏳ Criar Services
4. ⏳ Criar Hooks TanStack Query
5. ⏳ Migrar componentes módulo por módulo
6. ⏳ Testes E2E críticos
7. ⏳ Remover código Prisma do frontend
