// Indian Market Datasets and High-Fidelity Simulations for QuantMind AI

export interface IndexData {
  symbol: string;
  name: string;
  value: number;
  prevClose: number;
  change: number;
  pctChange: number;
  high: number;
  low: number;
  chartData: number[];
}

export interface CompanyData {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  prevClose: number;
  change: number;
  pctChange: number;
  marketCapCr: number;
  pe: number;
  eps: number;
  roe: number;
  debtEquity: number;
  divYield: number;
  volume: number;
  deliveryPct: number;
  description: string;
  rsi: number;
  macd: number;
  support: number;
  resistance: number;
  ma50: number;
  ma200: number;
  weekHigh: number;
  weekLow: number;
  isNifty50: boolean;
  earnings: {
    q: string;
    revenueGrowth: number;
    profitGrowth: number;
    epsGrowth: number;
    score: number;
    verdict: "Strong Bully" | "Bullish" | "Neutral" | "Bearish" | "Strong Beary";
    details: string;
  }[];
  actions: {
    date: string;
    type: "DIVIDEND" | "SPLIT" | "BONUS" | "RIGHTS";
    details: string;
    impact: string;
    amount?: number;
    ratio?: string;
  }[];
}

export interface SectorData {
  name: string;
  indexSymbol: string;
  price: number;
  change: number;
  pctChange: number;
  relativeStrength: number; // RS compared to NIFTY50 (0-100)
  moneyFlowIndex: number;  // MFI (0-100)
  momentum: "Strong Bullish" | "Bullish" | "Neutral" | "Bearish" | "Strong Bearish";
  signal: "ACCUMULATE" | "HOLD" | "BOOK_PROFIT" | "REDUCE" | "RELOAD";
}

export interface NewsItem {
  id: string;
  timestamp: string;
  title: string;
  source: string;
  sentiment: "BULLISH" | "NEUTRAL" | "BEARISH";
  score: number; // 0 to 100
  impactSectors: string[];
}

export interface InsiderDeal {
  id: string;
  company: string;
  promoter: string;
  type: "BUY" | "SELL" | "BULK_BUY" | "BULK_SELL";
  shares: number;
  valueCr: number;
  date: string;
  confidenceEffect: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
}

export interface MacroIndicator {
  name: string;
  code: string;
  currentValue: string;
  previousValue: string;
  trend: "UP" | "DOWN" | "STABLE";
  aiInsight: string;
}

// 1. Initial State Data
export const initialIndices: IndexData[] = [
  {
    symbol: "NIFTY_50",
    name: "NIFTY 50 INDEX",
    value: 23512.40,
    prevClose: 23432.10,
    change: 80.30,
    pctChange: 0.34,
    high: 23580.95,
    low: 23395.20,
    chartData: [23432, 23410, 23460, 23445, 23490, 23520, 23505, 23530, 23512]
  },
  {
    symbol: "NIFTY_NEXT_50",
    name: "NIFTY NEXT 50 INDEX",
    value: 70624.15,
    prevClose: 70295.40,
    change: 328.75,
    pctChange: 0.47,
    high: 70810.50,
    low: 70180.10,
    chartData: [70295, 70350, 70280, 70410, 70520, 70490, 70680, 70610, 70624]
  },
  {
    symbol: "BANK_NIFTY",
    name: "NIFTY BANK INDEX",
    value: 51220.80,
    prevClose: 51412.30,
    change: -191.50,
    pctChange: -0.37,
    high: 51580.40,
    low: 51110.15,
    chartData: [51412, 51380, 51440, 51310, 51250, 51300, 51190, 51240, 51220]
  },
  {
    symbol: "SENSEX",
    name: "S&P BSE SENSEX",
    value: 77310.60,
    prevClose: 77050.20,
    change: 260.40,
    pctChange: 0.34,
    high: 77520.10,
    low: 76912.40,
    chartData: [77050, 76950, 77120, 77090, 77240, 77380, 77290, 77350, 77310]
  },
  {
    symbol: "NIFTY_MID_100",
    name: "NIFTY MIDCAP 100",
    value: 55420.30,
    prevClose: 55110.10,
    change: 310.20,
    pctChange: 0.56,
    high: 55580.90,
    low: 54980.20,
    chartData: [55110, 55080, 55190, 55220, 55340, 55410, 55390, 55460, 55420]
  },
  {
    symbol: "NIFTY_SMALL_100",
    name: "NIFTY SMALLCAP 100",
    value: 18210.15,
    prevClose: 18050.80,
    change: 159.35,
    pctChange: 0.88,
    high: 18260.50,
    low: 17990.10,
    chartData: [18050, 18010, 18090, 18140, 18120, 18180, 18230, 18195, 18210]
  }
];

