"use client";

import { useState, useEffect } from "react";
import { Mail, Settings, Users, Key, Inbox, LogIn, LogOut, RefreshCw, Shield, Upload, Database } from "lucide-react";

const API_BASE = "https://tampkemail-api.miraz-help.workers.dev";

interface Dashboard {
  totalUsers: number;
  totalEmails: number;
  totalSessions: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    if (t) setToken(t);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Connection error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setDashboard(await res.json());
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (token && tab === "dashboard") fetchDashboard();
    if (token && tab === "users") fetchUsers();
  }, [token, tab]);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-slate-900 rounded-2xl p-8 border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Login</h1>
              <p className="text-xs text-slate-400">TampKemail Management</p>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mb-4 bg-red-950/50 rounded-lg p-3">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          </div>
        </form>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Mail },
    { id: "users", label: "Users", icon: Users },
    { id: "sessions", label: "Sessions", icon: Inbox },
    { id: "keys", label: "API Keys", icon: Key },
    { id: "uploads", label: "Uploads", icon: Upload },
    { id: "pool", label: "Pool Accounts", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Admin Panel</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm text-slate-400">Total Users</span>
                </div>
                <p className="text-3xl font-bold text-white">{dashboard?.totalUsers ?? "-"}</p>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-400">Total Emails</span>
                </div>
                <p className="text-3xl font-bold text-white">{dashboard?.totalEmails ?? "-"}</p>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                    <Inbox className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-sm text-slate-400">Total Sessions</span>
                </div>
                <p className="text-3xl font-bold text-white">{dashboard?.totalSessions ?? "-"}</p>
              </div>
            </div>
            <button onClick={fetchDashboard} className="mt-4 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        )}

        {tab === "users" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Users</h2>
            {users.length === 0 ? (
              <p className="text-slate-500">No users registered yet.</p>
            ) : (
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-800/50 text-slate-300 hover:bg-slate-800/50">
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">{u.name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${u.role === "admin" ? "bg-purple-600/20 text-purple-400" : "bg-slate-800 text-slate-400"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button onClick={fetchUsers} className="mt-4 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        )}

        {tab === "sessions" && <SessionsPanel token={token} />}
        {tab === "keys" && <KeysPanel token={token} />}
        {tab === "uploads" && <UploadsPanel token={token} />}
        {tab === "pool" && <PoolPanel token={token} />}
      </div>
    </div>
  );
}

