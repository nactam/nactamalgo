import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { AssetClass, Position } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  ShieldCheck, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Users
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    positions, 
    summary, 
    riskMetrics, 
    closePosition, 
    addPosition, 
    updatePosition,
    lastTickTime 
  } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  // New position form state
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newAssetClass, setNewAssetClass] = useState<AssetClass>('stocks');
  const [newUnits, setNewUnits] = useState('10');
  const [newPrice, setNewPrice] = useState('100');
  const [newLeverage, setNewLeverage] = useState('1');
  const [newStopLoss, setNewStopLoss] = useState('');
  const [newTakeProfit, setNewTakeProfit] = useState('');

  // Filter positions
  const filteredPositions = positions.filter(pos => {
    const matchesSearch = pos.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pos.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedAssetClass === 'all' || pos.assetClass === selectedAssetClass;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol || !newUnits || !newPrice) return;

    addPosition({
      symbol: newSymbol.toUpperCase(),
      name: newName || newSymbol.toUpperCase(),
      assetClass: newAssetClass,
      units: parseFloat(newUnits),
      openPrice: parseFloat(newPrice),
      currentPrice: parseFloat(newPrice),
      openDate: new Date().toISOString().split('T')[0],
      leverage: parseInt(newLeverage) || 1,
      stopLoss: newStopLoss ? parseFloat(newStopLoss) : undefined,
      takeProfit: newTakeProfit ? parseFloat(newTakeProfit) : undefined,
    });

    setIsAddModalOpen(false);
    // Reset form
    setNewSymbol('');
    setNewName('');
    setNewUnits('10');
    setNewPrice('100');
    setNewStopLoss('');
    setNewTakeProfit('');
  };

  const handleUpdateSLTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPosition) return;
    updatePosition(editingPosition.id, {
      stopLoss: editingPosition.stopLoss,
      takeProfit: editingPosition.takeProfit,
    });
    setEditingPosition(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Portfólió Áttekintés & Pozíciók
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Valós idejű árfolyamok és pozícióértékek az eToro fiókodból
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Új Pozíció Felvétele</span>
        </button>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Equity */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 p-4 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Teljes Portfólió Érték</span>
            <Wallet className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            ${summary.totalEquity.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={`inline-flex items-center font-semibold font-mono ${summary.dailyChangePct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {summary.dailyChangePct >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {summary.dailyChangePct >= 0 ? '+' : ''}{summary.dailyChangePct.toFixed(2)}%
            </span>
            <span className="text-slate-400 text-[11px]">ma ({summary.dailyChange >= 0 ? '+' : ''}${summary.dailyChange.toFixed(0)})</span>
          </div>
        </div>

        {/* Unrealized Profit */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 p-4 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Nyitott Profit / Veszteség</span>
            <TrendingUp className="h-4 w-4 text-teal-500 dark:text-teal-400" />
          </div>
          <div className={`mt-2 text-xl sm:text-2xl font-bold font-mono tracking-tight ${summary.unrealizedProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {summary.unrealizedProfit >= 0 ? '+' : ''}${summary.unrealizedProfit.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Hozam:{' '}
            <span className={`font-semibold font-mono ${summary.unrealizedProfitPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {summary.unrealizedProfitPct >= 0 ? '+' : ''}{summary.unrealizedProfitPct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Cash & Invested */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 p-4 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Szabad Készpénz / Lekötött</span>
            <DollarSign className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            ${summary.cashBalance.toLocaleString('hu-HU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Befektetett:{' '}
            <span className="font-mono text-slate-700 dark:text-slate-200 font-medium">
              ${summary.investedCapital.toLocaleString('hu-HU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* eToro Risk Score */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 p-4 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>eToro Kockázati Pontszám</span>
            <ShieldCheck className="h-4 w-4 text-sky-500 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {riskMetrics.etoroRiskScore}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ 10 ({riskMetrics.riskCategory})</span>
          </div>
          <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" 
              style={{ width: `${(riskMetrics.etoroRiskScore / 10) * 100}%` }}
            />
          </div>
        </div>

      </div>

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/70 shadow-xs">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Összes Eszköz' },
            { id: 'stocks', label: 'Részvények' },
            { id: 'crypto', label: 'Kriptovaluták' },
            { id: 'etf', label: 'ETF-ek' },
            { id: 'commodities', label: 'Nyersanyagok' },
            { id: 'forex', label: 'Devizák' },
          ].map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedAssetClass(category.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedAssetClass === category.id
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Keresés Ticker vagy Név..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

      </div>

      {/* 4. Positions Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Eszköz</th>
                <th className="py-3 px-3">Egység & Nyitóár</th>
                <th className="py-3 px-3">Jelenlegi Ár</th>
                <th className="py-3 px-3">24h Vált.</th>
                <th className="py-3 px-3">Pozíció Érték</th>
                <th className="py-3 px-3">Profit / Veszteség</th>
                <th className="py-3 px-3">SL / TP</th>
                <th className="py-3 px-3 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredPositions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Nem található a feltételeknek megfelelő pozíció.
                  </td>
                </tr>
              ) : (
                filteredPositions.map(pos => {
                  const marketValue = pos.units * pos.currentPrice;
                  const pnl = (pos.currentPrice - pos.openPrice) * pos.units * pos.leverage;
                  const pnlPct = ((pos.currentPrice - pos.openPrice) / pos.openPrice) * 100 * pos.leverage;
                  
                  // Flash indicator for recent tick
                  const isUp = pos.previousPrice && pos.currentPrice > pos.previousPrice;
                  const isDown = pos.previousPrice && pos.currentPrice < pos.previousPrice;

                  return (
                    <tr 
                      key={pos.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Asset & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                            pos.assetClass === 'crypto' 
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                              : pos.assetClass === 'stocks'
                              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                              : pos.assetClass === 'etf'
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                              : pos.assetClass === 'commodities'
                              ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {pos.symbol.substring(0, 3)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white tracking-tight">{pos.symbol}</span>
                              {pos.leverage > 1 && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold">
                                  x{pos.leverage}
                                </span>
                              )}
                              {pos.isCopyTrade && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                                  <Users className="h-2.5 w-2.5" />
                                  Copy
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block max-w-[140px] sm:max-w-[200px]">
                              {pos.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Units & Open Price */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono text-slate-800 dark:text-slate-200">{pos.units} egység</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          @${pos.openPrice.toLocaleString('hu-HU', { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Current Live Price */}
                      <td className="py-3.5 px-3">
                        <span className={`font-mono font-semibold transition-colors px-1.5 py-0.5 rounded ${
                          isUp 
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : isDown 
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' 
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          ${pos.currentPrice.toLocaleString('hu-HU', { minimumFractionDigits: pos.assetClass === 'forex' ? 4 : 2 })}
                        </span>
                      </td>

                      {/* 24h Change */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center font-mono font-medium ${
                          pos.priceChange24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {pos.priceChange24h >= 0 ? '+' : ''}{pos.priceChange24h.toFixed(2)}%
                        </span>
                      </td>

                      {/* Market Value */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-semibold text-slate-900 dark:text-white">
                          ${marketValue.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Profit / Loss */}
                      <td className="py-3.5 px-3">
                        <div className={`font-mono font-bold ${pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {pnl >= 0 ? '+' : ''}${pnl.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-[11px] font-mono ${pnlPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                        </div>
                      </td>

                      {/* Stop Loss & Take Profit */}
                      <td className="py-3.5 px-3 font-mono text-[11px]">
                        <div className="text-slate-500 dark:text-slate-400">
                          SL: <span className="text-rose-600 dark:text-rose-400">{pos.stopLoss ? `$${pos.stopLoss}` : '-'}</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          TP: <span className="text-emerald-600 dark:text-emerald-400">{pos.takeProfit ? `$${pos.takeProfit}` : '-'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingPosition(pos)}
                            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Stop Loss / Take Profit módosítása"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Biztosan lezárod a(z) ${pos.symbol} pozíciót?`)) {
                                closePosition(pos.id);
                              }
                            }}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Pozíció azonnali lezárása"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add New Position Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Új Pozíció Felvétele</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePosition} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Ticker (Szimbólum)</label>
                  <input
                    type="text"
                    required
                    placeholder="pl. NVDA, BTC, GOOG"
                    value={newSymbol}
                    onChange={e => setNewSymbol(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Eszközosztály</label>
                  <select
                    value={newAssetClass}
                    onChange={e => setNewAssetClass(e.target.value as AssetClass)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="stocks">Részvény (Stocks)</option>
                    <option value="crypto">Kriptovaluta</option>
                    <option value="etf">ETF</option>
                    <option value="commodities">Nyersanyag (Commodity)</option>
                    <option value="forex">Deviza (Forex)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Eszköz Neve (Opcionális)</label>
                <input
                  type="text"
                  placeholder="pl. Alphabet Inc."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Mennyiség</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newUnits}
                    onChange={e => setNewUnits(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nyitóár ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Tőkeáttétel</label>
                  <select
                    value={newLeverage}
                    onChange={e => setNewLeverage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1">x1 (Tőkeáttétel nélkül)</option>
                    <option value="2">x2</option>
                    <option value="5">x5</option>
                    <option value="10">x10</option>
                    <option value="20">x20</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Stop Loss ($) (Opcionális)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Árfolyam küszöb"
                    value={newStopLoss}
                    onChange={e => setNewStopLoss(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Take Profit ($) (Opcionális)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Célárfolyam"
                    value={newTakeProfit}
                    onChange={e => setNewTakeProfit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm cursor-pointer"
                >
                  Pozíció Mentése
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit SL/TP Modal */}
      {editingPosition && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                SL / TP Módosítása: {editingPosition.symbol}
              </h3>
              <button 
                onClick={() => setEditingPosition(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSLTP} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Stop Loss szint ($)</label>
                <input
                  type="number"
                  step="any"
                  value={editingPosition.stopLoss || ''}
                  onChange={e => setEditingPosition({ ...editingPosition, stopLoss: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="Nincs beállítva"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Take Profit szint ($)</label>
                <input
                  type="number"
                  step="any"
                  value={editingPosition.takeProfit || ''}
                  onChange={e => setEditingPosition({ ...editingPosition, takeProfit: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="Nincs beállítva"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPosition(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm cursor-pointer"
                >
                  Mentés
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
