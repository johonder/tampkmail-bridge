"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Plus,
  ChevronDown,
  AlertCircle,
  Inbox,
  X,
  Search,
  Clock,
  Key,
  Globe,
  GraduationCap,
  Settings,
  Upload,
  FileUp,
} from "lucide-react";
import { useEmailStore, type MailMessage, type MailDomain } from "@/stores/emailStore";
import { formatTimeAgo, truncate } from "@/lib/email-utils";
import { cn } from "@/lib/utils";
import { EmailViewer } from "./EmailViewer";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_ICONS: Record<string, typeof Globe> = {
  google: Mail,
  microsoft: Mail,
  edu: GraduationCap,
  other: Globe,
};

const TYPE_LABELS: Record<string, string> = {
  google: "Gmail",
  microsoft: "Outlook",
  edu: "Edu",
  other: "Other",
};

const TYPE_COLORS: Record<string, string> = {
  google: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  microsoft: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  edu: "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
  other: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
};

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-1.5 rounded-lg transition-all",
        copied
          ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
        className
      )}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", TYPE_COLORS[type] || TYPE_COLORS.other)}>
      {TYPE_LABELS[type] || type}
    </span>
  );
}

function ApiKeyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setKey(localStorage.getItem("reseller_api_key") || "");
      setSaved(false);
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem("reseller_api_key", key);
    setSaved(true);
    setTimeout(() => onClose(), 1000);
  };

  const handleClear = () => {
    localStorage.removeItem("reseller_api_key");
    setKey("");
    setSaved(true);
    setTimeout(() => onClose(), 1000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Reseller API Key</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          For Gmail/Outlook/reseller access. Get your key from the API dashboard or contact support.
        </p>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter your API key..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className={cn(
              "flex-1 py-2.5 rounded-xl font-medium text-sm transition-all",
              key.trim()
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
            )}
          >
            {saved ? "Saved!" : "Save Key"}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2.5 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all"
          >
            Clear
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MessageItem({
  message,
  emailType,
  isSelected,
  onClick,
}: {
  message: MailMessage;
  emailType: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 transition-all group",
        isSelected
          ? "bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-l-emerald-500"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-2 border-l-transparent",
        !message.seen && "bg-amber-50/50 dark:bg-amber-950/10"
      )}
      layout
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-sm truncate",
              !message.seen
                ? "font-semibold text-slate-900 dark:text-white"
                : "font-medium text-slate-700 dark:text-slate-200"
            )}
          >
            {message.from?.name || message.from?.address || "Unknown"}
          </span>
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
          {formatTimeAgo(message.createdAt)}
        </span>
      </div>
      <p
        className={cn(
          "text-sm truncate mb-0.5",
          !message.seen
            ? "font-medium text-slate-800 dark:text-slate-100"
            : "text-slate-600 dark:text-slate-300"
        )}
      >
        {message.subject || "(No Subject)"}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
        {truncate(message.intro || message.text || "", 80)}
      </p>
    </motion.button>
  );
}

