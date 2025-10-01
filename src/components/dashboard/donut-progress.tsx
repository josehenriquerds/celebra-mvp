'use client'

import { motion } from 'framer-motion'

interface DonutProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function DonutProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  label,
}: DonutProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EADFD7"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#863F44"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-celebre-ink">{Math.round(percentage)}%</span>
        {label && <span className="mt-1 text-xs text-celebre-muted">{label}</span>}
      </div>
    </div>
  )
}
