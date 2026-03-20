// Web Worker for non-blocking Monte Carlo calculation

import { runSimulation, toProbabilities } from '../engine/probability';
import { calculateEVWithSignals } from '../engine/ev';
import type { WorkerMessage, WorkerResponse } from '../types';
import type { ShoeState } from '../engine/shoe';
import type { PayoutConfig } from '../engine/constants';

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  if (msg.type === 'calculate') {
    const start = performance.now();
    const sim = runSimulation(msg.shoe);
    const probs = toProbabilities(sim);
    const ev = calculateEVWithSignals(probs, msg.payouts);
    const duration = performance.now() - start;

    const response: WorkerResponse = {
      type: 'result',
      probabilities: probs,
      ev,
      duration,
    };

    self.postMessage(response);
  }
};
