'use client';

import { useGameStore } from '../store/useGameStore';
import { TOTAL_CARDS } from '../engine/constants';
import { shoeProgress } from '../engine/shoe';

export default function ShoeMeter() {
  const shoe = useGameStore((s) => s.shoe);
  const handNumber = useGameStore((s) => s.handNumber);

  const progress = shoeProgress(shoe);
  const dealt = TOTAL_CARDS - shoe.totalRemaining;
  const pct = (progress * 100).toFixed(1);

  // Color transitions: green -> yellow -> red
  const getColor = (p: number) => {
    if (p < 0.5) return '#00E676';
    if (p < 0.75) return '#FFD740';
    return '#FF5252';
  };

  return (
    <div className="bg-[#13131A] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">Shoe Progress</h3>
        <span className="text-xs text-gray-500 font-mono">
          Hand #{handNumber}
        </span>
      </div>
      <div className="w-full h-3 bg-[#1A1A25] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: getColor(progress),
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-600 font-mono">
          {dealt} dealt
        </span>
        <span className="text-[10px] text-gray-600 font-mono">
          {shoe.totalRemaining} remaining
        </span>
      </div>
    </div>
  );
}
