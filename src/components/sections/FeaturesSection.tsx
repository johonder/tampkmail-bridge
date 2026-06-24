"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Shield,
  Zap,
  Globe,
  Eye,
  RefreshCw,
  Smartphone,
  Lock,
  Bell,
  Database,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Email Creation",
    description:
      "Generate a working temporary email address in under 2 seconds. No registration forms, no email verification, no waiting. Just click and start receiving emails immediately with our streamlined process.",
    color: "emerald",
  },
  {
    icon: Shield,
    title: "Complete Privacy Protection",
    description:
      "Your real identity stays completely hidden. Our disposable emails act as a bulletproof shield against spam, data brokers, and unwanted marketing campaigns that follow you across the internet.",
    color: "blue",
  },
  {
    icon: RefreshCw,
    title: "Auto-Refresh Inbox",
    description:
      "Your inbox automatically checks for new messages every 10 seconds. No need to manually refresh or reload the page. Emails appear in real-time as they arrive from any sender worldwide.",
    color: "amber",
  },
  {
    icon: Globe,
    title: "Multiple Domain Options",
    description:
      "Choose from several available domains to create your temporary email. Different domains help bypass domain-specific filters and increase acceptance rates on websites that require email verification.",
    color: "purple",
  },
  {
    icon: Smartphone,
    title: "100% Mobile Responsive",
    description:
      "Fully optimized for every screen size. Whether you are on a smartphone, tablet, or desktop computer, the entire email experience adapts perfectly with touch-friendly controls and intuitive navigation.",
    color: "pink",
  },
  {
    icon: Lock,
    title: "End-to-End Security",
    description:
      "All communications are encrypted with SSL/TLS. Emails are stored temporarily and automatically purged. We never store your personal data, track your browsing, or share information with third parties.",
    color: "teal",
  },
  {
    icon: Eye,
    title: "Read Full HTML Emails",
    description:
      "View complete HTML-formatted emails exactly as intended by the sender. See images, formatting, links, and layouts. Supports all standard email formats including multipart MIME messages with attachments.",
    color: "indigo",
  },
  {
    icon: Bell,
    title: "Unread Message Counter",
    description:
      "A prominent badge shows your unread message count at a glance. Never miss an important verification code, confirmation email, or time-sensitive notification sent to your temporary inbox.",
    color: "orange",
  },
  {
    icon: Database,
    title: "Session Persistence",
    description:
      "Your email session stays active as long as you keep the tab open. Switch between tabs, use other apps, and come back to find your inbox exactly as you left it with all messages preserved.",
    color: "cyan",
  },
  {
    icon: Clock,
    title: "Custom Email Names",
    description:
      "Personalize your temporary email with a custom username before the @ symbol. Choose a name that is memorable and relevant, or use our intelligent random name generator for instant setup.",
    color: "rose",
  },
  {
    icon: RefreshCw,
    title: "One-Click Email Change",
    description:
      "Not happy with your current email? Delete it and generate a brand new one instantly with a single click. Each new email gets its own fresh inbox with no carryover from previous sessions.",
    color: "lime",
  },
  {
    icon: Globe,
    title: "No Geographic Restrictions",
    description:
      "Access your temporary email from anywhere in the world. Our service works globally with no country restrictions, IP blocking, or VPN requirements. Truly borderless privacy protection.",
    color: "violet",
  },
];

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
  pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-600",
  teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  lime: "bg-lime-100 dark:bg-lime-900/30 text-lime-600",
  violet: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" /> Powerful Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need for{" "}
            <span className="gradient-text">Temporary Email</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            TampKemail offers a comprehensive suite of tools designed to
            protect your privacy while providing a seamless email experience.
            Explore all the features that make us the best choice.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-lg hover:shadow-emerald-600/5 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl ${colorMap[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}