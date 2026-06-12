import React, { useMemo } from "react";
import { SectorData } from "../utils/indianMarketSim";
import { Compass, TrendingUp, HelpCircle, Activity, ArrowRight, ArrowRightLeft, Layers } from "lucide-react";

interface Props {
  sectors: SectorData[];
}

export default function SectorRotation({ sectors }: Props) {
  
  // Categorize sectors for visual rotation matrices
  const leadingSectors = useMemo(() => {
    return sectors.filter((s) => s.momentum.includes("Strong") || s.relativeStrength >= 65);
  }, [sectors]);

  const improvingSectors = useMemo(() => {
    return sectors.filter((s) => s.relativeStrength >= 50 && s.relativeStrength < 65 && !s.momentum.includes("Bearish"));
  }, [sectors]);

  const laggingOrWeakSectors = useMemo(() => {
    return sectors.filter((s) => s.relativeStrength < 50 || s.momentum.includes("Bearish"));
  }, [sectors]);

  return (
    <div className="space-y-6" id="sector-rotation-module">
      {/* 1. SECTOR INDEX SUMMARY SCOREBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sectors.map((sec) => {
          const isPos = sec.change >= 0;
          return (
            <div
              key={sec.name}
              className="border border-slate-800 bg-slate-900/40 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700/80 transition"
              id={`sector-card-${sec.indexSymbol}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-bold text-white tracking-tight">{sec.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{sec.indexSymbol}</span>
                </div>
                
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-lg font-bold font-mono text-white">₹{sec.price.toLocaleString()}</span>
                  <span className={`text-[10px] font-mono leading-none ${isPos ? "text-emerald-400" : "text-red-400"}`}>
                    {isPos ? "+" : ""}{sec.pctChange}%
                  </span>
                </div>
              </div>

              {/* RS & MFI Indicators */}
              <div className="mt-4 pt-2.5 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                <div>
                  <span>Rel Strength:</span>
                  <span className="block font-semibold text-slate-300 mt-0.5">{sec.relativeStrength.toFixed(0)}/100</span>
                </div>
                <div>
                  <span>Money Flow Index:</span>
                  <span className="block font-semibold text-slate-300 mt-0.5">{sec.moneyFlowIndex}/100</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. THE ROTATIONAL MATRIX VISUALIZATION */}
      <div className="border border-slate-800 bg-slate-900/10 rounded-xl p-5" id="rotational-matrix">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <span>Institutional Rotation Matrix (RRG Style)</span>
          </h3>
          <span className="text-[9px] text-slate-500 font-mono tracking-wider">RELATIVE ROTATION BENCHMARKED TO NIFTY 50</span>
        </div>

        {/* 4 Quadrants matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Quadrant 1: LEADING (High relative strength & high momentum) */}
          <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-emerald-950 pb-1.5">
              <span className="text-xs font-bold text-emerald-400 font-mono">1. LEADING (OUTPERFORMING)</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 rounded font-semibold text-emerald-300 font-mono">BULL RUN</span>
            </div>
            
            <div className="space-y-2.5">
              {leadingSectors.map((s) => (
                <div key={s.name} className="p-2.5 bg-slate-900/60 border border-slate-850 rounded-lg text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-white text-[11px]">{s.name}</span>
                    <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold">{s.signal}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    RS: {s.relativeStrength.toFixed(0)} // MFI: {s.moneyFlowIndex} is driving aggressive institutional buying.
                  </p>
                </div>
              ))}
              {leadingSectors.length === 0 && (
                <p className="text-slate-500 text-[10px] py-4 text-center">No sectors currently leading</p>
              )}
            </div>
          </div>

          {/* Quadrant 2: IMPROVING (Recovering momentum) */}
          <div className="p-4 bg-indigo-950/10 border border-indigo-500/20 rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-indigo-950 pb-1.5">
              <span className="text-xs font-bold text-indigo-400 font-mono">2. IMPROVING (ACCUMULATION)</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-indigo-500/20 rounded font-semibold text-indigo-300 font-mono">ENTERING</span>
            </div>
            
            <div className="space-y-2.5">
              {improvingSectors.map((s) => (
                <div key={s.name} className="p-2.5 bg-slate-900/60 border border-slate-850 rounded-lg text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-white text-[11px]">{s.name}</span>
                    <span className="text-indigo-400 font-mono text-[10px] uppercase font-bold">{s.signal}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    RS: {s.relativeStrength.toFixed(0)} // MFI: {s.moneyFlowIndex} reflects steady accumulation of retail shares.
                  </p>
                </div>
              ))}
              {improvingSectors.length === 0 && (
                <p className="text-slate-500 text-[10px] py-4 text-center">No sectors currently improving</p>
              )}
            </div>
          </div>

          {/* Quadrant 3: LAGGING / WEAKENING (Slowing momentum) */}
          <div className="p-4 bg-red-950/10 border border-red-500/20 rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-red-950 pb-1.5">
              <span className="text-xs font-bold text-red-400 font-mono">3. WEAKENING / LAGGING</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-red-500/20 rounded font-semibold text-red-300 font-mono">OUTFLOW</span>
            </div>
            
            <div className="space-y-2.5">
              {laggingOrWeakSectors.map((s) => (
                <div key={s.name} className="p-2.5 bg-slate-900/60 border border-slate-850 rounded-lg text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-white text-[11px]">{s.name}</span>
                    <span className="text-red-400 font-mono text-[10px] uppercase font-bold">{s.signal}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    RS: {s.relativeStrength.toFixed(0)} // MFI: {s.moneyFlowIndex} is signaling liquidity distribution and profit taking.
                  </p>
                </div>
              ))}
              {laggingOrWeakSectors.length === 0 && (
                <p className="text-slate-500 text-[10px] py-4 text-center">No sectors currently weakening</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. SECTOR ROTATION SIGNALS SUMMARY SUMMARY BOARD */}
      <div className="p-4 border border-indigo-500/15 bg-indigo-500/5 rounded-xl flex items-start space-x-3.5">
        <Layers className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-300">
          <span className="font-bold text-slate-200 block mb-1">Rotational Flow Recommendation: Defensive Hedging</span>
          <p className="leading-relaxed">
            According to the Relative strength graphs, Money is currently rotating out of **Banking & Finance** due to margin compression fears and flowing back into **Pharmaceuticals** and **Information Technology** (seeking defensive valuations and export margins). Consider shifting portfolio allocations from high-beta finance into resilient, dollar-advantaged pharma exports.
          </p>
        </div>
      </div>
    </div>
  );
}
