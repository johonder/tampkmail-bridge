"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is a temporary email address?",
    a: "A temporary email address (also known as disposable email, temp mail, or burner email) is a short-lived email account that you can use to receive emails without revealing your real email address. These addresses are perfect for signing up for websites, receiving verification codes, downloading files, or any situation where you need an email but do not want to use your personal one. The email and all its messages are automatically deleted when you close the session or delete the account.",
  },
  {
    q: "Is TampKemail really free?",
    a: "Yes, TampKemail is completely free to use with no hidden charges, no premium plans required for basic functionality, and no credit card needed. You can create unlimited temporary email addresses, receive unlimited emails, view full HTML content, and download attachments all at zero cost. Our service is supported by non-intrusive advertising and we will never charge you for core features.",
  },
  {
    q: "How long does a temporary email last?",
    a: "Your temporary email remains active as long as you keep the browser tab open and the session is running. Since emails are stored in your browser session, closing the tab or navigating away will end the session. However, you can keep the tab open for as long as you need. For most use cases like receiving a verification code, this is more than sufficient as codes typically arrive within seconds.",
  },
  {
    q: "Can I send emails from my temporary address?",
    a: "Currently, TampKemail is designed as a receive-only service. You can receive emails, view their full content including HTML formatting and images, and download attachments, but sending outgoing emails is not supported. This is by design because the primary use case for temporary emails is receiving verification codes, confirmation links, and notifications where sending is not required.",
  },
  {
    q: "Is my temporary email private and secure?",
    a: "Yes. All communications are encrypted with SSL/TLS encryption. We do not log your IP address, track your browsing activity, or store any personal information. Your emails are stored only in your active browser session and are automatically purged when the session ends. We never share data with third parties, and our service operates with a strict privacy-first approach to protect your digital identity.",
  },
  {
    q: "Can I choose a custom email name?",
    a: "Yes! TampKemail allows you to enter a custom username before the @ symbol. You can choose any name you like, making the email address more memorable and relevant to your needs. If you do not want to customize it, our intelligent generator will create a unique and catchy name for you automatically using a combination of adjectives, nouns, and numbers.",
  },
  {
    q: "What if my verification email does not arrive?",
    a: "If a verification email does not appear within 30 seconds, first check that you copied the email address correctly. Then try clicking the refresh button to manually check for new messages. Our system automatically polls for new emails every 10 seconds. Some senders may take a few minutes to deliver emails. If the email still does not arrive, try generating a new temporary email address as some services may reject certain domains.",
  },
  {
    q: "Can I use a temporary email for important accounts?",
    a: "We do not recommend using temporary emails for important accounts such as banking, government services, or primary social media profiles. Temporary emails are best suited for one-time verifications, free trials, downloading content, and testing services. For important long-term accounts, always use your real email address with a strong, unique password and enable two-factor authentication for maximum security.",
  },
  {
    q: "How is TampKemail different from other temp mail services?",
    a: "TampKemail stands out with its modern, responsive design that works perfectly on all devices. We offer real-time inbox updates every 10 seconds, full HTML email rendering, attachment downloads, custom usernames, multiple domain choices, and a clean ad-free user experience. Our service is built with the latest web technologies ensuring fast performance, secure connections, and a professional-grade interface that competitors simply cannot match.",
  },
  {
    q: "Does TampKemail work on mobile devices?",
    a: "Absolutely! TampKemail is built with a mobile-first approach and is 100% responsive. The entire interface adapts perfectly to smartphones, tablets, and desktop computers. The email viewer, inbox list, and all interactive elements are designed with touch-friendly targets and optimized layouts for small screens. You can create, use, and manage temporary emails just as easily on your phone as on a desktop computer.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" /> FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Everything you need to know about TampKemail. Can&apos;t find the
            answer you&apos;re looking for? Feel free to contact our support team.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-900 dark:text-white pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}