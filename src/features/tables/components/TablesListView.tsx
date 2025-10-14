'use client'

import { Edit2, Trash2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TABLE_TYPE_CONFIG, getGuestIconEmoji } from '@/lib/guest-icons'
import type { Table } from '@/schemas'

interface TablesListViewProps {
  tables: Table[]
  onEditTable: (table: Table) => void
  onDeleteTable: (id: string) => void
}

export function TablesListView({ tables, onEditTable, onDeleteTable }: TablesListViewProps) {
  if (tables.length === 0) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Users className="mx-auto mb-4 size-12 text-celebre-muted" />
            <p className="text-lg font-medium text-celebre-ink">Nenhuma mesa criada</p>
            <p className="mt-1 text-sm text-celebre-muted">
              Clique em "Nova Mesa" para começar a organizar seus convidados
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {tables.map((table) => {
        const occupiedSeats = table.seats?.filter((s) => s.assignment).length || 0
        const occupancyPercentage = table.capacity > 0 ? (occupiedSeats / table.capacity) * 100 : 0
        const tableTypeConfig = TABLE_TYPE_CONFIG[table.tableType || 'regular']

        return (
          <Card
            key={table.id}
            className="border border-border bg-card transition-all duration-200 hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Table Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-12 items-center justify-center rounded-lg text-2xl"
                      style={{ backgroundColor: table.color || '#C7B7F3' }}
                    >
                      {tableTypeConfig.icon}
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-celebre-ink">
                        {table.label}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {tableTypeConfig.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {table.shape === 'round' || table.shape === 'circular' ? 'Redonda' : 'Quadrada'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-celebre-ink">
                        Ocupação: {occupiedSeats} / {table.capacity}
                      </span>
                      <span className="text-celebre-muted">
                        {Math.round(occupancyPercentage)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={cn(
                          'h-full transition-all duration-300',
                          occupancyPercentage === 100
                            ? 'bg-green-500'
                            : occupancyPercentage >= 70
                            ? 'bg-blue-500'
                            : occupancyPercentage >= 40
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${occupancyPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Guests List */}
                  {occupiedSeats > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-celebre-muted">Convidados:</p>
                      <div className="flex flex-wrap gap-2">
                        {table.seats
                          ?.filter((s) => s.assignment)
                          .map((seat) => {
                            const guest = seat.assignment!.guest
                            return (
                              <div
                                key={seat.id}
                                className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs"
                                title={guest.contact.fullName}
                              >
                                <span>
                                  {getGuestIconEmoji(guest.contact.gender, guest.contact.ageGroup)}
                                </span>
                                <span className="max-w-[150px] truncate">
                                  {guest.contact.fullName}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEditTable(table)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                    title="Editar mesa"
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDeleteTable(table.id)}
                    className="hover:bg-red-50 hover:text-red-600"
                    title="Excluir mesa"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
