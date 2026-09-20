import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { 
  KeyRound, 
  ShieldCheck, 
  Globe, 
  Server, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  FileText, 
  ExternalLink,
  Sliders,
  RotateCcw
} from 'lucide-react';

export const ApiSettingsView: React.FC = () => {
  const { 
    apiConfig, 
    updateApiConfig, 
    testApiConnection, 
    resetToDefaults, 
    refreshInterval, 
    setRefreshInterval 
  } = usePortfolio();

  const [apiKey, setApiKey] = useState(apiConfig.apiKey);
  const [apiSecret, setApiSecret] = useState(apiConfig.apiSecret);
  const [appId, setAppId] = useState(apiConfig.appId);
  const [username, setUsername] = useState(apiConfig.username);
  const [showSecret, setShowSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiConfig({
      apiKey,
      apiSecret,
      appId,
      username,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    await testApiConnection();
    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            eToro API Integráció & Kulcsok Kezelése
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Állítsd be az eToro Open API hitelesítési adataidat a valós idejű szinkronizációhoz és automatizációhoz
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin text-emerald-500 dark:text-emerald-400' : ''}`} />
            <span>{isTesting ? 'Kapcsolódás...' : 'API Kapcsolat Tesztelése'}</span>
          </button>
        </div>
      </div>

      {/* 2. Connection Status Banner */}
      <div className={`rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        apiConfig.isConnected 
          ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100' 
          : 'border-rose-200 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            apiConfig.isConnected 
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30' 
              : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
          }`}>
            {apiConfig.isConnected ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {apiConfig.isConnected ? 'eToro API Kapcsolat Aktív' : 'eToro API Nem Kapcsolódott'}
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold uppercase ${
                apiConfig.environment === 'production' 
                  ? 'bg-emerald-200 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
              }`}>
                {apiConfig.environment === 'production' ? 'Élő Számla (Live)' : 'Virtuális Demó (Sandbox)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Utolsó sikeres szinkronizáció: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{apiConfig.lastSyncTime || 'Nincs adat'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Késleltetés (Ping):</span>
            <span className="font-bold text-slate-900 dark:text-white">{apiConfig.latencyMs} ms</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">API Kvóta:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{apiConfig.rateLimitRemaining} / {apiConfig.rateLimitMax}</span>
          </div>
        </div>
      </div>

      {/* 3. API Keys Form & Configuration */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-xs">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              API Hitelesítési Adatok
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Az adataidat a böngésződ biztonságos helyi tárhelye (localStorage) kezeli, nem kerülnek külső szerverre.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Környezet:</span>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-950 p-0.5 border border-slate-300 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => updateApiConfig({ environment: 'production' })}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  apiConfig.environment === 'production' 
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Élő eToro (Live)
              </button>
              <button
                type="button"
                onClick={() => updateApiConfig({ environment: 'sandbox' })}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  apiConfig.environment === 'sandbox' 
                    ? 'bg-amber-600 text-white font-semibold shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sandbox (Demó)
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* API Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                eToro API Key (Client ID / Publikus kulcs)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  placeholder="pl. etoro_live_pk_..."
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Az eToro Developer Portálon generált egyedi alkalmazáskulcs.
              </span>
            </div>

            {/* API Secret */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                eToro API Secret (Titkos kulcs)
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  required
                  value={apiSecret}
                  onChange={e => setApiSecret(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  placeholder="••••••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                HMAC SHA-256 aláírásokhoz és biztonságos adatlekéréshez.
              </span>
            </div>

            {/* eToro Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                eToro Felhasználónév (Username)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                placeholder="pl. attila_invest_hu"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                A másolási statisztikák és portfólió egyezés azonosításához.
              </span>
            </div>

            {/* App ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Alkalmazás Azonosító (App ID)
              </label>
              <input
                type="text"
                value={appId}
                onChange={e => setAppId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                placeholder="etoro-portfolio-analytics"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Opcionális partner azonosító.
              </span>
            </div>

          </div>

          {/* Sync Frequency Slider / Selector */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  Valós Idejű Árfolyam Frissítési Gyakoriság
                </label>
                <p className="text-[11px] text-slate-500">
                  Gyakoribb frissítés gyorsabb ármozgásokat biztosít, de több API kvótát fogyaszt.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-300 dark:border-slate-800">
                {[1, 3, 5, 10, 30].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRefreshInterval(sec)}
                    className={`px-3 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                      refreshInterval === sec
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/40 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Visszaállítod az eredeti mintaadatokat és alapértelmezett API beállításokat?')) {
                  resetToDefaults();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Alapértelmezett mintaadatok visszaállítása</span>
            </button>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Beállítások sikeresen elmentve!
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm cursor-pointer"
              >
                Kulcsok Mentése
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 4. Best Practices for Leveraging eToro API */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-4 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          Hogyan Használd Ki a Legjobban az eToro API Kulcsaidat?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 dark:text-slate-300">
          
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/70 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Server className="h-4 w-4" />
              <span>1. Valós Idejű Streaming</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Használd a WebSocket kapcsolatot a REST polling helyett a leggyorsabb ármozgás-reakcióhoz, ezzel megkímélve az API kvótádat a túlterheléstől.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/70 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>2. Kockázati Stop Határok</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Állíts be automatikus riasztásokat, ha a portfólió eToro Risk Score pontszáma eléri a 6-ot, vagy ha a Drawdown meghaladja a megengedett 5%-ot.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/70 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold">
              <FileText className="h-4 w-4" />
              <span>3. Havi Excel Exportálás</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Minden hónap végén exportáld a teljes kimutatást `.xlsx` formátumban adóbevalláshoz, hozamtörténethez és kockázati auditáláshoz.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
