'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import type { Gift } from '@/schemas'
import type {
  CreateGiftPayload,
  GiftOffersResponse,
  UpdateGiftPayload,
} from '../services/gifts.api'
import { GiftLinkImporter } from './GiftLinkImporter'
import { OfferList } from './OfferList'
import { BestPriceBadge } from './BestPriceBadge'

interface GiftDrawerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  gift?: Gift | null
  offersData?: GiftOffersResponse | null
  onSubmit: (payload: CreateGiftPayload | UpdateGiftPayload) => Promise<void>
  onAddOffer?: (url: string) => Promise<void>
  onRefreshOffer?: (offerId: string) => Promise<void>
  onRemoveOffer?: (offerId: string) => Promise<void>
  onSetPrimaryOffer?: (offerId: string) => Promise<void>
  submitting?: boolean
  refreshingOfferId?: string
  removingOfferId?: string
}

type FormValues = {
  title: string
  description: string
  link: string
  imageUrl: string
  category: string
  price: string
  currency: string
  targetQuantity: string
  allowContributions: boolean
  contributionGoal: string
}

const defaultValues: FormValues = {
  title: '',
  description: '',
  link: '',
  imageUrl: '',
  category: '',
  price: '',
  currency: 'BRL',
  targetQuantity: '1',
  allowContributions: false,
  contributionGoal: '',
}

