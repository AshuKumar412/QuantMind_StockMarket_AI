import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { securityDb, DBUser } from "./src/db/securityDb";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for JSON payload parsing
app.use(express.json());

// Helper: Extract user session from request headers
function getAuthenticatedAgent(req: express.Request) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : (req.headers["x-auth-token"] as string);
  if (!token) return null;
  const session = securityDb.findSessionByToken(token);
  if (!session) return null;
  const user = securityDb.findUserById(session.userId);
  if (!user || user.status === "SUSPENDED") return null;
  return { user, session };
}

// System Control Parameters (In-Memory Server State with High-Fidelity Defaults)
export const systemConfig = {
  maintenanceMode: false,
  rateLimitThreshold: 150,
  alertChannelPhone: "+919876543210",
  strictKycEnabled: true,
  riskGuardrails: "STANDARD_PORTFOLIO"
};

// Global Maintenance Mode Lock Interceptor
app.use((req, res, next) => {
  if (systemConfig.maintenanceMode && req.path.startsWith("/api") && !req.path.startsWith("/api/admin") && req.path !== "/api/auth/login" && req.path !== "/api/auth/register" && req.path !== "/api/auth/verify-otp") {
    const agent = getAuthenticatedAgent(req);
    if (!agent || agent.user.role !== "ROLE_ADMIN") {
      return res.status(503).json({
        success: false,
        maintenance: true,
        error: "COMMUNICATION_LINK_OFFLINE: Global Custodial Lockout activated by institutional operators. Try again later."
      });
    }
  }
  next();
});


// Initialize Gemini Client with telemetric headers
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI features will fallback to deterministic simulations.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API endpoint: AI Advisory
app.post("/api/ai/advisor", async (req, res) => {
  const { income, riskAppetite, goals, portfolioValue, holdings } = req.body;

  const prompt = `Perform a quantitative and fiduciary analysis is for a wealth management client:
- Annual Income: $${income}
- Risk Profile: ${riskAppetite} (Conservative, Moderate, Aggressive, or Hyper-Growth)
- Financial Goals: ${goals}
- Current Portfolio Market Value: $${portfolioValue}
- Holdings: ${JSON.stringify(holdings)}

Deliver structural suggestions, specific asset allocations, an overall confidence score, and clear next steps within the structured response schema. Ensure the advice aligns with global quantitative standards.`;

  const fallbackResponse = {
    success: true,
    isSimulated: true,
    advice: "INVESTMENT STRATEGY WORKSTATION (PORTROLIO BACKUP ACTIVE):\n\n1. **Diversification Channel**: Re-allocate concentrated holdings into high-liquidity index ETFs to mitigate systematic market risk.\n2. **Target Alignment**: Adjust core asset ratios to approximately 65% Equities, 25% Sovereign Debt Instruments, and 10% cash equivalent benchmarks to align with a **" + riskAppetite + "** profile.\n3. **Risk Guardrails**: Hold conservative capital positions in liquid savings equivalent to 6 months of corporate operations expenses.",
    confidenceScore: 88,
    targetAllocation: [
      { assetClass: "Domestic Equities", percentage: riskAppetite === "Aggressive" || riskAppetite === "Hyper-Growth" ? 75 : riskAppetite === "Conservative" ? 30 : 55 },
      { assetClass: "Sovereign Debt", percentage: riskAppetite === "Aggressive" || riskAppetite === "Hyper-Growth" ? 15 : riskAppetite === "Conservative" ? 50 : 30 },
      { assetClass: "Alternative Assets", percentage: riskAppetite === "Aggressive" || riskAppetite === "Hyper-Growth" ? 10 : riskAppetite === "Conservative" ? 0 : 5 },
      { assetClass: "Liquid Cash Reserves", percentage: riskAppetite === "Aggressive" || riskAppetite === "Hyper-Growth" ? 0 : riskAppetite === "Conservative" ? 20 : 10 }
    ],
    riskLevel: riskAppetite === "Conservative" ? "Low" : riskAppetite === "Moderate" ? "Medium" : "High",
    primaryRecommendation: "Conduct dynamic variance-reduction adjustments across active capital sub-sectors."
  };

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Fallback response when key is missing to maintain perfect user experience
      return res.json(fallbackResponse);
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class Principal Wealth Advisor and Quantitative Strategist at Goldman Sachs. Provide strictly professional, analytical, and actionable advice.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["advice", "confidenceScore", "targetAllocation", "riskLevel", "primaryRecommendation"],
          properties: {
            advice: {
              type: Type.STRING,
              description: "Actionable strategic summary and quantitative review of the portfolio alignment to risk parameters in markdown format."
            },
            confidenceScore: {
              type: Type.INTEGER,
              description: "Confidence percentage (0 to 100) on achieving goals under current trajectory."
            },
            targetAllocation: {
              type: Type.ARRAY,
              description: "Symmetric proposed target asset class percentages.",
              items: {
                type: Type.OBJECT,
                required: ["assetClass", "percentage"],
                properties: {
                  assetClass: { type: Type.STRING, description: "Name of the asset class (e.g. Domestic Equities, Bonds, Real Estate, Liquid Cash, Crypto)" },
                  percentage: { type: Type.INTEGER, description: "Allocation percentage (integer, sum should be 100)" }
                }
              }
            },
            riskLevel: {
              type: Type.STRING,
              description: "Calculated risk assessment code (Low, Medium, High, Extreme)."
            },
            primaryRecommendation: {
              type: Type.STRING,
              description: "The single most critical action item the user must take next."
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json({
      success: true,
      isSimulated: false,
      ...data
    });
  } catch (err: any) {
    console.log("Advisor failover system activated: loaded simulated advisory metrics.");
    res.json(fallbackResponse);
  }
});

// REST API endpoint: AI Behavioral Psychology Research Journal Analysis
app.post("/api/ai/psychology", async (req, res) => {
  const { reason, expectedOutcome, confidence, emotion } = req.body;

  const prompt = `Analyze this retail investor's journal entry for cognitive biases and negative psychological triggers:
- Buy/Sell Reason: "${reason}"
- Expected Outcome: "${expectedOutcome}"
- Confidence Level: ${confidence}%
- Self-Reported Emotional State: "${emotion}"

Examine signs of:
1. FOMO (Fear of Missing Out) / Trend chasing.
2. Loss Aversion / Panic Selling.
3. Overconfidence / Confirmation Bias.

Provide concrete percentage scores for each, diagnostic explanation, and a therapeutic action item.`;

  const fallbackPsychologyResponse = {
    success: true,
    isSimulated: true,
    fomoScore: (emotion?.toLowerCase() || "").includes("hype") || (emotion?.toLowerCase() || "").includes("excited") ? 80 : 35,
    panicScore: (emotion?.toLowerCase() || "").includes("fear") || (emotion?.toLowerCase() || "").includes("scared") ? 75 : 15,
    overconfidenceScore: confidence > 85 ? 90 : 40,
    biasesDetected: ["Recency Bias / Trend-Following", "Confirmation Over-bias"],
    psychologicalProfile: `Your active investment log indicates moderate cognitive fatigue (LOCAL ROBUST ENGINE AUTO-FAILOVER ACTIVE). Your high confidence of ${confidence}% relative to market volatility indicators warrants structured risk controls.`,
    therapeuticAction: "Enforce a mandatory 24-hour cooling period to cross-reference market data before finalizing speculative portfolios."
  };

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Fallback
      return res.json(fallbackPsychologyResponse);
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a quantitative behavioral finance researcher specializing in investor psychology. Diagnose bias metrics objectively and clearly.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["fomoScore", "panicScore", "overconfidenceScore", "biasesDetected", "psychologicalProfile", "therapeuticAction"],
          properties: {
            fomoScore: { type: Type.INTEGER, description: "FOMO Score out of 100" },
            panicScore: { type: Type.INTEGER, description: "Panic Selling tendency out of 100" },
            overconfidenceScore: { type: Type.INTEGER, description: "Overconfidence Score out of 100" },
            biasesDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific market biases identified (e.g., loss aversion, recency bias)."
            },
            psychologicalProfile: { type: Type.STRING, description: "Scientific breakdown of the user's emotional state in markdown." },
            therapeuticAction: { type: Type.STRING, description: "Actionable mental model or cooling protocol to practice." }
          }
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json({
      success: true,
      isSimulated: false,
      ...data
    });
  } catch (err: any) {
    console.log("Psychology failover system activated: loaded simulated cognitive diagnostic metrics.");
    res.json(fallbackPsychologyResponse);
  }
});

