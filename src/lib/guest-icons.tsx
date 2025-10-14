import { User, Users, Baby } from 'lucide-react'
import type { AgeGroup, Gender } from '@/schemas'

export function getGuestIcon(
  gender?: Gender,
  ageGroup: AgeGroup = 'adult'
): React.ReactNode {
  // Bebês sempre usam ícone de bebê
  if (ageGroup === 'baby') {
    return <Baby className="size-4" />
  }

  // Crianças
  if (ageGroup === 'child') {
    if (gender === 'male') {
      return <span className="text-base">👦</span>
    }
    if (gender === 'female') {
      return <span className="text-base">👧</span>
    }
    return <Users className="size-4" />
  }

  // Adultos
  if (gender === 'male') {
    return <span className="text-base">👨</span>
  }
  if (gender === 'female') {
    return <span className="text-base">👩</span>
  }

  // Default
  return <User className="size-4" />
}

export function getGuestIconEmoji(
  gender?: Gender,
  ageGroup: AgeGroup = 'adult'
): string {
  // Bebês
  if (ageGroup === 'baby') {
    return '👶'
  }

  // Crianças
  if (ageGroup === 'child') {
    if (gender === 'male') return '👦'
    if (gender === 'female') return '👧'
    return '🧒'
  }

  // Adultos
  if (gender === 'male') return '👨'
  if (gender === 'female') return '👩'

  return '👤'
}

export const TABLE_TYPE_CONFIG = {
  regular: {
    label: 'Regular',
    icon: '🪑',
    description: 'Mesa padrão para convidados',
    color: '#C7B7F3',
  },
  vip: {
    label: 'VIP',
    icon: '⭐',
    description: 'Mesa para convidados VIP',
    color: '#F3D9B7',
  },
  family: {
    label: 'Família',
    icon: '👨‍👩‍👧‍👦',
    description: 'Mesa para famílias com crianças',
    color: '#B7F3E3',
  },
  kids: {
    label: 'Kids',
    icon: '🎈',
    description: 'Mesa exclusiva para crianças',
    color: '#F3B7C7',
  },
  singles: {
    label: 'Solteiros',
    icon: '💃',
    description: 'Mesa para convidados solteiros',
    color: '#E3B7F3',
  },
} as const
