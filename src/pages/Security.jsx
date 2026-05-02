import React from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function Security() {
  return (
    <div className="relative min-h-screen sunset-gradient selection:bg-sky-500/10">
      <Header />
      <main className="relative z-10 pt-32 pb-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto glass-effect rounded-[32px] p-8 md:p-12 text-[var(--text-primary)]"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Security Policy</h1>
          <div className="prose prose-sm md:prose-base text-gray-700 leading-relaxed space-y-6">
            <p className="font-medium text-[var(--text-primary)]">Last Updated: 30 April 2026</p>
            <p>At Operon, security is a top priority. We are committed to protecting our platform, users, and data.</p>
            
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">1. Infrastructure Security</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Secure cloud-based hosting</li>
                <li>Regular system monitoring and updates</li>
                <li>Firewalls and intrusion detection systems</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">2. Data Protection</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Encryption in transit (HTTPS)</li>
                <li>Encryption at rest where applicable</li>
                <li>Access controls and authentication layers</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">3. AI Safety Measures</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Content filtering and moderation</li>
                <li>Abuse detection systems</li>
                <li>Continuous model monitoring</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">4. Access Control</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Restricted internal access to sensitive data</li>
                <li>Role-based permissions</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">5. Incident Response</h2>
              <p>In case of a security breach:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Immediate investigation</li>
                <li>User notification if required</li>
                <li>Steps taken to prevent recurrence</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">6. User Responsibilities</h2>
              <p>Users should:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Keep login credentials secure</li>
                <li>Avoid sharing sensitive information unnecessarily</li>
                <li>Report suspicious activity</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">7. Reporting Vulnerabilities</h2>
              <p>If you discover a security issue, please report it: <strong>cloudzvyom@gmail.com</strong></p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
