import { describe, it, expect } from 'vitest';
import { calculateEV, calculateEVWithSignals } from '../../src/engine/ev';
import { runSimulation, toProbabilities } from '../../src/engine/probability';
import { createShoe } from '../../src/engine/shoe';
import { DEFAULT_PAYOUTS } from '../../src/engine/constants';

describe('EV Calculations', () => {
  const shoe = createShoe();
  const sim = runSimulation(shoe, 100_000);
  const probs = toProbabilities(sim);

  it('calculates EV for all bet types', () => {
    const ev = calculateEV(probs);

    // All EVs should be numbers
    expect(typeof ev.player).toBe('number');
    expect(typeof ev.banker).toBe('number');
    expect(typeof ev.tie).toBe('number');
    expect(typeof ev.playerPair).toBe('number');
    expect(typeof ev.bankerPair).toBe('number');
    expect(typeof ev.eitherPair).toBe('number');
    expect(typeof ev.playerDragon).toBe('number');
    expect(typeof ev.bankerDragon).toBe('number');
  });

  it('house edge is negative for player and banker on fresh shoe', () => {
    const ev = calculateEV(probs);

    // Player EV should be slightly negative (~-1.24%)
    expect(ev.player).toBeLessThan(0);
    expect(ev.player).toBeGreaterThan(-0.05);

    // Banker EV should be slightly negative (~-1.06%)
    expect(ev.banker).toBeLessThan(0);
    expect(ev.banker).toBeGreaterThan(-0.05);
  });

  it('tie bet has high negative EV', () => {
    const ev = calculateEV(probs);
    // Tie EV should be very negative (~-14.4%)
    expect(ev.tie).toBeLessThan(-0.05);
  });

  it('banker EV is better than player EV with theoretical probabilities', () => {
    // Use known theoretical probabilities (8-deck) to avoid MC variance
    const theoreticalProbs: Probabilities = {
      player: 0.44625,
      banker: 0.45860,
      tie: 0.09516,
      playerPair: 0.0747,
      bankerPair: 0.0747,
      eitherPair: 0.1438,
      playerDragonByMargin: {},
      bankerDragonByMargin: {},
    };
    const ev = calculateEV(theoreticalProbs);
    // Banker EV (~-1.06%) should be less negative than Player EV (~-1.24%)
    expect(ev.banker).toBeGreaterThan(ev.player);
    expect(ev.banker).toBeCloseTo(-0.01058, 2);
    expect(ev.player).toBeCloseTo(-0.01235, 2);
  });

  it('pair bets should exist', () => {
    const ev = calculateEV(probs);
    // For now just check they're calculated
    expect(typeof ev.playerPair).toBe('number');
    expect(typeof ev.bankerPair).toBe('number');
  });

  it('signals are generated correctly', () => {
    const result = calculateEVWithSignals(probs);

    expect(result.signals).toBeDefined();
    expect(['positive', 'negative', 'neutral']).toContain(result.signals.player);
    expect(['positive', 'negative', 'neutral']).toContain(result.signals.banker);
    expect(['positive', 'negative', 'neutral']).toContain(result.signals.tie);
  });

  it('bestBet is identified', () => {
    const result = calculateEVWithSignals(probs);
    expect(result.bestBet).toBeDefined();
    expect(typeof result.bestBet).toBe('string');
  });

  it('custom payouts change EV', () => {
    const customPayouts = {
      ...DEFAULT_PAYOUTS,
      tie: 9, // 9:1 instead of 8:1
    };
    const evDefault = calculateEV(probs);
    const evCustom = calculateEV(probs, customPayouts);

    // Tie EV should be better with 9:1
    expect(evCustom.tie).toBeGreaterThan(evDefault.tie);
  });

  it('handles zero probabilities gracefully', () => {
    const zeroProbs = {
      player: 0,
      banker: 0,
      tie: 0,
      playerPair: 0,
      bankerPair: 0,
      eitherPair: 0,
      playerDragonByMargin: {},
      bankerDragonByMargin: {},
    };

    const ev = calculateEV(zeroProbs);
    expect(ev.player).toBe(0);
    expect(ev.banker).toBe(0);
  });
});
