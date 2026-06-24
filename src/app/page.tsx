"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmailApp } from "@/components/email/EmailApp";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { UseCasesSection } from "@/components/sections/UseCasesSection";
import { BusinessSection } from "@/components/sections/BusinessSection";
import { SecuritySection } from "@/components/sections/SecuritySection";
import { StatsSection } from "@/components/sections/StatsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { APISection } from "@/components/sections/APISection";
import { BlogSection } from "@/components/sections/BlogSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { useEmailStore } from "@/stores/emailStore";

export default function Home() {
  const showEmailApp = useEmailStore((s) => s.showEmailApp);
  const restoreSession = useEmailStore((s) => s.restoreSession);
  const email = useEmailStore((s) => s.session?.address);

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {showEmailApp && email ? (
            <motion.div
              key="email-app"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="pt-20"
            >
              <EmailApp />
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Email App (creation form) always visible below hero */}
              <div className="pt-16">
                <HeroSection />
              </div>
              <EmailApp />
              <StatsSection />
              <FeaturesSection />
              <BenefitsSection />
              <HowItWorksSection />
              <UseCasesSection />
              <BusinessSection />
              <SecuritySection />
              <PricingSection />
              <APISection />
              <BlogSection />
              <FAQSection />

              {/* CTA Section */}
              <section className="py-20 md:py-28 hero-gradient">
                <div className="max-w-4xl mx-auto px-4 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                      Ready to Protect Your{" "}
                      <span className="gradient-text">Privacy</span>?
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                      Join over 2 million users who trust TampKemail for their
                      online privacy. Create your first temporary email address
                      right now, completely free.
                    </p>
                    <button
                      onClick={() => {
                        useEmailStore.getState().setShowEmailApp(true);
                        setTimeout(() => {
                          document
                            .getElementById("email-app")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }}
                      className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all"
                    >
                      Create Free Temporary Email Now
                    </button>
                  </motion.div>
                </div>
              </section>

              {/* Privacy & Terms */}
              <section id="privacy" className="py-16 bg-white dark:bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    Privacy Policy
                  </h2>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4 leading-relaxed">
                    <p>
                      <strong>Effective Date:</strong> January 1, 2025
                    </p>
                    <p>
                      At TampKemail, your privacy is our top priority. This
                      Privacy Policy explains how we handle information when you
                      use our temporary email service. We believe in
                      transparency and want you to understand exactly what
                      happens with your data.
                    </p>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-6">
                      Information We Collect
                    </h3>
                    <p>
                      TampKemail does not collect, store, or process any
                      personal identifying information. We do not require
                      registration, we do not ask for your name, and we do not
                      track your IP address. The temporary email addresses you
                      create exist only within your browser session and are
                      automatically destroyed when you close the tab or navigate
                      away from the site.
                    </p>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-6">
                      Email Data Handling
                    </h3>
                    <p>
                      Emails received through our service are proxied through
                      our servers to your browser and exist only in your active
                      session memory. We do not store email content, attachments,
                      sender information, or metadata on our servers. All email
                      data is transient and exists solely for the purpose of
                      displaying it to you in real-time.
                    </p>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-6">
                      Cookies and Local Storage
                    </h3>
                    <p>
                      We use minimal browser session storage to maintain your
                      active email session. This data is automatically cleared
                      when your session ends. We do not use tracking cookies,
                      advertising pixels, or any third-party analytics tools
                      that could identify you across different websites.
                    </p>
                  </div>
                </div>
              </section>

              <section id="terms" className="py-16 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    Terms of Service
                  </h2>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4 leading-relaxed">
                    <p>
                      <strong>Effective Date:</strong> January 1, 2025
                    </p>
                    <p>
                      By using TampKemail, you agree to these Terms of
                      Service. Please read them carefully before using our
                      service. These terms govern your access to and use of all
                      features provided by TampKemail.
                    </p>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-6">
                      Acceptable Use
                    </h3>
                    <p>
                      You agree to use TampKemail only for lawful purposes
                      and in accordance with these Terms. You shall not use the
                      service for any illegal or unauthorized purpose including
                      but not limited to: sending spam, harassment, fraud,
                      distributing malware, or any activity that violates
                      applicable law or regulation.
                    </p>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-6">
                      Service Limitations
                    </h3>
                    <p>
                      TampKemail provides a temporary, receive-only email
                      service. We do not guarantee email delivery, and some
                      senders may block or reject emails sent to temporary email
                      domains. The service is provided &quot;as is&quot; without
                      warranties of any kind. We reserve the right to modify,
                      suspend, or discontinue the service at any time without
                      prior notice.
                    </p>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-6">
                      Disclaimer
                    </h3>
                    <p>
                      TampKemail is not designed for receiving sensitive
                      communications. Do not use this service for banking,
                      medical, legal, or other sensitive correspondence. We are
                      not responsible for any loss of data, missed emails, or
                      damages resulting from your use of the service.
                    </p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}