# 📊 Progresso da Migração para API Backend

## ✅ Concluído

### 1. **Infraestrutura Base**
- [x] API Client (`src/lib/api-client.ts`)
  - Axios configurado com interceptores
  - Bearer token authentication (NextAuth)
  - Error normalization
  - Exponential retry (3 tentativas)
  - Circuit breaker pattern
  - Development logging

- [x] Type Definitions (`src/types/api.ts`)
  - 500+ linhas de interfaces TypeScript
  - Todos os DTOs do backend mapeados
  - Types para todos os 15 módulos principais

- [x] Query Client Configuration (`src/lib/query-client.ts`)
  - TanStack Query v5 configurado
  - Query keys factory padronizada
  - Configurações otimizadas de staleTime, gcTime, retry

### 2. **Camada de Serviços** (14/14 módulos)
- [x] `src/services/events.ts` - Eventos
- [x] `src/services/guests.ts` - Convidados
- [x] `src/services/gifts.ts` - Presentes (completo: gifts, categorias, contribuições, agradecimentos)
- [x] `src/services/tables.ts` - Mesas e layout
- [x] `src/services/tasks.ts` - Tarefas
- [x] `src/services/vendors.ts` - Fornecedores
- [x] `src/services/checkins.ts` - Check-ins
- [x] `src/services/segments.ts` - Segmentos
- [x] `src/services/templates.ts` - Templates de mensagens
- [x] `src/services/checklist.ts` - Checklist do dia
- [x] `src/services/logistics.ts` - Logística e localizações
- [x] `src/services/audit.ts` - Logs de auditoria
- [x] `src/services/permissions.ts` - Permissões e usuários
- [x] `src/services/notifications.ts` - Notificações
- [x] `src/services/reports.ts` - Relatórios e backup

### 3. **Hooks TanStack Query** (14/14 módulos - COMPLETO ✅)
- [x] `src/hooks/useEvents.ts` - Com optimistic updates
- [x] `src/hooks/useGuests.ts` - Com optimistic updates
- [x] `src/hooks/useGiftsApi.ts` - Completo (gifts + categorias + contribuições + agradecimentos)
- [x] `src/hooks/useTables.ts` - Com suporte a layout persistence (fix Planner bug)
- [x] `src/hooks/useTasks.ts` - Com suporte a drag-and-drop (fix Calendar bug)
- [x] `src/hooks/useVendors.ts` - Com optimistic updates
- [x] `src/hooks/useCheckins.ts` - Real-time updates (staleTime 5s)
- [x] `src/hooks/useSegments.ts` - Com preview de segmentação
- [x] `src/hooks/useTemplates.ts` - Com duplicação de templates
- [x] `src/hooks/useChecklist.ts` - Com optimistic updates
- [x] `src/hooks/useLogistics.ts` - Locations + logistics info
- [x] `src/hooks/useAudit.ts` - Logs históricos (cache 60s)
- [x] `src/hooks/usePermissions.ts` - Roles + event users
- [x] `src/hooks/useNotifications.ts` - Real-time (staleTime 10s)

### 4. **Páginas Migradas** (6/42 arquivos)
- [x] `src/app/events/[id]/page.tsx` - Dashboard/Home migrado
- [x] `src/app/events/[id]/guests/page.tsx` - Lista de convidados migrada
- [x] `src/app/events/[id]/guests/[guestId]/page.tsx` - **Perfil do convidado com timeline** ✅
- [x] `src/app/events/[id]/gifts/page.tsx` - Presentes migrado
- [x] `src/app/events/[id]/tasks/page.tsx` - **Calendário/Tarefas com drag-and-drop** ✅
- [x] `src/app/events/[id]/vendors/page.tsx` - **Fornecedores migrado** ✅

### 5. **Componentes Gift Cotão Criados** ✨
- [x] `ReserveCotaoModal` - Reservar cotas com valor total
- [x] `ConfirmPaymentModal` - Upload comprovante + Pix QR Code
- [x] `ThankYouModal` - Enviar agradecimento (WhatsApp/Email)

## ⏳ Pendente

### **Páginas a Migrar** (36 arquivos restantes)

#### Alta Prioridade (MVP Core)
- [ ] `src/app/events/[id]/tables/page.tsx` - Planner de mesas (usa hooks próprios, precisa refatorar)

#### Média Prioridade
- [ ] `src/app/events/[id]/gifts/categories/page.tsx` - Categorias
- [ ] `src/app/events/[id]/gifts/contributions/page.tsx` - Contribuições
- [ ] `src/app/events/[id]/gifts/thank-you/page.tsx` - Agradecimentos
- [ ] `src/app/events/[id]/checkins/page.tsx` - Check-ins
- [ ] `src/app/events/[id]/segments/page.tsx` - Segmentos

#### Baixa Prioridade
- [ ] `src/app/events/[id]/checklist/page.tsx` - Checklist
- [ ] `src/app/events/[id]/logistics/page.tsx` - Logística
- [ ] `src/app/events/[id]/templates/page.tsx` - Templates
- [ ] `src/app/events/[id]/audit/page.tsx` - Auditoria
- [ ] `src/app/events/[id]/permissions/page.tsx` - Permissões
- [ ] Demais rotas API em `src/app/api/*`

