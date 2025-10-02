'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  vendorApplySchema,
  type VendorApplyInput,
  vendorCategories,
} from '@/lib/validations/vendor'

export function VendorApplyForm() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{
    logo?: string
    cover?: string
    gallery: string[]
  }>({
    gallery: [],
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VendorApplyInput>({
    resolver: zodResolver(vendorApplySchema) as any,
    defaultValues: {
      country: 'BR',
      categories: [],
    },
  })

  const selectedCategories = watch('categories') || []

  const handleCategoryToggle = (category: string) => {
    const current = selectedCategories
    if (current.includes(category)) {
      setValue(
        'categories',
        current.filter((c) => c !== category)
      )
    } else {
      setValue('categories', [...current, category])
    }
  }

  const handleFileUpload = async (files: FileList | null, type: 'logo' | 'cover' | 'gallery') => {
    if (!files || files.length === 0) return

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('files', file)
    })
    formData.append('type', type)

    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        if (type === 'gallery') {
          setUploadedFiles((prev) => ({
            ...prev,
            gallery: [...prev.gallery, ...data.files.map((f: any) => f.url)],
          }))
        } else {
          setUploadedFiles((prev) => ({
            ...prev,
            [type]: data.files[0].url,
          }))
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro ao fazer upload. Tente novamente.')
    }
  }

  const onSubmit = async (data: VendorApplyInput) => {
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/vendors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        alert(result.error || 'Erro ao enviar cadastro')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Erro ao enviar cadastro. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <div className="mb-4 text-6xl">✅</div>
        <h2 className="mb-4 text-2xl font-bold">Obrigado!</h2>
        <p className="mb-6 text-gray-600">
          Revisaremos seu perfil em até 48h. Você receberá um e-mail/WhatsApp quando for aprovado.
        </p>
        <Button onClick={() => (window.location.href = '/')}>Voltar para o início</Button>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-8">
      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex size-10 items-center justify-center rounded-full ${
              s === step
                ? 'bg-[--brand] text-white'
                : s < step
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step 1: Dados Básicos */}
      {step === 1 && (
        <Card className="space-y-4 p-6">
          <h2 className="mb-4 text-2xl font-bold">Dados da Empresa</h2>

          <div>
            <Label htmlFor="companyName">Nome da Empresa *</Label>
            <Input id="companyName" {...register('companyName')} />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contactName">Nome do Responsável *</Label>
            <Input id="contactName" {...register('contactName')} />
            {errors.contactName && (
              <p className="text-sm text-red-500">{errors.contactName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="phoneE164">Telefone (formato E.164: +5527999999999) *</Label>
            <Input id="phoneE164" {...register('phoneE164')} placeholder="+5527999999999" />
            {errors.phoneE164 && <p className="text-sm text-red-500">{errors.phoneE164.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input id="city" {...register('city')} />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>

            <div>
              <Label htmlFor="state">Estado (UF) *</Label>
              <Input id="state" {...register('state')} maxLength={2} placeholder="ES" />
              {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
            </div>
          </div>

          <Button type="button" onClick={() => setStep(2)} className="w-full">
            Próximo
          </Button>
        </Card>
      )}

      {/* Step 2: Contatos e Serviços */}
      {step === 2 && (
        <Card className="space-y-4 p-6">
          <h2 className="mb-4 text-2xl font-bold">Contatos e Serviços</h2>

          <div>
            <Label htmlFor="instagramHandle">Instagram (@handle)</Label>
            <Input id="instagramHandle" {...register('instagramHandle')} placeholder="@seuperfil" />
          </div>

          <div>
            <Label htmlFor="websiteUrl">Website</Label>
            <Input id="websiteUrl" type="url" {...register('websiteUrl')} />
          </div>

          <div>
            <Label htmlFor="whatsappUrl">Link do WhatsApp</Label>
            <Input
              id="whatsappUrl"
              type="url"
              {...register('whatsappUrl')}
              placeholder="https://wa.me/5527999999999"
            />
          </div>

          <div>
            <Label>Categorias de Serviço * (selecione uma ou mais)</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
              {vendorCategories.map((cat) => (
                <label key={cat} className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={selectedCategories.includes(cat)}
                    onCheckedChange={() => handleCategoryToggle(cat)}
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
            {errors.categories && (
              <p className="text-sm text-red-500">{errors.categories.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="priceFromCents">
              Preço a partir de (em centavos, ex: 150000 = R$ 1.500)
            </Label>
            <Input
              id="priceFromCents"
              type="number"
              {...register('priceFromCents', { valueAsNumber: true })}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
              Voltar
            </Button>
            <Button type="button" onClick={() => setStep(3)} className="flex-1">
              Próximo
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Descrições */}
      {step === 3 && (
        <Card className="space-y-4 p-6">
          <h2 className="mb-4 text-2xl font-bold">Sobre seus Serviços</h2>

          <div>
            <Label htmlFor="descriptionShort">Descrição Curta (máx. 280 caracteres)</Label>
            <Textarea
              id="descriptionShort"
              {...register('descriptionShort')}
              maxLength={280}
              rows={2}
            />
            {errors.descriptionShort && (
              <p className="text-sm text-red-500">{errors.descriptionShort.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="descriptionLong">Descrição Completa (mín. 50 caracteres)</Label>
            <Textarea id="descriptionLong" {...register('descriptionLong')} rows={6} />
            {errors.descriptionLong && (
              <p className="text-sm text-red-500">{errors.descriptionLong.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
              Voltar
            </Button>
            <Button type="button" onClick={() => setStep(4)} className="flex-1">
              Próximo
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Termos e Envio */}
      {step === 4 && (
        <Card className="space-y-4 p-6">
          <h2 className="mb-4 text-2xl font-bold">Termos e Privacidade</h2>

          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto rounded-lg bg-gray-50 p-4 text-sm">
              <h3 className="mb-2 font-bold">Termos de Uso e Política de Privacidade</h3>
              <p>
                Ao se cadastrar como parceiro do Celebre, você concorda com nossos Termos de Uso e
                Política de Privacidade (LGPD). Seus dados serão utilizados exclusivamente para
                conectá-lo com anfitriões de eventos interessados nos seus serviços.
              </p>
              <p className="mt-2">
                Você poderá solicitar a remoção dos seus dados a qualquer momento através do e-mail
                contato@celebre.com ou pelo painel de controle.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox {...register('consentText', { required: true })} />
              <Label className="cursor-pointer">
                Li e aceito os Termos de Uso e a Política de Privacidade do Celebre *
              </Label>
            </div>
            {errors.consentText && (
              <p className="text-sm text-red-500">{errors.consentText.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">
              Voltar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[--brand]">
              {isSubmitting ? 'Enviando...' : 'Enviar Cadastro'}
            </Button>
          </div>
        </Card>
      )}
    </form>
  )
}