export const initialCompanies: CompanyData[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd.",
    sector: "Energy & Conglomerate",
    price: 2465.50,
    prevClose: 2445.10,
    change: 20.40,
    pctChange: 0.83,
    marketCapCr: 1668240,
    pe: 24.5,
    eps: 100.6,
    roe: 11.2,
    debtEquity: 0.38,
    divYield: 0.41,
    volume: 5240210,
    deliveryPct: 58.4,
    description: "Reliance Industries Limited is an Indian multinational conglomerate, headquartered in Mumbai. Its diverse businesses include energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.",
    rsi: 54,
    macd: 8.5,
    support: 2410,
    resistance: 2495,
    ma50: 2420,
    ma200: 2360,
    weekHigh: 2605,
    weekLow: 2190,
    isNifty50: true,
    earnings: [
      {
        q: "Q4 FY26",
        revenueGrowth: 12.4,
        profitGrowth: 15.1,
        epsGrowth: 14.8,
        score: 82,
        verdict: "Bullish",
        details: "Retail and telecom networks continue to beat estimates with high ARPU growth of 4.5% QoQ. Oil-to-chemicals (O2C) spreads remain stable."
      },
      {
        q: "Q3 FY26",
        revenueGrowth: 10.8,
        profitGrowth: 8.2,
        epsGrowth: 7.9,
        score: 68,
        verdict: "Neutral",
        details: "O2C sector dragged by weaker global refinery margins. Jio and Retail volumes offset industrial slowdown."
      }
    ],
    actions: [
      {
        date: "2026-08-15",
        type: "DIVIDEND",
        details: "Final Dividend of ₹10.00 per Equity Share declared.",
        impact: "Adjusts portfolio yield upward. Ex-date set to Aug 12.",
        amount: 10
      },
      {
        date: "2025-11-20",
        type: "BONUS",
        details: "Bonus issue of shares in 1:1 ratio approved.",
        impact: "Doubled shares count, prices adjusted proportionally by half on Ex-date.",
        ratio: "1:1"
      }
    ]
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd.",
    sector: "Banking & Finance",
    price: 1520.15,
    prevClose: 1545.40,
    change: -25.25,
    pctChange: -1.63,
    marketCapCr: 1154210,
    pe: 18.2,
    eps: 83.5,
    roe: 16.4,
    debtEquity: 0.95,
    divYield: 1.25,
    volume: 18920150,
    deliveryPct: 62.1,
    description: "HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India's largest private sector bank by assets and the world's tenth-largest bank by market capitalization.",
    rsi: 38,
    macd: -12.4,
    support: 1495,
    resistance: 1560,
    ma50: 1555,
    ma200: 1585,
    weekHigh: 1720,
    weekLow: 1380,
    isNifty50: true,
    earnings: [
      {
        q: "Q4 FY26",
        revenueGrowth: 18.2,
        profitGrowth: -2.1,
        epsGrowth: -2.5,
        score: 45,
        verdict: "Bearish",
        details: "Net Interest Margin (NIM) compressed by 15bps to 3.4%. High cost of deposits post-merger continues to squeeze profitability indices."
      },
      {
        q: "Q3 FY26",
        revenueGrowth: 16.4,
        profitGrowth: 2.5,
        epsGrowth: 1.8,
        score: 55,
        verdict: "Neutral",
        details: "Deposit mobilization remains solid with 18% YoY growth, but advances index lagging corporate targets."
      }
    ],
    actions: [
      {
        date: "2026-06-25",
        type: "DIVIDEND",
        details: "Interim Dividend of ₹19.50 per Share approved.",
        impact: "Strong cash flow credit expected in depository ledger on Jul 08.",
        amount: 19.5
      }
    ]
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd.",
    sector: "Information Technology",
    price: 3755.00,
    prevClose: 3710.20,
    change: 44.80,
    pctChange: 1.21,
    marketCapCr: 1374520,
    pe: 29.8,
    eps: 126.0,
    roe: 42.1,
    debtEquity: 0.05,
    divYield: 2.80,
    volume: 2450210,
    deliveryPct: 75.3,
    description: "Tata Consultancy Services Limited (TCS) is an Indian multinational information technology services and consulting company headquartered in Mumbai. It is a subsidiary of the Tata Group and operates in 150 locations across 46 countries.",
    rsi: 61,
    macd: 18.9,
    support: 3680,
    resistance: 3820,
    ma50: 3690,
    ma200: 3605,
    weekHigh: 4185,
    weekLow: 3310,
    isNifty50: true,
    earnings: [
      {
        q: "Q4 FY26",
        revenueGrowth: 9.6,
        profitGrowth: 11.2,
        epsGrowth: 11.5,
        score: 75,
        verdict: "Bullish",
        details: "Robust deal total contract value (TCV) of $13.2 Billion. AI and GenAI consulting practices grew 120% YoY, proving tech-edge."
      }
    ],
    actions: [
      {
        date: "2026-07-02",
        type: "DIVIDEND",
        details: "Special Dividend of ₹28.00 and Final Dividend of ₹12.00 declared.",
        impact: "Ex-dividends totaling ₹40 per share represents highly efficient capital recycling.",
        amount: 40
      }
    ]
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd.",
    sector: "Information Technology",
    price: 1485.40,
    prevClose: 1462.10,
    change: 23.30,
    pctChange: 1.59,
    marketCapCr: 616420,
    pe: 24.2,
    eps: 61.3,
    roe: 30.5,
    debtEquity: 0.08,
    divYield: 3.10,
    volume: 4895020,
    deliveryPct: 68.2,
    description: "Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services. The company was founded in Pune and is headquartered in Bangalore.",
    rsi: 59,
    macd: 5.4,
    support: 1430,
    resistance: 1515,
    ma50: 1450,
    ma200: 1480,
    weekHigh: 1710,
    weekLow: 1350,
    isNifty50: true,
    earnings: [
      {
        q: "Q4 FY26",
        revenueGrowth: 6.8,
        profitGrowth: 7.9,
        epsGrowth: 8.1,
        score: 62,
        verdict: "Neutral",
        details: "Discretionary spending in North American financial services remains sluggish, but long term cost-takeout deals provide guidance stability."
      }
    ],
    actions: [
      {
        date: "2026-06-10",
        type: "DIVIDEND",
        details: "Final Dividend of ₹20.00 declared.",
        impact: "Direct ledger credit pending verification on Jun 29.",
        amount: 20
      }
    ]
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd.",
    sector: "Banking & Finance",
    price: 1120.40,
    prevClose: 1115.10,
    change: 5.30,
    pctChange: 0.48,
    marketCapCr: 785420,
    pe: 17.5,
    eps: 64.0,
    roe: 18.5,
    debtEquity: 0.90,
    divYield: 0.89,
    volume: 6850120,
    deliveryPct: 59.8,
    description: "ICICI Bank Limited is an Indian multinational banking and financial services company headquartered in Mumbai. It offers a wide range of banking products and financial services for corporate and retail customers.",
    rsi: 55,
    macd: 4.1,
    support: 1090,
    resistance: 1150,
    ma50: 1110,
    ma200: 1060,
    weekHigh: 1180,
    weekLow: 980,
    isNifty50: true,
    earnings: [
      {
        q: "Q4 FY26",
        revenueGrowth: 16.5,
        profitGrowth: 19.4,
        epsGrowth: 19.1,
        score: 85,
        verdict: "Strong Bully",
        details: "NIMs sustained at 4.25% due to aggressive credit card and high-yielding retail advances penetration. Asset quality sets stellar records with Net NPA at 0.36%."
      }
    ],
    actions: [
      {
        date: "2026-07-20",
        type: "DIVIDEND",
        details: "Dividend of ₹10.00 declared.",
        amount: 10,
        impact: "Direct Demat yield boost."
      }
    ]
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    sector: "Banking & Finance",
    price: 812.50,
    prevClose: 815.10,
    change: -2.60,
    pctChange: -0.32,
    marketCapCr: 725410,
    pe: 11.2,
    eps: 72.5,
    roe: 19.1,
    debtEquity: 1.10,
    divYield: 1.68,
    volume: 12540950,
    deliveryPct: 45.2,
    description: "State Bank of India (SBI) is an Indian multinational public sector bank and financial services statutory body headquartered in Mumbai. SBI is the 48th largest bank in the world by total assets.",
    rsi: 48,
    macd: -1.2,
    support: 790,
    resistance: 840,
    ma50: 818,
    ma200: 750,
    weekHigh: 865,
    weekLow: 560,
    isNifty50: true,
    earnings: [
      {
        q: "Q4 FY26",
        revenueGrowth: 14.2,
        profitGrowth: 12.8,
        epsGrowth: 12.5,
        score: 70,
        verdict: "Bullish",
        details: "Sustained systemic loan growth of 15% YoY with retail housing leading metrics. Capital adequacy remains secure above statutory ratios."
      }
    ],
    actions: [
      {
        date: "2026-06-12",
        type: "DIVIDEND",
        details: "Dividend of ₹13.70 declared.",
        amount: 13.7,
        impact: "Ex-dividend date passed, ledger settlement complete."
      }
    ]
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd.",
    sector: "Automobile",
    price: 948.30,
    prevClose: 935.10,
    change: 13.20,
    pctChange: 1.41,
    marketCapCr: 314520,
    pe: 15.6,
    eps: 60.8,
    roe: 22.4,
    debtEquity: 0.62,
    divYield: 0.63,
    volume: 6245010,
    deliveryPct: 41.5,
    description: "Tata Motors Limited is an Indian multinational automotive manufacturing company, headquartered in Mumbai, part of the Tata Group. The company produces passenger cars, trucks, vans, coaches, and buses.",
    rsi: 65,
    macd: 11.4,
    support: 915,
    resistance: 970,
    ma50: 920,
    ma200: 840,
    weekHigh: 1045,
    weekLow: 590,
    isNifty50: true,
    earnings: [
      {
        q: "Q4 FY26",
        revenueGrowth: 15.6,
        profitGrowth: 28.4,
        epsGrowth: 28.1,
        score: 89,
        verdict: "Strong Bully",
        details: "Jaguar Land Rover (JLR) free cash flow hits record records of £2.2 Billion for FY26. Domestic commercial and EV vehicle market share rises to 44%."
      }
    ],
    actions: [
      {
        date: "2026-06-18",
        type: "DIVIDEND",
        details: "Final Dividend of ₹6.00 and Special Dividend of ₹2.00 approved.",
        amount: 8,
        impact: "Total inflow of ₹8.00 per share pending bank routing codes resolution."
      }
    ]
  },
  {
    symbol: "ITC",
    name: "ITC Ltd.",
    sector: "Consumer Goods",
    price: 435.60,
    prevClose: 436.20,
    change: -0.60,
    pctChange: -0.14,
    marketCapCr: 543120,
    pe: 26.4,
    eps: 16.5,
    roe: 28.8,
    debtEquity: 0.01,
    divYield: 3.75,
    volume: 8520410,
    deliveryPct: 78.4,
    description: "ITC Limited is an Indian conglomerate company headquartered in Kolkata. ITC has a diversified presence across industries such as FMCG, hotels, software, packaging, paperboards, specialty papers, and agribusiness.",
    rsi: 46,
    macd: 0.1,
    support: 425,
    resistance: 448,
    ma50: 434,
    ma200: 441,
    weekHigh: 512,
    weekLow: 405,
    isNifty50: true,
    earnings: [
      {
        q: "Q4 FY26",
        revenueGrowth: 5.2,
        profitGrowth: 4.8,
        epsGrowth: 4.5,
        score: 58,
        verdict: "Neutral",
        details: "Cigarettes volume growth stable at 2.5% YoY. Non-cigarette FMCG assets showing margin improvements, but agribusiness impacted by regulatory wheat pricing."
      }
    ],
    actions: [
      {
        date: "2026-07-15",
        type: "DIVIDEND",
        details: "Dividend of ₹7.50 declared.",
        amount: 7.5,
        impact: "Ex-date Jul 04. Standard high yield stabilizer."
      }
    ]
  },
  {
    symbol: "L&T",
    name: "Larsen & Toubro Ltd.",
    sector: "Infrastructure & Capital Goods",
    price: 3410.20,
    prevClose: 3385.10,
    change: 25.10,
    pctChange: 0.74,
    marketCapCr: 478540,
    pe: 34.1,
    eps: 100.0,
    roe: 14.8,
    debtEquity: 0.78,
    divYield: 0.82,
    volume: 1895020,
    deliveryPct: 69.1,
    description: "Larsen & Toubro Ltd, commonly known as L&T, is an Indian multinational conglomerate company, with business interests in engineering, construction, manufacturing, technology, information technology, and financial services.",
    rsi: 54,
    macd: 6.2,
    support: 3350,
    resistance: 3480,
    ma50: 3375,
    ma200: 3180,
    weekHigh: 3890,
    weekLow: 2850,
    isNifty50: true,
    earnings: [
      {
        q: "Q4 FY26",
        revenueGrowth: 14.8,
        profitGrowth: 11.5,
        epsGrowth: 11.2,
        score: 72,
        verdict: "Bullish",
        details: "Total order book hits a staggering high-water mark of ₹4.8 Lakh Crore. Middle East orders continue to expand, boosting multi-year revenue visibility."
      }
    ],
    actions: [
      {
        date: "2026-07-28",
        type: "DIVIDEND",
        details: "Dividend of ₹28.00 declared.",
        amount: 28,
        impact: "High-value cash influx."
      }
    ]
  },
  {
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical Industries Ltd.",
    sector: "Pharmaceuticals",
    price: 1545.00,
    prevClose: 1520.40,
    change: 24.60,
    pctChange: 1.62,
    marketCapCr: 370420,
    pe: 38.4,
    eps: 40.2,
    roe: 15.6,
    debtEquity: 0.08,
    divYield: 0.84,
    volume: 1540920,
    deliveryPct: 71.4,
    description: "Sun Pharmaceutical Industries Limited is an Indian multinational pharmaceutical company headquartered in Mumbai, Maharashtra, which manufactures and sells pharmaceutical formulations and active pharmaceutical ingredients primarily in India and the US.",
    rsi: 68,
    macd: 14.5,
    support: 1490,
    resistance: 1580,
    ma50: 1502,
    ma200: 1410,
    weekHigh: 1620,
    weekLow: 1150,
    isNifty50: true,
    earnings: [
      {
        q: "Q4 FY26",
        revenueGrowth: 11.2,
        profitGrowth: 18.5,
        epsGrowth: 18.2,
        score: 83,
        verdict: "Bullish",
        details: "Specialty portfolio in the US continues to expand with 19% YoY traction. Global dermatology and ophthalmology margins reach 29%."
      }
    ],
    actions: [
      {
        date: "2026-08-01",
        type: "DIVIDEND",
        details: "Dividend of ₹5.00 declared.",
        amount: 5,
        impact: "Yield distribution of ₹5.00."
      }
    ]
  }
];

