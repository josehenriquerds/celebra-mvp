'use client'

import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCsrfToken } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import InputMask from 'react-input-mask'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoginShell } from './_components/LoginShell'
import { redirectAfterLogin } from './_lib/redirect-after-login'
import { safeParseJson } from './_lib/safe-parse-json'
import './login.css'

type LoginFormValues = {
  identifier: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [csrfToken, setCsrfToken] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isPhone, setIsPhone] = useState(false)

  const form = useForm<LoginFormValues>({
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token ?? undefined))
  }, [])

  // Detecta se é telefone ou email
  const handleIdentifierChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    setIsPhone(cleanValue.length > 0 && /^\+?\d+/.test(value))
    form.setValue('identifier', value)
  }

  const isSubmitDisabled = loading || !csrfToken

  const handleSubmit = async (values: LoginFormValues) => {
    if (!csrfToken) return
    setLoading(true)
    setServerError(null)

    try {
      // Determina se é email ou telefone e formata adequadamente
      const loginData = isPhone
        ? { phone: values.identifier, password: values.password }
        : { email: values.identifier, password: values.password }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(loginData),
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

  const onSubmit = form.handleSubmit(async (values) => {
    await handleSubmit(values)
  })

  return (
    <LoginShell
      title="Entrar na conta"
      description="Acesse sua conta para gerenciar seus eventos"
      footer={
        <div className="space-y-2">
          <p>
            Esqueceu a senha?{' '}
            <Link
              href="mailto:suporte@celebre.app"
              className="font-semibold text-pastel-mint-600 hover:text-pastel-mint-700"
            >
              Fale com o suporte
            </Link>
          </p>
          <p>
            Ainda não tem conta?{' '}
            <Link
              href="/signup"
              className="font-semibold text-pastel-mint-600 hover:text-pastel-mint-700"
            >
              Criar conta
            </Link>
          </p>
        </div>
      }
    >
      {/* Social Login */}

      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="identifier" className="font-medium text-gray-700">
            E-mail ou Telefone
          </Label>
          {isPhone ? (
            <InputMask
              mask="+55 99 99999-9999"
              value={form.watch('identifier')}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              disabled={loading}
            >
              {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
                <Input
                  {...inputProps}
                  id="identifier"
                  placeholder="+55 27 99999-0000"
                  inputMode="tel"
                  autoComplete="tel"
                  className="pastel-input"
                />
              )}
            </InputMask>
          ) : (
            <Input
              id="identifier"
              type="text"
              placeholder="27 99999-0000"
              autoComplete="username"
              disabled={loading}
              className="pastel-input"
              {...form.register('identifier')}
              onChange={(e) => handleIdentifierChange(e.target.value)}
            />
          )}
          <p className="text-sm text-muted-foreground">
            Digite seu e-mail ou telefone com DDD (ex: +55 27 99999-0000)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-medium text-gray-700">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Sua senha"
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
        </div>
        <Button type="submit" className="pastel-button" disabled={isSubmitDisabled}>
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Entrar
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">ou entre com</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              className="social-icon-button"
              title="Entrar com Google"
              onClick={() => {
                // TODO: Implementar login com Google
                console.log('Login com Google')
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </button>
            <button
              type="button"
              className="social-icon-button"
              title="Entrar com Apple"
              onClick={() => {
                // TODO: Implementar login com Apple
                console.log('Login com Apple')
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>
            <button
              type="button"
              className="social-icon-button"
              title="Entrar com GitHub"
              onClick={() => {
                // TODO: Implementar login com GitHub
                console.log('Login com GitHub')
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </button>
          </div>
        </div>
        {serverError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm">
            {serverError}
          </p>
        ) : null}
      </form>
    </LoginShell>
  )
}
