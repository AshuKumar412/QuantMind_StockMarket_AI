import React from "react";
import { MacroIndicator } from "../utils/indianMarketSim";
import { Sparkles, TrendingUp, TrendingDown, BookOpen, Layers, CheckCircle } from "lucide-react";

interface Props {
  indicators: MacroIndicator[];
}

export default function MacroDashboard({ indicators }: Props) {
  return (
    <div className="space-y-6" id="indian-macroeconomic-dashboard">
      {/* 1. STATE INDICATORS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {indicators.map((ind) => {
          return (
            <div
              key={ind.code}
              className="border border-slate-800 bg-slate-900/40 p-4.5 rounded-xl hover:border-slate-700/80 transition flex flex-col justify-between"
              id={`macro-${ind.code}`}
            >
              <div>
                <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  {ind.name}
                </span>
                <span className="text-2xl font-bold font-sans text-white mt-1.5 block">
                  {ind.currentValue}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-4 pt-2 border-t border-slate-800/60">
                <span>Prev: {ind.previousValue}</span>
                <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                  ind.trend === "UP" ? "bg-emerald-950/40 text-emerald-400" : ind.trend === "DOWN" ? "bg-red-950/40 text-red-400" : "bg-slate-950 text-slate-400"
                }`}>
                  {ind.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. SPECIFIC AI SECTOR IMPACT TABLE */}
      <div className="border border-slate-800 bg-slate-900/10 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Macro-to-Sector Impact Matrices</span>
          </h3>
          <span className="text-[9px] text-slate-500 font-mono">UPDATED CYCLIC SEGMENTATION</span>
        </div>

        <div className="grid grid-cols-1 gap-4 font-sans text-xs pt-1">
          {indicators.map((ind) => {
            return (
              <div
                key={ind.code}
                className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex flex-col md:flex-row md:items-start gap-4 hover:border-slate-800 transition"
                id={`macro-impact-row-${ind.code}`}
              >
                {/* indicator detail card bubble */}
                <div className="w-full md:w-56 shrink-0 bg-slate-950/60 border border-slate-850 rounded-lg p-3">
                  <span className="text-[9px] text-indigo-400 font-mono block tracking-wider uppercase font-extrabold">{ind.code}</span>
                  <span className="text-sm font-bold text-slate-100 font-sans block mt-1">{ind.name}</span>
                  <div className="text-lg font-bold font-mono text-white mt-2">{ind.currentValue}</div>
                </div>

                {/* detailed evaluation */}
                <div className="flex-1 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 block border-b border-slate-800 pb-1 uppercase font-bold">Quantitative Interpretation</span>
                  <p className="text-xs text-slate-300 leading-normal">{ind.aiInsight}</p>
                  
                  {/* quick structural sector suggestions taggers */}
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px] font-bold uppercase">
                    <span className="text-emerald-400 bg-emerald-950/20 px-2.5 py-0.5 rounded border border-emerald-950">
                      Positive: {ind.code === "REPO_RATE" ? "Private Banks, NBFCs" : ind.code === "CPI_INFLATION" ? "FMCG, Automobile" : ind.code === "USD_INR" ? "IT Consultancies, Pharma Exports" : "Corporate CAPEX, infrastructure"}
                    </span>
                    <span className="text-red-400 bg-red-950/20 px-2.5 py-0.5 rounded border border-red-950">
                      Negative: {ind.code === "REPO_RATE" ? "Highly Leveraged Infrastructure, Real estate" : ind.code === "BRENT_CRUDE" ? "Upstream Oil explorers" : "Aviation, Imports"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ADDITIONAL RBI POLICY CORNER CARD */}
      <div className="p-4 border border-indigo-500/15 bg-indigo-500/5 rounded-xl flex items-start space-x-3.5">
        <BookOpen className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-slate-200 block mb-1">Decoupled Macro Commentary: Goldman Sachs Global Strategy</span>
          <p>
            India's retail metrics are setting structural benchmarks across EM domains. CPI hovering around 4.8% prevents any urgent rate cuts from the RBI but strengthens local currency holdings. Domestic GDP expanding robustly at 8.2% ensures that corporate investment books remain filled, offsetting cyclical drops globally. High capital accumulation rates directly safeguard standard NIFTY valuation premiums.
          </p>
        </div>
      </div>
    </div>
  );
}