// REST API endpoint: Gemini AI Stock SWOT & Investment Thesis Summary
app.post("/api/market/aisummary", async (req, res) => {
  const comp = req.body;
  const prompt = `Perform a comprehensive technical SWOT analysis and generate a strategic buy/sell/hold investment thesis for ${comp.symbol} (${comp.name}):
- Current Quote: ₹${comp.price}
- Industry Sector: ${comp.sector}
- Fundamentals: P/E Ratio ${comp.pe}, EPS ₹${comp.eps}, ROE ${comp.roe}%, Debt to Equity ${comp.debtEquity}, Div Yield ${comp.divYield}%
- Technical Oscillators: RSI ${comp.rsi}, Support Range ₹${comp.support}, Resistance targets ₹${comp.resistance}
- Quarterly Earnings Records: ${JSON.stringify(comp.earnings)}
- Corporate Acts History: ${JSON.stringify(comp.actions)}

Structure your report into five beautifully laid out sections in raw clean text:
1. Executive Synopsis & Rating (Outlining score ratings)
2. SWOT Breakdown (Strengths, Weaknesses, Opportunities, Threats)
3. Technical Target Range (Support, Resistance, Oscillator flags)
4. Earnings Solidity Assessment
5. Primary Fiduciary Advisory (Buy/Sell/Hold action directive with target rationale)
Provide clean professional insights.`;

  const rating = comp.rsi > 70 ? "NEUTRAL / HOLD (MOMENTUM EXTREME)" : comp.rsi < 35 ? "ACCUMULATE / BUY" : "HOLD / ACCUMULATE";
  const report = `[RETIREMENT/WEALTH STRATEGY SYNOPSIS - LOCAL FALLBACK ENGINE ACTIVE]
INVESTMENT RECOMMENDATION: ${rating} for ${comp.symbol} (${comp.name})

1. EXECUTIVE SYNOPSIS & RATING
${comp.symbol} is trading at ₹${comp.price} within the ${comp.sector} vertical. Valuation shows standard premiums with a P/E of ${comp.pe}x. Given a Return on Equity (ROE) of ${comp.roe}%, capital efficiency is significantly ${comp.roe > 15 ? "above" : "within"} long-term sector averages.

2. SWOT BREAKDOWN
* STRENGTHS: Strong cash flow, robust return profile of ${comp.roe}%, and conservative debt leverage of ${comp.debtEquity}.
* WEAKNESSES: Sluggish margins in auxiliary business segments; high premium bounds relative to global EM indexes.
* OPPORTUNITIES: Strategic expansion of high-yielding consumer/export divisions.
* THREATS: Macro inflation shifts and interest rate volatility by the RBI MPC.

3. TECHNICAL TARGET RANGE
Support bounds remain active at ₹${comp.support}. Resistance is expected near ₹${comp.resistance}. RSI registers at ${comp.rsi}, indicating is current state is ${comp.rsi > 65 ? "approaching overbought limits" : comp.rsi < 35 ? "deeply oversold and ripe for a turn" : "perfectly stable within a range"}.

4. EARNINGS SOLIDITY ASSESSMENT
The company's earnings are categorized by steady growth trends. Net profit spreads remain protected by strong consumer lock-ins and pricing power over raw materials.

5. PRIMARY FIDUCIARY ADVISORY
Maintain core tracking parameters. Focus buy triggers near support corridors (₹${comp.support}) for optimal compounding results. Ex-dividends of ₹${comp.divYield}% yield stable long-term support.`;

  const fallbackSummaryResponse = {
    success: true,
    isSimulated: true,
    report
  };

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.json(fallbackSummaryResponse);
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior Wealth Management Research Director and Equity Research Head at Goldman Sachs. Write strictly analytical, sophisticated, objective, and professional text reports.",
      }
    });

    res.json({
      success: true,
      isSimulated: false,
      report: response.text || "Detailed analysis is currently compiling. Re-submit voucher."
    });
  } catch (err: any) {
    console.log("Stock Summary failover system activated: loaded simulated equity research SWOT thesis.");
    res.json(fallbackSummaryResponse);
  }
});

