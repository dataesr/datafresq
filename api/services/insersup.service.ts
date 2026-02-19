import { collections } from '~/database/mongo';
import type {
  EmploymentCounts,
  InsersupAggregations,
  InsersupGenderStats,
  InsersupProgramData,
  InsersupYearStats,
  SalaryQuartiles,
} from '~/schemas/aggregations';
import type {
  InsersupStats,
  InsersupYearStats as ProgramInsersupYearStats,
} from '~/schemas/programs';

// ============================================================================
// Constants
// ============================================================================

const PRIVACY_THRESHOLD = 20;

// ============================================================================
// Types (internal)
// ============================================================================

interface EmploymentFields {
  emploiSalFr6: number;
  emploiSalFr12: number;
  emploiSalFr18: number;
  emploiSalFr24: number;
  emploiSalFr30: number;
  emploiNonSal6: number;
  emploiNonSal12: number;
  emploiNonSal18: number;
  emploiNonSal24: number;
  emploiNonSal30: number;
  emploiStable6: number;
  emploiStable12: number;
  emploiStable18: number;
  emploiStable24: number;
  emploiStable30: number;
}

interface SalaryFields {
  nbSalaires6: number | null;
  nbSalaires12: number | null;
  nbSalaires18: number | null;
  nbSalaires24: number | null;
  nbSalaires30: number | null;
  salaireQ1_6: number | null;
  salaireQ1_12: number | null;
  salaireQ1_18: number | null;
  salaireQ1_24: number | null;
  salaireQ1_30: number | null;
  salaireQ2_6: number | null;
  salaireQ2_12: number | null;
  salaireQ2_18: number | null;
  salaireQ2_24: number | null;
  salaireQ2_30: number | null;
  salaireQ3_6: number | null;
  salaireQ3_12: number | null;
  salaireQ3_18: number | null;
  salaireQ3_24: number | null;
  salaireQ3_30: number | null;
}

interface ProgramMainAggResult extends EmploymentFields, SalaryFields {
  _id: string;
  nbEtudiants: number;
  nbSortants: number;
  nbPoursuivants: number;
}

interface ProgramGenderAggResult extends EmploymentFields, SalaryFields {
  _id: { promo: string; genre: string };
  nbSortants: number;
}

interface NationalityAggResult {
  _id: string;
  nbSortants: number;
}

interface WorkspaceProgramAggResult extends EmploymentFields {
  _id: { promo: string; inf: string };
  nbEtudiants: number;
  nbSortants: number;
  nbPoursuivants: number;
}

interface WorkspacePromoAggResult extends EmploymentFields {
  _id: string;
  nbEtudiants: number;
  nbSortants: number;
  nbPoursuivants: number;
  uniquePrograms: string[];
}

interface WorkspaceGenderAggResult extends EmploymentFields {
  _id: { promo: string; genre: string };
  nbSortants: number;
}

// ============================================================================
// Utilities (internal)
// ============================================================================

const EMPLOYMENT_GROUP_FIELDS = {
  emploiSalFr6: { $sum: '$nb_sortants_en_emploi_sal_fr_6' },
  emploiSalFr12: { $sum: '$nb_sortants_en_emploi_sal_fr_12' },
  emploiSalFr18: { $sum: '$nb_sortants_en_emploi_sal_fr_18' },
  emploiSalFr24: { $sum: '$nb_sortants_en_emploi_sal_fr_24' },
  emploiSalFr30: { $sum: '$nb_sortants_en_emploi_sal_fr_30' },
  emploiNonSal6: { $sum: '$nb_sortants_en_emploi_non_sal_6' },
  emploiNonSal12: { $sum: '$nb_sortants_en_emploi_non_sal_12' },
  emploiNonSal18: { $sum: '$nb_sortants_en_emploi_non_sal_18' },
  emploiNonSal24: { $sum: '$nb_sortants_en_emploi_non_sal_24' },
  emploiNonSal30: { $sum: '$nb_sortants_en_emploi_non_sal_30' },
  emploiStable6: { $sum: '$nb_sortants_en_emploi_stable_6' },
  emploiStable12: { $sum: '$nb_sortants_en_emploi_stable_12' },
  emploiStable18: { $sum: '$nb_sortants_en_emploi_stable_18' },
  emploiStable24: { $sum: '$nb_sortants_en_emploi_stable_24' },
  emploiStable30: { $sum: '$nb_sortants_en_emploi_stable_30' },
};

