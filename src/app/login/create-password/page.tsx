'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCsrfToken } from 'next-auth/react'
import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setPasswordSchema } from '@/schemas/auth'
import { LoginShell } from '../_components/LoginShell'
import { redirectAfterLogin } from '../_lib/redirect-after-login'
import { safeParseJson } from '../_lib/safe-parse-json'
import type { Session } from 'next-auth'
import type { z } from 'zod'

type FormValues = z.infer<typeof setPasswordSchema>

function CreatePasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone')
  const formattedPhone = searchParams.get('formatted') ?? phone ?? ''

  const [csrfToken, setCsrfToken] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(setPasswordSchema),
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
    getCsrfToken().then((token) => {
      setCsrfToken(token ?? undefined)
    })
  }, [])

  const onSubmit = form.handleSubmit(async (values) => {
    if (!csrfToken || !phone) return
    setServerError(null)
    setLoading(true)

    try {
      // Define a nova senha
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ phone, password: values.password }),
      })

      const data = await safeParseJson<{ error?: string }>(response)
      if (!response.ok) {
        throw new Error(data?.error ?? 'Não foi possível definir a senha.')
      }

      // Autentica automaticamente
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ phone, password: values.password }),
      })

      const loginData = await safeParseJson<{ error?: string; session?: Session }>(loginResponse)
      if (!loginResponse.ok) {
        throw new Error(loginData?.error ?? 'Senha criada, mas não foi possível autenticar.')
      }

      if (!loginData?.session) {
        throw new Error('Resposta invalida do servidor.')
      }

      redirectAfterLogin(router, loginData.session)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  })

  return (
    <LoginShell
      title="Definir senha"
      description={`Crie uma senha para acessar o painel da Celebre. Telefone: ${formattedPhone}`}
    >
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <input type="hidden" {...form.register('phone')} value={phone ?? ''} readOnly />
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Crie uma senha segura"
            disabled={loading}
            {...form.register('password')}
          />
          <p className="text-sm text-muted-foreground">
            Min. 8 caracteres, com pelo menos uma letra maiúscula e um número.
          </p>
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
          Salvar senha e continuar
        </Button>
      </form>
    </LoginShell>
  )
}

function CreatePasswordPageFallback() {
  return (
    <LoginShell
      title="Carregando"
      description="Estamos preparando a criação da sua senha."
    >
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    </LoginShell>
  )
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={<CreatePasswordPageFallback />}>
      <CreatePasswordPageContent />
    </Suspense>
  )
}
