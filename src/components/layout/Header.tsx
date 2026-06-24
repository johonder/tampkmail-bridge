"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Menu,
  X,
  Shield,
  Zap,
  Clock,
  BookOpen,
  HelpCircle,
  DollarSign,
  Building2,
  Lock,
  Phone,
  Settings,
} from "lucide-react";
import { useEmailStore } from "@/stores/emailStore";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Features", icon: Zap },
  { href: "#benefits", label: "Benefits", icon: Shield },
  { href: "#how-it-works", label: "How It Works", icon: Clock },
  { href: "#use-cases", label: "Use Cases", icon: Building2 },
  { href: "#pricing", label: "Pricing", icon: DollarSign },
  { href: "#blog", label: "Blog", icon: BookOpen },
  { href: "#faq", label: "FAQ", icon: HelpCircle },
  { href: "#api", label: "API", icon: Lock },
  { href: "#contact", label: "Contact", icon: Phone },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const email = useEmailStore((s) => s.session?.address);
  const setShowEmailApp = useEmailStore((s) => s.setShowEmailApp);
  const showEmailApp = useEmailStore((s) => s.showEmailApp);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/")) {
      window.location.href = href;
      return;
    }
    if (showEmailApp) {
      setShowEmailApp(false);
      setTimeout(() => {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg shadow-sm border-b border-slate-200/50 dark:border-slate-800/50"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => {
              setShowEmailApp(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/25 group-hover:shadow-emerald-600/40 transition-shadow">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Tamp<span className="text-emerald-600">K</span>email
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {email ? (
              <button
                onClick={() => setShowEmailApp(!showEmailApp)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-xl transition-all",
                  showEmailApp
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25"
                )}
              >
                {showEmailApp ? "Back to Home" : "Open Inbox"}
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowEmailApp(true);
                  setTimeout(() => {
                    document.getElementById("email-app")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all hover:shadow-emerald-600/40"
              >
                Get Free Email
              </button>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all text-left"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}