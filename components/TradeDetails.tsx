import React from 'react';
import { X, TrendingUp, TrendingDown, Calendar, Hash, DollarSign, Image as ImageIcon, BrainCircuit, FileText } from 'lucide-react';
import { Trade } from '../types';

interface TradeDetailsProps {
  trade: Trade;
  onClose: () => void;
}

export const TradeDetails: React.FC<TradeDetailsProps> = ({ trade, onClose }) => {
  const isWin = trade.pnl >= 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-700 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isWin ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
             </div>
             <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {trade.symbol} 
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${isWin ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'}`}>
                    {trade.type}
                  </span>
                </h2>
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <Calendar size={12} /> {trade.date}
                </span>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block mb-1">P&L</span>
                    <span className={`text-xl font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                       {isWin ? '+' : ''}{trade.pnl.toFixed(2)}
                    </span>
                </div>
                 <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block mb-1">Price</span>
                    <div className="flex flex-col">
                        <span className="text-slate-300 text-sm">In: <span className="text-white font-mono">{trade.entryPrice}</span></span>
                        <span className="text-slate-300 text-sm">Out: <span className="text-white font-mono">{trade.exitPrice}</span></span>
                    </div>
                </div>
                 <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block mb-1">Quantity</span>
                    <span className="text-white font-mono text-lg">{trade.quantity}</span>
                </div>
                 <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block mb-1">Setup</span>
                    <span className="text-indigo-300 font-medium">{trade.setup || 'N/A'}</span>
                </div>
            </div>

            {/* Notes & AI Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="text-slate-300 font-medium flex items-center gap-2">
                        <FileText size={16} /> User Notes
                    </h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 min-h-[120px] text-slate-300 text-sm leading-relaxed">
                        {trade.notes || <span className="text-slate-600 italic">No notes recorded.</span>}
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-indigo-300 font-medium flex items-center gap-2">
                        <BrainCircuit size={16} /> AI Analysis
                    </h3>
                    <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20 min-h-[120px] text-indigo-200 text-sm leading-relaxed">
                         {trade.aiAnalysis || <span className="text-indigo-400/50 italic">No AI analysis generated.</span>}
                    </div>
                </div>
            </div>

            {/* Chart Image */}
            {trade.imageUrl && (
                <div className="space-y-2">
                    <h3 className="text-slate-300 font-medium flex items-center gap-2">
                        <ImageIcon size={16} /> Chart Screenshot
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                        <img src={trade.imageUrl} alt="Trade Chart" className="w-full h-auto object-contain max-h-[500px]" />
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};