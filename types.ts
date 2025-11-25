export type TradeType = 'LONG' | 'SHORT';
export type TradeOutcome = 'WIN' | 'LOSS' | 'BE'; // Break Even

export interface Trade {
  id: string;
  date: string; // YYYY-MM-DD
  symbol: string;
  type: TradeType;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
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