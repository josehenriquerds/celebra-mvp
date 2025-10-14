'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { TABLE_TYPE_CONFIG } from '@/lib/guest-icons'
import type { TableType } from '@/schemas'

interface CreateTableModalProps {
  onClose: () => void
  onCreate: (data: {
    label: string
    capacity: number
    color: string
    shape: 'round' | 'square'
    tableType: TableType
  }) => Promise<void>
  tablesCount: number
}

const PRESET_COLORS = [
  '#C7B7F3', // Lavender
  '#F3B7C7', // Pink
  '#B7F3E3', // Mint
  '#F3D9B7', // Peach
  '#B7E3F3', // Sky
  '#E3B7F3', // Purple
  '#F3C7B7', // Coral
  '#D9F3B7', // Lime
]

export function CreateTableModal({ onClose, onCreate, tablesCount }: CreateTableModalProps) {
  const [label, setLabel] = useState(`Mesa ${tablesCount + 1}`)
  const [capacity, setCapacity] = useState(8)
  const [color, setColor] = useState(PRESET_COLORS[0]!)
  const [shape, setShape] = useState<'round' | 'square'>('round')
  const [tableType, setTableType] = useState<TableType>('regular')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (capacity < 1) {
      alert('A capacidade deve ser no mínimo 1')
      return
    }

    try {
      setLoading(true)
      await onCreate({ label, capacity, color, shape, tableType })
      onClose()
    } catch (error) {
      console.error('Error creating table:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading">Criar Nova Mesa</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="transition-transform hover:scale-110"
            >
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-celebre-ink">Nome da Mesa</label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Mesa 1"
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-celebre-ink">Capacidade</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className="mt-1"
                required
              />
              <p className="mt-1 text-xs text-celebre-muted">
                Número de assentos ao redor da mesa
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-celebre-ink">Tipo de Mesa</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(Object.entries(TABLE_TYPE_CONFIG) as [TableType, typeof TABLE_TYPE_CONFIG[TableType]][]).map(([type, config]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setTableType(type)
                      setColor(config.color)
                    }}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all',
                      tableType === type
                        ? 'border-celebre-brand bg-celebre-accent/10'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <span className="text-xs text-celebre-muted">{config.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-celebre-ink">Formato</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShape('round')}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                    shape === 'round'
                      ? 'border-celebre-brand bg-celebre-accent/10'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="size-16 rounded-full border-4 border-current" />
                  <span className="text-sm font-medium">Redonda</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShape('square')}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                    shape === 'square'
                      ? 'border-celebre-brand bg-celebre-accent/10'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="size-16 rounded-lg border-4 border-current" />
                  <span className="text-sm font-medium">Quadrada</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-celebre-ink">Cor</label>
              <div className="mt-2 grid grid-cols-8 gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={cn(
                      'h-10 w-10 rounded-lg transition-all hover:scale-110',
                      color === presetColor && 'ring-2 ring-celebre-brand ring-offset-2'
                    )}
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#RRGGBB"
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Mesa'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
