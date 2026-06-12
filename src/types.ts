export interface UserSession {
  firstName: string;
  lastName: string;
  email: string;
  isLoggedIn: boolean;
  role: "ROLE_USER" | "ROLE_PREMIUM" | "ROLE_ADVISOR" | "ROLE_ADMIN";
  id?: string;
  token?: string;
  mobile?: string;
  mfaEnabled?: boolean;
  mfaType?: "EMAIL_OTP" | "AUTHENTICATOR" | "NONE";
}

export interface DematAccount {
  accountNumber: string;
  dpId: string;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "NOT_STARTED";
  kycStatus: "PENDING" | "VERIFIED" | "NOT_STARTED";
  pan: string;
  aadhaar: string;
  bankName: string;
  bankAccount: string;
  ifsc: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeAllocation: number;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  allocation: number;
  sector: "Technology" | "Financials" | "Healthcare" | "Energy" | "Consumer Goods" | "Industrials" | "Alternatives";
}

export interface Transaction {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  shares: number;
  price: number;
  date: string;
}

export interface MarketCrashScenario {
  id: string;
  name: string;
  period: string;
  durationMonths: number;
  drawdownPercentage: number;
  description: string;
  underlyingIndices: string;
  impactMetrics: {
    portfolioLoss: number;
    recoveryTimeDays: number;
    volatilitySpike: number;
  };
}

export interface BacktestConfig {
  strategy: "RSI" | "MOVING_AVERAGE" | "MOMENTUM";
  symbol: string;
  rsiWindow: number;
  rsiOverbought: number;
  rsiOversold: number;
  shortMa: number;
  longMa: number;
  momentumWindow: number;
  lookbackPeriod: string;
  initialCapital: number;
}

export interface BacktestResult {
  strategy: string;
  winRate: number;
  sharpeRatio: number;
  cagr: number;
  maxDrawdown: number;
  tradesCount: number;
  initialValue: number;
  finalValue: number;
  equityCurve: { date: string; strategyValue: number; benchmarkValue: number }[];
}

export interface MonteCarloConfig {
  years: number;
  initialValue: number;
  annualContribution: number;
  expectedReturn: number;
  volatility: number;
}

export interface MonteCarloResult {
  timeline: number[];
  p10: number[]; // Conservative scenario (10th percentile)
  p50: number[]; // Median scenario (50th percentile)
  p90: number[]; // Optimistic scenario (90th percentile)
  successProbability: number;
  terminalValues: number[];
}

export interface JournalEntry {
  id: string;
  symbol: string;
  purchasePrice: number;
  reason: string;
  expectedOutcome: string;
  confidence: number;
  emotion: string; // "Calm", "Excited", "Anxious", "Greedy", "Fearful"
  date: string;
  analysis?: {
    fomoScore: number;
    panicScore: number;
    overconfidenceScore: number;
    biasesDetected: string[];
    psychologicalProfile: string;
    therapeuticAction: string;
  };
}

export interface AIAdvisorResponse {
  advice: string;
  confidenceScore: number;
  targetAllocation: { assetClass: string; percentage: number }[];
  riskLevel: string;
  primaryRecommendation: string;
}

// System Design Phase Documentation Structure
export interface CodeSnippet {
  fileName: string;
  language: string;
  content: string;
}

export interface PhaseSpec {
  phaseNum: number;
  title: string;
  description: string;
  details: string;
  diagram?: string;
  files?: CodeSnippet[];
}
