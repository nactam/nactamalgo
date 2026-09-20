import React, { useEffect, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { ShieldAlert, TrendingUp, TrendingDown, X, Bell } from 'lucide-react';
import { NotificationLog } from '../types';

export const NotificationToast: React.FC = () => {
  const { notifications } = usePortfolio();
  const [activeToast, setActiveToast] = useState<NotificationLog | null>(null);

  // Show the latest unread notification if created within last 4 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (!latest.read) {
        setActiveToast(latest);
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
        activeToast.severity === 'danger'
          ? 'bg-rose-50/95 dark:bg-rose-950/95 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
          : activeToast.severity === 'warning'
          ? 'bg-amber-50/95 dark:bg-amber-950/95 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
          : 'bg-white/95 dark:bg-slate-900/95 border-emerald-500/50 text-slate-900 dark:text-slate-100'
      }`}>
        <div className="mt-0.5 shrink-0">
          {activeToast.severity === 'danger' ? (
            <ShieldAlert className="h-5 w-5 text-rose-500 dark:text-rose-400" />
          ) : (
            <Bell className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">{activeToast.title}</h4>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 ml-2">{activeToast.timestamp}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{activeToast.message}</p>
        </div>
        <button
          onClick={() => setActiveToast(null)}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 shrink-0 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
