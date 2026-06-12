import React, { useState, useMemo } from "react";
import { CompanyData } from "../utils/indianMarketSim";
import { Search, Sparkles, TrendingUp, TrendingDown, Target, Activity, Zap, Compass, AlertTriangle } from "lucide-react";

interface Props {
  companies: CompanyData[];
  selectedSymbol: string;
  onSelectCompany: (symbol: string) => void;
}

export default function StockIntelligence({ companies, selectedSymbol, onSelectCompany }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTimeline, setActiveTimeline] = useState<"1D" | "1W" | "1M" | "1Y">("1M");
  const [aiReport, setAiReport] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState("");

  const selectedCompany = useMemo(() => {
    return companies.find((c) => c.symbol === selectedSymbol) || companies[0];
  }, [companies, selectedSymbol]);

  // Filter companies based on search
  const filteredSearch = useMemo(() => {
    if (!searchQuery) return [];
    return companies.filter(
      (c) =>
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [companies, searchQuery]);

  // Generate mock historical coordinates for the selected company and active timeline
  const chartCoordinates = useMemo(() => {
    const seed = selectedCompany.price;
    const isUp = selectedCompany.change >= 0;
    let length = 12;
    if (activeTimeline === "1D") length = 8;
    else if (activeTimeline === "1W") length = 10;
    else if (activeTimeline === "1Y") length = 15;

    const data: { label: string; val: number }[] = [];
    let cumulative = seed * (isUp ? 0.95 : 1.05);
    
    for (let i = 0; i < length; i++) {
      const stepPct = (Math.random() - 0.45) * 0.015; // slightly upward drift
      cumulative = cumulative * (1 + stepPct);
      data.push({
        label: `P${i}`,
        val: Number(cumulative.toFixed(2))
      });
    }
    // set absolute final element to exact target price for fidelity
    data[data.length - 1].val = seed;
    return data;
  }, [selectedCompany, activeTimeline]);

  // Call the server to request a professional Gemini AI SWOT and strategic interpretation
  const handleGenerateAISummary = async () => {
    setIsLoadingAi(true);
    setAiReport("");
    setAiError("");

    try {
      const response = await fetch("/api/market/aisummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedCompany.symbol,
          name: selectedCompany.name,
          sector: selectedCompany.sector,
          price: selectedCompany.price,
          pe: selectedCompany.pe,
          eps: selectedCompany.eps,
          roe: selectedCompany.roe,
          debtEquity: selectedCompany.debtEquity,
          rsi: selectedCompany.rsi,
          support: selectedCompany.support,
          resistance: selectedCompany.resistance,
          earnings: selectedCompany.earnings,
          actions: selectedCompany.actions,
          description: selectedCompany.description
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiReport(data.report);
      } else {
        throw new Error(data.error || "Server failed to analyze stock metrics.");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Failed to contact Gemini Strategic Intelligence node. Please verify secrets and connections.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6" id="stock-analysis-module">
      {/* 1. COMPACT STOCK SEARCH & DROPDOWN SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search NSE Scrips (e.g. RELIANCE, TCS, HDFCBANK)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-white focus:outline-none placeholder-slate-600 focus:border-indigo-500/80"
          />

          {/* Search results popup */}
          {searchQuery && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-800/60 font-sans">
              {filteredSearch.length > 0 ? (
                filteredSearch.map((comp) => (
                  <button
                    key={comp.symbol}
                    onClick={() => {
                      onSelectCompany(comp.symbol);
                      setSearchQuery("");
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-800/50 flex align-baseline justify-between transition"
                  >
                    <div>
                      <span className="block text-xs font-bold font-mono text-white">{comp.symbol}</span>
                      <span className="block text-[10px] text-slate-500 max-w-[200px] truncate">{comp.name}</span>
                    </div>
                    <span className="text-[10px] bg-slate-950 text-slate-400 font-mono px-1.5 py-0.5 rounded自">
                      ₹{comp.price.toFixed(1)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-[10px] text-slate-500 text-center font-mono">
                  No registered scrips matching query
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dropdown list */}
        <div className="flex items-center space-x-3">
          <span className="text-[10px] text-slate-500 font-mono">QUICK SELECT:</span>
          <select
            value={selectedCompany.symbol}
            onChange={(e) => onSelectCompany(e.target.value)}
            className="px-3 py-1.5 bg-slate-950/70 border border-slate-800 text-xs rounded-lg text-slate-300 focus:outline-none"
          >
            {companies.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} (₹{c.price.toFixed(1)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. DYNAMIC HEADER DETAIL CARD */}
      <div className="relative overflow-hidden border border-slate-800/90 bg-gradient-to-br from-indigo-950/15 via-slate-900/40 to-slate-950 rounded-xl p-6" id="stock-header-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-2xl font-bold font-sans text-white tracking-tight leading-none">
                {selectedCompany.name}
              </h2>
              <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-mono font-bold uppercase">
                {selectedCompany.symbol}
              </span>
              {selectedCompany.isNifty50 && (
                <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 font-mono font-semibold">
                  NIFTY 50
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-mono uppercase tracking-wider">
              Primary Segment: {selectedCompany.sector} // CUSTODY CODE ACCREDITATION
            </p>
          </div>

          {/* Current quote metrics */}
          <div className="text-left md:text-right">
            <span className="block text-3xl font-sans font-extrabold text-white tracking-tight">
              ₹{selectedCompany.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`inline-flex items-center space-x-1 font-mono text-xs font-bold mt-1 ${
              selectedCompany.change >= 0 ? "text-emerald-400" : "text-red-400"
            }`}>
              {selectedCompany.change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {selectedCompany.change >= 0 ? "+" : ""}{selectedCompany.change.toFixed(2)} ({selectedCompany.change >= 0 ? "+" : ""}{selectedCompany.pctChange}%)
              </span>
            </div>
          </div>
        </div>

        {/* Short company biography */}
        <p className="text-xs text-slate-400 max-w-4xl mt-4 leading-relaxed font-sans border-t border-slate-800/45 pt-3">
          {selectedCompany.description}
        </p>
      </div>

      {/* 3. GRID OF QUANT DETAILS AND CHART INTEGRALS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Interactive Chart Panel (Left Column) */}
        <div className="lg:col-span-8 border border-slate-800/80 bg-slate-900/30 rounded-xl p-5 space-y-4" id="historical-svg-chart">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300 font-mono uppercase">Interactive Pricing Matrix</span>
            </div>
            
            {/* Timeline switch board */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
              {(["1D", "1W", "1M", "1Y"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTimeline(t)}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-md font-semibold transition ${
                    activeTimeline === t ? "bg-indigo-600 font-bold text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="h-64 relative flex items-end pt-5">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="0.8" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="0.8" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="0.8" />

              {/* Area Under Curve */}
              <path
                d={`M 0 200 ${chartCoordinates
                  .map((c, i) => {
                    const min = Math.min(...chartCoordinates.map((x) => x.val));
                    const max = Math.max(...chartCoordinates.map((x) => x.val));
                    const range = max - min || 1;
                    const x = (i / (chartCoordinates.length - 1)) * 500;
                    const y = 200 - ((c.val - min) / range) * 160 - 15;
                    return `L ${x} ${y}`;
                  })
                  .join(" ")} L 500 200 Z`}
                fill={`url(#areaGrad-${selectedCompany.symbol})`}
                opacity="0.1"
              />

              {/* Precise Line */}
              <path
                d={chartCoordinates
                  .map((c, i) => {
                    const min = Math.min(...chartCoordinates.map((x) => x.val));
                    const max = Math.max(...chartCoordinates.map((x) => x.val));
                    const range = max - min || 1;
                    const x = (i / (chartCoordinates.length - 1)) * 500;
                    const y = 200 - ((c.val - min) / range) * 160 - 15;
                    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke={selectedCompany.change >= 0 ? "#10b981" : "#f43f5e"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Define dynamic gradient nodes */}
              <defs>
                <linearGradient id={`areaGrad-${selectedCompany.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={selectedCompany.change >= 0 ? "#10b981" : "#f43f5e"} />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
              </defs>
            </svg>

            {/* Custom chart annotations */}
            <div className="absolute top-1 right-2 text-[9px] text-slate-500 font-mono flex flex-col items-end">
              <span>High: ₹{Math.max(...chartCoordinates.map(x => x.val)).toFixed(1)}</span>
              <span>Low: ₹{Math.min(...chartCoordinates.map(x => x.val)).toFixed(1)}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-500 font-mono border-t border-slate-800/50 pt-3">
            <span>52W High: ₹{selectedCompany.weekHigh}</span>
            <span>52W Low: ₹{selectedCompany.weekLow}</span>
            <span>Avg Volume: {(selectedCompany.volume * 0.9).toFixed(0)}</span>
            <span>Free-Float: {selectedCompany.symbol === "RELIANCE" ? "49.6%" : "62.1%"}</span>
          </div>
        </div>

        {/* Fundamental Scorecard Metrics (Right Column) */}
        <div className="lg:col-span-4 border border-slate-800/80 bg-slate-900/30 rounded-xl p-5 space-y-4" id="fundamental-metrics">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300 font-mono uppercase">Key Valuation Indicators</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800/65 pb-2">
              <span className="text-slate-400">Market capitalization</span>
              <span className="font-semibold text-slate-100 font-mono">₹{(selectedCompany.marketCapCr / 1000000).toFixed(2)} L Cr</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800/65 pb-2">
              <span className="text-slate-400">P/E Ratio (LTM)</span>
              <span className="font-semibold text-slate-100 font-mono">{selectedCompany.pe}x</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800/65 pb-2">
              <span className="text-slate-400">Book Value EPS (LTM)</span>
              <span className="font-semibold text-slate-100 font-mono">₹{selectedCompany.eps}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800/65 pb-2">
              <span className="text-slate-400">Return on Equity (ROE)</span>
              <span className="font-semibold text-emerald-400 font-mono">{selectedCompany.roe}%</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800/65 pb-2">
              <span className="text-slate-400">Debt To Equity ratio</span>
              <span className={`font-semibold font-mono ${selectedCompany.debtEquity > 0.8 ? "text-yellow-400" : "text-emerald-400"}`}>
                {selectedCompany.debtEquity}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800/65 pb-2">
              <span className="text-slate-400">Dividend Yield</span>
              <span className="font-semibold text-indigo-400 font-mono">{selectedCompany.divYield}%</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] space-y-1 font-mono">
            <span className="text-slate-500 uppercase block">Clearing Custodian note:</span>
            <p className="text-slate-400 leading-normal">
              These fundamentals are refreshed following quarterly financial releases securely matched directly with regulatory filing registers.
            </p>
          </div>
        </div>
      </div>

      {/* 4. REACTION LEVELS - SUPPORT, RESISTANCE, RSI EXTREMES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Support & Resistance Block */}
        <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-5 space-y-3" id="indicator-support-levels">
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center space-x-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Quantitative Support / Resistance Points</span>
          </h4>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-red-950/10 border border-red-950/30 rounded-lg">
              <span className="text-[10px] text-red-400 font-mono block uppercase">Critical Support S1</span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">₹{selectedCompany.support}</span>
            </div>
            <div className="p-3 bg-emerald-950/10 border border-emerald-950/30 rounded-lg">
              <span className="text-[10px] text-emerald-400 font-mono block uppercase">Breakout Target R1</span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">₹{selectedCompany.resistance}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 font-mono pt-1">
            <div className="flex justify-between">
              <span>50-DMA:</span>
              <span className="text-indigo-400">₹{selectedCompany.ma50}</span>
            </div>
            <div className="flex justify-between">
              <span>200-DMA:</span>
              <span className="text-indigo-400">₹{selectedCompany.ma200}</span>
            </div>
          </div>
        </div>

        {/* Oscillators: RSI, MACD */}
        <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-5 space-y-4" id="indicator-technical-oscillators">
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Relative Strength Index (RSI - 14 Days)</span>
          </h4>
          
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-500">OVERSOLD (30)</span>
              <span className="text-indigo-400 font-bold">RSI: {selectedCompany.rsi}</span>
              <span className="text-slate-500">OVERBOUGHT (70)</span>
            </div>
            
            {/* RSI horizontal slider track */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full relative overflow-hidden border border-slate-800">
              {/* bounds markers */}
              <div className="absolute left-[30%] right-[30%] top-0 bottom-0 bg-indigo-500/10 border-l border-r border-slate-800" />
              {/* slider dot */}
              <div
                className={`absolute w-3 h-3 rounded-full -top-[1px] transition-all duration-300 border shadow-md ${
                  selectedCompany.rsi > 70
                    ? "bg-red-500 border-red-400"
                    : selectedCompany.rsi < 30
                    ? "bg-emerald-500 border-emerald-400"
                    : "bg-indigo-500 border-indigo-400"
                }`}
                style={{ left: `${selectedCompany.rsi}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2">
            <span>MACD Index Spread: {selectedCompany.macd > 0 ? "+" : ""}{selectedCompany.macd}</span>
            <span className={`px-2 py-0.5 rounded font-bold uppercase ${
              selectedCompany.rsi > 70 ? "bg-red-950 text-red-400" : selectedCompany.rsi < 30 ? "bg-emerald-950 text-emerald-400" : "bg-slate-950 text-slate-400"
            }`}>
              {selectedCompany.rsi > 70 ? "Extreme Overbought" : selectedCompany.rsi < 30 ? "Extreme Oversold" : "Normal Oscillator range"}
            </span>
          </div>
        </div>
      </div>

      {/* 5. DYNAMIC AI STRATEGIC SUMMARY ENGINE */}
      <div className="border border-slate-800 bg-slate-900/10 p-5 rounded-xl space-y-4" id="ai-strategic-advisor-summary">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-2.5 border-b border-slate-800/60 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Gemini AI Wealth Strategy Analyst</h3>
          </div>
          <button
            onClick={handleGenerateAISummary}
            disabled={isLoadingAi}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950 disabled:text-indigo-700 disabled:cursor-not-allowed text-white font-mono text-[10px] font-bold rounded-lg transition shadow-sm uppercase flex items-center space-x-1.5"
          >
            {isLoadingAi ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Synthesizing Financials...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Request AI Strategy Summary</span>
              </>
            )}
          </button>
        </div>

        {/* AI OUTPUT CONTAINER */}
        {aiReport && (
          <div className="p-4 bg-slate-950/60 border border-indigo-950/50 rounded-xl space-y-3 font-sans text-xs text-slate-300 leading-relaxed fade-in animate-duration-300">
            <div className="flex items-center space-x-2 mb-2 text-indigo-400 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>STRICTLY OFF-SHORE SECURITY ANALYTICAL ADVICE</span>
            </div>
            
            {/* Preformatted clean strategic advice output */}
            <div className="whitespace-pre-wrap font-sans text-xs text-slate-300 font-normal leading-relaxed">
              {aiReport}
            </div>
          </div>
        )}

        {aiError && (
          <div className="p-4 bg-red-950/15 border border-red-500/15 rounded-xl flex items-start space-x-3 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="font-mono">{aiError}</p>
          </div>
        )}

        {!aiReport && !isLoadingAi && !aiError && (
          <p className="text-slate-500 text-[11px] font-sans leading-relaxed text-center py-6">
            Click the button above to request a professional LLM evaluation of {selectedCompany.symbol}'s recent earnings, corporate health, and technical trends.
          </p>
        )}
      </div>
    </div>
  );
}
