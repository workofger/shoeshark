// Shoe state management — tracks remaining cards

import { INITIAL_COUNTS, TOTAL_CARDS } from './constants';

export interface ShoeState {
  counts: Record<number, number>; // value -> remaining count
  totalRemaining: number;
}

export function createShoe(): ShoeState {
  return {
    counts: { ...INITIAL_COUNTS },
    totalRemaining: TOTAL_CARDS,
  };
}

export function removeCard(shoe: ShoeState, value: number): ShoeState {
  if (value < 0 || value > 9) throw new Error(`Invalid card value: ${value}`);
  if (shoe.counts[value] <= 0) throw new Error(`No cards of value ${value} remaining`);

  const newCounts = { ...shoe.counts };
  newCounts[value]--;

  return {
    counts: newCounts,
    totalRemaining: shoe.totalRemaining - 1,
  };
}

export function addCard(shoe: ShoeState, value: number): ShoeState {
  if (value < 0 || value > 9) throw new Error(`Invalid card value: ${value}`);
  if (shoe.counts[value] >= INITIAL_COUNTS[value]) {
    throw new Error(`Cannot add more cards of value ${value}`);
  }

  const newCounts = { ...shoe.counts };
  newCounts[value]++;

  return {
    counts: newCounts,
    totalRemaining: shoe.totalRemaining + 1,
  };
}

export function getCardProbability(shoe: ShoeState, value: number): number {
  if (shoe.totalRemaining === 0) return 0;
  return shoe.counts[value] / shoe.totalRemaining;
}

export function drawRandomCard(shoe: ShoeState): { value: number; newShoe: ShoeState } {
  if (shoe.totalRemaining === 0) throw new Error('Shoe is empty');

  const rand = Math.random() * shoe.totalRemaining;
  let cumulative = 0;

  for (let v = 0; v <= 9; v++) {
    cumulative += shoe.counts[v];
    if (rand < cumulative) {
      return { value: v, newShoe: removeCard(shoe, v) };
    }
  }

  // Fallback (shouldn't reach here)
  for (let v = 9; v >= 0; v--) {
    if (shoe.counts[v] > 0) {
      return { value: v, newShoe: removeCard(shoe, v) };
    }
  }

  throw new Error('Shoe is empty');
}

export function shoeProgress(shoe: ShoeState): number {
  return 1 - shoe.totalRemaining / TOTAL_CARDS;
}

export function getRemainingByValue(shoe: ShoeState): { value: number; count: number; percentage: number }[] {
  return Array.from({ length: 10 }, (_, v) => ({
    value: v,
    count: shoe.counts[v],
    percentage: shoe.totalRemaining > 0 ? shoe.counts[v] / shoe.totalRemaining : 0,
  }));
}
