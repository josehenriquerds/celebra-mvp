'use client'

/**
 * Planner de Mesas — versão corrigida
 * - Zoom LÓGICO (sem transform scale no container)
 * - Hitbox grande para assentos (56px) e seat visual (40px)
 * - Snap-to-grid + prevenção simples de colisão ao mover mesas
 * - Updates OTIMISTAS com rollback (assentar, mover, desalocar, mover mesa)
 * - Sensores mouse/touch com activationConstraint e touch-action: none
 * - pointerWithin com fallback para closestCenter
 * - Undo/Redo preservando todo estado
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  MeasuringStrategy,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft,
  Plus,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Users,
  Star,
  Baby,
  Edit2,
  Trash2,
  X,
  LayoutGrid,
} from 'lucide-react'
import { toPng } from 'html-to-image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

/* =========================
   Tipos
   ========================= */

interface Seat {
  id: string
  index: number
  x: number // coords relativas à MESA (em px - sem zoom)
  y: number
  rotation: number
  assignment: {
    id: string
    guest: {
      id: string
      contact: {
        fullName: string
        isVip: boolean
      }
      children: number
    }
  } | null
}

interface Table {
  id: string
  label: string
  capacity: number
  shape: 'circular' | string
  x: number // coords do CENTRO no canvas lógico
  y: number
  radius: number // raio lógico
  seats: Seat[]
  color?: string
}

interface UnassignedGuest {
  id: string
  contact: {
    id: string
    fullName: string
    isVip: boolean
  }
  household: {
    id: string
    label: string
  } | null
  children: number
  seats: number
}

interface TablePlannerData {
  tables: Table[]
  unassigned: UnassignedGuest[]
}

/* =========================
   Constantes / Utils
   ========================= */

const CANVAS_W = 2000
const CANVAS_H = 1500
const GRID = 16
const MIN_GAP = 64 // distância mínima entre bordas das mesas (visibilidade)

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
const snap = (v: number, step = GRID) => Math.round(v / step) * step

const circlesCollide = (
  a: { x: number; y: number; r: number },
  b: { x: number; y: number; r: number },
  gap = 0
) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dist = Math.hypot(dx, dy)
  return dist < a.r + b.r + gap
}

/** Encontra um ponto próximo sem colisão (busca em espiral em células de grid) */
function findFreeSpot(
  tables: Table[],
  movingId: string,
  x: number,
  y: number,
  r: number
): { x: number; y: number } {
  let candidate = { x: snap(x), y: snap(y) }
  const others = tables.filter((t) => t.id !== movingId)

  const inBounds = (cx: number, cy: number) =>
    cx - r >= 0 && cy - r >= 0 && cx + r <= CANVAS_W && cy + r <= CANVAS_H

  const collides = (cx: number, cy: number) =>
    others.some((t) => circlesCollide({ x: cx, y: cy, r }, { x: t.x, y: t.y, r: t.radius }, MIN_GAP))

  candidate.x = clamp(candidate.x, r, CANVAS_W - r)
  candidate.y = clamp(candidate.y, r, CANVAS_H - r)

  if (!collides(candidate.x, candidate.y) && inBounds(candidate.x, candidate.y)) return candidate

  // espiral simples ao redor do alvo
  const STEPS = 100
  const DIRS = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ]
  let len = 1
  let dir = 0
  let cx = candidate.x
  let cy = candidate.y
  for (let step = 0; step < STEPS; step++) {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < len; j++) {
        cx += DIRS[dir][0] * GRID
        cy += DIRS[dir][1] * GRID
        const sx = clamp(cx, r, CANVAS_W - r)
        const sy = clamp(cy, r, CANVAS_H - r)
        if (!collides(sx, sy) && inBounds(sx, sy)) return { x: sx, y: sy }
      }
      dir = (dir + 1) % 4
    }
    len++
  }
  return candidate
}

