# 🗺️ Mapa de Endpoints - Backend .NET → Frontend Next.js

## 📋 Base URL
```
Development: http://localhost:5000/api
Production: https://api.celebre.com/api (ou env NEXT_PUBLIC_API_URL)
```

## 🔐 Autenticação
```
Header: Authorization: Bearer <token>
Método: JWT via NextAuth
```

---

## 1️⃣ **EVENTS (Eventos)**

### `GET /events`
Lista todos os eventos do usuário
```typescript
Response: {
  data: Event[]
  pagination?: PaginationDto
}
```

### `GET /events/{eventId}`
Detalhes de um evento específico
```typescript
Response: {
  id: string
  name: string
  date: string
  location?: string
  type: 'wedding' | 'birthday' | 'corporate'
  ...
}
```

### `POST /events`
Criar novo evento
```typescript
Request: {
  name: string
  date: string
  type: string
  ...
}
Response: Event
```

### `PATCH /events/{eventId}`
Atualizar evento
```typescript
Request: Partial<Event>
Response: Event
```

### `GET /events/{eventId}/summary`
Resumo/Dashboard do evento
```typescript
Response: {
  totalGuests: number
  confirmedGuests: number
  pendingInvites: number
  totalExpenses: number
  completedTasks: number
  upcomingTasks: Task[]
  ...
}
```

---

## 2️⃣ **GUESTS (Convidados)**

### `GET /events/{eventId}/guests`
Lista convidados do evento
```typescript
Query: {
  filter?: 'vip' | 'children' | 'pending' | 'confirmed' | 'no_phone'
  search?: string
  page?: number
  limit?: number
}
Response: {
  data: Guest[]
  pagination: PaginationDto
}
```

### `GET /guests/{guestId}`
Detalhes de um convidado
```typescript
Response: {
  id: string
  fullName: string
  phone?: string
  email?: string
  rsvpStatus: 'pending' | 'confirmed' | 'declined'
  seats: number
  children: number
  dietaryRestrictions?: string
  tableAssignment?: {
    tableId: string
    tableName: string
    seatNumber?: number
  }
  gifts: GiftContribution[]
  timeline: TimelineEntry[]
  ...
}
```

### `POST /events/{eventId}/guests`
Criar convidado
```typescript
Request: {
  contactId?: string
  fullName: string
  phone?: string
  email?: string
  seats: number
  children: number
  transportNeeded: boolean
}
Response: Guest
```

### `PATCH /guests/{guestId}`
Atualizar convidado
```typescript
Request: Partial<Guest>
Response: Guest
```

### `DELETE /guests/{guestId}`
Remover convidado
```typescript
Response: { success: boolean }
```

### `POST /events/{eventId}/guests/bulk-invite`
Convite em massa
```typescript
Request: {
  guestIds: string[]
  channel: 'whatsapp' | 'email' | 'sms'
}
Response: {
  sent: number
  failed: string[]
}
```

### `GET /guests/{guestId}/timeline`
Timeline de interações do convidado
```typescript
Response: TimelineEntry[]
```

---

## 3️⃣ **GIFTS (Presentes)**

### `GET /events/{eventId}/gifts`
Lista presentes do evento
```typescript
Query: {
  status?: 'disponivel' | 'reservado' | 'comprado'
  categoryId?: string
}
Response: Gift[]
```

### `GET /gifts/{giftId}`
Detalhes de um presente
```typescript
Response: {
  id: string
  title: string
  type: 'link' | 'cotao' | 'fisico'
  price: number
  status: GiftStatus
  storeLink?: string
  totalQuotas?: number
  paidQuotas?: number
  contributions: GiftContribution[]
  delivery?: GiftDelivery
  ...
}
```

### `POST /events/{eventId}/gifts`
Criar presente
```typescript
Request: {
  categoryId: string
  title: string
  type: 'link' | 'cotao' | 'fisico'
  price?: number
  storeLink?: string
  totalQuotas?: number
  quotaValue?: number
}
Response: Gift
```

### `PATCH /gifts/{giftId}`
Atualizar presente
```typescript
Request: Partial<Gift>
Response: Gift
```

### `POST /gifts/{giftId}/reserve`
Reservar presente
```typescript
Request: {
  contactId: string
  quotas?: number
}
Response: {
  reservationId: string
  expiresAt: string
}
```

### `POST /gifts/{giftId}/confirm`
Confirmar compra/pagamento
```typescript
Request: {
  contributionId: string
  paymentMethod: string
  transactionId?: string
  paymentProofUrl?: string
  message?: string
}
Response: GiftContribution
```

### `GET /events/{eventId}/gifts/categories`
Categorias de presentes
```typescript
Response: GiftCategory[]
```

### `POST /events/{eventId}/gifts/categories`
Criar categoria
```typescript
Request: {
  name: string
  description?: string
  iconUrl?: string
}
Response: GiftCategory
```

