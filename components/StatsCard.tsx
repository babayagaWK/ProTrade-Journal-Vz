import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  colorClass?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subValue, 
  icon: Icon,
  trend,
  colorClass = "text-white"
}) => {
  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        {Icon && <Icon className="text-slate-500 w-5 h-5" />}
      </div>
      <div className="flex items-baseline gap-2">
        <h2 className={`text-2xl font-bold ${colorClass}`}>{value}</h2>
        {subValue && (
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-emerald-400' : 
            trend === 'down' ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};