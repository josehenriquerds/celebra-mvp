import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events/:id/timeline - Get aggregated timeline
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // Filter by type
    const search = searchParams.get('search') // Search by guest name

    // Get all timeline entries
    const timelineEntries = await prisma.timelineEntry.findMany({
      where: { eventId: params.id },
      orderBy: { occurredAt: 'desc' },
    })

    // Get all interactions
    const interactions = await prisma.interaction.findMany({
      where: { eventId: params.id },
      include: {
        contact: {
          select: { fullName: true, phone: true },
        },
      },
      orderBy: { occurredAt: 'desc' },
    })

    // Get all checkins
    const checkins = await prisma.checkin.findMany({
      where: {
        guest: {
          eventId: params.id,
        },
      },
      include: {
        guest: {
          include: {
            contact: {
              select: { fullName: true, phone: true },
            },
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    })

    // Get all gift updates (status changes)
    const gifts = await prisma.giftRegistryItem.findMany({
      where: {
        eventId: params.id,
      },
      include: {
        buyerContact: {
          select: { fullName: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get task updates
    const tasks = await prisma.task.findMany({
      where: { eventId: params.id },
      orderBy: { updatedAt: 'desc' },
    })

    // Aggregate all entries into unified timeline
    const timeline: any[] = []

    // Add timeline entries
    timelineEntries.forEach((entry) => {
      const meta = (entry.metaJson as any) || {}
      timeline.push({
        id: `timeline-${entry.id}`,
        type: 'timeline',
        subtype: entry.type,
        title: `Timeline: ${entry.type}`,
        description: JSON.stringify(meta),
        contactName: meta.contactId || 'Sistema',
        contactPhone: null,
        occurredAt: entry.occurredAt,
        metadata: meta,
      })
    })

    // Add interactions
    interactions.forEach((interaction) => {
      timeline.push({
        id: `interaction-${interaction.id}`,
        type: 'interaction',
        subtype: interaction.kind,
        title: `Interação via ${interaction.channel}`,
        description: JSON.stringify(interaction.payloadJson),
        contactName: interaction.contact?.fullName || 'Desconhecido',
        contactPhone: interaction.contact?.phone,
        occurredAt: interaction.occurredAt,
        metadata: {
          channel: interaction.channel,
          kind: interaction.kind,
        },
      })
    })

    // Add checkins
    checkins.forEach((checkin) => {
      timeline.push({
        id: `checkin-${checkin.id}`,
        type: 'checkin',
        subtype: 'guest_checkin',
        title: 'Check-in realizado',
        description: `${checkin.guest.contact.fullName} fez check-in no evento`,
        contactName: checkin.guest.contact.fullName,
        contactPhone: checkin.guest.contact.phone,
        occurredAt: checkin.timestamp,
        metadata: {
          guestId: checkin.guestId,
        },
      })
    })

    // Add gifts
    gifts.forEach((gift) => {
      timeline.push({
        id: `gift-${gift.id}`,
        type: 'gift',
        subtype: gift.status,
        title: `Presente: ${gift.title}`,
        description: `Status: ${gift.status} - ${gift.status === 'comprado' ? 'Presente comprado' : gift.status === 'reservado' ? 'Reservado' : 'Disponível'}`,
        contactName: gift.buyerContact?.fullName || 'N/A',
        contactPhone: gift.buyerContact?.phone,
        occurredAt: gift.createdAt,
        metadata: {
          title: gift.title,
          status: gift.status,
          price: gift.price,
        },
      })
    })

    // Add tasks
    tasks.forEach((task) => {
      timeline.push({
        id: `task-${task.id}`,
        type: 'task',
        subtype: task.status,
        title: `Tarefa: ${task.title}`,
        description: `Status: ${task.status} - ${task.description || ''}`,
        contactName: 'Sistema',
        contactPhone: null,
        occurredAt: task.updatedAt,
        metadata: {
          status: task.status,
          dueAt: task.dueAt,
          assigneeUserId: task.assigneeUserId,
        },
      })
    })

    // Sort by occurredAt desc
    timeline.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())

    // Apply filters
    let filteredTimeline = timeline

    if (type && type !== 'all') {
      filteredTimeline = filteredTimeline.filter((item) => item.type === type)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredTimeline = filteredTimeline.filter(
        (item) =>
          item.contactName?.toLowerCase().includes(searchLower) ||
          item.title?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      timeline: filteredTimeline,
      total: filteredTimeline.length,
      stats: {
        total: timeline.length,
        timeline: timelineEntries.length,
        interactions: interactions.length,
        checkins: checkins.length,
        gifts: gifts.length,
        tasks: tasks.length,
      },
    })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
  }
}
