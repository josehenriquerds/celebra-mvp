import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { importGiftLinks } from '@/server/gifts/offers'

const importSchema = z.object({
  urls: z.union([
    z.string().min(1, 'Informe ao menos uma URL'),
    z.array(z.string().min(1)).min(1, 'Informe ao menos uma URL'),
  ]),
})

function normalizeUrls(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return value
    .split(/\r?\n|,/) // suporta uma URL por linha ou separada por vírgula
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const parsed = importSchema.parse(body)
    const urls = Array.from(new Set(normalizeUrls(parsed.urls)))

    if (urls.length === 0) {
      return NextResponse.json({ error: 'Nenhuma URL válida informada' }, { status: 400 })
    }

    const results = await importGiftLinks(params.id, urls)
    const imported = results.filter((result) => result.success)
    const failed = results.filter((result) => !result.success)

    return NextResponse.json({
      imported: imported.length,
      failed: failed.length,
      results,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.flatten(),
        },
        { status: 422 }
      )
    }

    console.error('Error importing gift links', error)
    return NextResponse.json({ error: 'Erro ao importar presentes' }, { status: 500 })
  }
}
