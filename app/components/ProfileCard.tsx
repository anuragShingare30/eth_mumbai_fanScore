"use client";

import { RankInfo } from "@/app/lib/ranks";
import Image from "next/image";
import { useState } from "react";

interface ProfileCardProps {
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

export default function ProfileCard({
  user,
  rank,
  leaderboardPosition,
}: ProfileCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const profileUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/profile/${user.handle}`
    : `/profile/${user.handle}`;

  const ogImageUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/og/${user.handle}`
    : `/api/og/${user.handle}`;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(ogImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ethmumbai-${user.handle}-score.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareOnX = () => {
    const text = `I'm an ${rank.name} ${rank.emoji} with a score of ${user.score} on the ETHMumbai Fan Leaderboard! Ranked #${leaderboardPosition} 🏆\n\nCheck your score too!`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}&hashtags=ETHMumbai,ETHMumbai2026`;
    window.open(shareUrl, "_blank", "width=550,height=420");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Preview Card */}
      <div className="relative aspect-[1200/630] rounded-2xl overflow-hidden shadow-2xl border-2 border-(--ethmumbai-cyan)/30">
        <Image
          src={ogImageUrl}
          alt="Your ETHMumbai Profile Card"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Share on X Button */}
        <button
          onClick={handleShareOnX}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-(--ethmumbai-black) hover:bg-(--ethmumbai-black)/90 text-white font-header text-sm rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </button>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-(--ethmumbai-cyan) hover:bg-(--ethmumbai-cyan)/90 text-(--ethmumbai-black) font-header text-sm rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </>
          )}
        </button>
      </div>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-body text-sm rounded-xl transition-all"
      >
        {showCopied ? (
          <>
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-500">Link copied!</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Copy profile link
          </>
        )}
      </button>

      {/* Info text */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-body">
        Share your ETHMumbai fan score with the community! 🎉
      </p>
    </div>
  );
}
