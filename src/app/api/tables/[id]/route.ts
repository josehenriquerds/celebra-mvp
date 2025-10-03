import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// PATCH /api/tables/:id - Update table position or properties
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { x, y, label, capacity } = body

    const updateData: Prisma.TableUpdateInput = {}
    if (x !== undefined) updateData.x = x
    if (y !== undefined) updateData.y = y
    if (label !== undefined) updateData.label = label
    if (capacity !== undefined) {
      // If capacity changed, need to regenerate seats
      const table = await prisma.table.findUnique({
        where: { id: params.id },
        include: { seats: true },
      })

      if (table && capacity !== table.capacity) {
        // Delete old seats
        await prisma.seat.deleteMany({
          where: { tableId: params.id },
        })

        // Generate new circular seats
        const theta = (2 * Math.PI) / capacity
        const radius = 80 // Fixed radius

        const newSeats = Array.from({ length: capacity }, (_, i) => ({
          tableId: params.id,
          index: i,
          x: Math.cos(i * theta) * radius,
          y: Math.sin(i * theta) * radius,
          rotation: (i * theta * 180) / Math.PI,
        }))

        await prisma.seat.createMany({
          data: newSeats,
        })

        updateData.capacity = capacity
      }
    }

    const updatedTable = await prisma.table.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedTable)
  } catch (error) {
    console.error('Error updating table:', error)
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
  }
}

// DELETE /api/tables/:id - Delete table and its seats
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Delete all seat assignments first
    await prisma.seatAssignment.deleteMany({
      where: {
        seat: {
          tableId: params.id,
        },
      },
    })

    // Delete all seats
    await prisma.seat.deleteMany({
      where: { tableId: params.id },
    })

    // Delete table
    await prisma.table.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
  }
}
