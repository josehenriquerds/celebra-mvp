'use client'

import { Html5Qrcode } from 'html5-qrcode'
import {
  ArrowLeft,
  QrCode,
  Search,
  CheckCircle,
  XCircle,
  Users,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState, useRef } from 'react'
import { DonutProgress } from '@/components/dashboard/donut-progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Guest {
  id: string
  contact: {
    fullName: string
    phone: string
    isVip: boolean
  }
  rsvp: string
  checkin: {
    id: string
    status: string
    occurredAt: string
  } | null
  table: {
    label: string
  } | null
}

interface CheckinStats {
  total: number
  presentes: number
  ausentes: number
  percentPresentes: number
}

export default function CheckinPage() {
  const params = useParams()
  const eventId = params.id as string
  const qrReaderRef = useRef<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(false)

  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<CheckinStats>({
    total: 0,
    presentes: 0,
    ausentes: 0,
    percentPresentes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [lastCheckin, setLastCheckin] = useState<string | null>(null)

  const fetchGuests = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/events/${eventId}/checkins`)
      const data = await res.json()

      setGuests(data.guests || [])
      setFilteredGuests(data.guests || [])
      setStats(data.stats || { total: 0, presentes: 0, ausentes: 0, percentPresentes: 0 })
    } catch (error) {
      console.error('Error fetching guests:', error)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    void fetchGuests()
    const interval = setInterval(() => {
      void fetchGuests()
    }, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [fetchGuests])

  useEffect(() => {
    if (search) {
      const filtered = guests.filter(
        (g) =>
          g.contact.fullName.toLowerCase().includes(search.toLowerCase()) ||
          g.contact.phone.includes(search)
      )
      setFilteredGuests(filtered)
    } else {
      setFilteredGuests(guests)
    }
  }, [search, guests])

  async function handleManualCheckin(guestId: string) {
    try {
      const res = await fetch(`/api/checkins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, eventId, method: 'manual' }),
      })

      if (res.ok) {
        const guest = guests.find((g) => g.id === guestId)
        setLastCheckin(guest?.contact.fullName || null)
        setTimeout(() => setLastCheckin(null), 3000)
        await fetchGuests()
      }
    } catch (error) {
      console.error('Error doing checkin:', error)
    }
  }

  async function handleQRScan(decodedText: string) {
    try {
      // Expect QR code to contain guestId
      const guestId = decodedText

      const res = await fetch(`/api/checkins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, eventId, method: 'qr_code' }),
      })

      if (res.ok) {
        const guest = guests.find((g) => g.id === guestId)
        setLastCheckin(guest?.contact.fullName || null)
        setTimeout(() => setLastCheckin(null), 3000)
        await fetchGuests()

        // Success sound/haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(200)
        }
      }
    } catch (error) {
      console.error('Error processing QR:', error)
    }
  }

  async function startScanning() {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader')
      qrReaderRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleQRScan,
        (_errorMessage) => {
          // Ignore decode errors
        }
      )

      setScanning(true)
    } catch (error) {
      console.error('Error starting scanner:', error)
      alert('Erro ao iniciar câmera. Verifique as permissões.')
    }
  }

  async function stopScanning() {
    if (qrReaderRef.current) {
      try {
        await qrReaderRef.current.stop()
        qrReaderRef.current = null
        setScanning(false)
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
        <div className="text-center">
          <div className="border-celebre-brand mx-auto mb-4 size-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-celebre-muted">Carregando check-in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="shadow-celebre border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-heading text-3xl font-bold text-celebre-ink">
                  Check-in ao Vivo
                </h1>
                <p className="mt-1 text-sm text-celebre-muted">
                  {stats.presentes} de {stats.total} convidados presentes
                </p>
              </div>
            </div>
            <Button
              variant={scanning ? 'destructive' : 'default'}
              onClick={scanning ? stopScanning : startScanning}
            >
              <QrCode className="mr-2 size-4" />
              {scanning ? 'Parar Scanner' : 'Escanear QR Code'}
            </Button>
          </div>
        </div>
      </header>

      {/* Last Check-in Toast */}
      {lastCheckin && (
        <div className="animate-in slide-in-from-top fixed left-1/2 top-20 z-50 -translate-x-1/2 duration-300">
          <Card className="border-2 border-green-500 shadow-lg">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle className="size-8 text-green-500" />
              <div>
                <p className="font-semibold text-celebre-ink">Check-in realizado!</p>
                <p className="text-sm text-celebre-muted">{lastCheckin}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* QR Scanner */}
        {scanning && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div id="qr-reader" className="mx-auto w-full max-w-md"></div>
              <p className="mt-4 text-center text-celebre-muted">Posicione o QR Code na câmera</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="mx-auto mb-2 size-8 text-celebre-muted" />
              <div className="text-celebre-brand text-3xl font-bold">{stats.total}</div>
              <p className="mt-1 text-sm text-celebre-muted">Total Confirmados</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="mx-auto mb-2 size-8 text-green-500" />
              <div className="text-3xl font-bold text-green-600">{stats.presentes}</div>
              <p className="mt-1 text-sm text-celebre-muted">Presentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="mx-auto mb-2 size-8 text-gray-400" />
              <div className="text-3xl font-bold text-gray-600">{stats.ausentes}</div>
              <p className="mt-1 text-sm text-celebre-muted">Ausentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-center p-6">
              <DonutProgress percentage={stats.percentPresentes} size={120} strokeWidth={10} />
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-celebre-muted" />
              <Input
                type="text"
                placeholder="Buscar convidado por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Guest List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Lista de Convidados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredGuests.length === 0 ? (
                <div className="py-8 text-center text-celebre-muted">
                  <Users className="mx-auto mb-2 size-12 opacity-50" />
                  <p>Nenhum convidado encontrado</p>
                </div>
              ) : (
                filteredGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                      guest.checkin
                        ? 'border-green-200 bg-green-50'
                        : 'hover:bg-celebre-accent/20 bg-white'
                    }`}
                  >
                    <div className="flex flex-1 items-center gap-3">
                      {guest.checkin ? (
                        <CheckCircle className="size-6 text-green-500" />
                      ) : (
                        <div className="size-6 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-celebre-ink">{guest.contact.fullName}</p>
                          {guest.contact.isVip && (
                            <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-celebre-muted">
                          <span>{guest.contact.phone}</span>
                          {guest.table && <span>Mesa: {guest.table.label}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {guest.checkin ? (
                        <Badge variant="success" className="text-xs">
                          Presente
                        </Badge>
                      ) : (
                        <Button size="sm" onClick={() => handleManualCheckin(guest.id)}>
                          Check-in
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