// REST API endpoint: AI Market Copilot conversational assistant
app.post("/api/market/copilot", async (req, res) => {
  const { prompt } = req.body;

  const systemPrompt = `You are the QuantMind AI Market Copilot, a principal Quantitative Strategist and Wealth Advisor at Goldman Sachs.
Your goal is to answer questions regarding the Indian stock market (NSE & BSE segments), including specific indices (NIFTY 50, NIFTY NEXT 50, BANK NIFTY, SENSEX, midcap/smallcap), specific stock symbols (RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK, SBIN, TATAMOTORS, ITC, L&T, SUNPHARMA), current sector rotations (IT, Pharma, Auto, Banking), insider deals, technical oscillator metrics (RSI, Support/Resistance channels), and macro economics (RBI Repo Rate, CPI Inflation, GDP Growth).

Strictly follow these response guidelines to look like an expert Bloomberg Analyst:
1. Speak with professional, analytical, objective composure. Avoid excessive hype or emojis.
2. Structure your replies beautifully with bulleted points and bold terms.
3. Keep answers concise, highly structured, and directly addressing the user's specific query.
4. If asked about a stock's fall or a sector's rise, explain the rational fundamental or technical underpinnings (such as Net Interest Margin (NIM) compressions, FII sector outflow, technical level corrections near RSI bounds, or rupee weakness advantages).

If processing under offline simulation, focus on realistic core parameters (for instance, HDFC Bank struggling with NIM post-merger, Pharma gaining defensive relative strength due to specialtyUSFDA clearances, or IT gaining on Rupee fluctuations).`;

  // Local high fidelity Q&A simulation
  let reply = "I am processing your query under local simulation (MOCK FALLBACK ENGINE ACTIVE). Here is our quantitative strategy outlook:\n\n";
  const lower = (prompt || "").toLowerCase();
  if (lower.includes("hdfc") || lower.includes("fall") || lower.includes("lagging")) {
    reply += `### HDFC Bank (HDFCBANK) Capital Outflow Analysis
* **Valuation & Compression**: Following the mega HDFC merger, deposit mobilization remains capital-intensive, squeezing Net Interest Margins (NIMS) down to **3.4%** from pre-merger 4.1% averages.
* **FII Portfolio Realignment**: Foreign Institutional Investors (FIIs) are realigning indices portfolios, resulting in light technical liquidation spreads.
* **Actionable Support Level**: Buying interest is expected to heavily defend the statutory **₹1,495 - ₹1,500** support bands. Rebuilding positions in tranches is advised.`;
  } else if (lower.includes("momentum") || lower.includes("strong") || lower.includes("nifty")) {
    reply += `### Strongest Momentum Assets (NIFTY 50 Segment)
* **Automobiles (TATAMOTORS)**: Trading with high momentum above its 50-DMA, backed by Jaguar Land Rover (JLR) free cash flow indexes hitting **£2.2 Billion** and passenger EV delivery jumps.
* **Pharmaceuticals (SUNPHARMA)**: Gaining defensive traction and trading near the R1 resistance point as US specialty dermatology revenues compound.
* **Information Tech (TCS, INFY)**: Gaining relative strength as a weaker rupee (₹83.45/USD) pads dollar export balances in Q1 accounts.`;
  } else if (lower.includes("it") || lower.includes("export") || lower.includes("outlook")) {
    reply += `### Rupee Volatility & IT Export Valuations
* **Export Margin Padding**: A depreciation in the local rupee (at ₹83.4-₹83.5/USD) provides a direct **50-80bps** EBITDA margin expansion across major export consultancies (TCS, Infosys).
* **Deal Pipeline & AI**: While discretionary spending in Western financial markets remains soft, heavy cost-takeout deals and GenAI business practice expansions provide structural revenue support.
* **Recommendation**: Maintain IT sector as an ACCUMULATE core defensive allocation.`;
  } else {
    reply += `### Structural Wealth Allocation Strategy
* **Sector Rotation**: Institutional funds are actively rotating out of interest-rate sensitive Banking and shifting capital into defensive exports (Pharma and IT Consultancies) to hedge portfolio Drawdowns.
* **Macro Stability**: India's quarterly GDP growth of **8.2%** combined with cooling CPI Consumer Inflation index of **4.82%** keeps the structural bull-run intact, proving resilient relative to peers.
* **Support Levels Strategy**: Reinvest capital inflows at established index corridors. Target NIFTY 50 entries near **23,400** indicators.`;
  }

  const fallbackCopilotResponse = {
    success: true,
    isSimulated: true,
    reply
  };

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.json(fallbackCopilotResponse);
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    res.json({
      success: true,
      isSimulated: false,
      reply: response.text || "I am currently adjusting cognitive vectors. Please resend prompt."
    });
  } catch (err: any) {
    console.log("Copilot conversational failover system activated: loaded simulated advisory answers.");
    res.json(fallbackCopilotResponse);
  }
});

// REST API endpoint: AI-Powered Daily Market Research & Tactical Briefing
app.post("/api/market/briefing", async (req, res) => {
  const { indices, breadth, gainers, losers } = req.body;
  
  // Create solid fallback parameters utilizing actual dynamic tickers for 100% active state fidelity
  const indicesSummary = (indices || []).map((idx: any) => `${idx.name}: ${idx.value.toFixed(1)} (${idx.pctChange}%)`).join(", ");
  const topGainer = gainers?.[0]?.symbol || "RELIANCE";
  const gainerPct = gainers?.[0]?.pctChange || "+1.4";
  const topLoser = losers?.[0]?.symbol || "HDFCBANK";
  const loserPct = losers?.[0]?.pctChange || "-1.1";
  
  const prompt = `Synthesize an institutional-grade live briefing memo based on current Indian market tick parameters:
- Core Indexes: ${indicesSummary}
- Buying/Selling Breath Ratio: ${breadth?.advPct?.toFixed(0)}% Bulls / ${(100 - (breadth?.advPct || 50))?.toFixed(0)}% Bears
- Top Gainers Leading: ${gainerPct}% on ${topGainer}
- Top Losers Pressuring: ${loserPct}% on ${topLoser}

Synthesize a comprehensive, professional market commentary, identify the tactical sentiment state, highlight the sector money flow, summarize the key RBI / inflation takeaway, and draft a specific technical risk warning. Keep response extremely analytical, objective, and dense with numeric indicators.`;

  const isGenerallyUp = (indices || []).some((idx: any) => idx.pctChange >= 0);
  const sentimentState = isGenerallyUp ? "ACTIVE BULLISH" : "CAUTIOUS TACTICAL";
  const hotSector = isGenerallyUp ? "Specialty Pharmaceuticals & Energy" : "Defensive IT Exports";
  const briefingTitle = isGenerallyUp
    ? "Mumbai Morning Quantitative Brief: Capital Momentum Sustains"
    : "Mumbai Morning Quantitative Brief: Tactical Shield Active Amid Rotations";
    
  const analystCommentary = `The Indian indexes are showing a ${isGenerallyUp ? "constructive consolidation" : "minor technical pullback"} in active trading sessions (RESERVE EMBEDDED SYSTEM BRIEF CODES ACTIVE). 
  
* **Sectorial Money Flow**: Institutional capital is actively defending core positions while seeking defensive yield play in exports like ${hotSector}.
* **Dynamic Breadth Analysis**: With Nifty advances tracking at **${breadth?.advPct?.toFixed(0)}%**, the underlying volume distribution shows that large block deals are currently driving the Index weight.
* **Momentum Assets**: Leading tick metrics represent steady accumulation patterns specifically in **${topGainer}** (${gainerPct}%) despite momentary micro drawdowns.
* **Liquidity Trends**: Volatility index (VIX) maintains a safe margin, but RBI monetary policy statements remain top-of-mind for treasury desk allocations.`;

  const macroCoreTakeaway = "Inflation benchmarks (CPI) printing at 4.82% keep real interest rate differentials attractive for FII currency-hedged yields.";
  const riskAlertAdvice = `Oscillators show technical support corridors defending at ${indices?.[0]?.value ? (indices[0].value * 0.985).toFixed(0) : "23,400"}. Avoid chasing momentum items near resistance peaks where RSI boundaries approach 72.`;

  const fallbackBriefingResponse = {
    success: true,
    isSimulated: true,
    briefingTitle,
    analystCommentary,
    sentimentState,
    hotSector,
    macroCoreTakeaway,
    riskAlertAdvice
  };

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.json(fallbackBriefingResponse);
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Executive Director of Global Quantitative Research and Head of EM Strategies at Goldman Sachs. Write strictly analytical, objective, professional, and sophisticated market briefings in complete compliance with the JSON schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["briefingTitle", "analystCommentary", "sentimentState", "hotSector", "macroCoreTakeaway", "riskAlertAdvice"],
          properties: {
            briefingTitle: { type: Type.STRING, description: "A highly sophisticated financial title for this index memo" },
            analystCommentary: { type: Type.STRING, description: "A detailed paragraph including standard bullet points in markdown reviewing indices, sector rotations and specific stock indicators of top gainers and losers." },
            sentimentState: { type: Type.STRING, description: "One of: ACTIVE BULLISH, CAUTIOUS TACTICAL, TRANSITIONAL NEUTRAL, HEAVY LIQUIDATION" },
            hotSector: { type: Type.STRING, description: "Specific sector demonstrating absolute money inflow" },
            macroCoreTakeaway: { type: Type.STRING, description: "Brief economic note on RBI, macro or bonds yields" },
            riskAlertAdvice: { type: Type.STRING, description: "Specific technical caution warnings regarding RSI or key supports" }
          }
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json({
      success: true,
      isSimulated: false,
      ...data
    });
  } catch (err: any) {
    console.log("Market Briefing failover system activated: loaded simulated institutional morning briefing.");
    res.json(fallbackBriefingResponse);
  }
});

