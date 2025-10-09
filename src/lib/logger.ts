type LogLevel = 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

function formatContext(context?: LogContext): LogContext | undefined {
  if (!context || Object.keys(context).length === 0) {
    return undefined
  }

  const sanitized: LogContext = {}
  for (const [key, value] of Object.entries(context)) {
    if (value instanceof Error) {
      sanitized[key] = {
        message: value.message,
        name: value.name,
      }
      continue
    }

    sanitized[key] =
      typeof value === 'object' && value !== null ? JSON.parse(JSON.stringify(value)) : value
  }

  return sanitized
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context: formatContext(context),
  }

  if (level === 'error') {
    console.error(entry)
  } else if (level === 'warn') {
    console.warn(entry)
  } else {
    console.log(entry)
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
}

export type { LogContext }
