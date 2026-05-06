import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/providers/ThemeProvider";
import MouseTracker from "@/components/MouseTracker";

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
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <MouseTracker />
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-200/40 dark:bg-amber-600/20 blur-3xl animate-blob" />
              <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/30 dark:bg-orange-600/10 blur-3xl animate-blob animation-delay-2000" />
              <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-yellow-100/40 dark:bg-yellow-500/10 blur-3xl animate-blob animation-delay-4000" />
            </div>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