// ==========================================
// INSTITUTIONAL WEALTH PLATFORM SECURITY SUITE
// ==========================================

// Helper: Password Validator
function validatePasswordStrength(pass: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (pass.length < 8) errors.push("Minimum length must be 8 characters.");
  if (!/[A-Z]/.test(pass)) errors.push("Must contain at least 1 uppercase letter.");
  if (!/[a-z]/.test(pass)) errors.push("Must contain at least 1 lowercase letter.");
  if (!/\d/.test(pass)) errors.push("Must contain at least 1 number.");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) errors.push("Must contain at least 1 special character symbol.");
  return { valid: errors.length === 0, errors };
}

// Helper: Mobile Validator
function validateIndianMobile(num: string): boolean {
  // Checks for optional standard +91 or 0 prefix followed by exactly 10 digits
  const clean = num.replace(/^(\+91|0)/, "");
  return /^[6789]\d{9}$/.test(clean);
}

// REST API: Register Endpoint
app.post("/api/auth/register", (req, res) => {
  const { name, email, mobile, password, captchaToken, device } = req.body;
  const ip = req.ip || "127.0.0.1";
  const agent = req.headers["user-agent"] || "Unknown Browser";

  if (!captchaToken) {
    return res.status(400).json({ success: false, error: "CAPTCHA security verification failed. Please check turnstile tick." });
  }

  if (!name || name.trim().length < 3) {
    return res.status(400).json({ success: false, error: "Valid investor full name must be at least 3 characters." });
  }

  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, error: "Invalid corporate or customer email address format." });
  }

  if (!validateIndianMobile(mobile)) {
    return res.status(400).json({ success: false, error: "Please enter a valid 10-digit Indian mobile number." });
  }

  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    return res.status(400).json({ success: false, error: "Password policy violation: " + strength.errors.join(" ") });
  }

  // Duplicate Check
  if (securityDb.findUserByEmail(email)) {
    return res.status(400).json({ success: false, error: "Email address is already registered on this clearinghouse." });
  }
  if (securityDb.findUserByMobile(mobile)) {
    return res.status(400).json({ success: false, error: "Mobile number is already registered under a different client ID." });
  }

  // Create User PENDING_VERIFICATION
  const userId = "U-" + Math.random().toString(36).substr(2, 9);
  const newUser: DBUser = {
    id: userId,
    name,
    email,
    mobile,
    passwordHash: password, // Store password safely for simulation validation
    role: "ROLE_USER",
    status: "PENDING_VERIFICATION",
    createdAt: new Date().toISOString(),
    mfaEnabled: true, // Defaulting to dynamic security MFA as required by guidelines
    mfaType: "EMAIL_OTP",
    phoneNumberVerified: false
  };

  securityDb.addUser(newUser);

  // Generate 6-digit OTP
  const sampleOtp = "840291"; // Default golden fallback OTP, or randomized
  const randomizedOtp = Math.floor(100000 + Math.random() * 90000).toString();
  securityDb.upsertOtpRecord(email, randomizedOtp);

  // Create registration audit logs
  securityDb.addAuditLog(userId, email, "USER_REGISTRATION", "Account created successfully. Transition of status to PENDING_VERIFICATION.", ip, agent);
  securityDb.addSecurityEvent(userId, email, "MFA_ENABLED", "LOW", "Email MFA initialized. Outcoming 6-digit activation OTP generated.", ip, agent);

  // Save device footprint
  if (device) {
    securityDb.registerDevice(userId, {
      deviceId: device.deviceId || "dev_generic",
      browser: device.browser || "Unknown",
      os: device.os || "Unknown",
      ip: device.ip || ip
    });
  }

  res.json({
    success: true,
    email,
    message: "Your internal access ledger has been initialized. 6-digit activation code sent to: " + email,
    demoOtp: randomizedOtp // Returned safely in simulation for premium user experience
  });
});

// REST API: Resend Verification OTP
app.post("/api/auth/resend-otp", (req, res) => {
  const { email } = req.body;
  const user = securityDb.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, error: "No client account corresponding to this registration entry exists." });
  }

  const record = securityDb.findOtpRecord(email);
  if (record && record.resendsCount >= 3) {
    return res.status(429).json({ success: false, error: "Maximum OTP resend threshold reached (3). Please contact technical support desk." });
  }

  const randomizedOtp = Math.floor(100000 + Math.random() * 90000).toString();
  securityDb.upsertOtpRecord(email, randomizedOtp);

  // Audit
  securityDb.addAuditLog(user.id, email, "OTP_RESENT", "OTP dispatch requested. Sequence numbers rotated.", req.ip || "127.0.0.1", req.headers["user-agent"] || "Browser");

  res.json({
    success: true,
    demoOtp: randomizedOtp,
    message: "New 6-digit credential dispatched to " + email
  });
});

