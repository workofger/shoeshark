'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '../../store/useGameStore';
import { DEFAULT_PAYOUTS } from '../../engine/constants';

export default function SettingsPage() {
  const payouts = useGameStore((s) => s.payouts);
  const setPayouts = useGameStore((s) => s.setPayouts);

  const [player, setPlayer] = useState(payouts.player.toString());
  const [banker, setBanker] = useState(payouts.banker.toString());
  const [tie, setTie] = useState(payouts.tie.toString());
  const [playerPair, setPlayerPair] = useState(payouts.playerPair.toString());
  const [bankerPair, setBankerPair] = useState(payouts.bankerPair.toString());
  const [eitherPair, setEitherPair] = useState(payouts.eitherPair.toString());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setPayouts({
      ...payouts,
      player: parseFloat(player) || DEFAULT_PAYOUTS.player,
      banker: parseFloat(banker) || DEFAULT_PAYOUTS.banker,
      tie: parseFloat(tie) || DEFAULT_PAYOUTS.tie,
      playerPair: parseFloat(playerPair) || DEFAULT_PAYOUTS.playerPair,
      bankerPair: parseFloat(bankerPair) || DEFAULT_PAYOUTS.bankerPair,
      eitherPair: parseFloat(eitherPair) || DEFAULT_PAYOUTS.eitherPair,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setPayouts(DEFAULT_PAYOUTS);
    setPlayer(DEFAULT_PAYOUTS.player.toString());
    setBanker(DEFAULT_PAYOUTS.banker.toString());
    setTie(DEFAULT_PAYOUTS.tie.toString());
    setPlayerPair(DEFAULT_PAYOUTS.playerPair.toString());
    setBankerPair(DEFAULT_PAYOUTS.bankerPair.toString());
    setEitherPair(DEFAULT_PAYOUTS.eitherPair.toString());
  };

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-4 border-b border-[#1A1A25]">
        <Link href="/">
          <span className="text-lg font-bold">
            🦈 <span className="text-[#4FC3F7]">Shark</span>
          </span>
        </Link>
        <h2 className="text-sm text-gray-400">Settings</h2>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        <div className="bg-[#13131A] rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-400">Payout Configuration</h3>

          <PayoutField label="Player (x:1)" value={player} onChange={setPlayer} />
          <PayoutField label="Banker (x:1)" value={banker} onChange={setBanker} />
          <PayoutField label="Tie (x:1)" value={tie} onChange={setTie} />
          <PayoutField label="Player Pair (x:1)" value={playerPair} onChange={setPlayerPair} />
          <PayoutField label="Banker Pair (x:1)" value={bankerPair} onChange={setBankerPair} />
          <PayoutField label="Either Pair (x:1)" value={eitherPair} onChange={setEitherPair} />

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className={`flex-1 py-3 rounded-xl font-bold min-h-[48px] transition-colors ${
                saved
                  ? 'bg-[#00E676] text-black'
                  : 'bg-[#4FC3F7] text-black hover:bg-[#3DA8D8]'
              }`}
            >
              {saved ? '✓ Saved' : 'Save'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-[#1A1A25] text-gray-400 rounded-xl hover:text-white transition-colors min-h-[48px]"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="bg-[#13131A] rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">About</h3>
          <p className="text-xs text-gray-600">
            ShoeShark v1.0.0 — Baccarat shoe tracking PWA with real-time EV engine.
            Monte Carlo simulation with 50,000 iterations. All calculations run client-side.
          </p>
        </div>
      </main>
    </div>
  );
}

function PayoutField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-400">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step="0.05"
        min="0"
        className="w-20 bg-[#1A1A25] text-white text-right px-3 py-2 rounded-lg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#4FC3F7]"
      />
    </div>
  );
}
