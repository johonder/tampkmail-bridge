"use client";

import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const blogPosts = [
  {
    slug: "anonymous-file-transfer",
    title: "Anonymous File Transfer Using Disposable Mail",
    excerpt:
      "Learn how to use temporary email addresses to send and receive files anonymously. This comprehensive guide covers the best methods for secure file sharing without revealing your identity, including encrypted file transfer services and self-destructing links that work seamlessly with disposable email.",
    date: "Jun 15, 2025",
    readTime: "6 min",
    category: "Privacy",
  },
  {
    slug: "protect-privacy-online",
    title: "How to Protect Your Privacy Online with Temp Email",
    excerpt:
      "In an era of rampant data collection, temporary emails are your first line of defense. Discover proven strategies for using disposable email addresses to shield your real identity across social media, e-commerce, and subscription services. Includes real-world case studies and expert privacy tips.",
    date: "Jun 10, 2025",
    readTime: "8 min",
    category: "Guide",
  },
  {
    slug: "ransomware-protection",
    title: "What Is Ransomware and How to Protect Yourself",
    excerpt:
      "Ransomware attacks often begin with a phishing email to your real address. Learn how temporary emails can break the attack chain by eliminating the initial contact point. This article covers the latest ransomware tactics, prevention strategies, and why email isolation is a critical security measure.",
    date: "Jun 5, 2025",
    readTime: "7 min",
    category: "Security",
  },
  {
    slug: "phishing-protection",
    title: "How Anonymous Email Protects You from Phishing",
    excerpt:
      "Phishing attacks are becoming increasingly sophisticated, targeting both individuals and organizations. Explore how disposable email addresses provide an effective shield against phishing campaigns by ensuring that even if a scammer sends you a malicious link, it arrives in a throwaway inbox with zero connection to your real identity.",
    date: "May 28, 2025",
    readTime: "5 min",
    category: "Security",
  },
  {
    slug: "temp-mail-social-media",
    title: "Using Temp Mail for Social Media Sign-Ups Safely",
    excerpt:
      "Social media platforms are notorious for data collection and aggressive email marketing. Learn the best practices for using temporary emails with platforms like Facebook, Instagram, Twitter, and TikTok. Understand which platforms accept disposable emails and how to handle verification challenges effectively.",
    date: "May 20, 2025",
    readTime: "6 min",
    category: "Social Media",
  },
  {
    slug: "ebook-fans-guide",
    title: "Temporary Email: The Ultimate Solution for E-Book Fans",
    excerpt:
      "E-book platforms and digital libraries often require email registration for free downloads. Discover how temporary email addresses let you access thousands of free e-books, academic papers, and digital resources without flooding your real inbox with promotional emails and newsletter subscriptions from publishers.",
    date: "May 15, 2025",
    readTime: "5 min",
    category: "Lifestyle",
  },
];

const categoryColors: Record<string, string> = {
  Privacy: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  Guide: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  Security: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  "Social Media": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  Lifestyle: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
};

export function BlogSection() {
  return (
    <section id="blog" className="py-20 md:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" /> Blog & Resources
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Latest <span className="gradient-text">Tips & Guides</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Stay informed with our latest articles on email privacy, online
            security, and practical tips for getting the most out of temporary
            email services in your daily digital life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-emerald-600/5 transition-all duration-300"
            >
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      categoryColors[post.category] || categoryColors.Guide
                    )}
                  >
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{post.date}</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read more <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}