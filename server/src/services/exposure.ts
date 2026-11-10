import db from '../db/database';
import { SINGLE_PANNAS, DOUBLE_PANNAS, TRIPLE_PANNAS, calculateAnkFromPanna } from './matkaUtils';

// Calculate the Panna that produces the least platform liability (maximum house profit)
export async function calculateOptimalPanna(marketId: number, date: string, session: 'OPEN' | 'CLOSE'): Promise<string> {
  // Fetch all pending bets for this market, date, and session
  const bets = await db.queryAll(`
    SELECT game_type, session, bet_number, amount, potential_win
    FROM bets
    WHERE market_id = ? AND bet_date = ? AND status = 'PENDING'
  `, [marketId, date]);

  // If no bets placed, pick a random authentic single panna
  if (bets.length === 0) {
    const randomIdx = Math.floor(Math.random() * SINGLE_PANNAS.length);
    return SINGLE_PANNAS[randomIdx];
  }

  // Combine all candidate pannas (prioritize single pannas, then double)
  const candidatePannas = [...SINGLE_PANNAS, ...DOUBLE_PANNAS];
  let bestPanna = candidatePannas[0];
  let minPayout = Infinity;

  // Evaluate payout liability for candidate pannas
  for (const panna of candidatePannas) {
    const ank = calculateAnkFromPanna(panna);
    let totalPayout = 0;

    for (const b of bets) {
      if (b.game_type === 'single_digit' && b.session === session && b.bet_number === ank) {
        totalPayout += Number(b.potential_win);
      } else if (
        (b.game_type === 'single_panna' || b.game_type === 'double_panna' || b.game_type === 'triple_panna') &&
        b.session === session &&
        b.bet_number === panna
      ) {
        totalPayout += Number(b.potential_win);
      }
    }

    if (totalPayout < minPayout) {
      minPayout = totalPayout;
      bestPanna = panna;
      if (minPayout === 0) {
        break;
      }
    }
  }

  return bestPanna;
}

// Generate fair random panna
export function generateRandomPanna(): string {
  const rand = Math.random();
  if (rand < 0.85) {
    return SINGLE_PANNAS[Math.floor(Math.random() * SINGLE_PANNAS.length)];
  } else if (rand < 0.97) {
    return DOUBLE_PANNAS[Math.floor(Math.random() * DOUBLE_PANNAS.length)];
  } else {
    return TRIPLE_PANNAS[Math.floor(Math.random() * TRIPLE_PANNAS.length)];
  }
}
