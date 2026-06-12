import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Tv, 
  Activity, 
  Calendar, 
  KeyRound, 
  RefreshCw, 
  Sliders, 
  Mail, 
  Laptop, 
  Trash2, 
  Compass, 
  Download, 
  Lock, 
  UserCheck, 
  FileText,
  AlertOctagon,
  Eye, 
  EyeOff,
  BellRing,
  Unlock,
  CornerDownRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserSession } from "../types";

interface SecurityCenterProps {
  session: UserSession;
  onLogout: () => void;
  onSessionUpdate: (updated: UserSession) => void;
}

export default function SecurityCenter({ session, onLogout, onSessionUpdate }: SecurityCenterProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Loaded DB data
  const [score, setScore] = useState(70);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [recoveryCodesCount, setRecoveryCodesCount] = useState(4);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Password rotation details
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // MFA configs
  const [mfaEnabled, setMfaEnabled] = useState(session.mfaEnabled || false);
  const [mfaType, setMfaType] = useState<any>(session.mfaType || "NONE");

  // Recovery code dialog
  const [backupCodes, setBackupCodes] = useState<any[]>([]);

  // System active notifications alerts
  const [alertsCount, setAlertsCount] = useState(0);

  // Fetch security dashboard metrics on mount
  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/security/dashboard", {
        headers: {
          "Authorization": `Bearer ${session.token}`,
          "x-auth-token": session.token || ""
        }
      });
      const data = await response.json();
      if (response.ok) {
        setScore(data.score);
        setSessions(data.sessions || []);
        setLoginHistory(data.loginHistory || []);
        setSecurityEvents(data.securityEvents || []);
        setAuditLogs(data.auditLogs || []);
        setDevices(data.devices || []);
        setRecoveryCodesCount(data.recoveryCodesCount || 0);
        setNotifications(data.notifications || []);
        setMfaEnabled(data.user.mfaEnabled);
        setMfaType(data.user.mfaType);

        const unreadCount = (data.notifications || []).filter((n: any) => !n.read).length;
        setAlertsCount(unreadCount);
      } else {
        setError(data.error || "Failed to load security ledger.");
      }
    } catch (e) {
      setError("Compliance security servers unreachable. Sandbox mock mode active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, [session]);

  const triggerPostMfaUpdate = async (enabled: boolean, type: string) => {
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/security/update-mfa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`,
          "x-auth-token": session.token || ""
        },
        body: JSON.stringify({ mfaEnabled: enabled, mfaType: type })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setMfaEnabled(data.mfaEnabled);
        setMfaType(data.mfaType);
        
        onSessionUpdate({
          ...session,
          mfaEnabled: data.mfaEnabled,
          mfaType: data.mfaType
        });
        fetchDashboardMetrics();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to update multi-factor settings.");
    }
  };

  const handlePasswordResetDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/security/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`,
          "x-auth-token": session.token || ""
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        fetchDashboardMetrics();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to rotate transaction credentials.");
    } finally {
      setLoading(false);
    }
  };

  const revokeSelectedBrowserSession = async (sessId: string) => {
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/security/revoke-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`,
          "x-auth-token": session.token || ""
        },
        body: JSON.stringify({ sessionId: sessId })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        fetchDashboardMetrics();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Dynamic session revocation failed.");
    }
  };

  const retrieveOrDownloadBackupKeys = async () => {
    setError("");
    try {
      const response = await fetch("/api/security/recovery-codes", {
        headers: {
          "Authorization": `Bearer ${session.token}`,
          "x-auth-token": session.token || ""
        }
      });
      const data = await response.json();
      if (response.ok) {
        setBackupCodes(data.codes || []);
        
        // Trigger local download file
        const codeText = "QUANTMIND PRIVATE SECURITY SHEET\nMaster Client: " + session.email + "\nGenerated: " + new Date().toLocaleDateString() + "\n\n" +
          data.codes.map((c: any) => `Key: ${c.code} [${c.used ? 'EXPIRED/USED' : 'ACTIVE'}]`).join("\n");
        
        const blob = new Blob([codeText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "quantmind_vault_recovery_sheet.txt";
        a.click();
        setSuccess("Cryptographic wallet sheet generated and downloaded! Keep this offline.");
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Recovery service busy.");
    }
  };

  const regenerateBackupKeysOnFly = async () => {
    if (!confirm("Regenerating master recovery cards will instantly void all previously downloaded backup-sheet keys. Continue?")) return;
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/security/regenerate-recovery", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.token}`,
          "x-auth-token": session.token || ""
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Fresh multi-factor fallback keys created successfully!");
        setBackupCodes(data.codes.map((c: any) => ({ code: c, used: false })) || []);
        fetchDashboardMetrics();
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Key rotation failed.");
    }
  };

  return (
    <div className="flex-grow p-6 text-slate-100 font-sans" id="security-center-module">
      
      {/* Visual top bar header with safety score metrics */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800 pb-5 mb-6 gap-4" id="sc-header">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Enterprise Security Dashboard
                <span className="p-0.5 px-2 bg-indigo-550/10 border border-indigo-500/20 text-[9px] text-indigo-400 font-mono uppercase font-bold rounded-full">SEBI-Grade Compliant</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Control active sessions, rotate keys, manage dual-factor compliance, and inspect telemetry audits.</p>
            </div>
          </div>
        </div>

        {/* Dynamic connection status badge */}
        <div className="flex items-center space-x-3 text-xs bg-slate-900/40 p-2.5 px-4 rounded-xl border border-slate-800 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-slate-400 text-[10px]">VAULT CONNECTION: STANDALONE SECURE</span>
        </div>
      </div>

      {/* SUCCESS/ERROR FLASH DRAWER */}
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-5 p-3.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-start space-x-2.5"
          id="sc-success-flash"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-snug">{success}</p>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-5 p-3.5 bg-red-950/20 border border-red-500/20 text-red-350 rounded-xl text-xs flex items-start space-x-2.5"
          id="sc-error-flash"
        >
          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="leading-snug">{error}</p>
        </motion.div>
      )}

      {/* Main grids */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start" id="security-control-matrix">
        
        {/* Left Column (8 units): Score bento, Active sessions, Timelines */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Bento-Layout Block 1: Security Score Card + Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="bento-security-box">
            
            {/* Visual Security Arc Score dial */}
            <div className="md:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-[9px] text-slate-550 font-mono uppercase tracking-wider font-bold">CLIENT HEALTH METRICS</span>
              
              {/* Radial Meter representation */}
              <div className="relative w-28 h-28 my-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="44" strokeWidth="6" stroke="#1e293b" fill="transparent" className="opacity-40" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="44" 
                    strokeWidth="6" 
                    stroke={score < 60 ? "#ef4444" : score < 85 ? "#f59e0b" : "#10b981"} 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={2 * Math.PI * 44 * (1 - score / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black font-sans leading-none text-white tracking-tight">{score}</span>
                  <span className="text-[8px] text-slate-500 font-mono px-1 rounded uppercase font-bold mt-1">SECURE SCORE</span>
                </div>
              </div>

              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase ${
                score < 60 
                  ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                  : score < 85 
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}>
                {score < 60 ? "Deficit" : score < 85 ? "Optimal" : "Institutional (Fortified)"}
              </span>
            </div>

            {/* Verification checklist, showing user what elements are active/inactive */}
            <div className="md:col-span-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <span className="text-[9px] text-slate-550 font-mono uppercase tracking-wider font-bold">SECURITY ENFORCEMENT AUDIT CHECKLIST</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3">
                <div className="flex items-center space-x-3 text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                  <div className={`p-1 rounded-full ${session.mfaEnabled ? "bg-emerald-550/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-205">Multi-Factor Auths</p>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{session.mfaEnabled ? "ACTIVE (" + session.mfaType + ")" : "DEACTIVATED"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                  <div className="p-1 rounded-full bg-emerald-555/10 text-emerald-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-205">Email Clearance</p>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">VERIFIED SECURED</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                  <div className="p-1 rounded-full bg-emerald-550/10 text-emerald-400">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-205">Trusted Terminals</p>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{devices.length} REGISTERED DEVICES</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                  <div className={`p-1 rounded-full ${recoveryCodesCount > 0 ? "bg-emerald-550/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">Offline Recovery Card</p>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{recoveryCodesCount} ACTIVE BACKUPS</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic">Configure multi-factor options on the right side panel to trigger maximum clearance ranking.</p>
            </div>
          </div>

          {/* Table 1: ACTIVE SESSIONS MONITORS */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg" id="active-sessions-block">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Tv className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">Active Authorized Sessions</h3>
              </div>
              <span className="text-[9px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-550/20 font-bold">{sessions.length} Browsers Mounted</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-[9px] text-slate-500 font-mono uppercase bg-slate-950/20">
                    <th className="py-2.5 px-3">Browser / OS Footprint</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Approximate Location</th>
                    <th className="py-2.5 px-3">Security Clearances / Login Time</th>
                    <th className="py-2.5 px-3 text-right">Fiduciary Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-[10px]">Retrieving secure sessions telemetry from database ports...</td>
                    </tr>
                  ) : (
                    sessions.map((sess: any) => (
                      <tr key={sess.id} className="hover:bg-slate-950/45 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2.5">
                            <Laptop className={`w-4 h-4 ${sess.active ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <div>
                              <p className="font-semibold text-slate-205">{sess.browser || "Chrome Browser"}</p>
                              <span className="text-[9px] text-slate-500 font-mono uppercase">{sess.os || "Linux VM"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-indigo-305">{sess.ip || "103.45.1.92"}</td>
                        <td className="py-3 px-3 text-[11px] text-slate-400">{sess.location || "Central Clearing, Mumbai"}</td>
                        <td className="py-3 px-3">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400">{new Date(sess.loginTime).toLocaleTimeString()}</span>
                            <span className="block text-[8px] text-slate-550 font-mono uppercase">{new Date(sess.loginTime).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {sess.token === session.token ? (
                            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">CURRENT SESSION</span>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to instantly terminate this login and force log out the user on that device?")) {
                                  revokeSelectedBrowserSession(sess.id);
                                }
                              }}
                              className="p-1 px-2.5 text-[9px] font-mono bg-red-950/20 hover:bg-red-650/30 border border-red-500/20 text-red-350 hover:text-white rounded transition duration-150 cursor-pointer flex items-center space-x-1 ml-auto"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Revoke Link</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Double column grid for TIMELINE: Audit Logs & Security Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="history-sc-panels">
            
            {/* Audits Box */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg max-h-[350px] overflow-y-auto custom-scroll" id="audit-history-box">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
                <span className="text-[10px] font-bold font-mono text-slate-200 uppercase tracking-wider">Historical Audit Logs</span>
                <span className="text-[9px] text-slate-500 font-mono">{auditLogs.length} Records</span>
              </div>
              
              <div className="space-y-4 pr-1">
                {auditLogs.length === 0 ? (
                  <p className="text-[10px] text-slate-500 font-mono py-8 text-center">No active transaction audits logged.</p>
                ) : (
                  auditLogs.slice(0, 50).map((al: any) => (
                    <div key={al.id} className="text-xs space-y-1 relative pl-5 border-l border-slate-800">
                      <div className="absolute left-0 top-1.5 -translate-x-[4px] w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 font-mono text-[9px] bg-slate-950/30 px-1.5 py-0.5 border border-slate-850 rounded uppercase">{al.action}</span>
                        <span className="text-[8px] text-slate-550 font-mono">{new Date(al.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{al.details}</p>
                      <div className="text-[8px] text-slate-500 font-mono">
                        IP: {al.ip} • Browser: {al.device?.split(" ")[0]}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Security events anomalies (failed login attempts, lockouts) */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg max-h-[350px] overflow-y-auto custom-scroll" id="security-alerts-history-box">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
                <span className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 animate-bounce" />
                  Security Alerts & Anomalies
                </span>
                <span className="text-[9px] font-mono text-slate-500">{securityEvents.length} Events Logged</span>
              </div>

              <div className="space-y-4 pr-1">
                {securityEvents.length === 0 ? (
                  <p className="text-[10px] text-slate-500 font-mono py-8 text-center text-emerald-405">Compliance telemetry green. No active threat anomalies recorded.</p>
                ) : (
                  securityEvents.slice(0, 50).map((se: any) => (
                    <div 
                      key={se.id} 
                      className={`p-3 rounded-xl border border-dashed text-xs space-y-1.5 ${
                        se.severity === "CRITICAL"
                          ? "bg-red-955/10 border-red-500/20 text-red-200"
                          : se.severity === "HIGH"
                            ? "bg-amber-955/10 border-amber-500/25 text-amber-200"
                            : "bg-slate-950/40 border-slate-850 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-[9px] uppercase tracking-wide">{se.eventType}</span>
                        <span className={`text-[8px] px-1 rounded-sm uppercase font-bold ${
                          se.severity === "CRITICAL" ? "bg-red-500/20 text-red-400" : se.severity === "HIGH" ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {se.severity} LEVEL
                        </span>
                      </div>
                      <p className="text-[11px] leading-snug">{se.details}</p>
                      <div className="flex justify-between text-[8px] text-slate-500 font-mono pt-1">
                        <span>IP/D: {se.ip}</span>
                        <span>{new Date(se.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (4 units): MFA Controls, Code sheets, Change password settings */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Box 1: Multi Factor Configuration */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg" id="mfa-controls-card">
            <span className="text-[9px] text-slate-550 font-mono uppercase tracking-wider font-bold">MFA COMPLIANCE MANAGEMENT</span>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Mandated standards require MFA checks on all demat-linked capital. Choose your active second-factor security options.</p>
            
            <div className="space-y-3.5 mt-4">
              
              {/* Option A: Deactivated */}
              <div 
                onClick={() => triggerPostMfaUpdate(false, "NONE")}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  !mfaEnabled 
                    ? "bg-slate-950/80 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.06)]"
                    : "bg-slate-950/25 border-slate-850 hover:border-slate-800"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-200">NONE (Single Password)</p>
                  <p className="text-[9px] text-slate-500 font-mono font-bold mt-0.5">NOT COMPLIANT & WARNING ACTIVE</p>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!mfaEnabled ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700'}`}>
                  {!mfaEnabled && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </div>
              </div>

              {/* Option B: Email OTP */}
              <div 
                onClick={() => triggerPostMfaUpdate(true, "EMAIL_OTP")}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  mfaEnabled && mfaType === "EMAIL_OTP"
                    ? "bg-slate-950/80 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.06)]"
                    : "bg-slate-950/25 border-slate-850 hover:border-slate-800"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-202">Email OTP Credentials</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">Dual confirmation code sent dynamically on login</p>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${mfaEnabled && mfaType === "EMAIL_OTP" ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700'}`}>
                  {mfaEnabled && mfaType === "EMAIL_OTP" && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </div>
              </div>

              {/* Option C: Authenticator App */}
              <div 
                onClick={() => triggerPostMfaUpdate(true, "AUTHENTICATOR")}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  mfaEnabled && mfaType === "AUTHENTICATOR"
                    ? "bg-slate-950/80 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.06)]"
                    : "bg-slate-950/25 border-slate-850 hover:border-slate-800"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-200">Google Authenticator TOTP</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">Google / Microsoft Authenticator token checks</p>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${mfaEnabled && mfaType === "AUTHENTICATOR" ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700'}`}>
                  {mfaEnabled && mfaType === "AUTHENTICATOR" && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </div>
              </div>

            </div>
          </div>

          {/* Box 2: Secure Backup recovery Codes sheets */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg" id="recovery-codes-panel">
            <span className="text-[9px] text-slate-555 font-mono uppercase tracking-wider font-bold">Cryptographic Fallback Keys</span>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">If second-factor verification tools become unreachable, backup recovery sheets grant immediate clearance.</p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={retrieveOrDownloadBackupKeys}
                className="py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-200 rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer text-center"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Save Key sheet</span>
              </button>

              <button
                onClick={regenerateBackupKeysOnFly}
                className="py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[11px] font-bold text-indigo-400 rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer text-center"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rotate Keys</span>
              </button>
            </div>

            {backupCodes.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }}
                className="bg-slate-955/40 border border-indigo-500/15 p-3 rounded-xl mt-3 space-y-2"
              >
                <span className="block text-[8px] font-mono text-indigo-400 font-bold uppercase">CRYPTO SEQUENCES ROTATED:</span>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                  {backupCodes.map((bc: any, idx: number) => (
                    <div key={idx} className={`p-1 text-center font-bold bg-slate-950 rounded border ${bc.used ? 'border-slate-900 text-slate-600 line-through' : 'border-slate-800 text-emerald-400'}`}>
                      {bc.code || bc}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Box 3: Rotates standard password */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg" id="rotate-password-card">
            <span className="text-[9px] text-slate-550 font-mono uppercase tracking-wider font-bold">Rotate Standard Password</span>
            
            <form onSubmit={handlePasswordResetDashboard} className="space-y-3 mt-3">
              <div>
                <label className="block text-slate-500 text-[9px] font-mono mb-1">CURRENT PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-805 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none transition text-slate-100"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[9px] font-mono mb-1">NEW PASSWORD</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-slate-100"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-slate-505 text-[9px] font-mono mb-1">CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-slate-100"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-650 hover:bg-indigo-550 border border-indigo-500/10 text-white font-semibold text-xs text-center rounded-xl cursor-pointer transition flex items-center justify-center gap-1"
              >
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>Save rotative credentials</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
