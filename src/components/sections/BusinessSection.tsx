"use client";

import { motion } from "framer-motion";
import {
  Building2,
  TestTube2,
  MailCheck,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";

const solutions = [
  {
    icon: TestTube2,
    title: "QA & Testing Automation",
    description:
      "Streamline your QA process with unlimited temporary email addresses for automated testing. Integrate with CI/CD pipelines to test email verification flows, password resets, notification systems, and transactional email templates. Generate unique addresses for every test run without complex email server setup or maintenance overhead.",
  },
  {
    icon: MailCheck,
    title: "Marketing Campaign Validation",
    description:
      "Verify that your marketing emails render correctly across different email clients and providers before sending to real subscribers. Use temporary addresses to test signup flows, welcome sequences, and automated campaigns from the recipient perspective without polluting your team's real inboxes with test messages.",
  },
  {
    icon: Building2,
    title: "Employee Onboarding",
    description:
      "During employee onboarding, new hires often need to access numerous internal and external tools that require email verification. Temporary emails provide a clean, isolated way to set up and test these accounts during the onboarding period without mixing test accounts with the employee's permanent corporate email address.",
  },
  {
    icon: BarChart3,
    title: "Data Quality Assurance",
    description:
      "Test your data collection pipelines, form submissions, and lead generation systems with temporary email addresses. Verify that your systems correctly handle various email formats, validate email inputs, process attachments, and trigger appropriate automated workflows when new sign-ups occur through your web forms and APIs.",
  },
  {
    icon: Users,
    title: "Customer Support Training",
    description:
      "Train support agents using simulated customer scenarios with temporary emails. Create realistic test cases including account issues, order problems, and inquiries. This allows new agents to practice responding to real email formats and attachment types without accessing actual customer data or violating privacy regulations.",
  },
  {
    icon: Settings,
    title: "System Integration Testing",
    description:
      "When building or upgrading systems that send email notifications, temporary emails provide an instant, zero-configuration testing endpoint. Test webhook integrations, event-driven notifications, scheduled reports, and alert systems without maintaining dedicated test email servers or dealing with complex SMTP configuration.",
  },
];

export function BusinessSection() {
  return (
    <section
      id="business"
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
            <Building2 className="w-4 h-4" /> Business Solutions
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Built for <span className="gradient-text">Teams & Businesses</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            TampKemail offers powerful solutions for businesses of all sizes.
            From QA automation to marketing validation, our temporary email
            service integrates seamlessly into your existing workflows and
            development pipelines.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((sol, i) => (
            <motion.div
              key={sol.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-emerald-600/5 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <sol.icon className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                {sol.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {sol.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}