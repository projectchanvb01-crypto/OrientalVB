import React, { useState, useEffect } from 'react';
import { EcosystemProvider } from './context/EcosystemContext';
import { HubLayout, HubTabId } from './components/layout/HubLayout';
import { GojekHomeFeed } from './pages/GojekHomeFeed';
import { UkmSupplyPortal } from './pages/UkmSupplyPortal';
import { MemberPortal } from './pages/MemberPortal';
import { EcosystemHub } from './pages/EcosystemHub';
import { WhiteLabelPortal } from './pages/WhiteLabelPortal';

const getTabFromPath = (path: string): HubTabId => {
  const clean = path.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean.includes('katalog') || clean.includes('supply') || clean.includes('order')) return 'UKM_SUPPLY';
  if (clean.includes('member') || clean.includes('kartu') || clean.includes('doorprize') || clean.includes('promo')) return 'MEMBERS';
  if (clean.includes('learn') || clean.includes('pay') || clean.includes('ecosystem') || clean.includes('aktivitas')) return 'ECOSYSTEM';
  if (clean.includes('white-label') || clean.includes('whitelabel') || clean.includes('maklon')) return 'WHITELABEL';
  return 'BERANDA';
};

const getPathFromTab = (tab: HubTabId): string => {
  switch (tab) {
    case 'UKM_SUPPLY':
      return '/katalog';
    case 'MEMBERS':
      return '/promo';
    case 'ECOSYSTEM':
      return '/aktivitas';
    case 'WHITELABEL':
      return '/white-label';
    case 'BERANDA':
    default:
      return '/';
  }
};

const HubAppContent: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<HubTabId>(() => getTabFromPath(window.location.pathname));

  const setActiveTab = (tab: HubTabId) => {
    setActiveTabState(tab);
    const path = getPathFromTab(tab);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getTabFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <HubLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'BERANDA' && <GojekHomeFeed onNavigateTab={setActiveTab} />}
      {activeTab === 'UKM_SUPPLY' && <UkmSupplyPortal />}
      {activeTab === 'MEMBERS' && <MemberPortal />}
      {activeTab === 'ECOSYSTEM' && <EcosystemHub />}
      {activeTab === 'WHITELABEL' && <WhiteLabelPortal />}
    </HubLayout>
  );
};

export function App() {
  return (
    <EcosystemProvider>
      <HubAppContent />
    </EcosystemProvider>
  );
}

export default App;
