import React, { useState, useEffect, useMemo } from "react";
import {
  UserSession,
  DematAccount,
  Holding,
  Transaction,
  JournalEntry,
} from "./types";
import SplashLanding from "./components/SplashLanding";
import DematModule from "./components/DematModule";
import LiveAdvisor from "./components/LiveAdvisor";
import QuantitativeSuite from "./components/QuantitativeSuite";
import InvestmentJournalComponent from "./components/InvestmentJournalComponent";
import SecurityCenter from "./components/SecurityCenter";

// Real-time upgraded Indian Market Intelligence components
import MarketIntelligence from "./components/MarketIntelligence";
import StockIntelligence from "./components/StockIntelligence";
import SectorRotation from "./components/SectorRotation";
import MarketSentiment from "./components/MarketSentiment";
import MacroDashboard from "./components/MacroDashboard";
import PaperTrading from "./components/PaperTrading";
import PortfolioAudit from "./components/PortfolioAudit";
import AICopilot from "./components/AICopilot";
import AccountHub from "./components/AccountHub";
import AdminPortal from "./components/AdminPortal";

// Interactive Simulation libraries
import {
  initialIndices,
  initialCompanies,
  initialSectors,
  financialNews,
  initialInsiderDeals,
  macroIndicators,
  simulateMarketTick,
  IndexData,
  CompanyData,
  SectorData
} from "./utils/indianMarketSim";

import {
  LayoutDashboard,
  Wallet,
  FileCode,
  Sparkles,
  Award,
  BookOpen,
  LineChart,
  LogOut,
  Bell,
  CheckCircle,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  TriangleAlert,
  ShieldAlert,
  Globe,
  TrendingDown,
  Activity,
  Layers,
  Heart,
  BarChart,
  HelpCircle,
  User
} from "lucide-react";

