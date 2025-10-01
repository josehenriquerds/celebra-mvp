import { NextResponse } from 'next/server'

// Mock data (would be shared in real app)
const mockTasks: any[] = []

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()

  // In a real app, update in database
  return NextResponse.json({
    id: params.id,
    ...body,
    updatedAt: new Date().toISOString(),
  })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // In a real app, delete from database
  return NextResponse.json({ success: true })
}
