'use client';

import { useGameStore } from '../store/useGameStore';
import { HandRecord } from '../types';

const RESULT_COLORS = {
  player: '#4FC3F7',
  banker: '#EF5350',
  tie: '#66BB6A',
};

export default function BaccaratRoad() {
  const hands = useGameStore((s) => s.hands);

  if (hands.length === 0) {
    return (
      <div className="bg-[#13131A] rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Bead Road</h3>
        <p className="text-gray-600 text-xs">No hands recorded yet</p>
      </div>
    );
  }

  // Bead road: simple grid, 6 rows, scrolling columns
  const rows = 6;
  const cols = Math.ceil(hands.length / rows);

  return (
    <div className="bg-[#13131A] rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-2">Bead Road</h3>
      <div className="overflow-x-auto">
        <div
          className="grid gap-1"
          style={{
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridAutoFlow: 'column',
            gridAutoColumns: '24px',
          }}
        >
          {hands.map((hand, i) => (
            <BeadCell key={hand.id} hand={hand} index={i} />
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex gap-3 mt-2">
        <Legend color="#4FC3F7" label="Player" />
        <Legend color="#EF5350" label="Banker" />
        <Legend color="#66BB6A" label="Tie" />
      </div>
    </div>
  );
}

function BeadCell({ hand, index }: { hand: HandRecord; index: number }) {
  const color = RESULT_COLORS[hand.result.result];
  const isPair = hand.result.playerPair || hand.result.bankerPair;

  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold relative"
      style={{ backgroundColor: color + '30', color }}
      title={`#${hand.handNumber} - ${hand.result.result.toUpperCase()} (${hand.result.playerTotal} vs ${hand.result.bankerTotal})`}
    >
      {hand.result.result[0].toUpperCase()}
      {isPair && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white/60" />
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color + '50' }} />
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}
