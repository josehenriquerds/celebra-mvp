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
import { ArrowLeft, Plus, Users, X } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  Toolbar,
  UnassignedZone,
} from '@/features/tables/components'
import {
  useAssignGuestToSeat,
  useCreateTable,
  useDeleteTable,
  useTablePlannerData,
  useUnassignGuestFromSeat,
  useUpdateTable,
} from '@/features/tables/hooks/useTables'
import { usePlannerStore } from '@/features/tables/stores/usePlannerStore'
import { cn } from '@/lib/utils'
import type { Table } from '@/schemas'

/* =========================
   Constantes / Utils
   ========================= */

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
  const { data, isLoading } = useTablePlannerData(eventId)
  const createTableMutation = useCreateTable()
  const updateTableMutation = useUpdateTable()
  const deleteTableMutation = useDeleteTable()
  const assignMutation = useAssignGuestToSeat()
  const unassignMutation = useUnassignGuestFromSeat()

  // Zustand store
  const { zoom, activeId, setActiveId, addToHistory, showElementsPalette } = usePlannerStore()

  // Local state
  const [creatingTable, setCreatingTable] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [exporting, setExporting] = useState(false)
  const [guestPanelOpen, setGuestPanelOpen] = useState(true)

  const interactiveButtonClasses = 'transition-transform duration-200 ease-smooth hover:bg-muted/60 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]'
  const mobilePanelTransition = { duration: 0.3, ease: EASE_SMOOTH }

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
  const unassigned = data?.unassigned || []

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
    const aData = active.data.current as any
    setActiveId(null, null)

    const overData = over?.data.current as any

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
  }) {
    try {
      await createTableMutation.mutateAsync({
        label: data.label,
        capacity: data.capacity,
        shape: data.shape,
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
    const canvas = document.getElementById('tables-canvas')
    if (!canvas) return

    try {
      setExporting(true)
      const dataUrl = await toPng(canvas, { quality: 1.0, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `planner-mesas-${eventId}.png`
      link.href = dataUrl
      link.click()

      toast({
        title: 'Exportado',
        description: 'O layout foi exportado como imagem',
      })
    } catch (error) {
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
            <div>
              <h1 className="font-heading text-2xl font-bold text-celebre-ink">
                Planner de Mesas
              </h1>
              <p className="mt-1 text-sm text-celebre-muted">
                {tables.length} mesa{tables.length !== 1 ? 's' : ''} • {unassigned.length}{' '}
                convidado{unassigned.length !== 1 ? 's' : ''} não alocado
                {unassigned.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <Toolbar
              onExport={handleExport}
              onAutoArrange={handleAutoArrange}
              onAutoAllocate={handleAutoAllocate}
              exporting={exporting}
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
                    <div className="max-h-[60vh] space-y-3 overflow-y-auto px-4 pb-4">
                      <UnassignedZone>
                        {unassigned.length === 0 ? (
                          <p className="py-6 text-center text-sm text-celebre-muted">
                            Todos os convidados foram alocados
                          </p>
                        ) : (
                          unassigned.map((guest) => <GuestChip key={guest.id} guest={guest} />)
                        )}
                      </UnassignedZone>
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
                      </CardHeader>
                      <CardContent className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                        <UnassignedZone>
                          {unassigned.length === 0 ? (
                            <p className="py-8 text-center text-sm text-celebre-muted">
                              Todos os convidados foram alocados
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
              <motion.div layout className="flex min-w-0 flex-col gap-4 lg:flex-row">
                <motion.div layout className="flex min-w-0 flex-1">
                  <Card className="w-full border border-border bg-card shadow-elevation-2">
                    <CardHeader className="flex flex-col gap-3 pb-3">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <CardTitle className="font-heading text-lg">Layout das Mesas</CardTitle>
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
                    <CardContent className="overflow-auto rounded-3xl border border-dashed border-muted/50 bg-white p-4 transition-colors duration-200 ease-smooth">
                      <TablesCanvas
                        tables={tables}
                        zoom={zoom}
                        canvasWidth={CANVAS_W}
                        canvasHeight={CANVAS_H}
                        onEditTable={setEditingTable}
                        onDeleteTable={handleDeleteTable}
                      />
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
    </div>
  )
}