### `GET /events/{eventId}/gifts/contributions`
Contribuições e pagamentos
```typescript
Query: {
  status?: 'pendente' | 'confirmado'
}
Response: GiftContribution[]
```

### `GET /events/{eventId}/gifts/thank-you`
Lista agradecimentos
```typescript
Response: ThankYouNote[]
```

### `POST /gifts/thank-you`
Enviar agradecimento
```typescript
Request: {
  contributionId: string
  message: string
  channel: 'whatsapp' | 'email'
  imageUrl?: string
}
Response: ThankYouNote
```

---

## 4️⃣ **TABLES (Mesas)**

### `GET /events/{eventId}/tables`
Lista mesas do evento
```typescript
Response: {
  tables: Table[]
  layout?: {
    zoom: number
    positions: Record<string, Position>
    elements: LayoutElement[]
  }
}
```

### `GET /tables/{tableId}`
Detalhes de uma mesa
```typescript
Response: {
  id: string
  name: string
  capacity: number
  shape: 'round' | 'square' | 'rect'
  assignments: SeatAssignment[]
  ...
}
```

### `POST /events/{eventId}/tables`
Criar mesa
```typescript
Request: {
  name: string
  capacity: number
  shape: 'round' | 'square' | 'rect'
  x?: number
  y?: number
}
Response: Table
```

### `PUT /events/{eventId}/tables/layout`
Salvar layout completo (zoom + posições + elementos festa)
```typescript
Request: {
  zoom: number
  positions: Record<string, { x: number, y: number, rotation?: number }>
  elements: LayoutElement[] // bolo, pista, bar, banheiros
  layers: Record<string, number>
  locked: string[]
}
Response: { success: boolean }
```

### `POST /tables/{tableId}/assign`
Atribuir convidado a mesa/assento
```typescript
Request: {
  guestId: string
  seatNumber?: number
}
Response: SeatAssignment
```

### `DELETE /seats/{seatId}/unassign`
Remover atribuição
```typescript
Response: { success: boolean }
```

### `POST /events/{eventId}/tables/bride-groom-template`
Criar mesa dos noivos com template
```typescript
Request: {
  includeParents: boolean
  additionalGuests?: string[]
}
Response: Table
```

---

## 5️⃣ **TASKS (Tarefas)**

### `GET /events/{eventId}/tasks`
Lista tarefas do evento
```typescript
Query: {
  status?: 'aberta' | 'em_andamento' | 'concluida'
  dueDate?: string
}
Response: Task[]
```

### `POST /events/{eventId}/tasks`
Criar tarefa
```typescript
Request: {
  title: string
  description?: string
  dueDate?: string
  ownerId?: string
  priority: 'baixa' | 'media' | 'alta' | 'critica'
}
Response: Task
```

### `PATCH /tasks/{taskId}`
Atualizar tarefa (incluindo drag-and-drop no calendário)
```typescript
Request: {
  status?: TaskStatus
  dueDate?: string
  ownerId?: string
}
Response: Task
```

### `POST /tasks/{taskId}/notify-owner`
Notificar responsável
```typescript
Response: { success: boolean }
```

---

## 6️⃣ **VENDORS (Fornecedores)**

### `GET /events/{eventId}/vendors`
Lista fornecedores do evento
```typescript
Response: Vendor[]
```

### `GET /vendors/{vendorId}`
Detalhes do fornecedor
```typescript
Response: {
  id: string
  name: string
  category: string
  phone?: string
  email?: string
  status: 'ativo' | 'inativo' | 'pendente'
  contracts: Contract[]
  timeline: TimelineEntry[]
  ...
}
```

### `POST /events/{eventId}/vendors`
Adicionar fornecedor
```typescript
Request: {
  name: string
  category: string
  phone?: string
  email?: string
  estimatedCost?: number
}
Response: Vendor
```

### `PATCH /vendors/{vendorId}`
Atualizar fornecedor
```typescript
Request: Partial<Vendor>
Response: Vendor
```

---

## 7️⃣ **CHECKINS**

### `GET /events/{eventId}/checkins`
Lista check-ins do evento
```typescript
Response: {
  checkins: Checkin[]
  stats: {
    total: number
    checked: number
    pending: number
  }
}
```

### `POST /checkins`
Realizar check-in
```typescript
Request: {
  eventId: string
  guestId: string
  method: 'qr' | 'manual'
}
Response: Checkin
```

---

## 8️⃣ **SEGMENTS (Segmentos)**

### `GET /events/{eventId}/segments`
Lista segmentos
```typescript
Response: SegmentTag[]
```

### `POST /events/{eventId}/segments`
Criar segmento
```typescript
Request: {
  name: string
  criteria: SegmentCriteria
}
Response: SegmentTag
```

