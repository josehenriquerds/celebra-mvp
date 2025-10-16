import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import '../login.css'

interface LoginShellProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function LoginShell({ title, description, children, footer }: LoginShellProps) {
  return (
    <div className="animated-gradient-bg px-2 py-2">
      
      <Card className="login-card flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-none bg-white/95 shadow-2xl backdrop-blur-xl">
        <CardHeader className="shrink-0 space-y-2 pb-4 pt-8 text-center">
          <div className="mx-auto mb-1 flex items-center justify-center">
            <Image
              src="/logo/celebre - logo redonda.png"
              alt="Celebre Logo"
              width={60}
              height={60}
              className="rounded-full"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 md:text-3xl">{title}</CardTitle>
          {description ? (
            <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="flex-1 space-y-5 overflow-y-auto px-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {children}
        </CardContent>
        {footer ? (
          <div className="shrink-0 px-6 pb-6 pt-4 text-center text-sm text-gray-600">{footer}</div>
        ) : null}
      </Card>
    </div>
  )
}
