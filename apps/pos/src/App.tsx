import React, { useState, useEffect } from 'react';
import { EcosystemProvider } from './context/EcosystemContext';
import { PosLayout, PosLaneId } from './components/layout/PosLayout';
import { RetailPOS } from './pages/RetailPOS';
import { GrosirPOS } from './pages/GrosirPOS';
import { WastePurchasingPOS } from './pages/WastePurchasingPOS';
import { PriceCheckerStation } from './pages/PriceCheckerStation';

const getLaneFromPath = (path: string): PosLaneId => {
  const clean = path.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean.includes('grosir') || clean.includes('b2b')) return 'GROSIR';
  if (clean.includes('waste') || clean.includes('limbah') || clean.includes('jelantah')) return 'WASTE';
  if (clean.includes('price-checker') || clean.includes('cek-harga') || clean.includes('kiosk')) return 'PRICE_CHECKER';
  return 'RETAIL';
};

const getPathFromLane = (lane: PosLaneId): string => {
  switch (lane) {
    case 'GROSIR':
      return '/grosir';
    case 'WASTE':
      return '/waste';
    case 'PRICE_CHECKER':
      return '/price-checker';
    case 'RETAIL':
    default:
      return '/';
  }
};

const PosAppContent: React.FC = () => {
  const [activeLane, setActiveLaneState] = useState<PosLaneId>(() => getLaneFromPath(window.location.pathname));

  const setActiveLane = (lane: PosLaneId) => {
    setActiveLaneState(lane);
    const path = getPathFromLane(lane);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveLaneState(getLaneFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <PosLayout activeLane={activeLane} setActiveLane={setActiveLane}>
      {activeLane === 'RETAIL' && <RetailPOS />}
      {activeLane === 'GROSIR' && <GrosirPOS />}
      {activeLane === 'WASTE' && <WastePurchasingPOS />}
      {activeLane === 'PRICE_CHECKER' && <PriceCheckerStation />}
    </PosLayout>
  );
};

export function App() {
  return (
    <EcosystemProvider>
      <PosAppContent />
    </EcosystemProvider>
  );
}

export default App;
