'use client'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import { toPng } from 'html-to-image'
import { ArrowLeft, Plus, Users, X, LayoutGrid, Search, Filter, List, Map } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import {
  CreateTableModal,
  ElementsPalette,
  GuestChip,
  TablesCanvas,
  TablesListView,
  Toolbar,
  UnassignedZone,
  TableStage,
  TableLayoutToolbar,
} from '@/features/tables/components'
import { ExportCanvas } from '@/features/tables/components/ExportCanvas'
import {
  useAssignGuestToSeat,
  useCreateTable,
  useDeleteTable,
  useUnassignGuestFromSeat,
  useUpdateTable,
} from '@/features/tables/hooks/useTables'
import { useTablePlannerWithCache } from '@/features/tables/hooks'
import { createPlannerSelector, getPlannerStore } from '@/features/tables/stores/usePlannerStore'
import { cn } from '@/lib/utils'
import type { Table } from '@/schemas'

/* =========================
   Constantes / Utils / Types
   ========================= */

interface DragData {
  type?: string;
  tableId?: string;
  seatId?: string;
  guestId?: string;
  fromSeatId?: string;
}

const CANVAS_W = 2000
const CANVAS_H = 1500
const GRID = 16
const MIN_GAP = 64
const GUEST_PANEL_WIDTH = 288
const ELEMENT_PANEL_WIDTH = 320
const PANEL_TRANSITION = { type: 'spring', stiffness: 260, damping: 24 } as const
const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const


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