export const initialSectors: SectorData[] = [
  { name: "IT (Information Tech)", indexSymbol: "NIFTY_IT", price: 34620, change: 480, pctChange: 1.41, relativeStrength: 65, moneyFlowIndex: 58, momentum: "Bullish", signal: "ACCUMULATE" },
  { name: "Banking & Finance", indexSymbol: "NIFTY_BANK", price: 51220, change: -191, pctChange: -0.37, relativeStrength: 42, moneyFlowIndex: 32, momentum: "Bearish", signal: "REDUCE" },
  { name: "Pharmaceuticals", indexSymbol: "NIFTY_PHARMA", price: 19412, change: 310, pctChange: 1.62, relativeStrength: 82, moneyFlowIndex: 85, momentum: "Strong Bullish", signal: "BOOK_PROFIT" },
  { name: "Automobile", indexSymbol: "NIFTY_AUTO", price: 22105, change: 245, pctChange: 1.12, relativeStrength: 72, moneyFlowIndex: 68, momentum: "Bullish", signal: "HOLD" },
  { name: "FMCG (Cons. Goods)", indexSymbol: "NIFTY_FMCG", price: 54110, change: -54, pctChange: -0.10, relativeStrength: 48, moneyFlowIndex: 45, momentum: "Neutral", signal: "ACCUMULATE" },
  { name: "Metal & Mining", indexSymbol: "NIFTY_METAL", price: 8912, change: 115, pctChange: 1.31, relativeStrength: 58, moneyFlowIndex: 71, momentum: "Bullish", signal: "HOLD" },
  { name: "Infrastructure & Realty", indexSymbol: "NIFTY_INFRA", price: 8345, change: 67, pctChange: 0.81, relativeStrength: 61, moneyFlowIndex: 59, momentum: "Neutral", signal: "HOLD" }
];

