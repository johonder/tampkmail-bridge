"use client";

import { motion } from "framer-motion";
import { Lock, Server, Eye, Trash2, ShieldCheck, FileWarning } from "lucide-react";

const securityItems = [
  {
    icon: Lock,
    title: "SSL/TLS Encryption",
    description:
      "All data transmitted between your browser and our servers is encrypted using industry-standard SSL/TLS protocols. This means that even if someone intercepts your network traffic, they cannot read your emails or any other information exchanged with our service. We use the latest TLS 1.3 for maximum security.",
  },
  {
    icon: Server,
    title: "No Server-Side Storage",
    description:
      "Unlike traditional email services, TampKemail does not permanently store your emails on our servers. Email data flows through our proxy to your browser session and exists only in your active browser memory. When you close the tab, all data is immediately and permanently deleted with no recovery possible.",
  },
  {
    icon: Eye,
    title: "Zero Tracking",
    description:
      "We do not use analytics trackers, advertising pixels, or any form of user tracking. Your browsing behavior on TampKemail is completely private. We do not build user profiles, track which websites you sign up for, or monitor the content of emails you receive. Your privacy is absolute.",
  },
  {
    icon: Trash2,
    title: "Instant Data Deletion",
    description:
      "When you delete a temporary email or close your browser session, all associated data is immediately purged. There is no grace period, no backup, and no recovery mechanism. This ensures that once you decide to dispose of an email, it is gone forever from our systems.",
  },
  {
    icon: ShieldCheck,
    title: "Secure API Proxy",
    description:
      "Our server-side API proxy adds an additional security layer between your browser and the email service provider. This means your browser never directly communicates with external email servers, reducing your exposure to potential security vulnerabilities and ensuring consistent behavior across all platforms.",
  },
  {
    icon: FileWarning,
    title: "Important Limitations",
    description:
      "While TampKemail provides strong privacy protections, temporary emails should not be used for sensitive communications such as banking, medical records, or legal documents. Temporary emails are designed for convenience and spam prevention, not as a replacement for properly secured, permanent email accounts with end-to-end encryption.",
  },
];

export function SecuritySection() {
  return (
    <section
      id="security"
      className="py-20 md:py-28 bg-white dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
            <Lock className="w-4 h-4" /> Security & Privacy
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Your Privacy Is{" "}
            <span className="gradient-text">Non-Negotiable</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            We built TampKemail with a privacy-first architecture. Every
            technical decision is guided by the principle of minimizing data
            collection and maximizing user protection at every level of the
            stack.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {securityItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}