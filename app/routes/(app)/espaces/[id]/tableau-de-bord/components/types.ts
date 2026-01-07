import type {
  EmploymentRates,
  InsersupGenderStats,
  InsersupYearStats,
  WorkspaceCacheDoc,
} from '~/database/types';

// Re-export types from database for convenience
export type { EmploymentRates, InsersupGenderStats, InsersupYearStats };

// Type for the aggregations data from the API
export type WorkspaceAggregations = WorkspaceCacheDoc & {
  programCount: number;
};

// Student aggregation types
export interface StudentAggregations {
  totalPrograms: number;
  totalStudents: number;
  totalFemale: number;
  totalMale: number;
  byYear: {
    year: string;
    total: number;
    female: number;
    male: number;
  }[];
  byCycle: {
    cycle: string;
    total: number;
    female: number;
    male: number;
  }[];
  byAcademy: {
    academy: string;
    total: number;
    female: number;
    male: number;
  }[];
  byRegion: {
    region: string;
    total: number;
    female: number;
    male: number;
  }[];
  byDiploma: {
    diploma: string;
    diplomaLabel: string;
    total: number;
    female: number;
    male: number;
  }[];
  byInstitution: {
    id: string;
    name: string;
    total: number;
    female: number;
    male: number;
  }[];
  byDiscipline: {
    discipline: string;
    disciplineLabel?: string;
    label?: string;
    total: number;
    female: number;
    male: number;
  }[];
  byLargeDiscipline: {
    largeDiscipline: string;
    largeDisciplineLabel?: string;
    label?: string;
    total: number;
    female: number;
    male: number;
  }[];
}

// Program aggregation types
export interface ProgramAggregations {
  byCycle: {
    cycle: string;
    count: number;
  }[];
  byAcademy: {
    academy: string;
    count: number;
  }[];
  byRegion: {
    region: string;
    count: number;
  }[];
  byDiploma: {
    diploma: string;
    diplomaLabel: string;
    count: number;
  }[];
  byInstitution: {
    uai: string;
    name: string;
    count: number;
  }[];
  byDiscipline: {
    discipline: string;
    count: number;
  }[];
  byRome: {
    code: string;
    label: string;
    count: number;
  }[];
}

// Insersup aggregation types
export interface InsersupAggregations {
  totalPrograms: number;
  totalSortants: number;
  totalEtudiants: number;
  totalPoursuivants: number;
  totalSortantsFrancais: number;
  totalSortantsEtrangers: number;
  canShowPercentages: boolean;
  byYear: InsersupYearStats[];
  globalRates: {
    emploiSalFr: EmploymentRates | null;
    emploiNonSal: EmploymentRates | null;
    emploiStable: EmploymentRates | null;
  } | null;
  globalRatesByGender: {
    femme: InsersupGenderStats | null;
    homme: InsersupGenderStats | null;
  } | null;
}

// View type for the dashboard
export type DashboardView = 'programs' | 'students' | 'insersup';

// Common props for view components
export interface ViewComponentProps {
  programCount: number;
}

export interface ProgramsViewProps extends ViewComponentProps {
  aggregations: ProgramAggregations | null;
}

export interface StudentsViewProps extends ViewComponentProps {
  aggregations: StudentAggregations | null;
}

export interface InsersupViewProps extends ViewComponentProps {
  aggregations: InsersupAggregations | null;
}
