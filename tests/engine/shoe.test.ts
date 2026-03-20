import { describe, it, expect } from 'vitest';
import { createShoe, removeCard, addCard, getCardProbability, drawRandomCard, shoeProgress, getRemainingByValue } from '../../src/engine/shoe';
import { TOTAL_CARDS, INITIAL_COUNTS } from '../../src/engine/constants';

describe('Shoe', () => {
  it('creates a fresh shoe with 416 cards', () => {
    const shoe = createShoe();
    expect(shoe.totalRemaining).toBe(416);
    expect(shoe.counts[0]).toBe(128); // 10/J/Q/K
    for (let v = 1; v <= 9; v++) {
      expect(shoe.counts[v]).toBe(32);
    }
    // Verify total adds up
    const sum = Object.values(shoe.counts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(416);
  });

  it('removes a card correctly', () => {
    const shoe = createShoe();
    const newShoe = removeCard(shoe, 5);
    expect(newShoe.counts[5]).toBe(31);
    expect(newShoe.totalRemaining).toBe(415);
    // Original unchanged
    expect(shoe.counts[5]).toBe(32);
  });

  it('throws on invalid card value', () => {
    const shoe = createShoe();
    expect(() => removeCard(shoe, -1)).toThrow('Invalid card value');
    expect(() => removeCard(shoe, 10)).toThrow('Invalid card value');
  });

  it('throws when removing depleted card', () => {
    let shoe = createShoe();
    // Remove all 32 cards of value 1
    for (let i = 0; i < 32; i++) {
      shoe = removeCard(shoe, 1);
    }
    expect(shoe.counts[1]).toBe(0);
    expect(() => removeCard(shoe, 1)).toThrow('No cards of value 1 remaining');
  });

  it('adds a card back correctly', () => {
    const shoe = createShoe();
    const after = removeCard(shoe, 3);
    const restored = addCard(after, 3);
    expect(restored.counts[3]).toBe(32);
    expect(restored.totalRemaining).toBe(416);
  });

  it('throws when adding too many cards', () => {
    const shoe = createShoe();
    expect(() => addCard(shoe, 5)).toThrow('Cannot add more cards of value 5');
  });

  it('calculates card probability correctly', () => {
    const shoe = createShoe();
    // P(value=0) = 128/416 ≈ 0.3077
    expect(getCardProbability(shoe, 0)).toBeCloseTo(128 / 416, 4);
    // P(value=5) = 32/416 ≈ 0.0769
    expect(getCardProbability(shoe, 5)).toBeCloseTo(32 / 416, 4);
  });

  it('draws a random card and updates shoe', () => {
    const shoe = createShoe();
    const { value, newShoe } = drawRandomCard(shoe);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(9);
    expect(newShoe.totalRemaining).toBe(415);
    expect(newShoe.counts[value]).toBe(shoe.counts[value] - 1);
  });

  it('throws when drawing from empty shoe', () => {
    let shoe = createShoe();
    // Remove all cards
    for (let v = 0; v <= 9; v++) {
      for (let i = 0; i < INITIAL_COUNTS[v]; i++) {
        shoe = removeCard(shoe, v);
      }
    }
    expect(shoe.totalRemaining).toBe(0);
    expect(() => drawRandomCard(shoe)).toThrow('Shoe is empty');
  });

  it('calculates shoe progress', () => {
    const shoe = createShoe();
    expect(shoeProgress(shoe)).toBe(0);
    const after = removeCard(shoe, 1);
    expect(shoeProgress(after)).toBeCloseTo(1 / 416, 4);
  });

  it('returns remaining by value breakdown', () => {
    const shoe = createShoe();
    const breakdown = getRemainingByValue(shoe);
    expect(breakdown).toHaveLength(10);
    expect(breakdown[0].value).toBe(0);
    expect(breakdown[0].count).toBe(128);
    expect(breakdown[0].percentage).toBeCloseTo(128 / 416, 4);
  });
});
