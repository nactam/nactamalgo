import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { 
  Bell, 
  Download, 
  Sun, 
  Moon, 
  Radio, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  Menu
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { 
    theme, 
    toggleTheme, 
    isRealTimeActive, 
    toggleRealTime, 
    triggerManualRefresh, 
    exportToExcel, 
    summary, 
    notifications, 
    unreadNotificationsCount, 
    markAllNotificationsRead,
    clearNotifications,
    apiConfig 
  } = usePortfolio();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    triggerManualRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 text-slate-900 dark:text-slate-100 shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand & Live indicator */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button 
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label="Menü megnyitása"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-500/20">
              <span className="text-lg tracking-tighter">eT</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  eToro <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Portfólió Elemző</span>
                </h1>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  apiConfig.environment === 'production' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800/60'
                }`}>
                  {apiConfig.environment === 'production' ? 'Élő API' : 'Sandbox'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Valós idejű hozamkövetés & kockázatelemzés
              </p>
            </div>
          </div>
        </div>

        {/* Center: Real-time quick badge */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-100 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
          <button
            onClick={toggleRealTime}
            className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
              isRealTimeActive 
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title={isRealTimeActive ? 'Valós idejű árfrissítés aktív (Kattints a szüneteltetéshez)' : 'Valós idejű frissítés szünetel (Kattints az indításhoz)'}
          >
            <span className={`relative flex h-2 w-2`}>
              {isRealTimeActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isRealTimeActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            </span>
            <span>{isRealTimeActive ? 'ÉLŐ FEED' : 'SZÜNETEL'}</span>
          </button>

          <div className="h-3 w-px bg-slate-300 dark:bg-slate-800" />

          <div className="text-xs text-slate-600 dark:text-slate-400">
            Portfólió Érték:{' '}
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
              ${summary.totalEquity.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={handleManualRefresh}
            className={`p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`}
            title="Azonnali manuális frissítés"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Excel Export Button */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-sm shadow-emerald-900/20 border border-emerald-500/40 transition-all cursor-pointer"
            title="Teljes portfólió jelentés letöltése Excel (.xlsx) formátumban"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Excel Export</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(prev => !prev);
                if (!isNotifOpen && unreadNotificationsCount > 0) {
                  markAllNotificationsRead();
                }
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
              title="Értesítések és árriasztások"
              aria-label="Értesítések"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 text-slate-800 dark:text-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Értesítések & Riasztások</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-mono">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        Összes törlése
                      </button>
                    )}
                    <button 
                      onClick={() => setIsNotifOpen(false)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      Nincsenek új értesítések.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="py-2.5 flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {n.severity === 'danger' && <ShieldAlert className="h-4 w-4 text-rose-500" />}
                          {n.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                          {n.severity === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                          {n.severity === 'info' && <Radio className="h-4 w-4 text-sky-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{n.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
            title={theme === 'dark' ? 'Váltás világos módra' : 'Váltás sötét módra'}
            aria-label="Téma váltás"
          >
            {theme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 text-amber-300" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-600" />
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
