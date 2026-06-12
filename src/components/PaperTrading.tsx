import React, { useState, useMemo, useEffect } from "react";
import { CompanyData } from "../utils/indianMarketSim";
import { LineChart, Wallet, ShoppingBag, PlusCircle, Trash, RefreshCw, Layers, TrendingUp, CheckCircle, Award } from "lucide-react";

interface Props {
  companies: CompanyData[];
  onSelectCompany?: (symbol: string) => void;
}

interface PaperOrder {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  qty: number;
  price: number;
  orderType: "MARKET" | "LIMIT" | "STOP_LOSS";
  triggerPrice?: number;
  status: "EXECUTED" | "PENDING";
  date: string;
}

interface PaperPosition {
  symbol: string;
  qty: number;
  avgCost: number;
}

export default function PaperTrading({ companies, onSelectCompany }: Props) {
  // Virtual account attributes
  const [cashBalance, setCashBalance] = useState<number>(() => {
    const cached = localStorage.getItem("quantmind_paper_cash");
    return cached ? Number(cached) : 1000000; // Starting virtual account ₹1,000,000
  });

  const [positions, setPositions] = useState<PaperPosition[]>(() => {
    const cached = localStorage.getItem("quantmind_paper_positions");
    return cached ? JSON.parse(cached) : [
      { symbol: "RELIANCE", qty: 50, avgCost: 2420 },
      { symbol: "TCS", qty: 20, avgCost: 3710 }
    ];
  });

  const [orders, setOrders] = useState<PaperOrder[]>(() => {
    const cached = localStorage.getItem("quantmind_paper_orders");
    return cached ? JSON.parse(cached) : [
      { id: "O-1", symbol: "HDFCBANK", type: "BUY", qty: 100, price: 1515, orderType: "LIMIT", status: "PENDING", date: "2026-06-12" }
    ];
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const cached = localStorage.getItem("quantmind_paper_watchlist");
    return cached ? JSON.parse(cached) : ["RELIANCE", "TCS", "HDFCBANK"];
  });

  // Persist states
  useEffect(() => {
    localStorage.setItem("quantmind_paper_cash", cashBalance.toString());
  }, [cashBalance]);

  useEffect(() => {
    localStorage.setItem("quantmind_paper_positions", JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem("quantmind_paper_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("quantmind_paper_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Order slip states
  const [selectedScrip, setSelectedScrip] = useState<string>("RELIANCE");
  const [orderAction, setOrderAction] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT" | "STOP_LOSS">("MARKET");
  const [qty, setQty] = useState<number>(10);
  const [price, setPrice] = useState<number>(2465);
  const [stopLossTrigger, setStopLossTrigger] = useState<number>(2400);
  const [successMsg, setSuccessMsg] = useState("");

  const activeCompany = useMemo(() => {
    return companies.find((c) => c.symbol === selectedScrip) || companies[0];
  }, [companies, selectedScrip]);

  // Sync active price when scrip shifts
  useEffect(() => {
    if (activeCompany) {
      setPrice(Number(activeCompany.price.toFixed(1)));
      setStopLossTrigger(Number((activeCompany.price * 0.95).toFixed(1)));
    }
  }, [selectedScrip, activeCompany]);

  // Calculate current portfolio asset value
  const holdingsValue = useMemo(() => {
    return positions.reduce((acc, pos) => {
      const co = companies.find((c) => c.symbol === pos.symbol);
      const currentPrice = co ? co.price : pos.avgCost;
      return acc + pos.qty * currentPrice;
    }, 0);
  }, [positions, companies]);

  const netAssetValue = useMemo(() => {
    return cashBalance + holdingsValue;
  }, [cashBalance, holdingsValue]);

  // Calculate portfolio P&L
  const totalUnrealizedPnl = useMemo(() => {
    return positions.reduce((acc, pos) => {
      const co = companies.find((c) => c.symbol === pos.symbol);
      const currentPrice = co ? co.price : pos.avgCost;
      const profit = (currentPrice - pos.avgCost) * pos.qty;
      return acc + profit;
    }, 0);
  }, [positions, companies]);

  // Handlers
  const handleAddToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((s) => s !== symbol));
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) return;

    const targetPrice = orderType === "MARKET" ? activeCompany.price : price;
    const orderCost = qty * targetPrice;

    if (orderAction === "BUY") {
      if (orderCost > cashBalance) {
        alert("CRITICAL ERROR: Insufficient virtual cash balance to settle transaction.");
        return;
      }

      if (orderType === "MARKET") {
        // Execute immediately
        setCashBalance((prev) => prev - orderCost);
        // Update positions
        const existingIdx = positions.findIndex((p) => p.symbol === selectedScrip);
        if (existingIdx >= 0) {
          const updated = [...positions];
          const match = updated[existingIdx];
          const totalCost = (match.qty * match.avgCost) + orderCost;
          const newQty = match.qty + qty;
          updated[existingIdx] = {
            symbol: selectedScrip,
            qty: newQty,
            avgCost: Number((totalCost / newQty).toFixed(2))
          };
          setPositions(updated);
        } else {
          setPositions([...positions, { symbol: selectedScrip, qty, avgCost: targetPrice }]);
        }

        // Add to history
        setOrders([
          {
            id: "O-" + Date.now(),
            symbol: selectedScrip,
            type: "BUY",
            qty,
            price: targetPrice,
            orderType: "MARKET",
            status: "EXECUTED",
            date: new Date().toISOString().split("T")[0]
          },
          ...orders
        ]);
        setSuccessMsg(`Market BUY of ${qty} shares of ${selectedScrip} successfully filled at ₹${targetPrice}!`);
      } else {
        // LIMIT or STOP LOSS (Pending)
        setOrders([
          {
            id: "O-" + Date.now(),
            symbol: selectedScrip,
            type: "BUY",
            qty,
            price: targetPrice,
            orderType,
            triggerPrice: orderType === "STOP_LOSS" ? stopLossTrigger : undefined,
            status: "PENDING",
            date: new Date().toISOString().split("T")[0]
          },
          ...orders
        ]);
        setSuccessMsg(`Pending LIMIT BUY of ${qty} shares of ${selectedScrip} at ₹${targetPrice} recorded into book.`);
      }
    } else {
      // SELL side
      const existingPos = positions.find((p) => p.symbol === selectedScrip);
      if (!existingPos || existingPos.qty < qty) {
        alert("CRITICAL ERROR: Insufficient position shares to execute liquidation.");
        return;
      }

      if (orderType === "MARKET") {
        // execute immediately
        const gainValue = qty * targetPrice;
        setCashBalance((prev) => prev + gainValue);

        // adjust position
        const updated = positions
          .map((p) => {
            if (p.symbol === selectedScrip) {
              return { ...p, qty: p.qty - qty };
            }
            return p;
          })
          .filter((p) => p.qty > 0);
        setPositions(updated);

        // Add to history
        setOrders([
          {
            id: "O-" + Date.now(),
            symbol: selectedScrip,
            type: "SELL",
            qty,
            price: targetPrice,
            orderType: "MARKET",
            status: "EXECUTED",
            date: new Date().toISOString().split("T")[0]
          },
          ...orders
        ]);
        setSuccessMsg(`Market SELL of ${qty} shares of ${selectedScrip} filled at ₹${targetPrice}!`);
      } else {
        // LIMIT or STOP_LOSS
        setOrders([
          {
            id: "O-" + Date.now(),
            symbol: selectedScrip,
            type: "SELL",
            qty,
            price: targetPrice,
            orderType,
            triggerPrice: orderType === "STOP_LOSS" ? stopLossTrigger : undefined,
            status: "PENDING",
            date: new Date().toISOString().split("T")[0]
          },
          ...orders
        ]);
        setSuccessMsg(`Pending LIMIT SELL of ${qty} shares of ${selectedScrip} placed.`);
      }
    }

    // Reset feedback message
    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  const handleCancelOrder = (id: string) => {
    setOrders(orders.filter((o) => o.id !== id));
  };

  const handleClearSaves = () => {
    if (confirm("Reset paper trading ledger and restore seed balance of ₹10,00,000?")) {
      setCashBalance(1000000);
      setPositions([]);
      setOrders([]);
      localStorage.removeItem("quantmind_paper_cash");
      localStorage.removeItem("quantmind_paper_positions");
      localStorage.removeItem("quantmind_paper_orders");
    }
  };

  return (
    <div className="space-y-6" id="paper-trading-module">
      {/* 1. PORTFOLIO VIRTUAL NET BALANCE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-slate-800 bg-slate-900/40 p-4 rounded-xl">
          <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">Account net Asset value (NAV)</span>
          <div className="text-xl font-bold font-sans text-white mt-1.5 flex items-baseline space-x-1.5">
            <span>₹{netAssetValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
            <span className="text-[10px] text-indigo-400 font-mono">INR</span>
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900/40 p-4 rounded-xl">
          <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">Available Trading Cash</span>
          <div className="text-xl font-bold font-sans text-slate-300 mt-1.5">
            ₹{cashBalance.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900/40 p-4 rounded-xl">
          <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">Holding Assets value</span>
          <div className="text-xl font-bold font-sans text-slate-300 mt-1.5">
            ₹{holdingsValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900/40 p-4 rounded-xl">
          <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">Unrealized profit/loss</span>
          <span className={`text-xl font-bold font-sans mt-1.5 block ${totalUnrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {totalUnrealizedPnl >= 0 ? "+" : ""}₹{totalUnrealizedPnl.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </span>
        </div>
      </div>

      {/* 2. TRADING INTERFACE BODY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Watchlist module (Left) */}
        <div className="lg:col-span-3 border border-slate-800 bg-slate-900/10 rounded-xl p-4.5 space-y-4" id="paper-watchlist">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center space-x-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Demat Watchlist</span>
            </h4>
            <span className="text-[8px] font-mono text-slate-500 uppercase">{watchlist.length} SAVED</span>
          </div>

          <div className="space-y-2">
            {watchlist.map((sym) => {
              const comp = companies.find((c) => c.symbol === sym);
              if (!comp) return null;
              const isPos = comp.change >= 0;
              return (
                <div
                  key={sym}
                  className="p-2.5 bg-slate-900/50 border border-slate-850 rounded-lg hover:border-slate-800 cursor-pointer flex justify-between items-center transition"
                  onClick={() => {
                    setSelectedScrip(sym);
                    if (onSelectCompany) onSelectCompany(sym);
                  }}
                >
                  <div>
                    <span className="block font-bold font-mono text-white text-xs">{sym}</span>
                    <span className="text-[9px] text-slate-500 leading-none truncate max-w-[100px] block">{comp.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-semibold font-mono text-slate-200">₹{comp.price.toFixed(1)}</span>
                    <span className={`text-[9px] font-mono ${isPos ? "text-emerald-400" : "text-red-400"}`}>
                      {isPos ? "+" : ""}{comp.pctChange}%
                    </span>
                  </div>
                </div>
              );
            })}
            {watchlist.length === 0 && (
              <p className="text-[10px] text-slate-500 font-mono text-center py-6">Watchlist contains no active trackers</p>
            )}
          </div>

          {/* Quick tracker helper */}
          <div className="pt-2 border-t border-slate-800/65">
            <span className="block text-[9px] text-slate-500 font-mono uppercase mb-2">Pin other scrips:</span>
            <div className="flex flex-wrap gap-1.5">
              {companies.filter((c) => !watchlist.includes(c.symbol)).slice(0, 4).map((c) => (
                <button
                  key={c.symbol}
                  onClick={() => handleAddToWatchlist(c.symbol)}
                  className="px-2 py-0.5 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-[10px] rounded font-mono text-slate-400"
                >
                  + {c.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trade execution ticket voucher (Center) */}
        <div className="lg:col-span-5 border border-slate-800 bg-slate-900/30 rounded-xl p-5" id="paper-order-voucher">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-4">
            <h4 className="text-sm font-semibold text-slate-200">Simulated Order Ticket</h4>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-mono px-2 py-0.5 rounded uppercase font-bold">NSE DEMAT GATE</span>
          </div>

          {successMsg && (
            <div className="p-3 mb-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-200 flex items-center space-x-2 animate-pulse">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="space-y-4 font-sans text-xs">
            {/* select scrip */}
            <div>
              <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Target Scrip</label>
              <select
                value={selectedScrip}
                onChange={(e) => setSelectedScrip(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none"
              >
                {companies.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.symbol} (₹{c.price.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>

            {/* order direction action */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setOrderAction("BUY")}
                className={`py-2 rounded font-bold font-mono text-xs transition ${
                  orderAction === "BUY" ? "bg-emerald-600 text-white shadow-md font-extrabold" : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}
              >
                BUY VOUCHER
              </button>
              <button
                type="button"
                onClick={() => setOrderAction("SELL")}
                className={`py-2 rounded font-bold font-mono text-xs transition ${
                  orderAction === "SELL" ? "bg-red-600 text-white shadow-md font-extrabold" : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}
              >
                SELL VOUCHER
              </button>
            </div>

            {/* order type */}
            <div>
              <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Execution Type</label>
              <div className="grid grid-cols-3 gap-2 text-center p-1 bg-slate-950 rounded-lg border border-slate-850">
                {(["MARKET", "LIMIT", "STOP_LOSS"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t)}
                    className={`py-1 text-[10px] font-mono rounded ${
                      orderType === t ? "bg-indigo-600 text-white font-bold" : "text-slate-500"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty and price fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Order shares (Qty)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-sm font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                  {orderType === "MARKET" ? "Indicated Quote (₹)" : "Limit Target Price (₹)"}
                </label>
                <input
                  type="number"
                  required
                  disabled={orderType === "MARKET"}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-sm font-mono disabled:opacity-40 focus:outline-none"
                />
              </div>
            </div>

            {/* conditional trigger stop price */}
            {orderType === "STOP_LOSS" && (
              <div className="p-3 bg-red-950/10 border border-red-900/25 rounded-lg">
                <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Trailing Trigger threshold (₹)</label>
                <input
                  type="number"
                  required
                  value={stopLossTrigger}
                  onChange={(e) => setStopLossTrigger(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono focus:outline-none text-red-300"
                />
                <span className="block text-[8px] text-slate-500 font-mono mt-1 leading-normal uppercase">
                  IF QUOTE CROSSES THIS LEVEL, MARQUEE SYSTEMS GENERATE EMERGENCY LIQUIDATION VOUCHERS.
                </span>
              </div>
            )}

            {/* Submit btn */}
            <button
              type="submit"
              className={`w-full py-2.5 text-white font-mono rounded text-xs transition uppercase font-bold flex items-center justify-center space-x-1.5 ${
                orderAction === "BUY" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Settle simulated voucher</span>
            </button>
          </form>
        </div>

        {/* Positions Ledger (Right) */}
        <div className="lg:col-span-4 border border-slate-800 bg-slate-900/10 rounded-xl p-4.5 space-y-4" id="paper-positions">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Position Books</span>
            </h4>
            <button
              onClick={handleClearSaves}
              title="Reset accounts ledger"
              className="p-1 hover:bg-slate-800 text-slate-500 hover:text-slate-200 border border-transparent rounded transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-75 overflow-y-auto pr-1 text-xs">
            {positions.map((pos) => {
              const co = companies.find((c) => c.symbol === pos.symbol);
              const currentPrice = co ? co.price : pos.avgCost;
              const invested = pos.qty * pos.avgCost;
              const valuation = pos.qty * currentPrice;
              const pnl = valuation - invested;
              const isPos = pnl >= 0;

              return (
                <div key={pos.symbol} className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl hover:border-slate-800 transition">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="font-bold text-white text-xs">{pos.symbol}</span>
                    <span className="text-[10px] text-slate-500">{pos.qty} Shares</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-mono mt-2 pt-1 border-t border-slate-800/40">
                    <div>
                      <span>Avg Cost:</span>
                      <span className="block text-slate-300 font-semibold mt-0.5">₹{pos.avgCost.toFixed(1)}</span>
                    </div>
                    <div>
                      <span>Bid Quote:</span>
                      <span className="block text-slate-300 font-semibold mt-0.5">₹{currentPrice.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline mt-3">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Book PnL</span>
                    <span className={`font-mono text-xs font-bold ${isPos ? "text-emerald-400" : "text-red-400"}`}>
                      {isPos ? "+" : ""}₹{pnl.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {positions.length === 0 && (
              <p className="text-[10px] text-slate-500 font-mono text-center py-8">No active simulated stock holdings</p>
            )}
          </div>
        </div>

      </div>

      {/* 3. ORDER HISTORY / TRANSACTION LOG BOOK */}
      <div className="border border-slate-800 bg-slate-900/10 rounded-xl p-5" id="paper-orders-history">
        <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-3">Voucher Activity Journals</h4>
        
        <div className="overflow-x-auto text-[11px] font-mono">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-left">
                <th className="pb-2">DATE</th>
                <th className="pb-2">SCRIP</th>
                <th className="pb-2 text-center">ACTION</th>
                <th className="pb-2">TYPE</th>
                <th className="pb-2 text-right">QUANTITY</th>
                <th className="pb-2 text-right">SETTLEMENT BID</th>
                <th className="pb-2 text-center">STATUS</th>
                <th className="pb-2 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/45 text-slate-300">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-950/20">
                  <td className="py-2.5 font-sans">{o.date}</td>
                  <td className="py-2.5 font-bold text-white text-xs">{o.symbol}</td>
                  <td className="py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      o.type === "BUY" ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
                    }`}>
                      {o.type}
                    </span>
                  </td>
                  <td className="py-2.5 uppercase font-medium">{o.orderType}</td>
                  <td className="py-2.5 text-right font-bold">{o.qty}</td>
                  <td className="py-2.5 text-right">₹{o.price.toLocaleString()}</td>
                  <td className="py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      o.status === "EXECUTED" ? "bg-slate-950 text-indigo-400 border border-slate-800" : "bg-yellow-950 text-yellow-400"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    {o.status === "PENDING" ? (
                      <button
                        onClick={() => handleCancelOrder(o.id)}
                        className="py-0.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-red-400 text-[10px] rounded border border-slate-850"
                      >
                        CANCEL
                      </button>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500 font-mono">No actions found on virtual terminal registers.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
