import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/providers/ThemeProvider";
import MouseTracker from "@/components/MouseTracker";
import ArgonBackground from "@/components/ArgonBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JustGanIt | Personal Homepage",
  description: "Building AI-driven tools to enhance productivity and simplify the complex.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} text-slate-900 antialiased min-h-screen dark:text-slate-100 transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
