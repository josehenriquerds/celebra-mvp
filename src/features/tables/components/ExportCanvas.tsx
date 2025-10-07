'use client'

import { forwardRef } from 'react'
import type { Table, DecorElement } from '@/schemas'

interface ExportCanvasProps {
  tables: Table[]
  elements: DecorElement[]
  width: number
  height: number
  showNumbers?: boolean
  showOccupancy?: boolean
  backgroundColor?: string
}

/**
 * Componente dedicado para export PNG/SVG
 * Renderiza sem CSS scale() para evitar distorção
 */
export const ExportCanvas = forwardRef<HTMLDivElement, ExportCanvasProps>(
  (
    {
      tables,
      elements,
      width,
      height,
      showNumbers = true,
      showOccupancy = true,
      backgroundColor = 'white',
    },
    ref
  ) => {
    const getElementIcon = (type: string) => {
      const icons: Record<string, string> = {
        cakeTable: '🎂',
        danceFloor: '💃',
        restroom: '🚻',
        buffet: '🍽️',
        dj: '🎵',
        entrance: '🚪',
        exit: '🚪',
        bar: '🍸',
        photoArea: '📷',
      }
      return icons[type] || '📦'
    }

    return (
      <div
        ref={ref}
        style={{
          width,
          height,
          position: 'relative',
          backgroundColor,
          padding: '40px',
        }}
      >
        {/* Grid Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Decorative Elements */}
        {elements.map((element) => (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              border: '2px solid #9333ea',
              borderRadius: '8px',
              backgroundColor: 'rgba(147, 51, 234, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              transform: `rotate(${element.rotation || 0}deg)`,
            }}
          >
            {getElementIcon(element.type)}
          </div>
        ))}

        {/* Tables */}
        {tables.map((table) => {
          const occupiedSeats = table.seats?.filter((s) => s.assignment).length || 0
          const isRound = table.shape === 'round' || table.shape === 'circular'

          return (
            <div key={table.id}>
              {/* Table Shape */}
              <div
                style={{
                  position: 'absolute',
                  left: table.x - table.radius,
                  top: table.y - table.radius,
                  width: table.radius * 2,
                  height: table.radius * 2,
                  backgroundColor: table.color || '#C7B7F3',
                  border: '3px solid rgba(0,0,0,0.1)',
                  borderRadius: isRound ? '50%' : '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Table Label */}
                <div
                  style={{
                    fontSize: Math.max(16, table.radius / 4),
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {table.label}
                </div>

                {/* Occupancy */}
                {showOccupancy && (
                  <div
                    style={{
                      fontSize: Math.max(12, table.radius / 6),
                      color: 'rgba(255,255,255,0.9)',
                      marginTop: '4px',
                    }}
                  >
                    👤 {occupiedSeats}/{table.capacity}
                  </div>
                )}

                {/* Seat Indicators */}
                {table.capacity > 0 && table.radius > 40 && (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    {Array.from({ length: table.capacity }).map((_, i) => {
                      const angle = (i / table.capacity) * 2 * Math.PI - Math.PI / 2
                      const seatRadius = table.radius - 8
                      const x = Math.cos(angle) * seatRadius
                      const y = Math.sin(angle) * seatRadius
                      const isOccupied = i < occupiedSeats

                      return (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: '2px solid white',
                            backgroundColor: isOccupied ? '#22c55e' : 'rgba(255,255,255,0.5)',
                            left: `calc(50% + ${x}px - 6px)`,
                            top: `calc(50% + ${y}px - 6px)`,
                          }}
                        />
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Number Badge */}
              {showNumbers && (
                <div
                  style={{
                    position: 'absolute',
                    left: table.x - table.radius - 16,
                    top: table.y - table.radius - 16,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#9333ea',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {table.label}
                </div>
              )}
            </div>
          )
        })}

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            fontSize: '12px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Legenda</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
              }}
            />
            <span>Ocupado</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.5)',
                border: '2px solid #666',
              }}
            />
            <span>Disponível</span>
          </div>
        </div>

        {/* Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            fontSize: '10px',
            color: 'rgba(0,0,0,0.3)',
          }}
        >
          Gerado por Celebre
        </div>
      </div>
    )
  }
)

ExportCanvas.displayName = 'ExportCanvas'
