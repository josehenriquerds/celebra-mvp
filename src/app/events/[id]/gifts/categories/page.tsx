'use client'

import { ArrowLeft, Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  useGiftCategories,
  useCreateGiftCategory,
  useUpdateGiftCategory,
  useDeleteGiftCategory,
} from '@/hooks'
import type { GiftCategory } from '@/types/api'

export default function GiftCategoriesPage() {
  const params = useParams()
  const eventId = params.id as string
  const { toast } = useToast()

  // Queries
  const { data: categories = [], isLoading } = useGiftCategories(eventId)

  // Mutations
  const createMutation = useCreateGiftCategory(eventId)
  const updateMutation = useUpdateGiftCategory(eventId)
  const deleteMutation = useDeleteGiftCategory(eventId)

  // Local state
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<GiftCategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: '',
  })

  function handleCreateClick() {
    setEditingCategory(null)
    setFormData({ name: '', description: '', iconUrl: '' })
    setShowModal(true)
  }

  function handleEditClick(category: GiftCategory) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      iconUrl: category.iconUrl || '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da categoria é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    if (editingCategory) {
      updateMutation.mutate(
        {
          id: editingCategory.id,
          data: formData,
        },
        {
          onSuccess: () => {
            toast({
              title: 'Categoria atualizada',
              description: 'A categoria foi atualizada com sucesso.',
            })
            setShowModal(false)
          },
        }
      )
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast({
            title: 'Categoria criada',
            description: 'A categoria foi criada com sucesso.',
          })
          setShowModal(false)
        },
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) return

    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: 'Categoria excluída',
          description: 'A categoria foi excluída com sucesso.',
        })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Carregando categorias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}/gifts`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-celebre-ink">
                  Categorias de Presentes
                </h1>
                <p className="mt-1 text-sm text-celebre-muted">
                  Organize seus presentes em categorias
                </p>
              </div>
            </div>
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 size-4" />
              Nova Categoria
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-celebre-muted">Nenhuma categoria criada ainda</p>
              <Button onClick={handleCreateClick} className="mt-4">
                <Plus className="mr-2 size-4" />
                Criar Primeira Categoria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="size-5 text-gray-400" />
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        {category.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {category.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          {category.itemCount || 0} {category.itemCount === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(category)}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Cozinha, Casa, Lua de Mel"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição opcional da categoria"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="iconUrl">Ícone (URL)</Label>
                <Input
                  id="iconUrl"
                  type="url"
                  value={formData.iconUrl}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  placeholder="https://example.com/icon.png"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Salvando...'
                    : 'Salvar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
