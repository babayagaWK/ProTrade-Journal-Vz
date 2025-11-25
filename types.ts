export type TradeType = 'LONG' | 'SHORT';
export type TradeOutcome = 'WIN' | 'LOSS' | 'BE'; // Break Even
export type MarketType = 'SPOT' | 'FUTURE' | 'FX_CFD';

export interface Trade {
  id: string;
  date: string; // YYYY-MM-DD
  symbol: string;
  type: TradeType;
  marketType: MarketType;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  leverage?: number; // For Future and FX&CFD
  contractSize?: number; // For Future (e.g., BTC = 1, Gold = 100 oz)
  pnl: number;
  fees: number;
  setup: string;
  notes: string;
  imageUrl?: string;
  aiAnalysis?: string;
}

export interface DailyStats {
  date: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
}

export interface DashboardStats {
  totalPnL: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  totalTrades: number;
  bestDay: number;
  currentStreak: number;
}