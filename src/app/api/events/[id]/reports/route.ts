import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

    // 1. RSVP vs Presença
    const [totalGuests, rsvpSim, checkins] = await Promise.all([
      prisma.guest.count({ where: { eventId } }),
      prisma.guest.count({ where: { eventId, rsvp: 'sim' } }),
      prisma.checkin.count({ where: { eventId } }),
    ])

    const rsvpVsPresenca = [
      {
        name: 'Todos',
        confirmados: rsvpSim,
        presentes: checkins,
      },
    ]

    // 2. Mensagens por Dia (últimos 14 dias)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const interactions = await prisma.interaction.findMany({
      where: {
        eventId,
        occurredAt: { gte: fourteenDaysAgo },
      },
      select: {
        occurredAt: true,
      },
    })

    const messagesByDay = new Map<string, number>()
    interactions.forEach((interaction) => {
      const dateKey = interaction.occurredAt.toISOString().split('T')[0]
      messagesByDay.set(dateKey, (messagesByDay.get(dateKey) || 0) + 1)
    })

    const mensagensPorDia = Array.from(messagesByDay.entries())
      .map(([data, mensagens]) => ({ data, mensagens }))
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(-7) // Last 7 days

    // 3. Custo por Convidado
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { budgetTotal: true },
    })

    const custoPorConvidado = {
      total: event?.budgetTotal || 0,
      porPessoa: rsvpSim > 0 ? (event?.budgetTotal || 0) / rsvpSim : 0,
      confirmados: rsvpSim,
    }

    // 4. Conversão de Presentes
    const [totalGifts, reservedGifts, receivedGifts] = await Promise.all([
      prisma.giftRegistryItem.count({ where: { eventId } }),
      prisma.giftRegistryItem.count({ where: { eventId, status: 'reservado' } }),
      prisma.giftRegistryItem.count({ where: { eventId, status: 'comprado' } }),
    ])

    const conversaoPresentes = {
      total: totalGifts,
      reservados: reservedGifts,
      recebidos: receivedGifts,
      percentRecebidos: totalGifts > 0 ? Math.round((receivedGifts / totalGifts) * 100) : 0,
    }

    // 5. Engajamento por Tier
    const engagementScores = await prisma.engagementScore.groupBy({
      by: ['tier'],
      where: { eventId },
      _count: { tier: true },
    })

    const tierColors: Record<string, string> = {
      ouro: '#fbbf24',
      prata: '#9ca3af',
      bronze: '#fb923c',
    }

    const engajamentoPorTier = engagementScores.map((score) => ({
      name: score.tier.charAt(0).toUpperCase() + score.tier.slice(1),
      value: score._count.tier,
      color: tierColors[score.tier] || '#9ca3af',
    }))

    // 6. Taxa de Resposta por Segmento
    const [vipCount, vipResponded, familyCount, familyResponded] = await Promise.all([
      prisma.guest.count({ where: { eventId, contact: { isVip: true } } }),
      prisma.guest.count({
        where: { eventId, contact: { isVip: true }, rsvp: { not: 'pendente' } },
      }),
      prisma.guest.count({ where: { eventId, children: { gt: 0 } } }),
      prisma.guest.count({
        where: { eventId, children: { gt: 0 }, rsvp: { not: 'pendente' } },
      }),
    ])

    const taxaRespostaPorSegmento = [
      {
        segmento: 'VIPs',
        taxa: vipCount > 0 ? Math.round((vipResponded / vipCount) * 100) : 0,
      },
      {
        segmento: 'Famílias',
        taxa: familyCount > 0 ? Math.round((familyResponded / familyCount) * 100) : 0,
      },
      {
        segmento: 'Geral',
        taxa: totalGuests > 0 ? Math.round(((totalGuests - (await prisma.guest.count({ where: { eventId, rsvp: 'pendente' } }))) / totalGuests) * 100) : 0,
      },
    ]

    return NextResponse.json({
      rsvpVsPresenca,
      mensagensPorDia,
      custoPorConvidado,
      conversaoPresentes,
      engajamentoPorTier,
      taxaRespostaPorSegmento,
    })
  } catch (error) {
    console.error('Error generating reports:', error)
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 })
  }
}