/** Layout automático em grade */
function autoLayout(tables: Table[]): Table[] {
  if (!tables.length) return tables
  const maxDiameter = Math.max(...tables.map((t) => t.radius * 2))
  const cell = snap(maxDiameter + MIN_GAP)
  const cols = Math.max(1, Math.floor(CANVAS_W / cell))
  const rows = Math.ceil(tables.length / cols)

  const arranged = tables.map((t, idx) => {
    const c = idx % cols
    const r = Math.floor(idx / cols)
    const x = snap(c * cell + cell / 2)
    const y = snap(r * cell + cell / 2)
    return { ...t, x, y }
  })
  return arranged
}

/** Deep clone simples para histórico */
const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj))

/* =========================
   Componentes DnD
   ========================= */

function DraggableGuest({ guest }: { guest: UnassignedGuest }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `guest-${guest.id}`,
    data: { type: 'guest', guest },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.6 : 1 }}
      {...listeners}
      {...attributes}
      className="p-3 bg-white border rounded-lg cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow touch-none select-none"
      title={guest.contact.fullName}
    >
      <div className="flex items-center gap-2">
        {guest.contact.isVip && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
        <span className="text-sm font-medium truncate">{guest.contact.fullName}</span>
      </div>
      {guest.household && <p className="text-xs text-celebre-muted mt-1">{guest.household.label}</p>}
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline" className="text-xs">
          <Users className="h-3 w-3 mr-1" />
          {guest.seats}
        </Badge>
        {guest.children > 0 && (
          <Badge variant="outline" className="text-xs">
            <Baby className="h-3 w-3 mr-1" />
            {guest.children}
          </Badge>
        )}
      </div>
    </div>
  )
}

/** Assento droppable (com hitbox larga) + draggable quando ocupado */
function DroppableSeat({
  seat,
  tableId,
  zoom,
}: {
  seat: Seat
  tableId: string
  zoom: number
}) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `seat-${tableId}-${seat.id}`,
    data: { type: 'seat', seatId: seat.id, tableId },
  })

  const { setNodeRef: setDragRef, attributes, listeners, isDragging } = useDraggable({
    id: `assignment-${tableId}-${seat.id}`,
    disabled: !seat.assignment,
    data: seat.assignment
      ? {
          type: 'assignment',
          fromSeatId: seat.id,
          fromTableId: tableId,
          guestId: seat.assignment.guest.id,
        }
      : undefined,
  })

  const setRefs = (node: HTMLDivElement | null) => {
    setDropRef(node)
    setDragRef(node)
  }

  const assigned = !!seat.assignment
  const vip = seat.assignment?.guest.contact.isVip
  const renderLeft = seat.x * zoom
  const renderTop = seat.y * zoom

  return (
    <div
      ref={setRefs}
      {...(assigned ? { ...attributes, ...listeners } : {})}
      className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center
        w-14 h-14 rounded-full touch-none select-none
        ${isOver ? 'ring-2 ring-celebre-brand/60 bg-celebre-accent/20' : ''}
        ${isDragging ? 'opacity-70' : ''}`}
      style={{ left: renderLeft, top: renderTop }}
      title={seat.assignment?.guest.contact.fullName || 'Vazio'}
    >
      <div
        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-[11px] font-medium
          ${assigned ? 'text-white' : 'bg-white'} 
          ${isOver ? 'border-celebre-brand' : 'border-gray-300'}`}
        style={{
          backgroundColor: assigned ? 'var(--seat-fill, #a78bfa20)' : undefined,
          borderColor: assigned ? 'var(--table-color, var(--celebre-brand))' : undefined,
        }}
      >
        {assigned ? (vip ? '⭐' : seat.index + 1) : seat.index + 1}
      </div>
    </div>
  )
}

