import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getEngagementTier } from '@/lib/utils'
import type { Contact } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Verification endpoint for WhatsApp Cloud API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'celebre_webhook_token'

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST: Handle incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2))

    // WhatsApp Cloud API structure
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    if (!value?.messages) {
      return NextResponse.json({ success: true, message: 'No messages' })
    }

    const message = value.messages[0]
    const messageId = message.id
    const from = message.from // Phone number
    const text = message.text?.body || ''
    const timestamp = message.timestamp

    // Idempotency: Check if message already processed
    const existingLog = await prisma.eventLog.findFirst({
      where: {
        type: 'whatsapp_message',
        payloadJson: {
          path: ['messageId'],
          equals: messageId,
        },
      },
    })

    if (existingLog) {
      console.log('Message already processed:', messageId)
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // Find contact by phone
    const contact = await prisma.contact.findUnique({
      where: { phone: `+${from}` },
      include: {
        guests: {
          include: {
            event: true,
          },
        },
      },
    })

    if (!contact) {
      console.log('Contact not found for phone:', from)
      return NextResponse.json({ success: true, message: 'Contact not found' })
    }

    // Get most recent event for this contact
    const guest = contact.guests.sort(
      (a, b) => new Date(b.event.dateTime).getTime() - new Date(a.event.dateTime).getTime()
    )[0]

    if (!guest) {
      return NextResponse.json({ success: true, message: 'No event found' })
    }

    const eventId = guest.eventId

    // Process commands
    const upperText = text.trim().toUpperCase()

    // RSVP Commands
    if (['SIM', 'YES', 'CONFIRMO'].includes(upperText)) {
      await handleRSVP(guest.id, 'sim', contact, eventId)
    } else if (['NÃO', 'NAO', 'NO'].includes(upperText)) {
      await handleRSVP(guest.id, 'nao', contact, eventId)
    } else if (['TALVEZ', 'MAYBE'].includes(upperText)) {
      await handleRSVP(guest.id, 'talvez', contact, eventId)
    }
    // Opt-out Commands
    else if (['PARAR', 'SAIR', 'STOP', 'UNSUBSCRIBE'].includes(upperText)) {
      await handleOptOut(guest.id, contact.id, eventId)
    }
    // Info Commands
    else if (['MESA', 'TABLE'].includes(upperText)) {
      await handleTableInfo(guest.id)
    } else if (['ENDEREÇO', 'ENDERECO', 'ADDRESS'].includes(upperText)) {
      await handleAddressInfo(guest.eventId)
    } else if (['HORÁRIO', 'HORARIO', 'TIME'].includes(upperText)) {
      await handleTimeInfo(guest.eventId)
    }

    // Log interaction
    await prisma.interaction.create({
      data: {
        eventId,
        contactId: contact.id,
        channel: 'whatsapp',
        kind: 'mensagem',
        payloadJson: {
          messageId,
          text,
          from,
        },
        occurredAt: new Date(parseInt(timestamp) * 1000),
      },
    })

    // Update engagement score (+2 for message)
    await updateEngagementScore(contact.id, eventId, 2)

    // Log event
    await prisma.eventLog.create({
      data: {
        eventId,
        source: 'whatsapp',
        type: 'whatsapp_message',
        payloadJson: {
          messageId,
          from,
          text,
          contactId: contact.id,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper: Handle RSVP
async function handleRSVP(
  guestId: string,
  rsvp: 'sim' | 'nao' | 'talvez',
  contact: Contact,
  eventId: string
) {
  await prisma.guest.update({
    where: { id: guestId },
    data: { rsvp },
  })

  await prisma.timelineEntry.create({
    data: {
      eventId,
      actorType: 'guest',
      type: 'rsvp',
      refId: guestId,
      metaJson: {
        contactName: contact.fullName,
        rsvp,
      },
    },
  })

  // +10 points for RSVP
  await updateEngagementScore(contact.id, eventId, 10)

  console.log(`RSVP updated for ${contact.fullName}: ${rsvp}`)
}

// Helper: Handle Opt-out
async function handleOptOut(guestId: string, contactId: string, eventId: string) {
  await prisma.guest.update({
    where: { id: guestId },
    data: { optOut: true },
  })

  await prisma.consentLog.create({
    data: {
      contactId,
      source: 'whatsapp',
      action: 'opt_out',
      text: 'PARAR',
    },
  })

  // -5 points for opt-out
  await updateEngagementScore(contactId, eventId, -5)

  console.log(`Opt-out registered for contact: ${contactId}`)
}

// Helper: Table info
async function handleTableInfo(guestId: string) {
  const assignment = await prisma.seatAssignment.findFirst({
    where: { guestId },
    include: {
      seat: {
        include: {
          table: true,
        },
      },
    },
  })

  if (assignment) {
    console.log(`Table info: ${assignment.seat.table.label}, Assento ${assignment.seat.index + 1}`)
    // TODO: Send WhatsApp message with table info
  } else {
    console.log('Table not assigned yet')
  }
}

// Helper: Address info
async function handleAddressInfo(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  })

  if (event) {
    console.log(`Address: ${event.venueName} - ${event.address}`)
    // TODO: Send WhatsApp message with address
  }
}

// Helper: Time info
async function handleTimeInfo(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  })

  if (event) {
    console.log(`Event time: ${event.dateTime}`)
    // TODO: Send WhatsApp message with time
  }
}

// Helper: Update engagement score
async function updateEngagementScore(contactId: string, eventId: string, points: number) {
  const existing = await prisma.engagementScore.findUnique({
    where: {
      contactId_eventId: {
        contactId,
        eventId,
      },
    },
  })

  const newValue = Math.max(0, (existing?.value || 0) + points)
  const tier = getEngagementTier(newValue)

  await prisma.engagementScore.upsert({
    where: {
      contactId_eventId: {
        contactId,
        eventId,
      },
    },
    create: {
      contactId,
      eventId,
      value: newValue,
      tier,
    },
    update: {
      value: newValue,
      tier,
    },
  })
}
