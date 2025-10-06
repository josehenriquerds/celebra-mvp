# 🚀 Próximos Passos - Migração Backend API

## ✅ Estado Atual (46% Completo)

### O Que Está 100% Pronto
- ✅ **Infraestrutura completa** (API client, types, query config)
- ✅ **14 Services** para todos os módulos
- ✅ **14 Hooks TanStack Query** com optimistic updates
- ✅ **4 Páginas migradas**: Dashboard, Guests List, Gifts, Calendar/Tasks
- ✅ **1 Bug fixado**: Calendar drag-and-drop

### O Que Precisa Ser Feito

## 📋 Tarefas Prioritárias

### 1. Migrar Tables Planner Page (Alta Prioridade) ⚠️

**Arquivo**: `src/app/events/[id]/tables/page.tsx`

**Situação Atual**:
- Usa hooks próprios em `src/features/tables/hooks/useTables.ts`
- Chama BFF routes `/api/events/${eventId}/tables`
- Já tem optimistic updates implementados

**O Que Fazer**:
```typescript
// ANTES (atual):
import { useTablePlannerData, useUpdateTable } from '@/features/tables/hooks/useTables'

// DEPOIS (migrar para):
import { useTables, useUpdateTable, useSaveTableLayout } from '@/hooks'

// Exemplo de uso:
function TablesPage() {
  const eventId = 'event-123'

  // Em vez de useTablePlannerData()
  const { data: tablesData } = useTables(eventId)

  // Salvar layout (FIX BUG: elementos persistirem)
  const saveLayoutMutation = useSaveTableLayout(eventId)

  function handleSaveLayout(layout: TableLayout) {
    saveLayoutMutation.mutate(layout) // Optimistic update automático
  }

  // Criar mesa dos noivos (FIX BUG: template)
  const createBrideGroomMutation = useCreateBrideGroomTable(eventId)

  function handleCreateBrideGroomTable() {
    createBrideGroomMutation.mutate({
      includeParents: true,
      additionalGuests: ['guest-id-1', 'guest-id-2']
    })
  }
}
```

**Bugs que Serão Fixados**:
- ✅ Elementos de festa persistirem → `useSaveTableLayout` salva tudo
- ✅ Template mesa dos noivos → `useCreateBrideGroomTable` cria automaticamente
- ⚠️ Zoom hitbox → Requer fix no componente canvas (não relacionado à API)

**Tempo Estimado**: 2-3 horas

---

### 2. Implementar Gift Cotão Flow Completo (Alta Prioridade) 🎁

**Arquivos**:
- `src/app/events/[id]/gifts/page.tsx` (já migrado)
- Criar: `src/app/events/[id]/gifts/[id]/reserve.tsx`
- Criar: `src/app/events/[id]/gifts/[id]/confirm.tsx`

**Hooks Já Prontos**:
```typescript
import {
  useReserveGift,      // Reservar cotão
  useConfirmGift,      // Confirmar pagamento
  useSendThankYou      // Enviar agradecimento
} from '@/hooks'
```

**Fluxo Completo**:
```typescript
// 1. Reservar (exibe QR Code Pix)
function ReserveGiftModal({ giftId }) {
  const reserveMutation = useReserveGift()

  function handleReserve(quotas: number) {
    reserveMutation.mutate({
      giftId,
      data: {
        guestId: currentGuest.id,
        quotas,
        amount: quotas * gift.quotaValue
      }
    }, {
      onSuccess: (data) => {
        // data.reservationId, data.expiresAt
        showPixQRCode(data.pixQRCode)
      }
    })
  }
}

// 2. Confirmar (após upload de comprovante)
function ConfirmPaymentModal({ giftId }) {
  const confirmMutation = useConfirmGift()

  function handleConfirm(proofUrl: string) {
    confirmMutation.mutate({
      giftId,
      data: {
        paymentProofUrl: proofUrl,
        paymentMethod: 'pix',
        transactionId: 'xxx'
      }
    })
  }
}

// 3. Agradecer (automático após confirmação ou manual)
function ThankYouFlow({ contributionId }) {
  const sendThankYouMutation = useSendThankYou(eventId)

  function handleSendThankYou() {
    sendThankYouMutation.mutate({
      contributionId,
      message: 'Muito obrigado pelo presente!',
      channel: 'whatsapp',
      imageUrl: '/thank-you-card.jpg'
    })
  }
}
```