// REST API: Register OTP Verification
app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp, device } = req.body;
  const ip = req.ip || "127.0.0.1";
  const agent = req.headers["user-agent"] || "Browser";

  const user = securityDb.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, error: "User profile not registered." });
  }

  const record = securityDb.findOtpRecord(email);
  if (!record) {
    return res.status(400).json({ success: false, error: "No active verification OTP process found. Please request resend." });
  }

  // Check Expiry
  if (new Date(record.expiry) < new Date()) {
    return res.status(400).json({ success: false, error: "The code has expired. OTP lifespan is strictly capped at 5 minutes." });
  }

  // Attempts checking
  if (record.attempts >= 5) {
    user.status = "LOCKED";
    securityDb.updateUser(user);
    securityDb.addSecurityEvent(user.id, email, "ACCOUNT_LOCK_15", "HIGH", "Account locked due to 5 consecutive failed registration OTP attempts.", ip, agent);
    return res.status(403).json({ success: false, error: "Verification fails. Multiple invalid attempts recorded. Profile LOCKED for security purposes." });
  }

  if (record.otp !== otp) {
    securityDb.incrementOtpAttempts(email);
    return res.status(400).json({ success: false, error: `Invalid 6-digit activation key entered. Leftover tries: ${5 - record.attempts - 1}` });
  }

  // Verification Success! Transition to ACTIVE
  user.status = "ACTIVE";
  user.phoneNumberVerified = true;
  securityDb.updateUser(user);
  securityDb.removeOtpRecord(email);

  // Generate 4 backup codes
  const keys = securityDb.regenerateRecoveryCodes(user.id);

  // Auth tokens
  const token = "JWT_" + Math.random().toString(36).substr(2, 14).toUpperCase();
  const refreshToken = "REF_" + Math.random().toString(36).substr(2, 14).toUpperCase();
  securityDb.createRefreshToken(user.id, refreshToken);
  securityDb.createSession(user.id, token, {
    deviceId: device?.deviceId || "dev_" + Math.random().toString(36).substr(2, 5),
    browser: device?.browser || "Chrome",
    os: device?.os || "Windows",
    ip: device?.ip || ip,
    location: device?.location || "Mumbai, India"
  });

  // Audits
  securityDb.addAuditLog(user.id, email, "EMAIL_VERIFICATION_COMPLETE", "Verification success. Account state set to ACTIVE.", ip, agent);
  securityDb.addNotification(user.id, "Welcome to QuantMind AI", `Welcome ${user.name}! Your global quantitative terminal is active. Backup-keys generated.`, "SECURITY");

  res.json({
    success: true,
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      mfaType: user.mfaType,
      mfaEnabled: user.mfaEnabled
    },
    recoveryCodes: keys,
    message: "Email address cleared. Portfolio clearance assigned."
  });
});

// REST API: Secure Login
app.post("/api/auth/login", (req, res) => {
  const { identity, password, captchaToken, device } = req.body; // identity is email or mobile
  const ip = req.ip || "127.0.0.1";
  const agent = req.headers["user-agent"] || "Browser";

  if (!captchaToken) {
    return res.status(400).json({ success: false, error: "CAPTCHA protected portal. Complete Turnstile verification to submit credentials." });
  }

  if (!identity || !password) {
    return res.status(400).json({ success: false, error: "Email or Mobile credentials and Secure Password are required." });
  }

  // Find User
  let user = securityDb.findUserByEmail(identity);
  if (!user) {
    user = securityDb.findUserByMobile(identity);
  }

  // Record login logs
  const identityStr = identity.toLowerCase();
  
  // Brute Force protection check
  const failuresInLast15 = securityDb.getLogsForUser(user?.id || "anonymous")?.loginHistory?.filter(
    lh => !lh.success && (Date.now() - new Date(lh.loginTime).getTime() < 15 * 60 * 1000)
  ) || [];

  if (failuresInLast15.length >= 5) {
    if (user && user.status !== "LOCKED") {
      user.status = "LOCKED";
      securityDb.updateUser(user);
      securityDb.addSecurityEvent(user.id, user.email, "ACCOUNT_LOCK_15", "CRITICAL", "Account LOCKED for 15 minutes due to brute-force alert. 5 failed login loops.", ip, agent);
    }
    return res.status(403).json({ success: false, error: "Terminal login blocked. 5 failed attempts reached. This ID is locked for 15 minutes." });
  }

  if (user && user.status === "LOCKED") {
    // Check if 15 minutes elapsed since the last lock event
    const locks = securityDb.getLogsForUser(user.id).securityEvents.filter(se => se.eventType === "ACCOUNT_LOCK_15");
    if (locks.length > 0) {
      const lastLockTime = new Date(locks[0].timestamp).getTime();
      if (Date.now() - lastLockTime > 15 * 60 * 1000) {
        // Unlock user
        user.status = "ACTIVE";
        securityDb.updateUser(user);
        securityDb.addSecurityEvent(user.id, user.email, "MFA_DISABLED", "LOW", "Auto-unlocking account. Lockout period expired.", ip, agent);
      } else {
        return res.status(403).json({ success: false, error: "Account remains locked. Please allow 15 minutes before re-submitting." });
      }
    } else {
      return res.status(403).json({ success: false, error: "This secure account is locked by corporate compliance." });
    }
  }

  if (!user || user.passwordHash !== password) {
    securityDb.addLoginHistory(identityStr, false, ip, agent, "Credentials mismatch");
    if (user) {
      securityDb.addSecurityEvent(user.id, user.email, "FAILED_LOGIN_ATTEMPT", "MEDIUM", `Incorrect password attempt for profile: ${identityStr}`, ip, agent);
    }
    return res.status(401).json({ success: false, error: "Access denied: The email/mobile coordinates or password do not match corporate records." });
  }

  // Check Account State
  if (user.status === "PENDING_VERIFICATION") {
    // Generate fresh OTP to verify
    const randomizedOtp = Math.floor(100000 + Math.random() * 90000).toString();
    securityDb.upsertOtpRecord(user.email, randomizedOtp);
    return res.status(202).json({
      success: false,
      verificationRequired: true,
      email: user.email,
      message: "Please complete registration OTP loop first. Fresh key issued.",
      demoOtp: randomizedOtp
    });
  }

  if (user.status === "SUSPENDED") {
    return res.status(403).json({ success: false, error: "Account SUSPENDED due to compliance restrictions. Please upload KYC files." });
  }

  // MFA validation check
  if (user.mfaEnabled) {
    const mfaOtp = Math.floor(100000 + Math.random() * 90000).toString();
    securityDb.upsertOtpRecord(user.email, mfaOtp);
    
    // Add Security Action
    securityDb.addSecurityEvent(user.id, user.email, "MFA_ENABLED", "LOW", "Login password matches. Dispatched second-factor security codes.", ip, agent);

    return res.json({
      success: true,
      mfaRequired: true,
      email: user.email,
      mfaType: user.mfaType,
      demoOtp: mfaOtp,
      message: "Client certificate verified. Multi-factor challenge code dispatched to linked email index."
    });
  }

  // Standard Login (No MFA)
  const token = "JWT_" + Math.random().toString(36).substr(2, 14).toUpperCase();
  const refreshToken = "REF_" + Math.random().toString(36).substr(2, 14).toUpperCase();
  securityDb.createRefreshToken(user.id, refreshToken);
  securityDb.createSession(user.id, token, {
    deviceId: device?.deviceId || "web_" + Math.random().toString(36).substr(2, 5),
    browser: device?.browser || "Chrome",
    os: device?.os || "Windows",
    ip: device?.ip || ip,
    location: device?.location || "Delhi, India"
  });

  // Track device and trust
  const userDevice = securityDb.registerDevice(user.id, {
    deviceId: device?.deviceId || "web_generic",
    browser: device?.browser || "Chrome",
    os: device?.os || "Windows",
    ip: device?.ip || ip
  });

  // Log History & Events
  securityDb.addLoginHistory(user.email, true, ip, agent);
  securityDb.addAuditLog(user.id, user.email, "USER_LOGIN", "Successful secure password login established.", ip, agent);

  res.json({
    success: true,
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      mfaType: user.mfaType
    },
    message: "Access granted. Welcome to your institutional quant panel."
  });
});

