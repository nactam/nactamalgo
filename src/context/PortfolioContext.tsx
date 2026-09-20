import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Position, 
  MonthlyReturn, 
  RiskMetrics, 
  AlertTrigger, 
  NotificationLog, 
  ApiConfig, 
  PortfolioHistoryPoint,
  ActiveTab 
} from '../types';
import { 
  INITIAL_POSITIONS, 
  INITIAL_MONTHLY_RETURNS, 
  INITIAL_RISK_METRICS, 
  INITIAL_ALERTS, 
  INITIAL_API_CONFIG, 
  INITIAL_HISTORY_DATA 
} from '../data/samplePortfolio';
import { exportPortfolioToExcel, PortfolioSummaryExport } from '../utils/excelExport';

interface PortfolioContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Data
  positions: Position[];
  monthlyReturns: MonthlyReturn[];
  riskMetrics: RiskMetrics;
  alerts: AlertTrigger[];
  notifications: NotificationLog[];
  apiConfig: ApiConfig;
  historyData: PortfolioHistoryPoint[];
  
  // Real-time Controls
  isRealTimeActive: boolean;
  toggleRealTime: () => void;
  refreshInterval: number;
  setRefreshInterval: (sec: number) => void;
  lastTickTime: number;
  triggerManualRefresh: () => void;

  // Calculated Metrics
  summary: PortfolioSummaryExport;
  unreadNotificationsCount: number;

  // Mutators
  addPosition: (position: Omit<Position, 'id' | 'priceChange24h'>) => void;
  closePosition: (id: string) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  
  addAlert: (alert: Omit<AlertTrigger, 'id' | 'createdAt' | 'triggerCount'>) => void;
  toggleAlert: (id: string) => void;
  deleteAlert: (id: string) => void;
  
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  
  updateApiConfig: (updates: Partial<ApiConfig>) => void;
  testApiConnection: () => Promise<boolean>;
  resetToDefaults: () => void;
  exportToExcel: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

