/**
 * Shared Effectifs (Student enrollment) components, constants, and utilities
 *
 * This module provides reusable building blocks for displaying student enrollment
 * data across both workspace and program-level views.
 */

// Constants
export type { ColorName } from './constants';
export { CYCLE_COLORS, SISE_SOURCE, SISE_SOURCE_SHORT } from './constants';
// Components
export { EffectifsEvolutionChart } from './EffectifsEvolutionChart';
export { EmptyState } from './EmptyState';

// Utils
export type { CategoryData, GenderBreakdown } from './utils';
export {
  aggregateByCategory,
  extractNumber,
  regionToHcKey,
  sortByNumber,
  sortByTotalDesc,
} from './utils';
