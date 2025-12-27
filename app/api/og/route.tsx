import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get all data from URL parameters - no database needed!
    const handle = searchParams.get("handle") || "anonymous";
    const displayName = searchParams.get("name") || handle;
    const score = parseInt(searchParams.get("score") || "0", 10);
    const rankName = searchParams.get("rank") || "ETHMumbai Newbie";
    const rankEmoji = searchParams.get("emoji") || "👋";
    const position = parseInt(searchParams.get("position") || "1", 10);
    const tweets = parseInt(searchParams.get("tweets") || "0", 10);
    const mentions = parseInt(searchParams.get("mentions") || "0", 10);
    const hashtags = parseInt(searchParams.get("hashtags") || "0", 10);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#1a1a2e",
            fontFamily: "sans-serif",
          }}
        >
          {/* Header with branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "40px 60px",
              borderBottom: "2px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "#FF6B35",
                }}
              >
                ETHMumbai
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  color: "#00D4AA",
                  marginLeft: 16,
                }}
              >
                Fan Score
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#FFE135",
                padding: "12px 24px",
                borderRadius: 16,
              }}
            >
              <div style={{ display: "flex", fontSize: 28, fontWeight: "bold", color: "#1a1a2e" }}>
                #{position}
              </div>
              <div style={{ display: "flex", fontSize: 16, color: "#1a1a2e", opacity: 0.8, marginLeft: 12 }}>
                RANK
              </div>
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flex: 1,
              padding: "40px 60px",
            }}
          >
            {/* Left side - User info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 280,
              }}
            >
              {/* Profile emoji badge */}
              <div
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  border: "6px solid #00D4AA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#2a2a4e",
                  fontSize: 72,
                }}
              >
                {rankEmoji}
              </div>

              {/* Name and handle */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 32,
                    fontWeight: "bold",
                    color: "#ffffff",
                    textAlign: "center",
                  }}
                >
                  {displayName.length > 18 ? displayName.slice(0, 18) + "..." : displayName}
                </div>
                <div style={{ display: "flex", fontSize: 22, color: "#888888", marginTop: 8 }}>
                  @{handle}
                </div>
              </div>
            </div>

            {/* Right side - Score and stats */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                justifyContent: "center",
                marginLeft: 60,
              }}
            >
              {/* Score display */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "linear-gradient(135deg, #FF6B35 0%, #e74c3c 100%)",
                  padding: "32px 48px",
                  borderRadius: 24,
                }}
              >
                <div style={{ display: "flex", fontSize: 80 }}>{rankEmoji}</div>
                <div style={{ display: "flex", flexDirection: "column", marginLeft: 32 }}>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 72,
                      fontWeight: "bold",
                      color: "#ffffff",
                      lineHeight: 1,
                    }}
                  >
                    {score}
                  </div>
                  <div style={{ display: "flex", fontSize: 24, color: "#FFE135", fontWeight: "600", marginTop: 8 }}>
                    {rankName}
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "flex", marginTop: 32 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    padding: "24px",
                    backgroundColor: "rgba(0, 212, 170, 0.15)",
                    border: "3px solid #00D4AA",
                    borderRadius: 16,
                    marginRight: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 48,
                      fontWeight: "bold",
                      color: "#00D4AA",
                    }}
                  >
                    {tweets}
                  </div>
                  <div style={{ display: "flex", fontSize: 16, color: "#888888", marginTop: 4 }}>
                    TWEETS
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    padding: "24px",
                    backgroundColor: "rgba(255, 107, 53, 0.15)",
                    border: "3px solid #FF6B35",
                    borderRadius: 16,
                    marginRight: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 48,
                      fontWeight: "bold",
                      color: "#FF6B35",
                    }}
                  >
                    {mentions}
                  </div>
                  <div style={{ display: "flex", fontSize: 16, color: "#888888", marginTop: 4 }}>
                    MENTIONS
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    padding: "24px",
                    backgroundColor: "rgba(255, 225, 53, 0.15)",
                    border: "3px solid #FFE135",
                    borderRadius: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 48,
                      fontWeight: "bold",
                      color: "#FFE135",
                    }}
                  >
                    {hashtags}
                  </div>
                  <div style={{ display: "flex", fontSize: 16, color: "#888888", marginTop: 4 }}>
                    HASHTAGS
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 60px",
              borderTop: "2px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", fontSize: 20, color: "#888888" }}>
              Check your score at
            </div>
            <div style={{ display: "flex", fontSize: 20, color: "#00D4AA", fontWeight: "bold", marginLeft: 12 }}>
              eth-mumbai-fan-score.vercel.app
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG image generation error:", error);
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1a1a2e",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", fontSize: 48, color: "#FF6B35" }}>ETHMumbai</div>
          <div style={{ display: "flex", fontSize: 24, color: "#888888", marginTop: 16 }}>
            Fan Score Card
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
