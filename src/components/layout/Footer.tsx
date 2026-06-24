import {
  Mail,
  Shield,
  Zap,
  Globe,
  Heart,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = {
  Product: [
    { label: "Temporary Email", href: "#email-app" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "API", href: "#api" },
  ],
  Resources: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Benefits", href: "#benefits" },
    { label: "Use Cases", href: "#use-cases" },
    { label: "Blog", href: "#blog" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#contact" },
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
  ],
  Support: [
    { label: "FAQ", href: "#faq" },
    { label: "Security", href: "#security" },
    { label: "Status", href: "#" },
    { label: "Report Bug", href: "#contact" },
  ],
};

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-slate-300" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Tamp<span className="text-emerald-400">K</span>email
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Create free temporary email addresses instantly. Protect your
              privacy from spam, phishing, and data breaches with our secure
              disposable email service.
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Shield className="w-3.5 h-3.5" /> SSL Secured
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Zap className="w-3.5 h-3.5" /> Instant
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Globe className="w-3.5 h-3.5" /> Multi-domain
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact / Newsletter */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Need Help or Have Feedback?
              </h3>
              <p className="text-sm text-slate-400">
                We&apos;d love to hear from you. Contact us anytime.
              </p>
            </div>
            <a
              href="mailto:support@tampkemail.pages.dev"
              className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            &copy; {new Date().getFullYear()} TampKemail. Made with
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for your
            privacy.
          </p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Privacy
            </a>
            <a href="#terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Terms
            </a>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}