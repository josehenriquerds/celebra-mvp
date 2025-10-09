'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCsrfToken } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { loginWithPhoneSchema, loginWithEmailSchema } from '@/schemas/auth'
import { LoginShell } from './_components/LoginShell'
import { redirectAfterLogin } from './_lib/redirect-after-login'
import { safeParseJson } from './_lib/safe-parse-json'
import type { z } from 'zod'

type LoginTab = 'phone' | 'email'
type PhoneFormValues = z.infer<typeof loginWithPhoneSchema>
type EmailFormValues = z.infer<typeof loginWithEmailSchema>

export default function LoginPage() {
  const router = useRouter()
  const [csrfToken, setCsrfToken] = useState<string>()
  const [activeTab, setActiveTab] = useState<LoginTab>('phone')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(loginWithPhoneSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  })

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(loginWithEmailSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token ?? undefined))
  }, [])

  const isSubmitDisabled = loading || !csrfToken

  const handleSubmit = async (values: PhoneFormValues | EmailFormValues) => {
    if (!csrfToken) return
    setLoading(true)
    setServerError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(values),
      })

      const data = await safeParseJson<{ session?: unknown; error?: string }>(response)

      if (!response.ok) {
        throw new Error(data?.error ?? 'Não foi possível autenticar.')
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
  }

  const submitPhone = phoneForm.handleSubmit(async (values) => {
    await handleSubmit(values)
  })

  const submitEmail = emailForm.handleSubmit(async (values) => {
    await handleSubmit(values)
  })

  return (
    <LoginShell
      title="Bem-vindo de volta"
      description="Acesse sua conta para gerenciar seus eventos."
      footer={
        <div className="space-y-2">
          <p>
            Esqueceu a senha?{' '}
            <Link href="mailto:suporte@celebre.app" className="font-medium text-pastel-sky-600">
              Fale com o suporte
            </Link>
          </p>
          <p>
            Ainda não tem conta?{' '}
            <Link href="/signup" className="font-medium text-pastel-lavender-600">
              Criar conta
            </Link>
          </p>
        </div>
      }
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as LoginTab)
          setServerError(null)
        }}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 rounded-full bg-pastel-lavender-100/80 p-1">
          <TabsTrigger
            value="phone"
            className="rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-pastel-lavender-700"
          >
            Telefone
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-pastel-lavender-700"
          >
            E-mail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phone" className="space-y-6">
          <form className="space-y-5" onSubmit={submitPhone} noValidate>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="+55 27 99999-0000"
                inputMode="tel"
                autoComplete="tel"
                disabled={loading}
                {...phoneForm.register('phone')}
              />
              {phoneForm.formState.errors.phone ? (
                <p className="text-sm text-destructive">{phoneForm.formState.errors.phone.message}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Utilize o número com DDI (ex.: +55 27 99999-0000).
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-phone">Senha</Label>
              <Input
                id="password-phone"
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha"
                disabled={loading}
                {...phoneForm.register('password')}
              />
              {phoneForm.formState.errors.password ? (
                <p className="text-sm text-destructive">
                  {phoneForm.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {serverError && activeTab === 'phone' ? (
              <p className="rounded-lg bg-pastel-rose-50 px-3 py-2 text-sm text-pastel-rose-700 shadow-elevation-1">
                {serverError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full rounded-2xl bg-pastel-lavender-600 text-white shadow-elevation-2 hover:bg-pastel-lavender-700"
              disabled={isSubmitDisabled}
            >
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Entrar
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <form className="space-y-5" onSubmit={submitEmail} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome@celebre.app"
                disabled={loading}
                {...emailForm.register('email')}
              />
              {emailForm.formState.errors.email ? (
                <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-email">Senha</Label>
              <Input
                id="password-email"
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha"
                disabled={loading}
                {...emailForm.register('password')}
              />
              {emailForm.formState.errors.password ? (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {serverError && activeTab === 'email' ? (
              <p className="rounded-lg bg-pastel-rose-50 px-3 py-2 text-sm text-pastel-rose-700 shadow-elevation-1">
                {serverError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full rounded-2xl bg-pastel-lavender-600 text-white shadow-elevation-2 hover:bg-pastel-lavender-700"
              disabled={isSubmitDisabled}
            >
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Entrar
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </LoginShell>
  )
}
