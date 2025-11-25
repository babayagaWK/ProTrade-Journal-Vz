import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Trade, DailyStats } from '../types';

interface CalendarViewProps {
  trades: Trade[];
  onViewTrade: (trade: Trade) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ trades, onViewTrade }) => {
  const [viewDate, setViewDate] = useState(new Date());
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  // Handlers for navigation
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setViewDate(new Date());
  };

  // Helper to get days in month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    let day = new Date(y, m, 1).getDay();
    // Adjust so Monday is 0, Sunday is 6
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  
  // Extend DailyStats locally to include individual trade results for the sparkline and listing
  interface DailyStatsWithResults extends DailyStats {
    results: number[];
    tradesList: Trade[];
  }

  // State for the selected day modal
  const [selectedDayStats, setSelectedDayStats] = useState<DailyStatsWithResults | null>(null);

  const dailyData = useMemo(() => {
    const map = new Map<string, DailyStatsWithResults>();
    
    // Process trades to aggregate stats by day
    trades.forEach(trade => {
      // Parse date string (YYYY-MM-DD) explicitly to avoid timezone issues
      const parts = trade.date.split('-');
      if (parts.length !== 3) return;
      
      const tYear = parseInt(parts[0], 10);
      const tMonth = parseInt(parts[1], 10) - 1; // 0-indexed
      const tDay = parseInt(parts[2], 10);

      // Filter for current month view
      if(tMonth !== month || tYear !== year) return;

      const dateKey = tDay.toString();
      
      const existing = map.get(dateKey) || { 
        date: trade.date, 
        pnl: 0, 
        trades: 0, 
        wins: 0, 
        losses: 0,
        results: [],
        tradesList: []
      };
      
      existing.pnl += trade.pnl;
      existing.trades += 1;
      if (trade.pnl > 0) existing.wins += 1;
      else if (trade.pnl < 0) existing.losses += 1;
      existing.results.push(trade.pnl);
      existing.tradesList.push(trade);
      
      map.set(dateKey, existing);
    });
    return map;
  }, [trades, month, year]);

  const daysArray = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - startDay + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return dayNumber;
    }
    return null;
  });

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Function to generate SVG path for sparkline (cumulative daily P&L)
  const getSparklinePath = (results: number[]) => {
    if (!results || results.length === 0) return '';
    
    // Build cumulative equity curve for the day starting at 0
    const points = [0];
    let current = 0;
    results.forEach(r => {
      current += r;
      points.push(current);
    });

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min;
    
    // Viewbox dimensions
    const width = 100;
    const height = 30;
    const padding = 2; 
    const usableHeight = height - (padding * 2);

    if (range === 0) {
        // Flat line
        return `M 0,${height/2} L ${width},${height/2}`;
    }

    const pathData = points.map((val, index) => {
        const x = (index / (points.length - 1)) * width;
        // Normalize Y. Top is 0, Bottom is height.
        // We want higher values at the top (smaller Y).
        const normalized = (val - min) / range;
        const y = (height - padding) - (normalized * usableHeight);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' L ');

    return `M ${pathData}`;
  };

  const handleDayClick = (stats: DailyStatsWithResults | undefined) => {
      if (stats && stats.tradesList.length > 0) {
          setSelectedDayStats(stats);
      }
  };

  return (
    <>
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white w-[160px]">{monthNames[month]} {year}</h2>
            <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-slate-700">
                <button 
                    onClick={handlePrevMonth} 
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                    title="Previous Month"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={handleToday} 
                    className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                    title="Jump to Today"
                >
                    Today
                </button>
                <button 
                    onClick={handleNextMonth} 
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                    title="Next Month"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>

        <div className="text-sm text-slate-400">Monthly P&L Overview</div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-900/50">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="py-3 text-center text-sm font-medium text-slate-400">
            {d}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 auto-rows-fr">
        {daysArray.map((day, idx) => {
          const stats = day ? dailyData.get(day.toString()) : undefined;
          const isProfitable = stats && stats.pnl > 0;
          const isLoss = stats && stats.pnl < 0;
          
          let bgClass = "bg-slate-800";
          if (day && stats) {
              if (isProfitable) bgClass = "bg-emerald-900/20";
              else if (isLoss) bgClass = "bg-rose-900/20";
          }
          
          const hasTrades = stats && stats.trades > 0;

          return (
            <div 
              key={idx} 
              onClick={() => handleDayClick(stats)}
              className={`min-h-[100px] border-b border-r border-slate-700 p-2 transition-colors relative group ${bgClass} ${hasTrades ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
            >
              {day && (
                <>
                  <span className="text-slate-500 text-sm font-medium relative z-10">{day}</span>
                  {stats && (
                    <>
                      <div className="mt-1 flex flex-col items-center justify-center h-full pb-6 relative z-10">
                        <span className={`text-sm font-bold ${isProfitable ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-200'}`}>
                          {stats.pnl >= 0 ? '+' : ''}${stats.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          {stats.trades} trade{stats.trades !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Sparkline Indicator */}
                      <div className="absolute bottom-1 left-1 right-1 h-8 opacity-40 pointer-events-none">
                         <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                            <path 
                                d={getSparklinePath(stats.results)} 
                                fill="none" 
                                stroke={isProfitable ? '#34d399' : isLoss ? '#f43f5e' : '#94a3b8'} 
                                strokeWidth="2" 
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                         </svg>
                      </div>

                      {/* Hover Hint (Desktop) */}
                      {hasTrades && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="bg-slate-900 rounded-full p-1 border border-slate-600 shadow-sm">
                                <ArrowRight size={10} className="text-slate-400"/>
                             </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>

    {/* Day Detail Modal */}
    {selectedDayStats && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedDayStats(null)}>
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 animate-in fade-in zoom-in duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h3 className="text-white font-bold text-lg">{selectedDayStats.date}</h3>
                        <p className={`text-sm font-medium ${selectedDayStats.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            Daily P&L: {selectedDayStats.pnl >= 0 ? '+' : ''}{selectedDayStats.pnl.toFixed(2)}
                        </p>
                    </div>
                    <button onClick={() => setSelectedDayStats(null)} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    <div className="space-y-2">
                        {selectedDayStats.tradesList.map((trade) => (
                            <div 
                                key={trade.id} 
                                onClick={() => {
                                    onViewTrade(trade);
                                    setSelectedDayStats(null);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-3 flex justify-between items-center cursor-pointer transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${trade.pnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {trade.pnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{trade.symbol}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] border ${trade.type === 'LONG' ? 'border-emerald-800 text-emerald-500' : 'border-rose-800 text-rose-500'}`}>
                                                {trade.type}
                                            </span>
                                            <span>{trade.setup || 'No Setup'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <div className={`font-bold text-sm ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                     </div>
                                     <div className="text-xs text-slate-500 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                         View Details <ArrowRight size={10} />
                                     </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )}
    </>
  );
};