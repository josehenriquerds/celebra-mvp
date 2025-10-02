import crypto from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateToken(guestId: string): string {
  return crypto
    .createHash('sha256')
    .update(guestId + process.env.NEXTAUTH_SECRET)
    .digest('hex')
    .substring(0, 32)
}

async function findGuestByToken(token: string) {
  const allGuests = await prisma.guest.findMany({ select: { id: true } })
  for (const guest of allGuests) {
    if (generateToken(guest.id) === token) return guest.id
  }
  return null
}

// POST /api/guest-portal/:token/opt-out - Opt out from communications
export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const guestId = await findGuestByToken(params.token)

    if (!guestId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: { optOut: true },
    })

    // Log consent
    await prisma.consentLog.create({
      data: {
        contactId: guest.contactId,
        source: 'form',
        action: 'opt_out',
        text: 'Guest opted out via portal',
      },
    })

    // Update engagement score (-5 points)
    await prisma.engagementScore.upsert({
      where: {
        contactId_eventId: {
          contactId: guest.contactId,
          eventId: guest.eventId,
        },
      },
      create: {
        eventId: guest.eventId,
        contactId: guest.contactId,
        value: 0,
        tier: 'bronze',
      },
      update: {
        value: {
          decrement: 5,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error opting out:', error)
    return NextResponse.json({ error: 'Failed to opt out' }, { status: 500 })
  }
}
