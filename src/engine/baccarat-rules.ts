// Baccarat drawing rules — standard tableau

export type HandResult = 'player' | 'banker' | 'tie';

export interface HandCards {
  player: number[];  // card values (0-9)
  banker: number[];  // card values (0-9)
}

export function cardValue(card: number): number {
  return card % 10;
}

export function handTotal(cards: number[]): number {
  return cards.reduce((sum, c) => sum + cardValue(c), 0) % 10;
}

export function isNatural(cards: number[]): boolean {
  if (cards.length !== 2) return false;
  const total = handTotal(cards);
  return total === 8 || total === 9;
}

/**
 * Determines if the player should draw a third card.
 * Player draws on 0-5, stands on 6-7.
 * Naturals (8-9) are handled before this is called.
 */
export function playerShouldDraw(playerCards: number[]): boolean {
  const total = handTotal(playerCards);
  return total <= 5;
}

/**
 * Determines if the banker should draw a third card.
 * Depends on banker's total and player's third card (if drawn).
 * Standard baccarat tableau.
 */
export function bankerShouldDraw(
  bankerCards: number[],
  playerThirdCard: number | null
): boolean {
  const bankerTotal = handTotal(bankerCards);

  // If player didn't draw, banker draws on 0-5, stands on 6-7
  if (playerThirdCard === null) {
    return bankerTotal <= 5;
  }

  const p3 = cardValue(playerThirdCard);

  switch (bankerTotal) {
    case 0:
    case 1:
    case 2:
      return true; // Always draws
    case 3:
      return p3 !== 8; // Draws unless player's 3rd is 8
    case 4:
      return p3 >= 2 && p3 <= 7; // Draws on 2-7
    case 5:
      return p3 >= 4 && p3 <= 7; // Draws on 4-7
    case 6:
      return p3 === 6 || p3 === 7; // Draws on 6-7
    case 7:
      return false; // Always stands
    default:
      return false; // 8-9 are naturals, shouldn't reach here
  }
}

/**
 * Plays a complete hand given the dealt cards.
 * Returns the final hand with all cards and result.
 */
export interface PlayedHand {
  playerCards: number[];
  bankerCards: number[];
  playerTotal: number;
  bankerTotal: number;
  result: HandResult;
  isNatural: boolean;
  playerPair: boolean;
  bankerPair: boolean;
  margin: number; // absolute difference
}

export function determineResult(playerTotal: number, bankerTotal: number): HandResult {
  if (playerTotal > bankerTotal) return 'player';
  if (bankerTotal > playerTotal) return 'banker';
  return 'tie';
}

/**
 * Given initial 4 cards (P1, P2, B1, B2) and optional 3rd cards,
 * determine the full hand outcome.
 * Cards should be dealt in order: P1, B1, P2, B2
 */
export function playHand(
  p1: number, b1: number, p2: number, b2: number,
  p3?: number, b3?: number
): PlayedHand {
  const playerCards = [p1, p2];
  const bankerCards = [b1, b2];

  const playerPair = cardValue(p1) === cardValue(p2);
  const bankerPair = cardValue(b1) === cardValue(b2);

  // Check for naturals
  if (isNatural(playerCards) || isNatural(bankerCards)) {
    const pt = handTotal(playerCards);
    const bt = handTotal(bankerCards);
    return {
      playerCards,
      bankerCards,
      playerTotal: pt,
      bankerTotal: bt,
      result: determineResult(pt, bt),
      isNatural: true,
      playerPair,
      bankerPair,
      margin: Math.abs(pt - bt),
    };
  }

  let playerThirdCard: number | null = null;

  // Player drawing rule
  if (playerShouldDraw(playerCards)) {
    if (p3 === undefined) throw new Error('Player needs 3rd card but none provided');
    playerThirdCard = p3;
    playerCards.push(p3);
  }

  // Banker drawing rule
  if (bankerShouldDraw(bankerCards, playerThirdCard)) {
    if (b3 === undefined) throw new Error('Banker needs 3rd card but none provided');
    bankerCards.push(b3);
  }

  const pt = handTotal(playerCards);
  const bt = handTotal(bankerCards);

  return {
    playerCards,
    bankerCards,
    playerTotal: pt,
    bankerTotal: bt,
    result: determineResult(pt, bt),
    isNatural: false,
    playerPair,
    bankerPair,
    margin: Math.abs(pt - bt),
  };
}

/**
 * Determine which phase the hand is in and what card is needed next.
 * Order: P1 → B1 → P2 → B2 → [P3?] → [B3?]
 */
export type InputPhase = 'P1' | 'B1' | 'P2' | 'B2' | 'P3' | 'B3' | 'COMPLETE';

export function getNextPhase(
  cards: { p1?: number; b1?: number; p2?: number; b2?: number; p3?: number; b3?: number }
): InputPhase {
  if (cards.p1 === undefined) return 'P1';
  if (cards.b1 === undefined) return 'B1';
  if (cards.p2 === undefined) return 'P2';
  if (cards.b2 === undefined) return 'B2';

  // Check if we need 3rd cards
  const playerCards = [cards.p1, cards.p2];
  const bankerCards = [cards.b1, cards.b2];

  // Naturals = complete
  if (isNatural(playerCards) || isNatural(bankerCards)) {
    return 'COMPLETE';
  }

  const playerDraws = playerShouldDraw(playerCards);

  if (playerDraws && cards.p3 === undefined) {
    return 'P3';
  }

  const playerThirdCard = playerDraws ? (cards.p3 ?? null) : null;
  const bankerDraws = bankerShouldDraw(bankerCards, playerThirdCard);

  if (bankerDraws && cards.b3 === undefined) {
    return 'B3';
  }

  return 'COMPLETE';
}

/**
 * Check if player needs a third card based on first 4 cards.
 */
export function needsPlayerThird(p1: number, p2: number, b1: number, b2: number): boolean {
  if (isNatural([p1, p2]) || isNatural([b1, b2])) return false;
  return playerShouldDraw([p1, p2]);
}

/**
 * Check if banker needs a third card.
 */
export function needsBankerThird(
  p1: number, p2: number, b1: number, b2: number, p3: number | null
): boolean {
  if (isNatural([p1, p2]) || isNatural([b1, b2])) return false;
  return bankerShouldDraw([b1, b2], p3);
}
