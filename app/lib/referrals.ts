// Referral system utilities for ETHMumbai Fan Score

export interface ReferralTier {
  count: number;
  bonus: number;
  badge: string;
  title: string;
}

// Referral bonus tiers - more referrals = more bonus points
export const REFERRAL_TIERS: ReferralTier[] = [
  { count: 10, bonus: 15, badge: "👑", title: "Ambassador" },
  { count: 5, bonus: 8, badge: "🔥", title: "Evangelist" },
  { count: 3, bonus: 5, badge: "📢", title: "Promoter" },
  { count: 1, bonus: 1, badge: "🌱", title: "Connector" },
];

/**
 * Calculate referral bonus based on total referral count
 * Returns the bonus points earned from referrals
 */
export function calculateReferralBonus(referralCount: number): number {
  for (const tier of REFERRAL_TIERS) {
    if (referralCount >= tier.count) {
      return tier.bonus;
    }
  }
  return 0;
}

/**
 * Get the current referral tier based on referral count
 */
export function getReferralTier(referralCount: number): ReferralTier | null {
  for (const tier of REFERRAL_TIERS) {
    if (referralCount >= tier.count) {
      return tier;
    }
  }
  return null;
}

/**
 * Get the next referral tier to unlock
 */
export function getNextReferralTier(referralCount: number): ReferralTier | null {
  // Sort tiers by count ascending
  const sortedTiers = [...REFERRAL_TIERS].sort((a, b) => a.count - b.count);
  
  for (const tier of sortedTiers) {
    if (referralCount < tier.count) {
      return tier;
    }
  }
  return null; // Already at max tier
}

/**
 * Get referrals needed for next tier
 */
export function getReferralsToNextTier(referralCount: number): number {
  const nextTier = getNextReferralTier(referralCount);
  if (!nextTier) return 0;
  return nextTier.count - referralCount;
}

/**
 * Validate a referral code format (cuid)
 * Basic validation to prevent obvious invalid codes
 */
export function isValidReferralCode(code: string | null | undefined): boolean {
  if (!code) return false;
  // cuid is typically 25 characters, alphanumeric
  return code.length >= 20 && code.length <= 30 && /^[a-z0-9]+$/i.test(code);
}
