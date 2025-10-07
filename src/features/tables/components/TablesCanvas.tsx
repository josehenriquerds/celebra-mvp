'use client'

import { useDroppable } from '@dnd-kit/core'
import { Maximize2, Grid3x3 } from 'lucide-react'
import { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { Table } from '@/schemas'
import { TableItem } from './TableItem'

interface TablesCanvasProps {
  tables: Table[]
  zoom: number
  canvasWidth: number
  canvasHeight: number
  onEditTable: (table: Table) => void
  onDeleteTable: (id: string) => void
  showOverlays?: {
    numbers: boolean
    occupancy: boolean
    heatmap: boolean
  }
}

export function TablesCanvas({
  tables,
  zoom: externalZoom,
  canvasWidth,
  canvasHeight,
  onEditTable,
  onDeleteTable,
  showOverlays = { numbers: true, occupancy: false, heatmap: false },
}: TablesCanvasProps) {
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [localZoom, setLocalZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const zoom = externalZoom * localZoom

  const { setNodeRef, isOver } = useDroppable({
    id: 'tables-canvas-droppable',
    data: { type: 'canvas' },
  })

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = -e.deltaY * 0.001
        setLocalZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)))
      }
    },
    []
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse ou Shift+Left mouse para pan
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setViewOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const resetView = () => {
    setLocalZoom(1)
    setViewOffset({ x: 0, y: 0 })
  }

  // Calcula ocupação para heatmap
  const getOccupancyColor = (table: Table) => {
    const occupiedSeats = table.seats?.filter((s) => s.assignment).length || 0
    const percentage = table.capacity > 0 ? occupiedSeats / table.capacity : 0

    if (percentage === 1) return 'rgba(34, 197, 94, 0.2)' // green
    if (percentage >= 0.7) return 'rgba(59, 130, 246, 0.2)' // blue
    if (percentage >= 0.4) return 'rgba(251, 191, 36, 0.2)' // yellow
    return 'rgba(239, 68, 68, 0.2)' // red
  }

  return (
    <div className="relative size-full overflow-hidden rounded-lg bg-gray-50">
      {/* Controls */}
      <div className="absolute right-4 top-4 z-10 flex gap-2 rounded-lg bg-white p-2 shadow-lg">
        <button
          onClick={() => setLocalZoom((z) => Math.min(3, z + 0.1))}
          className="rounded px-3 py-1 text-sm hover:bg-gray-100"
          title="Zoom In (Ctrl+Scroll)"
        >
          +
        </button>
        <span className="min-w-[60px] px-2 py-1 text-center text-sm text-gray-600">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setLocalZoom((z) => Math.max(0.5, z - 0.1))}
          className="rounded px-3 py-1 text-sm hover:bg-gray-100"
          title="Zoom Out (Ctrl+Scroll)"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="ml-2 rounded px-3 py-1 text-sm hover:bg-gray-100"
          title="Reset View"
        >
          <Maximize2 className="size-4" />
        </button>
      </div>

      {/* Info */}
      <div className="absolute bottom-4 left-4 z-10 space-y-1 rounded-lg bg-white px-3 py-2 text-xs text-gray-600 shadow-lg">
        <div className="flex items-center gap-1">
          <Grid3x3 className="size-3" />
          {tables.length} mesa{tables.length !== 1 ? 's' : ''}
        </div>
        <div className="text-gray-400">Shift+Arraste para mover</div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className={cn(
          'relative w-full h-full overflow-auto',
          isPanning ? 'cursor-grabbing' : 'cursor-default'
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={setNodeRef}
          id="tables-canvas"
          className={cn(
            'relative rounded-3xl border-2 border-dashed border-muted/40 bg-white transition-colors duration-200 ease-smooth origin-top-left',
            isOver && 'border-celebre-brand/70'
          )}
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${zoom}) translate(${viewOffset.x / zoom}px, ${viewOffset.y / zoom}px)`,
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '16px 16px',
            touchAction: 'none',
          }}
        >
          {tables.map((table) => {
            const occupiedSeats = table.seats?.filter((s) => s.assignment).length || 0

            return (
              <div key={table.id} className="relative">
                {/* Heatmap Overlay */}
                {showOverlays.heatmap && (
                  <div
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      left: table.x - table.radius,
                      top: table.y - table.radius,
                      width: table.radius * 2,
                      height: table.radius * 2,
                      backgroundColor: getOccupancyColor(table),
                      zIndex: 0,
                    }}
                  />
                )}

                <TableItem
                  key={table.id}
                  table={table}
                  zoom={1} // Zoom já aplicado no container
                  onEdit={onEditTable}
                  onDelete={onDeleteTable}
                />

                {/* Number Overlay */}
                {showOverlays.numbers && (
                  <div
                    className="pointer-events-none absolute left-0 top-0 flex size-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white"
                    style={{
                      left: table.x - table.radius - 12,
                      top: table.y - table.radius - 12,
                      zIndex: 10,
                    }}
                  >
                    {table.label}
                  </div>
                )}

                {/* Occupancy Overlay */}
                {showOverlays.occupancy && (
                  <div
                    className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white"
                    style={{
                      left: table.x,
                      top: table.y + table.radius + 8,
                      transform: 'translateX(-50%)',
                      zIndex: 10,
                    }}
                  >
                    {occupiedSeats}/{table.capacity}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
