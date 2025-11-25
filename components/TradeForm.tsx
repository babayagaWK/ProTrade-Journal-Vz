import React, { useState, useEffect } from 'react';
import { X, Upload, Wand2, Loader2 } from 'lucide-react';
import { Trade } from '../types';
import { analyzeTradeWithGemini } from '../services/geminiService';

interface TradeFormProps {
  onClose: () => void;
  onSave: (trade: Trade) => void;
  initialData?: Trade | null; // Optional prop for editing
}

// Helper to ensure ID generation works in all environments
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const TradeForm: React.FC<TradeFormProps> = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Trade>>({
    date: new Date().toISOString().split('T')[0],
    symbol: '',
    type: 'LONG',
    entryPrice: 0,
    exitPrice: 0,
    quantity: 1,
    fees: 0,
    setup: '',
    notes: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setAiFeedback(initialData.aiAnalysis || '');
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatePnL = () => {
    const { entryPrice, exitPrice, quantity, type, fees } = formData;
    if (entryPrice === undefined || exitPrice === undefined || quantity === undefined) return 0;
    
    let grossPnL = 0;
    if (type === 'LONG') {
      grossPnL = (exitPrice - entryPrice) * quantity;
    } else {
      grossPnL = (entryPrice - exitPrice) * quantity;
    }
    return grossPnL - (fees || 0);
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    const pnl = calculatePnL();
    const tradeForAnalysis = { ...formData, pnl };
    
    const feedback = await analyzeTradeWithGemini(tradeForAnalysis);
    setAiFeedback(feedback);
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pnl = calculatePnL();
    
    const tradeData: Trade = {
      // If editing, keep existing ID, otherwise generate new
      id: initialData?.id || generateId(),
      ...formData as Trade,
      pnl,
      aiAnalysis: aiFeedback
    };
    onSave(tradeData);
    onClose();
  };

  const pnlPreview = calculatePnL();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Trade' : 'Log New Trade'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date & Symbol */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
              <input type="date" name="date" required value={formData.date} onChange={handleChange} 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Symbol</label>
              <input type="text" name="symbol" required placeholder="BTCUSD, AAPL" value={formData.symbol} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
            </div>

            {/* Type & Setup */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Direction</label>
              <select name="type" value={formData.type} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="LONG">LONG (Buy)</option>
                <option value="SHORT">SHORT (Sell)</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Setup / Strategy</label>
              <input type="text" name="setup" placeholder="e.g. Breakout, Reversal" value={formData.setup} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            {/* Execution Details */}
             <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Entry Price</label>
              <input type="number" step="0.01" name="entryPrice" required value={formData.entryPrice} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Exit Price</label>
              <input type="number" step="0.01" name="exitPrice" required value={formData.exitPrice} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Quantity</label>
              <input type="number" step="0.01" name="quantity" required value={formData.quantity} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Fees/Comm</label>
              <input type="number" step="0.01" name="fees" value={formData.fees} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          {/* PnL Preview */}
          <div className="bg-slate-900 rounded-lg p-4 flex justify-between items-center border border-slate-700">
            <span className="text-slate-400 font-medium">Estimated P&L</span>
            <span className={`text-xl font-bold ${pnlPreview >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {pnlPreview >= 0 ? '+' : ''}${pnlPreview.toFixed(2)}
            </span>
          </div>

          {/* Notes & Image */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
            <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="What happened? Emotional state?" />
          </div>

          {/* AI Analysis Section */}
          <div className="flex gap-2 items-start">
             <button
              type="button"
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4"/> : <Wand2 className="w-4 h-4" />}
              AI Analyze
            </button>
            {aiFeedback && (
              <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-lg flex-1">
                 <p className="text-indigo-200 text-sm italic">"{aiFeedback}"</p>
              </div>
            )}
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-400 mb-1">Chart Screenshot</label>
             <div className="flex items-center gap-4">
               <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-slate-600 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
               </label>
               {imagePreview && (
                 <div className="h-16 w-16 relative rounded-md overflow-hidden border border-slate-600">
                   <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                 </div>
               )}
             </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-300 hover:text-white font-medium">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-lg shadow-emerald-900/20 transition-all">
              {initialData ? 'Update Trade' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};