export const financialNews: NewsItem[] = [
  {
    id: "N-1",
    timestamp: "10 mins ago",
    title: "US Federal Reserve hints at interest rate cut in upcoming autumn session; NIFTY futures spike by 120 points",
    source: "Bloomberg Terminal",
    sentiment: "BULLISH",
    score: 88,
    impactSectors: ["IT (Information Tech)", "Banking & Finance"]
  },
  {
    id: "N-2",
    timestamp: "45 mins ago",
    title: "RBI MPC Minutes disclose strong vigil on core food inflation; Repo rates expected to stay at 6.50% longer",
    source: "Moneycontrol Pro",
    sentiment: "NEUTRAL",
    score: 52,
    impactSectors: ["Banking & Finance", "FMCG (Cons. Goods)"]
  },
  {
    id: "N-3",
    timestamp: "2 hours ago",
    title: "HDFC Bank deposit margins remain constricted; Private sector bank space triggers minor liquidations from FIIs",
    source: "Goldman Sachs Prime Research",
    sentiment: "BEARISH",
    score: 25,
    impactSectors: ["Banking & Finance"]
  },
  {
    id: "N-4",
    timestamp: "3 hours ago",
    title: "India Automobile wholesale indexes jump 8% YoY with high EV utility passenger car delivery records",
    source: "SIAM India Report",
    sentiment: "BULLISH",
    score: 81,
    impactSectors: ["Automobile"]
  },
  {
    id: "N-5",
    timestamp: "5 hours ago",
    title: "Sun Pharma receives USFDA clearance for its high-margin generic anti-allergy manufacturing plant in Gujarat",
    source: "BSE Corporate Announcements",
    sentiment: "BULLISH",
    score: 91,
    impactSectors: ["Pharmaceuticals"]
  }
];

