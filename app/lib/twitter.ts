// Twitter/X API service for ETHMumbai fan score
// Uses RapidAPI Twitter241 scraper for real Twitter data

export interface TwitterUser {
  handle: string;
  displayName: string;
  profileImageUrl: string;
}

export interface TweetAnalysis {
  user: TwitterUser;
  totalTweets: number;
  ethMumbaiTweets: number;
  ethMumbaiMentions: number;
  ethMumbaiHashtags: number;
  score: number;
}

// Search patterns for ETHMumbai content
const ETHMUMBAI_MENTION = "@ethmumbai";
const ETHMUMBAI_HASHTAGS = [
  "#ethmumbai", 
  "#ETHMumbai", 
  "#ETHMUMBAI",
  "#ethmumbai2026",
  "#ETHMumbai2026",
  "#Ethmumbai2026",
  "#ETHMUMBAI2026"
];

// RapidAPI configuration
const RAPIDAPI_BASE_URL = "https://twitter241.p.rapidapi.com";
const FETCH_TIMEOUT_MS = 10000; // 10 second timeout per request

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Helper function to extract tweet text from RapidAPI response
function extractTweetsFromResponse(data: any): string[] {
  const tweets: string[] = [];
  
  try {
    const instructions = data?.result?.timeline?.instructions || [];
    
    for (const instruction of instructions) {
      if (instruction.type === "TimelineAddEntries") {
        const entries = instruction.entries || [];
        
        for (const entry of entries) {
          if (entry.entryId?.startsWith('cursor-')) continue;
          
          const tweetResult = entry?.content?.itemContent?.tweet_results?.result;
          if (tweetResult?.legacy?.full_text) {
            tweets.push(tweetResult.legacy.full_text);
          }
          
          const items = entry?.content?.items || [];
          for (const item of items) {
            const nestedTweetResult = item?.item?.itemContent?.tweet_results?.result;
            if (nestedTweetResult?.legacy?.full_text) {
              tweets.push(nestedTweetResult.legacy.full_text);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error extracting tweets:", error);
  }
  
  return tweets;
}

// Extract pagination cursor from response
function extractBottomCursor(data: any): string | null {
  try {
    const instructions = data?.result?.timeline?.instructions || [];
    
    for (const instruction of instructions) {
      if (instruction.type === "TimelineAddEntries") {
        const entries = instruction.entries || [];
        
        for (const entry of entries) {
          if (entry.entryId?.startsWith('cursor-bottom-')) {
            return entry?.content?.value || null;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error extracting cursor:", error);
  }
  
  return null;
}

// Real Twitter API implementation using RapidAPI Twitter241
export async function analyzeRealTweets(handle: string): Promise<TweetAnalysis | null> {
  const rapidApiKey = process.env.X_RAPIDAPI_KEY;
  const rapidApiHost = process.env.X_RAPIDAPI_HOST || "twitter241.p.rapidapi.com";
  
  if (!rapidApiKey) {
    console.error("RapidAPI Key not configured");
    return null;
  }

  try {
    const cleanHandle = handle.replace("@", "");
    
    // Step 1: Get user information by username
    console.log(`[Twitter] Fetching user: ${cleanHandle}`);
    const userResponse = await fetchWithTimeout(
      `${RAPIDAPI_BASE_URL}/user?username=${cleanHandle}`,
      {
        headers: { 
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": rapidApiHost,
        },
      }
    );

    if (!userResponse.ok) {
      console.error("RapidAPI error (user lookup):", userResponse.status, userResponse.statusText);
      return null;
    }

    const userData = await userResponse.json();
    let userResult = userData?.user?.result || userData?.result?.data?.user?.result;
    
    if (!userResult?.rest_id) {
      console.error("User not found or unavailable:", cleanHandle);
      return null;
    }

    const userLegacy = userResult.legacy || {};
    const userId = userResult.rest_id;
    
    const displayName = userLegacy.name || userResult.core?.name || cleanHandle;
    const screenName = userLegacy.screen_name || userResult.core?.screen_name || cleanHandle;
    const profileImage = userResult.avatar?.image_url?.replace("_normal", "") || 
                         userLegacy.profile_image_url_https?.replace("_normal", "") ||
                         `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanHandle}`;
    const totalTweets = userLegacy.statuses_count || 0;
    
    console.log(`[Twitter] Found user: ${displayName} (@${screenName}), Total tweets: ${totalTweets}`);
    
    // Step 2: Fetch user's tweets with pagination (max 3 pages for speed)
    const allTweets: string[] = [];
    let cursor: string | null = null;
    const maxPages = 3; // Reduced from 5 to 3 for faster response
    
    for (let page = 0; page < maxPages; page++) {
      const tweetsUrl = cursor 
        ? `${RAPIDAPI_BASE_URL}/user-tweets?user=${userId}&count=40&cursor=${encodeURIComponent(cursor)}`
        : `${RAPIDAPI_BASE_URL}/user-tweets?user=${userId}&count=40`;
      
      console.log(`[Twitter] Fetching tweets page ${page + 1}/${maxPages}...`);
      
      try {
        const tweetsResponse = await fetchWithTimeout(tweetsUrl, {
          headers: { 
            "x-rapidapi-key": rapidApiKey,
            "x-rapidapi-host": rapidApiHost,
          },
        });

        if (!tweetsResponse.ok) {
          console.error("RapidAPI error (tweets fetch):", tweetsResponse.status);
          break;
        }

        const tweetsData = await tweetsResponse.json();
        const pageTweets = extractTweetsFromResponse(tweetsData);
        
        if (pageTweets.length === 0) {
          console.log(`[Twitter] No more tweets on page ${page + 1}`);
          break;
        }
        
        allTweets.push(...pageTweets);
        console.log(`[Twitter] Page ${page + 1}: ${pageTweets.length} tweets (total: ${allTweets.length})`);
        
        cursor = extractBottomCursor(tweetsData);
        if (!cursor) break;
        
        if (allTweets.length >= 100) {
          console.log(`[Twitter] Reached 100 tweets limit`);
          break;
        }
      } catch (pageError: any) {
        if (pageError.name === 'AbortError') {
          console.log(`[Twitter] Page ${page + 1} timed out, using collected tweets`);
        } else {
          console.error(`[Twitter] Error on page ${page + 1}:`, pageError.message);
        }
        break;
      }
    }
    
    console.log(`[Twitter] Analyzing ${allTweets.length} tweets...`);
    
    // Step 3: Analyze tweets for ETHMumbai mentions and hashtags
    let ethMumbaiMentions = 0;
    let ethMumbaiHashtags = 0;
    let ethMumbaiTweets = 0;
    
    for (const tweetText of allTweets) {
      const lowerText = tweetText.toLowerCase();
      let isEthMumbaiRelated = false;
      
      if (lowerText.includes(ETHMUMBAI_MENTION.toLowerCase())) {
        ethMumbaiMentions++;
        isEthMumbaiRelated = true;
      }
      
      for (const hashtag of ETHMUMBAI_HASHTAGS) {
        if (lowerText.includes(hashtag.toLowerCase())) {
          ethMumbaiHashtags++;
          isEthMumbaiRelated = true;
          break;
        }
      }
      
      if (isEthMumbaiRelated) {
        ethMumbaiTweets++;
      }
    }
    
    const score = Math.floor(
      ethMumbaiTweets * 1 + 
      ethMumbaiMentions * 0.5 + 
      ethMumbaiHashtags * 0.3
    );

    console.log(`[Twitter] Results: tweets=${ethMumbaiTweets}, mentions=${ethMumbaiMentions}, hashtags=${ethMumbaiHashtags}, score=${score}`);

    return {
      user: {
        handle: screenName,
        displayName: displayName,
        profileImageUrl: profileImage,
      },
      totalTweets: totalTweets,
      ethMumbaiTweets,
      ethMumbaiMentions,
      ethMumbaiHashtags,
      score,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("Request timed out");
    } else {
      console.error("Error fetching from RapidAPI:", error.message);
    }
    return null;
  }
}
