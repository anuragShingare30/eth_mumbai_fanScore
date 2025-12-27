"use client";

import { RankInfo } from "@/app/lib/ranks";
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
  analysis,
  rank,
  leaderboardPosition,
}: ProfileCardProps) {
  const [showCopied, setShowCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copyImageStatus, setCopyImageStatus] = useState<"idle" | "success" | "error">("idle");

  const displayName = user.displayName || user.handle;

  // Build OG image URL with all parameters - no database needed!
  const ogImageParams = new URLSearchParams({
    handle: user.handle,
    name: displayName,
    score: user.score.toString(),
    rank: rank.name,
    emoji: rank.emoji,
    position: leaderboardPosition.toString(),
    tweets: analysis.ethMumbaiTweets.toString(),
    mentions: analysis.ethMumbaiMentions.toString(),
    hashtags: analysis.ethMumbaiHashtags.toString(),
  });

  const ogImageUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/og?${ogImageParams.toString()}`
    : `/api/og?${ogImageParams.toString()}`;

  const profileUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/profile/${user.handle}`
    : `/profile/${user.handle}`;

  // Download image
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

  // Copy image to clipboard
  const handleCopyImage = async () => {
    setIsCopying(true);
    setCopyImageStatus("idle");
    try {
      const response = await fetch(ogImageUrl);
      const blob = await response.blob();
      
      // Convert to PNG blob for clipboard
      const pngBlob = new Blob([blob], { type: "image/png" });
      
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": pngBlob,
        }),
      ]);
      
      setCopyImageStatus("success");
      setTimeout(() => setCopyImageStatus("idle"), 2000);
    } catch (error) {
      console.error("Copy image failed:", error);
      setCopyImageStatus("error");
      setTimeout(() => setCopyImageStatus("idle"), 2000);
    } finally {
      setIsCopying(false);
    }
  };

  // Share on X
  const handleShareOnX = () => {
    const text = `I'm an ${rank.name} ${rank.emoji} with a score of ${user.score} on the ETHMumbai Fan Leaderboard! Ranked #${leaderboardPosition} 🏆\n\nCheck your score too!`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}&hashtags=ETHMumbai,ETHMumbai2026`;
    window.open(shareUrl, "_blank", "width=550,height=420");
  };

  // Copy profile link
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
      {/* Inline Preview Card - CSS Based */}
      <div className="relative aspect-[1200/630] rounded-2xl overflow-hidden shadow-2xl border-2 border-(--ethmumbai-cyan)/30 bg-[#1a1a2e]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-(--ethmumbai-red)">ETHMumbai</span>
            <span className="text-sm text-(--ethmumbai-cyan)">Fan Score</span>
          </div>
          <div className="flex items-center gap-2 bg-(--ethmumbai-yellow) px-3 py-1 rounded-lg">
            <span className="text-sm font-bold text-(--ethmumbai-black)">#{leaderboardPosition}</span>
            <span className="text-xs text-(--ethmumbai-black)/70">RANK</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex p-4 gap-4 h-[calc(100%-80px)]">
          {/* Left - User Info */}
          <div className="flex flex-col items-center justify-center w-1/3">
            <div className="w-16 h-16 rounded-full border-3 border-(--ethmumbai-cyan) bg-[#2a2a4e] flex items-center justify-center text-3xl">
              {rank.emoji}
            </div>
            <div className="mt-2 text-center">
              <div className="text-white font-bold text-sm truncate max-w-[100px]">
                {displayName.length > 12 ? displayName.slice(0, 12) + "..." : displayName}
              </div>
              <div className="text-gray-400 text-xs">@{user.handle}</div>
            </div>
          </div>

          {/* Right - Score & Stats */}
          <div className="flex-1 flex flex-col justify-center gap-3">
            {/* Score Box */}
            <div className="bg-gradient-to-r from-(--ethmumbai-red) to-(--ethmumbai-red-dark) rounded-xl p-3 flex items-center gap-3">
              <span className="text-3xl">{rank.emoji}</span>
              <div>
                <div className="text-3xl font-bold text-white">{user.score}</div>
                <div className="text-xs text-(--ethmumbai-yellow)">{rank.name}</div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-(--ethmumbai-cyan)/15 border border-(--ethmumbai-cyan) rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-(--ethmumbai-cyan)">{analysis.ethMumbaiTweets}</div>
                <div className="text-[8px] text-gray-400">TWEETS</div>
              </div>
              <div className="bg-(--ethmumbai-red)/15 border border-(--ethmumbai-red) rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-(--ethmumbai-red)">{analysis.ethMumbaiMentions}</div>
                <div className="text-[8px] text-gray-400">MENTIONS</div>
              </div>
              <div className="bg-(--ethmumbai-yellow)/15 border border-(--ethmumbai-yellow) rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-(--ethmumbai-yellow)">{analysis.ethMumbaiHashtags}</div>
                <div className="text-[8px] text-gray-400">HASHTAGS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-2 border-t border-white/10 bg-[#1a1a2e]">
          <span className="text-xs text-gray-400">Check your score at</span>
          <span className="text-xs text-(--ethmumbai-cyan) font-bold">eth-mumbai-fan-score.vercel.app</span>
        </div>
      </div>

      {/* Action Buttons - Row 1: Share & Download */}
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
              Saving...
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

      {/* Copy Image Button */}
      <button
        onClick={handleCopyImage}
        disabled={isCopying}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-(--ethmumbai-red) hover:bg-(--ethmumbai-red-dark) text-white font-header text-sm rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCopying ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Copying...
          </>
        ) : copyImageStatus === "success" ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Image Copied!
          </>
        ) : copyImageStatus === "error" ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Copy Failed - Try Download
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Image to Clipboard
          </>
        )}
      </button>

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
        Download or copy the image to share on any platform! 🎉
      </p>
    </div>
  );
}
