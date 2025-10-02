'use client'

import { ArrowLeft, Plus, Edit2, Trash2, X, Users, Filter, Send } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface SegmentRule {
  field: string
  operator: string
  value: string
}

interface Segment {
  id: string
  label: string
  description: string | null
  rules: any
  _count: {
    guests: number
  }
}

const FIELDS = [
  { value: 'rsvp', label: 'RSVP', type: 'select' },
  { value: 'contact.isVip', label: 'É VIP', type: 'boolean' },
  { value: 'contact.relation', label: 'Relação', type: 'text' },
  { value: 'children', label: 'Crianças', type: 'number' },
  { value: 'engagementScore.tier', label: 'Tier de Engajamento', type: 'select' },
  { value: 'engagementScore.value', label: 'Score de Engajamento', type: 'number' },
  { value: 'optOut', label: 'Opt-out', type: 'boolean' },
  { value: 'household', label: 'Tem Família', type: 'boolean' },
]

const OPERATORS = {
  text: [
    { value: 'eq', label: 'Igual a' },
    { value: 'contains', label: 'Contém' },
  ],
  number: [
    { value: 'eq', label: 'Igual a' },
    { value: 'gt', label: 'Maior que' },
    { value: 'lt', label: 'Menor que' },
    { value: 'gte', label: 'Maior ou igual' },
    { value: 'lte', label: 'Menor ou igual' },
  ],
  boolean: [{ value: 'eq', label: 'É' }],
  select: [{ value: 'eq', label: 'Igual a' }],
}

const RSVP_OPTIONS = ['sim', 'nao', 'talvez', 'pendente']
const TIER_OPTIONS = ['bronze', 'prata', 'ouro']

