import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Activity,
  UserCheck,
  UserMinus,
  RefreshCw,
  Sliders,
  Plus,
  Search,
  Trash2,
  Lock,
  Unlock,
  Check,
  Database,
  Terminal,
  Settings,
  AlertTriangle,
  FileSpreadsheet,
  Globe,
  Smartphone,
  Monitor
} from "lucide-react";
import { UserSession } from "../types";

interface AdminPortalProps {
  session: UserSession;
}

export default function AdminPortal({ session }: AdminPortalProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    activeSessions: 0,
    loginFailureRate: 0,
    criticalAlertsCount: 0,
    securityEventCount: 0,
    auditLogCount: 0
  });

  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    rateLimitThreshold: 150,
    alertChannelPhone: "+919876543210",
    strictKycEnabled: true,
    riskGuardrails: "STANDARD_PORTFOLIO"
  });

  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<{
    loginHistory: any[];
    securityEvents: any[];
    auditLogs: any[];
    sessions: any[];
  }>({
    loginHistory: [],
    securityEvents: [],
    auditLogs: [],
    sessions: []
  });

  const [userSearch, setUserSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "users" | "logs">("overview");
  const [logFilter, setLogFilter] = useState<"all" | "audit" | "security" | "logins">("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Create user form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "ROLE_USER"
  });

  // Action status loading states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      };

      // 1. Fetch Stats
      const statsRes = await fetch("/api/admin/system-stats", { headers });
      if (!statsRes.ok) throw new Error("Failed to verify administrator token permissions.");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
        setSystemConfig(statsData.systemConfig);
      }

      // 2. Fetch Users
      const usersRes = await fetch("/api/admin/users", { headers });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      // 3. Fetch Logs
      const logsRes = await fetch("/api/admin/logs", { headers });
      const logsData = await logsRes.json();
      if (logsData.success) {
        setLogs({
          loginHistory: logsData.loginHistory,
          securityEvents: logsData.securityEvents,
          auditLogs: logsData.auditLogs,
          sessions: logsData.sessions
        });
      }

      setErrorMessage("");
    } catch (err: any) {
      setErrorMessage(err.message || "Institutional access denied.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session.isLoggedIn && session.role === "ROLE_ADMIN") {
      fetchAdminData();
    }
  }, [session]);

  const handleUpdateConfig = async (updatedConfig: any) => {
    try {
      const response = await fetch("/api/admin/system-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`
        },
        body: JSON.stringify(updatedConfig)
      });
      const data = await response.json();
      if (data.success) {
        setSystemConfig(data.systemConfig);
        showTemporarySuccess("System control parameters synchronized on ledger.");
        // Refresh logs to see current edit audit
        fetchAdminData();
      } else {
        setErrorMessage(data.error || "Failed to update configs.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to edit orchestration parameters.");
    }
  };

  const handleUserUpdate = async (userId: string, body: any) => {
    try {
      setActionLoadingId(userId);
      const response = await fetch(`/api/admin/users/${userId}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (data.success) {
        showTemporarySuccess(data.msg || "Ledger record refreshed successfully.");
        fetchAdminData();
      } else {
        alert(data.error || "Compliance rule block.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to connect to directory.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("CRITICAL: Are you sure you want to permanently purge this user record and revoke active session links? This action is irreversible on the schema ledger.")) {
      return;
    }
    try {
      setActionLoadingId(userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        showTemporarySuccess(data.msg || "Database node erased.");
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`
        },
        body: JSON.stringify(createForm)
      });
      const data = await response.json();
      if (data.success) {
        showTemporarySuccess("Fiduciary profile initialized successfully.");
        setShowCreateForm(false);
        setCreateForm({ name: "", email: "", mobile: "", password: "", role: "ROLE_USER" });
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const showTemporarySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const filteredUsers = users.filter(u => {
    const searchString = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(searchString) ||
      u.email.toLowerCase().includes(searchString) ||
      u.mobile.includes(searchString) ||
      u.role.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-2xl space-y-6" id="admin-portal-container">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/80 pb-5 gap-4 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
              <ShieldAlert className="w-5.5 h-5.5 animate-pulse" />
            </span>
            <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">Institutional Administrative Center</h2>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1.5 leading-relaxed tracking-wider uppercase">
            SECURE RECONCILIATION NODE &bull; ADMIN CONTROL INTERFACE
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono px-3 py-1.5 rounded border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> RE-SYNC SEED
          </button>
          <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 rounded">
            CENTRAL GATEWAY ONLINE
          </span>
        </div>
      </div>

      {/* COMPLIANCE WARNING BANNER */}
      {systemConfig.maintenanceMode && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-400">GLOBAL LOCK ACTIVE:</span> Non-administrators are currently locked from accessing API endpoints. Front-end systems are serving the Custodial Syncing notice.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs font-mono">
          [FAULT DETECTED]: {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-xs font-mono animate-pulse">
          [SYNCOPATED SUCCESS]: {successMessage}
        </div>
      )}

      {/* METRIC CARD BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">USER REGISTRIES</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            {loading ? "..." : stats.totalUsers}
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">TOTAL KEY-VALUE ENTITIES</p>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">ACTIVE TELEMETRY</span>
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            {loading ? "..." : stats.activeSessions} / {loading ? "..." : stats.totalSessions}
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">OPEN SESSIONS / REFRESH KEYS</p>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">SECURITY EVENTS</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {loading ? "..." : stats.securityEventCount}
          </div>
          <p className="text-[10px] text-rose-500 font-mono mt-1">
            {stats.criticalAlertsCount} SEVERE / HIGH ALERTS
          </p>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">AUDIT TRAIL LOGS</span>
            <Database className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            {loading ? "..." : stats.auditLogCount}
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">REPLICATED COMPLIANCE LINES</p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`px-4 py-2 text-xs font-mono border-b-2 transition ${
            activeSubTab === "overview"
              ? "border-rose-500 text-rose-400 bg-slate-800/30"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> SYSTEM ORCHESTRATION & CONTROL
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("users")}
          className={`px-4 py-2 text-xs font-mono border-b-2 transition ${
            activeSubTab === "users"
              ? "border-rose-500 text-rose-400 bg-slate-800/30"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> DATABASE USER DIRECTORY
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("logs")}
          className={`px-4 py-2 text-xs font-mono border-b-2 transition ${
            activeSubTab === "logs"
              ? "border-rose-500 text-rose-400 bg-slate-800/30"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> COMPLIANCE TRAIL & SECURITY EVENT LOGS
          </span>
        </button>
      </div>

      {/* TAB CONTENTS */}
      {loading && (
        <div className="text-center py-10 font-mono text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-rose-500" /> SYNCHRONIZING REAL-TIME CUSTODIAL ENGINE SEED...
        </div>
      )}

      {!loading && (
        <div>
          {/* TAB 1: SYSTEM OVERVIEW & ORCHESTRATION */}
          {activeSubTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* COMPLIANCE OVERRIDES PANEL */}
              <div className="bg-slate-950/30 border border-slate-800 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-rose-400" /> SYSTEM OVERRIDES
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">LIVE SYNC CONFIG</span>
                </div>

                <div className="space-y-4">
                  {/* Maintenance Mode Toggle */}
                  <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded border border-slate-800/50">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1">
                        CUSTODIAL SYSTEM SHUTDOWN
                      </h4>
                      <p className="text-[10px] text-slate-400">Lock non-admin access endpoints for schema maintenance.</p>
                    </div>
                    <div>
                      <button
                        onClick={() =>
                          handleUpdateConfig({
                            ...systemConfig,
                            maintenanceMode: !systemConfig.maintenanceMode
                          })
                        }
                        className={`font-mono text-[10px] px-3 py-1.5 rounded border transition flex items-center gap-1 ${
                          systemConfig.maintenanceMode
                            ? "bg-amber-600 border-amber-500 text-slate-100"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {systemConfig.maintenanceMode ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {systemConfig.maintenanceMode ? "SHUTDOWN ACTIVE" : "SYSTEM ONLINE"}
                      </button>
                    </div>
                  </div>

                  {/* KYC Compliance Toggle */}
                  <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded border border-slate-800/50">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 font-mono">STRICT KYC COMPLIANCE LOCK</h4>
                      <p className="text-[10px] text-slate-400">Require Aadhaar & PAN validation before allowing sandbox portfolio trades.</p>
                    </div>
                    <div>
                      <button
                        onClick={() =>
                          handleUpdateConfig({
                            ...systemConfig,
                            strictKycEnabled: !systemConfig.strictKycEnabled
                          })
                        }
                        className={`font-mono text-[10px] px-3 py-1.5 rounded border transition ${
                          systemConfig.strictKycEnabled
                            ? "bg-rose-900/40 border-rose-500/50 text-rose-300"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                        }`}
                      >
                        {systemConfig.strictKycEnabled ? "ENFORCED" : "BYPASSED"}
                      </button>
                    </div>
                  </div>

                  {/* Rate limit sliding threshold */}
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800/50 space-y-2">
                    <div className="flex justify-between">
                      <h4 className="text-xs font-bold text-slate-300 font-mono">HARDWARE RATE LIMIT SETTING</h4>
                      <span className="text-xs font-mono text-sky-400 font-bold">
                        {systemConfig.rateLimitThreshold} REQ/MIN
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="400"
                      step="10"
                      value={systemConfig.rateLimitThreshold}
                      onChange={(e) =>
                        setSystemConfig({ ...systemConfig, rateLimitThreshold: Number(e.target.value) })
                      }
                      onMouseUp={() =>
                        handleUpdateConfig({
                          ...systemConfig,
                          rateLimitThreshold: systemConfig.rateLimitThreshold
                        })
                      }
                      onTouchEnd={() =>
                        handleUpdateConfig({
                          ...systemConfig,
                          rateLimitThreshold: systemConfig.rateLimitThreshold
                        })
                      }
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>10 REQ/MIN (HIGH DECK SECURE)</span>
                      <span>400 REQ/MIN (EXTREME SPEED)</span>
                    </div>
                  </div>

                  {/* Compliance Alert Hotline */}
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800/50 space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 font-mono">ALERT DISPATCH TELEPHONE</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={systemConfig.alertChannelPhone}
                        onChange={(e) => setSystemConfig({ ...systemConfig, alertChannelPhone: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-mono grow text-left"
                      />
                      <button
                        onClick={() =>
                          handleUpdateConfig({
                            ...systemConfig,
                            alertChannelPhone: systemConfig.alertChannelPhone
                          })
                        }
                        className="bg-rose-600 hover:bg-rose-500 text-slate-100 px-3 py-1 rounded text-xs transition"
                      >
                        SET HOTLINE
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono">
                      System sends critical security events and lockout alerts directly here.
                    </p>
                  </div>
                </div>
              </div>

              {/* DYNAMIC RISK DECK CARD */}
              <div className="bg-slate-950/30 border border-slate-800 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-sky-400" /> SYSTEM SECURITY & RISK GUARDRAILS
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">FIDUCIARY OVERRIDES</span>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  {/* Select risk guardrails */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">PORTFOLIO EXPOSURE THERSHOLD GUARDRAILS</label>
                    <select
                      value={systemConfig.riskGuardrails}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSystemConfig({ ...systemConfig, riskGuardrails: val });
                        handleUpdateConfig({ ...systemConfig, riskGuardrails: val });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 font-mono text-left"
                    >
                      <option value="STANDARD_PORTFOLIO">STANDARD COMPLIANCE - 100% EXPOSURE DECK</option>
                      <option value="CONSERVATIVE">CONSERVATIVE - MAX 40% ALTERNATIVE WEIGHT</option>
                      <option value="INSTITUTIONAL_HEAVY">INSTITUTIONAL HEAVY - ACCELERATED DERIVATIVES EXPOSURE</option>
                      <option value="MOCK_SIM_MODE">DETERMINISTIC SIMULATION - TEST ENV KEYPLAY</option>
                    </select>
                  </div>

                  <div className="bg-slate-900/40 p-4 rounded border border-slate-800 space-y-2 text-[11px] text-slate-300">
                    <p className="font-bold text-slate-200 text-xs flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" /> QUICK SIMULATION & DIAGNOSTICS:
                    </p>
                    <p>Use the following buttons to trigger mock events in the compliance audit engine for security validation:</p>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch("/api/client/portfolio-audit", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${session.token}`
                              },
                              body: JSON.stringify({ holdingsCount: 12, actionTaken: "DIAGNOSTIC_HARD_COMPLIANCE_TRIGGER" })
                            });
                            if (res.ok) {
                              showTemporarySuccess("Mock portfolio compliance trigger registered on schema registry.");
                              fetchAdminData();
                            }
                          } catch (e) {}
                        }}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 p-1.5 rounded transition text-center text-[10px]"
                      >
                        Trigger Portfolio Audit Log
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch("/api/client/profile-kyc", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${session.token}`
                              },
                              body: JSON.stringify({ kycUpdate: "COMPLIANCE_OVERRIDE_APPROVED" })
                            });
                            if (res.ok) {
                              showTemporarySuccess("Compliance Override Log generated successfully.");
                              fetchAdminData();
                            }
                          } catch (e) {}
                        }}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 p-1.5 rounded transition text-center text-[10px]"
                      >
                        Force Profile KYC Re-audited
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 bg-slate-950 p-2.5 rounded border border-slate-800/60 leading-relaxed">
                    <strong>ADMIN SECURITY PARADIGM:</strong> Changes updated above apply instantly to all subsequent incoming HTTP operations on the Express container middleware. Local storage keys synchronize on page reloading.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER DIRECTORY & ACCESS ROLES */}
          {activeSubTab === "users" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
                {/* Search user */}
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search users by name, email or mobile..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 placeholder-slate-500 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-left"
                  />
                </div>

                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 hover:scale-[1.01] transition duration-200 text-slate-100 font-mono text-xs px-3.5 py-1.5 rounded shadow-md"
                >
                  <Plus className="w-4 h-4" /> PROVISION EXECUTIVE ACCOUNT
                </button>
              </div>

              {/* CREATE USER WIZARD */}
              {showCreateForm && (
                <form
                  onSubmit={handleCreateUserSubmit}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-4 font-mono transition-all duration-300"
                >
                  <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">NEW FIDUCIARY PROFILE PROVISIONING</span>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="text-slate-500 hover:text-slate-300 text-xs"
                    >
                      CANCEL
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">NAME</label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe Client"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-left text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        required
                        placeholder="client@domain.com"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-left text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">MOBILE CONTACT</label>
                      <input
                        type="text"
                        required
                        placeholder="+919876543210"
                        value={createForm.mobile}
                        onChange={(e) => setCreateForm({ ...createForm, mobile: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-left text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">RECONCILABLE PASSWORD</label>
                      <input
                        type="password"
                        required
                        placeholder="Secure pass representation"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-left text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">AUTHORIZED SYSTEM ROLE</label>
                      <select
                        value={createForm.role}
                        onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100"
                      >
                        <option value="ROLE_USER">ROLE_USER (Standard client)</option>
                        <option value="ROLE_PREMIUM">ROLE_PREMIUM (AI Portfolio Access)</option>
                        <option value="ROLE_ADVISOR">ROLE_ADVISOR (Institutional advisor)</option>
                        <option value="ROLE_ADMIN">ROLE_ADMIN (Super administrator)</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-500 text-slate-100 text-xs font-bold py-1.5 rounded transition"
                      >
                        COMMENCE PROVISIONING
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* USER DIRECTORY TABLE */}
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left font-mono text-xs divide-y divide-slate-800 bg-slate-950/25">
                  <thead className="bg-slate-950 text-slate-400 text-[10px]">
                    <tr>
                      <th className="px-4 py-3">ACCOUNT IDENTITY</th>
                      <th className="px-4 py-3">AUTHORIZATION ROLE</th>
                      <th className="px-4 py-3">COMPLIANCE STATUS</th>
                      <th className="px-4 py-3">REGISTRATION DATE</th>
                      <th className="px-4 py-3 text-right">ADMIN OPERATIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-500">
                          No indices found corresponding to user search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/40 transition">
                          {/* Account Identity */}
                          <td className="px-4 py-3 space-y-1">
                            <div className="font-bold text-slate-200 text-sm">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                            <div className="text-[10px] text-slate-500">Mobile: {u.mobile}</div>
                          </td>

                          {/* Authorization Role Selector */}
                          <td className="px-4 py-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleUserUpdate(u.id, { role: e.target.value })}
                              disabled={actionLoadingId === u.id}
                              className="bg-slate-900 border border-slate-800 rounded font-bold px-2 py-1 text-[11px] text-sky-400 focus:outline-none"
                            >
                              <option value="ROLE_USER">Standard (USER)</option>
                              <option value="ROLE_PREMIUM">Premium (PREMIUM)</option>
                              <option value="ROLE_ADVISOR">Advisor (ADVISOR)</option>
                              <option value="ROLE_ADMIN">Administrator (ADMIN)</option>
                            </select>
                          </td>

                          {/* Status Badge selector */}
                          <td className="px-4 py-3">
                            <select
                              value={u.status}
                              onChange={(e) => handleUserUpdate(u.id, { status: e.target.value })}
                              disabled={actionLoadingId === u.id}
                              className={`bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] font-bold focus:outline-none ${
                                u.status === "ACTIVE"
                                  ? "text-emerald-400"
                                  : u.status === "SUSPENDED"
                                  ? "text-rose-400"
                                  : "text-amber-400"
                              }`}
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="SUSPENDED">SUSPENDED</option>
                              <option value="LOCKED">LOCKED (TEMP)</option>
                              <option value="PENDING_VERIFICATION">UNVERIFIED</option>
                            </select>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3 text-slate-400 text-xs">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          {/* Operations */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  const rename = prompt("Enter replacement display name:", u.name);
                                  if (rename) handleUserUpdate(u.id, { name: rename });
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded text-[10px]"
                                disabled={actionLoadingId === u.id}
                              >
                                RENAME
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="bg-rose-950 hover:bg-rose-900 text-rose-300 p-1 rounded hover:text-rose-100 transition"
                                title="FORCE ERASE PROFILE"
                                disabled={actionLoadingId === u.id || u.id === session.id}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: AUDITS, SECURITY LOGS & SESSION LISTS */}
          {activeSubTab === "logs" && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row gap-2 justify-between items-start md:items-center">
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
                  <button
                    onClick={() => setLogFilter("all")}
                    className={`px-3 py-1 text-xs font-mono rounded ${
                      logFilter === "all" ? "bg-rose-600 text-slate-100" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ALL LOG LINES ({logs.auditLogs.length + logs.securityEvents.length + logs.loginHistory.length})
                  </button>

                  <button
                    onClick={() => setLogFilter("audit")}
                    className={`px-3 py-1 text-xs font-mono rounded ${
                      logFilter === "audit" ? "bg-violet-600 text-slate-100" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    AUDITS ({logs.auditLogs.length})
                  </button>

                  <button
                    onClick={() => setLogFilter("security")}
                    className={`px-3 py-1 text-xs font-mono rounded ${
                      logFilter === "security" ? "bg-rose-900 text-slate-100" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ALERTS ({logs.securityEvents.length})
                  </button>

                  <button
                    onClick={() => setLogFilter("logins")}
                    className={`px-3 py-1 text-xs font-mono rounded ${
                      logFilter === "logins" ? "bg-emerald-600 text-slate-100" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    LOGINS ({logs.loginHistory.length})
                  </button>
                </div>

                {/* Log Search */}
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search logs by email, action..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full bg-slate-950 text-slate-300 placeholder-slate-500 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-left"
                  />
                </div>
              </div>

              {/* RENDER LOG LIST */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 max-h-[420px] overflow-y-auto space-y-1.5 font-mono text-[11px] leading-relaxed">
                {/* Aggregate and sort all logs */}
                {(() => {
                  let combined: any[] = [];
                  const searchLower = logSearch.toLowerCase();

                  if (logFilter === "all" || logFilter === "audit") {
                    combined = [
                      ...combined,
                      ...logs.auditLogs.map((l) => ({ ...l, logType: "AUDIT" }))
                    ];
                  }
                  if (logFilter === "all" || logFilter === "security") {
                    combined = [
                      ...combined,
                      ...logs.securityEvents.map((l) => ({ ...l, logType: "ALERT" }))
                    ];
                  }
                  if (logFilter === "all" || logFilter === "logins") {
                    combined = [
                      ...combined,
                      ...logs.loginHistory.map((l) => ({ ...l, logType: "LOGIN", userEmail: l.email }))
                    ];
                  }

                  // Sort desc chronologically
                  combined.sort((a, b) => new Date(b.timestamp || b.loginTime).getTime() - new Date(a.timestamp || a.loginTime).getTime());

                  // Apply search term
                  const searched = combined.filter((item) => {
                    if (!searchLower) return true;
                    return (
                      (item.userEmail && item.userEmail.toLowerCase().includes(searchLower)) ||
                      (item.action && item.action.toLowerCase().includes(searchLower)) ||
                      (item.details && item.details.toLowerCase().includes(searchLower)) ||
                      (item.eventType && item.eventType.toLowerCase().includes(searchLower)) ||
                      (item.ip && item.ip.includes(searchLower)) ||
                      (item.deviceInfo && item.deviceInfo.toLowerCase().includes(searchLower))
                    );
                  });

                  if (searched.length === 0) {
                    return <div className="text-center py-6 text-slate-500">No log records matched filter guidelines.</div>;
                  }

                  return searched.map((item, index) => {
                    const timeStr = new Date(item.timestamp || item.loginTime).toLocaleTimeString();
                    const dateStr = new Date(item.timestamp || item.loginTime).toLocaleDateString();

                    // Style depending on log type
                    if (item.logType === "AUDIT") {
                      return (
                        <div key={`audit-${index}`} className="border-l-2 border-violet-500 bg-violet-950/10 p-2 rounded flex hover:bg-violet-950/15 justify-between">
                          <div>
                            <span className="bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded text-[9px] mr-2">AUDIT</span>
                            <span className="text-slate-400">[{dateStr} {timeStr}]</span>
                            <span className="text-slate-300 font-bold ml-2">{item.userEmail || "System"}</span> &bull; <span className="text-violet-300 font-semibold">{item.action}</span>
                            <p className="text-slate-400 text-[10px] mt-0.5">{item.details}</p>
                          </div>
                          <div className="text-right text-slate-500 text-[9px] font-mono shrink-0">
                            IP: {item.ip || "127.0.0.1"} <br /> Dev: {item.device?.substring(0, 15) || "Browser"}
                          </div>
                        </div>
                      );
                    } else if (item.logType === "ALERT") {
                      const isHigh = item.severity === "CRITICAL" || item.severity === "HIGH";
                      return (
                        <div key={`alert-${index}`} className={`border-l-2 p-2 rounded flex justify-between ${
                          isHigh ? "border-rose-500 bg-rose-950/20 hover:bg-rose-950/25" : "border-amber-500 bg-amber-950/15 hover:bg-amber-950/20"
                        }`}>
                          <div>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] mr-2 font-bold ${
                              isHigh ? "bg-rose-500 text-slate-100" : "bg-amber-500/20 text-amber-400"
                            }`}>
                              SECURITY ALARM &bull; {item.severity}
                            </span>
                            <span className="text-slate-400">[{dateStr} {timeStr}]</span>
                            <span className="text-slate-100 font-bold ml-2">{item.email}</span> &bull; <span className="text-rose-300">{item.eventType}</span>
                            <p className="text-slate-400 text-[10px] mt-0.5">{item.details}</p>
                          </div>
                          <div className="text-right text-slate-500 text-[9px] font-mono shrink-0">
                            IP: {item.ip} <br /> {item.device}
                          </div>
                        </div>
                      );
                    } else { // LOGIN
                      const ok = item.success;
                      return (
                        <div key={`login-${index}`} className={`border-l-2 p-2 rounded flex justify-between ${
                          ok ? "border-emerald-500 bg-emerald-950/10 hover:bg-emerald-950/15" : "border-amber-600 bg-amber-950/10 hover:bg-amber-950/15"
                        }`}>
                          <div>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] mr-2 ${
                              ok ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-600/30 text-amber-400 font-bold"
                            }`}>
                              {ok ? "LOGIN SUCCESS" : "LOGIN FAILED"}
                            </span>
                            <span className="text-slate-400">[{dateStr} {timeStr}]</span>
                            <span className="text-slate-300 font-bold ml-2">{item.userEmail}</span>
                            {!ok && <p className="text-amber-400 font-semibold text-[10px] mt-0.5">Failure Reason: {item.failureReason || "Authentication key mismatched."}</p>}
                          </div>
                          <div className="text-right text-slate-500 text-[9px] font-mono shrink-0">
                            IP: {item.ip || "103.45.1.92"} <br /> {item.deviceInfo?.substring(0, 20)}
                          </div>
                        </div>
                      );
                    }
                  });
                })()}
              </div>

              {/* ACTIVE SESSION CONNECTIONS */}
              <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-1.5">
                  <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> LIVE SECURITY CONNECTIONS & TOKEN VECTORS
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500">SESSION AUDIT LIST</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {logs.sessions.map((sess) => (
                    <div key={sess.id} className="bg-slate-900/50 p-2.5 rounded border border-slate-800 text-[10px] space-y-1 font-mono">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-300">ID: {sess.id}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] ${
                          sess.active ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        }`}>
                          {sess.active ? "ACTIVE BEACON" : "REVOKED"}
                        </span>
                      </div>
                      <div className="text-slate-400">User ID: <span className="text-slate-300">{sess.userId}</span></div>
                      <div className="text-slate-400">Device Path: <span className="text-slate-300">{sess.browser} ({sess.os})</span></div>
                      <div className="text-slate-400">Inbound IP: <span className="text-slate-300">{sess.ip} &bull; {sess.location}</span></div>
                      <div className="text-slate-500 text-[8px]">LOGGED AT: {new Date(sess.loginTime).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