### `POST /segments/{segmentId}/send`
Enviar mensagem ao segmento
```typescript
Request: {
  templateId: string
  channel: 'whatsapp' | 'email' | 'sms'
}
Response: {
  sent: number
  failed: string[]
}
```

---

## 9️⃣ **TEMPLATES (Templates de Mensagem)**

### `GET /events/{eventId}/templates`
Lista templates
```typescript
Response: MessageTemplate[]
```

### `POST /events/{eventId}/templates`
Criar template
```typescript
Request: {
  name: string
  category: 'rsvp' | 'confirmacao' | 'agradecimento' | 'lembrete' | 'fornecedor'
  channel: 'whatsapp' | 'email' | 'sms'
  contentText: string
}
Response: MessageTemplate
```

---

## 🔟 **CHECKLIST (Checklist do Dia)**

### `GET /events/{eventId}/checklist`
Lista itens do checklist
```typescript
Response: EventChecklist[]
```

### `POST /events/{eventId}/checklist`
Criar item
```typescript
Request: {
  title: string
  scheduledTime?: string
  durationMinutes?: number
  ownerName?: string
  priority: 'baixa' | 'media' | 'alta' | 'critica'
}
Response: EventChecklist
```

### `PATCH /checklist/{itemId}`
Atualizar status
```typescript
Request: {
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
  completedByContactId?: string
}
Response: EventChecklist
```

---

## 1️⃣1️⃣ **LOGISTICS (Logística)**

### `GET /events/{eventId}/locations`
Localizações do evento
```typescript
Response: EventLocation[]
```

### `GET /events/{eventId}/logistics`
Informações de logística
```typescript
Response: LogisticsInfo
```

### `PUT /events/{eventId}/logistics`
Atualizar logística
```typescript
Request: Partial<LogisticsInfo>
Response: LogisticsInfo
```

---

## 1️⃣2️⃣ **AUDIT (Auditoria)**

### `GET /events/{eventId}/audit`
Histórico de alterações
```typescript
Query: {
  entityType?: 'convidado' | 'presente' | 'fornecedor' | 'tarefa'
  action?: 'criar' | 'atualizar' | 'excluir'
  startDate?: string
  endDate?: string
}
Response: AuditLog[]
```

---

## 1️⃣3️⃣ **PERMISSIONS (Permissões)**

### `GET /events/{eventId}/users`
Usuários com acesso ao evento
```typescript
Response: EventUser[]
```

### `POST /events/{eventId}/users/invite`
Convidar usuário
```typescript
Request: {
  email: string
  roleType: 'noivos' | 'familia' | 'cerimonial' | 'fornecedor'
}
Response: EventUser
```

### `PATCH /events/{eventId}/users/{userId}`
Atualizar permissões
```typescript
Request: {
  isActive?: boolean
  roleType?: RoleType
}
Response: EventUser
```

### `GET /roles`
Lista perfis/permissões disponíveis
```typescript
Response: Role[]
```

---

## 1️⃣4️⃣ **NOTIFICATIONS**

### `GET /notifications`
Notificações do usuário
```typescript
Query: {
  unreadOnly?: boolean
}
Response: Notification[]
```

### `PATCH /notifications/{notificationId}/read`
Marcar como lida
```typescript
Response: { success: boolean }
```

---

## 1️⃣5️⃣ **REPORTS & BACKUP**

### `GET /events/{eventId}/reports`
Gerar relatórios
```typescript
Query: {
  type: 'guests' | 'gifts' | 'expenses' | 'timeline'
  format: 'json' | 'csv' | 'pdf'
}
Response: Report | Blob
```

### `POST /events/{eventId}/backup`
Backup por e-mail
```typescript
Request: {
  scope: 'all' | 'guests' | 'gifts' | 'vendors'
  email: string
}
Response: { success: boolean }
```

---

## 📦 DTOs e Types Comuns

```typescript
interface PaginationDto {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Position {
  x: number
  y: number
  rotation?: number
}

interface LayoutElement {
  id: string
  type: 'cake' | 'dancefloor' | 'bar' | 'bathroom' | 'entrance'
  position: Position
  size?: { width: number, height: number }
  locked?: boolean
}

interface TimelineEntry {
  id: string
  type: 'rsvp' | 'msg' | 'checkin' | 'presente' | 'tarefa'
  description: string
  actor: string
  createdAt: string
}
```

---

## 🛠️ Error Responses

Todos os erros seguem o formato:
```typescript
{
  code: string // 'VALIDATION_ERROR', 'NOT_FOUND', etc
  message: string
  details?: Record<string, any>
}
```

Status codes:
- `400` - Bad Request (validação)
- `401` - Unauthorized (sem auth)
- `403` - Forbidden (sem permissão)
- `404` - Not Found
- `500` - Server Error
