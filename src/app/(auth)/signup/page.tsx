'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCsrfToken } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signupFormSchema, signupSchema } from '@/schemas/auth'
import { LoginShell } from '../../login/_components/LoginShell'
import { redirectAfterLogin } from '../../login/_lib/redirect-after-login'
import { safeParseJson } from '../../login/_lib/safe-parse-json'
import type { z } from 'zod'

type SignupFormValues = z.infer<typeof signupFormSchema>

export default function SignupPage() {
  const router = useRouter()
  const [csrfToken, setCsrfToken] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token ?? undefined))
  }, [])

  const onSubmit = form.handleSubmit(async (values) => {
    if (!csrfToken) return
    setLoading(true)
    setServerError(null)

    try {
      const payload = signupSchema.parse({
        name: values.name,
        phone: values.phone,
        email: values.email,
        password: values.password,
        acceptTerms: values.acceptTerms,
      })

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await safeParseJson<{ session?: unknown; error?: string }>(response)

      if (!response.ok) {
        throw new Error(data?.error ?? 'Não foi possível criar a conta.')
      }

      if (!data?.session) {
        throw new Error('Resposta inválida do servidor.')
      }

      redirectAfterLogin(router, data.session as any)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  })

  return (
    <LoginShell
      title="Crie sua conta"
      description="Comece a organizar eventos incríveis em poucos minutos."
      footer={
        <div className="space-y-1 text-sm">
          <p>
            Já possui uma conta?{' '}
            <Link href="/login" className="font-medium text-pastel-lavender-600">
              Entrar
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="grid gap-3">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            placeholder="Como devemos te chamar?"
            autoComplete="name"
            disabled={loading}
            {...form.register('name')}
          />
          {form.formState.errors.name ? (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            placeholder="+55 27 99999-0000"
            inputMode="tel"
            autoComplete="tel"
            disabled={loading}
            {...form.register('phone')}
          />
          {form.formState.errors.phone ? (
            <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Utilize o número com DDI (ex.: +55 27 99999-0000).
            </p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="nome@celebre.app"
            autoComplete="email"
            disabled={loading}
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Crie uma senha segura"
            disabled={loading}
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Min. 8 caracteres, com letra maiúscula e número.
            </p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a senha"
            disabled={loading}
            {...form.register('confirmPassword')}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-pastel-lavender-200/70 bg-pastel-lavender-50/70 p-4">
          <Controller
            name="acceptTerms"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                id="acceptTerms"
                disabled={loading}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="mt-1"
              />
            )}
          />
          <Label
            htmlFor="acceptTerms"
            className="text-sm font-medium text-pastel-lavender-700"
          >
            Aceito os Termos de Uso e autorizo o tratamento dos meus dados conforme a LGPD.
          </Label>
        </div>
        {form.formState.errors.acceptTerms ? (
          <p className="text-sm text-destructive">{form.formState.errors.acceptTerms.message}</p>
        ) : null}

        {serverError ? (
          <p className="rounded-lg bg-pastel-rose-50 px-3 py-2 text-sm text-pastel-rose-700 shadow-elevation-1">
            {serverError}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full rounded-2xl bg-pastel-mint-600 text-white shadow-elevation-2 hover:bg-pastel-mint-700"
          disabled={loading || !csrfToken}
        >
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Criar conta
        </Button>
      </form>
    </LoginShell>
  )
}
