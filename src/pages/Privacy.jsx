import React from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function Privacy() {
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Privacy Policy</h1>
          <div className="prose prose-sm md:prose-base text-gray-700 leading-relaxed space-y-6">
            <p className="font-medium text-black">Last Updated: April 30, 2026</p>
            <p>At Cloudz (formerly Clouds), we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered services.</p>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">1. Information We Collect</h2>
              <p>We may collect:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Personal Information:</strong> Name, email address, contact details</li>
                <li><strong>Usage Data:</strong> Interaction logs, device information, IP address</li>
                <li><strong>AI Interaction Data:</strong> Inputs provided to our AI agents and generated outputs</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">2. How We Use Your Information</h2>
              <p>We use your data to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide and improve our AI services</li>
                <li>Personalize user experience</li>
                <li>Ensure system security and prevent misuse</li>
                <li>Communicate updates, support, or offers</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">3. Data Sharing</h2>
              <p>We do not sell your personal data. We may share data with:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Trusted service providers (hosting, analytics)</li>
                <li>Legal authorities if required by law</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">4. Data Security</h2>
              <p>We implement industry-standard measures to protect your data from unauthorized access, alteration, or disclosure.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access your data</li>
                <li>Request correction or deletion</li>
                <li>Opt out of communications</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">6. Data Retention</h2>
              <p>We retain data only as long as necessary to provide services and comply with legal obligations.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-black mb-3">7. Contact Us</h2>
              <p>For any privacy concerns: <strong>cloudsvyom@gmail.com</strong></p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
