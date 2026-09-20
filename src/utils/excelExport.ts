import * as XLSX from 'xlsx';
import { Position, MonthlyReturn, RiskMetrics } from '../types';

export interface PortfolioSummaryExport {
  totalEquity: number;
  cashBalance: number;
  investedCapital: number;
  unrealizedProfit: number;
  unrealizedProfitPct: number;
  dailyChange: number;
  dailyChangePct: number;
}

export function exportPortfolioToExcel(
  positions: Position[],
  monthlyReturns: MonthlyReturn[],
  riskMetrics: RiskMetrics,
  summary: PortfolioSummaryExport,
  filenamePrefix: string = 'eToro_Portfolio'
) {
  const wb = XLSX.utils.book_new();
  const currentDate = new Date().toISOString().split('T')[0];

  // 1. Sheet: Összegzés & Főbb mutatók
  const summaryData = [
    ['eToro Portfólió Elemzés és Hozamkimutatás'],
    ['Generálás dátuma:', currentDate],
    [''],
    ['Mutató megnevezése', 'Érték (USD / %)', 'Megjegyzés'],
    ['Teljes Portfólió Érték (Total Equity)', `$${summary.totalEquity.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Teljes tőke (befektetett + szabad)'],
    ['Szabad Készpénz (Cash Balance)', `$${summary.cashBalance.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Rendelkezésre álló egyenleg'],
    ['Befektetett Tőke (Invested Capital)', `$${summary.investedCapital.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Nyitott pozíciókban lekötött tőke'],
    ['Nem realizált Profit / Veszteség (P&L)', `$${summary.unrealizedProfit >= 0 ? '+' : ''}${summary.unrealizedProfit.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, `${summary.unrealizedProfitPct >= 0 ? '+' : ''}${summary.unrealizedProfitPct.toFixed(2)}% hozam`],
    ['Napi változás (24h)', `$${summary.dailyChange >= 0 ? '+' : ''}${summary.dailyChange.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, `${summary.dailyChangePct >= 0 ? '+' : ''}${summary.dailyChangePct.toFixed(2)}%`],
    [''],
    ['Kockázati Mutatók'],
    ['eToro Kockázati Pontszám (Risk Score)', `${riskMetrics.etoroRiskScore} / 10`, riskMetrics.riskCategory],
    ['Sharpe-ráta (Éves)', riskMetrics.sharpeRatio.toFixed(2), 'Kockázattal korrigált hozam (>1.5 kiváló)'],
    ['Sortino-ráta', riskMetrics.sortinoRatio.toFixed(2), 'Lefelé irányuló kockázat korrekció'],
    ['Maximális Visszaesés (Max Drawdown)', `${riskMetrics.maxDrawdown.toFixed(2)}%`, 'Történelmi csúcstól mért mélypont'],
    ['Béta (vs S&P 500)', riskMetrics.betaSP500.toFixed(2), '<1 alacsonyabb szisztémás kockázat'],
    ['Évesített Volatilitás', `${riskMetrics.annualizedVolatility.toFixed(2)}%`, '30 napos gördülő szórás'],
    ['Value at Risk (95% 1-Day VaR)', `${riskMetrics.valueAtRisk95.toFixed(2)}%`, 'Max várható napi veszteség 95% megbízhatósággal'],
    ['Diverzifikációs Pontszám', `${riskMetrics.diversificationScore} / 100`, 'Eszközosztály és egyedi súlyozás alapján'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Összegzés');

  // 2. Sheet: Nyitott Pozíciók
  const positionsHeaders = [
    'Ticker',
    'Eszköz Neve',
    'Eszközosztály',
    'Mennyiség (Egység)',
    'Nyitási Ár (USD)',
    'Jelenlegi Ár (USD)',
    'Pozíció Érték (USD)',
    'Profit / Veszteség (USD)',
    'Hozam (%)',
    '24h Változás (%)',
    'Tőkeáttétel',
    'Stop Loss (USD)',
    'Take Profit (USD)',
    'Nyitás Dátuma',
    'Másolási Kereskedés (CopyTrader)'
  ];

  const positionsRows = positions.map(pos => {
    const marketValue = pos.units * pos.currentPrice;
    const pnlUsd = (pos.currentPrice - pos.openPrice) * pos.units * pos.leverage;
    const pnlPct = ((pos.currentPrice - pos.openPrice) / pos.openPrice) * 100 * pos.leverage;
    
    return [
      pos.symbol,
      pos.name,
      pos.assetClass.toUpperCase(),
      pos.units,
      pos.openPrice,
      pos.currentPrice,
      Number(marketValue.toFixed(2)),
      Number(pnlUsd.toFixed(2)),
      Number(pnlPct.toFixed(2)),
      Number(pos.priceChange24h.toFixed(2)),
      `x${pos.leverage}`,
      pos.stopLoss ?? 'Nincs',
      pos.takeProfit ?? 'Nincs',
      pos.openDate,
      pos.isCopyTrade ? `Igen (${pos.copiedTraderName || ''})` : 'Nem'
    ];
  });

  const wsPositions = XLSX.utils.aoa_to_sheet([positionsHeaders, ...positionsRows]);
  XLSX.utils.book_append_sheet(wb, wsPositions, 'Nyitott Pozíciók');

  // 3. Sheet: Havi Teljesítmény Kimutatások
  const monthlyHeaders = [
    'Év',
    'Hónap',
    'Hónap Neve',
    'Havi Hozam (%)',
    'Realizált Nyereség (USD)',
    'Kereskedések Száma',
    'Nyerési Arány (Win Rate %)',
    'Legjobb Eszköz',
    'Befizetés (USD)',
    'Kifizetés (USD)'
  ];

  const monthlyRows = monthlyReturns.map(mr => [
    mr.year,
    mr.month,
    mr.monthName,
    mr.returnPercent,
    mr.realizedProfit,
    mr.tradesCount,
    mr.winRate,
    mr.bestAsset,
    mr.deposits,
    mr.withdrawals
  ]);

  const wsMonthly = XLSX.utils.aoa_to_sheet([monthlyHeaders, ...monthlyRows]);
  XLSX.utils.book_append_sheet(wb, wsMonthly, 'Havi Teljesítmény');

  // Generate file download
  XLSX.writeFile(wb, `${filenamePrefix}_${currentDate}.xlsx`);
}
