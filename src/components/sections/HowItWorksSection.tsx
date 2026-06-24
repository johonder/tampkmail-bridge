"use client";

import { motion } from "framer-motion";
import {
  MousePointerClick,
  UserPlus,
  Copy,
  MailCheck,
  RefreshCw,
  Trash2,
} from "lucide-react";

const steps = [
  {
    step: 1,
    icon: MousePointerClick,
    title: "Click 'Get Free Email'",
    description:
      "Simply click the prominent green button on our homepage. No registration, no forms, and no personal information required. The entire process begins with a single click, making it accessible to everyone regardless of technical skill level.",
  },
  {
    step: 2,
    icon: UserPlus,
    title: "Your Email Is Generated",
    description:
      "Our system instantly creates a fully functional email address for you. You can optionally enter a custom username to personalize it, or let our smart generator create a unique and memorable name. Choose from multiple available domains.",
  },
  {
    step: 3,
    icon: Copy,
    title: "Copy & Use Anywhere",
    description:
      "Copy your new temporary email with one click and use it to sign up for any website, service, or app that requires email verification. The address works exactly like a regular email for receiving messages.",
  },
  {
    step: 4,
    icon: MailCheck,
    title: "Receive Emails Instantly",
    description:
      "Emails arrive in your temporary inbox in real-time. Our system polls for new messages every 10 seconds, ensuring you see verification codes, confirmation links, and other important emails the moment they are sent.",
  },
  {
    step: 5,
    icon: RefreshCw,
    title: "Read & Download Content",
    description:
      "Open any email to view its full HTML content, including images, formatting, and links. Download attachments directly from the email viewer. Everything renders perfectly just like in a traditional email client.",
  },
  {
    step: 6,
    icon: Trash2,
    title: "Delete When Done",
    description:
      "When you no longer need the temporary email, click delete to instantly destroy it and all associated messages. Start fresh with a brand new email address anytime you need one. It is that simple.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
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
            <RefreshCw className="w-4 h-4" /> Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works:{" "}
            <span className="gradient-text">6 Easy Steps</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Getting started with TampKemail takes less than 10 seconds. Follow
            these simple steps to create your first temporary email address and
            start receiving messages immediately.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-lg transition-all group"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-1 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-emerald-600/30">
                {step.step}
              </div>

              <div className="pt-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <step.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector arrow (hidden on last item and on mobile) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 text-emerald-300 dark:text-emerald-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}