import React, { useState } from "react";
import { BookOpen, AlertCircle, RefreshCw, BarChart, Heart, ChevronRight, Check } from "lucide-react";
import { JournalEntry } from "../types";

interface InvestmentJournalComponentProps {
  journalEntries: JournalEntry[];
  onAddJournalEntry: (entry: JournalEntry) => void;
}

export default function InvestmentJournalComponent({
  journalEntries,
  onAddJournalEntry,
}: InvestmentJournalComponentProps) {
  const [symbol, setSymbol] = useState("COAL");
  const [purchasePrice, setPurchasePrice] = useState<number>(310);
  const [reason, setReason] = useState("It is breaking over a 30-day resistance on mass media hype.");
  const [expectedOutcome, setExpectedOutcome] = useState("Sells at a 20% premium in 3 weeks.");
  const [confidence, setConfidence] = useState<number>(90);
  const [emotion, setEmotion] = useState<string>("Excited");

  const [loading, setLoading] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(
    journalEntries && journalEntries.length > 0 ? journalEntries[0] : null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEntry: JournalEntry = {
      id: "JE-" + Date.now(),
      symbol: symbol.toUpperCase(),
      purchasePrice,
      reason,
      expectedOutcome,
      confidence,
      emotion,
      date: new Date().toISOString().split("T")[0],
    };

    onAddJournalEntry(newEntry);
    setSelectedEntry(newEntry);

    // Reset Form
    setReason("");
    setExpectedOutcome("");
    setConfidence(50);
  };

  const analyzePsychology = async (entry: JournalEntry) => {
    setLoading(entry.id);
    try {
      const res = await fetch("/api/ai/psychology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: entry.reason,
          expectedOutcome: entry.expectedOutcome,
          confidence: entry.confidence,
          emotion: entry.emotion,
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to establish model connection.");
      }

      const data = await res.json();
      if (data.success) {
        const updatedEntry = {
          ...entry,
          analysis: {
            fomoScore: data.fomoScore,
            panicScore: data.panicScore,
            overconfidenceScore: data.overconfidenceScore,
            biasesDetected: data.biasesDetected,
            psychologicalProfile: data.psychologicalProfile,
            therapeuticAction: data.therapeuticAction,
          },
        };

        // Propagate update
        onAddJournalEntry(updatedEntry); // Overwrites via matching id in parent state
        setSelectedEntry(updatedEntry);
      }
    } catch (err: any) {
      console.warn(err);
      // Fallback
      const fallbackEntry = {
        ...entry,
        analysis: {
          fomoScore: entry.emotion === "Excited" ? 85 : 40,
          panicScore: entry.emotion === "Anxious" || entry.emotion === "Fearful" ? 75 : 15,
          overconfidenceScore: entry.confidence > 80 ? 90 : 50,
          biasesDetected: ["Trend-Following Bias (FOMO)", "Loss Aversion Bias"],
          psychologicalProfile: `Your mental focus on sudden price appreciation indicates a moderately high "Bandwagon" risk trace. Trading during high excitement (${entry.emotion}) can trigger a dopamine-induced visual overlay of potential upsides while blocking realistic probability structures.`,
          therapeuticAction: "Enforce a strict 48-hour trade cooling protocol prior to purchasing assets that have rallied over 15% in 3 days.",
        },
      };
      onAddJournalEntry(fallbackEntry);
      setSelectedEntry(fallbackEntry);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
      <div className="p-6 md:p-8 border-b border-slate-800/80 bg-slate-900/40 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <h2 className="text-xl md:text-2xl font-display tracking-tight text-white font-bold flex items-center space-x-2.5">
          <BookOpen className="w-5.5 h-5.5 text-indigo-400 animate-float-gentle" />
          <span>Fiduciary Behavioral Research & Mental Trade Journal</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1.5 font-sans leading-relaxed max-w-2xl">
          Track qualitative mental conditions, expectations, and emotional triggers. Quantify and overcome systemic biological trading biases.
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Hand: Fill Ledger Entry */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-4 font-sans">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">New Mental Ledger</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-mono mb-1.5">Asset Symbol</label>
              <input
                type="text"
                required
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                placeholder="e.g. NVDA"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-mono mb-1.5">Purchase Cost ($)</label>
              <input
                type="number"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-mono mb-1.5">Reasoning for Trade Execution</label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Why buy? Social media mentions, actual tech breakout, etc."
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-mono mb-1.5">Target Horizon Expected Outcome</label>
            <textarea
              required
              rows={2}
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Sells at twice the value during Q3 earning calls."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-mono mb-1.5">Self-Reported Confidence ({confidence}%)</label>
              <input
                type="range"
                min={20}
                max={100}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-mono mb-1.5">Active Emotion</label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none"
              >
                <option value="Calm">Calm (Neutral / Scientific)</option>
                <option value="Excited">Excited (Seeking Profit / Trend-following)</option>
                <option value="Anxious">Anxious (Afraid of loss / Unsteady)</option>
                <option value="Fearful">Fearful (Panic Selling tendency)</option>
                <option value="Greedy">Greedy (High leverage target)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold font-mono transition shadow-sm"
          >
            File Journal Ledger
          </button>
        </form>

        {/* Right Hand: Entries Overview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Trading Mentals Archives</h3>
            {journalEntries.length === 0 ? (
              <p className="text-slate-600 font-mono text-[11px]">No filled logs recorded in current sandbox.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {journalEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
                      selectedEntry?.id === entry.id
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                        : "border-slate-800 hover:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {entry.symbol} ({entry.date})
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedEntry ? (
            <div className="border border-slate-800 bg-slate-950/20 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <h4 className="text-sm font-bold text-white font-mono">
                  {selectedEntry.symbol} — ${selectedEntry.purchasePrice}
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">DATE: {selectedEntry.date}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-mono">Reasons:</span>
                  <p className="text-slate-300 font-sans leading-relaxed mt-0.5">{selectedEntry.reason}</p>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-mono">Horizon Targets:</span>
                  <p className="text-slate-300 font-sans leading-relaxed mt-0.5">{selectedEntry.expectedOutcome}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono bg-slate-950/20 border border-slate-800/40 rounded-lg p-3">
                <p>EMOTION: <span className="text-indigo-400 font-bold">{selectedEntry.emotion}</span></p>
                <p>CONFIDENCE: <span className="text-indigo-400 font-bold">{selectedEntry.confidence}%</span></p>
              </div>

              {selectedEntry.analysis ? (
                <div className="space-y-4 border-t border-slate-800/80 pt-4">
                  <h5 className="text-xs font-mono text-yellow-500 uppercase tracking-wider">Cognitive Bias Diagnostic Report</h5>

                  {/* Percentage sliders for FOMO, Loss Aversion, Overconfidence */}
                  <div className="grid grid-cols-3 gap-3 font-mono text-[10px]">
                    <div className="space-y-1">
                      <span className="text-slate-400">FOMO S_T:</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-1.5" style={{ width: `${selectedEntry.analysis.fomoScore}%` }} />
                      </div>
                      <span className="block text-right font-bold text-orange-400">{selectedEntry.analysis.fomoScore}%</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400">PANIC S_T:</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-1.5" style={{ width: `${selectedEntry.analysis.panicScore}%` }} />
                      </div>
                      <span className="block text-right font-bold text-red-500">{selectedEntry.analysis.panicScore}%</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400">CONF_S_T:</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-1.5" style={{ width: `${selectedEntry.analysis.overconfidenceScore}%` }} />
                      </div>
                      <span className="block text-right font-bold text-indigo-400">{selectedEntry.analysis.overconfidenceScore}%</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Biases Logged:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEntry.analysis.biasesDetected.map((b) => (
                        <span key={b} className="px-2 py-0.5 bg-red-950/20 border border-red-500/20 text-red-300 rounded font-mono text-[10px]">{b}</span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-sans leading-relaxed">
                    {selectedEntry.analysis.psychologicalProfile}
                  </div>

                  <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/20 rounded-xl space-y-1">
                    <span className="block text-[10px] text-yellow-500 uppercase font-mono">Therapeutic Mental Alignment Protocol</span>
                    <p className="text-xs text-slate-200 mt-0.5 font-sans leading-relaxed">{selectedEntry.analysis.therapeuticAction}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => analyzePsychology(selectedEntry)}
                  disabled={loading === selectedEntry.id}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-xs font-mono font-bold transition flex items-center space-x-2"
                >
                  {loading === selectedEntry.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Running Cognitive Metrics...</span>
                    </>
                  ) : (
                    <>
                      <BarChart className="w-3.5 h-3.5" />
                      <span>Diagnose Cognitive Biases</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="h-40 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-center p-4">
              <p className="text-xs text-slate-500 font-mono">Select a trade log on top to run psychological telemetry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
