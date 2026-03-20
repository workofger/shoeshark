'use client';

import { useGameStore } from '../store/useGameStore';

const SIGNAL_COLORS = {
  positive: '#00E676',
  negative: '#FF5252',
  neutral: '#FFD740',
};

const BET_LABELS: Record<string, string> = {
  player: 'Player',
  banker: 'Banker',
  tie: 'Tie',
  playerPair: 'P Pair',
  bankerPair: 'B Pair',
  eitherPair: 'Either Pair',
  playerDragon: 'P Dragon',
  bankerDragon: 'B Dragon',
};

export default function EVDashboard() {
  const ev = useGameStore((s) => s.ev);
  const probabilities = useGameStore((s) => s.probabilities);
  const isCalculating = useGameStore((s) => s.isCalculating);

  if (!ev || !probabilities) {
    return (
      <div className="bg-[#13131A] rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Expected Value</h3>
        <p className="text-gray-600 text-sm">
          {isCalculating ? 'Calculating...' : 'Start a session to see EV calculations'}
        </p>
      </div>
    );
  }

  const mainBets = [
    { key: 'player', prob: probabilities.player, ev: ev.player },
    { key: 'banker', prob: probabilities.banker, ev: ev.banker },
    { key: 'tie', prob: probabilities.tie, ev: ev.tie },
  ];

  const sideBets = [
    { key: 'playerPair', prob: probabilities.playerPair, ev: ev.playerPair },
    { key: 'bankerPair', prob: probabilities.bankerPair, ev: ev.bankerPair },
    { key: 'eitherPair', prob: probabilities.eitherPair, ev: ev.eitherPair },
    { key: 'playerDragon', prob: null, ev: ev.playerDragon },
    { key: 'bankerDragon', prob: null, ev: ev.bankerDragon },
  ];

  return (
    <div className="bg-[#13131A] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">Expected Value</h3>
        {isCalculating && (
          <span className="text-xs text-[#FFD740] animate-pulse">Calculating...</span>
        )}
      </div>

      {/* Main bets */}
      <div className="grid grid-cols-3 gap-2">
        {mainBets.map(({ key, prob, ev: evVal }) => (
          <EVCard
            key={key}
            label={BET_LABELS[key]}
            ev={evVal}
            probability={prob}
            signal={ev.signals[key]}
            isBest={ev.bestBet === key}
          />
        ))}
      </div>

      {/* Side bets */}
      <div className="grid grid-cols-3 gap-2">
        {sideBets.map(({ key, prob, ev: evVal }) => (
          <EVCard
            key={key}
            label={BET_LABELS[key]}
            ev={evVal}
            probability={prob}
            signal={ev.signals[key]}
            isBest={ev.bestBet === key}
            small
          />
        ))}
      </div>
    </div>
  );
}

function EVCard({
  label,
  ev,
  probability,
  signal,
  isBest,
  small,
}: {
  label: string;
  ev: number;
  probability: number | null;
  signal: 'positive' | 'negative' | 'neutral';
  isBest: boolean;
  small?: boolean;
}) {
  const color = SIGNAL_COLORS[signal];

  return (
    <div
      className={`
        bg-[#1A1A25] rounded-lg p-2 relative
        ${isBest ? 'ring-1 ring-[#00E676]/50' : ''}
        ${small ? 'py-1.5' : ''}
      `}
    >
      {isBest && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00E676]" />
      )}
      <div className={`text-gray-500 ${small ? 'text-[10px]' : 'text-xs'} mb-0.5`}>{label}</div>
      <div
        className={`font-mono font-bold ${small ? 'text-sm' : 'text-lg'}`}
        style={{ color }}
      >
        {ev >= 0 ? '+' : ''}{(ev * 100).toFixed(2)}%
      </div>
      {probability !== null && (
        <div className="text-gray-600 text-[10px] font-mono">
          {(probability * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
