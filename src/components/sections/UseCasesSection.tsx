"use client";

import { motion } from "framer-motion";
import {
  ShoppingCart,
  TestTube2,
  FileDown,
  Users,
  Gamepad2,
  Wifi,
} from "lucide-react";

const useCases = [
  {
    icon: ShoppingCart,
    title: "Online Shopping Sign-Ups",
    description:
      "Create accounts on e-commerce platforms like Amazon, Shein, AliExpress, or any online store without exposing your real email. Receive order confirmations, shipping notifications, and discount codes safely. When the promotional emails start flooding in after your purchase, simply delete the temporary address and they all disappear forever.",
  },
  {
    icon: TestTube2,
    title: "Software Testing & QA",
    description:
      "QA engineers and developers need unique email addresses for every test scenario. TampKemail provides unlimited email addresses on demand, making it perfect for testing registration flows, password reset functionality, email notifications, and multi-user scenarios without maintaining a complex email testing infrastructure.",
  },
  {
    icon: FileDown,
    title: "Download Gated Content",
    description:
      "Many whitepapers, ebooks, reports, and resources require email registration before download. Use a temporary email to access valuable content without subscribing to marketing lists. Get the resource you need instantly while keeping your inbox completely free from follow-up campaigns and lead nurturing sequences.",
  },
  {
    icon: Users,
    title: "Social Media & Forum Accounts",
    description:
      "Sign up for Reddit, Quora, Discord, specialized forums, or social media platforms without linking your real identity. Participate in discussions, join communities, and explore platforms freely. This is especially useful when you want to test a platform before committing your real email to a long-term account.",
  },
  {
    icon: Gamepad2,
    title: "Gaming & Entertainment",
    description:
      "Register for game accounts, streaming trials, and entertainment platforms quickly. Many gaming services and streaming providers require email verification for free trials of premium features. Use a temporary email to maximize your trial experience across multiple services without any risk of unwanted subscription charges.",
  },
  {
    icon: Wifi,
    title: "Public WiFi & Network Access",
    description:
      "Many airports, hotels, cafes, and public networks require email registration for WiFi access. Using your real email on public networks is a security risk. A temporary email gives you internet access without exposing your personal information to potentially insecure networks or third-party tracking systems.",
  },
];

export function UseCasesSection() {
  return (
    <section
      id="use-cases"
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
            <Users className="w-4 h-4" /> Real-World Applications
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Practical <span className="gradient-text">Use Cases</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Temporary emails are incredibly versatile tools used by millions of
            people every day. Here are the most common and effective ways to put
            TampKemail to work in your daily life and professional workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-emerald-600/5 transition-all duration-300"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-950/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <uc.icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {uc.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {uc.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}