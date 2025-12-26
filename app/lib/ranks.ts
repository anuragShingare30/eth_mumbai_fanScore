export interface RankInfo {
  name: string;
  minScore: number;
  maxScore: number;
  emoji: string;
  color: string;
  description: string;
}

export const RANKS: RankInfo[] = [
  {
    name: "ETHMumbai Legend",
    minScore: 50,
    maxScore: Infinity,
    emoji: "👑",
    color: "#FFD700",
    description: "The ultimate ETHMumbai evangelist! You live and breathe ETHMumbai!",
  },
  {
    name: "ETHMumbai OG",
    minScore: 30,
    maxScore: 49,
    emoji: "🔥",
    color: "#FF6B35",
    description: "A true OG of the ETHMumbai community!",
  },
  {
    name: "ETHMumbai Enthusiast",
    minScore: 15,
    maxScore: 29,
    emoji: "⚡",
    color: "#8B5CF6",
    description: "You're spreading the ETHMumbai vibes everywhere!",
  },
  {
    name: "ETHMumbai Fan",
    minScore: 5,
    maxScore: 14,
    emoji: "💜",
    color: "#EC4899",
    description: "A dedicated fan of the ETHMumbai community!",
  },
  {
    name: "ETHMumbai Explorer",
    minScore: 1,
    maxScore: 4,
    emoji: "🌱",
    color: "#10B981",
    description: "Just getting started with ETHMumbai - keep tweeting!",
  },
  {
    name: "ETHMumbai Newbie",
    minScore: 0,
    maxScore: 0,
    emoji: "👋",
    color: "#6B7280",
    description: "Welcome! Start tweeting about ETHMumbai to climb the ranks!",
  },
];

export function getRankByScore(score: number): RankInfo {
  for (const rank of RANKS) {
    if (score >= rank.minScore && score <= rank.maxScore) {
      return rank;
    }
  }
  return RANKS[RANKS.length - 1]; // Default to Newbie
}

export function getNextRank(currentScore: number): RankInfo | null {
  const currentRank = getRankByScore(currentScore);
  const currentIndex = RANKS.findIndex((r) => r.name === currentRank.name);
  
  if (currentIndex > 0) {
    return RANKS[currentIndex - 1];
  }
  return null; // Already at max rank
}

export function getTweetsToNextRank(currentScore: number): number {
  const nextRank = getNextRank(currentScore);
  if (!nextRank) return 0;
  return nextRank.minScore - currentScore;
}
