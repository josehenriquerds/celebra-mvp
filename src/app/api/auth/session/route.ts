import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  const response = NextResponse.json({ session })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
