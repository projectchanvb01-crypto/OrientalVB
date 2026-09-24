import React, { useState } from 'react';
import { Sidebar, NavTabId } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  currentUserRole: 'SUPER_ADMIN' | 'ADMIN_MANAGER' | 'ADMIN_KASIR';
  setCurrentUserRole: (role: 'SUPER_ADMIN' | 'ADMIN_MANAGER' | 'ADMIN_KASIR') => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  currentUserRole,
  setCurrentUserRole,
  children,
}) => {
  const isPosTab = activeTab === 'RETAIL' || activeTab === 'GROSIR';
  const [isCollapsed, setIsCollapsed] = useState(isPosTab);

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUserRole={currentUserRole}
        setCurrentUserRole={setCurrentUserRole}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Viewport */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen ${isPosTab ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <Header activeTab={activeTab} />

        <main className={`flex-1 w-full mx-auto ${isPosTab ? 'p-3 sm:p-5 overflow-hidden flex flex-col max-w-[1800px]' : 'max-w-[1550px] p-4 sm:p-6 space-y-6'}`}>
          {children}
        </main>

        {!isPosTab && (
          <footer className="border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500 font-mono bg-white">
            Oriental Digital Ecosystem • PWA Touch-Optimized • SAK Accounting Compliant • v1.2.0 Light Dashboard
          </footer>
        )}
      </div>
    </div>
  );
};
