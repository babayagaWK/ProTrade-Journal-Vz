import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Percent, DollarSign, Activity, Calendar as CalendarIcon, List } from 'lucide-react';
import { Trade, DashboardStats } from '../types';
import { StatsCard } from './StatsCard';
import { CalendarView } from './CalendarView';
import { TradeTable } from './TradeTable';

interface DashboardProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
  onEditTrade: (trade: Trade) => void;
  onViewTrade: (trade: Trade) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ trades, onDeleteTrade, onEditTrade, onViewTrade }) => {
  const [view, setView] = React.useState<'dashboard' | 'journal' | 'calendar'>('dashboard');

  const stats: DashboardStats = useMemo(() => {
    const totalTrades = trades.length;
    if (totalTrades === 0) {
      return { totalPnL: 0, winRate: 0, profitFactor: 0, avgWin: 0, avgLoss: 0, totalTrades: 0, bestDay: 0, currentStreak: 0 };
    }

    const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl <= 0);
    const winRate = (wins.length / totalTrades) * 100;
    
    const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;

    // Simple best day logic
    const bestDay = trades.reduce((max, t) => Math.max(max, t.pnl), 0);

    return {
      totalPnL,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      totalTrades,
      bestDay,
      currentStreak: 0 // Placeholder
    };
  }, [trades]);

  const equityData = useMemo(() => {
    let runningBalance = 0;
    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sortedTrades.map((t, index) => {
      runningBalance += t.pnl;
      return {
        name: index + 1,
        date: t.date,
        balance: runningBalance
      };
    });
  }, [trades]);

  const pieData = [
    { name: 'Wins', value: stats.winRate },
    { name: 'Losses', value: 100 - stats.winRate }
  ];
  const PIE_COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-6">
      {/* Top Navigation / Tabs within Dashboard */}
      <div className="flex space-x-4 mb-4 border-b border-slate-700 pb-1">
          <button 
            onClick={() => setView('dashboard')} 
            className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors ${view === 'dashboard' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
             <TrendingUp size={18}/> Dashboard
          </button>
          <button 
            onClick={() => setView('calendar')} 
            className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors ${view === 'calendar' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
             <CalendarIcon size={18}/> Calendar
          </button>
          <button 
            onClick={() => setView('journal')} 
            className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors ${view === 'journal' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
             <List size={18}/> Trade Log
          </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total P&L" 
          value={`$${stats.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          colorClass={stats.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}
          icon={DollarSign}
        />
        <StatsCard 
          title="Win Rate" 
          value={`${stats.winRate.toFixed(1)}%`}
          subValue={`${stats.totalTrades} Trades`}
          icon={Percent}
        />
        <StatsCard 
          title="Profit Factor" 
          value={stats.profitFactor.toFixed(2)}
          colorClass="text-blue-400"
          icon={Activity}
        />
         <StatsCard 
          title="Avg Win / Loss" 
          value={`$${stats.avgWin.toFixed(0)}`}
          subValue={` / -$${stats.avgLoss.toFixed(0)}`}
          icon={TrendingUp}
        />
      </div>

      {/* Content based on Tab */}
      {view === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equity Curve */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700">
            <h3 className="text-slate-400 font-medium mb-4">Account Growth (Equity Curve)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                  <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Win/Loss Pie */}
          <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700 flex flex-col items-center justify-center">
            <h3 className="text-slate-400 font-medium mb-4 w-full text-left">Performance Distribution</h3>
            <div className="h-[250px] w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}/>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">{stats.winRate.toFixed(0)}%</span>
                  <span className="text-xs text-slate-400">Win Rate</span>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-300 text-sm">Wins</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span className="text-slate-300 text-sm">Losses</span>
                </div>
            </div>
          </div>
        </div>
      )}

      {view === 'calendar' && (
        <CalendarView trades={trades} onViewTrade={onViewTrade} />
      )}

      {view === 'journal' && (
         <TradeTable 
            trades={trades} 
            onDelete={onDeleteTrade} 
            onEdit={onEditTrade}
            onView={onViewTrade}
         />
      )}
    </div>
  );
};