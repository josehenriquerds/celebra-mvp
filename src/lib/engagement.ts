export type EngagementTier = 'bronze' | 'prata' | 'ouro'

export interface EngagementFactors {
  rsvpSpeed: number // Points for how fast they RSVP'd
  interactions: number // Number of messages/clicks/etc
  photoShares: number // Shared photos
  giftPurchase: boolean // Bought a gift
  checkinSpeed: number // Early arrival
  referrals: number // Referred other guests
}

const WEIGHTS = {
  rsvpSpeed: 15,
  interactions: 25,
  photoShares: 20,
  giftPurchase: 20,
  checkinSpeed: 10,
  referrals: 10,
}

const TIER_THRESHOLDS = {
  ouro: 70,
  prata: 40,
  bronze: 0,
}

export function calculateEngagementScore(factors: Partial<EngagementFactors>): number {
  let score = 0

  // RSVP Speed (0-15 points)
  if (factors.rsvpSpeed !== undefined) {
    score += Math.min(factors.rsvpSpeed, 100) * (WEIGHTS.rsvpSpeed / 100)
  }

  // Interactions (0-25 points)
  if (factors.interactions !== undefined) {
    const normalized = Math.min(factors.interactions / 10, 1)
    score += normalized * WEIGHTS.interactions
  }

  // Photo Shares (0-20 points)
  if (factors.photoShares !== undefined) {
    const normalized = Math.min(factors.photoShares / 5, 1)
    score += normalized * WEIGHTS.photoShares
  }

  // Gift Purchase (0-20 points)
  if (factors.giftPurchase) {
    score += WEIGHTS.giftPurchase
  }

  // Check-in Speed (0-10 points)
  if (factors.checkinSpeed !== undefined) {
    score += Math.min(factors.checkinSpeed, 100) * (WEIGHTS.checkinSpeed / 100)
  }

  // Referrals (0-10 points)
  if (factors.referrals !== undefined) {
    const normalized = Math.min(factors.referrals / 3, 1)
    score += normalized * WEIGHTS.referrals
  }

  return Math.round(score)
}

export function getTierFromScore(score: number): EngagementTier {
  if (score >= TIER_THRESHOLDS.ouro) return 'ouro'
  if (score >= TIER_THRESHOLDS.prata) return 'prata'
  return 'bronze'
}

export function getTierColor(tier: EngagementTier): string {
  const colors = {
    bronze: '#CD7F32',
    prata: '#C0C0C0',
    ouro: '#FFD700',
  }
  return colors[tier]
}

export function getTierLabel(tier: EngagementTier): string {
  const labels = {
    bronze: 'Bronze',
    prata: 'Prata',
    ouro: 'Ouro',
  }
  return labels[tier]
}
