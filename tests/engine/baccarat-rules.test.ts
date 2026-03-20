import { describe, it, expect } from 'vitest';
import {
  handTotal,
  isNatural,
  playerShouldDraw,
  bankerShouldDraw,
  playHand,
  getNextPhase,
  determineResult,
  needsPlayerThird,
  needsBankerThird,
} from '../../src/engine/baccarat-rules';

describe('Baccarat Rules', () => {
  describe('handTotal', () => {
    it('calculates hand total mod 10', () => {
      expect(handTotal([5, 3])).toBe(8);
      expect(handTotal([7, 6])).toBe(3); // 13 mod 10
      expect(handTotal([0, 0])).toBe(0); // 10+10 = 20 mod 10
      expect(handTotal([9, 9])).toBe(8); // 18 mod 10
      expect(handTotal([1, 2, 3])).toBe(6);
    });
  });

  describe('isNatural', () => {
    it('detects natural 8', () => {
      expect(isNatural([5, 3])).toBe(true);
      expect(isNatural([0, 8])).toBe(true);
    });

    it('detects natural 9', () => {
      expect(isNatural([4, 5])).toBe(true);
      expect(isNatural([9, 0])).toBe(true);
    });

    it('rejects non-naturals', () => {
      expect(isNatural([3, 4])).toBe(false); // 7
      expect(isNatural([1, 2])).toBe(false); // 3
    });

    it('requires exactly 2 cards', () => {
      expect(isNatural([2, 3, 4])).toBe(false);
      expect(isNatural([9])).toBe(false);
    });
  });

  describe('playerShouldDraw', () => {
    it('draws on 0-5', () => {
      expect(playerShouldDraw([0, 0])).toBe(true); // 0
      expect(playerShouldDraw([1, 1])).toBe(true); // 2
      expect(playerShouldDraw([2, 3])).toBe(true); // 5
    });

    it('stands on 6-7', () => {
      expect(playerShouldDraw([3, 3])).toBe(false); // 6
      expect(playerShouldDraw([3, 4])).toBe(false); // 7
    });
  });

  describe('bankerShouldDraw', () => {
    it('draws on 0-2 regardless of player third card', () => {
      for (let p3 = 0; p3 <= 9; p3++) {
        expect(bankerShouldDraw([0, 0], p3)).toBe(true); // 0
        expect(bankerShouldDraw([1, 0], p3)).toBe(true); // 1
        expect(bankerShouldDraw([1, 1], p3)).toBe(true); // 2
      }
    });

    it('banker 3: draws except when player 3rd is 8', () => {
      expect(bankerShouldDraw([1, 2], 0)).toBe(true);
      expect(bankerShouldDraw([1, 2], 7)).toBe(true);
      expect(bankerShouldDraw([1, 2], 8)).toBe(false); // Only exception
      expect(bankerShouldDraw([1, 2], 9)).toBe(true);
    });

    it('banker 4: draws on player 3rd 2-7', () => {
      expect(bankerShouldDraw([2, 2], 0)).toBe(false);
      expect(bankerShouldDraw([2, 2], 1)).toBe(false);
      expect(bankerShouldDraw([2, 2], 2)).toBe(true);
      expect(bankerShouldDraw([2, 2], 7)).toBe(true);
      expect(bankerShouldDraw([2, 2], 8)).toBe(false);
      expect(bankerShouldDraw([2, 2], 9)).toBe(false);
    });

    it('banker 5: draws on player 3rd 4-7', () => {
      expect(bankerShouldDraw([2, 3], 3)).toBe(false);
      expect(bankerShouldDraw([2, 3], 4)).toBe(true);
      expect(bankerShouldDraw([2, 3], 7)).toBe(true);
      expect(bankerShouldDraw([2, 3], 8)).toBe(false);
    });

    it('banker 6: draws on player 3rd 6-7', () => {
      expect(bankerShouldDraw([3, 3], 5)).toBe(false);
      expect(bankerShouldDraw([3, 3], 6)).toBe(true);
      expect(bankerShouldDraw([3, 3], 7)).toBe(true);
      expect(bankerShouldDraw([3, 3], 8)).toBe(false);
    });

    it('banker 7: always stands', () => {
      for (let p3 = 0; p3 <= 9; p3++) {
        expect(bankerShouldDraw([3, 4], p3)).toBe(false);
      }
    });

    it('when player stands (null), banker draws on 0-5', () => {
      expect(bankerShouldDraw([0, 0], null)).toBe(true); // 0
      expect(bankerShouldDraw([2, 3], null)).toBe(true); // 5
      expect(bankerShouldDraw([3, 3], null)).toBe(false); // 6
      expect(bankerShouldDraw([3, 4], null)).toBe(false); // 7
    });
  });

  describe('playHand', () => {
    it('resolves natural 9 vs 5 as player win', () => {
      // P: 4+5=9, B: 2+3=5
      const result = playHand(4, 2, 5, 3);
      expect(result.isNatural).toBe(true);
      expect(result.playerTotal).toBe(9);
      expect(result.bankerTotal).toBe(5);
      expect(result.result).toBe('player');
      expect(result.playerCards).toEqual([4, 5]);
      expect(result.bankerCards).toEqual([2, 3]);
    });

    it('resolves natural 8 vs 8 as tie', () => {
      const result = playHand(3, 0, 5, 8);
      expect(result.isNatural).toBe(true);
      expect(result.result).toBe('tie');
    });

    it('player draws third card on 5', () => {
      // P: 2+3=5 (draws), B: 3+4=7 (stands)
      const result = playHand(2, 3, 3, 4, 6); // P3=6, P total = 2+3+6=11 mod 10 = 1
      expect(result.playerCards).toEqual([2, 3, 6]);
      expect(result.playerTotal).toBe(1);
      expect(result.bankerTotal).toBe(7);
      expect(result.result).toBe('banker');
    });

    it('both draw third cards', () => {
      // P: 1+2=3 (draws), B: 2+1=3 (depends on P3)
      // P3=4 → banker has 3, P3=4 → banker draws on 3 (p3≠8)
      const result = playHand(1, 2, 2, 1, 4, 5);
      expect(result.playerCards).toEqual([1, 2, 4]);
      expect(result.bankerCards).toEqual([2, 1, 5]);
      expect(result.playerTotal).toBe(7);
      expect(result.bankerTotal).toBe(8);
      expect(result.result).toBe('banker');
    });

    it('detects player pair', () => {
      const result = playHand(5, 2, 5, 7);
      expect(result.playerPair).toBe(true);
      expect(result.bankerPair).toBe(false);
    });

    it('detects banker pair', () => {
      const result = playHand(3, 4, 6, 4);
      expect(result.playerPair).toBe(false);
      expect(result.bankerPair).toBe(true);
    });

    it('calculates margin correctly', () => {
      const result = playHand(4, 1, 5, 2);
      // P=9, B=3, natural, margin = 6
      expect(result.margin).toBe(6);
    });
  });

  describe('getNextPhase', () => {
    it('follows P1 → B1 → P2 → B2 flow', () => {
      expect(getNextPhase({})).toBe('P1');
      expect(getNextPhase({ p1: 5 })).toBe('B1');
      expect(getNextPhase({ p1: 5, b1: 3 })).toBe('P2');
      expect(getNextPhase({ p1: 5, b1: 3, p2: 4 })).toBe('B2');
    });

    it('completes on natural', () => {
      // P: 5+4=9 natural
      expect(getNextPhase({ p1: 5, b1: 2, p2: 4, b2: 3 })).toBe('COMPLETE');
    });

    it('asks for P3 when player needs to draw', () => {
      // P: 2+3=5 (draws), B: 3+4=7 (stands)
      expect(getNextPhase({ p1: 2, b1: 3, p2: 3, b2: 4 })).toBe('P3');
    });

    it('asks for B3 when banker needs to draw', () => {
      // P: 2+3=5 (draws), P3=6 → B: 3+0=3 (draws on p3≠8)
      expect(getNextPhase({ p1: 2, b1: 3, p2: 3, b2: 0, p3: 6 })).toBe('B3');
    });

    it('completes when no more draws needed', () => {
      // P: 3+4=7 (stands), B: 3+3=6 (stands when player stands on 6+)
      expect(getNextPhase({ p1: 3, b1: 3, p2: 4, b2: 3 })).toBe('COMPLETE');
    });
  });

  describe('determineResult', () => {
    it('player wins', () => expect(determineResult(9, 3)).toBe('player'));
    it('banker wins', () => expect(determineResult(2, 7)).toBe('banker'));
    it('tie', () => expect(determineResult(5, 5)).toBe('tie'));
  });

  describe('needsPlayerThird', () => {
    it('false on natural', () => {
      expect(needsPlayerThird(5, 4, 2, 3)).toBe(false); // P=9
    });
    it('true on player total ≤ 5', () => {
      expect(needsPlayerThird(1, 3, 2, 4)).toBe(true); // P=3
    });
    it('false on player 6-7', () => {
      expect(needsPlayerThird(3, 3, 2, 1)).toBe(false); // P=6
    });
  });

  describe('needsBankerThird', () => {
    it('false on natural', () => {
      expect(needsBankerThird(5, 4, 2, 3, null)).toBe(false);
    });
  });
});
