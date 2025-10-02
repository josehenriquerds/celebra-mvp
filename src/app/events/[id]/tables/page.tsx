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
import { toPng } from 'html-to-image'
import { ArrowLeft, Plus, Users, X } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import {
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
import type { Table } from '@/schemas'

/* =========================
   Constantes / Utils
   ========================= */

const CANVAS_W = 2000
const CANVAS_H = 1500
const GRID = 16
const MIN_GAP = 64

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
  const [newTableLabel, setNewTableLabel] = useState('')
  const [newTableCapacity, setNewTableCapacity] = useState(8)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [exporting, setExporting] = useState(false)

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

  async function handleCreateTable() {
    if (!newTableCapacity || newTableCapacity < 2) {
      toast({
        title: 'Erro',
        description: 'A capacidade deve ser no mínimo 2',
        variant: 'destructive',
      })
      return
    }

    try {
      await createTableMutation.mutateAsync({
        label: newTableLabel || `Mesa ${tables.length + 1}`,
        capacity: newTableCapacity,
        shape: 'round',
        x: snap(400 + Math.random() * 200),
        y: snap(300 + Math.random() * 200),
        radius: 80,
        rotation: 0,
        color: '#C7B7F3',
      })

      toast({
        title: 'Mesa criada',
        description: 'A mesa foi adicionada com sucesso',
      })

      setNewTableCapacity(8)
      setNewTableLabel('')
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
      <header className="shadow-celebre border-b bg-white">
        <div className="mx-auto max-w-[95vw] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="size-5" />
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

            <Toolbar
              onExport={handleExport}
              onAutoArrange={handleAutoArrange}
              onAutoAllocate={handleAutoAllocate}
              exporting={exporting}
            />
          </div>
        </div>
      </header>

      {/* Modal de Edição */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading">Editar Mesa</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingTable(null)}>
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
                <label className="text-sm font-medium text-celebre-ink">Cor</label>
                <Input
                  type="color"
                  value={editingTable.color || '#C7B7F3'}
                  onChange={(e) => setEditingTable({ ...editingTable, color: e.target.value })}
                  className="mt-1 h-10"
                />
              </div>

              <div className="flex gap-2 pt-2">
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
      <main className="mx-auto max-w-[95vw] px-4 py-6">
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
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar Esquerda: Convidados */}
            <div className="col-span-12 lg:col-span-3">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg">
                    <Users className="mr-2 inline size-5" />
                    Convidados ({unassigned.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[70vh] overflow-y-auto">
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

            {/* Canvas Central */}
            <div
              className={`col-span-12 ${showElementsPalette ? 'lg:col-span-6' : 'lg:col-span-9'}`}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-lg">Layout das Mesas</CardTitle>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Nome da mesa"
                        value={newTableLabel}
                        onChange={(e) => setNewTableLabel(e.target.value)}
                        className="w-32 text-sm"
                      />
                      <Input
                        type="number"
                        min="2"
                        max="20"
                        value={newTableCapacity}
                        onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 8)}
                        className="w-20 text-sm"
                      />
                      <Button size="sm" onClick={handleCreateTable}>
                        <Plus className="mr-1 size-4" />
                        Mesa
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="overflow-auto p-4">
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
            </div>

            {/* Sidebar Direita: Elementos (condicional) */}
            {showElementsPalette && (
              <div className="col-span-12 lg:col-span-3">
                <div className="sticky top-4">
                  <ElementsPalette />
                </div>
              </div>
            )}
          </div>
          <DragOverlay dropAnimation={null}>
            {activeId ? (
              <div className="border-celebre-brand rounded-lg border-2 bg-white p-3 shadow-lg">
                {activeId.startsWith('guest-') && (
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    <span className="text-sm font-medium">
                      {unassigned.find((g) => `guest-${g.id}` === activeId)?.contact.fullName ||
                        'Convidado'}
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
