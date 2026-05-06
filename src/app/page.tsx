import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ToolGrid from "@/components/ToolGrid";
import BlogSection from "@/components/BlogSection";
import SocialSection from "@/components/SocialSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Header />
      <Hero />
      <div className="w-full relative z-20 bg-white/30 dark:bg-slate-950/50 backdrop-blur-3xl border-t border-white/40 dark:border-slate-800/50 shadow-2xl">
        <ToolGrid />
        <BlogSection />
        <SocialSection />
        <Footer />
      </div>
    </main>
  );
}
