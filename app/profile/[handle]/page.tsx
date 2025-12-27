import { Metadata } from "next";
import prisma from "@/app/lib/prisma";
import { getRankByScore, getNextRank, getTweetsToNextRank } from "@/app/lib/ranks";
import Image from "next/image";
import Link from "next/link";

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

// Generate dynamic metadata for Twitter Cards and Open Graph
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { handle } = await params;
  const cleanHandle = handle.replace("@", "").toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { twitterHandle: cleanHandle },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ethmumbai.in";

  if (!user) {
    return {
      title: "User Not Found | ETHMumbai Fan Score",
      description: "This user hasn't been scored yet. Check your own ETHMumbai fan score!",
    };
  }

  const rank = getRankByScore(user.ethMumbaiScore);
  const position = await prisma.user.count({
    where: { ethMumbaiScore: { gt: user.ethMumbaiScore } },
  });
  const leaderboardPosition = position + 1;

  const title = `${user.displayName || user.twitterHandle} is an ${rank.name} ${rank.emoji} | ETHMumbai`;
  const description = `Score: ${user.ethMumbaiScore} | Rank #${leaderboardPosition} on the ETHMumbai Fan Leaderboard. ${rank.description}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/profile/${cleanHandle}`,
      images: [
        {
          url: `${baseUrl}/api/og/${cleanHandle}`,
          width: 1200,
          height: 630,
          alt: `${user.displayName || user.twitterHandle}'s ETHMumbai Fan Score`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/api/og/${cleanHandle}`],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  const cleanHandle = handle.replace("@", "").toLowerCase().trim();

  // Fetch user from database (READ ONLY)
  const user = await prisma.user.findUnique({
    where: { twitterHandle: cleanHandle },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-(--ethmumbai-black) via-gray-900 to-(--ethmumbai-black) flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6">
          <div className="text-6xl">🔍</div>
          <h1 className="text-3xl font-bold text-white font-header">
            User Not Found
          </h1>
          <p className="text-gray-400 font-body max-w-md">
            @{cleanHandle} hasn&apos;t been scored yet. They need to check their score first!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-(--ethmumbai-red) hover:bg-(--ethmumbai-red-dark) text-white font-header rounded-xl transition-all hover:scale-105"
          >
            Check Your Score
          </Link>
        </div>
      </div>
    );
  }

  const rank = getRankByScore(user.ethMumbaiScore);
  const nextRank = getNextRank(user.ethMumbaiScore);
  const tweetsToNext = getTweetsToNextRank(user.ethMumbaiScore);

  // Get leaderboard position
  const position = await prisma.user.count({
    where: { ethMumbaiScore: { gt: user.ethMumbaiScore } },
  });
  const leaderboardPosition = position + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-(--ethmumbai-black) via-gray-900 to-(--ethmumbai-black) flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl sm:text-4xl font-bold text-(--ethmumbai-red) font-header hover:text-(--ethmumbai-red-dark) transition-colors">
            ETHMumbai
          </h1>
          <p className="text-(--ethmumbai-cyan) font-body">Fan Score</p>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-3 border-(--ethmumbai-cyan)">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-(--ethmumbai-red) to-(--ethmumbai-red-dark) p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-(--ethmumbai-yellow)/20 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Profile Image */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-(--ethmumbai-cyan) shadow-xl flex-shrink-0">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl.replace("_normal", "_400x400")}
                  alt={user.displayName || user.twitterHandle}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  👤
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-header">
                {user.displayName || user.twitterHandle}
              </h2>
              <p className="text-white/80 font-body text-lg">@{user.twitterHandle}</p>
            </div>

            {/* Rank Badge */}
            <div className="flex items-center gap-3">
              <div className="text-5xl sm:text-6xl">{rank.emoji}</div>
              <div className="text-center bg-(--ethmumbai-yellow) px-4 py-2 rounded-xl">
                <div className="text-2xl sm:text-3xl font-bold text-(--ethmumbai-black) font-header">
                  #{leaderboardPosition}
                </div>
                <div className="text-xs text-(--ethmumbai-black)/70 font-body uppercase">
                  Rank
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Score */}
          <div className="text-center p-6 bg-gradient-to-br from-(--ethmumbai-red) to-(--ethmumbai-red-dark) rounded-2xl">
            <div className="text-6xl sm:text-7xl font-bold text-white font-header">
              {user.ethMumbaiScore}
            </div>
            <div className="text-(--ethmumbai-yellow) font-body uppercase tracking-wider text-lg mt-2">
              Fan Score
            </div>
            <div className="text-white/70 text-sm mt-1 font-body">
              {rank.name}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-(--ethmumbai-cyan)/10 border-2 border-(--ethmumbai-cyan) rounded-xl">
              <div className="text-3xl font-bold text-(--ethmumbai-cyan) font-header">
                {user.tweetCount}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-body mt-1 uppercase">
                Tweets
              </div>
            </div>
            <div className="text-center p-4 bg-(--ethmumbai-red)/10 border-2 border-(--ethmumbai-red) rounded-xl">
              <div className="text-3xl font-bold text-(--ethmumbai-red) font-header">
                {user.mentionCount}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-body mt-1 uppercase">
                Mentions
              </div>
            </div>
            <div className="text-center p-4 bg-(--ethmumbai-yellow)/20 border-2 border-(--ethmumbai-yellow) rounded-xl">
              <div className="text-3xl font-bold text-(--ethmumbai-black) dark:text-(--ethmumbai-yellow) font-header">
                {user.hashtagCount}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-body mt-1 uppercase">
                Hashtags
              </div>
            </div>
          </div>

          {/* Progress to Next Rank */}
          {nextRank && (
            <div className="p-4 bg-(--ethmumbai-cyan)/10 border-2 border-(--ethmumbai-cyan) rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-body">
                  Next: {nextRank.emoji} <span className="font-bold">{nextRank.name}</span>
                </span>
                <span className="text-sm font-bold text-(--ethmumbai-red) font-body">
                  +{tweetsToNext} pts needed
                </span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-(--ethmumbai-cyan) to-(--ethmumbai-red) transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (user.ethMumbaiScore / nextRank.minScore) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-gray-400 font-body italic">
            {rank.description}
          </p>

          {/* CTA Button */}
          <Link
            href="/"
            className="w-full py-4 bg-(--ethmumbai-black) hover:bg-(--ethmumbai-black)/90 text-white font-header text-lg rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <span>Check Your Score</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm font-body">
          ETHMumbai Fan Score Leaderboard
        </p>
      </div>
    </div>
  );
}
