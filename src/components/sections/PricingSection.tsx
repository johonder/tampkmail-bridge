"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for personal use and quick verifications.",
    highlighted: false,
    features: [
      { text: "Unlimited temporary emails", included: true },
      { text: "Real-time inbox refresh (10s)", included: true },
      { text: "Full HTML email rendering", included: true },
      { text: "Attachment downloads", included: true },
      { text: "Custom email usernames", included: true },
      { text: "Multiple domain options", included: true },
      { text: "Mobile responsive design", included: true },
      { text: "No registration required", included: true },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
      { text: "Custom domains", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For professionals and businesses who need more.",
    highlighted: true,
    features: [
      { text: "Everything in Free", included: true },
      { text: "Full REST API access", included: true },
      { text: "Priority email delivery", included: true },
      { text: "Extended session duration", included: true },
      { text: "Email forwarding", included: true },
      { text: "Webhook notifications", included: true },
      { text: "Priority support", included: true },
      { text: "Usage analytics dashboard", included: true },
      { text: "Custom domains (up to 3)", included: true },
      { text: "Bulk email creation", included: true },
      { text: "Team collaboration", included: true },
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored solutions for large organizations and teams.",
    highlighted: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited custom domains", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA guarantee (99.9%)", included: true },
      { text: "SSO / SAML integration", included: true },
      { text: "On-premise deployment option", included: true },
      { text: "Advanced analytics & reporting", included: true },
      { text: "Custom API rate limits", included: true },
      { text: "Audit logging", included: true },
      { text: "Compliance certification", included: true },
      { text: "24/7 phone support", included: true },
    ],
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
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
            <Star className="w-4 h-4" /> Pricing Plans
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, Transparent{" "}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Start for free with no limits on temporary emails. Upgrade to Pro or
            Enterprise when you need API access, custom domains, or dedicated
            support for your team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15 }}
              className={cn(
                "relative rounded-2xl p-6 md:p-8 flex flex-col",
                plan.highlighted
                  ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-600/30 scale-105 z-10 border-0"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={cn(
                    "text-lg font-semibold mb-1",
                    plan.highlighted ? "text-white" : "text-slate-900 dark:text-white"
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "text-sm",
                    plan.highlighted
                      ? "text-emerald-100"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span
                  className={cn(
                    "text-4xl font-bold",
                    plan.highlighted ? "text-white" : "text-slate-900 dark:text-white"
                  )}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={cn(
                      "text-sm",
                      plan.highlighted
                        ? "text-emerald-100"
                        : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {" "}
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f.text}
                    className="flex items-start gap-2 text-sm"
                  >
                    {f.included ? (
                      <Check
                        className={cn(
                          "w-4 h-4 flex-shrink-0 mt-0.5",
                          plan.highlighted ? "text-emerald-200" : "text-emerald-600"
                        )}
                      />
                    ) : (
                      <X
                        className={cn(
                          "w-4 h-4 flex-shrink-0 mt-0.5",
                          plan.highlighted
                            ? "text-emerald-300/50"
                            : "text-slate-300 dark:text-slate-600"
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        !f.included && "opacity-50",
                        plan.highlighted
                          ? "text-emerald-50"
                          : "text-slate-600 dark:text-slate-300"
                      )}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-sm transition-all",
                  plan.highlighted
                    ? "bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25"
                )}
              >
                {plan.name === "Enterprise" ? "Contact Sales" : plan.name === "Free" ? "Get Started Free" : "Start Free Trial"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}