const SALARY_GROUP_FIELDS = {
  nbSalaires6: { $max: '$nb_salaires_6' },
  nbSalaires12: { $max: '$nb_salaires_12' },
  nbSalaires18: { $max: '$nb_salaires_18' },
  nbSalaires24: { $max: '$nb_salaires_24' },
  nbSalaires30: { $max: '$nb_salaires_30' },
  salaireQ1_6: { $max: '$salaire_q1_6' },
  salaireQ1_12: { $max: '$salaire_q1_12' },
  salaireQ1_18: { $max: '$salaire_q1_18' },
  salaireQ1_24: { $max: '$salaire_q1_24' },
  salaireQ1_30: { $max: '$salaire_q1_30' },
  salaireQ2_6: { $max: '$salaire_q2_6' },
  salaireQ2_12: { $max: '$salaire_q2_12' },
  salaireQ2_18: { $max: '$salaire_q2_18' },
  salaireQ2_24: { $max: '$salaire_q2_24' },
  salaireQ2_30: { $max: '$salaire_q2_30' },
  salaireQ3_6: { $max: '$salaire_q3_6' },
  salaireQ3_12: { $max: '$salaire_q3_12' },
  salaireQ3_18: { $max: '$salaire_q3_18' },
  salaireQ3_24: { $max: '$salaire_q3_24' },
  salaireQ3_30: { $max: '$salaire_q3_30' },
};

function insersupBaseMatch(programIds: string | string[]) {
  return {
    inf: typeof programIds === 'string' ? programIds : { $in: programIds },
    obtention_diplome: 'diplômé',
    nationalite: 'français',
    regime_inscription: 'ensemble',
  };
}

function buildEmploymentCounts(
  nbSortants: number,
  row: EmploymentFields,
  threshold = PRIVACY_THRESHOLD,
): {
  emploiSalFr: EmploymentCounts;
  emploiNonSal: EmploymentCounts;
  emploiStable: EmploymentCounts;
} | null {
  if (nbSortants < threshold) return null;
  return {
    emploiSalFr: {
      m6: row.emploiSalFr6,
      m12: row.emploiSalFr12,
      m18: row.emploiSalFr18,
      m24: row.emploiSalFr24,
      m30: row.emploiSalFr30,
    },
    emploiNonSal: {
      m6: row.emploiNonSal6,
      m12: row.emploiNonSal12,
      m18: row.emploiNonSal18,
      m24: row.emploiNonSal24,
      m30: row.emploiNonSal30,
    },
    emploiStable: {
      m6: row.emploiStable6,
      m12: row.emploiStable12,
      m18: row.emploiStable18,
      m24: row.emploiStable24,
      m30: row.emploiStable30,
    },
  };
}

function buildSalaryQuartiles(row: SalaryFields): SalaryQuartiles | null {
  const hasAnyData = [
    row.nbSalaires6,
    row.nbSalaires12,
    row.nbSalaires18,
    row.nbSalaires24,
    row.nbSalaires30,
  ].some((n) => n !== null);

  if (!hasAnyData) return null;

  const buildMonth = (
    count: number | null,
    q1: number | null,
    median: number | null,
    q3: number | null,
  ) => {
    if (count === null) {
      return { count: null, q1: null, median: null, q3: null };
    }
    return { count, q1, median, q3 };
  };

  return {
    m6: buildMonth(row.nbSalaires6, row.salaireQ1_6, row.salaireQ2_6, row.salaireQ3_6),
    m12: buildMonth(row.nbSalaires12, row.salaireQ1_12, row.salaireQ2_12, row.salaireQ3_12),
    m18: buildMonth(row.nbSalaires18, row.salaireQ1_18, row.salaireQ2_18, row.salaireQ3_18),
    m24: buildMonth(row.nbSalaires24, row.salaireQ1_24, row.salaireQ2_24, row.salaireQ3_24),
    m30: buildMonth(row.nbSalaires30, row.salaireQ1_30, row.salaireQ2_30, row.salaireQ3_30),
  };
}

// ============================================================================
// Empty state
// ============================================================================

export const emptyInsersupAggregations: InsersupAggregations = {
  totalPrograms: 0,
  byYear: [],
};

// ============================================================================
// Program-level aggregation (detail view)
// ============================================================================

