import React from 'react';
import { Trade } from '../types';
import { Trash2, FileText, Image as ImageIcon, Pencil, Eye } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
  onDelete: (id: string) => void;
  onEdit: (trade: Trade) => void;
  onView: (trade: Trade) => void;
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades, onDelete, onEdit, onView }) => {
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
       <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Trade Log (Sheet View)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Symbol</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Setup</th>
              <th className="p-4 font-medium text-right">Entry</th>
              <th className="p-4 font-medium text-right">Exit</th>
              <th className="p-4 font-medium text-right">Size</th>
              <th className="p-4 font-medium text-right">P&L</th>
              <th className="p-4 font-medium text-center">Data</th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {trades.length === 0 ? (
                <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500">No trades recorded yet.</td>
                </tr>
            ) : (
                trades.map((trade) => (
                <tr 
                    key={trade.id} 
                    onClick={() => onView(trade)}
                    className="hover:bg-slate-700/30 transition-colors group cursor-pointer"
                >
                    <td className="p-4 text-slate-300 text-sm">{trade.date}</td>
                    <td className="p-4 text-white font-bold text-sm">{trade.symbol}</td>
                    <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${trade.type === 'LONG' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400'}`}>
                        {trade.type}
                    </span>
                    </td>
                    <td className="p-4 text-slate-300 text-sm">{trade.setup}</td>
                    <td className="p-4 text-right text-slate-300 text-sm">{trade.entryPrice}</td>
                    <td className="p-4 text-right text-slate-300 text-sm">{trade.exitPrice}</td>
                    <td className="p-4 text-right text-slate-300 text-sm">{trade.quantity}</td>
                    <td className={`p-4 text-right font-bold text-sm ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </td>
                    {/* Data Icons Cell: Added onClick stopPropagation to prevent row view */}
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center gap-1">
                            <button
                                type="button"
                                onClick={() => onView(trade)}
                                className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${trade.notes ? 'text-indigo-400' : 'text-slate-600'}`}
                                title={trade.notes ? "View Notes" : "No Notes"}
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onView(trade)}
                                className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${trade.imageUrl ? 'text-blue-400' : 'text-slate-600'}`}
                                title={trade.imageUrl ? "View Image" : "No Image"}
                            >
                                <ImageIcon className="w-4 h-4" />
                            </button>
                             {trade.aiAnalysis && (
                                <button 
                                    type="button"
                                    onClick={() => onView(trade)}
                                    className="p-1.5 rounded hover:bg-slate-700 transition-colors text-white"
                                    title="View AI Analysis"
                                >
                                    <span className="text-[10px] bg-indigo-600 px-1 rounded">AI</span>
                                </button>
                            )}
                        </div>
                    </td>
                    {/* Actions Cell: Added onClick stopPropagation and high Z-index to ensure buttons work */}
                    <td className="p-4 text-center cursor-default" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2 relative z-20">
                         <button 
                            type="button"
                            onClick={() => onView(trade)}
                            className="text-slate-400 hover:text-white hover:bg-slate-600 p-2 rounded-lg transition-all"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            type="button"
                            onClick={() => onEdit(trade)}
                            className="text-slate-400 hover:text-blue-400 hover:bg-slate-600 p-2 rounded-lg transition-all"
                            title="Edit Trade"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                            type="button"
                            onClick={() => onDelete(trade.id)}
                            className="text-slate-400 hover:text-rose-400 hover:bg-slate-600 p-2 rounded-lg transition-all"
                            title="Delete Trade"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};