export function GiftDrawerForm({
  open,
  onOpenChange,
  mode,
  gift,
  offersData,
  onSubmit,
  onAddOffer,
  onRefreshOffer,
  onRemoveOffer,
  onSetPrimaryOffer,
  submitting,
  refreshingOfferId,
  removingOfferId,
}: GiftDrawerFormProps) {
  const { toast } = useToast()
  const form = useForm<FormValues>({
    defaultValues,
  })
  const [scrapedProduct, setScrapedProduct] = useState<null | {
    url: string
    canonicalUrl: string
    store?: string
    domain?: string
    imageUrl?: string
    priceCents?: number
    currency?: string
  }>(null)
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined)
  const [offerUrl, setOfferUrl] = useState('')

  useEffect(() => {
    if (gift && open) {
      form.reset({
        title: gift.title,
        description: gift.description ?? '',
        link: gift.link ?? '',
        imageUrl: gift.imageUrl ?? '',
        category: gift.category ?? '',
        price: gift.priceCents ? (gift.priceCents / 100).toString() : gift.price ? gift.price.toString() : '',
        currency: gift.currency ?? 'BRL',
        targetQuantity: gift.targetQuantity?.toString() ?? '1',
        allowContributions: gift.allowContributions ?? false,
        contributionGoal: gift.contributionGoalCents
          ? (gift.contributionGoalCents / 100).toString()
          : '',
      })
      setScrapedProduct(null)
      setSelectedImage(gift.imageUrl ?? undefined)
    }
    if (!open) {
      setOfferUrl('')
    }
  }, [gift, open, form])

  const priceSummary = useMemo(() => {
    if (!gift) return null
    const totalValue = gift.priceCents ?? (gift.price ? Math.round(gift.price * 100) : 0)
    return {
      totalValue,
    }
  }, [gift])

  async function handleSubmit(values: FormValues) {
    const numericPrice = values.price ? Number.parseFloat(values.price.replace(',', '.')) : undefined
    const priceCents = numericPrice !== undefined && !Number.isNaN(numericPrice) ? Math.round(numericPrice * 100) : undefined
    const targetQuantity = Number.parseInt(values.targetQuantity, 10) || 1
    const contributionGoalValue = values.allowContributions && values.contributionGoal
      ? Number.parseFloat(values.contributionGoal.replace(',', '.'))
      : undefined
    const contributionGoalCents = contributionGoalValue !== undefined && !Number.isNaN(contributionGoalValue)
      ? Math.round(contributionGoalValue * 100)
      : undefined

    if (mode === 'create') {
      const payload: CreateGiftPayload = {
        title: values.title,
        description: values.description || undefined,
        link: values.link || undefined,
        imageUrl: selectedImage || values.imageUrl || undefined,
        category: values.category || undefined,
        price: priceCents !== undefined ? priceCents / 100 : undefined,
        priceCents,
        currency: values.currency || 'BRL',
        targetQuantity,
        allowContributions: values.allowContributions,
        contributionGoalCents,
      }

      if (scrapedProduct) {
        payload.primaryOffer = {
          url: scrapedProduct.url,
          canonicalUrl: scrapedProduct.canonicalUrl,
          store: scrapedProduct.store,
          domain: scrapedProduct.domain,
          imageUrl: selectedImage || scrapedProduct.imageUrl,
          priceCents: scrapedProduct.priceCents,
          currency: scrapedProduct.currency,
        }
      }

      await onSubmit(payload)
      onOpenChange(false)
      form.reset(defaultValues)
      setScrapedProduct(null)
      setSelectedImage(undefined)
      return
    }

    const updatePayload: UpdateGiftPayload = {
      title: values.title,
      description: values.description || undefined,
      link: values.link || undefined,
      imageUrl: selectedImage || values.imageUrl || undefined,
      category: values.category || undefined,
      price: priceCents !== undefined ? priceCents / 100 : undefined,
      priceCents,
      currency: values.currency || 'BRL',
      targetQuantity,
      allowContributions: values.allowContributions,
      contributionGoalCents,
    }

    await onSubmit(updatePayload)
    onOpenChange(false)
  }

  async function handleAddOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!offerUrl || !onAddOffer || !gift) return
    try {
      await onAddOffer(offerUrl)
      setOfferUrl('')
      toast({ title: 'Oferta adicionada com sucesso' })
    } catch (error) {
      toast({
        title: 'Erro ao adicionar oferta',
        description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="max-w-3xl">
        <DrawerHeader className="bg-gradient-to-r from-[#F6FBF7] to-[#EFF6FF]">
          <DrawerTitle className="flex items-center justify-between">
            <span>{mode === 'create' ? 'Novo presente' : 'Editar presente'}</span>
            {priceSummary ? (
              <BestPriceBadge
                priceCents={priceSummary.totalValue}
                currency={gift?.currency}
                store={gift?.bestOffer?.store}
                domain={gift?.bestOffer?.domain}
              />
            ) : null}
          </DrawerTitle>
        </DrawerHeader>

        <div className="grid h-full grid-rows-[auto,1fr] gap-4 overflow-y-auto p-6">
          <GiftLinkImporter
            className="bg-[#F9FBFF]"
            onImported={(data) => {
              form.setValue('title', data.title)
              form.setValue('description', data.description ?? '')
              form.setValue('link', data.canonicalUrl ?? data.url ?? '')
              if (data.priceCents) {
                form.setValue('price', (data.priceCents / 100).toString())
              }
              if (data.currency) {
                form.setValue('currency', data.currency)
              }
              form.setValue('imageUrl', data.imageUrl ?? '')
              setScrapedProduct({
                url: data.url,
                canonicalUrl: data.canonicalUrl,
                store: data.store,
                domain: data.domain,
                imageUrl: data.imageUrl,
                priceCents: data.priceCents,
                currency: data.currency,
              })
            }}
            onImageSelected={(imageUrl) => {
              if (imageUrl) {
                form.setValue('imageUrl', imageUrl)
                setSelectedImage(imageUrl)
              }
            }}
          />

          <Tabs defaultValue="info" className="flex flex-col">
            <TabsList className="w-full justify-start gap-3 bg-[#F1F4FB]">
              <TabsTrigger value="info">Informações gerais</TabsTrigger>
              <TabsTrigger value="offers" disabled={!gift}>Ofertas</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" {...form.register('title')} placeholder="Ex: Jogo de panelas inox" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" {...form.register('category')} placeholder="Ex: Cozinha" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Dê detalhes ou recomendações para os convidados"
                    {...form.register('description')}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="link">Link do produto</Label>
                  <Input id="link" {...form.register('link')} placeholder="https://" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço estimado</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    {...form.register('price')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetQuantity">Quantidade alvo</Label>
                  <Input id="targetQuantity" type="number" min="1" {...form.register('targetQuantity')} />
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5EEF5] bg-[#F9FBFF] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1F3A5F]">Permitir contribuições</p>
                    <p className="text-xs text-[#5B6C92]">
                      Os convidados podem contribuir com qualquer valor até atingir o total
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('allowContributions')}
                    onCheckedChange={(checked) => form.setValue('allowContributions', checked)}
                  />
                </div>
                {form.watch('allowContributions') ? (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contributionGoal">Meta de contribuição (R$)</Label>
                      <Input
                        id="contributionGoal"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...form.register('contributionGoal')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor arrecadado</Label>
                      <div className="rounded-xl border border-[#E5EEF5] bg-white px-3 py-2 text-sm text-[#4E6A85]">
                        {gift?.contributionRaisedCents
                          ? formatCurrency(gift.contributionRaisedCents / 100)
                          : 'R$ 0,00'}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="offers" className="mt-4 space-y-4">
              {gift ? (
                <div className="space-y-4">
                  <form onSubmit={handleAddOffer} className="flex flex-col gap-3 rounded-2xl border border-[#E5EEF5] bg-[#F9FBFF] p-4 sm:flex-row">
                    <Input
                      value={offerUrl}
                      onChange={(event) => setOfferUrl(event.target.value)}
                      placeholder="https://www.outraloja.com/produto"
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!offerUrl || !onAddOffer || submitting}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar oferta
                    </Button>
                  </form>
                  <OfferList
                    offers={offersData?.offers ?? []}
                    onRefresh={(offerId) => onRefreshOffer?.(offerId)}
                    onRemove={(offerId) => onRemoveOffer?.(offerId)}
                    onSetPrimary={(offerId) => onSetPrimaryOffer?.(offerId)}
                    refreshingOfferId={refreshingOfferId}
                    removingOfferId={removingOfferId}
                    primaryOfferId={offersData?.gift.primaryOfferId}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#D8E2F0] bg-[#F8FBFE] p-6 text-center text-sm text-[#5B6C92]">
                  Salve o presente para adicionar ofertas.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : mode === 'create' ? (
              'Criar presente'
            ) : (
              'Salvar alterações'
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