export async function aggregateInsersupForProgram(inf: string): Promise<InsersupStats> {
  const baseMatch = insersupBaseMatch(inf);

  const mainPipeline = [
    { $match: { ...baseMatch, genre: 'ensemble' } },
    {
      $group: {
        _id: '$promo',
        nbEtudiants: { $sum: '$nb_etudiants' },
        nbSortants: { $sum: '$nb_sortants' },
        nbPoursuivants: { $sum: '$nb_poursuivants' },
        ...EMPLOYMENT_GROUP_FIELDS,
        ...SALARY_GROUP_FIELDS,
      },
    },
    { $sort: { _id: -1 } },
  ];

  const genderPipeline = [
    { $match: { ...baseMatch, genre: { $in: ['femme', 'homme'] } } },
    {
      $group: {
        _id: { promo: '$promo', genre: '$genre' },
        nbSortants: { $sum: '$nb_sortants' },
        ...EMPLOYMENT_GROUP_FIELDS,
        ...SALARY_GROUP_FIELDS,
      },
    },
  ];

  const nationalityPipeline = [
    {
      $match: {
        inf,
        genre: 'ensemble',
        obtention_diplome: 'diplômé',
        nationalite: { $in: ['français', 'étranger'] },
        regime_inscription: 'ensemble',
      },
    },
    {
      $group: {
        _id: '$nationalite',
        nbSortants: { $sum: '$nb_sortants' },
      },
    },
  ];

  const [mainResults, genderResults, nationalityResults] = await Promise.all([
    collections.insersup.aggregate<ProgramMainAggResult>(mainPipeline).toArray(),
    collections.insersup.aggregate<ProgramGenderAggResult>(genderPipeline).toArray(),
    collections.insersup.aggregate<NationalityAggResult>(nationalityPipeline).toArray(),
  ]);

  const genderByPromo = new Map<
    string,
    { femme?: ProgramGenderAggResult; homme?: ProgramGenderAggResult }
  >();
  for (const g of genderResults) {
    const promo = g._id.promo;
    if (!genderByPromo.has(promo)) genderByPromo.set(promo, {});
    const entry = genderByPromo.get(promo)!;
    if (g._id.genre === 'femme') entry.femme = g;
    else if (g._id.genre === 'homme') entry.homme = g;
  }

  const totalSortantsFrancais =
    nationalityResults.find((n) => n._id === 'français')?.nbSortants || 0;
  const totalSortantsEtrangers =
    nationalityResults.find((n) => n._id === 'étranger')?.nbSortants || 0;

  let totalSortants = 0;
  let totalEtudiants = 0;
  let totalPoursuivants = 0;

  const byYear: ProgramInsersupYearStats[] = mainResults.map((row) => {
    totalSortants += row.nbSortants;
    totalEtudiants += row.nbEtudiants;
    totalPoursuivants += row.nbPoursuivants;

    const genderData = genderByPromo.get(row._id);
    const emp = buildEmploymentCounts(row.nbSortants, row);

    const buildGenderStats = (g: ProgramGenderAggResult | undefined) => {
      if (!g) return null;
      const genderEmp = buildEmploymentCounts(g.nbSortants, g);
      return {
        nbSortants: g.nbSortants,
        emploiSalFr: genderEmp?.emploiSalFr ?? null,
        emploiNonSal: genderEmp?.emploiNonSal ?? null,
        emploiStable: genderEmp?.emploiStable ?? null,
        salaires: buildSalaryQuartiles(g),
      };
    };

    return {
      promo: row._id,
      nbEtudiants: row.nbEtudiants,
      nbSortants: row.nbSortants,
      nbPoursuivants: row.nbPoursuivants,
      emploiSalFr: emp?.emploiSalFr ?? null,
      emploiNonSal: emp?.emploiNonSal ?? null,
      emploiStable: emp?.emploiStable ?? null,
      salaires: buildSalaryQuartiles(row),
      byGender: {
        femme: buildGenderStats(genderData?.femme),
        homme: buildGenderStats(genderData?.homme),
      },
    };
  });

  return {
    totalSortants,
    totalEtudiants,
    totalPoursuivants,
    totalSortantsFrancais,
    totalSortantsEtrangers,
    byYear,
  };
}

// ============================================================================
// Workspace-level aggregation
// ============================================================================

