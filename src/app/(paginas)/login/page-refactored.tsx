'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Heart } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Lógica de login aqui
    window.location.href = '/dashboard'
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-pastel-lavender-100 via-pastel-rose-50 to-pastel-peach-100" />

      {/* Elementos decorativos */}
      <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-pastel-lavender-200 opacity-20 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-pastel-rose-200 opacity-20 blur-3xl" />

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pastel-lavender-400 to-pastel-rose-400">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="bg-gradient-to-r from-pastel-lavender-600 to-pastel-rose-600 bg-clip-text text-3xl font-bold text-transparent">
            Celebre
          </h1>
          <p className="mt-2 text-celebre-muted">Planeje o casamento dos seus sonhos</p>
        </div>

        <Card variant="glass" className="shadow-elevation-4">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Bem-vinda de volta!</CardTitle>
            <CardDescription className="text-center">
              Entre na sua conta para continuar
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-celebre-ink">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-celebre-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="focus-ring h-12 w-full rounded-2xl border border-pastel-lavender-200 bg-white/80 pl-11 pr-4 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-celebre-ink">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-celebre-muted" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="focus-ring h-12 w-full rounded-2xl border border-pastel-lavender-200 bg-white/80 pl-11 pr-4 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Esqueci senha */}
              <div className="text-right">
                <Link
                  href="/recuperar-senha"
                  className="text-sm text-pastel-lavender-600 hover:text-pastel-lavender-700"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" variant="primary" className="w-full" size="lg">
                Entrar
              </Button>
              <div className="text-center text-sm text-celebre-muted">
                Não tem conta?{' '}
                <Link
                  href="/registro"
                  className="font-medium text-pastel-lavender-600 hover:text-pastel-lavender-700"
                >
                  Criar conta grátis
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-8 space-y-2 text-center">
          <Badge variant="success">100% Gratuito</Badge>
          <p className="text-xs text-celebre-muted">
            Ao continuar, você concorda com nossos{' '}
            <Link href="/termos" className="underline">
              Termos de Uso
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
