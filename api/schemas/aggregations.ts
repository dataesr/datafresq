import { t } from 'elysia';

// ============================================================================
// Common Schemas
// ============================================================================

const genderBreakdownSchema = t.Object({
  total: t.Number(),
  female: t.Number(),
  male: t.Number(),
});

// Program reference - only contains inf, actual data comes from programs collection
const programRefSchema = t.Object({
  inf: t.String(),
});

// Per-program SISE data with enrollment counts
const siseProgramDataSchema = t.Object({
  inf: t.String(),
  totalStudents: t.Number(),
  totalFemale: t.Number(),
  totalMale: t.Number(),
});

// ============================================================================
// SISE (Student Enrollment) Aggregation Schemas
// ============================================================================

const siseCycleBreakdownSchema = t.Object({
  cycle: t.String(),
  total: t.Number(),
  female: t.Number(),
  male: t.Number(),
});

const siseAcademyBreakdownSchema = t.Object({
  academy: t.String(),
  total: t.Number(),
  female: t.Number(),
  male: t.Number(),
});

const siseRegionBreakdownSchema = t.Object({
  region: t.String(),
  total: t.Number(),
  female: t.Number(),
  male: t.Number(),
});

const siseDiplomaBreakdownSchema = t.Object({
  diploma: t.String(),
  diplomaLabel: t.String(),
  total: t.Number(),
  female: t.Number(),
  male: t.Number(),
});

const siseInstitutionBreakdownSchema = t.Object({
  paysageId: t.String(),
  name: t.String(),
  total: t.Number(),
  female: t.Number(),
  male: t.Number(),
});

const siseDisciplineBreakdownSchema = t.Object({
  id: t.String(),
  label: t.String(),
  total: t.Number(),
  female: t.Number(),
  male: t.Number(),
});

export const siseYearStatsSchema = t.Object({
  year: t.String(),
  totalPrograms: t.Number(),
  totalStudents: t.Number(),
  totalFemale: t.Number(),
  totalMale: t.Number(),
  programs: t.Array(siseProgramDataSchema),
  byCycle: t.Array(siseCycleBreakdownSchema),
  byAcademy: t.Array(siseAcademyBreakdownSchema),
  byRegion: t.Array(siseRegionBreakdownSchema),
  byDiploma: t.Array(siseDiplomaBreakdownSchema),
  byInstitution: t.Array(siseInstitutionBreakdownSchema),
  byDiscipline: t.Array(siseDisciplineBreakdownSchema),
  byLargeDiscipline: t.Array(siseDisciplineBreakdownSchema),
});

export const siseAggregationsSchema = t.Object({
  byYear: t.Array(siseYearStatsSchema),
});

// ============================================================================
// Insersup (Professional Insertion) Aggregation Schemas
// ============================================================================

export const employmentCountsSchema = t.Object({
  m6: t.Union([t.Number(), t.Null()]),
  m12: t.Union([t.Number(), t.Null()]),
  m18: t.Union([t.Number(), t.Null()]),
  m24: t.Union([t.Number(), t.Null()]),
  m30: t.Union([t.Number(), t.Null()]),
});

export const salaryMonthSchema = t.Object({
  count: t.Union([t.Number(), t.Null()]),
  q1: t.Union([t.Number(), t.Null()]),
  median: t.Union([t.Number(), t.Null()]),
  q3: t.Union([t.Number(), t.Null()]),
});

export const salaryQuartilesSchema = t.Object({
  m6: salaryMonthSchema,
  m12: salaryMonthSchema,
  m18: salaryMonthSchema,
  m24: salaryMonthSchema,
  m30: salaryMonthSchema,
});

export const insersupGenderStatsSchema = t.Object({
  nbSortants: t.Number(),
  emploiSalFr: t.Union([employmentCountsSchema, t.Null()]),
  emploiNonSal: t.Union([employmentCountsSchema, t.Null()]),
  emploiStable: t.Union([employmentCountsSchema, t.Null()]),
});

// Program data within a year - only inf, frontend will lookup full program details
const insersupProgramDataSchema = t.Object({
  inf: t.String(),
  nbEtudiants: t.Number(),
  nbSortants: t.Number(),
  nbPoursuivants: t.Number(),
  emploiSalFr: t.Union([employmentCountsSchema, t.Null()]),
  emploiNonSal: t.Union([employmentCountsSchema, t.Null()]),
  emploiStable: t.Union([employmentCountsSchema, t.Null()]),
});

