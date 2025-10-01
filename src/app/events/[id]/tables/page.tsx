'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import {
  ArrowLeft,
  Plus,
  Download,
  Save,
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
} from 'lucide-react'
import { toPng } from 'html-to-image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface Seat {
  id: string
  index: number
  x: number
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
  shape: string
  x: number
  y: number
  radius: number
  seats: Seat[]
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

// Draggable Guest Component
function DraggableGuest({ guest }: { guest: UnassignedGuest }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `guest-${guest.id}`,
    data: { type: 'guest', guest },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-white border rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2">
        {guest.contact.isVip && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
        <span className="text-sm font-medium truncate">{guest.contact.fullName}</span>
      </div>
      {guest.household && (
        <p className="text-xs text-celebre-muted mt-1">{guest.household.label}</p>
      )}
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

// Droppable Seat Component
function DroppableSeat({ seat, tableId }: { seat: Seat; tableId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `seat-${tableId}-${seat.id}`,
    data: { type: 'seat', seatId: seat.id, tableId },
  })

  return (
    <div
      ref={setNodeRef}
      className={`absolute w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all ${
        seat.assignment
          ? 'bg-celebre-brand text-white border-celebre-brand'
          : isOver
            ? 'bg-celebre-accent border-celebre-brand'
            : 'bg-white border-gray-300 hover:border-celebre-brand'
      }`}
      style={{
        left: `${seat.x}px`,
        top: `${seat.y}px`,
        transform: `translate(-50%, -50%)`,
      }}
      title={seat.assignment?.guest.contact.fullName || 'Vazio'}
    >
      {seat.assignment ? (
        <div className="text-center">
          {seat.assignment.guest.contact.isVip && '⭐'}
          {!seat.assignment.guest.contact.isVip && seat.index + 1}
        </div>
      ) : (
        seat.index + 1
      )}
    </div>
  )
}

// Draggable Table Component
function DraggableTable({
  table,
  onEdit,
  onDelete,
}: {
  table: Table
  onEdit: (table: Table) => void
  onDelete: (tableId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `table-${table.id}`,
    data: { type: 'table', table },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.7 : 1,
    cursor: 'move',
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        left: `${table.x}px`,
        top: `${table.y}px`,
        width: `${table.radius * 2}px`,
        height: `${table.radius * 2}px`,
        transform: `${style.transform || ''} translate(-50%, -50%)`,
      }}
      className="absolute bg-white rounded-full border-4 border-celebre-brand shadow-lg flex items-center justify-center group"
    >
      {/* Table Label */}
      <div className="text-center pointer-events-none">
        <div className="text-lg font-bold text-celebre-brand">{table.label}</div>
        <div className="text-xs text-celebre-muted">
          {table.seats.filter((s) => s.assignment).length}/{table.capacity}
        </div>
      </div>

      {/* Drag Handle */}
      <div
        {...listeners}
        {...attributes}
        className="absolute top-2 left-1/2 -translate-x-1/2 bg-celebre-brand text-white rounded-full p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      {/* Action Buttons */}
      <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(table)
          }}
          className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(table.id)
          }}
          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Seats */}
      {table.seats.map((seat) => (
        <DroppableSeat key={seat.id} seat={seat} tableId={table.id} />
      ))}
    </div>
  )
}

