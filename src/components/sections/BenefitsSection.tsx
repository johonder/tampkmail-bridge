"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Ban,
  Sparkles,
  TrendingUp,
  Globe,
  CheckCircle2,
} from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Stop Spam Before It Starts",
    description:
      "Every time you sign up for a new service, newsletter, or online account using your real email, you risk opening the floodgates to spam. Temporary emails act as a protective barrier, ensuring that unwanted marketing emails, phishing attempts, and promotional clutter never reach your primary inbox. By using a disposable address, you maintain complete control over what enters your personal email ecosystem.",
  },
  {
    icon: Ban,
    title: "Prevent Data Breaches & Identity Theft",
    description:
      "Data breaches expose millions of email addresses every year. When your real email is compromised, attackers can attempt credential stuffing, social engineering, and targeted phishing campaigns against you. A temporary email eliminates this risk entirely because even if the service you signed up for gets hacked, the exposed email address is disposable and has no connection to your real identity or other accounts.",
  },
  {
    icon: Sparkles,
    title: "Bypass Mandatory Registrations Instantly",
    description:
      "Many websites, apps, and services require email registration just to view content, download a file, or access a free trial. With a temporary email, you can bypass these mandatory sign-up walls in seconds. No more creating throwaway accounts with your real email and then having to manage yet another subscription or unsubscribe from marketing emails you never wanted in the first place.",
  },
  {
    icon: TrendingUp,
    title: "Test Services Risk-Free",
    description:
      "Before committing to a paid subscription, test the service thoroughly with a temporary email. Sign up for free trials, explore all features, and evaluate whether the service meets your needs without exposing your real email to potential data collection. This is especially valuable for testing SaaS products, online tools, and e-commerce platforms that aggressively follow up with marketing emails.",
  },
  {
    icon: Globe,
    title: "Access Region-Restricted Content",
    description:
      "Some websites and services restrict access based on email domain or require verification from specific regions. Temporary email services with multiple domain options can help you bypass these restrictions and access content that would otherwise be unavailable, giving you the freedom to explore the internet without artificial barriers.",
  },
  {
    icon: CheckCircle2,
    title: "Maintain Digital Hygiene",
    description:
      "Over time, your real email accumulates hundreds of unwanted subscriptions, notification emails, and marketing lists that are nearly impossible to fully unsubscribe from. Temporary emails help you maintain a clean, organized primary inbox dedicated to important communications from real people and essential services you actually use every day.",
  },
];

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
            <Shield className="w-4 h-4" /> Key Benefits
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose <span className="gradient-text">TampKemail</span>?
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Discover the compelling reasons why millions of users trust
            TampKemail for their online privacy and temporary communication
            needs. Each benefit is designed to make your digital life safer and
            simpler.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-emerald-600/5 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <benefit.icon className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}