export default function App() {
  // Session Access Controls
  const [session, setSession] = useState<UserSession>(() => {
    const cached = localStorage.getItem("quantmind_session");
    return cached ? JSON.parse(cached) : { firstName: "", lastName: "", email: "", isLoggedIn: false, role: "ROLE_USER" };
  });

  useEffect(() => {
    localStorage.setItem("quantmind_session", JSON.stringify(session));
  }, [session]);

  const handleLogout = () => {
    setSession({ firstName: "", lastName: "", email: "", isLoggedIn: false, role: "ROLE_USER" });
  };

  // Demat & KYC Registrations
  const [demat, setDemat] = useState<DematAccount>(() => {
    const cached = localStorage.getItem("quantmind_demat");
    return cached ? JSON.parse(cached) : {
      accountNumber: "",
      dpId: "",
      status: "NOT_STARTED",
      kycStatus: "NOT_STARTED",
      pan: "",
      aadhaar: "",
      bankName: "",
      bankAccount: "",
      ifsc: "",
      nomineeName: "",
      nomineeRelation: "Spouse",
      nomineeAllocation: 100,
    };
  });

  useEffect(() => {
    localStorage.setItem("quantmind_demat", JSON.stringify(demat));
  }, [demat]);

  // Holdings Inventory (Seeding deep index metrics)
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    const cached = localStorage.getItem("quantmind_holdings");
    if (cached) return JSON.parse(cached);
    return [
      {
        id: "H1",
        symbol: "NVDA",
        name: "NVIDIA Corp. High-Beta Tech",
        shares: 120,
        avgBuyPrice: 105,
        currentPrice: 121.5,
        allocation: 30,
        sector: "Technology",
      },
      {
        id: "H2",
        symbol: "JPM",
        name: "JPMorgan Chase & Co.",
        shares: 60,
        avgBuyPrice: 165,
        currentPrice: 194.2,
        allocation: 25,
        sector: "Financials",
      },
      {
        id: "H3",
        symbol: "BTC",
        name: "Bitcoin Crypto Liquid Alternative",
        shares: 0.85,
        avgBuyPrice: 58000,
        currentPrice: 65400,
        allocation: 25,
        sector: "Alternatives",
      },
      {
        id: "H4",
        symbol: "SGOV",
        name: "iShares 0-3 Month Treasury ETF",
        shares: 200,
        avgBuyPrice: 100.25,
        currentPrice: 100.4,
        allocation: 20,
        sector: "Alternatives",
      },
    ];
  });

  // Emotional journal archives
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const cached = localStorage.getItem("quantmind_journal");
    if (cached) return JSON.parse(cached);
    return [
      {
        id: "JE-1",
        symbol: "BTC",
        purchasePrice: 64000,
        reason: "Social sentiment trends are highly positive; standard technical metrics crossed the 200-day moving average.",
        expectedOutcome: "Sells at $70,000 within 2 months.",
        confidence: 85,
        emotion: "Excited",
        date: "2026-06-11",
        analysis: {
          fomoScore: 78,
          panicScore: 20,
          overconfidenceScore: 82,
          biasesDetected: ["Trend-Following Bias (FOMO)", "Overconfidence Bias"],
          psychologicalProfile: "Your high reported confidence coupled with green-trend entry signals shows standard momentum seeking. This creates minor recency bias traces.",
          therapeuticAction: "Commit to regular DCA allocations instead of lump-sum entries on breakout days.",
        },
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("quantmind_holdings", JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem("quantmind_journal", JSON.stringify(journalEntries));
  }, [journalEntries]);

  // Alert Queue Log States
  const [alerts, setAlerts] = useState<{ id: string; msg: string; type: "alert" | "system" }[]>([
    { id: "A1", msg: "Demat verification request approved by institutional clearing.", type: "system" },
    { id: "A2", msg: "Volatility warnings: High beta holdings (BTC, NVDA) exceeding portfolio concentration thresholds.", type: "alert" },
    { id: "A3", msg: "System: Core quantitative calculations synchronized.", type: "system" },
  ]);

  // Real-time Simulated Indian Market Data Hooks
  const [indianIndices, setIndianIndices] = useState<IndexData[]>(initialIndices);
  const [indianCompanies, setIndianCompanies] = useState<CompanyData[]>(initialCompanies);
  const [indianSectors, setIndianSectors] = useState<SectorData[]>(initialSectors);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>("RELIANCE");

  // Automated 4-second market ticker task
  useEffect(() => {
    const timer = setInterval(() => {
      const nextTick = simulateMarketTick(indianIndices, indianCompanies, indianSectors);
      setIndianIndices(nextTick.indices);
      setIndianCompanies(nextTick.companies);
      setIndianSectors(nextTick.sectors);
    }, 4000);

    return () => clearInterval(timer);
  }, [indianIndices, indianCompanies, indianSectors]);

  // Tab State Router
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "portfolio"
    | "demat"
    | "advisor"
    | "quantitative"
    | "journal"
    | "indian-market"
    | "stock-analysis"
    | "sector-rotation"
    | "sentiment-deals"
    | "macro-dashboard"
    | "paper-trading"
    | "portfolio-audit"
    | "ai-copilot"
    | "security-center"
    | "account"
    | "admin"
  >("indian-market");

  // Dynamic Portfolio Mathematics
  const totalInvestment = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.shares * h.avgBuyPrice, 0);
  }, [holdings]);

  const totalMarketValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
  }, [holdings]);

  const totalGainLossString = useMemo(() => {
    const val = totalMarketValue - totalInvestment;
    const gainRate = totalInvestment > 0 ? (val / totalInvestment) * 100 : 0;
    return {
      value: val,
      rate: gainRate.toFixed(1),
      isPositive: val >= 0,
    };
  }, [totalInvestment, totalMarketValue]);

  // Calculated active allocations percentage
  const computedHoldings = useMemo(() => {
    return holdings.map((h) => {
      const value = h.shares * h.currentPrice;
      const pct = totalMarketValue > 0 ? (value / totalMarketValue) * 100 : 0;
      return {
        ...h,
        allocation: Number(pct.toFixed(1)),
        value: Number(value.toFixed(2)),
        unrealizedPnl: Number((value - (h.shares * h.avgBuyPrice)).toFixed(2)),
      };
    });
  }, [holdings, totalMarketValue]);

  // Holding update management state
  const [addSym, setAddSym] = useState("");
  const [addName, setAddName] = useState("");
  const [addShares, setAddShares] = useState<number>(10);
  const [addPrice, setAddPrice] = useState<number>(120);
  const [addSector, setAddSector] = useState<any>("Technology");

  const handleCreateHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSym || !addName) return;

    // Check if duplicate symbol exists, update if present, otherwise append
    const duplicateIdx = holdings.findIndex((h) => h.symbol.toUpperCase() === addSym.toUpperCase());

    if (duplicateIdx >= 0) {
      const updated = [...holdings];
      const dup = updated[duplicateIdx];
      const totalCost = (dup.shares * dup.avgBuyPrice) + (addShares * addPrice);
      const newShares = dup.shares + addShares;
      updated[duplicateIdx] = {
        ...dup,
        shares: newShares,
        avgBuyPrice: Number((totalCost / newShares).toFixed(2)),
        currentPrice: addPrice,
      };
      setHoldings(updated);
    } else {
      setHoldings([
        ...holdings,
        {
          id: "H-" + Date.now(),
          symbol: addSym.toUpperCase(),
          name: addName,
          shares: addShares,
          avgBuyPrice: addPrice,
          currentPrice: addPrice,
          allocation: 0,
          sector: addSector,
        },
      ]);
    }

    // Set realalert trigger
    setAlerts((prev) => [
      { id: "A-" + Date.now(), msg: `Alert: Portfolio buy ledger executed for ${addSym.toUpperCase()}. Transaction settled on Clearing.`, type: "system" },
      ...prev,
    ]);

    // reset
    setAddSym("");
    setAddName("");
    setAddShares(10);
    setAddPrice(120);
  };

  const handleDeconstructHolding = (id: string, sym: string) => {
    if (confirm(`Liquidate and sell complete holdings for ${sym}?`)) {
      setHoldings(holdings.filter((h) => h.id !== id));
      setAlerts((prev) => [
        { id: "A-" + Date.now(), msg: `Alert: Liquidated assets under symbol: ${sym}. Proceeding balance converted to settlement cash.`, type: "alert" },
        ...prev,
      ]);
    }
  };

  const handleAddJournalNode = (entry: JournalEntry) => {
    const existingIdx = journalEntries.findIndex((j) => j.id === entry.id);
    if (existingIdx >= 0) {
      const updated = [...journalEntries];
      updated[existingIdx] = entry;
      setJournalEntries(updated);
    } else {
      setJournalEntries([entry, ...journalEntries]);
    }
  };

  if (!session.isLoggedIn) {
    return <SplashLanding onLoginSuccess={(sess) => setSession(sess)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* 1. SOLID SECURE SIDE PANEL */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 shrink-0 flex flex-col justify-between">
        <div className="flex flex-col">
          {/* Logo container */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-2.5 bg-slate-950/20">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] rounded-xl">
              <LineChart className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="block text-sm font-extrabold tracking-tight text-white font-sans">QuantMind AI</span>
              <span className="block text-[8px] text-slate-500 font-mono tracking-widest">WEALTH STACK PRO</span>
            </div>
          </div>

          {/* Navigation Directory list */}
          <nav className="p-4 space-y-4 text-xs overflow-y-auto max-h-[72vh]">
            {/* COMPARTMENT 1: INDIAN MARKET INTELLIGENCE */}
            <div className="space-y-1">
              <span className="block px-3.5 text-[8px] font-mono text-indigo-400 font-extrabold uppercase tracking-widest mb-2.5">
                Indian Market Intelligence
              </span>
              
              <button
                onClick={() => setActiveTab("indian-market")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "indian-market"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-slate-200">Market Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab("stock-analysis")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "stock-analysis"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <LineChart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-200">Equity Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab("sector-rotation")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "sector-rotation"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-200">Sector Rotations</span>
              </button>

              <button
                onClick={() => setActiveTab("sentiment-deals")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "sentiment-deals"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-slate-200">Sentiment & News</span>
              </button>

              <button
                onClick={() => setActiveTab("macro-dashboard")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "macro-dashboard"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="text-slate-200">Macro Indicators</span>
              </button>

              <button
                onClick={() => setActiveTab("paper-trading")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "paper-trading"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span className="text-slate-200">Virtual Trading Desk</span>
              </button>

              <button
                onClick={() => setActiveTab("portfolio-audit")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "portfolio-audit"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="text-slate-200">Investment Audit</span>
              </button>

              <button
                onClick={() => setActiveTab("ai-copilot")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "ai-copilot"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-200">AI Market Copilot</span>
              </button>
            </div>

            {/* COMPARTMENT 2: GLOBAL PORTFOLIO PLATFORM */}
            <div className="space-y-1">
              <span className="block px-3.5 text-[8px] font-mono text-slate-500 font-extrabold uppercase tracking-widest mb-2.5 pt-2 border-t border-slate-800/60">
                Global Portfolio & Advisory
              </span>

              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "dashboard"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-200">Executive Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab("portfolio")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "portfolio"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-200">Holdings & Ledgers</span>
              </button>

              <button
                onClick={() => setActiveTab("demat")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "demat"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <Award className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-200">Demat Account KYC</span>
              </button>

              <button
                onClick={() => setActiveTab("advisor")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "advisor"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-200">Fiduciary AI Advisor</span>
              </button>

              <button
                onClick={() => setActiveTab("quantitative")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "quantitative"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <LineChart className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-200">Quantitative Engines</span>
              </button>

              <button
                onClick={() => setActiveTab("journal")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg transition text-left font-sans ${
                  activeTab === "journal"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-200">Behavioral Finance</span>
              </button>
            </div>

            {/* COMPARTMENT 3: CLIENT CUSTODIAN PROFILE */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <span className="block px-3.5 text-[8px] font-mono text-slate-500 font-extrabold uppercase tracking-widest mb-2.5">
                Client Hub & Integrity
              </span>

              <button
                onClick={() => setActiveTab("account")}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition text-left font-sans ${
                  activeTab === "account"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold scale-[1.02]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                <span>Central Account Hub</span>
              </button>

              <button
                onClick={() => setActiveTab("security-center")}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition text-left font-sans ${
                  activeTab === "security-center"
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.25)] font-semibold"
                    : "text-slate-500 hover:text-indigo-300 hover:bg-slate-800/40"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Security Vault Center</span>
              </button>

              {session.role === "ROLE_ADMIN" && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition text-left font-sans ${
                    activeTab === "admin"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_-4px_rgba(244,63,94,0.25)] font-semibold scale-[1.02]"
                      : "text-slate-500 hover:text-rose-400 hover:bg-slate-800/40"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Admin Command Portal</span>
                </button>
              )}
            </div>
          </nav>
        </div>

        {/* User Identity Footer */}
        <div className="p-4 border-t border-slate-800 flex flex-col space-y-3 bg-slate-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-400 text-xs">
              JD
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs text-white font-semibold truncate leading-tight">{session.firstName} {session.lastName}</span>
              <span className="block text-[9px] text-slate-500 font-mono truncate">{session.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-1.5 border border-slate-800 hover:bg-red-950/20 hover:border-red-500/20 hover:text-red-400 text-slate-500 text-[10px] font-mono rounded flex items-center justify-center space-x-1.5 transition"
          >
            <LogOut className="w-3 h-3" />
            <span>DISCONNECT PORTAL</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION PLATFORM SHELL */}
      <main className="flex-1 flex flex-col overflow-auto bg-slate-950/40 relative">
        {/* Core Header with live alert warnings */}
        <header className="border-b border-slate-800 px-8 py-5 flex items-center justify-between bg-slate-900/10 backdrop-blur-sm z-30 sticky top-0">
          <div>
            <h1 className="text-xl font-sans font-bold tracking-tight text-white capitalize">{activeTab} Framework Console</h1>
            <p className="text-slate-500 text-[10px] font-mono mt-0.5 uppercase">SECURE INSTITUTIONAL CLOUD ACCESS // TRADING SYSTEMS STACK</p>
          </div>

          <div className="flex items-center space-x-6">
            <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SECURE ENDPOINT OK</span>
            </span>
            <div className="text-xs text-slate-400 font-semibold font-mono flex items-center space-x-2 bg-slate-900/60 border border-slate-850 px-3 py-1.5 rounded-lg text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Demat: {demat.status === "VERIFIED" ? "Verified" : "Action Required"}</span>
            </div>
          </div>
        </header>

        {/* 3. SCROLLABLE TAB INTERFACE SWITCHBOARD */}
        <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">

          {/* TAB: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Core Wealth Stat Overview Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-slate-800/80 bg-slate-900/40 rounded-xl p-5 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Net Assets Under Custody</span>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-3xl text-white font-sans font-bold">${totalMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-xs font-mono text-emerald-400 font-medium">USD</span>
                  </div>
                </div>

                <div className="border border-slate-800/80 bg-slate-900/40 rounded-xl p-5 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Initial Verified Principal Capital</span>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-3xl text-slate-300 font-sans font-bold">${totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-xs font-mono text-slate-500 font-medium">USD</span>
                  </div>
                </div>

                <div className="border border-slate-800/80 bg-slate-900/40 rounded-xl p-5 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block font-sans">Accumulated Alpha Yield (P/L)</span>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className={`text-3xl font-sans font-bold ${totalGainLossString.isPositive ? "text-emerald-400" : "text-red-400"}`}>
                      {totalGainLossString.isPositive ? "+" : ""}${totalGainLossString.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-mono font-medium ${totalGainLossString.isPositive ? "text-emerald-500" : "text-red-500"}`}>
                      ({totalGainLossString.rate}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Grid: Split between current listings table and quick transactional alert queue */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Active holdings ledger table snippet */}
                <div className="lg:col-span-8 border border-slate-800 bg-slate-900/20 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-semibold font-sans text-slate-200">Active Asset Allocations (Real-time prices)</h3>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] text-left">
                          <th className="pb-3 uppercase">Asset Symbol/Name</th>
                          <th className="pb-3 text-right uppercase">Shares</th>
                          <th className="pb-3 text-right uppercase">Avg Cost</th>
                          <th className="pb-3 text-right uppercase">Live Quote</th>
                          <th className="pb-3 text-right uppercase">Valuation</th>
                          <th className="pb-3 text-right uppercase">Allocation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {computedHoldings.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-950/20 transition">
                            <td className="py-3 font-sans">
                              <span className="block font-bold text-white font-mono">{h.symbol}</span>
                              <span className="block text-[10px] text-slate-500 leading-tight">{h.name}</span>
                            </td>
                            <td className="py-3 text-right font-mono">{h.shares.toLocaleString()}</td>
                            <td className="py-3 text-right font-mono">${h.avgBuyPrice.toLocaleString()}</td>
                            <td className="py-3 text-right font-mono">${h.currentPrice.toLocaleString()}</td>
                            <td className="py-3 text-right font-mono text-white font-medium">${h.value.toLocaleString()}</td>
                            <td className="py-3 text-right font-mono font-bold text-indigo-400">{h.allocation}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live event notification feeds */}
                <div className="lg:col-span-4 border border-slate-800/80 bg-slate-900/40 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span>Real-Time Risk Alerts Queue</span>
                  </h3>

                  <div className="space-y-3">
                    {alerts.map((al) => (
                      <div
                        key={al.id}
                        className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
                          al.type === "alert"
                            ? "bg-red-950/15 border-red-500/20 text-red-200"
                            : "bg-slate-950/40 border-slate-800 text-slate-300"
                        }`}
                      >
                        {al.type === "alert" ? (
                          <TriangleAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        )}
                        <p className="font-sans leading-relaxed text-[11px]">{al.msg}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fiduciary Compliance checklist */}
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex flex-col md:flex-row items-baseline justify-between gap-2.5">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-300">Awaiting Regulatory Demat Verification Document Upload?</span>
                </div>
                <button
                  onClick={() => setActiveTab("demat")}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] rounded transition"
                >
                  LINK CUSTODY LEDGERS NOW
                </button>
              </div>

            </div>
          )}

          {/* TAB: PORTFOLIO HOLDINGS */}
          {activeTab === "portfolio" && (
            <div className="space-y-8">
              {/* Asset modifier ledger */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form to add/update holdings */}
                <div className="lg:col-span-4 border border-slate-800 bg-slate-900/20 rounded-xl p-6">
                  <h3 className="text-sm font-semibold font-sans text-slate-200 mb-4">Execute Position Order Voucher</h3>
                  
                  <form onSubmit={handleCreateHolding} className="space-y-4 font-sans text-xs">
                    <div>
                      <label className="block text-slate-400 text-xs font-mono mb-1.5">Asset Symbol Code</label>
                      <input
                        type="text"
                        required
                        value={addSym}
                        onChange={(e) => setAddSym(e.target.value)}
                        placeholder="e.g. NVDA, JPM, APPLE"
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none placeholder-slate-700 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs font-mono mb-1.5">Asset Long Description</label>
                      <input
                        type="text"
                        required
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        placeholder="Legal entity description"
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none placeholder-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 text-xs font-mono mb-1.5">Order Shares (Units)</label>
                        <input
                          type="number"
                          required
                          min={0.01}
                          step={0.01}
                          value={addShares}
                          onChange={(e) => setAddShares(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-mono mb-1.5">Settlement Price ($)</label>
                        <input
                          type="number"
                          required
                          min={0.01}
                          step={0.01}
                          value={addPrice}
                          onChange={(e) => setAddPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs font-mono mb-1.5">Industry Sector Allocation</label>
                      <select
                        value={addSector}
                        onChange={(e) => setAddSector(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none"
                      >
                        <option value="Technology">Technology (Software & Hardware)</option>
                        <option value="Financials">Financials & Investment Banking</option>
                        <option value="Healthcare">Healthcare & BioTech</option>
                        <option value="Consumer Goods">Consumer Defensives / Retail</option>
                        <option value="Energy">Energy Futures / Commodities</option>
                        <option value="Alternatives">Alternatives / Crypto Hedges</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold font-mono transition shadow-sm flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Settle Order Transaction</span>
                    </button>
                  </form>
                </div>

                {/* holdings ledger detailing deletion option */}
                <div className="lg:col-span-8 border border-slate-800 bg-slate-900/20 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-slate-200 mb-4">Complete Portfolio Inventory Ledger</h3>
                  
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] text-left">
                          <th className="pb-3">SYMBOL</th>
                          <th className="pb-3 text-right">TOTAL SHARES</th>
                          <th className="pb-3 text-right">AVG ACQUISITION VALUE</th>
                          <th className="pb-3 text-right">TOTAL INVESTED</th>
                          <th className="pb-3 text-right">UNREALIZED PROFIT / LOSS</th>
                          <th className="pb-3 text-center">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {computedHoldings.map((h) => {
                          const invested = h.shares * h.avgBuyPrice;
                          const pnl = h.value - invested;
                          const isPos = pnl >= 0;
                          return (
                            <tr key={h.id} className="hover:bg-slate-950/20 transition">
                              <td className="py-3 font-sans">
                                <span className="block font-bold text-white font-mono">{h.symbol}</span>
                                <span className="block text-[10px] text-slate-500">{h.name}</span>
                              </td>
                              <td className="py-3 text-right font-mono">{h.shares.toLocaleString()}</td>
                              <td className="py-3 text-right font-mono">${h.avgBuyPrice.toLocaleString()}</td>
                              <td className="py-3 text-right font-mono">${invested.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                              <td className={`py-3 text-right font-mono font-medium ${isPos ? "text-emerald-400" : "text-red-400"}`}>
                                {isPos ? "+" : ""}${pnl.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                              </td>
                              <td className="py-3 text-center">
                                <button
                                  onClick={() => handleDeconstructHolding(h.id, h.symbol)}
                                  className="p-1 hover:bg-red-950/20 text-slate-600 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: LIVE INDIAN MARKET DASHBOARD */}
          {activeTab === "indian-market" && (
            <MarketIntelligence
              indices={indianIndices}
              companies={indianCompanies}
              onSelectCompany={(sym) => {
                setSelectedStockSymbol(sym);
                setActiveTab("stock-analysis");
              }}
            />
          )}

          {/* TAB: STOCK ANALYSIS / EQUITY ANALYTICS */}
          {activeTab === "stock-analysis" && (
            <StockIntelligence
              companies={indianCompanies}
              selectedSymbol={selectedStockSymbol}
              onSelectCompany={setSelectedStockSymbol}
            />
          )}

          {/* TAB: SECTOR ROTATIONS */}
          {activeTab === "sector-rotation" && (
            <SectorRotation sectors={indianSectors} />
          )}

          {/* TAB: SENTIMENT & NEWS */}
          {activeTab === "sentiment-deals" && (
            <MarketSentiment news={financialNews} insiderDeals={initialInsiderDeals} />
          )}

          {/* TAB: MACRO ECONOMIC DASHBOARD */}
          {activeTab === "macro-dashboard" && (
            <MacroDashboard indicators={macroIndicators} />
          )}

          {/* TAB: PAPER TRADING DESK */}
          {activeTab === "paper-trading" && (
            <PaperTrading companies={indianCompanies} />
          )}

          {/* TAB: PORTFOLIO RISK AUDIT */}
          {activeTab === "portfolio-audit" && (
            <PortfolioAudit holdings={holdings} portfolioValue={totalMarketValue} />
          )}

          {/* TAB: AI MARKET COPILOT */}
          {activeTab === "ai-copilot" && (
            <AICopilot />
          )}

          {/* TAB: DEMAT ACCOUNT SETUP */}
          {activeTab === "demat" && (
            <DematModule demat={demat} onUpdateDemat={(d) => setDemat(d)} />
          )}

          {/* TAB: AI FINANCIAL ADVISOR */}
          {activeTab === "advisor" && (
            <LiveAdvisor holdings={holdings} portfolioValue={totalMarketValue} />
          )}

          {/* TAB: QUANTITATIVE SUITE */}
          {activeTab === "quantitative" && (
            <QuantitativeSuite holdings={holdings} />
          )}

          {/* TAB: INVESTMENT MENTAL JOURNAL */}
          {activeTab === "journal" && (
            <InvestmentJournalComponent
              journalEntries={journalEntries}
              onAddJournalEntry={handleAddJournalNode}
            />
          )}

          {/* TAB: SECURE COMPLIANCE CENTER */}
          {activeTab === "security-center" && (
            <SecurityCenter
              session={session}
              onLogout={handleLogout}
              onSessionUpdate={(updated) => setSession(updated)}
            />
          )}

          {/* TAB: CENTRAL CLIENT ACCOUNT HUB */}
          {activeTab === "account" && (
            <AccountHub
              session={session}
              onSessionUpdate={(updated) => setSession(updated)}
              demat={demat}
              onUpdateDemat={(d) => setDemat(d)}
              holdingsCount={holdings.length}
              portfolioValue={totalMarketValue}
            />
          )}

          {/* TAB: CENTRAL ADMINISTRATIVE COMMAND PORTAL */}
          {activeTab === "admin" && (
            <AdminPortal
              session={session}
            />
          )}

        </div>
      </main>
    </div>
  );
}
