// Monte Carlo probability engine for baccarat

import { ShoeState, drawRandomCard } from './shoe';
import {
  isNatural,
  playerShouldDraw,
  bankerShouldDraw,
  handTotal,
  determineResult,
  HandResult,
} from './baccarat-rules';
import { MONTE_CARLO_ITERATIONS } from './constants';

export interface SimulationResult {
  playerWin: number;
  bankerWin: number;
  tie: number;
  playerPair: number;
  bankerPair: number;
  eitherPair: number;
  // Dragon bonus margins (for player and banker)
  playerDragonMargins: Record<number, number>; // margin -> count
  bankerDragonMargins: Record<number, number>;
  playerNaturalWin: number;
  bankerNaturalWin: number;
  iterations: number;
}

/**
 * Simulate a single hand from the current shoe state.
 * Returns the result and relevant outcomes.
 */
function simulateHand(shoe: ShoeState): {
  result: HandResult;
  playerPair: boolean;
  bankerPair: boolean;
  playerTotal: number;
  bankerTotal: number;
  isNatural: boolean;
  margin: number;
} {
  let s = shoe;

  // Deal P1, B1, P2, B2
  const d1 = drawRandomCard(s); s = d1.newShoe;
  const d2 = drawRandomCard(s); s = d2.newShoe;
  const d3 = drawRandomCard(s); s = d3.newShoe;
  const d4 = drawRandomCard(s); s = d4.newShoe;

  const p1 = d1.value, b1 = d2.value, p2 = d3.value, b2 = d4.value;
  const playerCards = [p1, p2];
  const bankerCards = [b1, b2];

  const playerPair = p1 === p2;
  const bankerPair = b1 === b2;

  // Check naturals
  if (isNatural(playerCards) || isNatural(bankerCards)) {
    const pt = handTotal(playerCards);
    const bt = handTotal(bankerCards);
    return {
      result: determineResult(pt, bt),
      playerPair,
      bankerPair,
      playerTotal: pt,
      bankerTotal: bt,
      isNatural: true,
      margin: Math.abs(pt - bt),
    };
  }

  let playerThirdCard: number | null = null;

  // Player draw
  if (playerShouldDraw(playerCards)) {
    const d5 = drawRandomCard(s); s = d5.newShoe;
    playerThirdCard = d5.value;
    playerCards.push(playerThirdCard);
  }

  // Banker draw
  if (bankerShouldDraw(bankerCards, playerThirdCard)) {
    const d6 = drawRandomCard(s); s = d6.newShoe;
    bankerCards.push(d6.value);
  }

  const pt = handTotal(playerCards);
  const bt = handTotal(bankerCards);

  return {
    result: determineResult(pt, bt),
    playerPair,
    bankerPair,
    playerTotal: pt,
    bankerTotal: bt,
    isNatural: false,
    margin: Math.abs(pt - bt),
  };
}

/**
 * Run Monte Carlo simulation on the current shoe state.
 */
export function runSimulation(
  shoe: ShoeState,
  iterations: number = MONTE_CARLO_ITERATIONS
): SimulationResult {
  let playerWin = 0;
  let bankerWin = 0;
  let tie = 0;
  let playerPair = 0;
  let bankerPair = 0;
  let eitherPair = 0;
  let playerNaturalWin = 0;
  let bankerNaturalWin = 0;
  const playerDragonMargins: Record<number, number> = {};
  const bankerDragonMargins: Record<number, number> = {};

  // Init margin counters
  for (let m = 0; m <= 9; m++) {
    playerDragonMargins[m] = 0;
    bankerDragonMargins[m] = 0;
  }

  // Need at least 4 cards to simulate
  if (shoe.totalRemaining < 4) {
    return {
      playerWin: 0,
      bankerWin: 0,
      tie: 0,
      playerPair: 0,
      bankerPair: 0,
      eitherPair: 0,
      playerDragonMargins,
      bankerDragonMargins,
      playerNaturalWin: 0,
      bankerNaturalWin: 0,
      iterations: 0,
    };
  }

  for (let i = 0; i < iterations; i++) {
    const result = simulateHand(shoe);

    if (result.result === 'player') {
      playerWin++;
      playerDragonMargins[result.margin] = (playerDragonMargins[result.margin] || 0) + 1;
      if (result.isNatural) playerNaturalWin++;
    } else if (result.result === 'banker') {
      bankerWin++;
      bankerDragonMargins[result.margin] = (bankerDragonMargins[result.margin] || 0) + 1;
      if (result.isNatural) bankerNaturalWin++;
    } else {
      tie++;
    }

    if (result.playerPair) playerPair++;
    if (result.bankerPair) bankerPair++;
    if (result.playerPair || result.bankerPair) eitherPair++;
  }

  return {
    playerWin,
    bankerWin,
    tie,
    playerPair,
    bankerPair,
    eitherPair,
    playerDragonMargins,
    bankerDragonMargins,
    playerNaturalWin,
    bankerNaturalWin,
    iterations,
  };
}

/**
 * Convert simulation counts to probabilities.
 */
export interface Probabilities {
  player: number;
  banker: number;
  tie: number;
  playerPair: number;
  bankerPair: number;
  eitherPair: number;
  playerDragonByMargin: Record<number, number>;
  bankerDragonByMargin: Record<number, number>;
}

export function toProbabilities(sim: SimulationResult): Probabilities {
  const n = sim.iterations;
  if (n === 0) {
    return {
      player: 0, banker: 0, tie: 0,
      playerPair: 0, bankerPair: 0, eitherPair: 0,
      playerDragonByMargin: {},
      bankerDragonByMargin: {},
    };
  }

  const playerDragonByMargin: Record<number, number> = {};
  const bankerDragonByMargin: Record<number, number> = {};

  for (const [m, count] of Object.entries(sim.playerDragonMargins)) {
    playerDragonByMargin[Number(m)] = count / n;
  }
  for (const [m, count] of Object.entries(sim.bankerDragonMargins)) {
    bankerDragonByMargin[Number(m)] = count / n;
  }

  return {
    player: sim.playerWin / n,
    banker: sim.bankerWin / n,
    tie: sim.tie / n,
    playerPair: sim.playerPair / n,
    bankerPair: sim.bankerPair / n,
    eitherPair: sim.eitherPair / n,
    playerDragonByMargin,
    bankerDragonByMargin,
  };
}
