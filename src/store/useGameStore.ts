'use client';

import { create } from 'zustand';
import { ShoeState, createShoe, removeCard, addCard } from '../engine/shoe';
import {
  getNextPhase,
  InputPhase,
  playHand,
  PlayedHand,
  needsPlayerThird,
  needsBankerThird,
} from '../engine/baccarat-rules';
import { EVWithSignal } from '../engine/ev';
import { Probabilities } from '../engine/probability';
import { PayoutConfig, DEFAULT_PAYOUTS } from '../engine/constants';
import { CardInput, HandRecord, SessionRecord } from '../types';

interface GameState {
  // Session
  session: SessionRecord | null;
  sessionActive: boolean;

  // Shoe
  shoe: ShoeState;

  // Current hand input
  currentCards: CardInput;
  phase: InputPhase;
  cardHistory: { value: number; phase: InputPhase }[]; // for undo

  // Hands history
  hands: HandRecord[];
  handNumber: number;

  // EV / Probabilities
  probabilities: Probabilities | null;
  ev: EVWithSignal | null;
  isCalculating: boolean;

  // Settings
  payouts: PayoutConfig;

  // Actions
  startSession: () => void;
  endSession: () => void;
  inputCard: (value: number) => PlayedHand | null;
  undoLastCard: () => void;
  resetHand: () => void;
  resetShoe: () => void;
  setProbabilities: (probs: Probabilities) => void;
  setEV: (ev: EVWithSignal) => void;
  setIsCalculating: (calc: boolean) => void;
  setPayouts: (payouts: PayoutConfig) => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function saveToLocalStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable
  }
}

function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  session: null,
  sessionActive: false,
  shoe: createShoe(),
  currentCards: {},
  phase: 'P1',
  cardHistory: [],
  hands: [],
  handNumber: 0,
  probabilities: null,
  ev: null,
  isCalculating: false,
  payouts: DEFAULT_PAYOUTS,

  startSession: () => {
    const session: SessionRecord = {
      id: generateId(),
      startTime: Date.now(),
      hands: [],
    };
    set({
      session,
      sessionActive: true,
      shoe: createShoe(),
      hands: [],
      handNumber: 0,
      currentCards: {},
      phase: 'P1',
      cardHistory: [],
      probabilities: null,
      ev: null,
    });
    saveToLocalStorage('shoeshark_current_session', session);
  },

  endSession: () => {
    const state = get();
    if (state.session) {
      const ended = { ...state.session, endTime: Date.now(), hands: state.hands };
      // Save to sessions list
      const sessions = loadFromLocalStorage<SessionRecord[]>('shoeshark_sessions') || [];
      sessions.push(ended);
      saveToLocalStorage('shoeshark_sessions', sessions);
      saveToLocalStorage('shoeshark_current_session', null);
    }
    set({ session: null, sessionActive: false });
  },

  inputCard: (value: number) => {
    const state = get();
    const { currentCards, phase, shoe } = state;

    if (phase === 'COMPLETE') return null;

    // Remove card from shoe
    const newShoe = removeCard(shoe, value);
    const newCards = { ...currentCards };
    const newHistory = [...state.cardHistory, { value, phase }];

    switch (phase) {
      case 'P1': newCards.p1 = value; break;
      case 'B1': newCards.b1 = value; break;
      case 'P2': newCards.p2 = value; break;
      case 'B2': newCards.b2 = value; break;
      case 'P3': newCards.p3 = value; break;
      case 'B3': newCards.b3 = value; break;
    }

    const nextPhase = getNextPhase(newCards);

    // If complete, resolve hand
    if (nextPhase === 'COMPLETE') {
      const result = playHand(
        newCards.p1!, newCards.b1!, newCards.p2!, newCards.b2!,
        newCards.p3, newCards.b3
      );

      const handRecord: HandRecord = {
        id: generateId(),
        handNumber: state.handNumber + 1,
        cards: newCards,
        result,
        timestamp: Date.now(),
        ev: state.ev || undefined,
      };

      const newHands = [...state.hands, handRecord];

      // Save hand to localStorage
      if (state.session) {
        saveToLocalStorage(`shoeshark_hand_${handRecord.id}`, handRecord);
        const updatedSession = { ...state.session, hands: newHands };
        saveToLocalStorage('shoeshark_current_session', updatedSession);
      }

      set({
        shoe: newShoe,
        currentCards: {},
        phase: 'P1',
        cardHistory: [],
        hands: newHands,
        handNumber: state.handNumber + 1,
      });

      return result;
    }

    set({
      shoe: newShoe,
      currentCards: newCards,
      phase: nextPhase,
      cardHistory: newHistory,
    });

    return null;
  },

  undoLastCard: () => {
    const state = get();
    if (state.cardHistory.length === 0) return;

    const lastEntry = state.cardHistory[state.cardHistory.length - 1];
    const newShoe = addCard(state.shoe, lastEntry.value);
    const newCards = { ...state.currentCards };

    switch (lastEntry.phase) {
      case 'P1': delete newCards.p1; break;
      case 'B1': delete newCards.b1; break;
      case 'P2': delete newCards.p2; break;
      case 'B2': delete newCards.b2; break;
      case 'P3': delete newCards.p3; break;
      case 'B3': delete newCards.b3; break;
    }

    set({
      shoe: newShoe,
      currentCards: newCards,
      phase: lastEntry.phase,
      cardHistory: state.cardHistory.slice(0, -1),
    });
  },

  resetHand: () => {
    const state = get();
    // Return all current cards to shoe
    let shoe = state.shoe;
    for (const entry of [...state.cardHistory].reverse()) {
      shoe = addCard(shoe, entry.value);
    }
    set({
      shoe,
      currentCards: {},
      phase: 'P1',
      cardHistory: [],
    });
  },

  resetShoe: () => {
    set({
      shoe: createShoe(),
      currentCards: {},
      phase: 'P1',
      cardHistory: [],
      hands: [],
      handNumber: 0,
      probabilities: null,
      ev: null,
    });
  },

  setProbabilities: (probs) => set({ probabilities: probs }),
  setEV: (ev) => set({ ev }),
  setIsCalculating: (calc) => set({ isCalculating: calc }),
  setPayouts: (payouts) => {
    set({ payouts });
    saveToLocalStorage('shoeshark_payouts', payouts);
  },
}));
