import { Trade } from '../types';

const STORAGE_KEY = 'protrade_journal_data';

// Mock data for initial load if empty
const MOCK_TRADES: Trade[] = [
  {
    id: '1',
    date: '2023-10-02',
    symbol: 'BTCUSD',
    type: 'LONG',
    entryPrice: 28000,
    exitPrice: 28500,
    quantity: 1,
    pnl: 500,
    fees: 5,
    setup: 'Breakout',
    notes: 'Clean break of resistance.',
  },
  {
    id: '2',
    date: '2023-10-02',
    symbol: 'ETHUSD',
    type: 'SHORT',
    entryPrice: 1600,
    exitPrice: 1620,
    quantity: 10,
    pnl: -200,
    fees: 10,
    setup: 'Rejection',
    notes: 'Stopped out quickly.',
  },
  {
    id: '3',
    date: '2023-10-04',
    symbol: 'TSLA',
    type: 'LONG',
    entryPrice: 240,
    exitPrice: 250,
    quantity: 100,
    pnl: 1000,
    fees: 10,
    setup: 'Gap Fill',
    notes: 'Nice morning drive.',
  },
  {
    id: '4',
    date: '2023-10-05',
    symbol: 'NVDA',
    type: 'LONG',
    entryPrice: 450,
    exitPrice: 455,
    quantity: 50,
    pnl: 250,
    fees: 5,
    setup: 'Trend Follow',
    notes: 'Slow grinder.',
  },
  {
    id: '5',
    date: '2023-10-10',
    symbol: 'ES_F',
    type: 'SHORT',
    entryPrice: 4400,
    exitPrice: 4380,
    quantity: 2,
    pnl: 2000,
    fees: 5,
    setup: 'Breakdown',
    notes: 'Heavy selling pressure.',
  },
   {
    id: '6',
    date: '2023-10-12',
    symbol: 'AAPL',
    type: 'SHORT',
    entryPrice: 175,
    exitPrice: 176,
    quantity: 100,
    pnl: -100,
    fees: 2,
    setup: 'Rejection',
    notes: 'Fakeout.',
  }
];

export const getTrades = (): Trade[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // Initialize with mock data for demonstration
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TRADES));
    return MOCK_TRADES;
  }
  return JSON.parse(data);
};

export const saveTrade = (trade: Trade): Trade[] => {
  const currentTrades = getTrades();
  // Ensure we compare IDs as strings to be safe
  const index = currentTrades.findIndex(t => String(t.id) === String(trade.id));
  
  let updatedTrades;
  if (index >= 0) {
    // Update existing trade
    updatedTrades = [...currentTrades];
    updatedTrades[index] = trade;
  } else {
    // Add new trade
    updatedTrades = [...currentTrades, trade];
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrades));
  return updatedTrades;
};

export const deleteTrade = (id: string): Trade[] => {
  const currentTrades = getTrades();
  // Ensure we compare IDs as strings to be safe
  const updatedTrades = currentTrades.filter(t => String(t.id) !== String(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrades));
  return updatedTrades;
};

export const clearTrades = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};