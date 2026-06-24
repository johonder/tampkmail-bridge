"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import { useEmailStore } from "@/stores/emailStore";

const trustedBy = [
  "Developers",
  "QA Engineers",
  "Privacy Advocates",
  "Digital Marketers",
  "Freelancers",
  "Security Researchers",
];

export function HeroSection() {
  const setShowEmailApp = useEmailStore((s) => s.setShowEmailApp);

  const handleGetStarted = () => {
    setShowEmailApp(true);
    setTimeout(() => {
      document.getElementById("email-app")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Hero Background */}
      <div className="hero-gradient min-h-[600px] md:min-h-[700px] flex items-center relative">
        {/* Floating decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800/50 shadow-sm mb-8"
            >
              <span className="flex items-center gap-1 text-xs text-amber-600">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 fill-amber-500"
                  />
                ))}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Trusted by 2M+ users worldwide
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight"
            >
              Free Temporary Email{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text">Instant & Private</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Create disposable email addresses in seconds. No registration, no
              limits, no spam. Protect your privacy with the most advanced
              temporary email service available online.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all flex items-center justify-center gap-2 group"
              >
                Get Free Temporary Email
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 font-semibold text-lg rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                See How It Works
              </a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400"
            >
              {[
                { icon: CheckCircle2, text: "No Registration" },
                { icon: Zap, text: "Instant Setup" },
                { icon: Shield, text: "100% Private" },
                { icon: Globe, text: "Multiple Domains" },
                { icon: Mail, text: "Free Forever" },
              ].map((item) => (
                <span
                  key={item.text}
                  className="flex items-center gap-1.5"
                >
                  <item.icon className="w-4 h-4 text-emerald-600" />
                  {item.text}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trusted by strip */}
      <div className="bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Trusted by:
            </span>
            {trustedBy.map((name) => (
              <span
                key={name}
                className="text-sm text-slate-500 dark:text-slate-400 font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}