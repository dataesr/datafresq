/**
 * Shared constants for Effectifs (Student enrollment) views
 */

import type { colorFamily } from '@/components/charts/highcharts/colors';

export type ColorName = (typeof colorFamily)[number];

// Colors for cycle charts (LMD)
export const CYCLE_COLORS: ColorName[] = [
  'green-archipel',
  'blue-cumulus',
  'purple-glycine',
  'yellow-tournesol',
  'pink-macaron',
];
