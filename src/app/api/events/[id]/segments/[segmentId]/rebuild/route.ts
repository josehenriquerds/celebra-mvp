import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params: _params }: { params: { id: string; segmentId: string } }
) {
  // In a real app, this would recalculate segment membership
  return NextResponse.json({
    success: true,
    memberCount: Math.floor(Math.random() * 100),
    lastUpdatedAt: new Date().toISOString(),
  })
}
