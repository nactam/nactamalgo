import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard, 
  LineChart, 
  CalendarRange, 
  ShieldAlert, 
  BellRing, 
  KeyRound, 
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, apiConfig, alerts } = usePortfolio();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
    { 
      id: 'dashboard', 
      label: 'Portfólió & Pozíciók', 
      icon: LayoutDashboard,
    },
    { 
      id: 'analytics', 
      label: 'Hozamelemzés & Grafikonok', 
      icon: LineChart,
    },
    { 
      id: 'monthly', 
      label: 'Havi Teljesítmény', 
      icon: CalendarRange,
      badge: 'Mátrix'
    },
    { 
      id: 'risk', 
      label: 'Kockázati Mutatók', 
      icon: ShieldAlert,
      badge: 'eToro 4/10'
    },
    { 
      id: 'alerts', 
      label: 'Ár- & Kockázati Riasztások', 
      icon: BellRing,
      badge: alerts.filter(a => a.isActive).length
    },
    { 
      id: 'api_settings', 
      label: 'eToro API & Beállítások', 
      icon: KeyRound,
      badge: apiConfig.isConnected ? 'Aktív' : 'Hiba'
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside className={`
        fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 
        bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80 p-4 flex flex-col justify-between 
        transition-transform duration-200 ease-in-out shadow-xs
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <div className="flex md:hidden items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Navigáció</span>
          <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Fő Menü
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                    isActive 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* eToro API Connection Card at the bottom */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`inline-flex rounded-full h-2 w-2 ${apiConfig.isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">eToro API v2</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {apiConfig.latencyMs}ms
            </span>
          </div>

          <div className="text-[11px] text-slate-600 dark:text-slate-400">
            Fiók: <span className="font-semibold text-slate-800 dark:text-slate-200">@{apiConfig.username}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/60 text-[10px] text-slate-500 dark:text-slate-400">
            <span>API Kvóta (Rate limit):</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{apiConfig.rateLimitRemaining}/{apiConfig.rateLimitMax}</span>
          </div>

          <button
            onClick={() => handleSelectTab('api_settings')}
            className="w-full text-center text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline pt-1 font-medium transition-colors cursor-pointer"
          >
            API kulcsok & beállítások &rarr;
          </button>
        </div>
      </aside>
    </>
  );
};
