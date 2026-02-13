/**
 * Shared utility functions for Effectifs (Student enrollment) views
 */

/**
 * Extract numeric value from a string (e.g., "1ère année" -> 1)
 * Used for sorting study years
 */
export function extractNumber(s: string): number {
  const match = /(\d+)/.exec(s);
  const numStr = match?.[1];
  return numStr ? Number.parseInt(numStr, 10) : 999;
}

/**
 * Gender breakdown for a category
 */
export interface GenderBreakdown {
  total: number;
  women: number;
  men: number;
}

/**
 * Category data for charts (stacked bar, etc.)
 */
export interface CategoryData {
  categories: string[];
  women: number[];
  men: number[];
}

/**
 * Aggregate data by a category key with gender breakdown
 * @param data - Array of records to aggregate
 * @param keyExtractor - Function to extract the category key from a record
 * @param sortFn - Function to sort the categories
 * @returns Aggregated category data with women/men arrays
 */
export function aggregateByCategory<T>(
  data: T[],
  keyExtractor: (item: T) => string,
  getValue: (item: T) => { enrollment: number; women: number; men: number },
  sortFn: (a: string, b: string, map: Map<string, GenderBreakdown>) => number,
): CategoryData {
  const map = new Map<string, GenderBreakdown>();

  for (const item of data) {
    const key = keyExtractor(item) || 'Non renseigné';
    const values = getValue(item);
    const existing = map.get(key) || { total: 0, women: 0, men: 0 };
    map.set(key, {
      total: existing.total + (values.enrollment || 0),
      women: existing.women + (values.women || 0),
      men: existing.men + (values.men || 0),
    });
  }

  const categories = Array.from(map.keys()).sort((a, b) => sortFn(a, b, map));

  return {
    categories,
    women: categories.map((cat) => map.get(cat)?.women || 0),
    men: categories.map((cat) => map.get(cat)?.men || 0),
  };
}

/**
 * Sort by extracted number (for study years like "1ère année", "2ème année")
 */
export function sortByNumber(a: string, b: string): number {
  return extractNumber(a) - extractNumber(b);
}

/**
 * Sort by total count descending
 */
export function sortByTotalDesc(a: string, b: string, map: Map<string, GenderBreakdown>): number {
  return (map.get(b)?.total || 0) - (map.get(a)?.total || 0);
}
