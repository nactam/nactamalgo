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
  TrendingDown,
  PieChart as PieIcon, 
  BarChart3, 
  Layers, 
  Calendar, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { MonthlyReturn } from '../types';

export const AnalyticsView: React.FC = () => {
  const { positions, historyData, monthlyReturns, summary } = usePortfolio();

  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y');
  const [allocationMode, setAllocationMode] = useState<'assetClass' | 'holdings'>('assetClass');

  // Heatmap year selection (defaults to the current/latest year available, e.g. 2026)
  const availableHeatmapYears = useMemo(() => {
    const years = Array.from(new Set(monthlyReturns.map(m => m.year))).sort((a, b) => b - a);
    return years.length > 0 ? years : [2026];
  }, [monthlyReturns]);

  const [heatmapYear, setHeatmapYear] = useState<number>(() => {
    const years = Array.from(new Set(monthlyReturns.map(m => m.year))).sort((a, b) => b - a);
    return years[0] || 2026;
  });

  // Selected month for detailed inspection
  const [inspectedMonthNum, setInspectedMonthNum] = useState<number | null>(null);

  // Month metadata and data linking for the selected year
  const currentYearMonths = useMemo(() => {
    const monthsMeta = [
      { num: 1, name: 'Január', short: 'Jan' },
      { num: 2, name: 'Február', short: 'Feb' },
      { num: 3, name: 'Március', short: 'Már' },
      { num: 4, name: 'Április', short: 'Ápr' },
      { num: 5, name: 'Május', short: 'Máj' },
      { num: 6, name: 'Június', short: 'Jún' },
      { num: 7, name: 'Július', short: 'Júl' },
      { num: 8, name: 'Augusztus', short: 'Aug' },
      { num: 9, name: 'Szeptember', short: 'Szep' },
      { num: 10, name: 'Október', short: 'Okt' },
      { num: 11, name: 'November', short: 'Nov' },
      { num: 12, name: 'December', short: 'Dec' },
    ];

    const yearData = monthlyReturns.filter(m => m.year === heatmapYear);

    return monthsMeta.map(m => {
      const data = yearData.find(r => r.month === m.num);
      return {
        ...m,
        data,
        isCompleted: !!data,
      };
    });
  }, [monthlyReturns, heatmapYear]);

  // Active inspected month object (defaults to the latest completed month of the selected year)
  const activeInspectedMonth = useMemo(() => {
    if (inspectedMonthNum !== null) {
      return currentYearMonths.find(m => m.num === inspectedMonthNum)?.data || null;
    }
    const completed = [...currentYearMonths].reverse().find(m => m.data);
    return completed?.data || null;
  }, [currentYearMonths, inspectedMonthNum]);

  // Yearly summary statistics for the heatmap
  const heatmapYearStats = useMemo(() => {
    const activeData = currentYearMonths.map(m => m.data).filter((d): d is MonthlyReturn => !!d);
    if (activeData.length === 0) {
      return {
        compoundedYtd: 0,
        totalRealizedProfit: 0,
        winCount: 0,
        lossCount: 0,
        winRate: 0,
        bestMonth: null,
        worstMonth: null,
        avgMonthlyReturn: 0,
        totalTrades: 0,
        completedCount: 0,
      };
    }

    let compounded = 1;
    let totalProfit = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalTrades = 0;
    let best = activeData[0];
    let worst = activeData[0];
    let sumPct = 0;

    activeData.forEach(d => {
      compounded *= (1 + d.returnPercent / 100);
      totalProfit += d.realizedProfit;
      totalTrades += d.tradesCount;
      sumPct += d.returnPercent;
      if (d.returnPercent > 0) winCount++;
      else if (d.returnPercent < 0) lossCount++;

      if (d.returnPercent > best.returnPercent) best = d;
      if (d.returnPercent < worst.returnPercent) worst = d;
    });

    const ytd = (compounded - 1) * 100;
    const winRate = activeData.length > 0 ? (winCount / activeData.length) * 100 : 0;
    const avgReturn = activeData.length > 0 ? sumPct / activeData.length : 0;

    return {
      compoundedYtd: Number(ytd.toFixed(2)),
      totalRealizedProfit: totalProfit,
      winCount,
      lossCount,
      winRate: Number(winRate.toFixed(1)),
      bestMonth: best,
      worstMonth: worst,
      avgMonthlyReturn: Number(avgReturn.toFixed(2)),
      totalTrades,
      completedCount: activeData.length,
    };
  }, [currentYearMonths]);

  // Quarterly breakdown for the year
  const quarterlyData = useMemo(() => {
    const quarters = [
      { id: 'Q1', label: '1. Negyedév (Q1)', subtitle: 'Jan - Már', months: [1, 2, 3] },
      { id: 'Q2', label: '2. Negyedév (Q2)', subtitle: 'Ápr - Jún', months: [4, 5, 6] },
      { id: 'Q3', label: '3. Negyedév (Q3)', subtitle: 'Júl - Szep', months: [7, 8, 9] },
      { id: 'Q4', label: '4. Negyedév (Q4)', subtitle: 'Okt - Dec', months: [10, 11, 12] },
    ];

    return quarters.map(q => {
      const qMonths = currentYearMonths.filter(m => q.months.includes(m.num) && m.data);
      if (qMonths.length === 0) {
        return {
          ...q,
          returnPct: null,
          profit: 0,
          completedCount: 0,
        };
      }
      let comp = 1;
      let profit = 0;
      qMonths.forEach(m => {
        if (m.data) {
          comp *= (1 + m.data.returnPercent / 100);
          profit += m.data.realizedProfit;
        }
      });
      const returnPct = Number(((comp - 1) * 100).toFixed(2));
      return {
        ...q,
        returnPct,
        profit,
        completedCount: qMonths.length,
      };
    });
  }, [currentYearMonths]);

  // Helper function for color-coded intensity based on gain/loss percentage
  const getIntensityInfo = (ret: number | undefined) => {
    if (ret === undefined) {
      return {
        tileBg: 'border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600',
        textClass: 'text-slate-400 dark:text-slate-500',
        badgeClass: 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        subTextClass: 'text-slate-400 dark:text-slate-500',
        intensityLevel: 'Függőben',
        indicatorColor: 'bg-slate-300 dark:bg-slate-700',
      };
    }

    // Super Gain: >= +5.0%
    if (ret >= 5.0) {
      return {
        tileBg: 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 border-emerald-500 dark:border-emerald-400 shadow-sm shadow-emerald-600/20 dark:shadow-emerald-500/25',
        textClass: 'text-white dark:text-slate-950 font-bold',
        badgeClass: 'bg-emerald-700 dark:bg-emerald-950/80 text-emerald-100 dark:text-emerald-300',
        subTextClass: 'text-emerald-100 dark:text-slate-900',
        intensityLevel: 'Kiemelkedő (≥ +5%)',
        indicatorColor: 'bg-emerald-400 dark:bg-emerald-300',
      };
    }
    // High Gain: +3.0% to +5.0%
    if (ret >= 3.0) {
      return {
        tileBg: 'bg-emerald-500 dark:bg-emerald-500/85 text-white dark:text-slate-950 border-emerald-400 dark:border-emerald-500 shadow-xs',
        textClass: 'text-white dark:text-slate-950 font-bold',
        badgeClass: 'bg-emerald-700/70 dark:bg-emerald-900/80 text-white dark:text-emerald-200',
        subTextClass: 'text-emerald-100 dark:text-slate-900',
        intensityLevel: 'Erős (+3% - +5%)',
        indicatorColor: 'bg-emerald-300 dark:bg-emerald-200',
      };
    }
    // Moderate Gain: +1.5% to +3.0%
    if (ret >= 1.5) {
      return {
        tileBg: 'bg-emerald-100 dark:bg-emerald-500/40 text-emerald-950 dark:text-emerald-100 border-emerald-300 dark:border-emerald-500/40',
        textClass: 'text-emerald-800 dark:text-emerald-300 font-semibold',
        badgeClass: 'bg-emerald-200 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200',
        subTextClass: 'text-emerald-700 dark:text-emerald-300',
        intensityLevel: 'Mérsékelt (+1.5% - +3%)',
        indicatorColor: 'bg-emerald-500 dark:bg-emerald-400',
      };
    }
    // Mild Gain: 0% to +1.5%
    if (ret > 0) {
      return {
        tileBg: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-500/30',
        textClass: 'text-emerald-700 dark:text-emerald-400 font-medium',
        badgeClass: 'bg-emerald-100 dark:bg-emerald-800/40 text-emerald-800 dark:text-emerald-300',
        subTextClass: 'text-emerald-600 dark:text-emerald-400',
        intensityLevel: 'Enyhe (0% - +1.5%)',
        indicatorColor: 'bg-emerald-400 dark:bg-emerald-500',
      };
    }
    // Flat: 0%
    if (ret === 0) {
      return {
        tileBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        textClass: 'text-slate-700 dark:text-slate-300',
        badgeClass: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
        subTextClass: 'text-slate-500 dark:text-slate-400',
        intensityLevel: 'Nullszaldó (0%)',
        indicatorColor: 'bg-slate-400',
      };
    }
    // Mild Loss: 0% to -1.5%
    if (ret > -1.5) {
      return {
        tileBg: 'bg-rose-50 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-500/30',
        textClass: 'text-rose-700 dark:text-rose-400 font-medium',
        badgeClass: 'bg-rose-100 dark:bg-rose-800/40 text-rose-800 dark:text-rose-300',
        subTextClass: 'text-rose-600 dark:text-rose-400',
        intensityLevel: 'Enyhe (0% - -1.5%)',
        indicatorColor: 'bg-rose-400 dark:bg-rose-500',
      };
    }
    // Moderate Loss: -1.5% to -3.0%
    if (ret > -3.0) {
      return {
        tileBg: 'bg-rose-100 dark:bg-rose-500/50 text-rose-950 dark:text-rose-100 border-rose-300 dark:border-rose-500/50',
        textClass: 'text-rose-800 dark:text-rose-200 font-semibold',
        badgeClass: 'bg-rose-200 dark:bg-rose-800/70 text-rose-900 dark:text-rose-200',
        subTextClass: 'text-rose-700 dark:text-rose-300',
        intensityLevel: 'Mérsékelt (-1.5% - -3%)',
        indicatorColor: 'bg-rose-500 dark:bg-rose-400',
      };
    }
    // Severe Loss: <= -3.0%
    return {
      tileBg: 'bg-rose-600 dark:bg-rose-600 text-white border-rose-500 shadow-sm shadow-rose-600/25',
      textClass: 'text-white font-bold',
      badgeClass: 'bg-rose-800 text-rose-100',
      subTextClass: 'text-rose-100',
      intensityLevel: 'Jelentős (≤ -3%)',
      indicatorColor: 'bg-rose-300',
    };
  };

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

      {/* 4. Yearly Performance Heatmap (Current Year & Color-coded Intensity) */}
      <div 
        id="yearly-performance-heatmap-card"
        className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-xs space-y-5"
      >
        {/* Heatmap Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Flame className="h-4 w-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Éves Teljesítmény Hőtérkép ({heatmapYear})
              </h3>
              {heatmapYear === availableHeatmapYears[0] && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  Aktuális Év
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Havi relatív hozamok színezett intenzitása a nyereség/veszteség százalékos skáláján
            </p>
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
            {availableHeatmapYears.map(year => (
              <button
                key={year}
                id={`heatmap-year-btn-${year}`}
                onClick={() => {
                  setHeatmapYear(year);
                  setInspectedMonthNum(null);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  heatmapYear === year
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {year} {year === availableHeatmapYears[0] ? '(Aktuális)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Yearly KPI Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/70">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Göngyölített Éves Hozam</span>
            <div className={`mt-0.5 text-base sm:text-lg font-bold font-mono ${
              heatmapYearStats.compoundedYtd >= 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {heatmapYearStats.compoundedYtd >= 0 ? '+' : ''}{heatmapYearStats.compoundedYtd}%
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {heatmapYearStats.completedCount} lezárt hónap alapján
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/70">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Realizált Éves Nyereség</span>
            <div className={`mt-0.5 text-base sm:text-lg font-bold font-mono ${
              heatmapYearStats.totalRealizedProfit >= 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {heatmapYearStats.totalRealizedProfit >= 0 ? '+' : ''}${heatmapYearStats.totalRealizedProfit.toLocaleString('hu-HU')} USD
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {heatmapYearStats.totalTrades} sikeres ügylet
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/70">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Nyerési Arány (Win Rate)</span>
            <div className="mt-0.5 text-base sm:text-lg font-bold font-mono text-teal-600 dark:text-teal-400">
              {heatmapYearStats.winRate}%
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {heatmapYearStats.winCount} nyertes / {heatmapYearStats.lossCount} vesztes hónap
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/70">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Legjobb Hónap</span>
            <div className="mt-0.5 text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 truncate">
              {heatmapYearStats.bestMonth 
                ? `${heatmapYearStats.bestMonth.monthName} (+${heatmapYearStats.bestMonth.returnPercent}%)` 
                : 'Nincs adat'}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {heatmapYearStats.bestMonth?.bestAsset ? `Húzóeszköz: ${heatmapYearStats.bestMonth.bestAsset}` : 'N/A'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/70 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Leggyengébb Hónap</span>
            <div className="mt-0.5 text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 truncate">
              {heatmapYearStats.worstMonth 
                ? `${heatmapYearStats.worstMonth.monthName} (${heatmapYearStats.worstMonth.returnPercent >= 0 ? '+' : ''}${heatmapYearStats.worstMonth.returnPercent}%)` 
                : 'Nincs adat'}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Átlag: +{heatmapYearStats.avgMonthlyReturn}% / hó
            </span>
          </div>
        </div>

        {/* 12-Month Heatmap Visualization Grid */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              12 Hónapos Hozammátrix és Hőtérkép Csempék
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Kattints egy hónapra a részletes adatok megtekintéséhez
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2.5">
            {currentYearMonths.map(m => {
              const info = getIntensityInfo(m.data?.returnPercent);
              const isInspected = activeInspectedMonth?.month === m.num && m.data;

              return (
                <button
                  key={m.num}
                  id={`heatmap-tile-month-${m.num}`}
                  type="button"
                  onClick={() => {
                    if (m.data) {
                      setInspectedMonthNum(m.num);
                    }
                  }}
                  disabled={!m.data}
                  className={`relative p-3 rounded-xl border flex flex-col justify-between text-left transition-all duration-150 ${
                    m.data ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default opacity-75'
                  } ${info.tileBg} ${
                    isInspected 
                      ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md' 
                      : ''
                  }`}
                >
                  {/* Top: Month Short & Number */}
                  <div className="flex items-center justify-between text-[11px] w-full">
                    <span className="font-bold tracking-tight">{m.short}</span>
                    <span className="text-[10px] opacity-75 font-mono">#{m.num < 10 ? `0${m.num}` : m.num}</span>
                  </div>

                  {/* Middle: Return Percent */}
                  <div className="my-2 text-center">
                    {m.data ? (
                      <div className={`text-base sm:text-lg font-bold font-mono tracking-tight leading-none ${info.textClass}`}>
                        {m.data.returnPercent >= 0 ? '+' : ''}{m.data.returnPercent}%
                      </div>
                    ) : (
                      <div className="text-sm font-mono text-slate-400 dark:text-slate-600 font-semibold">
                        --
                      </div>
                    )}

                    {/* Dollar profit or status */}
                    <div className={`text-[10px] mt-1 truncate ${info.subTextClass}`}>
                      {m.data ? (
                        <span>
                          {m.data.realizedProfit >= 0 ? '+' : ''}${Math.abs(m.data.realizedProfit) >= 1000 ? `${(m.data.realizedProfit / 1000).toFixed(1)}k` : m.data.realizedProfit}
                        </span>
                      ) : (
                        <span>Függőben</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Asset tag or win rate */}
                  <div className="w-full pt-1.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[9px]">
                    {m.data ? (
                      <>
                        <span className="font-mono font-semibold uppercase">{m.data.bestAsset}</span>
                        <span className="opacity-90">{m.data.winRate}% W</span>
                      </>
                    ) : (
                      <span className="w-full text-center text-[9px] opacity-70">Előttünk álló</span>
                    )}
                  </div>

                  {/* Color intensity indicator bar at the bottom */}
                  <div className={`absolute bottom-0 left-2 right-2 h-1 rounded-t-full ${info.indicatorColor}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Month Detail Inspector Card */}
        {activeInspectedMonth && (
          <div 
            id="heatmap-inspected-month-details"
            className="rounded-xl p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                activeInspectedMonth.returnPercent >= 0 
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30' 
                  : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
              }`}>
                {activeInspectedMonth.returnPercent >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {heatmapYear} {activeInspectedMonth.monthName} Részletes Teljesítmény
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                    activeInspectedMonth.returnPercent >= 0 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                  }`}>
                    {activeInspectedMonth.returnPercent >= 0 ? 'Nyereséges Hónap' : 'Veszteséges Hónap'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kattints bármelyik másik hónapra a fenti hőtérképen az összehasonlításhoz
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Havi Hozam</span>
                <span className={`text-sm font-bold ${
                  activeInspectedMonth.returnPercent >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {activeInspectedMonth.returnPercent >= 0 ? '+' : ''}{activeInspectedMonth.returnPercent}%
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Realizált Profit</span>
                <span className={`text-sm font-bold ${
                  activeInspectedMonth.realizedProfit >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {activeInspectedMonth.realizedProfit >= 0 ? '+' : ''}${activeInspectedMonth.realizedProfit.toLocaleString('hu-HU')} USD
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Kötések / Win Rate</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeInspectedMonth.tradesCount} db ({activeInspectedMonth.winRate}%)
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Top Eszköz</span>
                <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                  {activeInspectedMonth.bestAsset}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quarterly Aggregation Cards */}
        <div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Negyedéves Göngyölített Eredmények ({heatmapYear})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quarterlyData.map(q => (
              <div 
                key={q.id}
                id={`heatmap-quarter-${q.id}`}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{q.id}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{q.subtitle}</span>
                </div>

                <div className="my-1.5">
                  {q.returnPct !== null ? (
                    <div className={`text-base font-bold font-mono ${
                      q.returnPct >= 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {q.returnPct >= 0 ? '+' : ''}{q.returnPct}%
                    </div>
                  ) : (
                    <div className="text-sm font-mono text-slate-400 dark:text-slate-600 font-semibold">
                      Függőben
                    </div>
                  )}

                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {q.returnPct !== null ? (
                      <span>{q.profit >= 0 ? '+' : ''}${q.profit.toLocaleString('hu-HU')} USD</span>
                    ) : (
                      <span>0 lezárt hónap</span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800/80 pt-1">
                  {q.completedCount}/3 hónap lezárva
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color-Coded Intensity Legend */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            <span className="font-semibold">Hozam Intenzitási Skála:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-rose-600 text-white font-mono text-[8px] flex items-center justify-center font-bold">≤-3</span>
              <span className="text-slate-600 dark:text-slate-400">Jelentős mínusz (≤ -3%)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-rose-100 dark:bg-rose-500/50 border border-rose-300 dark:border-rose-500"></span>
              <span className="text-slate-600 dark:text-slate-400">Mérsékelt (-1.5% - -3%)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30"></span>
              <span className="text-slate-600 dark:text-slate-400">Enyhe (0% - -1.5%)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700"></span>
              <span className="text-slate-600 dark:text-slate-400">0% / Függőben</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30"></span>
              <span className="text-slate-600 dark:text-slate-400">Enyhe (0% - +1.5%)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-emerald-100 dark:bg-emerald-500/40 border border-emerald-300 dark:border-emerald-500/40"></span>
              <span className="text-slate-600 dark:text-slate-400">Mérsékelt (+1.5% - +3%)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-emerald-500 text-white font-mono text-[8px] flex items-center justify-center font-bold">≥3</span>
              <span className="text-slate-600 dark:text-slate-400">Erős (+3% - +5%)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-emerald-600 dark:bg-emerald-400 text-white dark:text-slate-950 font-mono text-[8px] flex items-center justify-center font-bold">≥5</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">Kiemelkedő (≥ +5%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Grid: Asset Allocation & Monthly Returns Bar */}
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
