import React, { useMemo } from "react";
import { NewsItem, InsiderDeal } from "../utils/indianMarketSim";
import { Activity, ShieldAlert, Award, FileText, ArrowRight, CornerDownRight, ThumbsUp, ThumbsDown } from "lucide-react";

interface Props {
  news: NewsItem[];
  insiderDeals: InsiderDeal[];
}

export default function MarketSentiment({ news, insiderDeals }: Props) {
  
  // Calculate average market sentiment score
  const sentimentStats = useMemo(() => {
    if (news.length === 0) return { score: 50, label: "NEUTRAL" };
    const sum = news.reduce((acc, current) => acc + current.score, 0);
    const score = Math.round(sum / news.length);
    
    let label = "NEUTRAL";
    if (score > 75) label = "EXTREME GREED";
    else if (score > 55) label = "GREED / BULLISH";
    else if (score < 25) label = "EXTREME FEAR";
    else if (score < 45) label = "FEAR / BEARISH";

    return { score, label };
  }, [news]);

  return (
    <div className="space-y-6" id="market-sentiment-module">
      {/* 1. SECTORS HEADER GRID SPAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Fear & Greed Index Dial (Left block) */}
        <div className="lg:col-span-4 border border-slate-800 bg-slate-900/30 rounded-xl p-5 flex flex-col justify-between align-center text-center">
          <div>
            <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">QuantMind Sentiment Tracker</span>
            <h3 className="text-sm font-semibold text-slate-200 mt-1">Fear & Greed Composite Index</h3>
          </div>

          {/* Symmetrical Dial graphic */}
          <div className="relative my-6 flex justify-center items-center">
            <svg className="w-40 h-24" viewBox="0 0 100 50">
              {/* Dial Background arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#1e293b"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Dial Color gradients underlay */}
              <path
                d="M 10 50 A 40 40 0 0 1 50 10"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="12"
                strokeDasharray="30 100"
                strokeLinecap="round"
              />
              <path
                d="M 50 10 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeDasharray="60 100"
                strokeLinecap="round"
              />

              {/* Dial Needle */}
              {/* Needle angle conversion: sentimentStats.score out of 100 goes from 180 degrees to 0 degrees */}
              {(() => {
                const angleRad = Math.PI - (sentimentStats.score / 100) * Math.PI;
                const needleLength = 32;
                const x2 = 50 + needleLength * Math.cos(angleRad);
                const y2 = 50 - needleLength * Math.sin(angleRad);
                return (
                  <>
                    <line
                      x1="50"
                      y1="50"
                      x2={x2.toFixed(1)}
                      y2={y2.toFixed(1)}
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="50" cy="50" r="4.5" fill="#4f46e5" />
                  </>
                );
              })()}
            </svg>

            {/* Score Overlay */}
            <div className="absolute bottom-1 text-center">
              <span className="block text-2xl font-bold font-mono text-white leading-none">
                {sentimentStats.score}
              </span>
              <span className={`text-[9px] font-mono font-bold uppercase block mt-1.5 ${
                sentimentStats.score > 55 ? "text-emerald-400" : sentimentStats.score < 45 ? "text-red-400" : "text-yellow-400"
              }`}>
                {sentimentStats.label}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-mono leading-normal px-2">
            Derived from automated NLP sentiment analysis of BSE listings, media reports, and FII trading indexes.
          </p>
        </div>

        {/* Financial News Feed (Right block) */}
        <div className="lg:col-span-8 border border-slate-800 bg-slate-900/30 rounded-xl p-5 space-y-4" id="financial-news-feed">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Real-time Financial Wire (BSE/NSE Scrips)</span>
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase">LIVE WIRE STREAM</span>
          </div>

          <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
            {news.map((item) => {
              const bgClass =
                item.sentiment === "BULLISH"
                  ? "bg-emerald-950/20 border-emerald-500/25 text-emerald-400"
                  : item.sentiment === "BEARISH"
                  ? "bg-red-950/20 border-red-500/25 text-red-400"
                  : "bg-slate-950 border-slate-850 text-slate-400";

              return (
                <div
                  key={item.id}
                  className="p-3 bg-slate-900/60 border border-slate-850 rounded-lg flex space-x-3 items-start hover:border-slate-800 transition"
                >
                  <span className={`px-2 py-0.5 border text-[9px] rounded font-mono font-bold shrink-0 mt-0.5 ${bgClass}`}>
                    {item.sentiment} ({item.score})
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs text-white font-sans font-medium leading-relaxed">
                      {item.title}
                    </p>
                    <div className="flex items-center space-x-3 text-[9px] text-slate-500 font-mono pt-1">
                      <span>Source: {item.source}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                      {item.impactSectors.map((s) => (
                        <span key={s} className="bg-indigo-950 text-indigo-400 px-1.5 py-0.3 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. INSIDER, BULK & BLOCK DEALS LISTING */}
      <div className="border border-slate-800 bg-slate-900/10 rounded-xl p-5 space-y-4" id="insider-block-deals">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Insider Transactions & Large Block Deals</span>
          </h3>
          <span className="text-[9px] text-slate-500 font-mono tracking-wider">
            AMOUNTS EXCEEDING ₹5 CRORES
          </span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] text-left">
                <th className="pb-3 text-left">SCRIP</th>
                <th className="pb-3 text-left">PROMOTER / INSTITUTION</th>
                <th className="pb-3 text-center">TYPE</th>
                <th className="pb-3 text-right">SHARES TRADED</th>
                <th className="pb-3 text-right">VALUE (INR CR)</th>
                <th className="pb-3 text-center">CONFIDENCE SIGNAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {insiderDeals.map((deal) => {
                const isBuy = deal.type.includes("BUY");
                const labelClass = isBuy
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-950 text-red-400 border border-red-500/20";

                return (
                  <tr key={deal.id} className="hover:bg-slate-950/20 transition">
                    <td className="py-3 font-semibold font-mono text-white text-xs">{deal.company}</td>
                    <td className="py-3 text-left font-sans text-[11px] text-slate-400">{deal.promoter}</td>
                    <td className="py-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${labelClass}`}>
                        {deal.type}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono">{deal.shares.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono font-bold text-slate-200">₹{deal.valueCr} Cr</td>
                    <td className="py-3 text-center font-mono">
                      <span className={`text-[10px] font-bold ${
                        deal.confidenceEffect === "POSITIVE"
                          ? "text-emerald-400"
                          : deal.confidenceEffect === "NEGATIVE"
                          ? "text-red-400"
                          : "text-slate-500"
                      }`}>
                        {deal.confidenceEffect === "POSITIVE" ? (
                          <span className="flex items-center justify-center space-x-1">
                            <ThumbsUp className="w-3 h-3 text-emerald-400" />
                            <span>ACCUMULATION</span>
                          </span>
                        ) : deal.confidenceEffect === "NEGATIVE" ? (
                          <span className="flex items-center justify-center space-x-1">
                            <ThumbsDown className="w-3 h-3 text-red-400" />
                            <span>LIQUIDATION</span>
                          </span>
                        ) : (
                          <span>STABLE</span>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
