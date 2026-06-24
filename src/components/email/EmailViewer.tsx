"use client";

import {
  ArrowLeft,
  Trash2,
  Download,
  Paperclip,
  ExternalLink,
  Clock,
  User,
} from "lucide-react";
import { type MailMessage } from "@/stores/emailStore";
import { formatMessageDate, formatFileSize } from "@/lib/email-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface EmailViewerProps {
  message: MailMessage;
  fullMessage: MailMessage | null;
  isLoading: boolean;
  onBack: () => void;
  onDelete: (id: string) => void;
}

export function EmailViewer({
  message,
  fullMessage,
  isLoading,
  onBack,
  onDelete,
}: EmailViewerProps) {
  const displayMessage = fullMessage || message;
  const htmlContent = fullMessage?.html || null;
  const textContent = fullMessage?.text || message.text || message.intro || "";
  const attachments = fullMessage?.attachments || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white truncate">
            {displayMessage.subject || "(No Subject)"}
          </h2>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-red-500"
            onClick={() => onDelete(message.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Meta */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {displayMessage.from?.name || displayMessage.from?.address}
              </p>
              <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatMessageDate(displayMessage.createdAt)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {displayMessage.from?.address}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              To: {displayMessage.to?.[0]?.address || "Unknown"}
            </p>
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {attachments.map((att) => (
              <a
                key={att.id}
                href={att.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Paperclip className="w-3 h-3" />
                {att.filename}
                <span className="text-slate-400">({formatFileSize(att.size)})</span>
                <Download className="w-3 h-3 text-slate-400" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : htmlContent ? (
          <div
            className="email-body prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-200"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200 font-sans leading-relaxed">
            {textContent}
          </pre>
        )}
      </div>
    </div>
  );
}