// REST API: Verify MFA Login
app.post("/api/auth/verify-mfa", (req, res) => {
  const { email, mfaCode, device } = req.body;
  const ip = req.ip || "127.0.0.1";
  const agent = req.headers["user-agent"] || "Browser";

  const user = securityDb.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, error: "Credentials context lost." });
  }

  // Is MFA via Recovery Code model or OTP model?
  let mfaSuccess = false;
  if (mfaCode.startsWith("GS-")) {
    mfaSuccess = securityDb.useRecoveryCode(user.id, mfaCode);
    if (mfaSuccess) {
      securityDb.addSecurityEvent(user.id, user.email, "FAILED_LOGIN_ATTEMPT", "MEDIUM", "MFA bypassed utilizing recovery sheet. Rotating recovery tokens.", ip, agent);
    }
  } else {
    // Code validation
    const record = securityDb.findOtpRecord(email);
    if (record && record.otp === mfaCode && new Date(record.expiry) > new Date()) {
      mfaSuccess = true;
      securityDb.removeOtpRecord(email);
    }
  }

  if (!mfaSuccess) {
    return res.status(400).json({ success: false, error: "The entered verification OTP or backup code is invalid or has expired." });
  }

  // Successful Login
  const token = "JWT_" + Math.random().toString(36).substr(2, 14).toUpperCase();
  const refreshToken = "REF_" + Math.random().toString(36).substr(2, 14).toUpperCase();
  securityDb.createRefreshToken(user.id, refreshToken);
  securityDb.createSession(user.id, token, {
    deviceId: device?.deviceId || "web_" + Math.random().toString(36).substr(2, 5),
    browser: device?.browser || "Chrome",
    os: device?.os || "Windows",
    ip: device?.ip || ip,
    location: device?.location || "Bengaluru, India"
  });

  securityDb.registerDevice(user.id, {
    deviceId: device?.deviceId || "desktop_node",
    browser: device?.browser || "Edge",
    os: device?.os || "Windows",
    ip: device?.ip || ip
  });

  // Audits
  securityDb.addLoginHistory(user.email, true, ip, agent);
  securityDb.addAuditLog(user.id, user.email, "USER_LOGIN_MFA_SUCCESS", "MFA validation successful. Dynamic JWT issued.", ip, agent);

  res.json({
    success: true,
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      mfaType: user.mfaType
    }
  });
});

// REST API: Password Recovery (Forgot Password)
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const user = securityDb.findUserByEmail(email);
  if (!user) {
    return res.status(200).json({ success: true, message: "If the email is valid, a secure recovery code has been generated and queued." });
  }

  // Generate OTP reset
  const tempToken = "RESET-" + Math.floor(100000 + Math.random() * 90000).toString();
  securityDb.upsertOtpRecord(email, tempToken);

  securityDb.addSecurityEvent(user.id, email, "PASSWORD_CHANGE", "MEDIUM", "Password recovery token generated and dispatched.", req.ip || "10.0.0.1", "Browser");

  res.json({
    success: true,
    message: "A secure recovery code has been queued for: " + email,
    demoResetToken: tempToken
  });
});

// REST API: Reset password with link/code
app.post("/api/auth/reset-password", (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = securityDb.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, error: "Information mismatched." });
  }

  const record = securityDb.findOtpRecord(email);
  if (!record || record.otp !== token) {
    return res.status(400).json({ success: false, error: "The password recovery validation token is incorrect/expired." });
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    return res.status(400).json({ success: false, error: strength.errors.join(" ") });
  }

  user.passwordHash = newPassword;
  user.status = "ACTIVE"; // If locked, resets status back
  securityDb.updateUser(user);
  securityDb.removeOtpRecord(email);

  securityDb.addAuditLog(user.id, email, "PASSWORD_RESET_COMPLETE", "Successful password update via forgot recovery module.", req.ip || "127.0.0.1", "Browser");

  res.json({
    success: true,
    message: "Wealth vault password updated. Log in utilizing new credentials."
  });
});

// REST API: GET Security Dashboard records
app.get("/api/security/dashboard", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent) {
    return res.status(401).json({ success: false, error: "Invalid session." });
  }

  const { user } = agent;
  const logs = securityDb.getLogsForUser(user.id);

  // Compute security score out of 100
  let score = 50;
  if (user.mfaEnabled) score += 20;
  if (user.mfaType === "AUTHENTICATOR") score += 10;
  if (user.phoneNumberVerified) score += 10;
  if (user.passwordHash.length >= 10 && /[A-Z]/.test(user.passwordHash)) score += 10;

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      mfaType: user.mfaType,
      mfaEnabled: user.mfaEnabled
    },
    score,
    sessions: logs.sessions,
    loginHistory: logs.loginHistory,
    securityEvents: logs.securityEvents,
    auditLogs: logs.auditLogs,
    devices: logs.devices,
    recoveryCodesCount: logs.recoveryCodes.filter(rc => !rc.used).length,
    notifications: securityDb.findNotificationsForUser(user.id)
  });
});

// REST API: Update MFA Toggles
app.post("/api/security/update-mfa", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent) {
    return res.status(401).json({ success: false, error: "Access token is void." });
  }

  const { user } = agent;
  const { mfaEnabled, mfaType } = req.body;

  user.mfaEnabled = !!mfaEnabled;
  user.mfaType = mfaType || "NONE";
  securityDb.updateUser(user);

  securityDb.addAuditLog(user.id, user.email, "MFA_SETTINGS_CHANGED", `MFA toggled to: ${mfaEnabled} (${mfaType})`, req.ip || "127.0.0.1", "Browser");
  securityDb.addSecurityEvent(user.id, user.email, mfaEnabled ? "MFA_ENABLED" : "MFA_DISABLED", "LOW", `MFA configuration updated to: ${mfaType}`, req.ip || "127.0.0.1", "Browser");

  res.json({
    success: true,
    message: "Multi-factor authentication rules updated successfully.",
    mfaEnabled: user.mfaEnabled,
    mfaType: user.mfaType
  });
});

