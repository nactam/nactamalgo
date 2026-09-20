import React, { useState } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { MonthlyPerformanceView } from './components/MonthlyPerformanceView';
import { RiskAnalysisView } from './components/RiskAnalysisView';
import { AlertsView } from './components/AlertsView';
import { ApiSettingsView } from './components/ApiSettingsView';
import { NotificationToast } from './components/NotificationToast';

const AppContent: React.FC = () => {
  const { activeTab, theme } = usePortfolio();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Navigation */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Dynamic View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'monthly' && <MonthlyPerformanceView />}
          {activeTab === 'risk' && <RiskAnalysisView />}
          {activeTab === 'alerts' && <AlertsView />}
          {activeTab === 'api_settings' && <ApiSettingsView />}
        </main>
      </div>

      {/* Floating Notification Toast */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}