export const insersupYearStatsSchema = t.Object({
  promo: t.String(),
  nbEtudiants: t.Number(),
  nbSortants: t.Number(),
  nbPoursuivants: t.Number(),
  emploiSalFr: t.Union([employmentCountsSchema, t.Null()]),
  emploiNonSal: t.Union([employmentCountsSchema, t.Null()]),
  emploiStable: t.Union([employmentCountsSchema, t.Null()]),
  byGender: t.Object({
    femme: t.Union([insersupGenderStatsSchema, t.Null()]),
    homme: t.Union([insersupGenderStatsSchema, t.Null()]),
  }),
  programs: t.Array(insersupProgramDataSchema),
});

export const insersupAggregationsSchema = t.Object({
  totalPrograms: t.Number(),
  byYear: t.Array(insersupYearStatsSchema),
});

// ============================================================================
// Program Aggregation Schemas
// ============================================================================

const programCycleBreakdownSchema = t.Object({
  cycle: t.String(),
  count: t.Number(),
});

const programAcademyBreakdownSchema = t.Object({
  academy: t.String(),
  count: t.Number(),
});

const programRegionBreakdownSchema = t.Object({
  region: t.String(),
  count: t.Number(),
});

const programDiplomaBreakdownSchema = t.Object({
  diploma: t.String(),
  diplomaLabel: t.String(),
  count: t.Number(),
});

const programInstitutionBreakdownSchema = t.Object({
  uai: t.String(),
  name: t.String(),
  count: t.Number(),
});

const programDisciplineBreakdownSchema = t.Object({
  discipline: t.String(),
  count: t.Number(),
});

const programRomeBreakdownSchema = t.Object({
  code: t.String(),
  label: t.String(),
  count: t.Number(),
});

export const programAggregationsSchema = t.Object({
  byCycle: t.Array(programCycleBreakdownSchema),
  byAcademy: t.Array(programAcademyBreakdownSchema),
  byRegion: t.Array(programRegionBreakdownSchema),
  byDiploma: t.Array(programDiplomaBreakdownSchema),
  byInstitution: t.Array(programInstitutionBreakdownSchema),
  byDiscipline: t.Array(programDisciplineBreakdownSchema),
  byRome: t.Array(programRomeBreakdownSchema),
});

// ============================================================================
// Workspace Aggregations Response Schema
// ============================================================================

export const workspaceAggregationsResponseSchema = t.Object({
  workspaceId: t.String(),
  programCount: t.Number(),
  studentsAggregations: t.Union([siseAggregationsSchema, t.Null()]),
  programAggregations: t.Union([programAggregationsSchema, t.Null()]),
  insersupAggregations: t.Union([insersupAggregationsSchema, t.Null()]),
  updatedAt: t.Date(),
});

// ============================================================================
// Types
// ============================================================================

export type GenderBreakdown = typeof genderBreakdownSchema.static;
export type ProgramRef = typeof programRefSchema.static;
export type SiseProgramData = typeof siseProgramDataSchema.static;

export type SiseCycleBreakdown = typeof siseCycleBreakdownSchema.static;
export type SiseAcademyBreakdown = typeof siseAcademyBreakdownSchema.static;
export type SiseRegionBreakdown = typeof siseRegionBreakdownSchema.static;
export type SiseDiplomaBreakdown = typeof siseDiplomaBreakdownSchema.static;
export type SiseInstitutionBreakdown = typeof siseInstitutionBreakdownSchema.static;
export type SiseDisciplineBreakdown = typeof siseDisciplineBreakdownSchema.static;
export type SiseYearStats = typeof siseYearStatsSchema.static;
export type SiseAggregations = typeof siseAggregationsSchema.static;

export type EmploymentCounts = typeof employmentCountsSchema.static;
export type SalaryMonth = typeof salaryMonthSchema.static;
export type SalaryQuartiles = typeof salaryQuartilesSchema.static;
export type InsersupGenderStats = typeof insersupGenderStatsSchema.static;
export type InsersupProgramData = typeof insersupProgramDataSchema.static;
export type InsersupYearStats = typeof insersupYearStatsSchema.static;
export type InsersupAggregations = typeof insersupAggregationsSchema.static;

export type ProgramCycleBreakdown = typeof programCycleBreakdownSchema.static;
export type ProgramAcademyBreakdown = typeof programAcademyBreakdownSchema.static;
export type ProgramRegionBreakdown = typeof programRegionBreakdownSchema.static;
export type ProgramDiplomaBreakdown = typeof programDiplomaBreakdownSchema.static;
export type ProgramInstitutionBreakdown = typeof programInstitutionBreakdownSchema.static;
export type ProgramDisciplineBreakdown = typeof programDisciplineBreakdownSchema.static;
export type ProgramRomeBreakdown = typeof programRomeBreakdownSchema.static;
export type ProgramAggregations = typeof programAggregationsSchema.static;

export type WorkspaceAggregationsResponse = typeof workspaceAggregationsResponseSchema.static;
