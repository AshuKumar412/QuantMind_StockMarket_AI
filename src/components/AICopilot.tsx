import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, ArrowRight, CornerDownRight, ShieldAlert, Cpu } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
}

export default function AICopilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "C-0",
      sender: "copilot",
      text: "Welcome to QuantMind AI Copilot. Representing Goldman Sachs wealth intelligence, I am ready to analyze NSE/BSE stock behaviors, institutional order blocks, macro trends, or sector momentum. Ask me structural questions or click the options below.",
      timestamp: "10:00 AM"
    }
  ]);
  
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest chats
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const presetQueries = [
    { label: "Why is HDFC Bank lagging?", text: "Why is HDFC Bank falling today and how does NIM compression affect its banking valuation indexes?" },
    { label: "Strongest momentum stocks?", text: "Which NIFTY 50 and midcap stocks have the strongest technical momentum right now according to sector money flow?" },
    { label: "Outlook for India IT Exports?", text: "What is the strategic outlook for Indian Information Technology exports and consultancies under rupee weakness cycles?" },
    { label: "Best sector rotation targets?", text: "Which sectors represent the best accumulation targets as capital rotates out of banking and finance?" }
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim()) return;

    // Add user chat node
    const userMsg: ChatMessage = {
      id: "U-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/market/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend })
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: "C-" + Date.now(),
            sender: "copilot",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: "C-" + Date.now(),
          sender: "copilot",
          text: "ERROR: Failed to contact the AI Copilot. Please confirm that your Gemini API Key is authorized and defined in your Secrets configuration panel.\n\nSimulated Strategic Action Note: It is currently recommended to shift focus to defensive holdings (Pharma/IT) while HDFC consolidates.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-slate-800 bg-slate-900/30 rounded-xl p-5 flex flex-col h-[550px]" id="market-copilot-module">
      
      {/* Copilot header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
        <div className="flex items-center space-x-2.5">
          <Cpu className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200">QuantMind AI Conversational Copilot</h3>
            <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider">POWERED BY GEMINI 3.5 FLASH</span>
          </div>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1.5 bg-emerald-950/20 py-0.5 px-2 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PORTAL COGNITIVE LINKED</span>
        </span>
      </div>

      {/* Suggested prompts list (Only shown if very first conversation) */}
      <div className="p-3.5 bg-slate-950/40 border-b border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-2 shrink-0">
        {presetQueries.map((query, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(query.text)}
            className="p-2 bg-slate-900 border border-slate-850 hover:border-indigo-500 rounded-lg text-[11px] text-slate-400 hover:text-white transition text-left flex items-start space-x-2"
          >
            <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span className="truncate">{query.label}</span>
          </button>
        ))}
      </div>

      {/* Dialog box body */}
      <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 font-sans text-xs">
        {messages.map((m) => {
          const isCopilot = m.sender === "copilot";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isCopilot ? "justify-start" : "justify-end"}`}
            >
              {/* Avatar bubble */}
              {isCopilot && (
                <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div className={`p-3.5 rounded-xl border text-xs max-w-[85%] leading-relaxed ${
                isCopilot
                  ? "bg-slate-900/60 border-slate-850 text-slate-200 whitespace-pre-wrap"
                  : "bg-indigo-600/10 border-indigo-500/20 text-indigo-300"
              }`}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[10px] font-bold font-mono text-slate-500 mb-1 uppercase">
                    {isCopilot ? "COGNITIVE INTELLIGENCE HUB" : "INVESTOR VOUCHER"}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono ml-3">{m.timestamp}</span>
                </div>
                <p className="font-normal">{m.text}</p>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
            
            <div className="p-3.5 bg-slate-900/40 border border-slate-850 rounded-xl text-slate-500 font-mono text-[9px] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>QUANT COGNITIVE RESOLUTION RUNNING...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Inputs box */}
      <div className="relative pt-2 border-t border-slate-800/60 shrink-0">
        <input
          type="text"
          placeholder="Ask AI Copilot for research papers, ticker triggers, or macro signals..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          className="w-full pl-4 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none placeholder-slate-600 focus:border-indigo-500"
        />

        <button
          onClick={() => handleSendMessage()}
          className="absolute right-2 top-4.5 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