function findFreeSpot(
  tables: Table[],
  movingId: string,
  x: number,
  y: number,
  r: number
): { x: number; y: number } {
  const candidate = { x: snap(x), y: snap(y) }
  const others = tables.filter((t) => t.id !== movingId)

  const inBounds = (cx: number, cy: number) =>
    cx - r >= 0 && cy - r >= 0 && cx + r <= CANVAS_W && cy + r <= CANVAS_H

  const collides = (cx: number, cy: number) =>
    others.some((t) =>
      circlesCollide({ x: cx, y: cy, r }, { x: t.x, y: t.y, r: t.radius }, MIN_GAP)
    )

  candidate.x = clamp(candidate.x, r, CANVAS_W - r)
  candidate.y = clamp(candidate.y, r, CANVAS_H - r)

  if (!collides(candidate.x, candidate.y) && inBounds(candidate.x, candidate.y)) return candidate

  // Busca em espiral
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
        cx += DIRS[dir]![0]! * GRID
        cy += DIRS[dir]![1]! * GRID
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

function autoLayout(tables: Table[]): Table[] {
  if (!tables.length) return tables
  const maxDiameter = Math.max(...tables.map((t) => t.radius * 2))
  const cell = snap(maxDiameter + MIN_GAP)
  const cols = Math.max(1, Math.floor(CANVAS_W / cell))

  return tables.map((t, idx) => {
    const c = idx % cols
    const r = Math.floor(idx / cols)
    const x = snap(c * cell + cell / 2)
    const y = snap(r * cell + cell / 2)
    return { ...t, x, y }
  })
}

/* =========================
   Página
   ========================= */

export default function TablePlannerPage() {
  const params = useParams()
  const eventId = params.id as string
  const { toast } = useToast()

  // React Query hooks
  const { data, isLoading } = useTablePlannerWithCache(eventId)
  const createTableMutation = useCreateTable()
  const updateTableMutation = useUpdateTable()
  const deleteTableMutation = useDeleteTable()
  const assignMutation = useAssignGuestToSeat()
  const unassignMutation = useUnassignGuestFromSeat()

  // Zustand store
  const plannerStore = getPlannerStore(eventId)
  const zoom = createPlannerSelector(plannerStore, (state) => state.zoom)
  const activeId = createPlannerSelector(plannerStore, (state) => state.activeId)
  const setActiveId = createPlannerSelector(plannerStore, (state) => state.setActiveId)
  const addToHistory = createPlannerSelector(plannerStore, (state) => state.addToHistory)
  const showElementsPalette = createPlannerSelector(
    plannerStore,
    (state) => state.showElementsPalette
  )

  // Local state
  const [creatingTable, setCreatingTable] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [exporting, setExporting] = useState(false)
  const [guestPanelOpen, setGuestPanelOpen] = useState(true)
  const [useStageMode, setUseStageMode] = useState(true) // NEW: Stage mode toggle
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [decorativeElements, setDecorativeElements] = useState<any[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [guestSearchQuery, setGuestSearchQuery] = useState('')
  const [selectedHousehold, setSelectedHousehold] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')

  const interactiveButtonClasses = 'transition-transform duration-200 ease-smooth hover:bg-muted/60 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]'
  const mobilePanelTransition = { duration: 0.3, ease: EASE_SMOOTH }
  const exportCanvasRef = useRef<HTMLDivElement>(null)

  // DnD Sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  // Add to history when data changes
  useEffect(() => {
    if (data) {
      addToHistory(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.tables.length, data?.unassigned.length])

  // Extract data
  const tables = data?.tables || []
  const unassignedAll = data?.unassigned || []

  // Filter guests based on search and household
  const unassigned = unassignedAll.filter((guest) => {
    const matchesSearch = !guestSearchQuery ||
      guest.contact.fullName.toLowerCase().includes(guestSearchQuery.toLowerCase())
    const matchesHousehold = !selectedHousehold ||
      guest.household?.id === selectedHousehold
    return matchesSearch && matchesHousehold
  })

  // Get unique households for filter
  const households = Array.from(
    new Set(unassignedAll.filter(g => g.household).map(g => g.household!))
  ).filter((h, i, arr) => arr.findIndex(x => x.id === h.id) === i)

  // Calculate statistics
  const totalSeats = tables.reduce((sum, table) => sum + table.capacity, 0)
  const occupiedSeats = tables.reduce(
    (sum, table) => sum + (table.seats?.filter((s) => s.assignment).length || 0),
    0
  )
  const occupancyPercentage = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0
  const fullyOccupiedTables = tables.filter(
    (table) => table.seats?.filter((s) => s.assignment).length === table.capacity
  ).length

  /* ======= DnD Callbacks ======= */

  function handleDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    if (id.startsWith('guest-')) setActiveId(id, 'guest')
    else if (id.startsWith('table-')) setActiveId(id, 'table')
    else if (id.startsWith('assignment-')) setActiveId(id, 'assignment')
    else if (id.startsWith('new-element-')) setActiveId(id, 'element')
  }

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over, delta } = e
    const id = String(active.id)
    const aData = active.data.current as DragData | null
    setActiveId(null, null)

    const overData = over?.data.current as DragData | null

    // Mover mesa (tanto sobre canvas quanto fora)
    if (id.startsWith('table-')) {
      const tableId = id.replace('table-', '')
      const t = tables.find((tb) => tb.id === tableId)
      if (!t) return

      // Calcula nova posição baseada no delta dividido pelo zoom
      const nx = snap(t.x + delta.x / zoom)
      const ny = snap(t.y + delta.y / zoom)
      const safe = findFreeSpot(tables, tableId, nx, ny, t.radius)

      try {
        await updateTableMutation.mutateAsync({
          id: tableId,
          data: { x: safe.x, y: safe.y },
        })
      } catch (error) {
        console.error(error)
        toast({
          title: 'Erro',
          description: 'Não foi possível mover a mesa',
          variant: 'destructive',
        })
      }
      return
    }

    if (!over) return

    // Convidado da lista → assento
    if (id.startsWith('guest-') && overData?.type === 'seat') {
      const guestId = id.replace('guest-', '')
      const guest = unassigned.find((g) => g.id === guestId)
      if (!guest) return

      try {
        await assignMutation.mutateAsync({
          tableId: overData.tableId,
          data: { guestId, seatId: overData.seatId },
        })
        toast({
          title: 'Convidado alocado',
          description: `${guest.contact.fullName} foi alocado com sucesso`,
        })
      } catch (error) {
        console.error(error)
        toast({
          title: 'Erro',
          description: 'Não foi possível alocar o convidado',
          variant: 'destructive',
        })
      }
      return
    }

    // Assignment → outro assento
    if (id.startsWith('assignment-') && overData?.type === 'seat') {
      try {
        await assignMutation.mutateAsync({
          tableId: overData.tableId,
          data: {
            guestId: aData.guestId,
            seatId: overData.seatId,
            fromSeatId: aData.fromSeatId,
          },
        })
        toast({
          title: 'Convidado realocado',
          description: 'O convidado foi movido com sucesso',
        })
      } catch (error) {
        console.error(error)
        toast({
          title: 'Erro',
          description: 'Não foi possível realocar o convidado',
          variant: 'destructive',
        })
      }
      return
    }

    // Assignment → zona de desalocar
    if (id.startsWith('assignment-') && over.id === 'unassigned-dropzone') {
      try {
        await unassignMutation.mutateAsync(aData.fromSeatId)
        toast({
          title: 'Convidado desalocado',
          description: 'O convidado foi removido do assento',
        })
      } catch (error) {
        console.error(error)
        toast({
          title: 'Erro',
          description: 'Não foi possível desalocar o convidado',
          variant: 'destructive',
        })
      }
      return
    }
  }

  /* ======= CRUD Mesa ======= */

  async function handleCreateTable(data: {
    label: string
    capacity: number
    color: string
    shape: 'round' | 'square'
    tableType: 'regular' | 'vip' | 'family' | 'kids' | 'singles'
  }) {
    try {
      await createTableMutation.mutateAsync({
        label: data.label,
        capacity: data.capacity,
        shape: data.shape,
        tableType: data.tableType,
        x: snap(400 + Math.random() * 200),
        y: snap(300 + Math.random() * 200),
        radius: 80,
        rotation: 0,
        color: data.color,
      })

      toast({
        title: 'Mesa criada',
        description: 'A mesa foi adicionada com sucesso',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a mesa',
        variant: 'destructive',
      })
    }
  }

  async function handleUpdateTable() {
    if (!editingTable) return

    try {
      await updateTableMutation.mutateAsync({
        id: editingTable.id,
        data: {
          label: editingTable.label,
          capacity: editingTable.capacity,
          color: editingTable.color,
          shape: editingTable.shape,
        },
      })

      toast({
        title: 'Mesa atualizada',
        description: 'As alterações foram salvas',
      })

      setEditingTable(null)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a mesa',
        variant: 'destructive',
      })
    }
  }

  async function handleDeleteTable(tableId: string) {
    if (!confirm('Tem certeza que deseja deletar esta mesa?')) return

    try {
      await deleteTableMutation.mutateAsync(tableId)
      toast({
        title: 'Mesa excluída',
        description: 'A mesa foi removida com sucesso',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a mesa',
        variant: 'destructive',
      })
    }
  }

  /* ======= Ações especiais ======= */

  async function handleAutoArrange() {
    const arranged = autoLayout(tables)

    try {
      await Promise.all(
        arranged.map((t) =>
          updateTableMutation.mutateAsync({
            id: t.id,
            data: { x: t.x, y: t.y },
          })
        )
      )

      toast({
        title: 'Mesas organizadas',
        description: 'As mesas foram reorganizadas automaticamente',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível organizar as mesas',
        variant: 'destructive',
      })
    }
  }

  async function handleAutoAllocate() {
    toast({
      title: 'Auto-alocação',
      description: 'Funcionalidade em desenvolvimento',
    })
  }

  async function handleExport() {
    if (!exportCanvasRef.current) return

    try {
      setExporting(true)
      const dataUrl = await toPng(exportCanvasRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        width: CANVAS_W + 80,
        height: CANVAS_H + 80,
      })
      const link = document.createElement('a')
      link.download = `planner-mesas-${eventId}.png`
      link.href = dataUrl
      link.click()

      toast({
        title: 'Exportado',
        description: 'O layout foi exportado como imagem',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar a imagem',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  /* ======= Render ======= */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
        <div className="text-center">
          <div className="border-celebre-brand mx-auto mb-4 size-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-celebre-muted">Carregando planner de mesas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex flex-1 items-center gap-4">
            <Link href={`/events/${eventId}`}>
              <Button
                variant="ghost"
                size="icon"
                className={interactiveButtonClasses}
              >
                <ArrowLeft className="size-5" />
                <span className="sr-only">Voltar para o evento</span>
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="font-heading text-2xl font-bold text-celebre-ink">
                Planner de Mesas
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <LayoutGrid className="size-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-celebre-ink">{tables.length}</p>
                    <p className="text-xs text-celebre-muted">
                      Mesa{tables.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Users className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-celebre-ink">
                      {occupiedSeats} / {totalSeats}
                    </p>
                    <p className="text-xs text-celebre-muted">Assentos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-green-100 p-2">
                    <span className="text-sm font-bold text-green-600">{occupancyPercentage}%</span>
                  </div>
                  <div>
                    <p className="font-medium text-celebre-ink">{fullyOccupiedTables}</p>
                    <p className="text-xs text-celebre-muted">Completas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-orange-100 p-2">
                    <Users className="size-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-celebre-ink">{unassignedAll.length}</p>
                    <p className="text-xs text-celebre-muted">Não alocados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={useStageMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUseStageMode(!useStageMode)}
              className={cn('rounded-full', interactiveButtonClasses)}
            >
              <LayoutGrid className="mr-1 size-4" />
              {useStageMode ? 'Editar Mapa dos Convidados' : 'Implementar Convidados'}
            </Button>
            {!useStageMode && (
              <>
                <div className="flex items-center gap-1 rounded-full border border-border p-1">
                  <Button
                    type="button"
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                    className="rounded-full"
                  >
                    <Map className="mr-1 size-4" />
                    Mapa
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-full"
                  >
                    <List className="mr-1 size-4" />
                    Lista
                  </Button>
                </div>
                {viewMode === 'map' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setGuestPanelOpen((prev) => !prev)}
                    aria-expanded={guestPanelOpen}
                    aria-controls="guest-panel-desktop"
                    data-state={guestPanelOpen ? 'open' : 'closed'}
                    className={cn("hidden items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium md:inline-flex", interactiveButtonClasses, "data-[state=open]:bg-muted/60")}
                  >
                    <Users className="size-4" aria-hidden="true" />
                    {guestPanelOpen ? 'Ocultar nomes' : 'Mostrar nomes'}
                  </Button>
                )}
              </>
            )}
            <Toolbar
              onExport={handleExport}
              onAutoArrange={handleAutoArrange}
              onAutoAllocate={handleAutoAllocate}
              exporting={exporting}
              eventId={eventId}
              plannerStore={plannerStore}
            />
          </div>
        </div>
      </header>

      {/* Modal de Criação */}
      {creatingTable && (
        <CreateTableModal
          onClose={() => setCreatingTable(false)}
          onCreate={handleCreateTable}
          tablesCount={tables.length}
        />
      )}

      {/* Modal de Edição */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading">Editar Mesa</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingTable(null)} className={interactiveButtonClasses}>
                  <X className="size-4" />
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
                  min="2"
                  value={editingTable.capacity}
                  onChange={(e) =>
                    setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 2 })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-celebre-ink">Formato</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingTable({ ...editingTable, shape: 'round' })}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all',
                      editingTable.shape === 'round'
                        ? 'border-celebre-brand bg-celebre-accent/10'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="size-12 rounded-full border-4 border-current" />
                    <span className="text-xs font-medium">Redonda</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTable({ ...editingTable, shape: 'square' })}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all',
                      editingTable.shape === 'square'
                        ? 'border-celebre-brand bg-celebre-accent/10'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="size-12 rounded-lg border-4 border-current" />
                    <span className="text-xs font-medium">Quadrada</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-celebre-ink">Cor</label>
                <Input
                  type="color"
                  value={editingTable.color || '#C7B7F3'}
                  onChange={(e) => setEditingTable({ ...editingTable, color: e.target.value })}
                  className="mt-1 h-10"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingTable(null)} className={cn('flex-1', interactiveButtonClasses)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateTable} className={cn('flex-1', interactiveButtonClasses)}>
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto,1fr] md:gap-6">
            <div className="md:hidden">
              <Accordion type="single" collapsible className="rounded-3xl border border-border bg-card">
                <AccordionItem value="guest-panel" className="border-none">
                  <AccordionTrigger className="px-4 py-3 text-left text-sm font-semibold transition-colors ease-smooth hover:bg-muted/60 data-[state=open]:rounded-t-3xl data-[state=open]:bg-muted/50">
                    <span className="flex items-center gap-2">
                      <Users className="size-5" aria-hidden="true" />
                      Convidados ({unassigned.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="space-y-3 px-4 pb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-celebre-muted" />
                        <Input
                          type="text"
                          placeholder="Buscar convidado..."
                          value={guestSearchQuery}
                          onChange={(e) => setGuestSearchQuery(e.target.value)}
                          className="pl-9 text-sm"
                        />
                      </div>
                      {households.length > 0 && (
                        <select
                          value={selectedHousehold || ''}
                          onChange={(e) => setSelectedHousehold(e.target.value || null)}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Todos os grupos</option>
                          {households.map((household) => (
                            <option key={household.id} value={household.id}>
                              {household.label} ({unassignedAll.filter(g => g.household?.id === household.id).length})
                            </option>
                          ))}
                        </select>
                      )}
                      <div className="max-h-[50vh] space-y-3 overflow-y-auto">
                        <UnassignedZone>
                          {unassigned.length === 0 ? (
                            <p className="py-6 text-center text-sm text-celebre-muted">
                              {guestSearchQuery || selectedHousehold
                                ? 'Nenhum convidado encontrado'
                                : 'Todos os convidados foram alocados'}
                            </p>
                          ) : (
                            unassigned.map((guest) => <GuestChip key={guest.id} guest={guest} />)
                          )}
                        </UnassignedZone>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <AnimatePresence initial={false}>
              {guestPanelOpen && (
                <motion.aside
                  key="guest-panel-desktop"
                  layout
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: GUEST_PANEL_WIDTH, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={PANEL_TRANSITION}
                  className="hidden md:flex md:overflow-hidden"
                >
                  <div className="md:sticky md:top-4">
                    <Card
                      id="guest-panel-desktop"
                      className="h-full w-72 border border-border bg-card shadow-elevation-2"
                    >
                      <CardHeader className="flex flex-col gap-2 pb-3">
                        <CardTitle className="font-heading flex items-center gap-2 text-lg">
                          <Users className="size-5" aria-hidden="true" />
                          Convidados ({unassigned.length})
                        </CardTitle>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-celebre-muted" />
                          <Input
                            type="text"
                            placeholder="Buscar convidado..."
                            value={guestSearchQuery}
                            onChange={(e) => setGuestSearchQuery(e.target.value)}
                            className="pl-9 text-sm"
                          />
                        </div>
                        {households.length > 0 && (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-medium text-celebre-muted">
                              <Filter className="size-3" />
                              <span>Filtrar por grupo</span>
                            </div>
                            <select
                              value={selectedHousehold || ''}
                              onChange={(e) => setSelectedHousehold(e.target.value || null)}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">Todos os grupos</option>
                              {households.map((household) => (
                                <option key={household.id} value={household.id}>
                                  {household.label} ({unassignedAll.filter(g => g.household?.id === household.id).length})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                        <UnassignedZone>
                          {unassigned.length === 0 ? (
                            <p className="py-8 text-center text-sm text-celebre-muted">
                              {guestSearchQuery || selectedHousehold
                                ? 'Nenhum convidado encontrado'
                                : 'Todos os convidados foram alocados'}
                            </p>
                          ) : (
                            unassigned.map((guest) => <GuestChip key={guest.id} guest={guest} />)
                          )}
                        </UnassignedZone>
                      </CardContent>
                    </Card>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            <div className="flex min-w-0 flex-col gap-4">
              {useStageMode ? (
                /* ===== STAGE MODE ===== */
                <div className="flex h-[calc(100vh-200px)] gap-4">
                  <AnimatePresence initial={false}>
                    {showElementsPalette && (
                      <motion.aside
                        key="elements-stage"
                        layout
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: ELEMENT_PANEL_WIDTH, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={PANEL_TRANSITION}
                        className="overflow-hidden"
                      >
                        <div className="w-80">
                          <ElementsPalette
                            isDragMode={false}
                            onElementClick={(element) => {
                              // Adiciona elemento no centro do canvas
                              const newElement = {
                                id: `element-${Date.now()}`,
                                type: element.type,
                                x: (CANVAS_W / 2) - (element.defaultWidth / 2),
                                y: (CANVAS_H / 2) - (element.defaultHeight / 2),
                                width: element.defaultWidth,
                                height: element.defaultHeight,
                                color: element.color,
                              };
                              setDecorativeElements([...decorativeElements, newElement]);
                              setSelectedElementId(newElement.id);

                              toast({
                                title: 'Elemento adicionado',
                                description: `${element.label} foi adicionado ao canvas`,
                              });
                            }}
                          />
                        </div>
                      </motion.aside>
                    )}
                  </AnimatePresence>
                  <Card className="flex flex-1 flex-col border border-border bg-card shadow-elevation-2">
                    <CardHeader className="flex flex-col gap-3 border-b pb-3">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <CardTitle className="font-heading text-lg">Layout Visual das Mesas</CardTitle>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setCreatingTable(true)}
                          className={cn('rounded-full', interactiveButtonClasses)}
                        >
                          <Plus className="mr-1 size-4" />
                          Nova Mesa
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                      <TableStage
                        tables={tables}
                        width={CANVAS_W}
                        height={CANVAS_H}
                        showGrid={true}
                        snapToGrid={snapToGrid}
                        onUpdateTable={async (id, updates) => {
                          try {
                            await updateTableMutation.mutateAsync({ id, data: updates })
                          } catch (error) {
                            toast({
                              title: 'Erro',
                              description: `Não foi possível atualizar a mesa - erro ao salvar ${error}`,
                              variant: 'destructive',
                            })
                          }
                        }}
                        onEditTable={setEditingTable}
                        onDeleteTable={handleDeleteTable}
                        selectedTableId={selectedTableId}
                        onSelectTable={setSelectedTableId}
                        decorativeElements={decorativeElements}
                        onAddElement={(element) => setDecorativeElements([...decorativeElements, element])}
                        onUpdateElement={(id, updates) => {
                          setDecorativeElements(decorativeElements.map((el) =>
                            el.id === id ? { ...el, ...updates } : el
                          ))
                        }}
                        onDeleteElement={(id) => setDecorativeElements(decorativeElements.filter((el) => el.id !== id))}
                        selectedElementId={selectedElementId}
                        onSelectElement={setSelectedElementId}
                      />
                    </CardContent>
                  </Card>
                  <TableLayoutToolbar
                    tables={tables}
                    selectedTable={tables.find((t) => t.id === selectedTableId) || null}
                    onUpdateTable={async (id, updates) => {
                      try {
                        await updateTableMutation.mutateAsync({ id, data: updates })
                      } catch (error) {
                        toast({
                          title: 'Erro',
                          description: `Não foi possível atualizar a mesa, erro ao salvar: ${error}`,
                          variant: 'destructive',
                        })
                      }
                    }}
                    snapToGrid={snapToGrid}
                    onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
                  />
                </div>
              ) : (
                /* ===== CLASSIC MODE ===== */
                <>
                <motion.div layout className="flex min-w-0 flex-col gap-4 lg:flex-row">
                  <motion.div layout className="flex min-w-0 flex-1">
                    <Card className="w-full border border-border bg-card shadow-elevation-2">
                      <CardHeader className="flex flex-col gap-3 pb-3">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <CardTitle className="font-heading text-lg">
                            {viewMode === 'map' ? 'Layout das Mesas' : 'Lista de Mesas'}
                          </CardTitle>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setCreatingTable(true)}
                            className={cn('rounded-full', interactiveButtonClasses)}
                          >
                            <Plus className="mr-1 size-4" />
                            Nova Mesa
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className={cn(
                        "transition-colors duration-200 ease-smooth",
                        viewMode === 'map' ? "overflow-auto rounded-3xl border border-dashed border-muted/50 bg-white p-4" : "p-4"
                      )}>
                        {viewMode === 'map' ? (
                          <TablesCanvas
                            tables={tables}
                            zoom={zoom}
                            canvasWidth={CANVAS_W}
                            canvasHeight={CANVAS_H}
                            onEditTable={setEditingTable}
                            onDeleteTable={handleDeleteTable}
                          />
                        ) : (
                          <TablesListView
                            tables={tables}
                            onEditTable={setEditingTable}
                            onDeleteTable={handleDeleteTable}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                <AnimatePresence initial={false}>
                  {showElementsPalette && (
                    <motion.aside
                      key="elements-desktop"
                      layout
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: ELEMENT_PANEL_WIDTH, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={PANEL_TRANSITION}
                      className="hidden lg:flex lg:overflow-hidden"
                    >
                      <div className="w-80">
                        <ElementsPalette />
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>
                </motion.div>
                <AnimatePresence>
                  {showElementsPalette && (
                    <motion.div
                      key="elements-mobile"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={mobilePanelTransition}
                      className="lg:hidden"
                    >
                      <ElementsPalette />
                    </motion.div>
                  )}
                </AnimatePresence>
                </>
              )}
            </div>
          </div>
          <DragOverlay dropAnimation={null}>
            {activeId ? (
              <div className="border-celebre-brand rounded-lg border-2 bg-white p-3 shadow-elevation-2 transition-shadow duration-200 ease-smooth">
                {activeId.startsWith('guest-') && (
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    <span className="text-sm font-medium">
                      {unassigned.find((g) => `guest-${g.id}` === activeId)?.contact.fullName || 'Convidado'}
                    </span>
                  </div>
                )}
                {activeId.startsWith('table-') && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {tables.find((t) => `table-${t.id}` === activeId)?.label || 'Mesa'}
                    </span>
                  </div>
                )}
                {activeId.startsWith('assignment-') && (
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    <span className="text-sm font-medium">Movendo convidado</span>
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Hidden Export Canvas */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        <ExportCanvas
          ref={exportCanvasRef}
          tables={tables}
          elements={decorativeElements}
          width={CANVAS_W}
          height={CANVAS_H}
          showNumbers={true}
          showOccupancy={true}
        />
      </div>
    </div>
  )
}
