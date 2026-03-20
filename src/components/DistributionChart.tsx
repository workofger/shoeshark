'use client';

import { useGameStore } from '../store/useGameStore';
import { INITIAL_COUNTS, CARD_LABELS } from '../engine/constants';

export default function DistributionChart() {
  const shoe = useGameStore((s) => s.shoe);

  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const maxInitial = 128; // Value 0 has 128

  return (
    <div className="bg-[#13131A] rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Card Distribution</h3>
      <div className="space-y-1.5">
        {values.map((v) => {
          const remaining = shoe.counts[v];
          const initial = INITIAL_COUNTS[v];
          const dealt = initial - remaining;
          const pct = (remaining / initial) * 100;

          return (
            <div key={v} className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500 w-4 text-right">
                {CARD_LABELS[v]}
              </span>
              <div className="flex-1 h-4 bg-[#1A1A25] rounded overflow-hidden relative">
                <div
                  className="h-full rounded transition-all duration-300"
                  style={{
                    width: `${(remaining / maxInitial) * 100}%`,
                    backgroundColor: pct > 50 ? '#4FC3F7' : pct > 25 ? '#FFD740' : '#FF5252',
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-gray-600 w-12 text-right">
                {remaining}/{initial}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
