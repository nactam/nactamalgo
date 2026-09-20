import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { AlertType, AlertTrigger } from '../types';
import { 
  BellRing, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { 
    alerts, 
    addAlert, 
    toggleAlert, 
    deleteAlert, 
    positions, 
    notifications, 
    markAllNotificationsRead 
  } = usePortfolio();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New alert form
  const [alertType, setAlertType] = useState<AlertType>('price_above');
  const [symbol, setSymbol] = useState('NVDA');
  const [threshold, setThreshold] = useState('135');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const isPriceBased = alertType === 'price_above' || alertType === 'price_below' || alertType === 'price_change_pct';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!threshold) return;

    let autoTitle = title;
    if (!autoTitle) {
      if (alertType === 'price_above') autoTitle = `${symbol} Árfolyam célár: $${threshold}`;
      else if (alertType === 'price_below') autoTitle = `${symbol} Támasz riasztás: $${threshold}`;
      else if (alertType === 'price_change_pct') autoTitle = `${symbol} 24h elmozdulás: ±${threshold}%`;
      else if (alertType === 'risk_score_above') autoTitle = `eToro Kockázati Pontszám küszöb: ${threshold}`;
      else if (alertType === 'drawdown_above') autoTitle = `Maximális visszaesés riasztás: ${threshold}%`;
    }

    addAlert({
      type: alertType,
      symbol: isPriceBased ? symbol : undefined,
      threshold: parseFloat(threshold),
      title: autoTitle,
      note: note || undefined,
      isActive: true,
      priority,
    });

    setIsCreateOpen(false);
    setTitle('');
    setNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            Ár- és Kockázati Értesítések
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Valós idejű trigger szabályok ármozgásokra, kitettségre és eToro kockázati mutatókra
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Új Értesítési Szabály</span>
        </button>
      </div>

      {/* 2. Active Alert Rules */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Aktív Riasztási Szabályok ({alerts.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A rendszer folyamatosan figyeli a valós idejű árfolyamokat és a portfólió kockázatát
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`rounded-xl border p-4 transition-all ${
                alert.isActive 
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80' 
                  : 'border-slate-200/60 dark:border-slate-800/40 bg-slate-100/40 dark:bg-slate-950/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${
                    alert.type.includes('risk') || alert.type.includes('drawdown')
                      ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20'
                      : alert.type === 'price_above'
                      ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20'
                      : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20'
                  }`}>
                    {alert.type.includes('risk') ? (
                      <ShieldAlert className="h-4 w-4" />
                    ) : alert.type === 'price_above' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {alert.title}
                      </h4>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        alert.priority === 'high' 
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                      }`}>
                        {alert.priority === 'high' ? 'Magas' : alert.priority === 'medium' ? 'Közepes' : 'Alacsony'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-700 dark:text-slate-300">
                      {alert.symbol && <span className="font-bold text-emerald-600 dark:text-emerald-400">{alert.symbol}</span>}
                      <span>
                        Küszöb:{' '}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {alert.type.includes('price_above') || alert.type.includes('price_below') ? `$${alert.threshold}` : `${alert.threshold}`}
                          {alert.type.includes('pct') || alert.type.includes('drawdown') ? '%' : ''}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 cursor-pointer"
                    title={alert.isActive ? 'Riasztás kikapcsolása' : 'Riasztás bekapcsolása'}
                  >
                    {alert.isActive ? (
                      <ToggleRight className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                    title="Riasztás törlése"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {alert.note && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 pl-1 border-l-2 border-slate-300 dark:border-slate-700 leading-relaxed">
                  {alert.note}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 dark:border-slate-800/60 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Létrehozva: {alert.createdAt}
                </span>
                <span>
                  Kioldva: <span className="font-mono text-slate-800 dark:text-slate-300 font-semibold">{alert.triggerCount}x</span>
                  {alert.lastTriggeredAt && ` (${alert.lastTriggeredAt})`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Notification History Log */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Értesítési Napló & Riasztások Története
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A legutóbb kioldott ármozgások és kockázati riasztások részletei
            </p>
          </div>

          <button
            onClick={markAllNotificationsRead}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Mind olvasottnak jelölése
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800/60 mt-2">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              Még nem történt értesítés.
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="py-3 flex items-start gap-3">
                <div className="mt-1">
                  {n.severity === 'danger' && <AlertTriangle className="h-4 w-4 text-rose-500 dark:text-rose-400" />}
                  {n.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />}
                  {n.severity === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />}
                  {n.severity === 'info' && <Zap className="h-4 w-4 text-sky-500 dark:text-sky-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Új Értesítési Szabály Beállítása</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Riasztás Típusa</label>
                <select
                  value={alertType}
                  onChange={e => setAlertType(e.target.value as AlertType)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="price_above">Árfolyam küszöb felett (Célárfolyam)</option>
                  <option value="price_below">Árfolyam küszöb alatt (Támaszszint)</option>
                  <option value="price_change_pct">Napi volatilitás / elmozdulás (±%)</option>
                  <option value="risk_score_above">eToro Risk Score növekedés</option>
                  <option value="drawdown_above">Portfólió Max Visszaesés (Drawdown %)</option>
                </select>
              </div>

              {isPriceBased && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Figyelt Eszköz (Ticker)</label>
                  <select
                    value={symbol}
                    onChange={e => setSymbol(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    {positions.map(p => (
                      <option key={p.symbol} value={p.symbol}>{p.symbol} — {p.name} (${p.currentPrice})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Küszöbérték ({alertType.includes('pct') || alertType.includes('drawdown') ? '%' : alertType.includes('risk') ? '1-10 skála' : 'USD'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={threshold}
                    onChange={e => setThreshold(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="pl. 135"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Prioritás</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Alacsony (Tájékoztató)</option>
                    <option value="medium">Közepes (Fontos)</option>
                    <option value="high">Magas (Azonnali cselekvés)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Egyéni Cím (Opcionális)</label>
                <input
                  type="text"
                  placeholder="Hagyd üresen az automatikus címhez"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Megjegyzés / Kereskedési Terv</label>
                <textarea
                  rows={2}
                  placeholder="pl. Ha eléri a szintet, zárj le 25% profitot vagy állíts be trailing stop-ot"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm cursor-pointer"
                >
                  Szabály Mentése
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