function SessionsPanel({ token }: { token: string }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setSessions(d.sessions || []);
      }
    } catch {}
  };
  useEffect(() => { fetchSessions(); }, []);
  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">Sessions</h2>
      {sessions.length === 0 ? (
        <p className="text-slate-500">No sessions yet.</p>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="text-left p-4 font-medium">Address</th>
                <th className="text-left p-4 font-medium">Domain</th>
                <th className="text-left p-4 font-medium">Active</th>
                <th className="text-left p-4 font-medium">Created</th>
                <th className="text-left p-4 font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s: any) => (
                <tr key={s.id} className="border-b border-slate-800/50 text-slate-300 hover:bg-slate-800/50">
                  <td className="p-4 font-mono text-xs">{s.address}</td>
                  <td className="p-4">{s.domain}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${s.isActive ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</td>
                  <td className="p-4 text-slate-500 text-xs">{s.expiredAt ? new Date(s.expiredAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button onClick={fetchSessions} className="mt-4 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
        <RefreshCw className="w-4 h-4" /> Refresh
      </button>
    </div>
  );
}

function PoolPanel({ token }: { token: string }) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newType, setNewType] = useState("google");
  const [newServer, setNewServer] = useState("");

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/pool-accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setAccounts(d.accounts || []);
      }
    } catch {}
  };
  useEffect(() => { fetchAccounts(); }, []);

  const handleAdd = async () => {
    if (!newEmail || !newPass) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/pool-accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: newEmail,
          type: newType,
          password: newPass,
          server: newServer || undefined,
        }),
      });
      if (res.ok) {
        setNewEmail(""); setNewPass(""); setNewServer(""); setShowAdd(false);
        fetchAccounts();
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/admin/pool-accounts/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts();
    } catch {}
  };

  const handleToggle = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/admin/pool-accounts/${id}/toggle`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts();
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Pool Accounts</h2>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all">
          + Add Account
        </button>
      </div>

      {showAdd && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm">
                <option value="google">Gmail</option>
                <option value="microsoft">Outlook</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">IMAP Server (optional)</label>
              <input type="text" value={newServer} onChange={e => setNewServer(e.target.value)}
                placeholder={newType === "google" ? "imap.gmail.com" : "outlook.office365.com"}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Save</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <p className="text-slate-500">No pool accounts configured. Add your first Gmail/Outlook account above.</p>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Server</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Last Used</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a: any) => (
                <tr key={a.id} className="border-b border-slate-800/50 text-slate-300 hover:bg-slate-800/50">
                  <td className="p-4 font-mono text-xs">{a.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${a.type === "google" ? "bg-red-600/20 text-red-400" : "bg-blue-600/20 text-blue-400"}`}>
                      {a.type === "google" ? "Gmail" : "Outlook"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{a.server}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${a.active ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"}`}>
                      {a.active ? (a.inUse ? "In Use" : "Active") : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{a.lastUsedAt ? new Date(a.lastUsedAt).toLocaleString() : "Never"}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleToggle(a.id)}
                      className="px-3 py-1 mr-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-600/10 hover:bg-emerald-600/20 rounded-lg transition-colors">
                      {a.active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(a.id)}
                      className="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 bg-red-600/10 hover:bg-red-600/20 rounded-lg transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button onClick={fetchAccounts} className="mt-4 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
        <RefreshCw className="w-4 h-4" /> Refresh
      </button>
    </div>
  );
}

function UploadsPanel({ token }: { token: string }) {
  const [uploads, setUploads] = useState<any[]>([]);
  const fetchUploads = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/uploads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setUploads(d.uploads || []);
      }
    } catch {}
  };
  useEffect(() => { fetchUploads(); }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/uploads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchUploads();
    } catch {}
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">Uploaded Files</h2>
      {uploads.length === 0 ? (
        <p className="text-slate-500">No files uploaded yet.</p>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="text-left p-4 font-medium">Filename</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Size</th>
                <th className="text-left p-4 font-medium">Uploaded</th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((f: any) => (
                <tr key={f.id} className="border-b border-slate-800/50 text-slate-300 hover:bg-slate-800/50">
                  <td className="p-4">{f.filename}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400">
                      {f.mimeType}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{formatSize(f.size)}</td>
                  <td className="p-4 text-slate-500 text-xs">{f.createdAt ? new Date(f.createdAt).toLocaleString() : "-"}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(f.id)}
                      className="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 bg-red-600/10 hover:bg-red-600/20 rounded-lg transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button onClick={fetchUploads} className="mt-4 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
        <RefreshCw className="w-4 h-4" /> Refresh
      </button>
    </div>
  );
}

function KeysPanel({ token }: { token: string }) {
  const [keys, setKeys] = useState<any[]>([]);
  const fetchKeys = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setKeys(d.keys || []);
      }
    } catch {}
  };
  useEffect(() => { fetchKeys(); }, []);
  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">API Keys</h2>
      {keys.length === 0 ? (
        <p className="text-slate-500">No API keys yet.</p>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="text-left p-4 font-medium">Label</th>
                <th className="text-left p-4 font-medium">Key</th>
                <th className="text-left p-4 font-medium">Active</th>
                <th className="text-left p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k: any) => (
                <tr key={k.id} className="border-b border-slate-800/50 text-slate-300 hover:bg-slate-800/50">
                  <td className="p-4">{k.label}</td>
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {k.key?.length > 8 ? k.key.slice(0, 4) + "****" + k.key.slice(-4) : k.key}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${k.active ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"}`}>
                      {k.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{k.createdAt ? new Date(k.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button onClick={fetchKeys} className="mt-4 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
        <RefreshCw className="w-4 h-4" /> Refresh
      </button>
    </div>
  );
}
