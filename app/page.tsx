"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import SearchForm from "@/app/components/SearchForm";
import ScoreCard from "@/app/components/ScoreCard";
import { RankInfo } from "@/app/lib/ranks";

// Lazy load Leaderboard for better initial page load
const Leaderboard = dynamic(() => import("@/app/components/Leaderboard"), {
  loading: () => (
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
  ),
  ssr: false
});

interface UserResult {
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
  referralCode: string;
  referralCount: number;
  referralBonus: number;
  isOwnProfile?: boolean;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UserResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchedHandle, setSearchedHandle] = useState<string | null>(null);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [claimedHandle, setClaimedHandle] = useState<string | null>(null);
  const [storedReferralCode, setStoredReferralCode] = useState<string | null>(null);

  // On mount: capture ref param and load claimed handle
  useEffect(() => {
    // Load claimed handle from localStorage
    const stored = localStorage.getItem('ethmumbai_claimed_handle');
    if (stored) {
      setClaimedHandle(stored);
    }

    // Capture referral code from URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      // Only store if not already stored (first-click attribution)
      const existingRef = localStorage.getItem('ethmumbai_ref');
      if (!existingRef) {
        localStorage.setItem('ethmumbai_ref', refCode);
      }
      setStoredReferralCode(existingRef || refCode);
      
      // Clean URL without refresh
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Load existing referral code
      const existingRef = localStorage.getItem('ethmumbai_ref');
      if (existingRef) {
        setStoredReferralCode(existingRef);
      }
    }
  }, []);

  const handleSearch = useCallback(async (handle: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSearchedHandle(handle);

    const cleanHandle = handle.replace('@', '').toLowerCase().trim();

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          handle,
          referralCode: storedReferralCode, // Pass stored referral code
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Claim handle logic: first search becomes claimed handle
        if (!claimedHandle) {
          localStorage.setItem('ethmumbai_claimed_handle', cleanHandle);
          setClaimedHandle(cleanHandle);
        }

        // Determine if this is the user's own profile
        const isOwnProfile = claimedHandle === cleanHandle || !claimedHandle;

        setResult({
          ...data.data,
          isOwnProfile,
        });
        
        // Trigger leaderboard refresh after successful search
        setLeaderboardRefresh(prev => prev + 1);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to check score. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [claimedHandle, storedReferralCode]);

  return (
    <div className="min-h-screen bg-white dark:bg-(--ethmumbai-black)">
      {/* Mumbai Stripe Header */}
      <div className="h-3 mumbai-stripes" />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-(--ethmumbai-red) to-(--ethmumbai-red-dark) pb-0 will-change-transform">
        {/* Decorative Clouds - Optimized with Next/Image */}
        <div className="absolute top-4 left-0 w-[300px] h-[150px] opacity-30 pointer-events-none" aria-hidden="true">
          <Image 
            src="/cloud-left.svg" 
            alt="" 
            width={300} 
            height={150}
            className="w-full h-full object-contain animate-float"
            priority={false}
            loading="lazy"
          />
        </div>
        <div className="absolute top-8 right-0 w-[400px] h-[200px] opacity-30 pointer-events-none hidden sm:block" aria-hidden="true">
          <Image 
            src="/cloud-right.svg" 
            alt="" 
            width={400} 
            height={200}
            className="w-full h-full object-contain animate-float-delayed"
            priority={false}
            loading="lazy"
          />
        </div>
        
        {/* Animated Plane - Hidden on mobile for performance */}
        <div className="absolute top-16 left-0 w-[200px] h-[100px] opacity-60 pointer-events-none animate-fly-across hidden md:block" aria-hidden="true">
          <Image 
            src="/plane.svg" 
            alt="" 
            width={200} 
            height={100}
            className="w-full h-full object-contain"
            priority={false}
            loading="lazy"
          />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 z-10">
          <div className="text-center mb-10">
            {/* New Feature Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 mb-5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-(--ethmumbai-cyan) animate-bounce hover:scale-105 transition-transform cursor-default">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--ethmumbai-red) opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-(--ethmumbai-red)"></span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-(--ethmumbai-black) tracking-wide">
                <span className="text-(--ethmumbai-red) uppercase">Update:</span> Get your referral link, invite friends and climb the leaderboard! 🚀
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-header text-white mb-3 tracking-wider">
              ETHMUMBAI
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-header text-(--ethmumbai-yellow) mb-6">
              FAN SCORE
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto font-body font-medium">
              Discover how big of an ETHMumbai fan you are! Check your Twitter/X activity and climb the leaderboard 🚀
            </p>
          </div>

          {/* Search Form */}
          <div className="flex justify-center mb-8">
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-md mx-auto mb-6 animate-slide-up">
              <div className="bg-white dark:bg-gray-800 backdrop-blur-sm border-3 border-(--ethmumbai-red) px-6 py-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-(--ethmumbai-red)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-header text-lg text-(--ethmumbai-red) mb-1">User Not Found</h3>
                    <p className="text-gray-700 dark:text-gray-300 font-body text-sm">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Mumbai Cityscape at bottom - Optimized */}
        <div className="relative w-full h-32 sm:h-40 md:h-48 mt-8" role="img" aria-label="Mumbai Cityscape">
          <Image 
            src="/mumbai-city.png" 
            alt="Mumbai city skyline" 
            fill
            className="object-cover object-top"
            priority={true}
            sizes="100vw"
            quality={85}
          />
        </div>
      </div>

      {/* Result Card Section */}
      {result && (
        <section className="bg-(--ethmumbai-light-bg) dark:bg-gray-900 py-8" aria-label="Your score results">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center animate-slide-up">
              <ScoreCard
                user={result.user}
                analysis={result.analysis}
                rank={result.rank}
                leaderboardPosition={result.leaderboardPosition}
                referralCode={result.referralCode}
                referralCount={result.referralCount}
                referralBonus={result.referralBonus}
                isOwnProfile={result.isOwnProfile ?? true}
                onResetClaim={() => {
                  localStorage.removeItem('ethmumbai_claimed_handle');
                  setClaimedHandle(null);
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Leaderboard Section */}
      <section className="bg-white dark:bg-(--ethmumbai-black) py-16" aria-label="Top fans leaderboard">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center">
            <Suspense fallback={<div className="text-center">Loading leaderboard...</div>}>
              <Leaderboard 
                highlightHandle={searchedHandle || undefined} 
                refreshTrigger={leaderboardRefresh}
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Footer with Mumbai Stripes */}
      <div className="h-3 mumbai-stripes" />
      <footer className="bg-(--ethmumbai-red) py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-white font-body font-medium">
            Built with ❤️ for the{" "}
            <a
              href="https://ethmumbai.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--ethmumbai-yellow) hover:underline font-bold"
            >
              ETHMumbai
            </a>{" "}
            community
          </p>
        </div>
      </footer>
    </div>
  );
}
