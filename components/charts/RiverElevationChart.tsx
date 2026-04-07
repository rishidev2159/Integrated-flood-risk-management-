"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useRiverComparison } from "@/hooks/useSeaLevelData";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function RiverElevationChart() {
  const { data: comparisonData = [], isLoading } = useRiverComparison();

  if (isLoading) {
    return (
      <div className="w-full h-[400px] bg-white dark:bg-white/5 animate-pulse rounded-3xl border border-slate-200 dark:border-white/10 flex items-center justify-center">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Analytics...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none hover:shadow-2xl transition-all group">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            Elevation Comparison
          </h3>
          <p className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">River Stage Analytics</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500/50" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Baseline</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current</span>
           </div>
        </div>
      </div>

      <div className="h-[350px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              hide={true}
            />
            <YAxis 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              unit="m"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              labelStyle={{ display: 'none' }}
            />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorBaseline)"
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="#22d3ee"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCurrent)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
        <MiniStat 
          label="Average Level" 
          value={(comparisonData.reduce((acc, curr) => acc + curr.current, 0) / (comparisonData.length || 1)).toFixed(2) + "m"} 
          icon={<Minus className="w-3.5 h-3.5 text-blue-400" />}
        />
        <MiniStat 
          label="Max Elevation" 
          value={Math.max(...comparisonData.map(d => d.current), 0).toFixed(2) + "m"} 
          icon={<TrendingUp className="w-3.5 h-3.5 text-red-500" />}
        />
         <MiniStat 
          label="Min Elevation" 
          value={Math.min(...comparisonData.map(d => d.current), Infinity).toFixed(2) + "m"} 
          icon={<TrendingDown className="w-3.5 h-3.5 text-green-500" />}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-accent/30 transition-all group/stat">
      <div className="p-2 bg-white dark:bg-white/5 rounded-xl shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-black text-slate-900 dark:text-white group-hover/stat:text-accent transition-colors">{value}</p>
      </div>
    </div>
  );
}
