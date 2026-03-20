'use client';

import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import HandRecorder from '../../components/HandRecorder';
import EVDashboard from '../../components/EVDashboard';
import ShoeMeter from '../../components/ShoeMeter';
import DistributionChart from '../../components/DistributionChart';
import BaccaratRoad from '../../components/BaccaratRoad';
import AlertBanner from '../../components/AlertBanner';
import Link from 'next/link';

export default function PlayPage() {
  const sessionActive = useGameStore((s) => s.sessionActive);
  const startSession = useGameStore((s) => s.startSession);
  const endSession = useGameStore((s) => s.endSession);
  const resetShoe = useGameStore((s) => s.resetShoe);
  const handNumber = useGameStore((s) => s.handNumber);

  // Auto-start session
  useEffect(() => {
    if (!sessionActive) {
      startSession();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEndSession = () => {
    endSession();
  };

  return (
    <div className="min-h-screen flex flex-col safe-bottom">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#1A1A25]">
        <Link href="/">
          <span className="text-lg font-bold">
            🦈 <span className="text-[#4FC3F7]">Shark</span>
          </span>
        </Link>
        <div className="flex gap-2">
          <button
            onClick={resetShoe}
            className="px-3 py-1.5 bg-[#1A1A25] rounded-lg text-xs text-gray-400 hover:text-white transition-colors min-h-[36px]"
          >
            New Shoe
          </button>
          <button
            onClick={handleEndSession}
            className="px-3 py-1.5 bg-[#FF5252]/10 text-[#FF5252] rounded-lg text-xs hover:bg-[#FF5252]/20 transition-colors min-h-[36px]"
          >
            End
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <AlertBanner />
        <ShoeMeter />
        <HandRecorder />
        <EVDashboard />
        <BaccaratRoad />
        <DistributionChart />
      </main>
    </div>
  );
}
