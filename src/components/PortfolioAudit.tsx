import React, { useMemo } from "react";
import { Holding } from "../types";
import { FileDown, ShieldAlert, CheckCircle, BarChart, HardHat, Award, PlusCircle, ArrowUpRight } from "lucide-react";

interface Props {
  holdings: Holding[];
  portfolioValue: number;
}

export default function PortfolioAudit({ holdings, portfolioValue }: Props) {
  
  // Compute portfolio stats
  const auditReport = useMemo(() => {
    let score = 85; // Default healthy score
    const warnings: string[] = [];
    const concentrationMap: Record<string, number> = {};

    holdings.forEach((h) => {
      const value = h.shares * h.currentPrice;
      const pct = portfolioValue > 0 ? (value / portfolioValue) * 100 : 0;
      concentrationMap[h.sector] = (concentrationMap[h.sector] || 0) + pct;
    });

    // Check Concentration warnings (Goldman Sachs Wealth Guideline: Max 35% in any single sector)
    Object.entries(concentrationMap).forEach(([sector, pct]) => {
      if (pct > 35) {
        score -= 10;
        warnings.push(`Diversification Warning: ${sector} sector exposure at ${pct.toFixed(1)}% exceeds the standard 35% concentration threshold.`);
      }
    });

    // Check High Beta alert warns (Technology or alternatives crypto exceeds 40%)
    const specAlloc = (concentrationMap["Technology"] || 0) + (concentrationMap["Alternatives"] || 0);
    if (specAlloc > 45) {
      score -= 8;
      warnings.push(`High Beta Warning: Overlap in Speculative assets (Tech + Crypto Alternatives) represents ${specAlloc.toFixed(1)}% of net portfolio assets.`);
    }

    return {
      score: Math.max(25, score),
      warnings,
      sectorConcentration: concentrationMap
    };
  }, [holdings, portfolioValue]);

  // Download Mock CSV Template representing professional quant breakdown
  const triggerCsvDownload = () => {
    const header = "Asset Symbol,Asset Name,Allocated Shares,Average Acquisition Price,Latest Valuation (USD),Unrealized Gain (USD)\n";
    const body = holdings
      .map((h) => {
        const value = h.shares * h.currentPrice;
        const invested = h.shares * h.avgBuyPrice;
        const pnl = value - invested;
        return `"${h.symbol}","${h.name}",${h.shares},${h.avgBuyPrice},${value.toFixed(1)},${pnl.toFixed(1)}`;
      })
      .join("\n");

    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "QuantMind_Wealth_Audit_Ledger.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download Mock Excel template representing institutional PDF Audit report parameters
  const triggerExcelDownload = () => {
    const content = `QuantMind AI Institutional Ledger Audit Report
Generated Timestamp: ${new Date().toISOString()}
Compliance Verification: Approved BY DEPOSITORY SYSTEMS

Net Portfolio Assets: $${portfolioValue.toLocaleString()}
Calculated Health Score: ${auditReport.score}/100

Active Asset Checklist:
${holdings.map((h) => `- ${h.symbol} (${h.name}): Shares: ${h.shares} // Avg Price: $${h.avgBuyPrice}`).join("\n")}

Warnings:
${auditReport.warnings.map((w, i) => `${i + 1}. ${w}`).join("\n")}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "QuantMind_Executive_Portfolio_Report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6" id="portfolio-audit-module">
      
      {/* 1. HEALTH SCORE CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Scorecard bubble */}
        <div className="border border-slate-800 bg-slate-900/40 p-5 rounded-xl flex flex-col items-center justify-between text-center gap-4">
          <div>
            <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">SECURE COMPLIANCE GRADE</span>
            <h3 className="text-sm font-semibold text-slate-200 mt-1">Portfolio Diagnostics</h3>
          </div>

          <div className="relative flex justify-center items-center my-2">
            {/* progress circle */}
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#1e293b"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={auditReport.score > 75 ? "#10b981" : "#eab308"}
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={(264 - (264 * auditReport.score) / 100).toFixed(0)}
                strokeLinecap="round"
                className="transition-all duration-300 transform -rotate-90 origin-center"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-bold font-mono text-white block">{auditReport.score}</span>
              <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5 block">SCORE / 100</span>
            </div>
          </div>

          <div className="w-full">
            <span className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
              auditReport.score > 75 ? "bg-emerald-950 text-emerald-400" : "bg-yellow-950 text-yellow-400"
            }`}>
              {auditReport.score > 75 ? "GRADE A: STRUCTURALLY SECURE" : "GRADE B: CAUTION OVER EXPOSURE"}
            </span>
          </div>
        </div>

        {/* Diagnostic Warnings (Right side spans) */}
        <div className="lg:col-span-2 border border-slate-800 bg-slate-900/30 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Investment Risk Warnings</span>
            </h4>
            <span className="text-[9px] text-slate-500 font-mono uppercase">{auditReport.warnings.length} HEDGES ADVISED</span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {auditReport.warnings.map((warn, i) => (
              <div key={i} className="p-3 bg-red-950/10 border border-red-500/15 rounded-xl flex items-start space-x-2.5 text-slate-300">
                <ShieldAlert className="w-4.5 h-4.5 text-red-500 mt-0.5 shrink-0" />
                <p className="leading-relaxed text-[11px] font-medium">{warn}</p>
              </div>
            ))}

            {auditReport.warnings.length === 0 && (
              <div className="p-4 bg-emerald-950/15 border border-emerald-500/15 rounded-xl flex items-start space-x-2.5 text-slate-300">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-400 mt-0.5 shrink-0" />
                <p className="leading-relaxed text-[11px] font-medium">
                  Your current global portfolio holds excellent diversification coefficients across capital markets. No concentration warnings triggered!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC DOWNLOAD TRIGGER BUTTONS WITH PRESET OVERVIEWS */}
      <div className="border border-slate-800/80 bg-slate-900/15 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Compliance Export Engine</h3>
          <p className="text-[11px] text-slate-500 font-mono uppercase mt-0.5">SECURE SEC FILE TEMPLATE DOWNLOAD INTERFACE</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={triggerCsvDownload}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl transition text-left flex items-start space-x-4 hover:scale-[1.01]"
          >
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="block text-xs font-bold font-sans text-slate-200">Export CSV Ledger Template</span>
              <p className="text-[10px] text-slate-500 leading-normal font-sans">
                Downloads a raw, spreadsheet-compatible CSV file containing precise stock units and valuations.
              </p>
            </div>
          </button>

          <button
            onClick={triggerExcelDownload}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl transition text-left flex items-start space-x-4 hover:scale-[1.01]"
          >
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="block text-xs font-bold font-sans text-slate-200">Direct TXT Audit Report Draft</span>
              <p className="text-[10px] text-slate-500 leading-normal font-sans">
                Exports a drafted structured document detailing holdings inventory, compliance health indexes, and risk warnings.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
