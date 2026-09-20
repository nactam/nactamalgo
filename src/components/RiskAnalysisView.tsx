import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  Gauge, 
  Percent, 
  Activity, 
  Zap, 
  CheckCircle2, 
  Info,
  Scale
} from 'lucide-react';

export const RiskAnalysisView: React.FC = () => {
  const { riskMetrics, summary, setActiveTab } = usePortfolio();

  const getRiskColor = (score: number) => {
    if (score <= 2) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score <= 4) return 'text-teal-400 border-teal-500/40 bg-teal-500/10';
    if (score <= 6) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const riskScaleLabels = [
    { score: 1, label: 'Konzervatív' },
    { score: 2, label: 'Nagyon alacsony' },
    { score: 3, label: 'Alacsony' },
    { score: 4, label: 'Mérsékelt' },
    { score: 5, label: 'Közepes' },
    { score: 6, label: 'Közép-magas' },
    { score: 7, label: 'Magas' },
    { score: 8, label: 'Jelentős' },
    { score: 9, label: 'Nagyon magas' },
    { score: 10, label: 'Extrém spekulatív' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            Kockázati Mutatók & Elemzés
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            eToro Risk Score (1-10), Sharpe-ráta, Maximális visszaesés (Drawdown) és VaR kalkuláció
          </p>
        </div>

        <button
          onClick={() => setActiveTab('alerts')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/30 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Kockázati riasztás beállítása &rarr;</span>
        </button>
      </div>

      {/* 2. Main eToro Risk Score Gauge Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hivatalos eToro Kockázati Skála
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                {riskMetrics.etoroRiskScore}
              </span>
              <span className="text-base font-semibold text-teal-600 dark:text-teal-400">
                / 10 — {riskMetrics.riskCategory} Kockázat
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Az eToro saját algoritmusa a volatilitást, a tőkeáttételt és a portfólió koncentrációt veszi alapul. 
              A 4-es pontszám kiváló egyensúlyt mutat a növekedés és a tőkevédelem között.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <ShieldCheck className="h-6 w-6 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Popular Investor Kompatibilis</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Megfelel a másolható kereskedői követelményeknek (Score ≤ 6)</div>
            </div>
          </div>
        </div>

        {/* Visual 1-10 Step Indicator */}
        <div className="mt-6">
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
            {riskScaleLabels.map(item => {
              const isCurrent = item.score === riskMetrics.etoroRiskScore;
              const isPast = item.score < riskMetrics.etoroRiskScore;
              
              let barColor = 'bg-slate-200 dark:bg-slate-800';
              if (item.score <= 2) barColor = isCurrent || isPast ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800';
              else if (item.score <= 4) barColor = isCurrent || isPast ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-800';
              else if (item.score <= 6) barColor = isCurrent || isPast ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-800';
              else barColor = isCurrent || isPast ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-800';

              return (
                <div key={item.score} className="flex flex-col items-center gap-1.5">
                  <div 
                    className={`w-full h-3 sm:h-3.5 rounded-sm transition-all ${barColor} ${
                      isCurrent ? 'ring-2 ring-emerald-500 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-y-110 shadow-lg' : ''
                    }`} 
                  />
                  <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 dark:text-slate-500'}`}>
                    {item.score}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-500 mt-2 px-1">
            <span>1 — Minimális volatilitás</span>
            <span>5 — Kiegyensúlyozott</span>
            <span>10 — Maximális kockázat</span>
          </div>
        </div>
      </div>

      {/* 3. Deep Risk Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Sharpe Ratio */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Sharpe-ráta (Évesített)</span>
            <Activity className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {riskMetrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Kiváló kockázatarányos hozam (&gt;1.5)
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Minden 1 egység vállalt volatilitásra {riskMetrics.sharpeRatio.toFixed(2)} egység kockázatmentes kamat feletti többlethozam jut.
          </p>
        </div>

        {/* Sortino Ratio */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Sortino-ráta</span>
            <Scale className="h-4 w-4 text-teal-500 dark:text-teal-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
            {riskMetrics.sortinoRatio.toFixed(2)}
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Alacsony lefelé mutató veszteségkockázat
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            A Sharpe-rátával szemben csak a káros (negatív) ingadozásokat bünteti, így a felfelé ívelő rallykat nem számolja kockázatnak.
          </p>
        </div>

        {/* Max Drawdown */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Max Visszaesés (Max Drawdown)</span>
            <TrendingDown className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {riskMetrics.maxDrawdown.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Jelenlegi csúcstól mért eltérés: {riskMetrics.currentDrawdown.toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            A portfólió legmélyebb történelmi korrekciója mindössze 8.45% volt, ami lényegesen jobb az S&P 500 átlagos visszaeséseinél.
          </p>
        </div>

        {/* Beta vs S&P 500 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Béta (vs S&P 500)</span>
            <Activity className="h-4 w-4 text-sky-500 dark:text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {riskMetrics.betaSP500.toFixed(2)}
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Enyhén defenzívebb piaci kitettség (&lt; 1.0)
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            A portfólió mozgása korrelál az amerikai részvénypiaccal, de a diverzifikált nyersanyagok és devizák miatt mérsékeltebb kilengésekkel bír.
          </p>
        </div>

        {/* Annualized Volatility */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Évesített Volatilitás (30d)</span>
            <Percent className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {riskMetrics.annualizedVolatility.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Közepes árfolyam-ingadozási szint
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            A kripto kitettség (BTC, ETH) növeli, míg az arany és az ETF csökkenti a szórás mértékét.
          </p>
        </div>

        {/* Value at Risk (VaR 95%) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Value at Risk (95% 1-Day VaR)</span>
            <AlertTriangle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {riskMetrics.valueAtRisk95.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Várható max. napi kockázat: ~${((summary.totalEquity * riskMetrics.valueAtRisk95) / 100).toFixed(0)} USD
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            95%-os statisztikai valószínűséggel egyetlen kereskedési napon a portfólió nem veszít többet a megadott értéknél.
          </p>
        </div>

      </div>

      {/* 4. Risk Mitigation Suggestions */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-4 sm:p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          Portfólió Kockázatkezelési Javaslatok
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 flex items-start gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Diverzifikáció Fenntartása:</span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                A diverzifikációs pontszám 82/100. A részvények (NVDA, AAPL) és kriptoeszközök aránya stabil, de egyetlen eszköz se lépje át a teljes portfólió 25%-át.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 flex items-start gap-2.5">
            <span className="h-2 w-2 rounded-full bg-teal-500 mt-1 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Tőkeáttétel Kontroll:</span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                A jelenlegi deviza (EUR/USD x5) és arany (x2) pozíciók ellenőrzése rendszeres Stop Loss szintekkel biztosítja, hogy a kockázati pontszám 4-es szinten maradjon.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
