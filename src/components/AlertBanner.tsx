'use client';

import { useGameStore } from '../store/useGameStore';

export default function AlertBanner() {
  const ev = useGameStore((s) => s.ev);
  const hands = useGameStore((s) => s.hands);

  if (!ev) return null;

  // Show alert for last hand result
  const lastHand = hands[hands.length - 1];

  // Show positive EV alerts
  const positiveSignals = Object.entries(ev.signals)
    .filter(([, signal]) => signal === 'positive')
    .map(([key]) => key);

  if (positiveSignals.length === 0 && !lastHand) return null;

  return (
    <div className="space-y-2">
      {/* Last hand result */}
      {lastHand && (
        <div
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            lastHand.result.result === 'player'
              ? 'bg-[#4FC3F7]/10 text-[#4FC3F7]'
              : lastHand.result.result === 'banker'
              ? 'bg-[#EF5350]/10 text-[#EF5350]'
              : 'bg-[#66BB6A]/10 text-[#66BB6A]'
          }`}
        >
          Hand #{lastHand.handNumber}:{' '}
          {lastHand.result.result.toUpperCase()}{' '}
          ({lastHand.result.playerTotal} vs {lastHand.result.bankerTotal})
          {lastHand.result.isNatural && ' 🎯 Natural'}
          {lastHand.result.playerPair && ' 👯 P-Pair'}
          {lastHand.result.bankerPair && ' 👯 B-Pair'}
        </div>
      )}

      {/* Positive EV alerts */}
      {positiveSignals.length > 0 && (
        <div className="bg-[#00E676]/10 text-[#00E676] rounded-lg px-3 py-2 text-sm">
          <span className="font-bold">🦈 +EV Alert:</span>{' '}
          {positiveSignals.map(formatBetName).join(', ')}
        </div>
      )}
    </div>
  );
}

function formatBetName(key: string): string {
  const names: Record<string, string> = {
    player: 'Player',
    banker: 'Banker',
    tie: 'Tie',
    playerPair: 'Player Pair',
    bankerPair: 'Banker Pair',
    eitherPair: 'Either Pair',
    playerDragon: 'Player Dragon',
    bankerDragon: 'Banker Dragon',
  };
  return names[key] || key;
}
