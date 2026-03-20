'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import type { WorkerResponse, CalcRequest } from '../types';

export function useCalcWorker() {
  const workerRef = useRef<Worker | null>(null);
  const shoe = useGameStore((s) => s.shoe);
  const payouts = useGameStore((s) => s.payouts);
  const setProbabilities = useGameStore((s) => s.setProbabilities);
  const setEV = useGameStore((s) => s.setEV);
  const setIsCalculating = useGameStore((s) => s.setIsCalculating);

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('../workers/calc.worker.ts', import.meta.url)
    );

    workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === 'result') {
        setProbabilities(msg.probabilities);
        setEV(msg.ev);
        setIsCalculating(false);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [setProbabilities, setEV, setIsCalculating]);

  const calculate = useCallback(() => {
    if (!workerRef.current) return;
    setIsCalculating(true);
    const msg: CalcRequest = {
      type: 'calculate',
      shoe,
      payouts,
    };
    workerRef.current.postMessage(msg);
  }, [shoe, payouts, setIsCalculating]);

  return { calculate };
}
