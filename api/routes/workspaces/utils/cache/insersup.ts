import type { Document } from 'mongodb';
import { collections } from '~/database/mongo';
import type {
  EmploymentCounts,
  InsersupAggregations,
  InsersupGenderStats,
  InsersupProgramData,
  InsersupYearStats,
  SalaryQuartiles,
} from '~/schemas/aggregations';

const PRIVACY_THRESHOLD = 20;

// Aggregation result types
interface InsersupAggResult extends Document {
  _id: { promo: string; inf: string };
  libelleDiplome: string;
  typeDiplome: string;
  nbEtudiants: number;
  nbSortants: number;
  nbPoursuivants: number;
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

interface InsersupGenderAggResult extends Document {
  _id: { promo: string; genre: string };
  nbSortants: number;
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

export const emptyInsersupAggregations: InsersupAggregations = {
  totalPrograms: 0,
  byYear: [],
};

/**
 * Build employment counts, applying privacy threshold
 * Returns null if nbSortants < threshold
 */
function buildEmploymentCounts(
  nbSortants: number,
  data: {
    sal6: number;
    sal12: number;
    sal18: number;
    sal24: number;
    sal30: number;
    nonSal6: number;
    nonSal12: number;
    nonSal18: number;
    nonSal24: number;
    nonSal30: number;
    stable6: number;
    stable12: number;
    stable18: number;
    stable24: number;
    stable30: number;
  },
): {
  emploiSalFr: EmploymentCounts;
  emploiNonSal: EmploymentCounts;
  emploiStable: EmploymentCounts;
} | null {
  if (nbSortants < PRIVACY_THRESHOLD) return null;
  return {
    emploiSalFr: {
      m6: data.sal6,
      m12: data.sal12,
      m18: data.sal18,
      m24: data.sal24,
      m30: data.sal30,
    },
    emploiNonSal: {
      m6: data.nonSal6,
      m12: data.nonSal12,
      m18: data.nonSal18,
      m24: data.nonSal24,
      m30: data.nonSal30,
    },
    emploiStable: {
      m6: data.stable6,
      m12: data.stable12,
      m18: data.stable18,
      m24: data.stable24,
      m30: data.stable30,
    },
  };
}

/**
 * Build salary quartiles from aggregation result
 * Returns null if no salary data available
 */
function buildSalaryQuartiles(data: {
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
}): SalaryQuartiles | null {
  // Check if there's any salary data at all
  const SALARY_MIN_COUNT = 5;
  const hasAnyData = [
    data.nbSalaires6,
    data.nbSalaires12,
    data.nbSalaires18,
    data.nbSalaires24,
    data.nbSalaires30,
  ].some((n) => n !== null && n >= SALARY_MIN_COUNT);

  if (!hasAnyData) return null;

  const buildMonthData = (
    count: number | null,
    q1: number | null,
    median: number | null,
    q3: number | null,
  ) => {
    // Only include data if sample size is sufficient
    if (count === null || count < SALARY_MIN_COUNT) {
      return { count: null, q1: null, median: null, q3: null };
    }
    return { count, q1, median, q3 };
  };

  return {
    m6: buildMonthData(data.nbSalaires6, data.salaireQ1_6, data.salaireQ2_6, data.salaireQ3_6),
    m12: buildMonthData(data.nbSalaires12, data.salaireQ1_12, data.salaireQ2_12, data.salaireQ3_12),
    m18: buildMonthData(data.nbSalaires18, data.salaireQ1_18, data.salaireQ2_18, data.salaireQ3_18),
    m24: buildMonthData(data.nbSalaires24, data.salaireQ1_24, data.salaireQ2_24, data.salaireQ3_24),
    m30: buildMonthData(data.nbSalaires30, data.salaireQ1_30, data.salaireQ2_30, data.salaireQ3_30),
  };
}

/**
 * Compute InsersUp aggregations for a workspace
 */
export async function computeInsersupAggregations(
  programIds: string[],
): Promise<InsersupAggregations> {
  if (programIds.length === 0) {
    return emptyInsersupAggregations;
  }

  // Main pipeline - Per program per year
  // (genre=ensemble, nationalite=français, regime=ensemble, obtention=diplômé)
  const insersupMainPipeline = [
    {
      $match: {
        inf: { $in: programIds },
        genre: 'ensemble',
        obtention_diplome: 'diplômé',
        nationalite: 'français',
        regime_inscription: 'ensemble',
      },
    },
    {
      $group: {
        _id: { promo: '$promo', inf: '$inf' },
        libelleDiplome: { $first: '$libelle_diplome' },
        typeDiplome: { $first: '$type_diplome' },
        nbEtudiants: { $sum: '$nb_etudiants' },
        nbSortants: { $sum: '$nb_sortants' },
        nbPoursuivants: { $sum: '$nb_poursuivants' },
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
      },
    },
    { $sort: { '_id.promo': -1 as const, nbSortants: -1 as const } },
  ];

  // Gender pipeline - Per promo aggregated
  const insersupGenderPipeline = [
    {
      $match: {
        inf: { $in: programIds },
        genre: { $in: ['femme', 'homme'] },
        obtention_diplome: 'diplômé',
        nationalite: 'français',
        regime_inscription: 'ensemble',
      },
    },
    {
      $group: {
        _id: { promo: '$promo', genre: '$genre' },
        nbSortants: { $sum: '$nb_sortants' },
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
      },
    },
  ];

  // Run both aggregations in parallel
  const [insersupMainResults, insersupGenderResults] = await Promise.all([
    collections.insersup.aggregate<InsersupAggResult>(insersupMainPipeline).toArray(),
    collections.insersup.aggregate<InsersupGenderAggResult>(insersupGenderPipeline).toArray(),
  ]);

  // Group main results by promo
  const programsByPromo = new Map<string, InsersupAggResult[]>();
  const uniquePrograms = new Set<string>();

  for (const row of insersupMainResults) {
    const promo = row._id.promo;
    uniquePrograms.add(row._id.inf);
    if (!programsByPromo.has(promo)) {
      programsByPromo.set(promo, []);
    }
    programsByPromo.get(promo)!.push(row);
  }

  // Group gender results by promo
  const genderByPromo = new Map<
    string,
    { femme?: InsersupGenderAggResult; homme?: InsersupGenderAggResult }
  >();
  for (const row of insersupGenderResults) {
    const promo = row._id.promo;
    if (!genderByPromo.has(promo)) {
      genderByPromo.set(promo, {});
    }
    const entry = genderByPromo.get(promo)!;
    if (row._id.genre === 'femme') {
      entry.femme = row;
    } else if (row._id.genre === 'homme') {
      entry.homme = row;
    }
  }

  // Build byYear with nested programs
  const byYear: InsersupYearStats[] = [...programsByPromo.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])) // Sort promos descending
    .map(([promo, programRows]) => {
      // Aggregate totals for this promo
      let nbEtudiants = 0;
      let nbSortants = 0;
      let nbPoursuivants = 0;
      let sal6 = 0,
        sal12 = 0,
        sal18 = 0,
        sal24 = 0,
        sal30 = 0;
      let nonSal6 = 0,
        nonSal12 = 0,
        nonSal18 = 0,
        nonSal24 = 0,
        nonSal30 = 0;
      let stable6 = 0,
        stable12 = 0,
        stable18 = 0,
        stable24 = 0,
        stable30 = 0;

      // Build per-program data
      const programs: InsersupProgramData[] = programRows
        .map((row) => {
          nbEtudiants += row.nbEtudiants;
          nbSortants += row.nbSortants;
          nbPoursuivants += row.nbPoursuivants;
          sal6 += row.emploiSalFr6;
          sal12 += row.emploiSalFr12;
          sal18 += row.emploiSalFr18;
          sal24 += row.emploiSalFr24;
          sal30 += row.emploiSalFr30;
          nonSal6 += row.emploiNonSal6;
          nonSal12 += row.emploiNonSal12;
          nonSal18 += row.emploiNonSal18;
          nonSal24 += row.emploiNonSal24;
          nonSal30 += row.emploiNonSal30;
          stable6 += row.emploiStable6;
          stable12 += row.emploiStable12;
          stable18 += row.emploiStable18;
          stable24 += row.emploiStable24;
          stable30 += row.emploiStable30;

          const empCounts = buildEmploymentCounts(row.nbSortants, {
            sal6: row.emploiSalFr6,
            sal12: row.emploiSalFr12,
            sal18: row.emploiSalFr18,
            sal24: row.emploiSalFr24,
            sal30: row.emploiSalFr30,
            nonSal6: row.emploiNonSal6,
            nonSal12: row.emploiNonSal12,
            nonSal18: row.emploiNonSal18,
            nonSal24: row.emploiNonSal24,
            nonSal30: row.emploiNonSal30,
            stable6: row.emploiStable6,
            stable12: row.emploiStable12,
            stable18: row.emploiStable18,
            stable24: row.emploiStable24,
            stable30: row.emploiStable30,
          });

          const salaryQuartiles = buildSalaryQuartiles({
            nbSalaires6: row.nbSalaires6,
            nbSalaires12: row.nbSalaires12,
            nbSalaires18: row.nbSalaires18,
            nbSalaires24: row.nbSalaires24,
            nbSalaires30: row.nbSalaires30,
            salaireQ1_6: row.salaireQ1_6,
            salaireQ1_12: row.salaireQ1_12,
            salaireQ1_18: row.salaireQ1_18,
            salaireQ1_24: row.salaireQ1_24,
            salaireQ1_30: row.salaireQ1_30,
            salaireQ2_6: row.salaireQ2_6,
            salaireQ2_12: row.salaireQ2_12,
            salaireQ2_18: row.salaireQ2_18,
            salaireQ2_24: row.salaireQ2_24,
            salaireQ2_30: row.salaireQ2_30,
            salaireQ3_6: row.salaireQ3_6,
            salaireQ3_12: row.salaireQ3_12,
            salaireQ3_18: row.salaireQ3_18,
            salaireQ3_24: row.salaireQ3_24,
            salaireQ3_30: row.salaireQ3_30,
          });

          return {
            inf: row._id.inf,
            nbEtudiants: row.nbEtudiants,
            nbSortants: row.nbSortants,
            nbPoursuivants: row.nbPoursuivants,
            emploiSalFr: empCounts?.emploiSalFr ?? null,
            emploiNonSal: empCounts?.emploiNonSal ?? null,
            emploiStable: empCounts?.emploiStable ?? null,
            salaires: salaryQuartiles,
          };
        })
        .sort((a, b) => b.nbSortants - a.nbSortants);

      // Build promo-level employment counts
      const promoEmpCounts = buildEmploymentCounts(nbSortants, {
        sal6,
        sal12,
        sal18,
        sal24,
        sal30,
        nonSal6,
        nonSal12,
        nonSal18,
        nonSal24,
        nonSal30,
        stable6,
        stable12,
        stable18,
        stable24,
        stable30,
      });

      // Build gender data for this promo
      const genderData = genderByPromo.get(promo);

      const buildGenderStats = (
        g: InsersupGenderAggResult | undefined,
      ): InsersupGenderStats | null => {
        if (!g) return null;
        const empCounts = buildEmploymentCounts(g.nbSortants, {
          sal6: g.emploiSalFr6,
          sal12: g.emploiSalFr12,
          sal18: g.emploiSalFr18,
          sal24: g.emploiSalFr24,
          sal30: g.emploiSalFr30,
          nonSal6: g.emploiNonSal6,
          nonSal12: g.emploiNonSal12,
          nonSal18: g.emploiNonSal18,
          nonSal24: g.emploiNonSal24,
          nonSal30: g.emploiNonSal30,
          stable6: g.emploiStable6,
          stable12: g.emploiStable12,
          stable18: g.emploiStable18,
          stable24: g.emploiStable24,
          stable30: g.emploiStable30,
        });

        return {
          nbSortants: g.nbSortants,
          emploiSalFr: empCounts?.emploiSalFr ?? null,
          emploiNonSal: empCounts?.emploiNonSal ?? null,
          emploiStable: empCounts?.emploiStable ?? null,
          salaires: null, // Salary data not aggregated at workspace level
        };
      };

      return {
        promo,
        nbEtudiants,
        nbSortants,
        nbPoursuivants,
        emploiSalFr: promoEmpCounts?.emploiSalFr ?? null,
        emploiNonSal: promoEmpCounts?.emploiNonSal ?? null,
        emploiStable: promoEmpCounts?.emploiStable ?? null,
        salaires: null, // Salary data not aggregated at workspace level
        byGender: {
          femme: buildGenderStats(genderData?.femme),
          homme: buildGenderStats(genderData?.homme),
        },
        programs,
      };
    });

  return {
    totalPrograms: uniquePrograms.size,
    byYear,
  };
}
