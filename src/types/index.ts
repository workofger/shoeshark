// ShoeShark type definitions

import { ShoeState } from '../engine/shoe';
import { PlayedHand, InputPhase } from '../engine/baccarat-rules';
import { EVWithSignal } from '../engine/ev';
import { Probabilities } from '../engine/probability';
import { PayoutConfig } from '../engine/constants';

export type { ShoeState, PlayedHand, InputPhase, EVWithSignal, Probabilities, PayoutConfig };

export interface CardInput {
  p1?: number;
  b1?: number;
  p2?: number;
  b2?: number;
  p3?: number;
  b3?: number;
}

export interface HandRecord {
  id: string;
  handNumber: number;
  cards: CardInput;
  result: PlayedHand;
  timestamp: number;
  ev?: EVWithSignal;
}

export interface SessionRecord {
  id: string;
  startTime: number;
  endTime?: number;
  hands: HandRecord[];
  shoeName?: string;
  notes?: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'hand' | 'session';
  data: HandRecord | SessionRecord;
  timestamp: number;
  retries: number;
  sessionId: string;
}

// Worker messages
export interface CalcRequest {
  type: 'calculate';
  shoe: ShoeState;
  payouts?: PayoutConfig;
}

export interface CalcResponse {
  type: 'result';
  probabilities: Probabilities;
  ev: EVWithSignal;
  duration: number;
}

export type WorkerMessage = CalcRequest;
export type WorkerResponse = CalcResponse;