export default function SegmentsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null)
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    rules: [] as SegmentRule[],
  })
  const [previewCount, setPreviewCount] = useState<number | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    fetchSegments()
  }, [eventId])

  async function fetchSegments() {
    try {
      setLoading(true)
      const res = await fetch(`/api/events/${eventId}/segments`)
      const data = await res.json()
      setSegments(data || [])
    } catch (error) {
      console.error('Error fetching segments:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingSegment(null)
    setFormData({
      label: '',
      description: '',
      rules: [{ field: 'rsvp', operator: 'eq', value: 'sim' }],
    })
    setPreviewCount(null)
    setShowModal(true)
  }

  function openEditModal(segment: Segment) {
    setEditingSegment(segment)
    setFormData({
      label: segment.label,
      description: segment.description || '',
      rules: segment.rules.and || [{ field: 'rsvp', operator: 'eq', value: 'sim' }],
    })
    setPreviewCount(segment._count.guests)
    setShowModal(true)
  }

  function addRule() {
    setFormData({
      ...formData,
      rules: [...formData.rules, { field: 'rsvp', operator: 'eq', value: 'sim' }],
    })
  }

  function updateRule(index: number, field: keyof SegmentRule, value: string) {
    const newRules = [...formData.rules]
    newRules[index] = { ...newRules[index], [field]: value }

    // Reset operator and value when field changes
    if (field === 'field') {
      const fieldConfig = FIELDS.find((f) => f.value === value)
      newRules[index].operator = 'eq'
      newRules[index].value = ''
    }

    setFormData({ ...formData, rules: newRules })
  }

  function removeRule(index: number) {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index),
    })
  }

  async function handlePreview() {
    try {
      setPreviewLoading(true)
      const res = await fetch(`/api/events/${eventId}/segments/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: { and: formData.rules } }),
      })
      const data = await res.json()
      setPreviewCount(data.count)
    } catch (error) {
      console.error('Error previewing segment:', error)
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleSubmit() {
    try {
      const url = editingSegment
        ? `/api/segments/${editingSegment.id}`
        : `/api/events/${eventId}/segments`

      const res = await fetch(url, {
        method: editingSegment ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: formData.label,
          description: formData.description,
          rules: { and: formData.rules },
        }),
      })

      if (res.ok) {
        setShowModal(false)
        await fetchSegments()
      }
    } catch (error) {
      console.error('Error saving segment:', error)
    }
  }

  async function handleDelete(segmentId: string) {
    if (!confirm('Tem certeza que deseja deletar este segmento?')) return

    try {
      const res = await fetch(`/api/segments/${segmentId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchSegments()
      }
    } catch (error) {
      console.error('Error deleting segment:', error)
    }
  }

  async function handleSendMessage(segmentId: string) {
    const message = prompt('Digite a mensagem para enviar a este segmento:')
    if (!message) return

    try {
      const res = await fetch(`/api/segments/${segmentId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Mensagem enviada para ${data.sent} convidado(s)!`)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  function getFieldConfig(fieldValue: string) {
    return FIELDS.find((f) => f.value === fieldValue)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
        <div className="text-center">
          <div className="border-celebre-brand mx-auto mb-4 size-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-celebre-muted">Carregando segmentos...</p>
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
                  Segmentação Dinâmica
                </h1>
                <p className="mt-1 text-sm text-celebre-muted">
                  Crie filtros avançados e envie mensagens direcionadas
                </p>
              </div>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 size-4" />
              Novo Segmento
            </Button>
          </div>
        </div>
      </header>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <Card className="my-8 w-full max-w-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading">
                  {editingSegment ? 'Editar Segmento' : 'Novo Segmento'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-celebre-ink">Nome do Segmento</label>
                  <Input
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Ex: VIPs Confirmados"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-celebre-ink">
                    Descrição (Opcional)
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do segmento..."
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Rules Builder */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-celebre-ink">
                    Regras (todas devem ser verdadeiras)
                  </label>
                  <Button variant="outline" size="sm" onClick={addRule}>
                    <Plus className="mr-1 size-3" />
                    Adicionar Regra
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.rules.map((rule, index) => {
                    const fieldConfig = getFieldConfig(rule.field)
                    const operators =
                      OPERATORS[(fieldConfig?.type || 'text') as keyof typeof OPERATORS]

                    return (
                      <div key={index} className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
                        <div className="grid flex-1 grid-cols-3 gap-2">
                          {/* Field */}
                          <select
                            value={rule.field}
                            onChange={(e) => updateRule(index, 'field', e.target.value)}
                            className="focus:ring-celebre-brand rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                          >
                            {FIELDS.map((field) => (
                              <option key={field.value} value={field.value}>
                                {field.label}
                              </option>
                            ))}
                          </select>

                          {/* Operator */}
                          <select
                            value={rule.operator}
                            onChange={(e) => updateRule(index, 'operator', e.target.value)}
                            className="focus:ring-celebre-brand rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                          >
                            {operators.map((op) => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </select>

                          {/* Value */}
                          {fieldConfig?.type === 'boolean' ? (
                            <select
                              value={rule.value}
                              onChange={(e) => updateRule(index, 'value', e.target.value)}
                              className="focus:ring-celebre-brand rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                            >
                              <option value="true">Sim</option>
                              <option value="false">Não</option>
                            </select>
                          ) : rule.field === 'rsvp' ? (
                            <select
                              value={rule.value}
                              onChange={(e) => updateRule(index, 'value', e.target.value)}
                              className="focus:ring-celebre-brand rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                            >
                              {RSVP_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : rule.field === 'engagementScore.tier' ? (
                            <select
                              value={rule.value}
                              onChange={(e) => updateRule(index, 'value', e.target.value)}
                              className="focus:ring-celebre-brand rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                            >
                              {TIER_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              type={fieldConfig?.type === 'number' ? 'number' : 'text'}
                              value={rule.value}
                              onChange={(e) => updateRule(index, 'value', e.target.value)}
                              placeholder="Valor..."
                            />
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRule(index)}
                          disabled={formData.rules.length === 1}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-celebre-accent/20 flex items-center gap-3 rounded-lg p-4">
                <Users className="text-celebre-brand size-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-celebre-ink">Preview de Convidados</p>
                  {previewCount !== null && (
                    <p className="mt-1 text-xs text-celebre-muted">
                      {previewCount} convidado{previewCount !== 1 ? 's' : ''} neste segmento
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  disabled={previewLoading}
                >
                  {previewLoading ? 'Calculando...' : 'Atualizar Preview'}
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={!formData.label}>
                  {editingSegment ? 'Salvar Alterações' : 'Criar Segmento'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {segments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Filter className="mx-auto mb-4 size-12 text-celebre-muted opacity-50" />
              <p className="mb-4 text-celebre-muted">Nenhum segmento criado ainda</p>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 size-4" />
                Criar Primeiro Segmento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {segments.map((segment) => (
              <Card key={segment.id} className="hover:shadow-celebre-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-celebre-ink">
                        {segment.label}
                      </h3>
                      {segment.description && (
                        <p className="text-xs text-celebre-muted">{segment.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(segment)}
                        className="hover:bg-celebre-accent rounded-lg p-2 transition-colors"
                      >
                        <Edit2 className="size-4 text-celebre-muted" />
                      </button>
                      <button
                        onClick={() => handleDelete(segment.id)}
                        className="rounded-lg p-2 transition-colors hover:bg-red-100"
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Rules Display */}
                  <div className="mb-4 space-y-2">
                    <p className="text-xs font-medium text-celebre-muted">Regras:</p>
                    {(segment.rules?.and || []).map((rule: any, index: number) => {
                      const field = FIELDS.find((f) => f.value === rule.field)
                      return (
                        <div
                          key={index}
                          className="rounded bg-gray-50 p-2 text-xs text-celebre-muted"
                        >
                          {field?.label} {rule.operator === 'eq' ? '=' : rule.operator} {rule.value}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-celebre-muted" />
                      <span className="text-celebre-brand text-sm font-semibold">
                        {segment._count.guests}
                      </span>
                      <span className="text-xs text-celebre-muted">convidados</span>
                    </div>
                    <Button size="sm" onClick={() => handleSendMessage(segment.id)}>
                      <Send className="mr-1 size-3" />
                      Enviar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
