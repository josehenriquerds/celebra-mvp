import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id

    // Fetch event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        guests: {
          include: {
            contact: true,
          },
        },
        tasks: {
          where: {
            status: {
              not: 'concluida',
            },
          },
          orderBy: {
            dueAt: 'asc',
          },
          take: 5,
        },
        vendors: {
          where: {
            status: 'ativo',
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Calculate RSVP stats
    const rsvps = {
      sim: event.guests.filter((g) => g.rsvp === 'sim').length,
      nao: event.guests.filter((g) => g.rsvp === 'nao').length,
      talvez: event.guests.filter((g) => g.rsvp === 'talvez').length,
      pendente: event.guests.filter((g) => g.rsvp === 'pendente').length,
    }

    // Calculate budget spent (sum of vendor contracts + completed tasks with costs)
    const spent = event.vendors.reduce((sum, v) => sum + (v.contractValue || 0), 0)

    // Calculate progress (completed tasks / total tasks)
    const allTasks = await prisma.task.count({
      where: { eventId },
    })
    const completedTasks = await prisma.task.count({
      where: { eventId, status: 'concluida' },
    })
    const progress = allTasks > 0 ? completedTasks / allTasks : 0

    // Next tasks
    const nextTasks = event.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      dueAt: task.dueAt,
      status: task.status,
      slaHours: task.slaHours,
    }))

    // Count VIPs
    const vipCount = event.guests.filter((g) => g.contact.isVip).length

    // Count children
    const childrenCount = event.guests.reduce((sum, g) => sum + g.children, 0)

    return NextResponse.json({
      id: event.id,
      title: event.title,
      dateTime: event.dateTime,
      venueName: event.venueName,
      address: event.address,
      hosts: event.hosts,
      rsvps,
      budget: {
        total: event.budgetTotal,
        spent,
        remaining: event.budgetTotal - spent,
        percentSpent: event.budgetTotal > 0 ? (spent / event.budgetTotal) * 100 : 0,
      },
      progress: Math.round(progress * 100) / 100,
      nextTasks,
      stats: {
        totalGuests: event.guests.length,
        confirmedGuests: rsvps.sim,
        vipGuests: vipCount,
        children: childrenCount,
        vendors: event.vendors.length,
      },
    })
  } catch (error) {
    console.error('Error fetching event summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
