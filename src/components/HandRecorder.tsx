'use client';

import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useCalcWorker } from '../hooks/useCalcWorker';
import CardInput from './CardInput';

export default function HandRecorder() {
  const sessionActive = useGameStore((s) => s.sessionActive);
  const shoe = useGameStore((s) => s.shoe);
  const phase = useGameStore((s) => s.phase);
  const { calculate } = useCalcWorker();

  // Recalculate EV when shoe changes and at start of each new hand
  useEffect(() => {
    if (sessionActive && phase === 'P1') {
      calculate();
    }
  }, [sessionActive, shoe.totalRemaining, phase, calculate]);

  if (!sessionActive) {
    return null;
  }

  return (
    <div className="space-y-4">
      <CardInput />
    </div>
  );
}