export function EmailApp() {
  const {
    session,
    domains,
    messages,
    selectedMessage,
    selectedMessageFull,
    unreadCount,
    totalMessages,
    isCreating,
    isFetchingMessages,
    isFetchingMessage,
    error,
    fetchDomains,
    createEmail,
    fetchMessages,
    selectMessage,
    deleteMessage,
    changeEmail,
    copyEmail,
  } = useEmailStore();

  const [customName, setCustomName] = useState("");
  const [selectedType, setSelectedType] = useState("other");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const filteredDomains = domains.filter((d) => d.type === selectedType);

  useEffect(() => {
    if (!domains.length) fetchDomains();
  }, [domains.length, fetchDomains]);

  useEffect(() => {
    if (filteredDomains.length > 0) {
      setSelectedDomain(filteredDomains[0].domain);
    }
  }, [selectedType, filteredDomains.length]);

  const filteredMessages = messages.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.subject?.toLowerCase().includes(q) ||
      m.from?.address?.toLowerCase().includes(q) ||
      m.from?.name?.toLowerCase().includes(q) ||
      m.intro?.toLowerCase().includes(q)
    );
  });

  const handleCreate = () => {
    createEmail(selectedDomain);
  };

  const hasSession = !!session?.address;

  if (isCreating) {
    return (
      <section id="email-app" className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="glass-card rounded-2xl p-8 md:p-12 shadow-xl text-center">
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-emerald-500 pulse-dot" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 pulse-dot" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 pulse-dot" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Creating Your Temporary Email...
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Setting up your inbox, this only takes a moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!hasSession) {
    return (
      <section id="email-app" className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="glass-card rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                  <Mail className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  Get Your Free Temporary Email
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Choose email type and generate instantly. No registration required.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="max-w-lg mx-auto">
                <div className="flex gap-2 mb-4">
                  {["other", "edu", "google", "microsoft"].map((type) => {
                    const Icon = TYPE_ICONS[type] || Globe;
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all text-xs font-medium",
                          selectedType === type
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                            : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{TYPE_LABELS[type] || type}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Custom name (optional)"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      optional
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowDomainPicker(!showDomainPicker)}
                      className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all min-w-[180px]"
                    >
                      <span className="truncate">@{selectedDomain || "Select..."}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </button>
                    <AnimatePresence>
                      {showDomainPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute top-full mt-2 left-0 right-0 sm:right-auto sm:w-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden"
                        >
                          {filteredDomains.map((d: MailDomain) => (
                            <button
                              key={d.domain}
                              onClick={() => {
                                setSelectedDomain(d.domain);
                                setShowDomainPicker(false);
                              }}
                              className={cn(
                                "w-full px-4 py-2.5 text-left text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors",
                                selectedDomain === d.domain
                                  ? "text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50/50 dark:bg-emerald-950/20"
                                  : "text-slate-700 dark:text-slate-300"
                              )}
                            >
                              @{d.domain}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!selectedDomain}
                  className={cn(
                    "w-full py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2",
                    selectedDomain
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40"
                      : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                  )}
                >
                  <Plus className="w-5 h-5" />
                  Generate {TYPE_LABELS[selectedType]} Email
                </button>

                <button
                  onClick={() => setShowApiKeyDialog(true)}
                  className="w-full mt-3 py-2.5 rounded-xl font-medium text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Configure API Key (for reseller/Gmail/Outlook)
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  No Registration
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Instant Setup
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  100% Secure
                </span>
              </div>
            </div>
          </div>
        </div>

        <ApiKeyDialog open={showApiKeyDialog} onClose={() => setShowApiKeyDialog(false)} />
      </section>
    );
  }

  const emailType = session?.domainType || "other";

  return (
    <section id="email-app" className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="glass-card rounded-2xl p-4 shadow-lg mb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-2.5">
              <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-mono text-slate-900 dark:text-white truncate">
                {session?.address}
              </span>
              <CopyButton text={session?.address || ""} />
              <TypeBadge type={emailType} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowApiKeyDialog(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="API Key Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchMessages()}
                disabled={isFetchingMessages}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4", isFetchingMessages && "animate-spin")} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={changeEmail}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row" style={{ minHeight: "500px" }}>
          <div className={cn("w-full md:w-96 lg:w-[420px] border-r border-slate-200 dark:border-slate-800 flex flex-col", selectedMessage && "hidden md:flex")}>
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Inbox</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-600 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
                <span className="text-xs text-slate-400">({totalMessages})</span>
              </div>
              <button
                onClick={() => selectMessage(null)}
                className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border-0 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isFetchingMessages && messages.length === 0 ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2 p-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  {searchQuery ? (
                    <>
                      <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No emails match &quot;{searchQuery}&quot;</p>
                    </>
                  ) : (
                    <>
                      <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Inbox is Empty</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px]">
                        Waiting for incoming emails. Messages will appear here automatically.
                      </p>
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        Auto-refreshes every 10 seconds
                      </div>
                    </>
                  )}
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    emailType={emailType}
                    isSelected={selectedMessage?.id === msg.id}
                    onClick={() => selectMessage(msg)}
                  />
                ))
              )}
            </div>
          </div>

          <div className={cn("flex-1 flex flex-col", !selectedMessage && "hidden md:flex")}>
            {selectedMessage ? (
              <EmailViewer
                message={selectedMessage}
                fullMessage={selectedMessageFull}
                isLoading={isFetchingMessage}
                onBack={() => selectMessage(null)}
                onDelete={(id) => deleteMessage(id)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Select an Email</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Choose a message from the inbox to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ApiKeyDialog open={showApiKeyDialog} onClose={() => setShowApiKeyDialog(false)} />
    </section>
  );
}
