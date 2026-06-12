import React, { useState } from "react";
import { Sparkles, ArrowRight, Gauge, Sliders, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { Holding, AIAdvisorResponse } from "../types";

interface LiveAdvisorProps {
  holdings: Holding[];
  portfolioValue: number;
}

export default function LiveAdvisor({ holdings, portfolioValue }: LiveAdvisorProps) {
  const [income, setIncome] = useState<number>(185000);
  const [riskAppetite, setRiskAppetite] = useState<"Conservative" | "Moderate" | "Aggressive" | "Hyper-Growth">("Moderate");
  const [goals, setGoals] = useState<string>("Retire early in 15 years with active dividends.");
  
  const [loading, setLoading] = useState(false);
  const [advisorData, setAdvisorData] = useState<AIAdvisorResponse | null>(null);
  const [errorHeader, setErrorHeader] = useState("");

  const executeAIAdvisory = async () => {
    setLoading(true);
    setErrorHeader("");
    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income,
          riskAppetite,
          goals,
          portfolioValue,
          holdings: holdings.map((h) => ({ symbol: h.symbol, shares: h.shares, avgPrice: h.avgBuyPrice, value: h.shares * h.currentPrice })),
        }),
      });

      if (!res.ok) {
        throw new Error("Enterprise model connection is busy. Falling back to local quantitative metrics.");
      }

      const data = await res.json();
      if (data.success) {
        setAdvisorData({
          advice: data.advice,
          confidenceScore: data.confidenceScore,
          targetAllocation: data.targetAllocation,
          riskLevel: data.riskLevel,
          primaryRecommendation: data.primaryRecommendation,
        });
      } else {
        throw new Error(data.error || "System timed out.");
      }
    } catch (err: any) {
      console.warn(err);
      setErrorHeader("Notice: Standard analytical fallback executed. Asset allocation adjusted locally.");
      // Fallback
      setAdvisorData({
        advice: `### Tactical Asset Allocations — ${riskAppetite}
Based on systematic re-scaling, your goals to **"${goals}"** can be catalyzed by redistributing positions:
1. Decrease high beta correlations (Technology symbols).
2. Establish solid long liquidity hedges using liquid reserves.
3. Consistently re-invest yields back into broad market index configurations to reduce transactional slippage.`,
        confidenceScore: riskAppetite === "Hyper-Growth" ? 72 : 88,
        targetAllocation: [
          { assetClass: "Equities", percentage: riskAppetite === "Aggressive" ? 70 : riskAppetite === "Conservative" ? 25 : 50 },
          { assetClass: "Bonds / Yields", percentage: riskAppetite === "Aggressive" ? 15 : riskAppetite === "Conservative" ? 55 : 30 },
          { assetClass: "Liquid Hedges", percentage: riskAppetite === "Aggressive" ? 10 : riskAppetite === "Conservative" ? 15 : 15 },
          { assetClass: "Alternatives", percentage: riskAppetite === "Aggressive" ? 5 : riskAppetite === "Conservative" ? 5 : 5 },
        ],
        riskLevel: riskAppetite,
        primaryRecommendation: "Liquidate high valuation overlays and reallocate to core inflation-protected yield classes.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
      <div className="p-6 md:p-8 border-b border-slate-800/80 bg-slate-900/40 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
        <h2 className="text-xl md:text-2xl font-display tracking-tight text-white font-bold flex items-center space-x-2.5">
          <Sparkles className="w-5.5 h-5.5 text-yellow-400 animate-pulse" />
          <span>Fiduciary AI Advisory & Strategic Portfolio Planner</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1.5 font-sans leading-relaxed max-w-2xl">
          Conduct server-side optimization modeling using deep neural intelligence aligned with client financial intentions.
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Parameters Slider */}
        <div className="lg:col-span-5 space-y-5">
          <h3 className="text-slate-300 text-xs font-mono uppercase tracking-wider">
            Wealth Profile Parameters
          </h3>

          <div>
            <label className="block text-slate-400 text-xs font-mono mb-2">
              Annual Verified Gross Income: <span className="text-indigo-400 font-bold font-sans">${income.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={30000}
              max={1000000}
              step={10000}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-mono mb-1.5">
              Risk Appetite Profile
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["Conservative", "Moderate", "Aggressive", "Hyper-Growth"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiskAppetite(r)}
                  className={`px-3 py-2 text-xs rounded-lg border font-medium text-left transition ${
                    riskAppetite === r
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                      : "border-slate-800 hover:bg-slate-800 text-slate-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-mono mb-1.5">
              Structural Financial Goals
            </label>
            <textarea
              rows={2}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-700 transition"
              placeholder="e.g. Save $2M for children academic trust funds in 10 years."
            />
          </div>

          <button
            onClick={executeAIAdvisory}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium font-mono transition flex items-center justify-center space-x-2 shadow-sm"
          >
            {loading ? (
              <>
                <Sliders className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Asset Classes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Quantum Optimizer</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Results Display */}
        <div className="lg:col-span-7">
          {errorHeader && (
            <div className="mb-4 p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-indigo-300 text-[11px] font-mono leading-relaxed">
              {errorHeader}
            </div>
          )}

          {advisorData ? (
            <div className="space-y-6">
              {/* Metrics Header Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-800 bg-slate-950/20 rounded-xl p-4 flex items-center space-x-3.5">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-mono uppercase">Goal Achievability</span>
                    <span className="text-xl text-white font-bold font-sans">{advisorData.confidenceScore}%</span>
                  </div>
                </div>

                <div className="border border-slate-800 bg-slate-950/20 rounded-xl p-4 flex items-center space-x-3.5">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-mono uppercase">Core Risk Class</span>
                    <span className="text-xl text-white font-bold font-sans">{advisorData.riskLevel}</span>
                  </div>
                </div>
              </div>

              {/* Advice Box */}
              <div className="border border-slate-800/80 bg-slate-950/40 rounded-xl p-5">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-3">AI Strategic Breakdown</span>
                <div className="text-xs text-slate-300 space-y-2 prose prose-invert font-sans leading-relaxed whitespace-pre-line">
                  {advisorData.advice}
                </div>
              </div>

              {/* Target allocation bar graph representation */}
              <div className="border border-slate-800 bg-slate-950/20 rounded-xl p-5">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-4">Proposed Structural Rebalancing</span>
                
                <div className="space-y-3.5">
                  {advisorData.targetAllocation.map((alloc) => (
                    <div key={alloc.assetClass} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-300 font-mono">
                        <span>{alloc.assetClass}</span>
                        <span className="text-indigo-400">{alloc.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${alloc.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical action item block */}
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/15 rounded-xl flex items-start space-x-3">
                <CheckCircle2 className="w-4.5 h-4.5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] text-yellow-500/80 font-mono uppercase tracking-wider">Critical Action item</span>
                  <p className="text-xs text-slate-200 mt-1 font-medium">{advisorData.primaryRecommendation}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-950/20">
              <Sparkles className="w-8 h-8 text-slate-700 animate-pulse mb-3" />
              <h4 className="text-sm font-sans font-medium text-slate-400">Optimization Ledger Inactive</h4>
              <p className="text-[11px] text-slate-600 font-mono max-w-sm mt-1">
                Enter your targeted income and specific early goals on the left pane and execute the optimizer to initialize the full AI model calculations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
