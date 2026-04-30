import React from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="relative min-h-screen sunset-gradient selection:bg-sky-500/10">
      <Header />
      <main className="relative z-10 pt-32 pb-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto glass-effect rounded-[32px] p-8 md:p-12 text-black"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Terms & Conditions</h1>
          <div className="prose prose-sm md:prose-base text-gray-700 leading-relaxed space-y-6">
            <p className="font-medium text-black">Last Updated: 30 April 2026</p>
            <p>Welcome to Operon (formerly Clouds). By using our AI agent services, you agree to the following terms.</p>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">1. Use of Services</h2>
              <p>You agree to use our platform:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Lawfully and ethically</li>
                <li>Without attempting to exploit, harm, or reverse-engineer our AI</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">2. AI Limitations</h2>
              <p>Our AI agents:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>May generate inaccurate or incomplete information</li>
                <li>Should not be solely relied upon for critical decisions</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">3. User Responsibilities</h2>
              <p>You are responsible for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The content you input into our system</li>
                <li>Ensuring compliance with applicable laws</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">4. Intellectual Property</h2>
              <p>All platform content, including AI models, design, and branding, belongs to Operon AI Inc.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">5. Prohibited Activities</h2>
              <p>You may not:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the service for illegal activities</li>
                <li>Attempt to hack, disrupt, or misuse the system</li>
                <li>Generate harmful, abusive, or misleading content</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">6. Termination</h2>
              <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">7. Limitation of Liability</h2>
              <p>We are not liable for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Losses caused by reliance on AI outputs</li>
                <li>Service interruptions or errors</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">8. Changes to Terms</h2>
              <p>We may update these terms at any time. Continued use means acceptance.</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
