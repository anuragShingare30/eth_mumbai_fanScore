import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getRankByScore } from "@/app/lib/ranks";
import { getLeaderboardVersion } from "@/app/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Get top users sorted by score
    const users = await prisma.user.findMany({
      orderBy: {
        ethMumbaiScore: "desc",
      },
      take: limit,
      skip: skip,
    });

    // Get total count for pagination
    const totalUsers = await prisma.user.count();

    // Add rank info to each user
    const leaderboard = users.map((user, index) => ({
      position: skip + index + 1,
      handle: user.twitterHandle,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
      tweetCount: user.tweetCount,
      mentionCount: user.mentionCount,
      hashtagCount: user.hashtagCount,
      score: user.ethMumbaiScore,
      rank: getRankByScore(user.ethMumbaiScore),
    }));

    // Include version for real-time polling
    const version = getLeaderboardVersion();

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
        },
        version,
      },
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
