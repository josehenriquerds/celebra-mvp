'use client'

import { X, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSendThankYou } from '@/hooks'

interface ThankYouModalProps {
  contributionId: string
  guestName: string
  eventId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ThankYouModal({
  contributionId,
  guestName,
  eventId,
  isOpen,
  onClose,
  onSuccess,
}: ThankYouModalProps) {
  const sendThankYouMutation = useSendThankYou(eventId)
  const [message, setMessage] = useState(
    `Olá ${guestName}! Muito obrigado pelo presente, ficamos muito felizes com sua contribuição! 💝`
  )
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp')
  const [imageUrl, setImageUrl] = useState('')

  if (!isOpen) return null

  function handleSend() {
    sendThankYouMutation.mutate(
      {
        contributionId,
        message,
        channel,
        imageUrl: imageUrl || undefined,
      },
      {
        onSuccess: () => {
          onSuccess()
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100"
        >
          <X className="size-5" />
        </button>

        <h2 className="mb-4 text-xl font-bold">Enviar Agradecimento</h2>

        <p className="mb-4 text-sm text-gray-600">
          Agradecendo a contribuição de <strong>{guestName}</strong>
        </p>

        <div className="space-y-4">
          <div>
            <Label>Canal de Envio</Label>
            <div className="mt-2 flex gap-2">
              <Button
                variant={channel === 'whatsapp' ? 'default' : 'outline'}
                onClick={() => setChannel('whatsapp')}
                className="flex-1"
              >
                WhatsApp
              </Button>
              <Button
                variant={channel === 'email' ? 'default' : 'outline'}
                onClick={() => setChannel('email')}
                className="flex-1"
              >
                Email
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-1"
              placeholder="Digite sua mensagem de agradecimento..."
            />
            <p className="mt-1 text-xs text-gray-500">
              {message.length} caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="image">Imagem (opcional)</Label>
            <Input
              id="image"
              type="url"
              placeholder="URL da imagem de agradecimento"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Cole a URL de uma imagem personalizada
            </p>
          </div>

          {imageUrl && (
            <div className="rounded border p-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="h-32 w-full object-contain"
                onError={() => setImageUrl('')}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={sendThankYouMutation.isPending || !message.trim()}
              className="flex-1"
            >
              <Send className="mr-2 size-4" />
              {sendThankYouMutation.isPending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