### **Remoção de Código Prisma** (42 arquivos)
Após migração completa:
- [ ] Deletar `src/lib/prisma.ts`
- [ ] Deletar `src/server/*` (5 arquivos)
- [ ] Deletar rotas BFF em `src/app/api/*` (38 arquivos)
  - Manter apenas webhooks essenciais

### **Correções de Bugs Específicos**
- [ ] **Planner**: Zoom lógico sem afetar hitbox
- [ ] **Planner**: Elementos de festa persistirem (já tem hook `useSaveTableLayout`)
- [ ] **Planner**: Template mesa dos noivos (já tem hook `useCreateBrideGroomTable`)
- [ ] **Gifts**: Fluxo completo reservar→pagar→confirmar→agradecer
- [x] **Calendar**: Drag-and-drop reagendamento ✅ (implementado com `useUpdateTask` + optimistic updates)

### **Testes**
- [ ] E2E tests (Playwright)
  - [ ] Gift flow completo
  - [ ] Planner drag-and-drop
  - [ ] Guest profile edit
  - [ ] Calendar reschedule
- [ ] Contract tests (Zod) para services

### **Qualidade & Tooling**
- [ ] TypeScript strict mode
- [ ] ESLint/Prettier review
- [ ] A11y improvements
- [ ] Error logging/telemetry setup

### **Documentação**
- [ ] `.env.example` atualizado
- [ ] Build instructions
- [ ] Relatório de correções (before/after bugs)

## 📈 Métricas

| Categoria | Concluído | Total | Progresso |
|-----------|-----------|-------|-----------|
| Infraestrutura | 3 | 3 | 100% ✅ |
| Services | 14 | 14 | 100% ✅ |
| Hooks TanStack | 14 | 14 | 100% ✅ |
| Páginas Migradas | 6 | 42 | 14% 🔴 |
| Componentes Gift Cotão | 3 | 3 | 100% ✅ |
| Bugs Críticos Fixados | 1 | 5 | 20% 🔴 |
| **Total Geral** | **41** | **81** | **51%** 🟡 |

## 🎯 Próximos Passos Recomendados

### **Fase 1**: ~~Completar Hooks~~ ✅ CONCLUÍDO
~~1. Criar hooks faltantes para vendors, checkins, segments, templates~~
~~2. Criar hooks para módulos novos (checklist, logistics, audit, permissions, notifications)~~

### **Fase 2**: Migrar Páginas Críticas (Priority: HIGH) - EM ANDAMENTO
1. ~~Dashboard/Home (event summary)~~ ✅
2. ~~Guests list~~ ✅ + profile (pendente)
3. Tables planner (próximo)
4. Calendar/Tasks (pendente)

### **Fase 3**: Testar Fluxos Críticos (Priority: HIGH)
1. Gift flow end-to-end
2. Planner persistence
3. Calendar drag-and-drop

### **Fase 4**: Migrar Páginas Secundárias (Priority: MEDIUM)
1. Gift categories/contributions/thank-you
2. Vendors
3. Segments
4. Checkins

### **Fase 5**: Cleanup (Priority: LOW)
1. Remover código Prisma
2. Remover BFF routes
3. Documentação final
4. E2E tests completos

## 💡 Notas Importantes

### **Features Já Implementadas nos Hooks**
- ✅ Optimistic updates com rollback automático
- ✅ Cache invalidation inteligente
- ✅ Retry automático com exponential backoff
- ✅ Type safety end-to-end
- ✅ Support para drag-and-drop (tasks, calendar)
- ✅ Support para layout persistence (planner)

### **Estrutura dos Query Keys**
Todos seguem padrão consistente:
```typescript
queryKeys.{domain}.all(entityId)
queryKeys.{domain}.detail(itemId)
queryKeys.{domain}.filtered(entityId, filters)
```

### **Pattern de Mutations**
Todas as mutations seguem:
1. onMutate: Optimistic update
2. onError: Rollback
3. onSettled: Invalidate queries
4. Return context for rollback

### **Backend Compatibility**
- Base URL: `http://localhost:5000/api` (ou `NEXT_PUBLIC_API_URL`)
- Auth: Bearer token via NextAuth
- Error format: `{ code, message, details, statusCode }`
- Todos endpoints documentados em `MAPA-ENDPOINTS.md`

## 🚀 Como Usar os Hooks

### Exemplo: Gifts Page
```typescript
import { useGiftsApi, useCreateGiftApi } from '@/hooks/useGiftsApi'

function GiftsPage() {
  const eventId = 'event-123'
  const { data: gifts, isLoading } = useGiftsApi(eventId)
  const createMutation = useCreateGiftApi(eventId)

  async function handleCreate(data: CreateGiftDto) {
    await createMutation.mutateAsync(data)
  }

  // gifts será automaticamente atualizado após createMutation
}
```

### Exemplo: Optimistic Update
```typescript
import { useUpdateGuest } from '@/hooks/useGuests'

function GuestProfile() {
  const updateMutation = useUpdateGuest(eventId)

  // UI atualiza instantaneamente, rollback automático em caso de erro
  updateMutation.mutate({ id: 'guest-1', data: { rsvpStatus: 'confirmed' } })
}
```
