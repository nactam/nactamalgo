export type AssetClass = 'stocks' | 'crypto' | 'etf' | 'commodities' | 'forex';

export interface Position {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  units: number;
  openPrice: number;
  currentPrice: number;
  openDate: string;
  leverage: number; // 1 = no leverage, 2 = 2x, etc.
  stopLoss?: number;
  takeProfit?: number;
  isCopyTrade?: boolean;
  copiedTraderName?: string;
  priceChange24h: number; // percentage
  lastPriceUpdate?: number; // timestamp
  previousPrice?: number;
}

export interface MonthlyReturn {
  year: number;
  month: number; // 1-12
  monthName: string;
  returnPercent: number;
  realizedProfit: number;
  tradesCount: number;
  winRate: number; // percentage 0-100
  bestAsset: string;
  deposits: number;
  withdrawals: number;
}

export interface RiskMetrics {
  etoroRiskScore: number; // 1 to 10
  riskCategory: 'Alacsony' | 'Mérsékelt' | 'Magas' | 'Nagyon magas';
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number; // percentage (negative)
  currentDrawdown: number;
  betaSP500: number;
  annualizedVolatility: number; // percentage
  valueAtRisk95: number; // percentage loss potential
  diversificationScore: number; // 0 - 100
  profitablePositionsRatio: number; // percentage
}

export type AlertType = 'price_above' | 'price_below' | 'price_change_pct' | 'risk_score_above' | 'drawdown_above';

export interface AlertTrigger {
  id: string;
  symbol?: string; // e.g. 'NVDA' or empty for portfolio-level
  type: AlertType;
  threshold: number;
  title: string;
  note?: string;
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
  priority: 'low' | 'medium' | 'high';
}

export interface NotificationLog {
  id: string;
  title: string;
  message: string;
  type: 'price' | 'risk' | 'system' | 'api';
  severity: 'info' | 'success' | 'warning' | 'danger';
  timestamp: string;
  read: boolean;
}

export interface ApiConfig {
  apiKey: string;
  apiSecret: string;
  appId: string;
  environment: 'sandbox' | 'production';
  username: string;
  isConnected: boolean;
  lastSyncTime?: string;
  autoSyncIntervalSec: number; // 5, 10, 30, 60
  rateLimitRemaining: number;
  rateLimitMax: number;
  latencyMs: number;
}

export interface PortfolioHistoryPoint {
  date: string;
  portfolioValue: number;
  investedCapital: number;
  cashBalance: number;
  benchmarkValue: number; // Normalized S&P 500
}

export type ActiveTab = 
  | 'dashboard' 
  | 'analytics' 
  | 'monthly' 
  | 'risk' 
  | 'alerts' 
  | 'api_settings';
