"use client";

import { motion } from "framer-motion";
import {
  Users,
  Globe,
  Mail,
  Shield,
  TrendingUp,
  Award,
} from "lucide-react";

const stats = [
  { icon: Users, value: "2M+", label: "Active Users" },
  { icon: Mail, value: "50M+", label: "Emails Created" },
  { icon: Globe, value: "190+", label: "Countries" },
  { icon: Shield, value: "99.9%", label: "Uptime" },
  { icon: TrendingUp, value: "10M+", label: "Emails Received" },
  { icon: Award, value: "4.8/5", label: "User Rating" },
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-20 bg-emerald-600 dark:bg-emerald-700 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 mb-3">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-emerald-100">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}