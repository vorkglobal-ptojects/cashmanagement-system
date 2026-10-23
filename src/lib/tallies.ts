import { DenominationBreakdown } from './types';

export const DENOMINATION_VALUES = {
  note5000: 5000,
  note1000: 1000,
  note500: 500,
  note100: 100,
  note50: 50,
  note20: 20,
} as const;

/**
 * Accurately calculate total value of denomination breakdown
 */
export function calculateTallyTotal(breakdown: DenominationBreakdown): number {
  const sum5000 = (breakdown.note5000 || 0) * 5000;
  const sum1000 = (breakdown.note1000 || 0) * 1000;
  const sum500 = (breakdown.note500 || 0) * 500;
  const sum100 = (breakdown.note100 || 0) * 100;
  const sum50 = (breakdown.note50 || 0) * 50;
  const sum20 = (breakdown.note20 || 0) * 20;
  const coins = Math.max(0, Number(breakdown.coins) || 0);

  const total = sum5000 + sum1000 + sum500 + sum100 + sum50 + sum20 + coins;
  return Math.round(total * 100) / 100;
}

/**
 * Validate that calculated tally equals expected amount
 */
export function validateTallyMatches(
  breakdown: DenominationBreakdown,
  expectedAmount: number
): { matches: boolean; calculated: number; difference: number } {
  const calculated = calculateTallyTotal(breakdown);
  const difference = Math.round((calculated - expectedAmount) * 100) / 100;
  return {
    matches: Math.abs(difference) < 0.01,
    calculated,
    difference,
  };
}
