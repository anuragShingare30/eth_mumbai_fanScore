import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ETHMumbai Fan Score | How big of an ETHMumbai fan are you?",
  description: "Check your Twitter/X activity to discover how big of an ETHMumbai fan you are! Climb the leaderboard and share your score.",
  keywords: ["ETHMumbai", "Ethereum", "Mumbai", "Web3", "Crypto", "Fan Score", "Leaderboard"],
  authors: [{ name: "ETHMumbai Community" }],
  openGraph: {
    title: "ETHMumbai Fan Score",
    description: "Discover how big of an ETHMumbai fan you are based on your Twitter activity!",
    type: "website",
    siteName: "ETHMumbai Fan Score",
  },
  twitter: {
    card: "summary_large_image",
    title: "ETHMumbai Fan Score",
    description: "Discover how big of an ETHMumbai fan you are based on your Twitter activity!",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
