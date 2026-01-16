/**
 * Shared constants for Insersup (Insertion Professionnelle) views
 */

// Month keys used throughout the Insersup views
export type MonthKey = 'm6' | 'm12' | 'm18' | 'm24' | 'm30';

// Month options for selectors
export const MONTH_OPTIONS: { key: MonthKey; label: string }[] = [
  { key: 'm6', label: '6 mois' },
  { key: 'm12', label: '12 mois' },
  { key: 'm18', label: '18 mois' },
  { key: 'm24', label: '24 mois' },
  { key: 'm30', label: '30 mois' },
];

// Array of month keys for iteration
export const MONTH_KEYS: MonthKey[] = ['m6', 'm12', 'm18', 'm24', 'm30'];

// Month labels for chart axes
export const MONTHS = ['6 mois', '12 mois', '18 mois', '24 mois', '30 mois'];

// Colors for cohort comparison charts
export const COHORT_COLORS = [
  'green-archipel',
  'blue-cumulus',
  'purple-glycine',
  'pink-macaron',
  'yellow-tournesol',
  'orange-terre-battue',
  'brown-caramel',
  'beige-gris-galet',
] as const;

// Privacy threshold for showing percentages (minimum number of sortants)
export const PRIVACY_THRESHOLD = 20;

// Minimum sample size for salary data to be considered valid
export const SALARY_MIN_COUNT = 5;
