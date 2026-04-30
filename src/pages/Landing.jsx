import React from 'react';
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StickyFeatures } from "@/components/StickyFeatures";
import { BigType } from "@/components/BigType";
import { Testimonials } from "@/components/Testimonials";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { WordmarkScroller } from "@/components/WordmarkScroller";
import { Unblocks } from "@/components/Unblocks";
import { Clouds } from "@/components/Clouds";
import { Demo } from "@/components/Demo";

function Landing() {
  return (
    <div className="relative min-h-screen selection:bg-sky-500/10 sunset-gradient">
      {/* GLOBAL FIXED CLOUDS */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0 overflow-hidden">
        <Clouds density="high" />
      </div>

      <div className="relative z-10">
        <WordmarkScroller />
        <Header />
        <main>
          <Hero />
          <Demo />
          <StickyFeatures />
          <BigType />
          <Unblocks />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Landing;
