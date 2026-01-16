/**
 * Shared utility functions for Insersup (Insertion Professionnelle) views
 */

import type { MonthKey } from './constants';
import { PRIVACY_THRESHOLD } from './constants';

/**
 * Employment counts/rates object structure
 * Used for both raw counts and computed percentages
 */
export interface RatesObject {
  m6: number | null;
  m12: number | null;
  m18: number | null;
  m24: number | null;
  m30: number | null;
}

/**
 * Compute percentage from raw count and total sortants
 * Returns null if count is null or nbSortants is 0
 */
export const computePercent = (count: number | null, nbSortants: number): number | null => {
  if (count === null || nbSortants === 0) return null;
  return Math.round((count / nbSortants) * 100);
};

/**
 * Convert raw employment counts to percentages
 * Returns an object with percentage values at each month
 */
export const countsToPercentages = (
  counts: RatesObject | null,
  nbSortants: number,
): RatesObject | null => {
  if (!counts || nbSortants === 0) return null;
  return {
    m6: computePercent(counts.m6, nbSortants),
    m12: computePercent(counts.m12, nbSortants),
    m18: computePercent(counts.m18, nbSortants),
    m24: computePercent(counts.m24, nbSortants),
    m30: computePercent(counts.m30, nbSortants),
  };
};

/**
 * Check if employment data can be shown (passes privacy threshold)
 * The backend already nullifies counts when nbSortants < threshold,
 * so we just check if emploiSalFr is not null
 */
export const canShowEmploymentData = (emploiSalFr: RatesObject | null): boolean => {
  return emploiSalFr !== null;
};

/**
 * Convert employment rates object to array for chart data
 */
export const ratesToArray = (rates: RatesObject | null): (number | null)[] => {
  if (!rates) return [null, null, null, null, null];
  return [rates.m6, rates.m12, rates.m18, rates.m24, rates.m30];
};

/**
 * Convert employment rates to array, setting trailing zeros/nulls to null
 * This prevents lines from going to zero when data is not yet observable
 */
export const ratesToArrayWithTrailingNulls = (rates: RatesObject | null): (number | null)[] => {
  if (!rates) return [null, null, null, null, null];
  const values = [rates.m6, rates.m12, rates.m18, rates.m24, rates.m30];
  let lastValidIndex = -1;
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] !== null && values[i] !== 0) {
      lastValidIndex = i;
      break;
    }
  }
  if (lastValidIndex === -1) return [null, null, null, null, null];
  return values.map((v, i) => (i <= lastValidIndex ? v : null));
};

/**
 * Get value for a specific month from rates object
 */
export const getMonthValue = (rates: RatesObject | null, month: MonthKey): number | null => {
  if (!rates) return null;
  return rates[month];
};

/**
 * Check if year data has sufficient sortants for display
 */
export const hasMinimumSortants = (nbSortants: number): boolean => {
  return nbSortants >= PRIVACY_THRESHOLD;
};
