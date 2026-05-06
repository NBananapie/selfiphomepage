import Hero from "@/components/Hero";
import ToolGrid from "@/components/ToolGrid";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Hero />
      <div className="w-full relative z-20 bg-white/30 backdrop-blur-3xl border-t border-white/40 shadow-2xl">
        <ToolGrid />
        <BlogSection />
        <Footer />
      </div>
    </main>
  );
}
