/**
 * Shared constants for Effectifs (Student enrollment) views
 */

import type { colorFamily } from '@/components/highcharts/colors';

export type ColorName = (typeof colorFamily)[number];

// Colors for cycle charts (LMD)
export const CYCLE_COLORS: ColorName[] = [
  'green-archipel',
  'blue-cumulus',
  'purple-glycine',
  'yellow-tournesol',
  'pink-macaron',
];

// Data source label
export const SISE_SOURCE = "SISE (Système d'Information sur le Suivi de l'Étudiant)";
export const SISE_SOURCE_SHORT = 'SISE (MESR)';
