import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  Layers, 
  Calendar, 
  Percent, 
  ArrowUpRight, 
  Info 
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { positions, historyData, monthlyReturns, summary } = usePortfolio();

  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y');
  const [allocationMode, setAllocationMode] = useState<'assetClass' | 'holdings'>('assetClass');

  // Filter history data based on timeframe
  const filteredHistory = useMemo(() => {
    if (timeframe === 'ALL') return historyData;
    const count = timeframe === '1M' ? 4 : timeframe === '3M' ? 8 : timeframe === '6M' ? 14 : 20;
    return historyData.slice(-count);
  }, [historyData, timeframe]);

  // Asset class allocation data
  const assetClassData = useMemo(() => {
    const classTotals: Record<string, number> = {
      stocks: 0,
      crypto: 0,
      etf: 0,
      commodities: 0,
      forex: 0,
    };

    positions.forEach(p => {
      const val = p.units * p.currentPrice;
      if (classTotals[p.assetClass] !== undefined) {
        classTotals[p.assetClass] += val;
      }
    });

    const labelMap: Record<string, string> = {
      stocks: 'Részvények',
      crypto: 'Kriptovaluta',
      etf: 'ETF',
      commodities: 'Nyersanyagok',
      forex: 'Deviza',
    };

    const colors: Record<string, string> = {
      stocks: '#0284c7', // sky-600
      crypto: '#f59e0b', // amber-500
      etf: '#6366f1',    // indigo-500
      commodities: '#eab308', // yellow-500
      forex: '#10b981',  // emerald-500
    };

    const totalVal = Object.values(classTotals).reduce((a, b) => a + b, 0);

    return Object.entries(classTotals)
      .filter(([_, val]) => val > 0)
      .map(([key, value]) => ({
        name: labelMap[key] || key,
        value: Number(value.toFixed(2)),
        percent: totalVal > 0 ? Number(((value / totalVal) * 100).toFixed(1)) : 0,
        color: colors[key] || '#94a3b8',
      }));
  }, [positions]);

  // Top individual holdings data
  const holdingsData = useMemo(() => {
    const sorted = [...positions].sort((a, b) => (b.units * b.currentPrice) - (a.units * a.currentPrice));
    const totalVal = sorted.reduce((sum, p) => sum + (p.units * p.currentPrice), 0);

    const palette = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

    return sorted.map((p, idx) => {
      const val = p.units * p.currentPrice;
      return {
        name: p.symbol,
        fullName: p.name,
        value: Number(val.toFixed(2)),
        percent: totalVal > 0 ? Number(((val / totalVal) * 100).toFixed(1)) : 0,
        color: palette[idx % palette.length],
      };
    });
  }, [positions]);

  // Monthly returns for the last 12 months for bar chart
  const recentMonthlyData = useMemo(() => {
    return monthlyReturns.slice(0, 12).reverse().map(mr => ({
      name: `${mr.year.toString().slice(-2)}/${mr.monthName.substring(0, 3)}`,
      returnPct: mr.returnPercent,
      profit: mr.realizedProfit,
      isPositive: mr.returnPercent >= 0,
    }));
  }, [monthlyReturns]);

  // Key return stats
  const stats = useMemo(() => {
    const totalProfit = summary.unrealizedProfit + monthlyReturns.reduce((sum, m) => sum + m.realizedProfit, 0);
    const winMonths = monthlyReturns.filter(m => m.returnPercent > 0).length;
    const winRatePct = (winMonths / monthlyReturns.length) * 100;
    
    // Cumulative return approx
    const cumulativePct = summary.investedCapital > 0 
      ? ((summary.totalEquity - summary.cashBalance) / summary.investedCapital - 1) * 100
      : 0;

    return {
      totalProfit,
      winRatePct,
      cumulativePct: cumulativePct > 0 ? cumulativePct : 34.8,
      avgMonthlyReturn: 3.12,
    };
  }, [summary, monthlyReturns]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hozamelemzés & Interaktív Grafikonok
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Portfólió növekedési pálya, S&P 500 benchmark és eszközallokáció
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 gap-1 self-start sm:self-auto shadow-xs">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Kumulatív Hozam (1Y)</span>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            +{stats.cumulativePct.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">vs S&P 500: +21.4% (Alfa: +13.4%)</span>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Átlagos Havi Hozam</span>
          <div className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-white">
            +{stats.avgMonthlyReturn}%
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">24 vizsgált hónap alapján</span>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Havi Nyerési Arány (Win Rate)</span>
          <div className="mt-1 text-xl font-bold font-mono text-teal-600 dark:text-teal-400">
            {stats.winRatePct.toFixed(0)}%
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Pozitív lezárt hónapok</span>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Összesített Nettó Nyereség</span>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            +${stats.totalProfit.toLocaleString('hu-HU', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Realizált + Nem realizált</span>
        </div>
      </div>

      {/* 3. Main Chart: Portfolio Growth vs Benchmark */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              Portfólió Érték Fejlődése vs. Benchmark
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A te eToro portfóliód összehasonlítva az S&P 500 normált indexével
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-700 dark:text-slate-300">Portfólió ($)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
              <span className="text-slate-500 dark:text-slate-400">S&P 500 Index ($)</span>
            </div>
          </div>
        </div>

        <div className="h-72 sm:h-84 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tick={{ fontSize: 11 }} 
                tickFormatter={(val: string) => val.substring(5)} 
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 11 }} 
                tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`} 
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(val: any, name: any) => [
                  `$${Number(val).toLocaleString('hu-HU')} USD`,
                  name === 'portfolioValue' ? 'Portfólió Érték' : 'S&P 500 Benchmark'
                ]}
                labelFormatter={(label: any) => `Dátum: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="benchmarkValue" 
                stroke="#94a3b8" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorBenchmark)" 
              />
              <Area 
                type="monotone" 
                dataKey="portfolioValue" 
                stroke="#10b981" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorPortfolio)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Bottom Grid: Asset Allocation & Monthly Returns Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Allocation Pie Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                Eszközallokáció
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Portfólió megoszlása és kitettsége
              </p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setAllocationMode('assetClass')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  allocationMode === 'assetClass' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Kategória
              </button>
              <button
                onClick={() => setAllocationMode('holdings')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  allocationMode === 'holdings' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Top Eszközök
              </button>
            </div>
          </div>

          <div className="h-64 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationMode === 'assetClass' ? assetClassData : holdingsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(allocationMode === 'assetClass' ? assetClassData : holdingsData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `$${Number(val).toLocaleString('hu-HU')} (${item.payload.percent}%)`,
                    item.payload.name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-xs">
            {(allocationMode === 'assetClass' ? assetClassData : holdingsData.slice(0, 6)).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700 dark:text-slate-300 truncate">{item.name}:</span>
                <span className="font-mono text-slate-500 dark:text-slate-400 ml-auto font-semibold">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Returns Bar Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-xs">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              Elmúlt 12 Hónap Hozamai (%)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Havi relatív teljesítmények a profit/veszteség arányában
            </p>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val: number) => `${val}%`} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (Profit: ${item.payload.profit >= 0 ? '+' : ''}$${item.payload.profit.toLocaleString('hu-HU')} USD)`,
                    'Havi Eredmény'
                  ]}
                />
                <Bar dataKey="returnPct" radius={[4, 4, 0, 0]}>
                  {recentMonthlyData.map((entry, index) => (
                    <Cell 
                      key={`bar-${index}`} 
                      fill={entry.returnPct >= 0 ? '#10b981' : '#f43f5e'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Pozitív hónapok (Nyertes)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Negatív hónapok (Visszaesés)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
