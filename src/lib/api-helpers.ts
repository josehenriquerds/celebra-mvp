import { NextResponse } from 'next/server'
import type { ZodSchema } from 'zod'

/**
 * Parse and validate request body with Zod
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T | NextResponse> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      // Zod validation error
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

/**
 * Type guard for successful parsing
 */
export function isValidationError(result: unknown): result is NextResponse {
  return result instanceof NextResponse
}
