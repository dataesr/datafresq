/**
 * Shared Insersup (Insertion Professionnelle) components, constants, types, and utilities
 *
 * This module provides reusable building blocks for displaying professional insertion
 * data across both workspace and program-level views.
 */

// Components
export { BlurredNoData } from './BlurredNoData';
// Constants
export type { MonthKey } from './constants';
export {
  COHORT_COLORS,
  MONTH_KEYS,
  MONTH_OPTIONS,
  MONTHS,
  PRIVACY_THRESHOLD,
  SALARY_MIN_COUNT,
} from './constants';
export { EmploymentRateByGenderChart } from './EmploymentRateByGenderChart';
export { EmploymentRateChart } from './EmploymentRateChart';
export { EmploymentRateEvolutionChart } from './EmploymentRateEvolutionChart';
export { EmploymentStabilityChart } from './EmploymentStabilityChart';
export { EmploymentStabilityEvolutionChart } from './EmploymentStabilityEvolutionChart';
export { EmptyState } from './EmptyState';
// Utils
export type { RatesObject } from './utils';
export {
  canShowEmploymentData,
  computePercent,
  countsToPercentages,
  getMonthValue,
  hasMinimumSortants,
  ratesToArray,
  ratesToArrayWithTrailingNulls,
} from './utils';
