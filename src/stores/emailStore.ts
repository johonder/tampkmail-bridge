import { create } from "zustand";
import { api } from "@/lib/api";

export interface MailDomain {
  id: string;
  domain: string;
  type: string;
  label: string;
  isActive: boolean;
}

export interface MailMessage {
  id: string;
  mid?: string;
  from: { address: string; name: string };
  to: { address: string; name: string }[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string | null;
  createdAt: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    id: string;
    filename: string;
    contentType: string;
    size: number;
    downloadUrl: string;
  }>;
}

interface EmailSession {
  address: string;
  domain: string;
  domainType: string;
  payload: string;
  timestamp: number;
  createdAt: string;
}

interface EmailState {
  session: EmailSession | null;
  domains: MailDomain[];
  domainTypes: string[];
  messages: MailMessage[];
  selectedMessage: MailMessage | null;
  selectedMessageFull: MailMessage | null;
  unreadCount: number;
  totalMessages: number;

  isLoading: boolean;
  isCreating: boolean;
  isFetchingMessages: boolean;
  isFetchingMessage: boolean;
  isUploading: boolean;
  error: string | null;
  showEmailApp: boolean;

  pollingInterval: ReturnType<typeof setInterval> | null;

  fetchDomains: () => Promise<void>;
  createEmail: (domain?: string) => Promise<void>;
  fetchMessages: () => Promise<void>;
  fetchMessage: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  selectMessage: (msg: MailMessage | null) => void;
  copyEmail: () => Promise<void>;
  changeEmail: () => void;
  startPolling: () => void;
  stopPolling: () => void;
  setShowEmailApp: (show: boolean) => void;
  setError: (err: string | null) => void;
  restoreSession: () => void;
}

const STORAGE_KEY = "tmpmail_session_v3";

function saveSession(session: EmailSession) {
  try {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  } catch {}
}

function loadSession(): EmailSession | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("reseller_api_key") || "";
  } catch {
    return "";
  }
}

