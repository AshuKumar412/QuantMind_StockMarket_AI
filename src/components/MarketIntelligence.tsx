import React, { useState, useEffect, useMemo } from "react";
import { IndexData, CompanyData } from "../utils/indianMarketSim";
import { TrendingUp, TrendingDown, RefreshCw, BarChart2, Activity, Zap, Layers, Sparkles, AlertTriangle } from "lucide-react";

interface Props {
  indices: IndexData[];
  companies: CompanyData[];
  onSelectCompany?: (symbol: string) => void;
}

interface BriefingData {
  briefingTitle: string;
  analystCommentary: string;
  sentimentState: string;
  hotSector: string;
  macroCoreTakeaway: string;
  riskAlertAdvice: string;
  isSimulated?: boolean;
}

export default function MarketIntelligence({ indices, companies, onSelectCompany }: Props) {
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState<boolean>(false);
  const [briefingError, setBriefingError] = useState<string>("");
  // Compute Top Gainers
  const topGainers = useMemo(() => {
    return [...companies]
      .sort((a, b) => b.pctChange - a.pctChange)
      .slice(0, 5);
  }, [companies]);

  // Compute Top Losers
  const topLosers = useMemo(() => {
    return [...companies]
      .sort((a, b) => a.pctChange - b.pctChange)
      .slice(0, 5);
  }, [companies]);

  // Compute Highest Volume
  const activeVolume = useMemo(() => {
    return [...companies]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  }, [companies]);

  // Compute Highest Delivery Percentage (Strong Long position accumulation indicator)
  const highDelivery = useMemo(() => {
    return [...companies]
      .sort((a, b) => b.deliveryPct - a.deliveryPct)
      .slice(0, 5);
  }, [companies]);

  // Compute Market Breadth (Nifty gainers vs losers ratio)
  const breadth = useMemo(() => {
    let advances = 0;
    let declines = 0;
    companies.forEach((c) => {
      if (c.change >= 0) advances++;
      else declines++;
    });
    const total = advances + declines;
    const advPct = total > 0 ? (advances / total) * 100 : 50;
    return { advances, declines, advPct };
  }, [companies]);

  const fetchBriefing = async () => {
    setLoadingBriefing(true);
    setBriefingError("");
    try {
      const response = await fetch("/api/market/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indices: indices.map(idx => ({ name: idx.name, value: idx.value, change: idx.change, pctChange: idx.pctChange })),
          breadth,
          gainers: topGainers.map(g => ({ symbol: g.symbol, pctChange: g.pctChange, price: g.price })),
          losers: topLosers.map(l => ({ symbol: l.symbol, pctChange: l.pctChange, price: l.price }))
        })
      });
      const data = await response.json();
      if (data.success) {
        setBriefing(data);
      } else {
        throw new Error(data.error || "Failed to load active market briefing.");
      }
    } catch (err: any) {
      console.error(err);
      setBriefingError(err?.message || "Could not connect to Goldman Sachs market intelligence node.");
    } finally {
      setLoadingBriefing(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  return (
    <div className="space-y-6" id="indian-market-dashboard">
      {/* INSTITUTIONAL RESEARCH BRIEFING HEADER */}
      <div className="border border-indigo-500/15 bg-slate-950/40 rounded-xl p-5 relative overflow-hidden" id="morning-intelligence-briefing">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 pb-3.5 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="block text-[8px] text-indigo-400 font-mono tracking-wider uppercase font-extrabold">Goldman Sachs Research Node</span>
                {briefing?.isSimulated && (
                  <span className="text-[7px] text-slate-500 font-mono bg-slate-800/40 px-1 py-0.2 rounded">SIMULATION ACTIVE</span>
                )}
              </div>
              <h3 className="text-xs font-semibold text-slate-200">Institutional Fiduciary Intelligence Briefing</h3>
            </div>
          </div>
          
          <button
            onClick={fetchBriefing}
            disabled={loadingBriefing}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg text-[10px] text-indigo-450 font-semibold hover:bg-indigo-600/20 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loadingBriefing ? "animate-spin" : ""}`} />
            <span>{loadingBriefing ? "Compiling Outlook..." : "Re-Compile Intel Memo"}</span>
          </button>
        </div>

        {loadingBriefing && !briefing ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Retrieving Advanced Mathematical Analysis...</span>
          </div>
        ) : briefingError ? (
          <div className="py-5 flex items-start space-x-3 text-xs text-red-400 bg-red-950/10 border border-red-900/20 p-3.5 rounded-lg mt-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Fiduciary Node Incomplete Link</p>
              <p className="text-[10px] text-slate-500 mt-1">{briefingError}</p>
            </div>
          </div>
        ) : briefing ? (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
            {/* Analyst commentary column */}
            <div className="lg:col-span-8 space-y-3.5 pr-0 lg:pr-5 border-b lg:border-b-0 lg:border-r border-slate-800/60 pb-4 lg:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:space-x-3 pb-2.5 gap-2 border-b border-slate-900">
                <h4 className="text-sm font-bold text-slate-105 tracking-tight leading-snug font-sans">
                  {briefing.briefingTitle}
                </h4>
                
                {/* Sentiment pill */}
                <div className="flex items-center self-start sm:self-auto">
                  <span className={`text-[9px] font-bold font-mono px-2.5 py-1 rounded border min-w-[120px] text-center ${
                    briefing.sentimentState.includes("BULLISH") 
                      ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                      : briefing.sentimentState.includes("CAUTIOUS") || briefing.sentimentState.includes("LIQUIDATION")
                      ? "bg-amber-950/20 border-amber-500/20 text-amber-400"
                      : "bg-slate-800/40 border-slate-700/40 text-slate-400"
                  }`}>
                    {briefing.sentimentState}
                  </span>
                </div>
              </div>
              
              <div className="text-slate-300 leading-relaxed space-y-3 text-[11px] font-sans">
                {briefing.analystCommentary.split("\n\n").map((para, i) => {
                  const hasBullets = para.includes("\n*") || para.includes("\n-") || para.startsWith("*") || para.startsWith("-");
                  if (hasBullets) {
                    const lines = para.split("\n").filter(l => l.trim() !== "");
                    return (
                      <ul key={i} className="list-disc pl-4 space-y-1.5 text-slate-300 my-2">
                        {lines.map((line, j) => {
                          const cleanedLine = line.replace(/^[\*\-]\s+/, "");
                          // Parse bold markers ** inside lines
                          const boldParts = cleanedLine.split("**");
                          return (
                            <li key={j} className="text-slate-300">
                              {boldParts.map((part, k) => (
                                k % 2 === 1 ? <strong key={k} className="text-slate-100 font-semibold">{part}</strong> : part
                              ))}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }
                  
                  // Paragraph parsing bold markers **
                  const boldParts = para.split("**");
                  return (
                    <p key={i} className="text-slate-300">
                      {boldParts.map((part, k) => (
                        k % 2 === 1 ? <strong key={k} className="text-slate-100 font-semibold">{part}</strong> : part
                      ))}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Tactical stats column */}
            <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* Hot Sector Segment */}
                <div className="bg-slate-900/30 border border-slate-850 p-3 rounded-lg">
                  <span className="block text-[8px] text-slate-500 font-mono uppercase font-bold tracking-wider mb-1.5">Sector Cash Money Flow</span>
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Layers className="w-4 h-4 shrink-0 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200">{briefing.hotSector}</span>
                  </div>
                </div>

                {/* Macro Takeaway */}
                <div className="bg-slate-900/30 border border-slate-850 p-3 rounded-lg">
                  <span className="block text-[8px] text-slate-500 font-mono uppercase font-bold tracking-wider mb-1.5">Macro Economic Anchor</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{briefing.macroCoreTakeaway}</p>
                </div>

                {/* Specific Risk Assessment */}
                <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
                  <div className="flex items-center space-x-1.5 text-amber-400 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="block text-[8px] font-mono uppercase font-extrabold tracking-wider">Tactical Vulnerability Shield</span>
                  </div>
                  <p className="text-[11px] text-amber-305 leading-relaxed">{briefing.riskAlertAdvice}</p>
                </div>
              </div>

              {/* Advisory stamp */}
              <div className="border-t border-slate-800/40 pt-2 text-[8px] text-slate-500 font-mono flex justify-between items-center bg-slate-950/10 px-1 mt-3">
                <span>RESEARCH UNIT #482</span>
                <span className="text-slate-600">ALPHA QUANT DESK</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 bg-slate-900/20 border border-slate-850 rounded-lg mt-3">
            <span className="text-[10px] text-slate-500 font-mono">NO ACTIVE INTELLIGENCE REPORT RETRIEVED</span>
            <button
              onClick={fetchBriefing}
              className="text-[10px] text-indigo-400 underline font-mono hover:text-indigo-300 cursor-pointer"
            >
              COMPILE LIVE MEMO
            </button>
          </div>
        )}
      </div>

      {/* 1. INDICES GRID HEADERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {indices.map((idx) => {
          const isPos = idx.change >= 0;
          return (
            <div
              key={idx.symbol}
              className="border border-slate-800/85 bg-slate-900/40 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition shadow-sm"
              id={`index-card-${idx.symbol}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-500 font-mono tracking-wider">
                    {idx.name}
                  </span>
                  <span className="text-xl font-bold font-sans text-white tracking-tight mt-1 block">
                    {idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={`flex items-center space-x-1 px-2.5 py-1 rounded font-mono text-[11px] font-semibold ${
                  isPos ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                }`}>
                  {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{isPos ? "+" : ""}{idx.pctChange}%</span>
                </div>
              </div>

              {/* Sparkline mini-visual of index */}
              <div className="h-10 mt-4 flex items-end">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path
                    d={idx.chartData
                      .map((val, i) => {
                        const min = Math.min(...idx.chartData);
                        const max = Math.max(...idx.chartData);
                        const range = max - min || 1;
                        const x = (i / (idx.chartData.length - 1)) * 100;
                        const y = 40 - ((val - min) / range) * 32 - 4;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke={isPos ? "#10b981" : "#f43f5e"}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2 border-t border-slate-800/50 pt-2">
                <span>H: {idx.high.toLocaleString()}</span>
                <span>L: {idx.low.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. MARKET BREADTH BAR */}
      <div className="border border-slate-800/80 bg-slate-900/30 rounded-xl p-5" id="market-breadth-section">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">Systemic Market Breadth (NSE Segment)</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono uppercase">
            {breadth.advances} Advances / {breadth.declines} Declines
          </span>
        </div>
        
        {/* Progress tracks */}
        <div className="w-full bg-red-500/20 h-3.5 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${breadth.advPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5">
          <span className="text-emerald-400 font-semibold">{breadth.advPct.toFixed(0)}% Buying Power</span>
          <span className="text-red-400 font-semibold">{(100 - breadth.advPct).toFixed(0)}% Selling Pressure</span>
        </div>
      </div>

      {/* 3. CORE TAXONOMY TICKER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Heatmap (Left Column) */}
        <div className="lg:col-span-7 border border-slate-800 bg-slate-900/30 rounded-xl p-5 space-y-4" id="market-heatmap-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>NIFTY Elite Multi-Sector Heatmap</span>
            </h3>
            <span className="text-[9px] text-slate-500 font-mono">CAP-WEIGHTED SECTORS</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
            {companies.map((c) => {
              const isPos = c.change >= 0;
              // Size based on market cap simulation log differences
              const scaleClass = c.marketCapCr > 1000000 ? "col-span-2 row-span-1" : "col-span-1";
              
              // Color scale depending on pctChange size
              let colorClass = "bg-slate-900 border-slate-800 text-slate-400";
              if (c.pctChange > 1.5) colorClass = "bg-emerald-950/40 border-emerald-500/40 text-emerald-300";
              else if (c.pctChange > 0) colorClass = "bg-emerald-950/20 border-emerald-500/20 text-emerald-400";
              else if (c.pctChange < -1.5) colorClass = "bg-red-950/40 border-red-500/40 text-red-300";
              else if (c.pctChange < 0) colorClass = "bg-red-950/20 border-red-500/20 text-red-400";

              return (
                <div
                  key={c.symbol}
                  onClick={() => onSelectCompany && onSelectCompany(c.symbol)}
                  className={`border p-3 rounded-lg cursor-pointer transition hover:scale-[1.02] ${scaleClass} ${colorClass} flex flex-col justify-between`}
                >
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs font-mono">{c.symbol}</span>
                    <span className="text-[10px] opacity-75 truncate max-w-[50px]">{c.sector.split(" ")[0]}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-baseline">
                    <span className="text-xs font-semibold">₹{c.price.toFixed(1)}</span>
                    <span className="text-[10px] font-mono leading-none">
                      {isPos ? "+" : ""}{c.pctChange}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Leaders (Right Column) */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-4" id="market-leaders-panel">
          {/* Top Gainers & Losers Tabbed Box */}
          <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Momentum Extremists (Top Gainers / Losers)</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Gainers side */}
              <div className="space-y-2">
                <span className="block text-[10px] font-mono text-emerald-400 border-b border-emerald-950 pb-1 uppercase font-bold">Top Gainers</span>
                {topGainers.map((g) => (
                  <div
                    key={g.symbol}
                    onClick={() => onSelectCompany && onSelectCompany(g.symbol)}
                    className="flex justify-between items-center p-2 rounded hover:bg-slate-900/60 cursor-pointer text-xs"
                  >
                    <div>
                      <span className="font-semibold block font-mono text-white text-[11px]">{g.symbol}</span>
                      <span className="text-[9px] text-slate-500 truncate block max-w-[80px]">{g.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">+{g.pctChange}%</span>
                  </div>
                ))}
              </div>

              {/* Losers side */}
              <div className="space-y-2">
                <span className="block text-[10px] font-mono text-red-400 border-b border-red-950 pb-1 uppercase font-bold">Top Losers</span>
                {topLosers.map((l) => (
                  <div
                    key={l.symbol}
                    onClick={() => onSelectCompany && onSelectCompany(l.symbol)}
                    className="flex justify-between items-center p-2 rounded hover:bg-slate-900/60 cursor-pointer text-xs"
                  >
                    <div>
                      <span className="font-semibold block font-mono text-white text-[11px]">{l.symbol}</span>
                      <span className="text-[9px] text-slate-500 truncate block max-w-[80px]">{l.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-red-400 font-bold">{l.pctChange}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DETAILS ON VOLUME & DELIVERY RATIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="volume-delivery-widgets">
        {/* Most Active Stocks */}
        <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Volume Liquidity Leaders (Most Active)</span>
          </h3>
          <div className="space-y-2.5">
            {activeVolume.map((c) => {
              const capIndexCr = c.volume.toLocaleString();
              return (
                <div
                  key={c.symbol}
                  onClick={() => onSelectCompany && onSelectCompany(c.symbol)}
                  className="flex items-center justify-between p-2.5 rounded bg-slate-900/40 border border-slate-850 hover:bg-slate-800/30 cursor-pointer transition text-xs"
                >
                  <div>
                    <span className="font-bold text-white font-mono">{c.symbol}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5 uppercase font-mono">{c.sector}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono font-semibold text-slate-300">{capIndexCr} Trades</span>
                    <span className="text-[9px] text-slate-500 font-mono">Live Session Triggers</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Highest Delivery Percentage */}
        <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Institutional Delivery Accumulation Ratio</span>
          </h3>
          <div className="space-y-2.5">
            {highDelivery.map((c) => {
              return (
                <div
                  key={c.symbol}
                  onClick={() => onSelectCompany && onSelectCompany(c.symbol)}
                  className="flex items-center justify-between p-2.5 rounded bg-slate-900/40 border border-slate-850 hover:bg-slate-800/30 cursor-pointer transition text-xs"
                >
                  <div>
                    <span className="font-bold text-white font-mono">{c.symbol}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">{c.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline space-x-1 justify-end">
                      <span className="font-mono font-extrabold text-emerald-400">{c.deliveryPct}%</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">Delivery Delivery-to-Trade</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
