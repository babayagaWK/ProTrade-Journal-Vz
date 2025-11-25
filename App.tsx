import React, { useState, useEffect } from 'react';
import { PlusCircle, LayoutDashboard } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { TradeForm } from './components/TradeForm';
import { TradeDetails } from './components/TradeDetails';
import { Trade } from './types';
import { getTrades, saveTrade, deleteTrade } from './services/storageService';

const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for View/Edit Modals
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Load trades on mount
  useEffect(() => {
    const loadedTrades = getTrades();
    setTrades(loadedTrades);
    setLoading(false);
  }, []);

  const handleSaveTrade = (trade: Trade) => {
    const updatedTrades = saveTrade(trade);
    setTrades([...updatedTrades]); // Ensure new reference
    setEditingTrade(null); // Clear editing state if it was active
  };

  const handleDeleteTrade = (id: string) => {
    // Removed window.confirm to ensure immediate execution and avoid browser blocking
    const updatedTrades = deleteTrade(id);
    setTrades([...updatedTrades]); // Spread to force re-render
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsFormOpen(true);
  };

  const handleViewTrade = (trade: Trade) => {
    setSelectedTrade(trade);
  };

  const closeForm = () => {
      setIsFormOpen(false);
      setEditingTrade(null);
  }

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading ProTrade...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-emerald-500/30">
      
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">ProTrade<span className="text-emerald-400">Journal</span></h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded border border-slate-700">
                 {process.env.API_KEY ? "AI Enabled" : "AI Key Missing"}
              </div>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
              >
                <PlusCircle size={18} />
                Add Trade
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard 
            trades={trades} 
            onDeleteTrade={handleDeleteTrade} 
            onEditTrade={handleEditTrade}
            onViewTrade={handleViewTrade}
        />
      </main>

      {/* Form Modal (Add/Edit) */}
      {isFormOpen && (
        <TradeForm 
          onClose={closeForm} 
          onSave={handleSaveTrade}
          initialData={editingTrade}
        />
      )}

      {/* View Details Modal */}
      {selectedTrade && (
          <TradeDetails 
            trade={selectedTrade} 
            onClose={() => setSelectedTrade(null)} 
          />
      )}
    </div>
  );
};

export default App;