export const useEmailStore = create<EmailState>((set, get) => ({
  session: null,
  domains: [],
  domainTypes: [],
  messages: [],
  selectedMessage: null,
  selectedMessageFull: null,
  unreadCount: 0,
  totalMessages: 0,
  isLoading: false,
  isCreating: false,
  isFetchingMessages: false,
  isFetchingMessage: false,
  isUploading: false,
  error: null,
  showEmailApp: false,
  pollingInterval: null,

  fetchDomains: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await api("/api/v1/domains");
      const data = await res.json();
      let domains: MailDomain[] = data.domains || [];
      const types: string[] = data.types || [];

      if (!domains.find((d: MailDomain) => d.domain === "nullsto.edu.pl")) {
        domains = [
          ...domains,
          { id: "edu-nullsto-edu-pl", domain: "nullsto.edu.pl", type: "edu", label: "Edu", isActive: true },
        ];
      }
      if (!types.includes("edu")) types.push("edu");

      set({ domains, domainTypes: types, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createEmail: async (domain?: string) => {
    const state = get();
    const domainToUse = domain || state.domains.find((d) => d.type === "other")?.domain;
    if (!domainToUse) {
      set({ error: "No domains available" });
      return;
    }

    set({ isCreating: true, error: null, messages: [], selectedMessage: null, selectedMessageFull: null, unreadCount: 0 });

    try {
      const domainInfo = state.domains.find((d) => d.domain === domainToUse);
      const isEdu = domainInfo?.type === "edu";

      // For edu domains, call Render bridge directly (worker doesn't handle them properly)
      if (isEdu) {
        const bridgeRes = await fetch("https://tampkmail-bridge-1.onrender.com/create-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: domainToUse }),
        });
        const bridgeData = await bridgeRes.json();
        if (!bridgeData.success) {
          set({ error: bridgeData.error || "Failed to create edu email", isCreating: false });
          return;
        }
        const session: EmailSession = {
          address: bridgeData.address,
          domain: domainToUse,
          domainType: "edu",
          payload: "",
          timestamp: Math.floor(Date.now() / 1000),
          createdAt: new Date().toISOString(),
        };
        set({ session, isCreating: false });
        saveSession(session);
        get().startPolling();
        return;
      }

      const res = await api("/api/v1/create", {
        method: "POST",
        body: JSON.stringify({ domain: domainToUse, apikey: getApiKey() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        set({ error: data.error || "Failed to create email", isCreating: false });
        return;
      }

      const data = await res.json();
      const emailData = data.email;
      const address = emailData.address;

      const domainType = emailData.domainType || "other";

      const session: EmailSession = {
        address,
        domain: domainToUse,
        domainType,
        payload: emailData.key || "",
        timestamp: emailData.timestamp || Math.floor(Date.now() / 1000),
        createdAt: new Date().toISOString(),
      };

      set({ session, isCreating: false });
      saveSession(session);
      get().startPolling();
      get().fetchMessages();
    } catch {
      set({ error: "Failed to create email. Try again.", isCreating: false });
    }
  },

  fetchMessages: async () => {
    const { session } = get();
    if (!session) return;

    set({ isFetchingMessages: true });
    try {
      // For edu sessions, check inbox via bridge directly
      if (session.domainType === "edu") {
        const bridgeRes = await fetch("https://tampkmail-bridge-1.onrender.com/check-inbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: session.address }),
        });
        const bridgeData = await bridgeRes.json();
        const messages: MailMessage[] = (bridgeData.messages || []).map((m: MailMessage) => ({
          ...m,
          mid: m.id || m.mid,
        }));
        const unreadCount = messages.filter((m) => !m.seen).length;
        set({ messages, unreadCount, totalMessages: bridgeData.count || messages.length, isFetchingMessages: false });
        return;
      }

      const apikey = getApiKey();
      const body: Record<string, unknown> = {
        domain: session.domain,
        address: session.address,
      };

      if (apikey) {
        body.apikey = apikey;
      }
      body.key = session.payload;

      const res = await api("/api/v1/inbox", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 410) {
          set({ session: null, messages: [], isFetchingMessages: false });
          sessionStorage.removeItem(STORAGE_KEY);
          return;
        }
        set({ isFetchingMessages: false });
        return;
      }

      const data = await res.json();
      const messages: MailMessage[] = (data.messages || []).map((m: MailMessage) => ({
        ...m,
        mid: m.id,
      }));
      const unreadCount = messages.filter((m) => !m.seen).length;

      set({ messages, unreadCount, totalMessages: data.count || messages.length, isFetchingMessages: false });

      if (data.key && session) {
        const updated = { ...session, payload: data.key };
        set({ session: updated });
        saveSession(updated);
      }

      const { selectedMessage } = get();
      if (selectedMessage) {
        const updated = messages.find((m) => m.id === selectedMessage.id);
        if (updated) set({ selectedMessage: updated });
      }
    } catch {
      set({ isFetchingMessages: false });
    }
  },

  fetchMessage: async (id: string) => {
    const { session } = get();
    if (!session) return;

    set({ isFetchingMessage: true });
    try {
      const apikey = getApiKey();
      const params = new URLSearchParams({ mid: id });
      if (apikey) params.set("apikey", apikey);
      if (session.payload) params.set("key", session.payload);
      if (session.address) params.set("address", session.address);

      const res = await api(`/api/v1/message/${id}?${params}`);
      if (!res.ok) {
        set({ isFetchingMessage: false });
        return;
      }

      const data = await res.json();
      if (data.message) {
        set({ selectedMessageFull: data.message, isFetchingMessage: false });
      } else {
        set({ isFetchingMessage: false });
      }
    } catch {
      set({ isFetchingMessage: false });
    }
  },

  deleteMessage: async (id: string) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
      selectedMessage: state.selectedMessage?.id === id ? null : state.selectedMessage,
      selectedMessageFull: state.selectedMessageFull?.id === id ? null : state.selectedMessageFull,
      unreadCount: Math.max(0, state.unreadCount - 1),
      totalMessages: Math.max(0, state.totalMessages - 1),
    }));
  },

  selectMessage: (msg) => {
    set({ selectedMessage: msg, selectedMessageFull: null });
    if (msg && !msg.seen) {
      set((state) => ({
        unreadCount: Math.max(0, state.unreadCount - 1),
        messages: state.messages.map((m) =>
          m.id === msg.id ? { ...m, seen: true } : m
        ),
      }));
      get().fetchMessage(msg.id);
    } else if (msg && msg.seen) {
      get().fetchMessage(msg.id);
    }
  },

  copyEmail: async () => {
    const { session } = get();
    if (!session?.address) return;
    try {
      await navigator.clipboard.writeText(session.address);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = session.address;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  },

  changeEmail: () => {
    get().stopPolling();
    sessionStorage.removeItem(STORAGE_KEY);
    set({
      session: null,
      messages: [],
      selectedMessage: null,
      selectedMessageFull: null,
      unreadCount: 0,
      totalMessages: 0,
      error: null,
    });
  },

  startPolling: () => {
    const state = get();
    if (state.pollingInterval) clearInterval(state.pollingInterval);
    const interval = setInterval(() => {
      get().fetchMessages();
    }, 10000);
    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },

  setShowEmailApp: (show) => {
    set({ showEmailApp: show });
    if (show) {
      const state = get();
      if (!state.domains.length) {
        get().fetchDomains();
      }
    }
  },

  uploadFile: async (file: File) => {
    const { session } = get();
    if (!session?.payload) return;
    set({ isUploading: true });
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await api("/api/v1/upload", {
        method: "POST",
        body: JSON.stringify({
          sessionKey: session.payload,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          data: base64,
        }),
      });
      set({ isUploading: false });
      return res.ok;
    } catch {
      set({ isUploading: false, error: "Upload failed" });
      return false;
    }
  },

  setError: (err) => set({ error: err }),

  restoreSession: () => {
    const session = loadSession();
    if (!session?.address) return;
    set({ session, showEmailApp: true });
    get().startPolling();
    get().fetchMessages();
  },
}));
