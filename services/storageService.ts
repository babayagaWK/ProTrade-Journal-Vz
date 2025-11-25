import { Trade } from '../types';

const STORAGE_KEY = 'protrade_journal_data';
const API_KEY_STORAGE = 'protrade_gemini_api_key';

// Mock data for initial load if empty
const MOCK_TRADES: Trade[] = [
  {
    id: '1',
    date: '2023-10-02',
    symbol: 'BTCUSD',
    type: 'LONG',
    marketType: 'SPOT',
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
    marketType: 'FUTURE',
    entryPrice: 1600,
    exitPrice: 1620,
    quantity: 10,
    leverage: 10,
    contractSize: 1,
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
    marketType: 'SPOT',
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
    symbol: 'EURUSD',
    type: 'LONG',
    marketType: 'FX_CFD',
    entryPrice: 1.0850,
    exitPrice: 1.0900,
    quantity: 1,
    contractSize: 100000,
    pnl: 500,
    fees: 5,
    setup: 'Trend Follow',
    notes: 'Clean trend continuation.',
  },
  {
    id: '5',
    date: '2023-10-10',
    symbol: 'ES_F',
    type: 'SHORT',
    marketType: 'FUTURE',
    entryPrice: 4400,
    exitPrice: 4380,
    quantity: 2,
    leverage: 20,
    contractSize: 50,
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
    marketType: 'SPOT',
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

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE);
};

export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_STORAGE, apiKey);
};

export const clearApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE);
};