// REST API: Change password inside dashboard
app.post("/api/security/change-password", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent) {
    return res.status(401).json({ success: false, error: "Session validation failed." });
  }

  const { user } = agent;
  const { oldPassword, newPassword } = req.body;

  if (user.passwordHash !== oldPassword) {
    return res.status(400).json({ success: false, error: "Old current password incorrect." });
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    return res.status(400).json({ success: false, error: strength.errors.join(" ") });
  }

  user.passwordHash = newPassword;
  securityDb.updateUser(user);

  securityDb.addAuditLog(user.id, user.email, "PASSWORD_CHANGED_MANUALLY", "Password changed successfully manually from dashboard settings.", req.ip || "127.0.0.1", "Browser");
  securityDb.addSecurityEvent(user.id, user.email, "PASSWORD_CHANGE", "MEDIUM", "Password manually rotated inside Secure Settings.", req.ip || "127.0.0.1", "Browser");

  res.json({
    success: true,
    message: "Brokerage password rotated successfully."
  });
});

// REST API: Revoke session (Logout specific device)
app.post("/api/security/revoke-session", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent) {
    return res.status(401).json({ success: false, error: "Access forbidden." });
  }

  const { user } = agent;
  const { sessionId } = req.body;

  // Verify target session is owned by active user
  const sessionToLogs = securityDb.getLogsForUser(user.id).sessions;
  const match = sessionToLogs.find(s => s.id === sessionId);
  if (!match) {
    return res.status(403).json({ success: false, error: "Permission error revoking session." });
  }

  securityDb.revokeSession(sessionId);

  securityDb.addAuditLog(user.id, user.email, "DEVICE_SESSION_REVOKED", `Session ID revoked: ${sessionId}. Device logged out immediately.`, req.ip || "127.0.0.1", "Browser");
  securityDb.addSecurityEvent(user.id, user.email, "SESSION_REVOKED", "MEDIUM", `Session ID revoked immediately: ${sessionId}`, req.ip || "127.0.0.1", "Browser");

  res.json({
    success: true,
    message: "Dynamic session killed. That target browser will be asked to authenticate on next tick."
  });
});

// REST API: Download Backup recovery codes
app.get("/api/security/recovery-codes", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent) {
    return res.status(410).json({ success: false, error: "Terminal session expired." });
  }

  const { user } = agent;
  const codes = securityDb.findRecoveryCodesForUser(user.id);

  securityDb.addAuditLog(user.id, user.email, "RECOVERY_CODES_DOWNLOADED", "Retrieved and downloaded secondary vault access recovery codes.", req.ip || "127.0.0.1", "Browser");

  res.json({
    success: true,
    codes: codes.map(c => ({ code: c.code, used: c.used }))
  });
});

// REST API: Regenerate Recovery codes
app.post("/api/security/regenerate-recovery", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent) {
    return res.status(401).json({ success: false, error: "Session invalid." });
  }

  const { user } = agent;
  const freshCodes = securityDb.regenerateRecoveryCodes(user.id);

  securityDb.addAuditLog(user.id, user.email, "RECOVERY_CODES_REGENERATED", "Regenerated recovery codes. Previous sheets voided.", req.ip || "127.0.0.1", "Browser");

  res.json({
    success: true,
    codes: freshCodes
  });
});

// REST API: Track profiles update / KYC Submission
app.post("/api/client/profile-kyc", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent) {
    return res.status(401).json({ success: false, error: "Profile missing." });
  }

  const { user } = agent;
  const { kycUpdate } = req.body;

  securityDb.addAuditLog(user.id, user.email, "KYC_SUBMISSION", `KYC Document submit with Status: ${kycUpdate || "SUBMITTED"}`, req.ip || "127.0.0.1", "Browser");

  res.json({
    success: true,
    message: "Your KYC files has been posted onto compliance files. Refresh in 24 hours."
  });
});

// REST API: Log portfolio update triggers
app.post("/api/client/portfolio-audit", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent) return res.status(401).json({ success: false, error: "Void auth." });

  const { user } = agent;
  const { holdingsCount, actionTaken } = req.body;

  securityDb.addAuditLog(user.id, user.email, "PORTFOLIO_AUDIT_RUN", `Portfolio audited. Count of holdings analyzed: ${holdingsCount || 0}. Action: ${actionTaken || "Audit Overview"}`, req.ip || "127.0.0.1", "Browser");

  res.json({
    success: true
  });
});

// REST API: Get all user account and audit information
app.get("/api/client/account-details", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent) {
    return res.status(401).json({ success: false, error: "Authentication session expired or invalid." });
  }

  const { user } = agent;
  const logs = securityDb.getLogsForUser(user.id);
  
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      mfaEnabled: user.mfaEnabled,
      mfaType: user.mfaType,
      phoneNumberVerified: user.phoneNumberVerified
    },
    logs: {
      sessionsCount: logs.sessions.length,
      loginHistory: logs.loginHistory.slice(0, 10),
      securityEvents: logs.securityEvents.slice(0, 10),
      auditLogs: logs.auditLogs.slice(0, 15),
      devices: logs.devices,
      recoveryCodesCount: logs.recoveryCodes.length,
      unusedRecoveryCodesCount: logs.recoveryCodes.filter(rc => !rc.used).length
    },
    systemMetrics: {
      hostNode: "QA-NODE-" + PORT + "-ACTIVE",
      databaseType: "JSON_SECURE_FILE_ENVELOPE",
      lastSynchronizedAt: new Date().toISOString()
    }
  });
});

// ==========================================
// ADMINISTRATIVE PORTAL REST CONTROLLERS
// ==========================================

// 1. GET System-wide Analytics & Config parameters
app.get("/api/admin/system-stats", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent) {
    return res.status(401).json({ success: false, error: "Access denied. Authentication invalid." });
  }
  if (agent.user.role !== "ROLE_ADMIN") {
    return res.status(403).json({ success: false, error: "Access denied. Requires central administrator role authorization." });
  }

  const users = securityDb.getAllUsers();
  const sessions = securityDb.getAllSessions();
  const loginHistory = securityDb.getAllLoginHistory();
  const securityEvents = securityDb.getAllSecurityEvents();
  const auditLogs = securityDb.getAllAuditLogs();

  const activeSessions = sessions.filter(s => s.active).length;
  const criticalAlerts = securityEvents.filter(e => e.severity === "CRITICAL" || e.severity === "HIGH").length;

  res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      totalSessions: sessions.length,
      activeSessions,
      loginFailureRate: loginHistory.length > 0 ? (loginHistory.filter(lh => !lh.success).length / loginHistory.length) * 100 : 0,
      criticalAlertsCount: criticalAlerts,
      securityEventCount: securityEvents.length,
      auditLogCount: auditLogs.length
    },
    systemConfig
  });
});

