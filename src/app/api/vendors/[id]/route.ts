import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/vendors/:id - Update vendor
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const {
      name,
      category,
      contact,
      email,
      phone,
      contractValue,
      amountPaid,
      paymentStatus,
      notes,
    } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (category !== undefined) updateData.category = category
    if (contact !== undefined) updateData.contact = contact
    if (email !== undefined) updateData.email = email || null
    if (phone !== undefined) updateData.phone = phone || null
    if (contractValue !== undefined) updateData.contractValue = contractValue
    if (amountPaid !== undefined) updateData.amountPaid = amountPaid
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus
    if (notes !== undefined) updateData.notes = notes || null

    const vendor = await prisma.vendor.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 })
  }
}

// DELETE /api/vendors/:id - Delete vendor
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if vendor has linked tasks
    const taskCount = await prisma.task.count({
      where: { relatedVendorId: params.id },
    })

    if (taskCount > 0) {
      return NextResponse.json(
        {
          error: `Não é possível deletar. Este fornecedor possui ${taskCount} tarefa(s) vinculada(s).`,
        },
        { status: 400 }
      )
    }

    await prisma.vendor.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 })
  }
}