**Componentes Necessários**:
- [ ] `ReserveGiftModal` - Selecionar quotas + exibir Pix QR
- [ ] `UploadProofModal` - Upload de comprovante
- [ ] `ThankYouModal` - Enviar mensagem personalizada

**Tempo Estimado**: 4-5 horas

---

### 3. Migrar Guest Profile Page (Média Prioridade) 👤

**Arquivo**: `src/app/events/[id]/guests/[guestId]/page.tsx`

**Hooks Prontos**:
```typescript
import {
  useGuest,           // Dados do convidado
  useGuestTimeline,   // Histórico de interações
  useUpdateGuest      // Atualizar RSVP, restrições, etc
} from '@/hooks'

function GuestProfile({ guestId }) {
  const { data: guest, isLoading } = useGuest(guestId)
  const { data: timeline } = useGuestTimeline(guestId)
  const updateMutation = useUpdateGuest(eventId)

  function handleRSVP(status: 'sim' | 'nao' | 'talvez') {
    updateMutation.mutate({
      id: guestId,
      data: { rsvpStatus: status }
    })
  }

  return (
    <div>
      <GuestInfo guest={guest} />
      <RSVPSection onUpdate={handleRSVP} />
      <TimelineSection timeline={timeline} />
    </div>
  )
}
```

**Tempo Estimado**: 2 horas

---

### 4. Migrar Vendors Page (Média Prioridade) 🏢

**Arquivo**: `src/app/events/[id]/vendors/page.tsx`

**Hooks Prontos**:
```typescript
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
  useVendorTimeline
} from '@/hooks'

function VendorsPage() {
  const eventId = 'event-123'
  const { data: vendors = [] } = useVendors(eventId)
  const createMutation = useCreateVendor(eventId)

  // CRUD completo com optimistic updates
}
```

**Tempo Estimado**: 1-2 horas

---

### 5. Páginas Secundárias (Baixa Prioridade)

| Página | Hook Principal | Tempo Estimado |
|--------|---------------|----------------|
| Gift Categories | `useGiftCategories` | 1h |
| Gift Contributions | `useGiftContributions` | 1h |
| Gift Thank You | `useThankYouNotes` | 1h |
| Checkins | `useCheckins` | 1h |
| Segments | `useSegments` | 2h |
| Templates | `useTemplates` | 1-2h |
| Checklist | `useChecklist` | 1-2h |
| Logistics | `useLogistics`, `useLocations` | 2h |
| Audit | `useAuditLogs` | 1h |
| Permissions | `useEventUsers`, `useRoles` | 2h |

---

## 🧪 Testes Recomendados

### E2E Tests (Playwright)

```typescript
// tests/e2e/calendar-drag-drop.spec.ts
test('should update task status on drag and drop', async ({ page }) => {
  await page.goto('/events/123/tasks')

  // Drag task from "Aberta" to "Em Andamento"
  await page.dragAndDrop(
    '[data-task-id="task-1"]',
    '[data-column="em_andamento"]'
  )

  // Verify optimistic update
  await expect(page.locator('[data-column="em_andamento"]')).toContainText('Task 1')

  // Verify API call was made
  await page.waitForResponse(resp =>
    resp.url().includes('/api/tasks/task-1') &&
    resp.request().method() === 'PATCH'
  )
})

// tests/e2e/gift-cotao-flow.spec.ts
test('should complete full gift cotão flow', async ({ page }) => {
  await page.goto('/events/123/gifts')

  // 1. Reserve quotas
  await page.click('[data-gift-id="gift-1"]')
  await page.fill('[name="quotas"]', '5')
  await page.click('button:has-text("Reservar")')

  // 2. Verify Pix QR code appears
  await expect(page.locator('[data-testid="pix-qr-code"]')).toBeVisible()

  // 3. Upload proof
  await page.setInputFiles('[name="proof"]', 'comprovante.jpg')
  await page.click('button:has-text("Confirmar Pagamento")')

  // 4. Verify thank you option appears
  await expect(page.locator('button:has-text("Enviar Agradecimento")')).toBeVisible()
})
```

### Unit Tests (Hooks)

