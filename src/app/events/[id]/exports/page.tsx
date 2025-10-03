'use client'

import jsPDF from 'jspdf'
import {
  ArrowLeft,
  Download,
  FileText,
  FileSpreadsheet,
  Tag,
  QrCode,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toDataURL as generateQrCode } from 'qrcode'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF
  }
}

interface GuestExport {
  id: string
  contact: {
    fullName: string
    phone: string
    email?: string | null
    relation?: string | null
    isVip?: boolean
    restrictions?: string | null
  }
  rsvp: string
  seats: number
  children: number
  table?: { label?: string | null } | null
  household?: { label?: string | null } | null
}

interface TaskExport {
  title: string
  status: string
  dueAt?: string | null
  assignedTo?: string | null
  vendor?: { name?: string | null } | null
  cost?: number | null
}

interface VendorExport {
  name: string
  category: string
  contact?: string | null
  phone?: string | null
  email?: string | null
  contractValue?: number | null
  amountPaid?: number | null
  paymentStatus?: string | null
}

interface GiftExport {
  title: string
  price?: number | null
  status: string
  guest?: { contact: { fullName: string } } | null
}

export default function ExportsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [loading, setLoading] = useState<string | null>(null)

  async function handleExportPDF() {
    try {
      setLoading('pdf')

      // Fetch guests data
      const res = await fetch(`/api/events/${eventId}/guests?limit=1000`)
      const data = (await res.json()) as { guests?: GuestExport[] }
      const guests = data.guests ?? []

      // Create PDF
      const doc = new jsPDF()

      // Title
      doc.setFontSize(20)
      doc.text('Lista de Convidados', 14, 20)

      // Event info
      doc.setFontSize(10)
      doc.text(`Evento ID: ${eventId}`, 14, 30)
      doc.text(`Data de exportação: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35)

      // Table
      const tableData = guests.map((guest) => [
        guest.contact.fullName,
        guest.contact.phone,
        guest.contact.email || '-',
        guest.rsvp === 'sim'
          ? 'Confirmado'
          : guest.rsvp === 'nao'
            ? 'Recusou'
            : guest.rsvp === 'talvez'
              ? 'Talvez'
              : 'Pendente',
        guest.table?.label || 'Não alocado',
        guest.household?.label || '-',
      ])

      doc.autoTable({
        startY: 45,
        head: [['Nome', 'Telefone', 'Email', 'RSVP', 'Mesa', 'Família']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [134, 63, 68] },
      })

      // Save
      doc.save(`convidados-${eventId}-${Date.now()}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Erro ao exportar PDF')
    } finally {
      setLoading(null)
    }
  }

  async function handleExportExcel() {
    try {
      setLoading('excel')

      // Fetch all data
      const [guestsRes, tasksRes, vendorsRes, giftsRes] = await Promise.all([
        fetch(`/api/events/${eventId}/guests?limit=1000`),
        fetch(`/api/events/${eventId}/tasks`),
        fetch(`/api/events/${eventId}/vendors`),
        fetch(`/api/events/${eventId}/gifts`),
      ])

      const guests = (await guestsRes.json()).guests || []
      const tasks = (await tasksRes.json()) as TaskExport[]
      const vendors = (await vendorsRes.json()) as VendorExport[]
      const gifts = (await giftsRes.json()) as GiftExport[]

      // Create workbook
      const wb = XLSX.utils.book_new()

      // Sheet 1: Guests
      const guestsData = guests.map((g) => ({
        Nome: guest.contact.fullName,
        Telefone: guest.contact.phone,
        Email: guest.contact.email || '',
        Relação: guest.contact.relation,
        VIP: guest.contact.isVip ? 'Sim' : 'Não',
        RSVP: guest.rsvp,
        Assentos: g.seats,
        Crianças: g.children,
        Mesa: guest.table?.label || '',
        Família: guest.household?.label || '',
        Restrições: guest.contact.restrictions || '',
      }))
      const ws1 = XLSX.utils.json_to_sheet(guestsData)
      XLSX.utils.book_append_sheet(wb, ws1, 'Convidados')

      // Sheet 2: Tasks
      const tasksData = tasks.map((t) => ({
        Título: t.title,
        Status: t.status,
        Prazo: t.dueAt ? new Date(t.dueAt).toLocaleDateString('pt-BR') : '',
        Responsável: t.assignedTo || '',
        Fornecedor: t.vendor?.name || '',
        Custo: t.cost || 0,
      }))
      const ws2 = XLSX.utils.json_to_sheet(tasksData)
      XLSX.utils.book_append_sheet(wb, ws2, 'Tarefas')

      // Sheet 3: Vendors
      const vendorsData = vendors.map((v) => ({
        Nome: v.name,
        Categoria: v.category,
        Contato: v.contact,
        Telefone: v.phone || '',
        Email: v.email || '',
        'Valor Contrato': v.contractValue,
        'Valor Pago': v.amountPaid,
        Status: v.paymentStatus,
      }))
      const ws3 = XLSX.utils.json_to_sheet(vendorsData)
      XLSX.utils.book_append_sheet(wb, ws3, 'Fornecedores')

      // Sheet 4: Gifts
      const giftsData = gifts.map((g) => ({
        Presente: g.title,
        Preço: g.price,
        Status: g.status,
        'Reservado Por': g.guest?.contact.fullName || '',
      }))
      const ws4 = XLSX.utils.json_to_sheet(giftsData)
      XLSX.utils.book_append_sheet(wb, ws4, 'Presentes')

      // Save
      XLSX.writeFile(wb, `evento-completo-${eventId}-${Date.now()}.xlsx`)
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Erro ao exportar Excel')
    } finally {
      setLoading(null)
    }
  }

  async function handleExportLabels() {
    try {
      setLoading('labels')

      // Fetch guests data
      const res = await fetch(`/api/events/${eventId}/guests?limit=1000`)
      const data = (await res.json()) as { guests?: GuestExport[] }
      const guests = data.guests ?? []

      // Create PDF with labels (2 columns, 5 rows per page)
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const labelWidth = (pageWidth - 30) / 2
      const labelHeight = 50
      const marginX = 10
      const marginY = 10

      let x = marginX
      let y = marginY
      let count = 0

      guests.forEach((guest, index) => {
        // Draw label border
        doc.rect(x, y, labelWidth, labelHeight)

        // Name
        doc.setFontSize(14)
        doc.text(guest.contact.fullName, x + 5, y + 15, { maxWidth: labelWidth - 10 })

        // Table
        if (guest.table) {
          doc.setFontSize(10)
          doc.text(`Mesa: ${guest.table.label}`, x + 5, y + 30)
        }

        // Move to next position
        count++
        if (count % 2 === 0) {
          x = marginX
          y += labelHeight + 5
        } else {
          x += labelWidth + 10
        }

        // New page if needed
        if (count % 10 === 0 && index < guests.length - 1) {
          doc.addPage()
          x = marginX
          y = marginY
        }
      })

      doc.save(`etiquetas-${eventId}-${Date.now()}.pdf`)
    } catch (error) {
      console.error('Error exporting labels:', error)
      alert('Erro ao exportar etiquetas')
    } finally {
      setLoading(null)
    }
  }

  async function handleExportQRCodes() {
    try {
      setLoading('qr')

      // Fetch guests data
      const res = await fetch(`/api/events/${eventId}/guests?limit=1000`)
      const data = (await res.json()) as { guests?: GuestExport[] }
      const guests = data.guests ?? []

      // Create PDF with QR codes (3 per page)
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const qrSize = 60
      const spacing = (pageWidth - qrSize * 3) / 4

      for (let i = 0; i < guests.length; i += 9) {
        if (i > 0) doc.addPage()

        const pageGuests = guests.slice(i, i + 9)

        for (let j = 0; j < pageGuests.length; j++) {
          const guest = pageGuests[j]
          const row = Math.floor(j / 3)
          const col = j % 3

          const x = spacing + col * (qrSize + spacing)
          const y = 20 + row * (qrSize + 40)

          // Generate QR code
          const qrDataUrl = await generateQrCode(guest.id, {
            width: 200,
            margin: 1,
          })

          // Add QR code
          doc.addImage(qrDataUrl, 'PNG', x, y, qrSize, qrSize)

          // Add name below
          doc.setFontSize(10)
          const nameLines = doc.splitTextToSize(guest.contact.fullName, qrSize)
          doc.text(nameLines, x + qrSize / 2, y + qrSize + 5, { align: 'center' })
        }
      }

      doc.save(`qrcodes-${eventId}-${Date.now()}.pdf`)
    } catch (error) {
      console.error('Error exporting QR codes:', error)
      alert('Erro ao exportar QR codes')
    } finally {
      setLoading(null)
    }
  }

  const exports = [
    {
      id: 'pdf',
      title: 'Lista de Convidados (PDF)',
      description: 'Exporta a lista completa de convidados em formato PDF com tabela',
      icon: FileText,
      color: 'text-red-500',
      handler: handleExportPDF,
    },
    {
      id: 'excel',
      title: 'Evento Completo (Excel)',
      description: 'Exporta todas as informações em Excel com múltiplas abas',
      icon: FileSpreadsheet,
      color: 'text-green-500',
      handler: handleExportExcel,
    },
    {
      id: 'labels',
      title: 'Etiquetas de Mesa',
      description: 'Gera etiquetas para imprimir com nome e mesa de cada convidado',
      icon: Tag,
      color: 'text-blue-500',
      handler: handleExportLabels,
    },
    {
      id: 'qr',
      title: 'QR Codes de Check-in',
      description: 'Gera QR codes individuais para cada convidado fazer check-in',
      icon: QrCode,
      color: 'text-purple-500',
      handler: handleExportQRCodes,
    },
  ]

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="shadow-celebre border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/events/${eventId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading text-3xl font-bold text-celebre-ink">Exportações</h1>
              <p className="mt-1 text-sm text-celebre-muted">
                Baixe relatórios e documentos do seu evento
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {exports.map((exp) => {
            const Icon = exp.icon
            return (
              <Card key={exp.id} className="hover:shadow-celebre-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl bg-gray-100 p-3 ${exp.color}`}>
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <CardTitle className="font-heading">{exp.title}</CardTitle>
                        <CardDescription className="mt-1">{exp.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button onClick={exp.handler} disabled={loading !== null} className="w-full">
                    {loading === exp.id ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 size-4" />
                        Baixar
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Box */}
        <Card className="bg-celebre-accent/20 border-celebre-accent mt-8">
          <CardContent className="p-6">
            <h3 className="mb-2 font-semibold text-celebre-ink">ℹ️ Informações</h3>
            <ul className="space-y-1 text-sm text-celebre-muted">
              <li>• Os arquivos são gerados no momento e não ficam armazenados</li>
              <li>
                • O Excel contém múltiplas abas: Convidados, Tarefas, Fornecedores e Presentes
              </li>
              <li>• As etiquetas estão formatadas para impressão em folhas A4</li>
              <li>• Os QR codes podem ser impressos e distribuídos para check-in</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
