'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCsrfToken, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { IMaskInput } from 'react-imask'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signupFormSchema, signupSchema } from '@/schemas/auth'
import { LoginShell } from '../../login/_components/LoginShell'
import { redirectAfterLogin } from '../../login/_lib/redirect-after-login'
import { safeParseJson } from '../../login/_lib/safe-parse-json'
import type { z } from 'zod'
import '../../login/login.css'

type SignupFormValues = z.infer<typeof signupFormSchema>

export default function SignupPage() {
  const router = useRouter()
  const [csrfToken, setCsrfToken] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

      // Se o cadastro foi bem-sucedido, faz login automático
      if (data?.session) {
        redirectAfterLogin(router, data.session as any)
      } else {
        // Fallback: tenta fazer login com as credenciais fornecidas
        const signInResult = await signIn('credentials', {
          redirect: false,
          phone: values.phone,
          password: values.password,
        })

        if (signInResult?.ok) {
          router.push('/dashboard')
        } else {
          // Se falhou, redireciona para login manual
          router.push('/login')
        }
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  })

  return (
    <LoginShell
      title="Crie sua conta"
      description="Comece a organizar eventos incríveis em poucos minutos"
      footer={
        <div className="space-y-1 text-sm">
          <p>
            Já possui uma conta?{' '}
            <Link href="/login" className="font-semibold text-[#2d5016] transition-opacity hover:opacity-70">
              Entrar
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="name" className="font-medium text-gray-700">
            Nome completo
          </Label>
          <Input
            id="name"
            placeholder="Como devemos te chamar?"
            autoComplete="name"
            disabled={loading}
            className="pastel-input"
            {...form.register('name')}
          />
          {form.formState.errors.name ? (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="font-medium text-gray-700">
            Telefone
          </Label>
          <IMaskInput
            mask="+55 00 00000-0000"
            value={form.watch('phone')}
            onAccept={(value) => form.setValue('phone', value)}
            disabled={loading}
            placeholder="+55 27 99999-0000"
            inputMode="tel"
            autoComplete="tel"
            className="pastel-input flex h-10 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-celebre-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celebre-brand focus-visible:ring-offset-2"
          />
          {form.formState.errors.phone ? (
            <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Utilize o número com DDI (ex.: +55 27 99999-0000)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium text-gray-700">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="nome@celebre.app"
            autoComplete="email"
            disabled={loading}
            className="pastel-input"
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-medium text-gray-700">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Crie uma senha segura"
              disabled={loading}
              className="pastel-input pr-10"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Min. 8 caracteres, com letra maiúscula e número
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-medium text-gray-700">
            Confirmar senha
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repita a senha"
              disabled={loading}
              className="pastel-input pr-10"
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          {form.formState.errors.confirmPassword ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
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
          <Label htmlFor="acceptTerms" className="text-sm font-medium text-gray-700">
            Aceito os Termos de Uso e autorizo o tratamento dos meus dados conforme a LGPD
          </Label>
        </div>
        {form.formState.errors.acceptTerms ? (
          <p className="text-sm text-destructive">{form.formState.errors.acceptTerms.message}</p>
        ) : null}

        {serverError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm">{serverError}</p>
        ) : null}

        <Button type="submit" className="pastel-button" disabled={loading || !csrfToken}>
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Criar conta
        </Button>
      </form>
    </LoginShell>
  )
}
