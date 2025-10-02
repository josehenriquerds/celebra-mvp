import crypto from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { type NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const type = formData.get('type') as string // 'logo', 'cover', 'gallery'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      // Validações
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo de arquivo não permitido: ${file.type}. Use JPG, PNG ou WEBP.` },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Arquivo muito grande: ${file.name}. Máximo 5MB.` },
          { status: 400 }
        )
      }

      // Gerar nome único
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const hash = crypto.createHash('md5').update(buffer).digest('hex')
      const ext = path.extname(file.name)
      const filename = `${hash}-${Date.now()}${ext}`

      // Criar diretório se não existir
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })

      // Salvar arquivo
      const filepath = path.join(uploadDir, filename)
      await writeFile(filepath, buffer)

      // URL pública
      const publicUrl = `/uploads/${filename}`

      uploadedFiles.push({
        url: publicUrl,
        filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
      })
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload do arquivo' }, { status: 500 })
  }
}