export const initialInsiderDeals: InsiderDeal[] = [
  { id: "D-1", company: "RELIANCE", promoter: "Reliance Promoter Group (Mukesh Ambani)", type: "BUY", shares: 450000, valueCr: 110.8, date: "2026-06-11", confidenceEffect: "POSITIVE" },
  { id: "D-2", company: "TCS", promoter: "Tata Sons Private Limited", type: "BUY", shares: 250000, valueCr: 93.8, date: "2026-06-10", confidenceEffect: "POSITIVE" },
  { id: "D-3", company: "SUNPHARMA", promoter: "Dilip Shanghvi Family Trust", type: "BUY", shares: 120000, valueCr: 18.5, date: "2026-06-08", confidenceEffect: "POSITIVE" },
  { id: "D-4", company: "HDFCBANK", promoter: "Societe Generale FI Liquidations", type: "BULK_SELL", shares: 1450000, valueCr: 220.4, date: "2026-06-07", confidenceEffect: "NEGATIVE" },
  { id: "D-5", company: "TATAMOTORS", promoter: "Tata Motors Employee Welfare Trust", type: "BUY", shares: 85000, valueCr: 8.0, date: "2026-06-06", confidenceEffect: "NEUTRAL" }
];

export const macroIndicators: MacroIndicator[] = [
  {
    name: "RBI Repo Rate",
    code: "REPO_RATE",
    currentValue: "6.50%",
    previousValue: "6.50%",
    trend: "STABLE",
    aiInsight: "Unchanged rate cushions banking margins but holds mortgage lending in check. Positive for Banks, Negative for ultra-leveraged Infrastructure."
  },
  {
    name: "CPI Consumer Inflation",
    code: "CPI_INFLATION",
    currentValue: "4.82%",
    previousValue: "5.01%",
    trend: "DOWN",
    aiInsight: "Softening commodity and crude pricing trends relieve consumption margins. Positively impacts FMCG and Automobiles."
  },
  {
    name: "Quarterly GDP Growth",
    code: "GDP_GROWTH",
    currentValue: "8.2%",
    previousValue: "7.9%",
    trend: "UP",
    aiInsight: "Infrastructure outlay and heavy engineering capital recycling supports systemic corporate earnings. Strong tailwind for Capital Goods and Metal sectors."
  },
  {
    name: "USD / INR Currency Rate",
    code: "USD_INR",
    currentValue: "₹83.45",
    previousValue: "₹83.25",
    trend: "UP",
    aiInsight: "Marginal weakening of the rupee directly pads dollar-denominated export revenues. Strong structural boost for IT Exports and Pharma companies."
  },
  {
    name: "Brent Crude Oil",
    code: "BRENT_CRUDE",
    currentValue: "$78.40/bbl",
    previousValue: "$82.10/bbl",
    trend: "DOWN",
    aiInsight: "Reduction in import energy bills directly improves gross profit indexes across secondary sectors. Highly Positive for Paints, Chemicals, and Automobiles."
  }
];

