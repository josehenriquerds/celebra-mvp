import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface LoginShellProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function LoginShell({ title, description, children, footer }: LoginShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pastel-lavender-100 via-pastel-rose-50 to-white px-4 py-10">
      <Card className="w-full max-w-md rounded-3xl border-none bg-white/90 shadow-glass backdrop-blur-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-pastel-lavender-700 md:text-3xl">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
        {footer ? <div className="px-6 pb-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </Card>
    </div>
  )
}
