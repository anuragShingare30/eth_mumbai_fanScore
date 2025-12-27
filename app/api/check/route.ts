import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { analyzeRealTweets } from "@/app/lib/twitter";
import { getRankByScore } from "@/app/lib/ranks";
import { calculateReferralBonus, isValidReferralCode } from "@/app/lib/referrals";
import { createId } from '@paralleldrive/cuid2';
import {
  userCache,
  requestDeduplicator,
  apiRateLimiter,
  userRateLimiter,
  incrementLeaderboardVersion,
} from "@/app/lib/cache";

// Cache TTL in seconds - how long before we refresh user data from API
const CACHE_REFRESH_TTL = 300; // 5 minutes
const DB_FRESHNESS_TTL = 3600; // 1 hour - how old DB data can be before re-fetching

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle, forceRefresh = false, referralCode } = body;

    if (!handle) {
      return NextResponse.json(
        { error: "Twitter handle is required" },
        { status: 400 }
      );
    }

    // Clean the handle
    const cleanHandle = handle.replace("@", "").toLowerCase().trim();

    if (cleanHandle.length === 0) {
      return NextResponse.json(
        { error: "Invalid Twitter handle" },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const clientIP = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    // Check user rate limit (10 requests per minute per user)
    if (userRateLimiter.isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    // Check in-memory cache first
    const cachedData = userCache.get(cleanHandle);
    if (cachedData && !forceRefresh) {
      const rankInfo = getRankByScore(cachedData.score);
      const position = await prisma.user.count({
        where: { ethMumbaiScore: { gt: cachedData.score } },
      });
      
      // Fetch referral data from DB (cache doesn't store it)
      const userReferralData = await prisma.user.findUnique({
        where: { twitterHandle: cleanHandle },
        select: { referralCode: true, referralCount: true, referralBonus: true },
      });
      
      return NextResponse.json({
        success: true,
        cached: true,
        data: {
          user: {
            handle: cachedData.handle,
            displayName: cachedData.displayName,
            profileImageUrl: cachedData.profileImageUrl,
            tweetCount: cachedData.tweetCount,
            score: cachedData.score,
          },
          analysis: {
            ethMumbaiTweets: cachedData.ethMumbaiTweets,
            ethMumbaiMentions: cachedData.ethMumbaiMentions,
            ethMumbaiHashtags: cachedData.ethMumbaiHashtags,
          },
          rank: rankInfo,
          leaderboardPosition: position + 1,
          referralCode: userReferralData?.referralCode || null,
          referralCount: userReferralData?.referralCount || 0,
          referralBonus: userReferralData?.referralBonus || 0,
        },
      });
    }

    // Check database for existing user (avoid API call if recent data exists)
    const existingUser = await prisma.user.findUnique({
      where: { twitterHandle: cleanHandle },
    });

    if (existingUser && !forceRefresh) {
      const dataAge = Date.now() - existingUser.updatedAt.getTime();
      const isRecent = dataAge < DB_FRESHNESS_TTL * 1000;

      if (isRecent) {
        // Data is fresh enough, use DB data
        const rankInfo = getRankByScore(existingUser.ethMumbaiScore);
        const position = await prisma.user.count({
          where: { ethMumbaiScore: { gt: existingUser.ethMumbaiScore } },
        });

        // Cache the result
        userCache.set(cleanHandle, {
          handle: existingUser.twitterHandle,
          displayName: existingUser.displayName || cleanHandle,
          profileImageUrl: existingUser.profileImageUrl || "",
          tweetCount: existingUser.tweetCount,
          score: existingUser.ethMumbaiScore,
          ethMumbaiTweets: existingUser.tweetCount,
          ethMumbaiMentions: existingUser.mentionCount,
          ethMumbaiHashtags: existingUser.hashtagCount,
          rank: rankInfo.name,
        });

        return NextResponse.json({
          success: true,
          cached: true,
          fromDb: true,
          data: {
            user: {
              handle: existingUser.twitterHandle,
              displayName: existingUser.displayName,
              profileImageUrl: existingUser.profileImageUrl,
              tweetCount: existingUser.tweetCount,
              score: existingUser.ethMumbaiScore,
            },
            analysis: {
              ethMumbaiTweets: existingUser.tweetCount,
              ethMumbaiMentions: existingUser.mentionCount,
              ethMumbaiHashtags: existingUser.hashtagCount,
            },
            rank: rankInfo,
            leaderboardPosition: position + 1,
            referralCode: existingUser.referralCode,
            referralCount: existingUser.referralCount,
            referralBonus: existingUser.referralBonus,
          },
        });
      }
    }

    // Check API rate limit before making external call
    if (apiRateLimiter.isRateLimited("rapidapi")) {
      // If we have any data, return it even if stale
      if (existingUser) {
        const rankInfo = getRankByScore(existingUser.ethMumbaiScore);
        const position = await prisma.user.count({
          where: { ethMumbaiScore: { gt: existingUser.ethMumbaiScore } },
        });
        
        return NextResponse.json({
          success: true,
          cached: true,
          stale: true,
          data: {
            user: {
              handle: existingUser.twitterHandle,
              displayName: existingUser.displayName,
              profileImageUrl: existingUser.profileImageUrl,
              tweetCount: existingUser.tweetCount,
              score: existingUser.ethMumbaiScore,
            },
            analysis: {
              ethMumbaiTweets: existingUser.tweetCount,
              ethMumbaiMentions: existingUser.mentionCount,
              ethMumbaiHashtags: existingUser.hashtagCount,
            },
            rank: rankInfo,
            leaderboardPosition: position + 1,
            referralCode: existingUser.referralCode,
            referralCount: existingUser.referralCount,
            referralBonus: existingUser.referralBonus,
          },
        });
      }
      
      return NextResponse.json(
        { error: "Service is busy. Please try again in a moment." },
        { status: 503 }
      );
    }

    // Use request deduplicator to prevent duplicate API calls
    const analysis = await requestDeduplicator.dedupe(cleanHandle, async () => {
      const result = await analyzeRealTweets(cleanHandle);
      
      // If API fails, return zero values instead of mock data
      if (!result) {
        return {
          user: {
            handle: cleanHandle,
            displayName: cleanHandle,
            profileImageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanHandle}`,
          },
          totalTweets: 0,
          ethMumbaiTweets: 0,
          ethMumbaiMentions: 0,
          ethMumbaiHashtags: 0,
          score: 0,
        };
      }
      return result;
    });

    // Get rank based on score
    const rankInfo = getRankByScore(analysis.score);

    // Check if this is a new user (for referral tracking)
    const isNewUser = !existingUser;
    
    // Process referral if this is a new user with a valid referral code
    let validatedReferralCode: string | null = null;
    if (isNewUser && referralCode && isValidReferralCode(referralCode)) {
      // Find the referrer by their referral code
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true, twitterHandle: true, referralCount: true },
      });
      
      // Validate: referrer exists and is not self-referral
      if (referrer && referrer.twitterHandle.toLowerCase() !== cleanHandle.toLowerCase()) {
        validatedReferralCode = referralCode;
        
        // Credit the referrer with atomic increment
        const newReferralCount = referrer.referralCount + 1;
        await prisma.user.update({
          where: { id: referrer.id },
          data: {
            referralCount: { increment: 1 },
            referralBonus: calculateReferralBonus(newReferralCount),
          },
        });
        
        console.log(`[Referral] ${cleanHandle} referred by ${referrer.twitterHandle}. New count: ${newReferralCount}`);
      }
    }

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { twitterHandle: cleanHandle },
      update: {
        displayName: analysis.user.displayName,
        profileImageUrl: analysis.user.profileImageUrl,
        tweetCount: analysis.ethMumbaiTweets,
        mentionCount: analysis.ethMumbaiMentions,
        hashtagCount: analysis.ethMumbaiHashtags,
        ethMumbaiScore: analysis.score,
        rank: rankInfo.name,
      },
      create: {
        twitterHandle: cleanHandle,
        displayName: analysis.user.displayName,
        profileImageUrl: analysis.user.profileImageUrl,
        tweetCount: analysis.ethMumbaiTweets,
        mentionCount: analysis.ethMumbaiMentions,
        hashtagCount: analysis.ethMumbaiHashtags,
        ethMumbaiScore: analysis.score,
        rank: rankInfo.name,
        referralCode: createId(), // Generate unique referral code for new users
        referredBy: validatedReferralCode, // Set only on creation
      },
    });

    // Cache the result
    userCache.set(cleanHandle, {
      handle: user.twitterHandle,
      displayName: user.displayName || cleanHandle,
      profileImageUrl: user.profileImageUrl || "",
      tweetCount: user.tweetCount,
      score: user.ethMumbaiScore,
      ethMumbaiTweets: analysis.ethMumbaiTweets,
      ethMumbaiMentions: analysis.ethMumbaiMentions,
      ethMumbaiHashtags: analysis.ethMumbaiHashtags,
      rank: rankInfo.name,
    });

    // Increment leaderboard version for real-time updates
    const newVersion = incrementLeaderboardVersion();

    // Get user's position on leaderboard
    const position = await prisma.user.count({
      where: {
        ethMumbaiScore: {
          gt: user.ethMumbaiScore,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          handle: user.twitterHandle,
          displayName: user.displayName,
          profileImageUrl: user.profileImageUrl,
          tweetCount: user.tweetCount,
          score: user.ethMumbaiScore,
        },
        analysis: {
          ethMumbaiTweets: analysis.ethMumbaiTweets,
          ethMumbaiMentions: analysis.ethMumbaiMentions,
          ethMumbaiHashtags: analysis.ethMumbaiHashtags,
        },
        rank: rankInfo,
        leaderboardPosition: position + 1,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        referralBonus: user.referralBonus,
      },
      leaderboardVersion: newVersion,
    });
  } catch (error) {
    console.error("Error checking fan score:", error);
    return NextResponse.json(
      { error: "Failed to analyze tweets. Please try again." },
      { status: 500 }
    );
  }
}