export default function TablePlannerPage() {
  const params = useParams()
  const eventId = params.id as string
  const canvasRef = useRef<HTMLDivElement>(null)

  const [data, setData] = useState<TablePlannerData>({ tables: [], unassigned: [] })
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'guest' | 'table' | null>(null)
  const [history, setHistory] = useState<TablePlannerData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [newTableLabel, setNewTableLabel] = useState('')
  const [newTableCapacity, setNewTableCapacity] = useState(8)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [exporting, setExporting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchTablePlanner()
  }, [eventId])

  async function fetchTablePlanner() {
    try {
      setLoading(true)
      const res = await fetch(`/api/events/${eventId}/tables`)
      const json = await res.json()
      setData(json)
      addToHistory(json)
    } catch (error) {
      console.error('Error fetching table planner:', error)
    } finally {
      setLoading(false)
    }
  }

  function addToHistory(newData: TablePlannerData) {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newData)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  function undo() {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setData(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setData(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string
    setActiveId(id)

    if (id.startsWith('guest-')) {
      setActiveType('guest')
    } else if (id.startsWith('table-')) {
      setActiveType('table')
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event
    setActiveId(null)
    setActiveType(null)

    if (!over && activeType === 'table') {
      // Moving table in canvas
      const tableId = (active.id as string).replace('table-', '')
      const table = data.tables.find((t) => t.id === tableId)
      if (table) {
        const newTables = data.tables.map((t) =>
          t.id === tableId
            ? { ...t, x: t.x + delta.x / zoom, y: t.y + delta.y / zoom }
            : t
        )
        const newData = { ...data, tables: newTables }
        setData(newData)
        addToHistory(newData)

        // Save to backend
        await fetch(`/api/tables/${tableId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: table.x + delta.x / zoom, y: table.y + delta.y / zoom }),
        })
      }
      return
    }

    if (!over || activeType !== 'guest') return

    const overData = over.data.current
    if (overData?.type !== 'seat') return

    const guestId = (active.id as string).replace('guest-', '')
    const seatId = overData.seatId

    try {
      const res = await fetch(`/api/tables/${overData.tableId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, seatId }),
      })

      if (res.ok) {
        await fetchTablePlanner()
      }
    } catch (error) {
      console.error('Error assigning seat:', error)
    }
  }

  async function handleCreateTable() {
    if (!newTableLabel || newTableCapacity < 2) return

    try {
      const res = await fetch(`/api/events/${eventId}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newTableLabel,
          capacity: newTableCapacity,
          shape: 'circular',
          x: 400 + Math.random() * 200,
          y: 300 + Math.random() * 200,
          radius: 80,
        }),
      })

      if (res.ok) {
        setNewTableLabel('')
        setNewTableCapacity(8)
        await fetchTablePlanner()
      }
    } catch (error) {
      console.error('Error creating table:', error)
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
        }),
      })

      if (res.ok) {
        setEditingTable(null)
        await fetchTablePlanner()
      }
    } catch (error) {
      console.error('Error updating table:', error)
    }
  }

  async function handleDeleteTable(tableId: string) {
    if (!confirm('Tem certeza que deseja deletar esta mesa?')) return

    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchTablePlanner()
      }
    } catch (error) {
      console.error('Error deleting table:', error)
    }
  }

  async function handleSmartAutoAllocate() {
    const availableSeats: Array<{ tableId: string; seatId: string; table: Table }> = []

    // Collect all available seats with table info
    data.tables.forEach((table) => {
      table.seats.forEach((seat) => {
        if (!seat.assignment) {
          availableSeats.push({ tableId: table.id, seatId: seat.id, table })
        }
      })
    })

    // Group guests by household
    const householdGroups = new Map<string, UnassignedGuest[]>()
    const vipGuests: UnassignedGuest[] = []

    data.unassigned.forEach((guest) => {
      if (guest.contact.isVip) {
        vipGuests.push(guest)
      } else {
        const key = guest.household?.id || guest.id
        if (!householdGroups.has(key)) {
          householdGroups.set(key, [])
        }
        householdGroups.get(key)!.push(guest)
      }
    })

    let seatIndex = 0

    // First, allocate VIPs to first tables
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

    // Then, allocate households together
    for (const [_, guests] of householdGroups) {
      // Try to find a table with enough consecutive seats
      let allocated = false

      for (let i = seatIndex; i < availableSeats.length - guests.length + 1; i++) {
        const currentTable = availableSeats[i].table
        const sameTableSeats = []

        for (let j = 0; j < guests.length && i + j < availableSeats.length; j++) {
          if (availableSeats[i + j].table.id === currentTable.id) {
            sameTableSeats.push(availableSeats[i + j])
          }
        }

        if (sameTableSeats.length >= guests.length) {
          // Allocate family to same table
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

      // If can't keep family together, allocate separately
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

    await fetchTablePlanner()
  }

  async function handleExportPNG() {
    if (!canvasRef.current) return

    try {
      setExporting(true)
      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        backgroundColor: '#f9fafb',
        width: canvasRef.current.scrollWidth,
        height: canvasRef.current.scrollHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      })

      const link = document.createElement('a')
      link.download = `planner-mesas-${eventId}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Error exporting PNG:', error)
      alert('Erro ao exportar imagem. Tente novamente.')
    } finally {
      setExporting(false)
    }
  }

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

  const activeGuest = data.unassigned.find((g) => `guest-${g.id}` === activeId)
  const activeTable = data.tables.find((t) => `table-${t.id}` === activeId)

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
                <h1 className="text-2xl font-heading font-bold text-celebre-ink">
                  Planner de Mesas
                </h1>
                <p className="text-sm text-celebre-muted mt-1">
                  {data.tables.length} mesas • {data.unassigned.length} não alocados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
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
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-celebre-muted w-16 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                <ZoomIn className="h-4 w-4" />
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

      {/* Edit Table Modal */}
      {editingTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading">Editar Mesa</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingTable(null)}
                >
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
                    setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 8 })
                  }
                  className="mt-1"
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

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-heading font-semibold text-celebre-ink">
              Convidados Não Alocados
            </h2>
            <p className="text-xs text-celebre-muted mt-1">
              Arraste para as mesas à direita
            </p>
          </div>

          {/* Create Table Form */}
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
                onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 8)}
                className="text-sm"
              />
              <Button size="sm" className="w-full" onClick={handleCreateTable}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Mesa
              </Button>
            </div>
          </div>

          {/* Unassigned List */}
          <div className="p-4 space-y-2">
            {data.unassigned.length === 0 ? (
              <div className="text-center py-8 text-celebre-muted">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Todos os convidados alocados!</p>
              </div>
            ) : (
              data.unassigned.map((guest) => <DraggableGuest key={guest.id} guest={guest} />)
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-50" ref={canvasRef}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div
              className="relative w-[2000px] h-[1500px]"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
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
                data.tables.map((table) => (
                  <DraggableTable
                    key={table.id}
                    table={table}
                    onEdit={setEditingTable}
                    onDelete={handleDeleteTable}
                  />
                ))
              )}
            </div>

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
                <div className="w-32 h-32 bg-white rounded-full border-4 border-celebre-brand shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-celebre-brand">{activeTable.label}</div>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  )
}