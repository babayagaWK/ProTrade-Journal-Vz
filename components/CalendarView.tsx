import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, ArrowRight, Calendar, Filter } from 'lucide-react';
import { Trade, DailyStats } from '../types';

interface CalendarViewProps {
  trades: Trade[];
  onViewTrade: (trade: Trade) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ trades, onViewTrade }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [showDateRangeFilter, setShowDateRangeFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>(trades);
  
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

  const handleYearMonthChange = (newYear: number, newMonth: number) => {
    setViewDate(new Date(newYear, newMonth, 1));
    setShowYearMonthPicker(false);
  };

  const handleApplyDateRange = () => {
    if (dateFrom && dateTo) {
      const filtered = trades.filter(trade => {
        return trade.date >= dateFrom && trade.date <= dateTo;
      });
      setFilteredTrades(filtered);
      setShowDateRangeFilter(false);
    }
  };

  const handleClearDateRange = () => {
    setDateFrom('');
    setDateTo('');
    setFilteredTrades(trades);
  };

  const activeTrades = dateFrom && dateTo ? filteredTrades : trades;

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
    activeTrades.forEach(trade => {
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
  }, [activeTrades, month, year]);

  const daysArray = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - startDay + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return dayNumber;
    }
    return null;
  });

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Generate year options (last 5 years + next 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

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
      <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setShowYearMonthPicker(!showYearMonthPicker)}
              className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 text-white font-bold transition-colors"
            >
              <Calendar size={18} />
              <span>{monthNames[month]} {year}</span>
            </button>
            
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

        <div className="flex items-center gap-3">
          {dateFrom && dateTo && (
            <div className="flex items-center gap-2 bg-indigo-900/30 border border-indigo-700 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-indigo-300">
                {dateFrom} → {dateTo}
              </span>
              <button 
                onClick={handleClearDateRange}
                className="text-indigo-400 hover:text-white"
                title="Clear filter"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <button
            onClick={() => setShowDateRangeFilter(!showDateRangeFilter)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              dateFrom && dateTo 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-slate-900/50 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Filter size={16} />
            Filter
          </button>
        </div>
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
    
    {/* Year/Month Picker Modal */}
    {showYearMonthPicker && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowYearMonthPicker(false)}>
        <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-lg">Select Month & Year</h3>
            <button onClick={() => setShowYearMonthPicker(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Year</label>
              <div className="grid grid-cols-4 gap-2">
                {yearOptions.map(y => (
                  <button
                    key={y}
                    onClick={() => handleYearMonthChange(y, month)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      y === year 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Month</label>
              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => handleYearMonthChange(year, i)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      i === month 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    {m.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Date Range Filter Modal */}
    {showDateRangeFilter && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDateRangeFilter(false)}>
        <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-lg">Filter by Date Range</h3>
            <button onClick={() => setShowDateRangeFilter(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClearDateRange}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleApplyDateRange}
                disabled={!dateFrom || !dateTo}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};