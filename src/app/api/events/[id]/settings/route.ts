import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events/:id/settings - Get event settings
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Defaults if no settings exist (settings stored as JSON in future)
    const settings = {
      branding: {
        primaryColor: '#8B5CF6',
        logo: null,
        customDomain: null,
      },
      lgpd: {
        consentRequired: true,
        dataRetentionDays: 365,
        autoDeleteAfterEvent: false,
      },
      integrations: {
        googleCalendar: {
          enabled: false,
          clientId: null,
          refreshToken: null,
        },
        outlook: {
          enabled: false,
          clientId: null,
          refreshToken: null,
        },
        n8n: {
          enabled: !!process.env.N8N_URL,
          webhookUrl: process.env.N8N_URL || null,
        },
      },
      notifications: {
        emailEnabled: false,
        smsEnabled: false,
        whatsappEnabled: true,
      },
    }

    const templates = {
      rsvpConfirmation:
        'Olá {{name}}! Confirmamos sua presença em {{eventTitle}}. Data: {{date}}. Local: {{venue}}.',
      rsvpReminder:
        'Oi {{name}}! Não esqueça: {{eventTitle}} é amanhã às {{time}}. Nos vemos lá! 🎉',
      thankYou: 'Obrigado por comparecer ao {{eventTitle}}, {{name}}! Foi um prazer te receber. ❤️',
      customMessage: '',
    }

    return NextResponse.json({
      settings,
      templates,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PATCH /api/events/:id/settings - Update event settings
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { settings, templates } = body

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Settings would be stored in JSON fields (not yet in schema)
    // For now, just return success
    return NextResponse.json({
      success: true,
      settings,
      templates,
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
