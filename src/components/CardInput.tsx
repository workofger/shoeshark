'use client';

import { useGameStore } from '../store/useGameStore';
import { CARD_LABELS } from '../engine/constants';

const PHASE_LABELS: Record<string, string> = {
  P1: 'Player Card 1',
  B1: 'Banker Card 1',
  P2: 'Player Card 2',
  B2: 'Banker Card 2',
  P3: 'Player Card 3',
  B3: 'Banker Card 3',
  COMPLETE: 'Hand Complete',
};

const PHASE_COLORS: Record<string, string> = {
  P1: 'text-[#4FC3F7]',
  B1: 'text-[#EF5350]',
  P2: 'text-[#4FC3F7]',
  B2: 'text-[#EF5350]',
  P3: 'text-[#4FC3F7]',
  B3: 'text-[#EF5350]',
  COMPLETE: 'text-[#66BB6A]',
};

export default function CardInput() {
  const phase = useGameStore((s) => s.phase);
  const shoe = useGameStore((s) => s.shoe);
  const inputCard = useGameStore((s) => s.inputCard);
  const undoLastCard = useGameStore((s) => s.undoLastCard);
  const resetHand = useGameStore((s) => s.resetHand);
  const cardHistory = useGameStore((s) => s.cardHistory);
  const currentCards = useGameStore((s) => s.currentCards);

  const handleCardTap = (value: number) => {
    if (phase === 'COMPLETE') return;
    if (shoe.counts[value] <= 0) return;
    inputCard(value);
  };

  const displayValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="space-y-3">
      {/* Phase indicator */}
      <div className="flex items-center justify-between">
        <div className={`text-lg font-bold ${PHASE_COLORS[phase] || 'text-white'}`}>
          {PHASE_LABELS[phase] || phase}
        </div>
        <div className="flex gap-2">
          {cardHistory.length > 0 && (
            <button
              onClick={undoLastCard}
              className="px-3 py-1 bg-[#1A1A25] rounded text-sm text-gray-400 hover:text-white transition-colors min-h-[36px]"
            >
              Undo
            </button>
          )}
          {cardHistory.length > 0 && (
            <button
              onClick={resetHand}
              className="px-3 py-1 bg-[#1A1A25] rounded text-sm text-gray-400 hover:text-white transition-colors min-h-[36px]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Current cards display */}
      <div className="flex gap-2 items-center min-h-[40px]">
        <span className="text-[#4FC3F7] text-sm font-mono w-8">P:</span>
        <CardPill value={currentCards.p1} color="#4FC3F7" />
        <CardPill value={currentCards.p2} color="#4FC3F7" />
        <CardPill value={currentCards.p3} color="#4FC3F7" dim />
        <span className="mx-2 text-gray-600">|</span>
        <span className="text-[#EF5350] text-sm font-mono w-8">B:</span>
        <CardPill value={currentCards.b1} color="#EF5350" />
        <CardPill value={currentCards.b2} color="#EF5350" />
        <CardPill value={currentCards.b3} color="#EF5350" dim />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-5 gap-2">
        {displayValues.map((value) => {
          const remaining = shoe.counts[value];
          const disabled = remaining <= 0 || phase === 'COMPLETE';
          const isZero = value === 0;

          return (
            <button
              key={value}
              onClick={() => handleCardTap(value)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center justify-center
                rounded-lg font-mono text-xl font-bold
                min-h-[48px] min-w-[48px]
                transition-all active:scale-95
                ${isZero ? 'col-span-2' : ''}
                ${disabled
                  ? 'bg-[#1A1A25]/50 text-gray-700 cursor-not-allowed'
                  : 'bg-[#1A1A25] text-white hover:bg-[#252535] active:bg-[#303045]'
                }
              `}
            >
              <span>{value === 0 ? '0' : CARD_LABELS[value]}</span>
              <span className={`text-[10px] font-normal ${disabled ? 'text-gray-800' : 'text-gray-500'}`}>
                {remaining}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CardPill({ value, color, dim }: { value?: number; color: string; dim?: boolean }) {
  if (value === undefined) {
    return (
      <span
        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono border border-dashed
          ${dim ? 'border-gray-800 text-gray-800' : 'border-gray-600 text-gray-600'}`}
      >
        ?
      </span>
    );
  }

  return (
    <span
      className="w-8 h-8 rounded flex items-center justify-center text-sm font-mono font-bold"
      style={{ backgroundColor: color + '20', color }}
    >
      {value}
    </span>
  );
}
