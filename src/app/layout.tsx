import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/providers/ThemeProvider";
import MouseTracker from "@/components/MouseTracker";
import ArgonBackground from "@/components/ArgonBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://justganit.com"),
  title: "JustGanIt | Gan's AI Toolkit & Creative Space",
  description:
    "Building AI-driven tools to enhance productivity and simplify the complex. Explore AI Translator, LLM Poker Arena, creative music, and insights by Gan.",
  keywords: [
    "JustGanIt",
    "Gan",
    "AI Tools",
    "AI Translator",
    "LLM Poker Arena",
    "Full-Stack Developer",
    "Next.js",
    "WebGL",
  ],
  authors: [{ name: "Gan", url: "https://justganit.com" }],
  openGraph: {
    title: "JustGanIt | Gan's AI Toolkit & Creative Space",
    description:
      "Building AI-driven tools to enhance productivity and simplify the complex.",
    url: "https://justganit.com",
    siteName: "JustGanIt",
    images: [
      {
        url: "/logo-fist.jpg",
        width: 512,
        height: 512,
        alt: "JustGanIt Logo",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JustGanIt | Gan's AI Toolkit & Creative Space",
    description:
      "Building AI-driven tools to enhance productivity and simplify the complex.",
    creator: "@GanBananaReal",
    images: ["/logo-fist.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${inter.className} text-slate-900 antialiased min-h-screen dark:text-slate-100 transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <MouseTracker />
            <ArgonBackground />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
