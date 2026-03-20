// Expected Value calculations for all bet types

import { Probabilities } from './probability';
import { PayoutConfig, DEFAULT_PAYOUTS } from './constants';

export interface EVResult {
  player: number;
  banker: number;
  tie: number;
  playerPair: number;
  bankerPair: number;
  eitherPair: number;
  playerDragon: number;
  bankerDragon: number;
}

export interface EVWithSignal extends EVResult {
  bestBet: string;
  signals: Record<string, 'positive' | 'negative' | 'neutral'>;
}

/**
 * Calculate EV for each bet type.
 * EV = sum(probability × payout) - probability_of_loss
 * 
 * For Player bet: EV = P(win) × 1 + P(tie) × 0 - P(lose)
 * For Banker bet: EV = P(win) × 0.95 + P(tie) × 0 - P(lose)
 * For Tie bet: EV = P(tie) × 8 - P(not_tie)
 * etc.
 */
export function calculateEV(
  probs: Probabilities,
  payouts: PayoutConfig = DEFAULT_PAYOUTS
): EVResult {
  // Player: win pays 1:1, tie is push, lose costs 1
  const playerEV = probs.player * payouts.player + probs.tie * 0 - probs.banker;

  // Banker: win pays 0.95:1, tie is push, lose costs 1
  const bankerEV = probs.banker * payouts.banker + probs.tie * 0 - probs.player;

  // Tie: win pays 8:1, lose costs 1
  const tieEV = probs.tie * payouts.tie - (1 - probs.tie);

  // Player Pair: win pays 11:1, lose costs 1
  const playerPairEV = probs.playerPair * payouts.playerPair - (1 - probs.playerPair);

  // Banker Pair: win pays 11:1, lose costs 1
  const bankerPairEV = probs.bankerPair * payouts.bankerPair - (1 - probs.bankerPair);

  // Either Pair: win pays 5:1, lose costs 1
  const eitherPairEV = probs.eitherPair * payouts.eitherPair - (1 - probs.eitherPair);

  // Dragon Bonus (Player side)
  // Wins with natural win or non-natural win by 4+
  // Pays based on margin, loses on any banker win or player win by 1-3
  let playerDragonEV = 0;
  for (const [margin, prob] of Object.entries(probs.playerDragonByMargin)) {
    const m = Number(margin);
    const payout = payouts.dragonBonus[m] || 0;
    playerDragonEV += prob * payout;
  }
  // Subtract probability of losing (banker wins)
  playerDragonEV -= probs.banker;
  // Ties are push on dragon bonus
  // Player wins by 1-3 are push (payout = 0, already handled above)

  // Dragon Bonus (Banker side)
  let bankerDragonEV = 0;
  for (const [margin, prob] of Object.entries(probs.bankerDragonByMargin)) {
    const m = Number(margin);
    const payout = payouts.dragonBonus[m] || 0;
    bankerDragonEV += prob * payout;
  }
  bankerDragonEV -= probs.player;

  return {
    player: playerEV,
    banker: bankerEV,
    tie: tieEV,
    playerPair: playerPairEV,
    bankerPair: bankerPairEV,
    eitherPair: eitherPairEV,
    playerDragon: playerDragonEV,
    bankerDragon: bankerDragonEV,
  };
}

/**
 * Add traffic light signals and best bet recommendation.
 */
export function calculateEVWithSignals(
  probs: Probabilities,
  payouts: PayoutConfig = DEFAULT_PAYOUTS
): EVWithSignal {
  const ev = calculateEV(probs, payouts);

  const threshold = 0.01; // 1% threshold for signal

  const getSignal = (value: number): 'positive' | 'negative' | 'neutral' => {
    if (value > threshold) return 'positive';
    if (value < -threshold) return 'negative';
    return 'neutral';
  };

  const signals: Record<string, 'positive' | 'negative' | 'neutral'> = {
    player: getSignal(ev.player),
    banker: getSignal(ev.banker),
    tie: getSignal(ev.tie),
    playerPair: getSignal(ev.playerPair),
    bankerPair: getSignal(ev.bankerPair),
    eitherPair: getSignal(ev.eitherPair),
    playerDragon: getSignal(ev.playerDragon),
    bankerDragon: getSignal(ev.bankerDragon),
  };

  // Find best bet (highest EV)
  const evEntries = Object.entries(ev) as [string, number][];
  const best = evEntries.reduce((a, b) => (b[1] > a[1] ? b : a));

  return {
    ...ev,
    bestBet: best[0],
    signals,
  };
}
