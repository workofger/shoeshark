// ShoeShark Engine Constants

export const DECK_COUNT = 8;
export const CARDS_PER_DECK = 52;
export const TOTAL_CARDS = DECK_COUNT * CARDS_PER_DECK; // 416

// Card value distribution in 8 decks
// Value 0 represents 10, J, Q, K (4 ranks × 4 suits × 8 decks = 128)
// Values 1-9 each represent 1 rank × 4 suits × 8 decks = 32
export const INITIAL_COUNTS: Record<number, number> = {
  0: 128, // 10, J, Q, K
  1: 32,  // Ace
  2: 32,
  3: 32,
  4: 32,
  5: 32,
  6: 32,
  7: 32,
  8: 32,
  9: 32,
};

// Monte Carlo settings
export const MONTE_CARLO_ITERATIONS = 50_000;
export const MONTE_CARLO_PRECISION = 0.002; // ±0.2%

// Payouts (default, configurable)
export interface PayoutConfig {
  player: number;
  banker: number;
  tie: number;
  playerPair: number;
  bankerPair: number;
  eitherPair: number;
  dragonBonus: Record<number, number>; // margin -> payout
}

export const DEFAULT_PAYOUTS: PayoutConfig = {
  player: 1,        // 1:1
  banker: 0.95,     // 0.95:1 (5% commission)
  tie: 8,           // 8:1
  playerPair: 11,   // 11:1
  bankerPair: 11,   // 11:1
  eitherPair: 5,    // 5:1
  dragonBonus: {
    // Natural win
    9: 30,  // Natural 9 over non-natural
    8: 10,  // Natural 8 over non-natural
    // Non-natural win by margin
    7: 6,
    6: 4,
    5: 2,
    4: 1,
    // Margin 1-3 on dragon bonus = push (0)
    3: 0,
    2: 0,
    1: 0,
    // Natural tie = push
    0: 0,
  },
};

// Card values for display
export const CARD_LABELS = ['0', 'A', '2', '3', '4', '5', '6', '7', '8', '9'];
export const CARD_DISPLAY = ['10/J/Q/K', 'A', '2', '3', '4', '5', '6', '7', '8', '9'];
