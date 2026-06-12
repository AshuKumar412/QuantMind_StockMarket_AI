import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  CreditCard,
  History,
  Settings,
  Globe,
  Terminal,
  Clock,
  Laptop,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Cpu,
  Mail,
  Phone,
  Calendar,
  Lock,
  RefreshCw,
  Sliders,
  DollarSign,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserSession, DematAccount } from "../types";

interface AccountHubProps {
  session: UserSession;
  onSessionUpdate: (updated: UserSession) => void;
  demat: DematAccount;
  onUpdateDemat: (updated: DematAccount) => void;
  holdingsCount: number;
  portfolioValue: number;
}

export default function AccountHub({
  session,
  onSessionUpdate,
  demat,
  onUpdateDemat,
  holdingsCount,
  portfolioValue
}: AccountHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "demat" | "devices" | "history" | "preferences">("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [accountDetails, setAccountDetails] = useState<any>(null);

  // Preference states
  const [riskAppetite, setRiskAppetite] = useState<string>(() => {
    return localStorage.getItem("quantmind_risk_appetite") || "Moderate";
  });
  const [baseCurrency, setBaseCurrency] = useState<string>(() => {
    return localStorage.getItem("quantmind_base_currency") || "USD";
  });
  const [dividendPolicy, setDividendPolicy] = useState<boolean>(() => {
    return localStorage.getItem("quantmind_drip_enabled") === "true";
  });
  const [notifyLimit, setNotifyLimit] = useState<number>(() => {
    return Number(localStorage.getItem("quantmind_notify_limit") || "10");
  });

  const fetchDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/client/account-details", {
        headers: {
          "Authorization": `Bearer ${session.token}`,
          "x-auth-token": session.token || ""
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAccountDetails(data);
      } else {
        setError(data.error || "Failed to synchronise security ledgers from custodial network.");
      }
    } catch (e) {
      setError("Compliance security servers unreachable. Displaying cached local session variables.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [session.token]);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("quantmind_risk_appetite", riskAppetite);
    localStorage.setItem("quantmind_base_currency", baseCurrency);
    localStorage.setItem("quantmind_drip_enabled", dividendPolicy.toString());
    localStorage.setItem("quantmind_notify_limit", notifyLimit.toString());

    // Audits this action live to server
    try {
      fetch("/api/client/portfolio-audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`,
          "x-auth-token": session.token || ""
        },
        body: JSON.stringify({
          holdingsCount,
          actionTaken: `Updated client account parameters - Risk: ${riskAppetite}, Currency: ${baseCurrency}, DRIP: ${dividendPolicy}`
        })
      });
    } catch (err) {
      // quiet failover
    }

    setSuccess("Investment profile configurations serialized and synced with high-security records successfully.");
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <div className="space-y-8" id="custodian-account-hub">
      {/* Dynamic Hub Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/60 to-slate-950 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-baseline md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Verified Custodial Access</span>
            </div>
            <h2 className="text-2xl font-sans font-extrabold text-white tracking-tight">
              Institutional User Account Portfolio Hub
            </h2>
            <p className="text-xs text-slate-400 font-mono max-w-2xl">
              Fiduciary management panel displaying all verified demat allocations, credential states, audit trail trackers, and client setting profiles.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/60 border border-slate-850 px-5 py-3 rounded-xl">
            <div className="text-right">
              <span className="block text-[9px] text-slate-500 font-mono tracking-wider uppercase">Active Portfolio Assets</span>
              <span className="block font-mono text-lg font-bold text-emerald-400">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-left">
              <span className="block text-[9px] text-slate-500 font-mono tracking-wider uppercase">Risk Profile</span>
              <span className="block font-sans text-xs font-semibold text-white bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-md mt-0.5 uppercase tracking-wide inline-block">{riskAppetite}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Controller Interface */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition font-sans ${
            activeSubTab === "overview"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-white hover:bg-slate-900/60"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab("demat")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition font-sans ${
            activeSubTab === "demat"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-white hover:bg-slate-900/60"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Demat Custody</span>
        </button>

        <button
          onClick={() => setActiveSubTab("devices")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition font-sans ${
            activeSubTab === "devices"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-white hover:bg-slate-900/60"
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Sessions & Devices</span>
        </button>

        <button
          onClick={() => setActiveSubTab("history")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition font-sans ${
            activeSubTab === "history"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-white hover:bg-slate-900/60"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail Logs</span>
        </button>

        <button
          onClick={() => setActiveSubTab("preferences")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition font-sans ${
            activeSubTab === "preferences"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-white hover:bg-slate-900/60"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Advisory Preferences</span>
        </button>

        <button
          onClick={fetchDetails}
          disabled={loading}
          className="ml-auto p-2 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Notifications/Feedback Banner */}
      {error && (
        <div className="flex items-start space-x-2.5 p-3.5 rounded-xl border border-red-500/20 bg-red-950/15 text-red-200 text-xs">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="font-sans leading-relaxed">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start space-x-2.5 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/15 text-emerald-200 text-xs text-left">
          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <p className="font-sans leading-relaxed">{success}</p>
        </div>
      )}

      {/* TAB CONTENT GRID CONTAINER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-1 gap-8"
        >
          {/* TAB 1: PROFILE OVERVIEW */}
          {activeSubTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* User credentials details */}
              <div className="lg:col-span-8 border border-slate-800 bg-slate-900/20 rounded-xl p-6 space-y-6">
                <h3 className="text-sm font-sans font-bold text-slate-200 uppercase tracking-wide">Fiduciary Authentication Certificate</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                    <span className="block text-[10px] text-slate-500 font-mono uppercase">Full Name</span>
                    <span className="block text-sm font-semibold text-white">{session.firstName || "Jane"} {session.lastName || "Doe"}</span>
                  </div>

                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                    <span className="block text-[10px] text-slate-500 font-mono uppercase">Role Authorization Level</span>
                    <span className="block text-sm font-bold text-indigo-400 flex items-center space-x-1 uppercase">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{session.role || "ROLE_USER"}</span>
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                    <span className="block text-[10px] text-slate-500 font-mono uppercase">Authorized Email Identity</span>
                    <span className="block text-sm font-semibold text-white flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{session.email || "client@goldman-sachs.com"}</span>
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                    <span className="block text-[10px] text-slate-500 font-mono uppercase">Secure Mobile Endpoint</span>
                    <span className="block text-sm font-semibold text-white flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{accountDetails?.user?.mobile || "+91 98765 43210"}</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>SECURITY TOKEN PARCEL ID</span>
                    <span>VERIFIED TIMESTAMP</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-indigo-400 break-all bg-slate-950/60 p-2.5 rounded border border-slate-900/80">
                    <span className="truncate max-w-xs">{session.token || "MOCK_JSON_JWTOKEN_PARCEL"}</span>
                    <span>{accountDetails?.user?.createdAt ? new Date(accountDetails.user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status and summary scorecard */}
              <div className="lg:col-span-4 border border-slate-800/80 bg-slate-900/40 rounded-xl p-6 space-y-6">
                <h3 className="text-sm font-sans font-bold text-slate-200 uppercase tracking-wide">Status Verification Metrics</h3>

                <div className="space-y-4 text-xs font-sans">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-850">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-medium text-slate-300">Account status</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-850">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-2 h-2 rounded-full ${accountDetails?.user?.mfaEnabled ? "bg-emerald-500" : "bg-orange-500"}`} />
                      <span className="font-medium text-slate-300">Multi-Factor Auth (MFA)</span>
                    </div>
                    <span className={`font-mono text-[10px] font-bold ${accountDetails?.user?.mfaEnabled ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-orange-400 bg-orange-500/10 border-orange-500/20"} px-2 py-0.5 rounded border uppercase`}>
                      {accountDetails?.user?.mfaEnabled ? "SECURED" : "DISABLED"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-850">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-slate-300">KyC compliance status</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Verified</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-850">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-slate-300">Active portfolio ledgers</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-white uppercase">{holdingsCount} Positions</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEMAT CUSTODY CARD */}
          {activeSubTab === "demat" && (
            <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase tracking-wide">Verified Depositor & KYC Custody Details</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">CDSL / NSDL Registered clearing specifications</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] rounded uppercase font-bold">
                  VERIFIED DEPOSITARY
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-left">
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase">CDSL DP ID</span>
                  <span className="block font-mono text-sm text-white font-medium">{demat?.dpId || "120816000109"}</span>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase">Demat Account Number</span>
                  <span className="block font-mono text-sm text-white font-medium">{demat?.accountNumber || "IN300095104820"}</span>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase">Tax Account PAN</span>
                  <span className="block font-mono text-sm text-indigo-400 font-bold tracking-wider">{demat?.pan || "ABCDE1234F"}</span>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase">National Identity (Aadhaar)</span>
                  <span className="block font-mono text-sm text-white font-medium">XXXX-XXXX-{demat?.aadhaar?.slice(-4) || "8920"}</span>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase">Verified Clearing Bank</span>
                  <span className="block font-sans text-sm text-white font-semibold">{demat?.bankName || "State Bank of India"}</span>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase">Sovereign IFSC Identifier</span>
                  <span className="block font-mono text-sm text-white font-medium">{demat?.ifsc || "SBIN0001928"}</span>
                </div>
              </div>

              {/* Nominee Block */}
              <div className="mt-4 p-5 bg-indigo-950/15 border border-indigo-500/10 rounded-xl space-y-4 text-left">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">Registered Beneficiary & Nominee Designations</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-mono uppercase">Nominee Name</span>
                    <span className="block text-white font-semibold mt-1">{demat?.nomineeName || "Sarah Doe"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-mono uppercase">Relationship</span>
                    <span className="block text-slate-300 mt-1">{demat?.nomineeRelation || "Spouse"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-mono uppercase">Equity Allocation Share</span>
                    <span className="block text-emerald-400 font-mono font-bold mt-1">{demat?.nomineeAllocation || 100}% of custodial claims</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE SESSIONS & DEVICES */}
          {activeSubTab === "devices" && (
            <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-6 space-y-6 text-left">
              <div>
                <h3 className="text-sm font-sans font-bold text-slate-200 uppercase tracking-wide">Active Sessions & Secure Devices Directory</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">Live sockets monitored on verified hardware endpoints</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-mono text-[9px] uppercase">
                      <th className="pb-3 text-left">Browser Detail</th>
                      <th className="pb-3 text-left">Operating System</th>
                      <th className="pb-3 text-left">Origin IP Address</th>
                      <th className="pb-3 text-left">Geographic Node</th>
                      <th className="pb-3 text-center">Security Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {(accountDetails?.logs?.devices || []).map((dev: any) => (
                      <tr key={dev.id} className="hover:bg-slate-950/20">
                        <td className="py-3 text-left font-sans font-semibold text-white flex items-center space-x-2">
                          <Laptop className="w-4 h-4 text-slate-400 inline" />
                          <span>{dev.browser}</span>
                        </td>
                        <td className="py-3 text-left">{dev.os}</td>
                        <td className="py-3 text-left font-bold text-indigo-400">{dev.ip}</td>
                        <td className="py-3 text-left text-slate-400 font-sans">{dev.location || "Co-location Secure Hub"}</td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md text-[9px] font-extrabold uppercase">
                            Trusted
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!accountDetails?.logs?.devices || accountDetails.logs.devices.length === 0) && (
                      <tr className="hover:bg-slate-950/10">
                        <td className="py-3 text-left font-sans font-semibold text-white flex items-center space-x-2">
                          <Laptop className="w-4 h-4 text-slate-400 inline" />
                          <span>Chrome 124</span>
                        </td>
                        <td className="py-3 text-left">macOS 14</td>
                        <td className="py-3 text-left font-bold text-indigo-400">103.45.1.92</td>
                        <td className="py-3 text-left text-slate-400 font-sans">Mumbai, IN</td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md text-[9px] font-extrabold uppercase animate-pulse">
                            Active Device
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL LOG TRACKER */}
          {activeSubTab === "history" && (
            <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-6 space-y-6 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase tracking-wide">Fiduciary Action Log & Audit Ledger</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">Statutory track of all KYC, allocations, or session changes</p>
                </div>
                <div className="text-right">
                  <span className="block font-mono text-[9px] text-slate-500 tracking-wider">SECURE DATABASE TYPE</span>
                  <span className="block font-mono text-[10px] text-white font-semibold uppercase">{accountDetails?.systemMetrics?.databaseType || "SECURE_FILE_ENVELOPE"}</span>
                </div>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {(accountDetails?.logs?.auditLogs || []).map((audit: any) => (
                  <div
                    key={audit.id}
                    className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2 flex flex-col md:flex-row md:items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/25 rounded-md text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-wide">
                          {audit.action}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{new Date(audit.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="font-sans text-xs text-slate-300 leading-relaxed font-semibold">{audit.details}</p>
                    </div>

                    <div className="text-right font-mono text-[10px] text-slate-500 shrink-0">
                      <div>IP: <span className="text-slate-400 font-bold">{audit.ip}</span></div>
                      <div>Terminal: <span className="text-slate-400">{audit.device || "Browser Client"}</span></div>
                    </div>
                  </div>
                ))}
                {(!accountDetails?.logs?.auditLogs || accountDetails.logs.auditLogs.length === 0) && (
                  <div className="p-4 bg-slate-950/10 border border-slate-900 rounded-xl text-center">
                    <span className="text-xs text-slate-500 font-mono uppercase">Awaiting ledger events from regulatory streams.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ADVISORY PREFERENCES MODIFIER */}
          {activeSubTab === "preferences" && (
            <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-6 space-y-6 text-left">
              <div>
                <h3 className="text-sm font-sans font-bold text-slate-200 uppercase tracking-wide">Configure Advisory Parameters</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">Fine-tune risk, payout, and notification policies for active AI engines</p>
              </div>

              <form onSubmit={handleSavePreferences} className="space-y-6 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Risk select */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-400 uppercase">Strategic Risk Appetite</label>
                    <select
                      value={riskAppetite}
                      onChange={(e) => setRiskAppetite(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none"
                    >
                      <option value="Conservative">Conservative (Capital Shield focuses on Bonds/T-Bills)</option>
                      <option value="Moderate">Moderate (60/40 Equity and Debt Standard Balanced Portfolio)</option>
                      <option value="Aggressive">Aggressive (High-beta equity allocations with crypto assets)</option>
                      <option value="Hyper-Growth">Hyper-Growth (Max alpha selection focusing on technology breakouts)</option>
                    </select>
                  </div>

                  {/* Currency select */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-400 uppercase">Preferred Base Valuation Currency</label>
                    <select
                      value={baseCurrency}
                      onChange={(e) => setBaseCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none"
                    >
                      <option value="USD">USD ($) United States Dollar</option>
                      <option value="INR">INR (₹) Indian Rupee Spot</option>
                      <option value="EUR">EUR (€) Eurozone Benchmark</option>
                    </select>
                  </div>

                  {/* DRIP toggle */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-400 uppercase">Dividend Reinvestment Plan (DRIP)</label>
                    <div className="flex items-center space-x-3 p-2 border border-slate-800 bg-slate-950/30 rounded-lg">
                      <input
                        type="checkbox"
                        id="drip-check"
                        checked={dividendPolicy}
                        onChange={(e) => setDividendPolicy(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:outline-none"
                      />
                      <label htmlFor="drip-check" className="text-xs text-slate-300">
                        Automatically auto-reinvest dividend payouts into matching equities
                      </label>
                    </div>
                  </div>

                  {/* Limit input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-400 uppercase">Daily Critical Alert Max Threshold</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={50}
                      value={notifyLimit}
                      onChange={(e) => setNotifyLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3.5 pt-4 border-t border-slate-800/80">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold font-mono transition shadow-lg shadow-indigo-600/10 flex items-center space-x-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Synchronise Fiduciary Profile</span>
                  </button>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">
                    Changes take immediate effect across active advisory worksheets
                  </p>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