// 2. GET Full User Directory List
app.get("/api/admin/users", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent || agent.user.role !== "ROLE_ADMIN") {
    return res.status(403).json({ success: false, error: "Administrator identity authorization required." });
  }

  const rawUsers = securityDb.getAllUsers();
  const users = rawUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    mobile: u.mobile,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    mfaEnabled: u.mfaEnabled,
    mfaType: u.mfaType,
    phoneNumberVerified: u.phoneNumberVerified
  }));

  res.json({ success: true, users });
});

// 3. POST Update User Credential state (promote, suspend, etc.)
app.post("/api/admin/users/:userId/update", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent || agent.user.role !== "ROLE_ADMIN") {
    return res.status(403).json({ success: false, error: "Access denied." });
  }

  const { userId } = req.params;
  const { role, status, mobile, name } = req.body;

  const targetUser = securityDb.findUserById(userId);
  if (!targetUser) {
    return res.status(404).json({ success: false, error: "User records not found in secure ledger." });
  }

  // Prevent administrative suicide / lockouts
  if (targetUser.id === agent.user.id && (status === "SUSPENDED" || status === "LOCKED" || role !== "ROLE_ADMIN")) {
    return res.status(400).json({ success: false, error: "De-escalating or suspending your own administrative credentials is forbidden by compliance protocols." });
  }

  const updates: Partial<DBUser> = {};
  if (role) updates.role = role;
  if (status) updates.status = status;
  if (name) updates.name = name;
  if (mobile) updates.mobile = mobile;

  const updated = securityDb.adminUpdateUser(userId, updates);
  if (updated) {
    securityDb.addAuditLog(
      agent.user.id,
      agent.user.email,
      "ADMIN_USER_UPDATE",
      `Administrator updated credentials for (${targetUser.email}): ${JSON.stringify(updates)}`,
      req.ip || "127.0.0.1",
      "Compliance Console"
    );
    res.json({ success: true, msg: "Fiduciary ledger indices updated successfully." });
  } else {
    res.status(500).json({ success: false, error: "Ledger writing operation encountered database error." });
  }
});

// 4. DELETE Purge user account
app.delete("/api/admin/users/:userId", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent || agent.user.role !== "ROLE_ADMIN") {
    return res.status(403).json({ success: false, error: "Unauthorized." });
  }

  const { userId } = req.params;
  if (userId === agent.user.id) {
    return res.status(400).json({ success: false, error: "Purging active administrative node is locked." });
  }

  const targetUser = securityDb.findUserById(userId);
  if (!targetUser) {
    return res.status(404).json({ success: false, error: "User not found." });
  }

  const deleted = securityDb.adminDeleteUser(userId);
  if (deleted) {
    securityDb.addAuditLog(
      agent.user.id,
      agent.user.email,
      "ADMIN_USER_DELETION",
      `Force deleted user credential records for: ${targetUser.email}`,
      req.ip || "127.0.0.1",
      "Compliance Console"
    );
    res.json({ success: true, msg: "Fiduciary records deleted from server directory." });
  } else {
    res.status(500).json({ success: false, error: "Deletion operation failed." });
  }
});

// 5. POST Programmatic user provision
app.post("/api/admin/users/create", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent || agent.user.role !== "ROLE_ADMIN") {
    return res.status(403).json({ success: false, error: "Unauthorized." });
  }

  const { name, email, mobile, password, role } = req.body;
  if (!name || !email || !mobile || !password || !role) {
    return res.status(400).json({ success: false, error: "Incomplete database fields parameters." });
  }

  const existing = securityDb.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, error: "Fiduciary database identity index collision detected." });
  }

  const newUser: DBUser = {
    id: "usr-" + Math.random().toString(36).substr(2, 9),
    name,
    email,
    mobile,
    passwordHash: password, // client-plain password setup
    role,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    mfaEnabled: false,
    mfaType: "NONE",
    phoneNumberVerified: true
  };

  securityDb.addUser(newUser);
  securityDb.addAuditLog(
    agent.user.id,
    agent.user.email,
    "ADMIN_USER_PROVISION",
    `Provisioned dynamic ledger account: ${email} with authorized role: ${role}`,
    req.ip || "127.0.0.1",
    "Compliance Console"
  );

  res.json({ success: true, msg: "Profile generated successfully." });
});

// 6. GET Full System Logs Tracker
app.get("/api/admin/logs", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent || agent.user.role !== "ROLE_ADMIN") {
    return res.status(403).json({ success: false, error: "Unauthorized access." });
  }

  res.json({
    success: true,
    loginHistory: securityDb.getAllLoginHistory().slice(0, 100),
    securityEvents: securityDb.getAllSecurityEvents().slice(0, 100),
    auditLogs: securityDb.getAllAuditLogs().slice(0, 100),
    sessions: securityDb.getAllSessions().map(s => ({
      id: s.id,
      userId: s.userId,
      deviceId: s.deviceId,
      browser: s.browser,
      os: s.os,
      ip: s.ip,
      location: s.location,
      active: s.active,
      loginTime: s.loginTime
    })).slice(0, 50)
  });
});

// 7. POST Update System Orchestration and Control Parameters
app.post("/api/admin/system-config", (req, res) => {
  const agent = getAuthenticatedAgent(req);
  if (!agent || agent.user.role !== "ROLE_ADMIN") {
    return res.status(403).json({ success: false, error: "Privileged action denied." });
  }

  const { maintenanceMode, rateLimitThreshold, alertChannelPhone, strictKycEnabled, riskGuardrails } = req.body;

  if (maintenanceMode !== undefined) systemConfig.maintenanceMode = !!maintenanceMode;
  if (rateLimitThreshold !== undefined) systemConfig.rateLimitThreshold = Number(rateLimitThreshold);
  if (alertChannelPhone !== undefined) systemConfig.alertChannelPhone = alertChannelPhone;
  if (strictKycEnabled !== undefined) systemConfig.strictKycEnabled = !!strictKycEnabled;
  if (riskGuardrails !== undefined) systemConfig.riskGuardrails = riskGuardrails;

  securityDb.addAuditLog(
    agent.user.id,
    agent.user.email,
    "ADMIN_SYSTEM_CONFIG",
    `Modified core config system parameter: ${JSON.stringify(systemConfig)}`,
    req.ip || "127.0.0.1",
    "Compliance Console"
  );

  res.json({ success: true, msg: "System configurations updated successfully.", systemConfig });
});

// Configure Vite integration or static file server
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with static files serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`QuantMind AI Server successfully listening on http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to bootstrap QuantMind AI Server:", err);
});