const CASH_BALANCE = 14250.00;

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('etoro_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [positions, setPositions] = useState<Position[]>(() => {
    const saved = localStorage.getItem('etoro_positions');
    return saved ? JSON.parse(saved) : INITIAL_POSITIONS;
  });

  const [monthlyReturns] = useState<MonthlyReturn[]>(INITIAL_MONTHLY_RETURNS);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>(INITIAL_RISK_METRICS);
  const [alerts, setAlerts] = useState<AlertTrigger[]>(() => {
    const saved = localStorage.getItem('etoro_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>([
    {
      id: 'notif-init-1',
      title: 'eToro Kapcsolat Aktív',
      message: 'Sikeres kapcsolat az eToro Open API v2 végponttal. Valós idejű árfolyamfrissítés bekapcsolva.',
      type: 'api',
      severity: 'success',
      timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    },
    {
      id: 'notif-init-2',
      title: 'Kockázati Jelzés',
      message: 'Az aktuális eToro Risk Score 4 (Mérsékelt). A portfólió diverzifikációja kiváló (82/100).',
      type: 'risk',
      severity: 'info',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    }
  ]);

  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('etoro_api_config');
    return saved ? JSON.parse(saved) : INITIAL_API_CONFIG;
  });

  const [historyData, setHistoryData] = useState<PortfolioHistoryPoint[]>(INITIAL_HISTORY_DATA);
  const [isRealTimeActive, setIsRealTimeActive] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(3);
  const [lastTickTime, setLastTickTime] = useState<number>(Date.now());

  // Save to localStorage when updated
  useEffect(() => {
    localStorage.setItem('etoro_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('etoro_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('etoro_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('etoro_api_config', JSON.stringify(apiConfig));
  }, [apiConfig]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleRealTime = useCallback(() => {
    setIsRealTimeActive(prev => !prev);
  }, []);

  // Summary calculations
  const summary = useMemo<PortfolioSummaryExport>(() => {
    let invested = 0;
    let unrealized = 0;
    let dailyChangeVal = 0;

    positions.forEach(p => {
      const positionCost = p.units * p.openPrice;
      const currentVal = p.units * p.currentPrice;
      const posPnl = (p.currentPrice - p.openPrice) * p.units * p.leverage;
      
      invested += positionCost;
      unrealized += posPnl;

      // Approximate daily contribution
      const dayPct = p.priceChange24h / 100;
      dailyChangeVal += currentVal * dayPct;
    });

    const totalEq = invested + unrealized + CASH_BALANCE;
    const unrealizedPct = invested > 0 ? (unrealized / invested) * 100 : 0;
    const dailyPct = totalEq > 0 ? (dailyChangeVal / totalEq) * 100 : 0;

    return {
      totalEquity: totalEq,
      cashBalance: CASH_BALANCE,
      investedCapital: invested,
      unrealizedProfit: unrealized,
      unrealizedProfitPct: unrealizedPct,
      dailyChange: dailyChangeVal,
      dailyChangePct: dailyPct,
    };
  }, [positions]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Real-time tick simulator & Alert trigger checker
  const runTick = useCallback(() => {
    setPositions(prevPositions => {
      let triggeredAlerts: NotificationLog[] = [];

      const updated = prevPositions.map(pos => {
        // Subtle fluctuation: random delta between -0.4% and +0.42%
        const deltaPercent = (Math.random() - 0.48) * 0.008;
        const newPrice = Math.max(0.01, +(pos.currentPrice * (1 + deltaPercent)).toFixed(pos.assetClass === 'forex' ? 4 : 2));
        const newChange24h = +(pos.priceChange24h + (deltaPercent * 100)).toFixed(2);

        // Check alerts associated with this symbol
        alerts.forEach(alert => {
          if (!alert.isActive) return;
          if (alert.symbol && alert.symbol === pos.symbol) {
            let triggered = false;
            let msg = '';

            if (alert.type === 'price_above' && newPrice >= alert.threshold && pos.currentPrice < alert.threshold) {
              triggered = true;
              msg = `${pos.symbol} ára meghaladta a beállított $${alert.threshold} szintet (Jelenlegi: $${newPrice}).`;
            } else if (alert.type === 'price_below' && newPrice <= alert.threshold && pos.currentPrice > alert.threshold) {
              triggered = true;
              msg = `${pos.symbol} ára a beállított $${alert.threshold} szint alá esett (Jelenlegi: $${newPrice}).`;
            } else if (alert.type === 'price_change_pct' && Math.abs(newChange24h) >= alert.threshold) {
              // trigger if 24h moves fast
              triggered = true;
              msg = `${pos.symbol} 24h elmozdulása elérte a ${newChange24h}%-ot!`;
            }

            if (triggered) {
              triggeredAlerts.push({
                id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                title: alert.title,
                message: msg,
                type: 'price',
                severity: alert.priority === 'high' ? 'danger' : 'warning',
                timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                read: false,
              });

              // Update alert trigger count
              setAlerts(curAlerts => curAlerts.map(a => 
                a.id === alert.id 
                  ? { ...a, triggerCount: a.triggerCount + 1, lastTriggeredAt: new Date().toLocaleString('hu-HU') } 
                  : a
              ));
            }
          }
        });

        return {
          ...pos,
          previousPrice: pos.currentPrice,
          currentPrice: newPrice,
          priceChange24h: newChange24h,
          lastPriceUpdate: Date.now(),
        };
      });

      if (triggeredAlerts.length > 0) {
        setNotifications(prevNotifs => [...triggeredAlerts, ...prevNotifs]);
      }

      return updated;
    });

    // Check portfolio-level risk alerts
    alerts.forEach(alert => {
      if (!alert.isActive) return;
      if (alert.type === 'risk_score_above' && riskMetrics.etoroRiskScore >= alert.threshold) {
        // check if not recently triggered
      } else if (alert.type === 'drawdown_above' && Math.abs(riskMetrics.currentDrawdown) >= alert.threshold) {
        // drawdown alert
      }
    });

    setLastTickTime(Date.now());
  }, [alerts, riskMetrics]);

  // Periodic interval effect
  useEffect(() => {
    if (!isRealTimeActive) return;

    const intervalId = setInterval(() => {
      runTick();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [isRealTimeActive, refreshInterval, runTick]);

  const triggerManualRefresh = useCallback(() => {
    runTick();
  }, [runTick]);

  // Position mutations
  const addPosition = useCallback((newPosData: Omit<Position, 'id' | 'priceChange24h'>) => {
    const newPos: Position = {
      ...newPosData,
      id: `pos-${Date.now()}`,
      priceChange24h: 0.1,
      lastPriceUpdate: Date.now(),
    };
    setPositions(prev => [newPos, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Új Pozíció Megnyitva',
        message: `${newPos.symbol} (${newPos.name}) sikeresen rögzítve ${newPos.units} egységgel $${newPos.openPrice} nyitóáron.`,
        type: 'price',
        severity: 'success',
        timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const closePosition = useCallback((id: string) => {
    setPositions(prev => {
      const target = prev.find(p => p.id === id);
      if (target) {
        const profit = (target.currentPrice - target.openPrice) * target.units * target.leverage;
        setNotifications(curr => [
          {
            id: `notif-close-${Date.now()}`,
            title: `Pozíció Lezárva: ${target.symbol}`,
            message: `${target.symbol} pozíció lezárva. Realizált eredmény: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}.`,
            type: 'price',
            severity: profit >= 0 ? 'success' : 'warning',
            timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
            read: false,
          },
          ...curr,
        ]);
      }
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const updatePosition = useCallback((id: string, updates: Partial<Position>) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  // Alert mutations
  const addAlert = useCallback((newAlertData: Omit<AlertTrigger, 'id' | 'createdAt' | 'triggerCount'>) => {
    const alert: AlertTrigger = {
      ...newAlertData,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      triggerCount: 0,
    };
    setAlerts(prev => [alert, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-alert-add-${Date.now()}`,
        title: 'Új Értesítési Szabály Mentve',
        message: `Értesítés beállítva: ${alert.title} (Küszöb: ${alert.threshold}).`,
        type: 'system',
        severity: 'info',
        timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  // Notifications
  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // API Configuration & Test
  const updateApiConfig = useCallback((updates: Partial<ApiConfig>) => {
    setApiConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const testApiConnection = useCallback(async (): Promise<boolean> => {
    // Simulate ping to eToro API
    await new Promise(resolve => setTimeout(resolve, 800));
    const isSuccess = Boolean(apiConfig.apiKey && apiConfig.apiKey.length > 8);

    setApiConfig(prev => ({
      ...prev,
      isConnected: isSuccess,
      lastSyncTime: new Date().toLocaleString('hu-HU'),
      latencyMs: Math.floor(25 + Math.random() * 30),
      rateLimitRemaining: Math.max(10, prev.rateLimitRemaining - 1),
    }));

    setNotifications(prev => [
      {
        id: `notif-test-${Date.now()}`,
        title: isSuccess ? 'eToro API Kapcsolat Rendben' : 'eToro API Kapcsolódási Hiba',
        message: isSuccess 
          ? `Sikeres válasz az eToro ${apiConfig.environment.toUpperCase()} szervertől. Késleltetés: ${apiConfig.latencyMs}ms.`
          : 'Nem sikerült az eToro API hitelesítése. Kérjük ellenőrizd az API kulcsot és a titkos kulcsot!',
        type: 'api',
        severity: isSuccess ? 'success' : 'danger',
        timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
      ...prev,
    ]);

    return isSuccess;
  }, [apiConfig]);

  const resetToDefaults = useCallback(() => {
    setPositions(INITIAL_POSITIONS);
    setAlerts(INITIAL_ALERTS);
    setApiConfig(INITIAL_API_CONFIG);
    setRiskMetrics(INITIAL_RISK_METRICS);
    setHistoryData(INITIAL_HISTORY_DATA);
    localStorage.removeItem('etoro_positions');
    localStorage.removeItem('etoro_alerts');
    localStorage.removeItem('etoro_api_config');
  }, []);

  const exportToExcel = useCallback(() => {
    exportPortfolioToExcel(positions, monthlyReturns, riskMetrics, summary);
  }, [positions, monthlyReturns, riskMetrics, summary]);

  const value = {
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    positions,
    monthlyReturns,
    riskMetrics,
    alerts,
    notifications,
    apiConfig,
    historyData,
    isRealTimeActive,
    toggleRealTime,
    refreshInterval,
    setRefreshInterval,
    lastTickTime,
    triggerManualRefresh,
    summary,
    unreadNotificationsCount,
    addPosition,
    closePosition,
    updatePosition,
    addAlert,
    toggleAlert,
    deleteAlert,
    markAllNotificationsRead,
    clearNotifications,
    updateApiConfig,
    testApiConnection,
    resetToDefaults,
    exportToExcel,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