export async function aggregateInsersupForWorkspace(
  programIds: string[],
): Promise<InsersupAggregations> {
  if (programIds.length === 0) {
    return emptyInsersupAggregations;
  }

  const baseMatch = insersupBaseMatch(programIds);

  const programPipeline = [
    { $match: { ...baseMatch, genre: 'ensemble' } },
    {
      $group: {
        _id: { promo: '$promo', inf: '$inf' },
        nbEtudiants: { $sum: '$nb_etudiants' },
        nbSortants: { $sum: '$nb_sortants' },
        nbPoursuivants: { $sum: '$nb_poursuivants' },
        ...EMPLOYMENT_GROUP_FIELDS,
      },
    },
    { $sort: { '_id.promo': -1 as const, nbSortants: -1 as const } },
  ];

  const promoPipeline = [
    { $match: { ...baseMatch, genre: 'ensemble' } },
    {
      $group: {
        _id: '$promo',
        nbEtudiants: { $sum: '$nb_etudiants' },
        nbSortants: { $sum: '$nb_sortants' },
        nbPoursuivants: { $sum: '$nb_poursuivants' },
        uniquePrograms: { $addToSet: '$inf' },
        ...EMPLOYMENT_GROUP_FIELDS,
      },
    },
    { $sort: { _id: -1 as const } },
  ];

  const genderPipeline = [
    { $match: { ...baseMatch, genre: { $in: ['femme', 'homme'] } } },
    {
      $group: {
        _id: { promo: '$promo', genre: '$genre' },
        nbSortants: { $sum: '$nb_sortants' },
        ...EMPLOYMENT_GROUP_FIELDS,
      },
    },
  ];

  const [programResults, promoResults, genderResults] = await Promise.all([
    collections.insersup.aggregate<WorkspaceProgramAggResult>(programPipeline).toArray(),
    collections.insersup.aggregate<WorkspacePromoAggResult>(promoPipeline).toArray(),
    collections.insersup.aggregate<WorkspaceGenderAggResult>(genderPipeline).toArray(),
  ]);

  const programsByPromo = new Map<string, WorkspaceProgramAggResult[]>();
  for (const row of programResults) {
    const promo = row._id.promo;
    if (!programsByPromo.has(promo)) programsByPromo.set(promo, []);
    programsByPromo.get(promo)!.push(row);
  }

  const genderByPromo = new Map<
    string,
    { femme?: WorkspaceGenderAggResult; homme?: WorkspaceGenderAggResult }
  >();
  for (const row of genderResults) {
    const promo = row._id.promo;
    if (!genderByPromo.has(promo)) genderByPromo.set(promo, {});
    const entry = genderByPromo.get(promo)!;
    if (row._id.genre === 'femme') entry.femme = row;
    else if (row._id.genre === 'homme') entry.homme = row;
  }

  let totalPrograms = 0;

  const byYear: InsersupYearStats[] = promoResults.map((promoRow) => {
    const promo = promoRow._id;
    totalPrograms += promoRow.uniquePrograms.length;

    const promoEmp = buildEmploymentCounts(promoRow.nbSortants, promoRow);

    const programRows = programsByPromo.get(promo) ?? [];
    const programs: InsersupProgramData[] = programRows
      .sort((a, b) => b.nbSortants - a.nbSortants)
      .map((row) => {
        const emp = buildEmploymentCounts(row.nbSortants, row);
        return {
          inf: row._id.inf,
          nbEtudiants: row.nbEtudiants,
          nbSortants: row.nbSortants,
          nbPoursuivants: row.nbPoursuivants,
          emploiSalFr: emp?.emploiSalFr ?? null,
          emploiNonSal: emp?.emploiNonSal ?? null,
          emploiStable: emp?.emploiStable ?? null,
        };
      });

    const genderData = genderByPromo.get(promo);
    const buildGenderStats = (
      g: WorkspaceGenderAggResult | undefined,
    ): InsersupGenderStats | null => {
      if (!g) return null;
      const emp = buildEmploymentCounts(g.nbSortants, g);
      return {
        nbSortants: g.nbSortants,
        emploiSalFr: emp?.emploiSalFr ?? null,
        emploiNonSal: emp?.emploiNonSal ?? null,
        emploiStable: emp?.emploiStable ?? null,
      };
    };

    return {
      promo,
      nbEtudiants: promoRow.nbEtudiants,
      nbSortants: promoRow.nbSortants,
      nbPoursuivants: promoRow.nbPoursuivants,
      emploiSalFr: promoEmp?.emploiSalFr ?? null,
      emploiNonSal: promoEmp?.emploiNonSal ?? null,
      emploiStable: promoEmp?.emploiStable ?? null,
      byGender: {
        femme: buildGenderStats(genderData?.femme),
        homme: buildGenderStats(genderData?.homme),
      },
      programs,
    };
  });

  return { totalPrograms, byYear };
}
