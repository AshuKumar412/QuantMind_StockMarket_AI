import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from "recharts";
import { LineChart as ChartIcon, Sliders, Play, RefreshCw, Layers, TrendingUp, AlertOctagon, HelpCircle } from "lucide-react";
import { runBacktest, runMonteCarlo, HISTORIC_CRASHES, calculateCrashImpact } from "../utils/quantEngines";
import { Holding, BacktestConfig, MonteCarloConfig } from "../types";

interface QuantitativeSuiteProps {
  holdings: Holding[];
}

export default function QuantitativeSuite({ holdings }: QuantitativeSuiteProps) {
  const [activeTab, setActiveTab] = useState<"backtest" | "monte_carlo" | "crash">("backtest");

  // 1. Backtest state
  const [btConfig, setBtConfig] = useState<BacktestConfig>({
    strategy: "RSI",
    symbol: "BLUE_CHIP_TECH",
    rsiWindow: 14,
    rsiOverbought: 70,
    rsiOversold: 30,
    shortMa: 15,
    longMa: 50,
    momentumWindow: 12,
    lookbackPeriod: "3Y",
    initialCapital: 100000,
  });
  const [btResult, setBtResult] = useState(() => runBacktest(btConfig));

  // 2. Monte Carlo state
  const [mcConfig, setMcConfig] = useState<MonteCarloConfig>({
    years: 25,
    initialValue: 100000,
    annualContribution: 12000,
    expectedReturn: 9.5,
    volatility: 18,
  });
  const [mcResult, setMcResult] = useState(() => runMonteCarlo(mcConfig));

  // 3. Crash Simulator state
  const [selectedCrashId, setSelectedCrashId] = useState("gfc_2008");
  const activeCrashScenario = useMemo(() => {
    return HISTORIC_CRASHES.find((c) => c.id === selectedCrashId) || HISTORIC_CRASHES[0];
  }, [selectedCrashId]);

  const crashResult = useMemo(() => {
    return calculateCrashImpact(holdings ?? [], activeCrashScenario);
  }, [holdings, activeCrashScenario]);

  // Actions
  const handleRunBacktest = () => {
    const res = runBacktest(btConfig);
    setBtResult(res);
  };

  const handleRunMonteCarlo = () => {
    const res = runMonteCarlo(mcConfig);
    setMcResult(res);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
      {/* Tab Buttons */}
      <div className="flex border-b border-slate-800/80 bg-slate-950/40 text-xs font-mono">
        <button
          onClick={() => setActiveTab("backtest")}
          className={`flex items-center space-x-1.5 px-5 py-4 border-r border-slate-800 transition uppercase ${
            activeTab === "backtest" ? "bg-slate-900 text-indigo-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ChartIcon className="w-3.5 h-3.5" />
          <span>Institutional Backtesting</span>
        </button>

        <button
          onClick={() => setActiveTab("monte_carlo")}
          className={`flex items-center space-x-1.5 px-5 py-4 border-r border-slate-800 transition uppercase ${
            activeTab === "monte_carlo" ? "bg-slate-900 text-indigo-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Monte Carlo Path (10k Runs)</span>
        </button>

        <button
          onClick={() => setActiveTab("crash")}
          className={`flex items-center space-x-1.5 px-5 py-4 transition uppercase ${
            activeTab === "crash" ? "bg-slate-900 text-indigo-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Historic Crash Stress-Tester</span>
        </button>
      </div>

      <div className="p-6">
        {/* TAB 1: BACKTESTING STRATEGY */}
        {activeTab === "backtest" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Config Side */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Strategy Parameters</h3>

              <div>
                <label className="block text-slate-400 text-xs font-mono mb-1.5">Alpha Target Asset Class</label>
                <select
                  value={btConfig.symbol}
                  onChange={(e) => setBtConfig({ ...btConfig, symbol: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="BLUE_CHIP_TECH">Blue-Chip US Tech Basket (High Beta)</option>
                  <option value="BTC">Crypto Liquid Hedge (Ultra Volatility)</option>
                  <option value="GOV_BOND">Government Bond Indexes (Conservative Yield)</option>
                  <option value="SOV_WEALTH">Sovereign Wealth Macro Allocation (Moderate)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-mono mb-1.5">Execution Logic</label>
                <select
                  value={btConfig.strategy}
                  onChange={(e) => setBtConfig({ ...btConfig, strategy: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="RSI">RSI Oscillating Strategy (Contra-Trend)</option>
                  <option value="MOVING_AVERAGE">SMA Exponential Cross (Trend-Following)</option>
                  <option value="MOMENTUM">Absolute Speed Momentum (Tactical Breakouts)</option>
                </select>
              </div>

              {/* Dynamic configurations based on selected Strategy */}
              {btConfig.strategy === "RSI" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 text-[10px] font-mono mb-1">Oversold Threshold</label>
                    <input
                      type="number"
                      value={btConfig.rsiOversold}
                      onChange={(e) => setBtConfig({ ...btConfig, rsiOversold: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-800 rounded text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-mono mb-1">Overbought Threshold</label>
                    <input
                      type="number"
                      value={btConfig.rsiOverbought}
                      onChange={(e) => setBtConfig({ ...btConfig, rsiOverbought: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-800 rounded text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {btConfig.strategy === "MOVING_AVERAGE" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 text-[10px] font-mono mb-1">Fast SMA window</label>
                    <input
                      type="number"
                      value={btConfig.shortMa}
                      onChange={(e) => setBtConfig({ ...btConfig, shortMa: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-800 rounded text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-mono mb-1">Slow SMA window</label>
                    <input
                      type="number"
                      value={btConfig.longMa}
                      onChange={(e) => setBtConfig({ ...btConfig, longMa: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-800 rounded text-xs font-mono text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-mono mb-1">Initial Capital ($)</label>
                  <input
                    type="number"
                    value={btConfig.initialCapital}
                    onChange={(e) => setBtConfig({ ...btConfig, initialCapital: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-mono mb-1">Backtest Period</label>
                  <select
                    value={btConfig.lookbackPeriod}
                    onChange={(e) => setBtConfig({ ...btConfig, lookbackPeriod: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="1Y">1 Year (Defensive)</option>
                    <option value="3Y">3 Years (Full cycle)</option>
                    <option value="5Y">5 Years (Macro trend)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRunBacktest}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold font-mono transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate Execution Logs</span>
              </button>
            </div>

            {/* Visualizer Side */}
            <div className="lg:col-span-8 space-y-6">
              {/* Core Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                <div className="border border-slate-800 bg-slate-950/20 p-4 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 uppercase">CAGR (Yield)</span>
                  <span className="text-lg text-emerald-400 font-bold">{btResult.cagr}%</span>
                </div>
                <div className="border border-slate-800 bg-slate-950/20 p-4 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 uppercase">Sharpe Ratio</span>
                  <span className="text-lg text-white font-bold">{btResult.sharpeRatio}</span>
                </div>
                <div className="border border-slate-800 bg-slate-950/20 p-4 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 uppercase">Max Drawdown</span>
                  <span className="text-lg text-red-400 font-bold">-{btResult.maxDrawdown}%</span>
                </div>
                <div className="border border-slate-800 bg-slate-950/20 p-4 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 uppercase">Alpha Win Rate</span>
                  <span className="text-lg text-indigo-400 font-bold">{btResult.winRate}%</span>
                </div>
              </div>

              {/* Equity curve chart */}
              <div className="h-64 border border-slate-800 bg-slate-950/40 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={btResult.equityCurve}>
                    <defs>
                      <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.05} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3"/>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="strategyValue" name="Tactical Strategy" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorStrategy)" />
                    <Area type="monotone" dataKey="benchmarkValue" name="Hold Benchmark" stroke="#94a3b8" strokeDasharray="4 4" fillOpacity={1} fill="url(#colorBenchmark)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MONTE CARLO SIMULATOR */}
        {activeTab === "monte_carlo" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Configuration side */}
            <div className="lg:col-span-4 space-y-4 font-sans">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Simulated Variables</h3>

              <div>
                <label className="block text-slate-400 text-xs font-mono mb-2">
                  Simulation Horizon: <span className="text-indigo-400 font-bold font-sans">{mcConfig.years} Years</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={40}
                  value={mcConfig.years}
                  onChange={(e) => setMcConfig({ ...mcConfig, years: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-mono mb-1">Expected Annual Return (%)</label>
                  <input
                    type="number"
                    value={mcConfig.expectedReturn}
                    onChange={(e) => setMcConfig({ ...mcConfig, expectedReturn: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-mono mb-1">Historic Volatility (%)</label>
                  <input
                    type="number"
                    value={mcConfig.volatility}
                    onChange={(e) => setMcConfig({ ...mcConfig, volatility: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-mono mb-1">Annual Post-Contribution Savings ($)</label>
                <input
                  type="number"
                  value={mcConfig.annualContribution}
                  onChange={(e) => setMcConfig({ ...mcConfig, annualContribution: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none font-mono"
                />
              </div>

              <button
                onClick={handleRunMonteCarlo}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold font-mono transition flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-seed Path Walks</span>
              </button>
            </div>

            {/* Visualizer output */}
            <div className="lg:col-span-8 space-y-6">
              {/* Success metrics */}
              <div className="border border-slate-800 bg-slate-950/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-500 font-mono uppercase">Probability of Beating Benchmark</span>
                  <span className="text-2xl text-emerald-400 font-bold font-sans">{mcResult.successProbability}%</span>
                </div>
                <div className="text-right text-xs text-slate-400 max-w-xs font-mono leading-relaxed">
                  Calculated based on 10,000 algorithmic random-walk branches utilizing standard index volatility equations.
                </div>
              </div>

              {/* Monte Carlo percentile charts */}
              <div className="h-64 border border-slate-800 bg-slate-950/40 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={mcResult.timeline.map((year, idx) => ({
                      year: `Y${year}`,
                      P90: Number(mcResult.p90[idx].toFixed(0)),
                      P50: Number(mcResult.p50[idx].toFixed(0)),
                      P10: Number(mcResult.p10[idx].toFixed(0)),
                    }))}
                  >
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="year" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: 8, fontSize: 11 }} />
                    <Line type="monotone" dataKey="P90" name="Optimistic (90th)" stroke="#0ea5e9" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="P50" name="Median Yield (50th)" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="P10" name="Conservative (10th)" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STRESS-TESTER */}
        {activeTab === "crash" && (
          <div className="space-y-6">
            {/* Crash Profiles Slider */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {HISTORIC_CRASHES.map((crash) => (
                <button
                  key={crash.id}
                  onClick={() => setSelectedCrashId(crash.id)}
                  className={`p-4 border rounded-xl text-left transition ${
                    selectedCrashId === crash.id
                      ? "bg-red-950/20 border-red-500/40 shadow-sm"
                      : "border-slate-800 hover:bg-slate-800 bg-slate-950/10"
                  }`}
                >
                  <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">{crash.period}</span>
                  <h4 className="text-sm font-sans font-semibold text-white mt-0.5">{crash.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed h-12 overflow-hidden">{crash.description}</p>
                </button>
              ))}
            </div>

            {/* Stress results */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-t border-slate-800/80 pt-6">
              {/* Calculations Pane */}
              <div className="lg:col-span-5 space-y-4 font-mono text-xs">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Scenario Index Loss</span>
                  <span className="text-3xl text-red-400 font-bold font-sans">-{activeCrashScenario?.drawdownPercentage}%</span>
                </div>

                <div className="border border-slate-800 bg-slate-950/20 rounded-xl p-4 space-y-3.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Active Portfolio Loss Estimate:</span>
                    <span className="text-red-400 font-bold font-sans">-{crashResult.realizedLossRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projected Liquidation Loss:</span>
                    <span className="text-white font-bold font-sans">${crashResult.estimatedPortfolioLoss.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Historical Recovery Frame:</span>
                    <span className="text-slate-400 font-sans">{activeCrashScenario?.impactMetrics?.recoveryTimeDays} days</span>
                  </div>
                </div>

                <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl space-y-1 text-slate-200">
                  <span className="block text-[10px] text-indigo-400 uppercase font-mono tracking-wider">Hedge Position Advice</span>
                  <p className="font-sans leading-relaxed text-xs text-indigo-300">{crashResult.recommendedHedge}</p>
                </div>
              </div>

              {/* Bar charts of assets drop */}
              <div className="lg:col-span-7">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-3">Estimated Holding Breakdown under Scenario</span>
                <div className="h-60 border border-slate-800/80 bg-slate-950/40 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={crashResult.sectorHit}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3"/>
                      <XAxis dataKey="sector" stroke="#475569" fontSize={9} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} label={{ value: 'Estimated Drop %', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="drop" fill="#ef4444" radius={[4, 4, 0, 0]} name="Simulated Holding Drop %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
