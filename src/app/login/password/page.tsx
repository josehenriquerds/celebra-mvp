'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCsrfToken } from 'next-auth/react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginWithPhoneSchema } from '@/schemas/auth'
import { LoginShell } from '../_components/LoginShell'
import { redirectAfterLogin } from '../_lib/redirect-after-login'
import { safeParseJson } from '../_lib/safe-parse-json'
import type { Session } from 'next-auth'
import type { z } from 'zod'

type FormValues = z.infer<typeof loginWithPhoneSchema>

function LoginPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone')
  const formattedPhone = searchParams.get('formatted') ?? phone ?? ''

  const [csrfToken, setCsrfToken] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(loginWithPhoneSchema),
    defaultValues: {
      phone: phone ?? '',
      password: '',
    },
  })

  useEffect(() => {
    if (!phone) {
      router.replace('/login')
    }
  }, [phone, router])

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token ?? undefined))
  }, [])

  const onSubmit = form.handleSubmit(async (values) => {
    if (!csrfToken || !phone) return
    setServerError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ phone, password: values.password }),
      })

      const data = await safeParseJson<{ error?: string; session?: Session }>(response)

      if (!response.ok) {
        throw new Error(data?.error ?? 'Não foi possível autenticar.')
      }

      if (!data?.session) {
        throw new Error('Resposta invalida do servidor.')
      }

      redirectAfterLogin(router, data.session)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  })

  const createPasswordQuery = useMemo(() => {
    if (!phone) return null
    const params = new URLSearchParams({
      phone,
      formatted: formattedPhone,
    })
    return params.toString()
  }, [phone, formattedPhone])

  const handleNavigateToCreatePassword = () => {
    if (!createPasswordQuery) return
    router.push(`/login/create-password?${createPasswordQuery}`)
  }

  return (
    <LoginShell
      title="Bem-vindo de volta"
      description={`Digite sua senha para acessar o painel. Telefone: ${formattedPhone}`}
    >
      <form className="space-y-6" onSubmit={onSubmit}>
        <input type="hidden" {...form.register('phone')} value={phone ?? ''} readOnly />
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            disabled={loading}
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

        <Button
          type="submit"
          className="w-full rounded-xl bg-primary text-white hover:bg-primary/90"
          disabled={loading || !csrfToken}
        >
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Entrar
        </Button>
      </form>
      <div className="mt-6 space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          Primeiro acesso ou precisa trocar a senha?
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl"
          onClick={handleNavigateToCreatePassword}
          disabled={!createPasswordQuery || loading}
        >
          Criar ou redefinir senha
        </Button>
      </div>
    </LoginShell>
  )
}

function LoginPasswordPageFallback() {
  return (
    <LoginShell
      title="Carregando"
      description="Estamos preparando seu acesso."
    >
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    </LoginShell>
  )
}

export default function LoginPasswordPage() {
  return (
    <Suspense fallback={<LoginPasswordPageFallback />}>
      <LoginPasswordPageContent />
    </Suspense>
  )
}
