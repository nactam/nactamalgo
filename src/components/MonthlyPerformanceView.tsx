import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { MonthlyReturn } from '../types';
import { 
  CalendarRange, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';

export const MonthlyPerformanceView: React.FC = () => {
  const { monthlyReturns, exportToExcel } = usePortfolio();

  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // Available years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(monthlyReturns.map(m => m.year))).sort((a, b) => b - a);
    return years;
  }, [monthlyReturns]);

  // Matrix calculation: year -> month (1-12) -> MonthlyReturn
  const matrixData = useMemo(() => {
    const result: {
      year: number;
      months: (MonthlyReturn | undefined)[];
      ytdReturn: number;
      totalProfit: number;
    }[] = [];

    availableYears.forEach(year => {
      const yearRecords = monthlyReturns.filter(m => m.year === year);
      const monthsArray: (MonthlyReturn | undefined)[] = [];

      for (let m = 1; m <= 12; m++) {
        monthsArray.push(yearRecords.find(r => r.month === m));
      }

      // Calculate compounded YTD return: (1+r1)*(1+r2)... - 1
      let compounded = 1;
      let totalPnl = 0;
      yearRecords.forEach(r => {
        compounded *= (1 + r.returnPercent / 100);
        totalPnl += r.realizedProfit;
      });
      const ytd = (compounded - 1) * 100;

      result.push({
        year,
        months: monthsArray,
        ytdReturn: Number(ytd.toFixed(2)),
        totalProfit: totalPnl,
      });
    });

    return result;
  }, [availableYears, monthlyReturns]);

  // Best and worst month calculations
  const stats = useMemo(() => {
    if (monthlyReturns.length === 0) return { best: null, worst: null, winRate: 0, avgMonthly: 0 };

    let best = monthlyReturns[0];
    let worst = monthlyReturns[0];
    let winCount = 0;
    let sum = 0;

    monthlyReturns.forEach(m => {
      if (m.returnPercent > best.returnPercent) best = m;
      if (m.returnPercent < worst.returnPercent) worst = m;
      if (m.returnPercent > 0) winCount++;
      sum += m.returnPercent;
    });

    return {
      best,
      worst,
      winRate: (winCount / monthlyReturns.length) * 100,
      avgMonthly: sum / monthlyReturns.length,
    };
  }, [monthlyReturns]);

  // Filtered detailed records
  const filteredList = useMemo(() => {
    if (selectedYear === 'all') return monthlyReturns;
    return monthlyReturns.filter(m => m.year === selectedYear);
  }, [monthlyReturns, selectedYear]);

  // Function to determine cell color based on return percentage
  const getCellColorClass = (pct: number | undefined) => {
    if (pct === undefined) return 'bg-slate-100 dark:bg-slate-900/20 text-slate-400 dark:text-slate-600';
    if (pct >= 5) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-500/40';
    if (pct > 0) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-500/20';
    if (pct === 0) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    if (pct > -2) return 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-500/20';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-500/30 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-500/40';
  };

  const monthShortNames = ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            Havi Teljesítmény Kimutatások
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            eToro stílusú hozammátrix, éves göngyölített eredmények és havi részletezés
          </p>
        </div>

        <button
          onClick={exportToExcel}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <span>Havi adatok exportálása Excelbe</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Best Month */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Legjobb Hónap</span>
            <Award className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            +{stats.best?.returnPercent}%
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {stats.best?.year} {stats.best?.monthName} (${stats.best?.realizedProfit.toLocaleString('hu-HU')} USD)
          </div>
        </div>

        {/* Worst Month */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Leggyengébb Hónap</span>
            <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {stats.worst?.returnPercent}%
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {stats.worst?.year} {stats.worst?.monthName} (${stats.worst?.realizedProfit.toLocaleString('hu-HU')} USD)
          </div>
        </div>

        {/* Win Rate */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Pozitív Hónapok Aránya</span>
            <CheckCircle2 className="h-4 w-4 text-teal-500 dark:text-teal-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {monthlyReturns.filter(m => m.returnPercent > 0).length} nyereséges / {monthlyReturns.length} hónap
          </div>
        </div>

        {/* Avg Monthly Return */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Átlagos Havi Hozam</span>
            <TrendingUp className="h-4 w-4 text-sky-500 dark:text-sky-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            +{stats.avgMonthly.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Történeti havi átlag
          </div>
        </div>

      </div>

      {/* 3. Monthly Return Heatmap Matrix */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Havi Hozammátrix (Hőtérkép)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Minden egyes naptári hónap százalékos nettó hozama az eToro számládon
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500/40 border border-emerald-500"></span> Magas nyereség (&gt;5%)</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500/20 border border-emerald-500/30"></span> Nyereség</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-rose-500/20 border border-rose-500/30"></span> Visszaesés</span>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-center border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                <th className="py-2.5 px-3 text-left">Év</th>
                {monthShortNames.map((m, idx) => (
                  <th key={idx} className="py-2.5 px-2">{m}</th>
                ))}
                <th className="py-2.5 px-3 text-right bg-slate-50 dark:bg-slate-950/40">YTD (Éves)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-xs">
              {matrixData.map(row => (
                <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-3 text-left font-bold text-slate-900 dark:text-white">
                    {row.year}
                  </td>
                  {row.months.map((m, idx) => (
                    <td key={idx} className="py-2.5 px-1.5">
                      {m ? (
                        <div className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold transition-transform hover:scale-105 ${getCellColorClass(m.returnPercent)}`}>
                          {m.returnPercent >= 0 ? '+' : ''}{m.returnPercent}%
                        </div>
                      ) : (
                        <div className="py-1.5 px-1 text-slate-400 dark:text-slate-600 text-[11px] font-sans">
                          —
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="py-3 px-3 text-right bg-slate-50 dark:bg-slate-950/40">
                    <span className={`font-bold px-2 py-1 rounded text-xs ${
                      row.ytdReturn >= 0 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' 
                        : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30'
                    }`}>
                      {row.ytdReturn >= 0 ? '+' : ''}{row.ytdReturn}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Detailed Monthly Records Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Részletes Havi Kimutatások
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kereskedések száma, realizált profit, nyerési arány és legsikeresebb eszközök
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Minden év ({availableYears.join(', ')})</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}. év</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                <th className="py-3 px-3">Időszak</th>
                <th className="py-3 px-3">Havi Hozam</th>
                <th className="py-3 px-3">Realizált Nyereség</th>
                <th className="py-3 px-3">Kötések Száma</th>
                <th className="py-3 px-3">Nyerési Arány</th>
                <th className="py-3 px-3">Legjobb Eszköz</th>
                <th className="py-3 px-3 text-right">Pénzmozgás</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs font-mono">
              {filteredList.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-sans font-medium text-slate-900 dark:text-white">
                    {m.year} {m.monthName}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center font-bold ${m.returnPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {m.returnPercent >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
                      {m.returnPercent >= 0 ? '+' : ''}{m.returnPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-semibold ${m.realizedProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {m.realizedProfit >= 0 ? '+' : ''}${m.realizedProfit.toLocaleString('hu-HU')} USD
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {m.tradesCount} ügylet
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-teal-500 dark:bg-teal-400 rounded-full" 
                          style={{ width: `${m.winRate}%` }} 
                        />
                      </div>
                      <span>{m.winRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-sans font-semibold text-emerald-700 dark:text-emerald-300">
                    {m.bestAsset}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                    {m.deposits > 0 && <span className="text-emerald-600 dark:text-emerald-400 mr-2">+{m.deposits}$ befiz.</span>}
                    {m.withdrawals > 0 && <span className="text-slate-500 dark:text-slate-400">-{m.withdrawals}$ kivét</span>}
                    {m.deposits === 0 && m.withdrawals === 0 && '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
