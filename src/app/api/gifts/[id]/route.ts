import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/gifts/:id - Update gift
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, price, link, status, buyerContactId } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (price !== undefined) updateData.price = price
    if (link !== undefined) updateData.link = link || null
    if (status !== undefined) updateData.status = status
    if (buyerContactId !== undefined) updateData.buyerContactId = buyerContactId

    const gift = await prisma.giftRegistryItem.update({
      where: { id: params.id },
      data: updateData,
    })

    // If marking as received, trigger thank you workflow
    if (status === 'comprado' && gift.buyerContactId) {
      // The n8n workflow agradecimento-presente.json will handle this
      // Call the n8n webhook
      const n8nUrl = process.env.N8N_URL
      if (n8nUrl) {
        try {
          await fetch(`${n8nUrl}/webhook/gift-received`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ giftId: gift.id }),
          })
        } catch (n8nError) {
          console.error('Error calling n8n webhook:', n8nError)
          // Don't fail the request if n8n call fails
        }
      }
    }

    return NextResponse.json(gift)
  } catch (error) {
    console.error('Error updating gift:', error)
    return NextResponse.json({ error: 'Failed to update gift' }, { status: 500 })
  }
}

// DELETE /api/gifts/:id - Delete gift
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.giftRegistryItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gift:', error)
    return NextResponse.json({ error: 'Failed to delete gift' }, { status: 500 })
  }
}
