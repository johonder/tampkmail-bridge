"use client";

import { motion } from "framer-motion";
import { Code2, CheckCircle2, Terminal, ArrowRight } from "lucide-react";

const codeExample = `# 1. Get available domains
curl https://api.mail.tm/domains

# 2. Create a temporary account
curl -X POST https://api.mail.tm/accounts \\
  -H "Content-Type: application/json" \\
  -d '{"address":"test@domain.com","password":"pass123"}'

# 3. Get authentication token
curl -X POST https://api.mail.tm/token \\
  -H "Content-Type: application/json" \\
  -d '{"address":"test@domain.com","password":"pass123"}'

# 4. Fetch inbox messages
curl https://api.mail.tm/messages \\
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Read a specific message
curl https://api.mail.tm/messages/MSG_ID \\
  -H "Authorization: Bearer YOUR_TOKEN"`;

const apiFeatures = [
  "RESTful API with JSON responses",
  "No API key required for basic usage",
  "Automatic email polling support",
  "Full message content retrieval",
  "Attachment download endpoints",
  "Multi-domain support",
  "CORS enabled for browser requests",
  "Reliable uptime and fast responses",
];

export function APISection() {
  return (
    <section id="api" className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
            <Code2 className="w-4 h-4" /> Developer API
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Temporary Email{" "}
            <span className="gradient-text">API</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Integrate temporary email functionality directly into your
            applications, testing pipelines, and automation workflows. Our API is
            simple, reliable, and requires no complex setup or API keys for
            basic usage.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Code Example */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-700"
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-slate-400 ml-2 flex items-center gap-1">
                <Terminal className="w-3 h-3" /> API Examples
              </span>
            </div>
            <pre className="p-4 md:p-6 text-sm text-green-400 overflow-x-auto leading-relaxed font-mono">
              <code>{codeExample}</code>
            </pre>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-600" /> API Capabilities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {apiFeatures.map((f) => (
                  <div
                    key={f}
                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-6 md:p-8 border border-emerald-200 dark:border-emerald-800/50">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-3">
                Common Use Cases
              </h3>
              <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-400">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Automated testing of email verification flows
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  CI/CD pipeline integration for email-dependent tests
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  OTP and verification code capture automation
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Bulk account creation for testing environments
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}