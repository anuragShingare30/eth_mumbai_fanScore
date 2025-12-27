"use client";

import { RankInfo, getNextRank, getTweetsToNextRank } from "@/app/lib/ranks";
import Image from "next/image";
import { useState } from "react";
import ProfileCard from "./ProfileCard";

interface ScoreCardProps {
  user: {
    handle: string;
    displayName: string | null;
    profileImageUrl: string | null;
    tweetCount: number;
    score: number;
  };
  analysis: {
    ethMumbaiTweets: number;
    ethMumbaiMentions: number;
    ethMumbaiHashtags: number;
  };
  rank: RankInfo;
  leaderboardPosition: number;
}

export default function ScoreCard({
  user,
  analysis,
  rank,
  leaderboardPosition,
}: ScoreCardProps) {
  const nextRank = getNextRank(user.score);
  const tweetsToNext = getTweetsToNextRank(user.score);
  const [showShareCard, setShowShareCard] = useState(false);

  return (
    <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-3 border-(--ethmumbai-cyan)">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-(--ethmumbai-red) to-(--ethmumbai-red-dark) p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-(--ethmumbai-yellow)/20 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between gap-4">
          {/* User Info Section */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-3 border-(--ethmumbai-cyan) shadow-lg flex-shrink-0">
              {user.profileImageUrl && (
                <Image
                  src={user.profileImageUrl}
                  alt={user.displayName || user.handle}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-header">
                {user.displayName || user.handle}
              </h3>
              <p className="text-white/80 font-body text-sm">@{user.handle}</p>
            </div>
          </div>

          {/* Rank Badge and Emoji */}
          <div className="flex items-center gap-3">
            <div className="text-5xl">{rank.emoji}</div>
            <div className="text-center bg-(--ethmumbai-yellow) px-4 py-2 rounded-xl">
              <div className="text-2xl font-bold text-(--ethmumbai-black) font-header leading-none">
                #{leaderboardPosition}
              </div>
              <div className="text-[10px] text-(--ethmumbai-black)/70 font-body uppercase">
                Rank
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Horizontal Layout */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side - Stats and Score */}
          <div className="space-y-4">
            {/* Score Display */}
            <div className="text-center p-4 bg-gradient-to-br from-(--ethmumbai-red) to-(--ethmumbai-red-dark) rounded-2xl">
              <div className="text-5xl font-bold text-white font-header leading-none">
                {user.score}
              </div>
              <div className="text-(--ethmumbai-yellow) font-body uppercase tracking-wider text-sm mt-1">
                Fan Score
              </div>
              <div className="text-white/70 text-xs mt-1 font-body">{rank.name}</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-(--ethmumbai-cyan)/10 border-2 border-(--ethmumbai-cyan) rounded-xl">
                <div className="text-2xl font-bold text-(--ethmumbai-cyan) font-header leading-none">
                  {analysis.ethMumbaiTweets}
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 font-body mt-1 uppercase">
                  Tweets
                </div>
              </div>
              <div className="text-center p-3 bg-(--ethmumbai-red)/10 border-2 border-(--ethmumbai-red) rounded-xl">
                <div className="text-2xl font-bold text-(--ethmumbai-red) font-header leading-none">
                  {analysis.ethMumbaiMentions}
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 font-body mt-1 uppercase">
                  @
                </div>
              </div>
              <div className="text-center p-3 bg-(--ethmumbai-yellow)/20 border-2 border-(--ethmumbai-yellow) rounded-xl">
                <div className="text-2xl font-bold text-(--ethmumbai-black) dark:text-(--ethmumbai-yellow) font-header leading-none">
                  {analysis.ethMumbaiHashtags}
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 font-body mt-1 uppercase">
                  #
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Progress and Action */}
          <div className="space-y-4">

            {/* Progress to next rank */}
            {nextRank && (
              <div className="p-4 bg-(--ethmumbai-cyan)/10 border-2 border-(--ethmumbai-cyan) rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-body">
                    Next: {nextRank.emoji} <span className="font-bold">{nextRank.name}</span>
                  </span>
                  <span className="text-xs font-bold text-(--ethmumbai-red) font-body">
                    +{tweetsToNext} pts
                  </span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-(--ethmumbai-cyan) to-(--ethmumbai-red) transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (user.score / nextRank.minScore) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Share button */}
            <button
              onClick={() => setShowShareCard(true)}
              className="w-full py-3 bg-(--ethmumbai-black) hover:bg-(--ethmumbai-black)/90 text-white font-header text-base rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              SHARE ON X
            </button>

            {/* Description */}
            <p className="text-xs text-center text-gray-600 dark:text-gray-400 font-body italic">
              {rank.description}
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border-2 border-(--ethmumbai-cyan)">
            {/* Close button */}
            <button
              onClick={() => setShowShareCard(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Title */}
            <h3 className="text-xl font-bold text-(--ethmumbai-red) font-header mb-4 text-center">
              Share Your Score 🎉
            </h3>

            {/* Profile Card Component */}
            <ProfileCard
              user={user}
              analysis={analysis}
              rank={rank}
              leaderboardPosition={leaderboardPosition}
            />
          </div>
        </div>
      )}
    </div>
  );
}
