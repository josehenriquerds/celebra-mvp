/**
 * Tipos e DTOs da API
 * Baseados nos contratos do backend .NET
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface PaginationDto {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PagedResponse<T> {
  data: T[]
  pagination: PaginationDto
}

export interface Position {
  x: number
  y: number
  rotation?: number
}

export interface TimelineEntry {
  id: string
  type: 'rsvp' | 'msg' | 'checkin' | 'presente' | 'tarefa'
  description: string
  actor: string
  createdAt: string
}

// ============================================================================
// EVENTS
// ============================================================================

export interface Event {
  id: string
  name: string
  date: string
  location?: string
  type: 'wedding' | 'birthday' | 'corporate'
  status: 'draft' | 'active' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface EventSummary {
  totalGuests: number
  confirmedGuests: number
  pendingInvites: number
  totalExpenses: number
  completedTasks: number
  pendingTasks: number
  upcomingTasks: Task[]
  recentActivity: TimelineEntry[]
}

export interface CreateEventDto {
  name: string
  date: string
  type: string
  location?: string
}

// ============================================================================
// GUESTS
// ============================================================================

export interface Guest {
  id: string
  eventId: string
  fullName: string
  phone?: string
  email?: string
  rsvpStatus: 'pending' | 'confirmed' | 'declined'
  seats: number
  children: number
  transportNeeded: boolean
  dietaryRestrictions?: string
  notes?: string
  tableAssignment?: {
    tableId: string
    tableName: string
    seatNumber?: number
  }
  gifts?: GiftContribution[]
  timeline?: TimelineEntry[]
  createdAt: string
  updatedAt: string
}

export interface CreateGuestDto {
  contactId?: string
  fullName: string
  phone?: string
  email?: string
  seats: number
  children: number
  transportNeeded: boolean
}

export interface UpdateGuestDto extends Partial<CreateGuestDto> {
  rsvpStatus?: Guest['rsvpStatus']
  dietaryRestrictions?: string
  notes?: string
}

export interface BulkInviteDto {
  guestIds: string[]
  channel: 'whatsapp' | 'email' | 'sms'
}

// ============================================================================
// GIFTS
// ============================================================================

export type GiftType = 'link' | 'cotao' | 'fisico'
export type GiftStatus = 'disponivel' | 'reservado' | 'comprado'
export type PaymentStatus = 'pendente' | 'confirmado' | 'recusado' | 'estornado'
export type DeliveryStatus = 'nao_aplicavel' | 'aguardando' | 'em_transito' | 'entregue'

export interface Gift {
  id: string
  eventId: string
  categoryId: string
  title: string
  description?: string
  imageUrl?: string
  type: GiftType
  price?: number
  storeLink?: string
  storeName?: string
  totalQuotas?: number
  quotaValue?: number
  reservedQuotas?: number
  paidQuotas?: number
  requiresDelivery: boolean
  deliveryInstructions?: string
  status: GiftStatus
  buyerContactId?: string
  reservedAt?: string
  purchasedAt?: string
  allowMessages: boolean
  vendorId?: string
  externalId?: string
  contributions?: GiftContribution[]
  delivery?: GiftDelivery
  createdAt: string
  updatedAt: string
}

export interface GiftCategory {
  id: string
  eventId: string
  name: string
  description?: string
  iconUrl?: string
  displayOrder: number
  isActive: boolean
  itemsCount?: number
  createdAt: string
  updatedAt: string
}

export interface GiftContribution {
  id: string
  giftRegistryItemId: string
  contactId: string
  contactName?: string
  amount: number
  quotas?: number
  paymentStatus: PaymentStatus
  paymentMethod?: string
  transactionId?: string
  paymentProofUrl?: string
  message?: string
  isAnonymous: boolean
  receiptUrl?: string
  receiptGeneratedAt?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
}

export interface GiftDelivery {
  id: string
  giftRegistryItemId: string
  contributionId?: string
  recipientName: string
  address: string
  city: string
  state: string
  postalCode: string
  addressComplement?: string
  phone?: string
  status: DeliveryStatus
  trackingCode?: string
  carrier?: string
  shippedAt?: string
  deliveredAt?: string
  notes?: string
  deliveryProofUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ThankYouNote {
  id: string
  eventId: string
  giftRegistryItemId: string
  contributionId: string
  contactId: string
  contactName?: string
  message: string
  status: 'pendente' | 'enviado' | 'visualizado'
  sentVia?: 'whatsapp' | 'email'
  sentAt?: string
  viewedAt?: string
  imageUrl?: string
  videoUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateGiftDto {
  categoryId: string
  title: string
  description?: string
  type: GiftType
  price?: number
  storeLink?: string
  totalQuotas?: number
  quotaValue?: number
}

export interface ReserveGiftDto {
  contactId: string
  quotas?: number
}

export interface ConfirmGiftDto {
  contributionId: string
  paymentMethod: string
  transactionId?: string
  paymentProofUrl?: string
  message?: string
}

// ============================================================================
// TABLES
// ============================================================================

export type TableShape = 'round' | 'square' | 'rect'

export interface Table {
  id: string
  eventId: string
  name: string
  capacity: number
  shape: TableShape
  x?: number
  y?: number
  rotation?: number
  locked?: boolean
  layer?: number
  assignments?: SeatAssignment[]
  createdAt: string
  updatedAt: string
}

export interface SeatAssignment {
  id: string
  tableId: string
  guestId: string
  seatNumber?: number
  guestName?: string
  createdAt: string
}

export interface LayoutElement {
  id: string
  type: 'cake' | 'dancefloor' | 'bar' | 'bathroom' | 'entrance' | 'stage' | 'buffet'
  position: Position
  size?: { width: number; height: number }
  locked?: boolean
  layer?: number
}

export interface TableLayout {
  zoom: number
  positions: Record<string, Position>
  elements: LayoutElement[]
  layers: Record<string, number>
  locked: string[]
}

export interface CreateTableDto {
  name: string
  capacity: number
  shape: TableShape
  x?: number
  y?: number
}

export interface AssignSeatDto {
  guestId: string
  seatNumber?: number
}

// ============================================================================
// TASKS
// ============================================================================

export type TaskStatus = 'aberta' | 'em_andamento' | 'concluida' | 'atrasada'

export interface Task {
  id: string
  eventId: string
  title: string
  description?: string
  status: TaskStatus
  dueDate?: string
  ownerId?: string
  ownerName?: string
  priority: 'baixa' | 'media' | 'alta' | 'critica'
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  dueDate?: string
  ownerId?: string
  priority: Task['priority']
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus
}

// ============================================================================
// VENDORS
// ============================================================================

export type VendorStatus = 'ativo' | 'inativo' | 'pendente'

export interface Vendor {
  id: string
  eventId: string
  name: string
  category: string
  phone?: string
  email?: string
  website?: string
  status: VendorStatus
  estimatedCost?: number
  actualCost?: number
  contractUrl?: string
  notes?: string
  timeline?: TimelineEntry[]
  createdAt: string
  updatedAt: string
}

export interface CreateVendorDto {
  name: string
  category: string
  phone?: string
  email?: string
  estimatedCost?: number
}

// ============================================================================
// CHECKINS
// ============================================================================

export interface Checkin {
  id: string
  eventId: string
  guestId: string
  guestName?: string
  method: 'qr' | 'manual'
  checkedAt: string
  checkedBy?: string
}

export interface CreateCheckinDto {
  eventId: string
  guestId: string
  method: 'qr' | 'manual'
}

// ============================================================================
// SEGMENTS
// ============================================================================

export interface SegmentTag {
  id: string
  eventId: string
  name: string
  criteria: SegmentCriteria
  guestCount?: number
  createdAt: string
  updatedAt: string
}

export interface SegmentCriteria {
  rsvpStatus?: Guest['rsvpStatus'][]
  hasChildren?: boolean
  transportNeeded?: boolean
  tags?: string[]
}

export interface SendToSegmentDto {
  templateId: string
  channel: 'whatsapp' | 'email' | 'sms'
}

// ============================================================================
// TEMPLATES
// ============================================================================

export type TemplateCategory = 'rsvp' | 'confirmacao' | 'agradecimento' | 'lembrete' | 'fornecedor' | 'personalizado'
export type TemplateChannel = 'whatsapp' | 'email' | 'sms'

export interface MessageTemplate {
  id: string
  eventId: string
  name: string
  description?: string
  category: TemplateCategory
  channel: TemplateChannel
  contentText: string
  contentSubject?: string
  contentButtons?: string
  contentMedia?: string
  variables: string[]
  variablesHelp?: string
  locale: string
  isActive: boolean
  isSystem: boolean
  timesUsed: number
  lastUsedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTemplateDto {
  name: string
  description?: string
  category: TemplateCategory
  channel: TemplateChannel
  contentText: string
  contentSubject?: string
}

// ============================================================================
// CHECKLIST
// ============================================================================

export type ChecklistStatus = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
export type ChecklistPriority = 'baixa' | 'media' | 'alta' | 'critica'

export interface EventChecklist {
  id: string
  eventId: string
  title: string
  description?: string
  scheduledTime?: string
  durationMinutes?: number
  ownerName?: string
  ownerPhone?: string
  category?: string
  status: ChecklistStatus
  priority: ChecklistPriority
  displayOrder: number
  dependsOnId?: string
  notes?: string
  attachmentUrl?: string
  completedAt?: string
  completedByContactId?: string
  completionNotes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateChecklistItemDto {
  title: string
  description?: string
  scheduledTime?: string
  durationMinutes?: number
  ownerName?: string
  category?: string
  priority: ChecklistPriority
}

// ============================================================================
// LOGISTICS
// ============================================================================

export type LocationType = 'cerimonia' | 'recepcao' | 'hospedagem' | 'estacionamento'
export type WeatherContingency = 'nao_aplicavel' | 'coberto' | 'tenda' | 'local_alternativo'

export interface EventLocation {
  id: string
  eventId: string
  type: LocationType
  name: string
  address: string
  city: string
  state: string
  postalCode: string
  addressComplement?: string
  latitude?: number
  longitude?: number
  googleMapsUrl?: string
  wazeUrl?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  startTime?: string
  endTime?: string
  capacity?: number
  createdAt: string
  updatedAt: string
}

export interface LogisticsInfo {
  id: string
  eventId: string
  hasParking: boolean
  parkingSpaces?: number
  parkingFee?: number
  hasValetService: boolean
  offersShuttle: boolean
  shuttleSchedule?: string
  isWheelchairAccessible: boolean
  accessibilityNotes?: string
  weatherContingency: WeatherContingency
  contingencyPlan?: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// AUDIT
// ============================================================================

export type AuditAction = 'criar' | 'atualizar' | 'excluir' | 'visualizar' | 'exportar'
export type AuditEntityType = 'evento' | 'convidado' | 'presente' | 'fornecedor' | 'tarefa' | 'mesa' | 'checkin' | 'configuracao'

export interface AuditLog {
  id: string
  eventId: string
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  userName?: string
  userEmail?: string
  userRole?: 'noivos' | 'familia' | 'cerimonial' | 'fornecedor'
  description?: string
  changes?: {
    field: string
    before: string
    after: string
  }[]
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

// ============================================================================
// PERMISSIONS
// ============================================================================

export type RoleType = 'noivos' | 'familia' | 'cerimonial' | 'fornecedor' | 'convidado'

export interface EventUser {
  id: string
  eventId: string
  contactId: string
  contactName?: string
  contactEmail?: string
  roleId: string
  roleType: RoleType
  isActive: boolean
  invitedAt: string
  acceptedAt?: string
  revokedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description?: string
  type: RoleType
  isSystem: boolean
  isActive: boolean
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  scope: 'eventos' | 'convidados' | 'presentes' | 'fornecedores' | 'financeiro' | 'configuracoes'
  action: 'ler' | 'criar' | 'editar' | 'excluir' | 'aprovar'
  name: string
  description?: string
}

export interface InviteUserDto {
  email: string
  roleType: RoleType
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string
  userId: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  link?: string
  read: boolean
  readAt?: string
  createdAt: string
}

// ============================================================================
// REPORTS & BACKUP
// ============================================================================

export type ReportType = 'guests' | 'gifts' | 'expenses' | 'timeline'
export type ReportFormat = 'json' | 'csv' | 'pdf'

export interface Report {
  id: string
  type: ReportType
  format: ReportFormat
  data: any
  generatedAt: string
}

export interface BackupDto {
  scope: 'all' | 'guests' | 'gifts' | 'vendors'
  email: string
}
