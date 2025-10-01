import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/segments/:id/send - Send message to segment
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    // Get segment with guests
    const segment = await prisma.segmentTag.findUnique({
      where: { id: params.id },
      include: {
        guests: {
          include: {
            guest: {
              include: {
                contact: {
                  select: {
                    phone: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!segment) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }

    // Send messages via WhatsApp API (or queue them)
    const sent: string[] = []
    const n8nUrl = process.env.N8N_URL

    for (const guestTag of segment.guests) {
      try {
        if (n8nUrl && guestTag.guest && !guestTag.guest.optOut) {
          // Use n8n webhook to send
          await fetch(`${n8nUrl}/webhook/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: guestTag.guest.contact.phone,
              message,
            }),
          })
        }

        // Log interaction
        if (guestTag.guest) {
          await prisma.interaction.create({
            data: {
              eventId: segment.eventId,
              contactId: guestTag.guest.contactId,
              channel: 'whatsapp',
              kind: 'mensagem',
              payloadJson: { message },
              occurredAt: new Date(),
            },
          })

          sent.push(guestTag.guest.id)
        }
      } catch (error) {
        console.error(`Error sending:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      sent: sent.length,
      total: segment.guests.length,
    })
  } catch (error) {
    console.error('Error sending segment message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
