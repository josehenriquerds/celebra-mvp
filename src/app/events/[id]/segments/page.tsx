'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Users,
  Filter,
  Send,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  boolean: [
    { value: 'eq', label: 'É' },
  ],
  select: [
    { value: 'eq', label: 'Igual a' },
  ],
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
      <div className="min-h-screen bg-celebre-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebre-brand mx-auto mb-4"></div>
          <p className="text-celebre-muted">Carregando segmentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="bg-white shadow-celebre border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-heading font-bold text-celebre-ink">
                  Segmentação Dinâmica
                </h1>
                <p className="text-sm text-celebre-muted mt-1">
                  Crie filtros avançados e envie mensagens direcionadas
                </p>
              </div>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Segmento
            </Button>
          </div>
        </div>
      </header>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl my-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading">
                  {editingSegment ? 'Editar Segmento' : 'Novo Segmento'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
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
                  <label className="text-sm font-medium text-celebre-ink">Descrição (Opcional)</label>
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
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-celebre-ink">
                    Regras (todas devem ser verdadeiras)
                  </label>
                  <Button variant="outline" size="sm" onClick={addRule}>
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar Regra
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.rules.map((rule, index) => {
                    const fieldConfig = getFieldConfig(rule.field)
                    const operators = OPERATORS[(fieldConfig?.type || 'text') as keyof typeof OPERATORS]

                    return (
                      <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          {/* Field */}
                          <select
                            value={rule.field}
                            onChange={(e) => updateRule(index, 'field', e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
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
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
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
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
                            >
                              <option value="true">Sim</option>
                              <option value="false">Não</option>
                            </select>
                          ) : rule.field === 'rsvp' ? (
                            <select
                              value={rule.value}
                              onChange={(e) => updateRule(index, 'value', e.target.value)}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
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
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
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
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-4 bg-celebre-accent/20 rounded-lg">
                <Users className="h-5 w-5 text-celebre-brand" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-celebre-ink">Preview de Convidados</p>
                  {previewCount !== null && (
                    <p className="text-xs text-celebre-muted mt-1">
                      {previewCount} convidado{previewCount !== 1 ? 's' : ''} neste segmento
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handlePreview} disabled={previewLoading}>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {segments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto mb-4 text-celebre-muted opacity-50" />
              <p className="text-celebre-muted mb-4">Nenhum segmento criado ainda</p>
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Segmento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.map((segment) => (
              <Card key={segment.id} className="hover:shadow-celebre-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-celebre-ink mb-1">
                        {segment.label}
                      </h3>
                      {segment.description && (
                        <p className="text-xs text-celebre-muted">{segment.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(segment)}
                        className="p-2 hover:bg-celebre-accent rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-celebre-muted" />
                      </button>
                      <button
                        onClick={() => handleDelete(segment.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Rules Display */}
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-celebre-muted">Regras:</p>
                    {(segment.rules?.and || []).map((rule: any, index: number) => {
                      const field = FIELDS.find((f) => f.value === rule.field)
                      return (
                        <div key={index} className="text-xs text-celebre-muted bg-gray-50 p-2 rounded">
                          {field?.label} {rule.operator === 'eq' ? '=' : rule.operator} {rule.value}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-celebre-muted" />
                      <span className="text-sm font-semibold text-celebre-brand">
                        {segment._count.guests}
                      </span>
                      <span className="text-xs text-celebre-muted">convidados</span>
                    </div>
                    <Button size="sm" onClick={() => handleSendMessage(segment.id)}>
                      <Send className="h-3 w-3 mr-1" />
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