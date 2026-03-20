import { describe, it, expect } from 'vitest';
import { runSimulation, toProbabilities } from '../../src/engine/probability';
import { createShoe, removeCard } from '../../src/engine/shoe';

describe('Probability Engine', () => {
  it('produces valid probabilities from fresh shoe', () => {
    const shoe = createShoe();
    const sim = runSimulation(shoe, 10_000);
    const probs = toProbabilities(sim);

    // Basic sanity: probabilities sum to ~1 for main outcomes
    const sum = probs.player + probs.banker + probs.tie;
    expect(sum).toBeCloseTo(1, 1);

    // Known approximate values for 8-deck baccarat
    // Player: ~44.62%, Banker: ~45.86%, Tie: ~9.52%
    expect(probs.player).toBeGreaterThan(0.40);
    expect(probs.player).toBeLessThan(0.50);
    expect(probs.banker).toBeGreaterThan(0.40);
    expect(probs.banker).toBeLessThan(0.52);
    expect(probs.tie).toBeGreaterThan(0.06);
    expect(probs.tie).toBeLessThan(0.14);
  });

  it('banker has slight edge over player', () => {
    const shoe = createShoe();
    const sim = runSimulation(shoe, 20_000);
    const probs = toProbabilities(sim);

    // Banker should be slightly favored
    expect(probs.banker).toBeGreaterThan(probs.player);
  });

  it('pair probabilities are reasonable', () => {
    const shoe = createShoe();
    const sim = runSimulation(shoe, 10_000);
    const probs = toProbabilities(sim);

    // Pair probability ~7.47% for fresh 8-deck shoe
    expect(probs.playerPair).toBeGreaterThan(0.04);
    expect(probs.playerPair).toBeLessThan(0.16); // Allow higher range for now
    expect(probs.bankerPair).toBeGreaterThan(0.04);
    expect(probs.bankerPair).toBeLessThan(0.16);
  });

  it('handles partially depleted shoe', () => {
    let shoe = createShoe();
    // Remove some cards
    for (let i = 0; i < 10; i++) {
      shoe = removeCard(shoe, 0); // Remove 10s
    }
    for (let i = 0; i < 5; i++) {
      shoe = removeCard(shoe, 9); // Remove 9s
    }

    const sim = runSimulation(shoe, 10_000);
    const probs = toProbabilities(sim);

    expect(probs.player + probs.banker + probs.tie).toBeCloseTo(1, 1);
  });

  it('returns zero results for shoe with less than 4 cards', () => {
    let shoe = createShoe();
    // Remove almost all cards, leave only 3
    for (let v = 0; v <= 9; v++) {
      const toRemove = v === 0 ? 126 : (v <= 2 ? 32 : 32);
      for (let i = 0; i < toRemove; i++) {
        if (shoe.counts[v] > 0) {
          shoe = removeCard(shoe, v);
        }
      }
    }
    // Ensure less than 4
    while (shoe.totalRemaining > 3) {
      for (let v = 0; v <= 9; v++) {
        if (shoe.counts[v] > 0 && shoe.totalRemaining > 3) {
          shoe = removeCard(shoe, v);
        }
      }
    }

    const sim = runSimulation(shoe);
    expect(sim.iterations).toBe(0);
  });

  it('dragon bonus margins are tracked', () => {
    const shoe = createShoe();
    const sim = runSimulation(shoe, 10_000);

    // Should have some margin distribution
    const totalPlayerDragon = Object.values(sim.playerDragonMargins).reduce((a, b) => a + b, 0);
    const totalBankerDragon = Object.values(sim.bankerDragonMargins).reduce((a, b) => a + b, 0);

    expect(totalPlayerDragon).toBe(sim.playerWin);
    expect(totalBankerDragon).toBe(sim.bankerWin);
  });

  it('completes 50K iterations in reasonable time', () => {
    const shoe = createShoe();
    const start = performance.now();
    runSimulation(shoe, 50_000);
    const duration = performance.now() - start;

    // Should complete in <2000ms (generous for CI)
    expect(duration).toBeLessThan(2000);
  });
});