// 2. Real-time Simulation Engine Helper Functions
export function simulateMarketTick(
  indices: IndexData[],
  companies: CompanyData[],
  sectors: SectorData[]
): { indices: IndexData[]; companies: CompanyData[]; sectors: SectorData[] } {
  // Tick index values slightly
  const nextIndices = indices.map(idx => {
    const volatility = idx.symbol === "NIFTY_SMALL_100" ? 0.0015 : 0.0008;
    const sign = Math.random() > 0.47 ? 1 : -1; // minor upward drift
    const pct = Math.random() * volatility * sign;
    const tick = idx.value * pct;
    const newValue = Number((idx.value + tick).toFixed(2));
    const newChange = Number((newValue - idx.prevClose).toFixed(2));
    const newPctChange = Number(((newChange / idx.prevClose) * 100).toFixed(2));
    const newHigh = newValue > idx.high ? newValue : idx.high;
    const newLow = newValue < idx.low ? newValue : idx.low;
    
    // update historical chart preview
    const nextChart = [...idx.chartData.slice(1), Number(newValue.toFixed(1))];

    return {
      ...idx,
      value: newValue,
      change: newChange,
      pctChange: newPctChange,
      high: newHigh,
      low: newLow,
      chartData: nextChart
    };
  });

  // Tick company prices slightly
  const nextCompanies = companies.map(c => {
    // IT/Auto high beta shifts, FMCG lower beta
    const vol = c.sector.includes("IT") || c.sector.includes("Auto") ? 0.0022 : 0.0012;
    const sign = Math.random() > 0.49 ? 1 : -1;
    const pct = Math.random() * vol * sign;
    const newValue = Number((c.price * (1 + pct)).toFixed(2));
    const newChange = Number((newValue - c.prevClose).toFixed(2));
    const newPctChange = Number(((newChange / c.prevClose) * 100).toFixed(2));
    const weekHigh = newValue > c.weekHigh ? newValue : c.weekHigh;
    const weekLow = newValue < c.weekLow ? newValue : c.weekLow;

    // RSI drifts slightly according to price tick
    let nextRsi = c.rsi;
    if (sign > 0) nextRsi = Math.min(92, c.rsi + Math.random() * 0.5);
    else nextRsi = Math.max(8, c.rsi - Math.random() * 0.5);

    return {
      ...c,
      price: newValue,
      change: newChange,
      pctChange: newPctChange,
      weekHigh,
      weekLow,
      rsi: Number(nextRsi.toFixed(1)),
      volume: c.volume + Math.floor(Math.random() * 2500)
    };
  });

  // Tick sectors slightly aligned with index
  const nextSectors = sectors.map(sec => {
    const isPharmaOrIt = sec.name.includes("Pharma") || sec.name.includes("IT");
    const sign = isPharmaOrIt ? (Math.random() > 0.44 ? 1 : -1) : (Math.random() > 0.52 ? 1 : -1);
    const pctChange = Math.random() * 0.0018 * sign;
    const newPrice = Number((sec.price * (1 + pctChange)).toFixed(1));
    const pctVal = Number(((pctChange) * 100).toFixed(2));

    return {
      ...sec,
      price: newPrice,
      pctChange: Number((sec.pctChange + pctVal).toFixed(2)),
      relativeStrength: Math.min(100, Math.max(10, sec.relativeStrength + (sign * Math.random() * 0.4)))
    };
  });

  return {
    indices: nextIndices,
    companies: nextCompanies,
    sectors: nextSectors
  };
}