/** Mesa arrastável com zoom lógico */
function DraggableTable({
  table,
  zoom,
  onEdit,
  onDelete,
}: {
  table: Table
  zoom: number
  onEdit: (t: Table) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `table-${table.id}`,
    data: { type: 'table', table },
  })

  const renderLeft = table.x * zoom
  const renderTop = table.y * zoom
  const renderDiameter = table.radius * 2 * zoom

  return (
    <div
      ref={setNodeRef}
      style={{
        left: renderLeft,
        top: renderTop,
        width: renderDiameter,
        height: renderDiameter,
        transform: `${CSS.Translate.toString(transform)} translate(-50%, -50%)`,
        opacity: isDragging ? 0.8 : 1,
        ['--table-color' as any]: table.color || 'var(--celebre-brand)',
        ['--seat-fill' as any]: `${table.color || '#8b5cf6'}30`,
      }}
      className="absolute bg-white rounded-full border-4 shadow-lg flex items-center justify-center group"
    >
      {/* Título e contagem */}
      <div className="text-center pointer-events-none">
        <div className="text-lg font-bold" style={{ color: table.color || 'var(--celebre-brand)' }}>
          {table.label}
        </div>
        <div className="text-xs text-celebre-muted">
          {table.seats.filter((s) => s.assignment).length}/{table.capacity}
        </div>
      </div>

      {/* Handle de drag */}
      <div
        {...listeners}
        {...attributes}
        className="absolute top-2 left-1/2 -translate-x-1/2 bg-celebre-brand text-white rounded-full p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity touch-none select-none"
        title="Arrastar mesa"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Ações */}
      <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(table)
          }}
          className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
          title="Editar"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(table.id)
          }}
          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          title="Excluir"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Assentos */}
      {table.seats.map((s) => (
        <DroppableSeat key={s.id} seat={s} tableId={table.id} zoom={zoom} />
      ))}
    </div>
  )
}

/** Dropzone de desalocação */
function UnassignedDropzone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned-dropzone',
    data: { type: 'unassigned' },
  })
  return (
    <div
      ref={setNodeRef}
      className={`p-4 space-y-2 min-h-40 transition ring-offset-2 ${
        isOver ? 'ring-2 ring-celebre-brand/60 bg-celebre-accent/20' : ''
      }`}
    >
      {children}
      {isOver && <p className="text-[11px] text-celebre-muted mt-2">Solte para desalocar</p>}
    </div>
  )
}

/* =========================
   Página
   ========================= */