```typescript
// hooks/__tests__/useTasks.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { useTasks, useUpdateTask } from '../useTasks'

test('useUpdateTask should optimistically update task status', async () => {
  const { result } = renderHook(() => useUpdateTask('event-123'), {
    wrapper: QueryClientProvider
  })

  // Trigger mutation
  result.current.mutate({
    id: 'task-1',
    data: { status: 'concluida' }
  })

  // Verify optimistic update happened immediately
  expect(result.current.isPending).toBe(true)

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true)
  })
})
```

---

## 🗑️ Cleanup (Última Fase)

### Remover Código Prisma (42 arquivos)

```bash
# 1. Deletar lib Prisma
rm src/lib/prisma.ts

# 2. Deletar server utilities
rm -rf src/server/

# 3. Deletar BFF routes
rm -rf src/app/api/events/
rm -rf src/app/api/guests/
rm -rf src/app/api/tasks/
rm -rf src/app/api/tables/
# ... etc (manter apenas webhooks)

# 4. Remover dependência
npm uninstall @prisma/client prisma
```

### Atualizar package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
    // Remover scripts Prisma
  }
}
```

---

## 📊 Métricas de Sucesso

### Antes da Migração
- ❌ 42 arquivos usando Prisma diretamente
- ❌ BFF anti-pattern (Next.js API routes como proxy DB)
- ❌ Sem optimistic updates
- ❌ Sem retry logic
- ❌ Sem cache inteligente

### Depois da Migração (Meta)
- ✅ 0 arquivos Prisma no frontend
- ✅ Backend API como única fonte de dados
- ✅ Optimistic updates em todas mutations
- ✅ Retry automático (3x com exponential backoff)
- ✅ Cache reduz requests em ~60%
- ✅ Type safety end-to-end
- ✅ Circuit breaker previne cascata de erros

---

## 🎯 Roadmap de Entregas

### Sprint 1 (Esta Semana) - Crítico ⚠️
- [ ] Migrar Tables Planner
- [ ] Implementar Gift Cotão Flow
- [ ] Migrar Guest Profile
- [ ] Testes E2E dos 3 fluxos acima

### Sprint 2 (Próxima Semana) - Importante
- [ ] Migrar Vendors, Checkins, Segments
- [ ] Migrar Gift Categories, Contributions, Thank You
- [ ] Testes E2E coverage 50%

### Sprint 3 - Secundário
- [ ] Migrar Templates, Checklist, Logistics, Audit, Permissions
- [ ] Testes E2E coverage 80%

### Sprint 4 - Cleanup
- [ ] Remover todo código Prisma (42 arquivos)
- [ ] Code review final
- [ ] Performance audit
- [ ] Documentação final

---

## 💡 Dicas Importantes

### Pattern de Migração
```typescript
// 1. Sempre ler hook documentation first
import { useXxx } from '@/hooks'

// 2. Substituir fetch por hook
// ANTES:
const [data, setData] = useState([])
useEffect(() => {
  fetch('/api/xxx').then(r => r.json()).then(setData)
}, [])

// DEPOIS:
const { data = [] } = useXxx(eventId)

// 3. Substituir mutations
// ANTES:
async function handleUpdate() {
  await fetch('/api/xxx', { method: 'PATCH', body: JSON.stringify(data) })
  await refetch()
}

// DEPOIS:
const updateMutation = useUpdateXxx(eventId)
function handleUpdate() {
  updateMutation.mutate({ id, data }) // Optimistic update automático!
}
```

### Quando Usar Callbacks
```typescript
// Para side effects após mutation:
updateMutation.mutate(data, {
  onSuccess: (result) => {
    toast.success('Atualizado!')
    router.push('/next-page')
  },
  onError: (error) => {
    toast.error(error.message)
  }
})
```

### Debugging
```typescript
// Ver estado do cache no DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
```

---

## 📚 Recursos

### Documentação
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/guides/optimistic-updates)
- Backend API: `MAPA-ENDPOINTS.md`

### Exemplos de Referência
- ✅ Calendar/Tasks (`src/app/events/[id]/tasks/page.tsx`) - Drag-and-drop funcional
- ✅ Dashboard (`src/app/events/[id]/page.tsx`) - Fetch simples
- ✅ Guests List (`src/app/events/[id]/guests/page.tsx`) - Filtros + paginação
- ✅ Gifts (`src/app/events/[id]/gifts/page.tsx`) - CRUD completo

---

**Última Atualização**: 2025-01-03
**Progresso**: 46% (36/78 itens)
**Próximo Milestone**: 60% (Sprint 1 completo)
