import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()

  // In a real app, update in database
  return NextResponse.json({
    id: params.id,
    ...body,
    updatedAt: new Date().toISOString(),
  })
}

export async function DELETE(_request: Request, { params: _params }: { params: { id: string } }) {
  // In a real app, delete from database
  return NextResponse.json({ success: true })
}