export default function TablePlannerPage() {
  const params = useParams()
  const eventId = params.id as string

  const [data, setData] = useState<TablePlannerData>({ tables: [], unassigned: [] })
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'guest' | 'table' | 'assignment' | null>(null)
  const [history, setHistory] = useState<TablePlannerData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [newTableLabel, setNewTableLabel] = useState('')
  const [newTableCapacity, setNewTableCapacity] = useState(8)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [exporting, setExporting] = useState(false)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } })
  )

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/events/${eventId}/tables`)
        const json = (await res.json()) as TablePlannerData
        setData(json)
        addToHistory(json)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  /* ======= Histórico ======= */

  function addToHistory(next: TablePlannerData) {
    const base = history.slice(0, historyIndex + 1)
    base.push(deepClone(next))
    setHistory(base)
    setHistoryIndex(base.length - 1)
  }
  function undo() {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setData(deepClone(history[historyIndex - 1]))
    }
  }
  function redo() {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setData(deepClone(history[historyIndex + 1]))
    }
  }

  /* ======= Otimistas com rollback ======= */

  async function moveTableOptimistic(tableId: string, nx: number, ny: number) {
    const prev = deepClone(data)
    const tables = data.tables.map((t) => (t.id === tableId ? { ...t, x: nx, y: ny } : t))
    const next = { ...data, tables }
    setData(next)
    addToHistory(next)

    try {
      await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: nx, y: ny }),
      })
    } catch {
      setData(prev) // rollback
      addToHistory(prev)
    }
  }

  async function assignOptimisticSeat({
    guest,
    tableId,
    seatId,
  }: {
    guest: UnassignedGuest
    tableId: string
    seatId: string
  }) {
    const prev = deepClone(data)

    // já ocupado? não move.
    const t = data.tables.find((tt) => tt.id === tableId)
    const seat = t?.seats.find((s) => s.id === seatId)
    if (!t || !seat || seat.assignment) return

    // remover convidado da lista e colocar no seat
    const newUnassigned = data.unassigned.filter((g) => g.id !== guest.id)
    const newTables = data.tables.map((tb) =>
      tb.id !== tableId
        ? tb
        : {
            ...tb,
            seats: tb.seats.map((s) =>
              s.id !== seatId
                ? s
                : {
                    ...s,
                    assignment: {
                      id: `temp-${guest.id}-${Date.now()}`,
                      guest: {
                        id: guest.id,
                        contact: { fullName: guest.contact.fullName, isVip: guest.contact.isVip },
                        children: guest.children,
                      },
                    },
                  }
            ),
          }
    )
    const next = { tables: newTables, unassigned: newUnassigned }
    setData(next)
    addToHistory(next)

    try {
      await fetch(`/api/tables/${tableId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: guest.id, seatId }),
      })
    } catch {
      setData(prev) // rollback
      addToHistory(prev)
    }
  }

  async function moveAssignmentOptimistic({
    fromTableId,
    fromSeatId,
    toTableId,
    toSeatId,
    guestId,
  }: {
    fromTableId: string
    fromSeatId: string
    toTableId: string
    toSeatId: string
    guestId: string
  }) {
    const prev = deepClone(data)

    // validar assentos
    const targetTable = data.tables.find((t) => t.id === toTableId)
    const targetSeat = targetTable?.seats.find((s) => s.id === toSeatId)
    if (!targetTable || !targetSeat || targetSeat.assignment) return

    const sourceTable = data.tables.find((t) => t.id === fromTableId)
    const sourceSeat = sourceTable?.seats.find((s) => s.id === fromSeatId)
    if (!sourceSeat || !sourceSeat.assignment) return

    // otimista
    const nextTables = data.tables.map((tb) => {
      if (tb.id === fromTableId) {
        return {
          ...tb,
          seats: tb.seats.map((s) => (s.id === fromSeatId ? { ...s, assignment: null } : s)),
        }
      }
      if (tb.id === toTableId) {
        return {
          ...tb,
          seats: tb.seats.map((s) =>
            s.id === toSeatId ? { ...s, assignment: sourceSeat.assignment } : s
          ),
        }
      }
      return tb
    })
    const next = { ...data, tables: nextTables }
    setData(next)
    addToHistory(next)

    try {
      await fetch(`/api/tables/${toTableId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, seatId: toSeatId, fromSeatId }),
      })
    } catch {
      setData(prev)
      addToHistory(prev)
    }
  }

  async function unassignOptimistic({
    fromTableId,
    fromSeatId,
  }: {
    fromTableId: string
    fromSeatId: string
  }) {
    const prev = deepClone(data)
    const table = data.tables.find((t) => t.id === fromTableId)
    const seat = table?.seats.find((s) => s.id === fromSeatId)
    if (!seat?.assignment) return

    const guest = seat.assignment.guest
    const newTables = data.tables.map((tb) =>
      tb.id === fromTableId
        ? { ...tb, seats: tb.seats.map((s) => (s.id === fromSeatId ? { ...s, assignment: null } : s)) }
        : tb
    )
    const newUnassigned: UnassignedGuest[] = [
      ...data.unassigned,
      {
        id: guest.id,
        contact: {
          id: guest.id,
          fullName: guest.contact.fullName,
          isVip: guest.contact.isVip,
        },
        household: null,
        children: guest.children,
        seats: 1,
      },
    ]
    const next = { tables: newTables, unassigned: newUnassigned }
    setData(next)
    addToHistory(next)

    try {
      await fetch(`/api/seats/${fromSeatId}/unassign`, { method: 'POST' })
    } catch {
      setData(prev)
      addToHistory(prev)
    }
  }

  /* ======= DnD Callbacks ======= */

  function handleDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    setActiveId(id)
    if (id.startsWith('guest-')) setActiveType('guest')
    else if (id.startsWith('table-')) setActiveType('table')
    else if (id.startsWith('assignment-')) setActiveType('assignment')
  }

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over, delta } = e
    const id = String(active.id)
    const aData = active.data.current as any
    setActiveId(null)
    setActiveType(null)

    if (!over) {
      // mover mesa solta fora de droppable
      if (id.startsWith('table-')) {
        const tableId = id.replace('table-', '')
        const t = data.tables.find((tb) => tb.id === tableId)
        if (!t) return
        const nx = snap(t.x + delta.x / zoom)
        const ny = snap(t.y + delta.y / zoom)
        const safe = findFreeSpot(data.tables, tableId, nx, ny, t.radius)
        await moveTableOptimistic(tableId, safe.x, safe.y)
      }
      return
    }

    const overData = over.data.current as any

    // convidado da lista → assento
    if (id.startsWith('guest-') && overData?.type === 'seat') {
      const guestId = id.replace('guest-', '')
      const guest = data.unassigned.find((g) => g.id === guestId)
      if (!guest) return
      await assignOptimisticSeat({ guest, tableId: overData.tableId, seatId: overData.seatId })
      return
    }

    // assignment → outro assento
    if (id.startsWith('assignment-') && overData?.type === 'seat') {
      await moveAssignmentOptimistic({
        fromTableId: aData.fromTableId,
        fromSeatId: aData.fromSeatId,
        toTableId: overData.tableId,
        toSeatId: overData.seatId,
        guestId: aData.guestId,
      })
      return
    }

    // assignment → zona de desalocar
    if (id.startsWith('assignment-') && over.id === 'unassigned-dropzone') {
      await unassignOptimistic({
        fromTableId: aData.fromTableId,
        fromSeatId: aData.fromSeatId,
      })
      return
    }

    // mover mesa e soltar sobre qualquer coisa
    if (id.startsWith('table-')) {
      const tableId = id.replace('table-', '')
      const t = data.tables.find((tb) => tb.id === tableId)
      if (!t) return
      const nx = snap(t.x + delta.x / zoom)
      const ny = snap(t.y + delta.y / zoom)
      const safe = findFreeSpot(data.tables, tableId, nx, ny, t.radius)
      await moveTableOptimistic(tableId, safe.x, safe.y)
    }
  }

  /* ======= CRUD Mesa ======= */

  async function handleCreateTable() {
    if (!newTableCapacity || newTableCapacity < 2) return
    try {
      const res = await fetch(`/api/events/${eventId}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newTableLabel || `Mesa ${data.tables.length + 1}`,
          capacity: newTableCapacity,
          shape: 'circular',
          x: snap(400 + Math.random() * 200),
          y: snap(300 + Math.random() * 200),
          radius: 80,
          color: '#C7B7F3',
        }),
      })
      if (res.ok) {
        // refresh manual após criação (operação pontual)
        const r2 = await fetch(`/api/events/${eventId}/tables`)
        const json = (await r2.json()) as TablePlannerData
        setData(json)
        addToHistory(json)
        setNewTableCapacity(8)
        setNewTableLabel('')
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleUpdateTable() {
    if (!editingTable) return
    try {
      const res = await fetch(`/api/tables/${editingTable.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editingTable.label,
          capacity: editingTable.capacity,
          color: editingTable.color,
        }),
      })
      if (res.ok) {
        const next = {
          ...data,
          tables: data.tables.map((t) => (t.id === editingTable.id ? { ...editingTable } : t)),
        }
        setData(next)
        addToHistory(next)
        setEditingTable(null)
      }
    } catch {
      // falhou = não altera nada
    }
  }

  async function handleDeleteTable(tableId: string) {
    if (!confirm('Tem certeza que deseja deletar esta mesa?')) return
    const prev = deepClone(data)
    const next = { ...data, tables: data.tables.filter((t) => t.id !== tableId) }
    setData(next)
    addToHistory(next)
    try {
      const res = await fetch(`/api/tables/${tableId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
    } catch {
      setData(prev)
      addToHistory(prev)
    }
  }

  /* ======= Ações especiais ======= */

  async function handleSmartAutoAllocate() {
    // operação em massa → atualiza do servidor ao final
    const availableSeats: Array<{ tableId: string; seatId: string; table: Table }> = []
    data.tables.forEach((table) =>
      table.seats.forEach((seat) => {
        if (!seat.assignment) availableSeats.push({ tableId: table.id, seatId: seat.id, table })
      })
    )

    const householdGroups = new Map<string, UnassignedGuest[]>()
    const vipGuests: UnassignedGuest[] = []
    data.unassigned.forEach((guest) => {
      if (guest.contact.isVip) vipGuests.push(guest)
      else {
        const key = guest.household?.id || guest.id
        if (!householdGroups.has(key)) householdGroups.set(key, [])
        householdGroups.get(key)!.push(guest)
      }
    })

    let seatIndex = 0
    for (const guest of vipGuests) {
      if (seatIndex >= availableSeats.length) break
      const { tableId, seatId } = availableSeats[seatIndex]
      await fetch(`/api/tables/${tableId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: guest.id, seatId }),
      })
      seatIndex++
    }
    for (const [, guests] of householdGroups) {
      let allocated = false
      for (let i = seatIndex; i < availableSeats.length - guests.length + 1; i++) {
        const currentTable = availableSeats[i].table
        const sameTableSeats: typeof availableSeats = []
        for (let j = 0; j < guests.length && i + j < availableSeats.length; j++) {
          if (availableSeats[i + j].table.id === currentTable.id) {
            sameTableSeats.push(availableSeats[i + j])
          }
        }
        if (sameTableSeats.length >= guests.length) {
          for (let k = 0; k < guests.length; k++) {
            const { tableId, seatId } = sameTableSeats[k]
            await fetch(`/api/tables/${tableId}/assign`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ guestId: guests[k].id, seatId }),
            })
          }
          seatIndex = i + guests.length
          allocated = true
          break
        }
      }
      if (!allocated) {
        for (const guest of guests) {
          if (seatIndex >= availableSeats.length) break
          const { tableId, seatId } = availableSeats[seatIndex]
          await fetch(`/api/tables/${tableId}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guestId: guest.id, seatId }),
          })
          seatIndex++
        }
      }
    }

    const r2 = await fetch(`/api/events/${eventId}/tables`)
    const json = (await r2.json()) as TablePlannerData
    setData(json)
    addToHistory(json)
  }

  async function handleAutoArrange() {
    const prev = deepClone(data)
    const arranged = autoLayout(prev.tables)
    const next = { ...prev, tables: arranged }
    setData(next)
    addToHistory(next)

    try {
      await Promise.all(
        arranged.map((t) =>
          fetch(`/api/tables/${t.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: t.x, y: t.y }),
          })
        )
      )
    } catch {
      setData(prev)
      addToHistory(prev)
    }
  }

  async function handleExportPNG() {
    try {
      setExporting(true)
      const node = document.getElementById('planner-canvas')
      if (!node) return
      const dataUrl = await toPng(node, {
        cacheBust: true,
        backgroundColor: '#f9fafb',
        width: CANVAS_W,
        height: CANVAS_H,
        style: { transform: 'none' },
      })
      const link = document.createElement('a')
      link.download = `planner-mesas-${eventId}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setExporting(false)
    }
  }

  /* ======= Render ======= */

  const activeGuest = useMemo(
    () => data.unassigned.find((g) => `guest-${g.id}` === activeId),
    [activeId, data.unassigned]
  )
  const activeTable = useMemo(
    () => data.tables.find((t) => `table-${t.id}` === activeId),
    [activeId, data.tables]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-celebre-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebre-brand mx-auto mb-4"></div>
          <p className="text-celebre-muted">Carregando planner...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="bg-white shadow-celebre border-b">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-heading font-bold text-celebre-ink">Planner de Mesas</h1>
                <p className="text-sm text-celebre-muted mt-1">
                  {data.tables.length} mesas • {data.unassigned.length} não alocados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-celebre-muted w-16 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleAutoArrange}>
                <LayoutGrid className="h-4 w-4 mr-2" />
                Auto-organizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleSmartAutoAllocate}>
                <Users className="h-4 w-4 mr-2" />
                Auto-Alocar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={exporting}>
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exportando...' : 'Exportar PNG'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal editar mesa */}
      {editingTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading">Editar Mesa</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingTable(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-celebre-ink">Nome da Mesa</label>
                <Input
                  value={editingTable.label}
                  onChange={(e) => setEditingTable({ ...editingTable, label: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-celebre-ink">Capacidade</label>
                <Input
                  type="number"
                  value={editingTable.capacity}
                  onChange={(e) =>
                    setEditingTable({
                      ...editingTable,
                      capacity: parseInt(e.target.value || '0', 10) || 8,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-celebre-ink">Cor da mesa</label>
                <Input
                  type="color"
                  value={editingTable.color || '#C7B7F3'}
                  onChange={(e) => setEditingTable({ ...editingTable, color: e.target.value })}
                  className="mt-1 h-10 p-1"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingTable(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleUpdateTable} className="flex-1">
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conteúdo */}
      <DndContext
        sensors={sensors}
        collisionDetection={(args) => {
          const hits = pointerWithin(args)
          return hits.length ? hits : closestCenter(args)
        }}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-[calc(100vh-120px)]">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="font-heading font-semibold text-celebre-ink">Convidados Não Alocados</h2>
              <p className="text-xs text-celebre-muted mt-1">Arraste para as mesas à direita</p>
            </div>

            {/* Criar mesa */}
            <div className="p-4 border-b bg-celebre-accent/20">
              <h3 className="text-sm font-medium mb-3">Nova Mesa</h3>
              <div className="space-y-2">
                <Input
                  placeholder="Nome da mesa"
                  value={newTableLabel}
                  onChange={(e) => setNewTableLabel(e.target.value)}
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Capacidade"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(parseInt(e.target.value || '0', 10) || 8)}
                  className="text-sm"
                />
                <Button size="sm" className="w-full" onClick={handleCreateTable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Mesa
                </Button>
              </div>
            </div>

            {/* Dropzone + lista */}
            <UnassignedDropzone>
              {data.unassigned.length === 0 ? (
                <div className="text-center py-8 text-celebre-muted">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Todos os convidados alocados!</p>
                  <p className="text-xs mt-1">Arraste aqui para desalocar</p>
                </div>
              ) : (
                data.unassigned.map((g) => <DraggableGuest key={g.id} guest={g} />)
              )}
            </UnassignedDropzone>
          </div>

          {/* Canvas com zoom lógico */}
          <div className="flex-1 overflow-auto bg-gray-50 select-none">
            <div
              id="planner-canvas"
              className="relative"
              style={{
                width: CANVAS_W * zoom,
                height: CANVAS_H * zoom,
              }}
            >
              {data.tables.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-celebre-muted">
                    <Plus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma mesa criada ainda</p>
                    <p className="text-sm mt-2">Use o formulário à esquerda para criar mesas</p>
                  </div>
                </div>
              ) : (
                data.tables.map((t) => (
                  <DraggableTable
                    key={t.id}
                    table={t}
                    zoom={zoom}
                    onEdit={setEditingTable}
                    onDelete={handleDeleteTable}
                  />
                ))
              )}
            </div>
          </div>

          {/* Overlays */}
          <DragOverlay>
            {activeId && activeType === 'guest' && activeGuest && (
              <div className="p-3 bg-white border-2 border-celebre-brand rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  {activeGuest.contact.isVip && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  )}
                  <span className="text-sm font-medium">{activeGuest.contact.fullName}</span>
                </div>
              </div>
            )}
            {activeId && activeType === 'table' && activeTable && (
              <div className="w-24 h-24 bg-white rounded-full border-4 border-celebre-brand shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-bold text-celebre-brand">{activeTable.label}</div>
                </div>
              </div>
            )}
          </DragOverlay>
        </div>
      </DndContext>
    </div>
  )
}
