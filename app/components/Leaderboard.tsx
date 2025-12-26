"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { RankInfo } from "@/app/lib/ranks";
import Image from "next/image";

interface LeaderboardEntry {
  position: number;
  handle: string;
  displayName: string | null;
  profileImageUrl: string | null;
  tweetCount: number;
  mentionCount: number;
  hashtagCount: number;
  score: number;
  rank: RankInfo;
}

interface LeaderboardProps {
  highlightHandle?: string;
  refreshTrigger?: number;
}

export default function Leaderboard({ highlightHandle, refreshTrigger }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLeaderboard = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const response = await fetch("/api/leaderboard?limit=10");
      const data = await response.json();

      if (data.success) {
        setEntries(data.data.leaderboard);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to load leaderboard");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchLeaderboard(false);
    }
  }, [refreshTrigger, fetchLeaderboard]);

  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchLeaderboard(false);
    }, 10000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchLeaderboard]);

  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <span className="text-sm">🥇</span>
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center shadow-lg shadow-gray-400/30">
            <span className="text-sm">🥈</span>
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="text-sm">🥉</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{position}</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-header text-(--ethmumbai-red) mb-3">
            TOP FANS
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-body">Loading leaderboard...</p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-(--ethmumbai-cyan)/20 h-24 rounded-2xl border-2 border-(--ethmumbai-cyan)/30" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl text-center">
        <h2 className="text-4xl sm:text-5xl font-header text-(--ethmumbai-red) mb-4">TOP FANS</h2>
        <p className="text-gray-600 dark:text-gray-400 font-body">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="w-full max-w-4xl text-center">
        <h2 className="text-4xl sm:text-5xl font-header text-(--ethmumbai-red) mb-4">TOP FANS</h2>
        <p className="text-gray-600 dark:text-gray-400 font-body">No entries yet. Be the first to check your score!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl sm:text-5xl font-header text-(--ethmumbai-red) mb-3 tracking-wider">
          🏆 TOP FANS
        </h2>
        <p className="text-gray-600 dark:text-gray-400 font-body text-lg">
          Real-time rankings based on Twitter/X activity
        </p>
      </div>

      {/* Table Header */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-(--ethmumbai-yellow) rounded-2xl mb-4">
        <div className="col-span-1 font-header text-(--ethmumbai-black)">#</div>
        <div className="col-span-4 font-header text-(--ethmumbai-black)">USER</div>
        <div className="col-span-2 text-center font-header text-(--ethmumbai-black)">TWEETS</div>
        <div className="col-span-2 text-center font-header text-(--ethmumbai-black)">MENTIONS</div>
        <div className="col-span-1 text-center font-header text-(--ethmumbai-black)">TAGS</div>
        <div className="col-span-2 text-right font-header text-(--ethmumbai-black)">SCORE</div>
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {entries.map((entry) => {
          const isHighlighted = highlightHandle?.toLowerCase() === entry.handle.toLowerCase();
          
          return (
            <div
              key={entry.handle}
              className={`
                relative overflow-hidden rounded-2xl transition-all duration-300 border-3
                ${isHighlighted 
                  ? "bg-(--ethmumbai-yellow)/20 border-(--ethmumbai-red) shadow-xl shadow-(--ethmumbai-red)/30 animate-pulse-glow" 
                  : "bg-white dark:bg-gray-800 border-(--ethmumbai-cyan) hover:border-(--ethmumbai-red) hover:shadow-lg"
                }
              `}
            >
              {/* Highlight effect */}
              {isHighlighted && (
                <div className="absolute inset-0 bg-gradient-to-r from-(--ethmumbai-red)/10 to-(--ethmumbai-yellow)/10 pointer-events-none" />
              )}

              {/* Mobile Layout */}
              <div className="sm:hidden p-4">
                <div className="flex items-center gap-3 mb-3">
                  {getPositionBadge(entry.position)}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ring-2 ring-white dark:ring-gray-800">
                    {entry.profileImageUrl && (
                      <Image
                        src={entry.profileImageUrl}
                        alt={entry.displayName || entry.handle}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white truncate">
                        {entry.displayName || entry.handle}
                      </span>
                      <span>{entry.rank.emoji}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{entry.handle}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-(--ethmumbai-red) px-4 py-2 rounded-xl">
                      <div className="text-2xl font-bold text-white font-header">
                        {entry.score}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex justify-around pt-3 border-t-2 border-(--ethmumbai-cyan)/30">
                  <div className="text-center">
                    <div className="text-lg font-bold text-(--ethmumbai-cyan) font-header">{entry.tweetCount}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-body uppercase">Tweets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-(--ethmumbai-red) font-header">{entry.mentionCount}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-body uppercase">@</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-(--ethmumbai-yellow) font-header">{entry.hashtagCount}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-body uppercase">#</div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 items-center p-4">
                {/* Position */}
                <div className="col-span-1 flex justify-center">
                  {getPositionBadge(entry.position)}
                </div>

                {/* User Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-md">
                    {entry.profileImageUrl && (
                      <Image
                        src={entry.profileImageUrl}
                        alt={entry.displayName || entry.handle}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-(--ethmumbai-black) dark:text-white truncate font-body">
                        {entry.displayName || entry.handle}
                      </span>
                      <span className="text-xl">{entry.rank.emoji}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate font-body">@{entry.handle}</p>
                  </div>
                </div>

                {/* Tweets */}
                <div className="col-span-2 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--ethmumbai-cyan)/20 border-2 border-(--ethmumbai-cyan)">
                    <span className="font-bold text-(--ethmumbai-cyan) font-header text-lg">{entry.tweetCount}</span>
                  </div>
                </div>

                {/* Mentions */}
                <div className="col-span-2 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--ethmumbai-red)/20 border-2 border-(--ethmumbai-red)">
                    <span className="font-bold text-(--ethmumbai-red) font-header text-lg">{entry.mentionCount}</span>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="col-span-1 text-center">
                  <div className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-(--ethmumbai-yellow)/30 border-2 border-(--ethmumbai-yellow)">
                    <span className="font-bold text-(--ethmumbai-black) dark:text-(--ethmumbai-yellow) font-header text-lg">{entry.hashtagCount}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-2 text-right">
                  <div className="inline-block bg-(--ethmumbai-red) px-5 py-2 rounded-xl">
                    <span className="text-3xl font-bold text-white font-header">
                      {entry.score}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-10 p-6 rounded-2xl bg-(--ethmumbai-light-bg) dark:bg-gray-800/80 border-3 border-(--ethmumbai-cyan)">
        <h3 className="text-lg font-header text-(--ethmumbai-black) dark:text-white mb-4">📊 SCORING SYSTEM</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 rounded-xl bg-(--ethmumbai-cyan)/20 border-2 border-(--ethmumbai-cyan) text-(--ethmumbai-cyan) font-body font-bold">📝 Tweets</span>
            <span className="text-gray-700 dark:text-gray-300 font-body">= 1 point</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 rounded-xl bg-(--ethmumbai-red)/20 border-2 border-(--ethmumbai-red) text-(--ethmumbai-red) font-body font-bold">@ Mentions</span>
            <span className="text-gray-700 dark:text-gray-300 font-body">= 0.5 points</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 rounded-xl bg-(--ethmumbai-yellow)/30 border-2 border-(--ethmumbai-yellow) text-(--ethmumbai-black) font-body font-bold"># Hashtags</span>
            <span className="text-gray-700 dark:text-gray-300 font-body">= 0.3 points</span>
          </div>
        </div>
      </div>
    </div>
  );
}
