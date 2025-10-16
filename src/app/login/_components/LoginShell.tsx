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
    <div className="animated-gradient-bg px-4 py-4">
      <Card className="login-card w-full max-w-2xl py-10 rounded-3xl border-none bg-white/95 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-2 pb-4 text-center">
          <div className="mx-auto mb-2 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pastel-mint-400 to-pastel-mint-600">
                <span className="text-sm font-bold text-white">C</span>
              </div>
              <span className="text-lg font-semibold text-gray-700">Celebre</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 md:text-3xl">{title}</CardTitle>
          {description ? (
            <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-8">{children}</CardContent>
        {footer ? (
          <div className="px-6 pb-6 text-center text-sm text-gray-600">{footer}</div>
        ) : null}
      </Card>
    </div>
  )
}
