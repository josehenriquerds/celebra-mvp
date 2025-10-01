'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  delay?: number
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="hover:shadow-celebre-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-celebre-muted">{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-celebre-muted" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-celebre-ink">{value}</div>
          {description && <p className="mt-1 text-xs text-celebre-muted">{description}</p>}
          {trend && (
            <div className={`mt-2 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
