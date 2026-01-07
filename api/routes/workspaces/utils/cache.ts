import type { Document } from 'mongodb';
import { collections } from '~/database/mongo';
import type {
  EmploymentRates,
  InsersupGenderStats,
  InsersupYearStats,
  WorkspaceCacheDoc,
} from '~/database/types';

interface InsersupAggResult extends Document {
  _id: string;
  programs: string[];
  nbEtudiants: number;
  nbSortants: number;
  nbPoursuivants: number;
  emploiNonSal6: number;
  emploiNonSal12: number;
  emploiNonSal18: number;
  emploiNonSal24: number;
  emploiNonSal30: number;
  emploiSalFr6: number;
  emploiSalFr12: number;
  emploiSalFr18: number;
  emploiSalFr24: number;
  emploiSalFr30: number;
  emploiStable6: number;
  emploiStable12: number;
  emploiStable18: number;
  emploiStable24: number;
  emploiStable30: number;
}

interface InsersupGenderAggResult extends Document {
  _id: { promo: string; genre: string };
  nbSortants: number;
  emploiNonSal6: number;
  emploiNonSal12: number;
  emploiNonSal18: number;
  emploiNonSal24: number;
  emploiNonSal30: number;
  emploiSalFr6: number;
  emploiSalFr12: number;
  emploiSalFr18: number;
  emploiSalFr24: number;
  emploiSalFr30: number;
  emploiStable6: number;
  emploiStable12: number;
  emploiStable18: number;
  emploiStable24: number;
  emploiStable30: number;
}

interface InsersupNationalityAggResult extends Document {
  _id: string;
  nbSortants: number;
}

const PRIVACY_THRESHOLD = 20;

const NOT_BEFORE = '2015';
const LAST_YEAR = '2025';

/**
 * Compute SISE aggregations for a workspace and update the cache
 */
export async function updateWorkspaceCache(workspaceId: string): Promise<WorkspaceCacheDoc | null> {
  // Get the workspace to retrieve program IDs
  const workspace = await collections.workspaces.findOne(
    { id: workspaceId },
    { projection: { programs: 1 } },
  );

  if (!workspace) {
    return null;
  }

  const programIds = workspace.programs || [];

  // If no programs, store empty cache
  if (programIds.length === 0) {
    const emptyCache: WorkspaceCacheDoc = {
      workspaceId,
      updatedAt: new Date(),
      programCount: 0,
      studentsAggregations: {
        totalPrograms: 0,
        totalStudents: 0,
        totalFemale: 0,
        totalMale: 0,
        byYear: [],
        byCycle: [],
        byAcademy: [],
        byRegion: [],
        byDiploma: [],
        byInstitution: [],
        byDiscipline: [],
        byLargeDiscipline: [],
      },
      programAggregations: {
        byCycle: [],
        byAcademy: [],
        byRegion: [],
        byDiploma: [],
        byInstitution: [],
        byDiscipline: [],
        byRome: [],
      },
      insersupAggregations: {
        totalPrograms: 0,
        totalSortants: 0,
        totalEtudiants: 0,
        totalPoursuivants: 0,
        totalSortantsFrancais: 0,
        totalSortantsEtrangers: 0,
        canShowPercentages: false,
        byYear: [],
        globalRates: null,
        globalRatesByGender: null,
      },
    };

    await collections.workspaceCache.updateOne(
      { workspaceId },
      { $set: emptyCache },
      { upsert: true },
    );

    return emptyCache;
  }

  // Run aggregation pipeline on SISE collection (for student counts)
  const sisePipeline = [
    // Match documents where inf is in the workspace programs
    { $match: { inf: { $in: programIds } } },

    // Compute all aggregations in a single pass using $facet
    {
      $facet: {
        // Total counts
        totals: [
          { $match: { annee: LAST_YEAR } },
          {
            $group: {
              _id: null,
              totalStudents: { $sum: '$effectif' },
              totalFemale: { $sum: '$femmes' },
              totalMale: { $sum: '$hommes' },
              totalPrograms: { $addToSet: '$inf' },
            },
          },
          {
            $project: {
              _id: 0,
              totalStudents: 1,
              totalFemale: 1,
              totalMale: 1,
              totalPrograms: { $size: '$totalPrograms' },
            },
          },
        ],

        // By year
        byYear: [
          { $match: { annee: { $gte: NOT_BEFORE } } },
          {
            $group: {
              _id: '$annee_universitaire',
              total: { $sum: '$effectif' },
              female: { $sum: '$femmes' },
              male: { $sum: '$hommes' },
            },
          },
          { $sort: { _id: -1 } },
          {
            $project: {
              _id: 0,
              year: '$_id',
              total: 1,
              female: 1,
              male: 1,
            },
          },
        ],

        // By cycle (cursus_lmd)
        byCycle: [
          { $match: { annee: LAST_YEAR } },
          {
            $group: {
              _id: '$cursus_lmd',
              total: { $sum: '$effectif' },
              female: { $sum: '$femmes' },
              male: { $sum: '$hommes' },
            },
          },
          { $sort: { total: -1 } },
          {
            $project: {
              _id: 0,
              cycle: '$_id',
              total: 1,
              female: 1,
              male: 1,
            },
          },
        ],

        // By academy
        byAcademy: [
          { $match: { annee: LAST_YEAR } },
          {
            $group: {
              _id: '$etablissement_academie',
              total: { $sum: '$effectif' },
              female: { $sum: '$femmes' },
              male: { $sum: '$hommes' },
            },
          },
          { $sort: { total: -1 } },
          {
            $project: {
              _id: 0,
              academy: '$_id',
              total: 1,
              female: 1,
              male: 1,
            },
          },
        ],

        // By region
        byRegion: [
          { $match: { annee: LAST_YEAR } },
          {
            $group: {
              _id: '$etablissement_region',
              total: { $sum: '$effectif' },
              female: { $sum: '$femmes' },
              male: { $sum: '$hommes' },
            },
          },
          { $sort: { total: -1 } },
          {
            $project: {
              _id: 0,
              region: '$_id',
              total: 1,
              female: 1,
              male: 1,
            },
          },
        ],

        // By diploma type
        byDiploma: [
          { $match: { annee: LAST_YEAR } },
          {
            $group: {
              _id: { diploma: '$typ_diplome', diplomaLabel: '$typ_diplome_lib' },
              total: { $sum: '$effectif' },
              female: { $sum: '$femmes' },
              male: { $sum: '$hommes' },
            },
          },
          { $sort: { total: -1 } },
          {
            $project: {
              _id: 0,
              diploma: '$_id.diploma',
              diplomaLabel: '$_id.diplomaLabel',
              total: 1,
              female: 1,
              male: 1,
            },
          },
        ],

        // By institution
        byInstitution: [
          { $match: { annee: LAST_YEAR } },
          {
            $group: {
              _id: { paysageId: 'etablissement_id_paysage', name: '$etablissement_lib' },
              total: { $sum: '$effectif' },
              female: { $sum: '$femmes' },
              male: { $sum: '$hommes' },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 50 }, // Limit to top 50 institutions
          {
            $project: {
              _id: 0,
              paysageId: '$_id.uai',
              name: '$_id.name',
              total: 1,
              female: 1,
              male: 1,
            },
          },
        ],

        // By discipline
        byDiscipline: [
          { $match: { annee: LAST_YEAR } },
          {
            $group: {
              _id: {
                discipline: '$sect_disciplinaire',
                disciplineLabel: '$sect_disciplinaire_lib',
              },
              total: { $sum: '$effectif' },
              female: { $sum: '$femmes' },
              male: { $sum: '$hommes' },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 30 }, // Limit to top 30 disciplines
          {
            $project: {
              _id: 0,
              id: '$_id.discipline',
              label: '$_id.disciplineLabel',
              total: 1,
              female: 1,
              male: 1,
            },
          },
        ],
        byLargeDiscipline: [
          { $match: { annee: LAST_YEAR } },
          {
            $group: {
              _id: {
                discipline: '$gd_disciscipline',
                disciplineLabel: '$gd_disciscipline_lib',
              },
              total: { $sum: '$effectif' },
              female: { $sum: '$femmes' },
              male: { $sum: '$hommes' },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 30 }, // Limit to top 30 disciplines
          {
            $project: {
              _id: 0,
              id: '$_id.discipline',
              label: '$_id.disciplineLabel',
              total: 1,
              female: 1,
              male: 1,
            },
          },
        ],
      },
    },
  ];

  // Run aggregation pipeline on programs collection (for program counts)
  const programsPipeline = [
    // Match programs in the workspace
    { $match: { inf: { $in: programIds } } },

    // Compute all aggregations in a single pass using $facet
    {
      $facet: {
        // By cycle
        byCycle: [
          {
            $group: {
              _id: '$cycle',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          {
            $project: {
              _id: 0,
              cycle: '$_id',
              count: 1,
            },
          },
        ],

        // By academy (unwind etablissements first since it's an array)
        byAcademy: [
          { $unwind: '$etablissements' },
          {
            $group: {
              _id: '$etablissements.academy',
              // Use $addToSet to count unique programs, not etablissements
              programs: { $addToSet: '$inf' },
            },
          },
          {
            $project: {
              _id: 0,
              academy: '$_id',
              count: { $size: '$programs' },
            },
          },
          { $sort: { count: -1 } },
        ],

        // By region (unwind etablissements first since it's an array)
        byRegion: [
          { $unwind: '$etablissements' },
          {
            $group: {
              _id: '$etablissements.region',
              // Use $addToSet to count unique programs, not etablissements
              programs: { $addToSet: '$inf' },
            },
          },
          {
            $project: {
              _id: 0,
              region: '$_id',
              count: { $size: '$programs' },
            },
          },
          { $sort: { count: -1 } },
        ],

        // By diploma type
        byDiploma: [
          {
            $group: {
              _id: { diploma: '$diploma.code', diplomaLabel: '$diploma.type' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          {
            $project: {
              _id: 0,
              diploma: '$_id.diploma',
              diplomaLabel: '$_id.diplomaLabel',
              count: 1,
            },
          },
        ],

        // By institution (unwind etablissements first since it's an array)
        byInstitution: [
          { $unwind: '$etablissements' },
          {
            $group: {
              _id: { uai: '$etablissements.uai', name: '$etablissements.name' },
              // Use $addToSet to count unique programs, not etablissements
              programs: { $addToSet: '$inf' },
            },
          },
          {
            $project: {
              _id: 0,
              uai: '$_id.uai',
              name: '$_id.name',
              count: { $size: '$programs' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 50 }, // Limit to top 50 institutions
        ],

        // By disciplinary sector
        byDiscipline: [
          {
            $match: { disciplinarySector: { $exists: true, $ne: null } },
          },
          {
            $group: {
              _id: '$disciplinarySector',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          {
            $project: {
              _id: 0,
              discipline: '$_id',
              count: 1,
            },
          },
        ],

        // By ROME level1 (grands domaines métiers) - unwind romeInfos array
        byRome: [
          { $match: { romeInfos: { $exists: true, $ne: [] } } },
          { $unwind: '$romeInfos' },
          {
            $group: {
              _id: { code: '$romeInfos.idLevel1', label: '$romeInfos.level1' },
              // Use $addToSet to count unique programs, not rome entries
              programs: { $addToSet: '$inf' },
            },
          },
          {
            $project: {
              _id: 0,
              code: '$_id.code',
              label: '$_id.label',
              count: { $size: '$programs' },
            },
          },
          { $sort: { count: -1 } },
        ],
      },
    },
  ];

  const insersupPipeline = [
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
        _id: '$promo',
        programs: { $addToSet: '$inf' },
        nbEtudiants: { $sum: '$nb_etudiants' },
        nbSortants: { $sum: '$nb_sortants' },
        nbPoursuivants: { $sum: '$nb_poursuivants' },
        emploiNonSal6: { $sum: '$nb_sortants_en_emploi_non_sal_6' },
        emploiNonSal12: { $sum: '$nb_sortants_en_emploi_non_sal_12' },
        emploiNonSal18: { $sum: '$nb_sortants_en_emploi_non_sal_18' },
        emploiNonSal24: { $sum: '$nb_sortants_en_emploi_non_sal_24' },
        emploiNonSal30: { $sum: '$nb_sortants_en_emploi_non_sal_30' },
        emploiSalFr6: { $sum: '$nb_sortants_en_emploi_sal_fr_6' },
        emploiSalFr12: { $sum: '$nb_sortants_en_emploi_sal_fr_12' },
        emploiSalFr18: { $sum: '$nb_sortants_en_emploi_sal_fr_18' },
        emploiSalFr24: { $sum: '$nb_sortants_en_emploi_sal_fr_24' },
        emploiSalFr30: { $sum: '$nb_sortants_en_emploi_sal_fr_30' },
        emploiStable6: { $sum: '$nb_sortants_en_emploi_stable_6' },
        emploiStable12: { $sum: '$nb_sortants_en_emploi_stable_12' },
        emploiStable18: { $sum: '$nb_sortants_en_emploi_stable_18' },
        emploiStable24: { $sum: '$nb_sortants_en_emploi_stable_24' },
        emploiStable30: { $sum: '$nb_sortants_en_emploi_stable_30' },
      },
    },
    { $sort: { _id: -1 as const } },
  ];

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
        emploiNonSal6: { $sum: '$nb_sortants_en_emploi_non_sal_6' },
        emploiNonSal12: { $sum: '$nb_sortants_en_emploi_non_sal_12' },
        emploiNonSal18: { $sum: '$nb_sortants_en_emploi_non_sal_18' },
        emploiNonSal24: { $sum: '$nb_sortants_en_emploi_non_sal_24' },
        emploiNonSal30: { $sum: '$nb_sortants_en_emploi_non_sal_30' },
        emploiSalFr6: { $sum: '$nb_sortants_en_emploi_sal_fr_6' },
        emploiSalFr12: { $sum: '$nb_sortants_en_emploi_sal_fr_12' },
        emploiSalFr18: { $sum: '$nb_sortants_en_emploi_sal_fr_18' },
        emploiSalFr24: { $sum: '$nb_sortants_en_emploi_sal_fr_24' },
        emploiSalFr30: { $sum: '$nb_sortants_en_emploi_sal_fr_30' },
        emploiStable6: { $sum: '$nb_sortants_en_emploi_stable_6' },
        emploiStable12: { $sum: '$nb_sortants_en_emploi_stable_12' },
        emploiStable18: { $sum: '$nb_sortants_en_emploi_stable_18' },
        emploiStable24: { $sum: '$nb_sortants_en_emploi_stable_24' },
        emploiStable30: { $sum: '$nb_sortants_en_emploi_stable_30' },
      },
    },
  ];

  const insersupNationalityPipeline = [
    {
      $match: {
        inf: { $in: programIds },
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

  // Run all aggregations in parallel
  const [siseResults, programResults, insersupResults, insersupGenderResults, insersupNationalityResults] = await Promise.all([
    collections.sise.aggregate(sisePipeline).toArray(),
    collections.programs.aggregate(programsPipeline).toArray(),
    collections.insersup.aggregate<InsersupAggResult>(insersupPipeline).toArray(),
    collections.insersup.aggregate<InsersupGenderAggResult>(insersupGenderPipeline).toArray(),
    collections.insersup.aggregate<InsersupNationalityAggResult>(insersupNationalityPipeline).toArray(),
  ]);

  const siseResult = siseResults[0];
  const programResult = programResults[0];

  // Extract totals (handle empty result)
  const totals = siseResult?.totals?.[0] || {
    totalStudents: 0,
    totalFemale: 0,
    totalMale: 0,
    totalPrograms: 0,
  };

  const computeRates = (
    sortants: number,
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
    emploiSalFr: EmploymentRates;
    emploiNonSal: EmploymentRates;
    emploiStable: EmploymentRates;
  } => {
    const pct = (val: number) => (sortants > 0 ? Math.round((val / sortants) * 1000) / 10 : null);
    return {
      emploiSalFr: {
        m6: pct(data.sal6),
        m12: pct(data.sal12),
        m18: pct(data.sal18),
        m24: pct(data.sal24),
        m30: pct(data.sal30),
      },
      emploiNonSal: {
        m6: pct(data.nonSal6),
        m12: pct(data.nonSal12),
        m18: pct(data.nonSal18),
        m24: pct(data.nonSal24),
        m30: pct(data.nonSal30),
      },
      emploiStable: {
        m6: pct(data.stable6),
        m12: pct(data.stable12),
        m18: pct(data.stable18),
        m24: pct(data.stable24),
        m30: pct(data.stable30),
      },
    };
  };

  const buildGenderStats = (
    genderData: InsersupGenderAggResult | undefined,
  ): InsersupGenderStats | null => {
    if (!genderData) return null;
    const nbSortants = genderData.nbSortants;
    const canShow = nbSortants >= PRIVACY_THRESHOLD;
    if (!canShow) {
      return {
        nbSortants,
        canShowPercentages: false,
        emploiSalFr: null,
        emploiNonSal: null,
        emploiStable: null,
      };
    }
    const rates = computeRates(nbSortants, {
      sal6: genderData.emploiSalFr6,
      sal12: genderData.emploiSalFr12,
      sal18: genderData.emploiSalFr18,
      sal24: genderData.emploiSalFr24,
      sal30: genderData.emploiSalFr30,
      nonSal6: genderData.emploiNonSal6,
      nonSal12: genderData.emploiNonSal12,
      nonSal18: genderData.emploiNonSal18,
      nonSal24: genderData.emploiNonSal24,
      nonSal30: genderData.emploiNonSal30,
      stable6: genderData.emploiStable6,
      stable12: genderData.emploiStable12,
      stable18: genderData.emploiStable18,
      stable24: genderData.emploiStable24,
      stable30: genderData.emploiStable30,
    });
    return {
      nbSortants,
      canShowPercentages: true,
      emploiSalFr: rates.emploiSalFr,
      emploiNonSal: rates.emploiNonSal,
      emploiStable: rates.emploiStable,
    };
  };

  const genderByPromo = new Map<
    string,
    { femme?: InsersupGenderAggResult; homme?: InsersupGenderAggResult }
  >();
  for (const g of insersupGenderResults) {
    const promo = g._id.promo;
    if (!genderByPromo.has(promo)) {
      genderByPromo.set(promo, {});
    }
    const entry = genderByPromo.get(promo)!;
    if (g._id.genre === 'femme') {
      entry.femme = g;
    } else if (g._id.genre === 'homme') {
      entry.homme = g;
    }
  }

  const totalSortantsFrancais =
    insersupNationalityResults.find((n) => n._id === 'français')?.nbSortants || 0;
  const totalSortantsEtrangers =
    insersupNationalityResults.find((n) => n._id === 'étranger')?.nbSortants || 0;

  let globalFemmeSortants = 0;
  let globalHommeSortants = 0;
  const globalFemmeData = {
    sal6: 0, sal12: 0, sal18: 0, sal24: 0, sal30: 0,
    nonSal6: 0, nonSal12: 0, nonSal18: 0, nonSal24: 0, nonSal30: 0,
    stable6: 0, stable12: 0, stable18: 0, stable24: 0, stable30: 0,
  };
  const globalHommeData = {
    sal6: 0, sal12: 0, sal18: 0, sal24: 0, sal30: 0,
    nonSal6: 0, nonSal12: 0, nonSal18: 0, nonSal24: 0, nonSal30: 0,
    stable6: 0, stable12: 0, stable18: 0, stable24: 0, stable30: 0,
  };

  for (const g of insersupGenderResults) {
    if (g._id.genre === 'femme') {
      globalFemmeSortants += g.nbSortants;
      globalFemmeData.sal6 += g.emploiSalFr6;
      globalFemmeData.sal12 += g.emploiSalFr12;
      globalFemmeData.sal18 += g.emploiSalFr18;
      globalFemmeData.sal24 += g.emploiSalFr24;
      globalFemmeData.sal30 += g.emploiSalFr30;
      globalFemmeData.nonSal6 += g.emploiNonSal6;
      globalFemmeData.nonSal12 += g.emploiNonSal12;
      globalFemmeData.nonSal18 += g.emploiNonSal18;
      globalFemmeData.nonSal24 += g.emploiNonSal24;
      globalFemmeData.nonSal30 += g.emploiNonSal30;
      globalFemmeData.stable6 += g.emploiStable6;
      globalFemmeData.stable12 += g.emploiStable12;
      globalFemmeData.stable18 += g.emploiStable18;
      globalFemmeData.stable24 += g.emploiStable24;
      globalFemmeData.stable30 += g.emploiStable30;
    } else if (g._id.genre === 'homme') {
      globalHommeSortants += g.nbSortants;
      globalHommeData.sal6 += g.emploiSalFr6;
      globalHommeData.sal12 += g.emploiSalFr12;
      globalHommeData.sal18 += g.emploiSalFr18;
      globalHommeData.sal24 += g.emploiSalFr24;
      globalHommeData.sal30 += g.emploiSalFr30;
      globalHommeData.nonSal6 += g.emploiNonSal6;
      globalHommeData.nonSal12 += g.emploiNonSal12;
      globalHommeData.nonSal18 += g.emploiNonSal18;
      globalHommeData.nonSal24 += g.emploiNonSal24;
      globalHommeData.nonSal30 += g.emploiNonSal30;
      globalHommeData.stable6 += g.emploiStable6;
      globalHommeData.stable12 += g.emploiStable12;
      globalHommeData.stable18 += g.emploiStable18;
      globalHommeData.stable24 += g.emploiStable24;
      globalHommeData.stable30 += g.emploiStable30;
    }
  }

  let insersupTotalSortants = 0;
  let insersupTotalEtudiants = 0;
  let insersupTotalPoursuivants = 0;
  let globalSal6 = 0,
    globalSal12 = 0,
    globalSal18 = 0,
    globalSal24 = 0,
    globalSal30 = 0;
  let globalNonSal6 = 0,
    globalNonSal12 = 0,
    globalNonSal18 = 0,
    globalNonSal24 = 0,
    globalNonSal30 = 0;
  let globalStable6 = 0,
    globalStable12 = 0,
    globalStable18 = 0,
    globalStable24 = 0,
    globalStable30 = 0;
  const insersupPrograms = new Set<string>();

  const insersupByYear: InsersupYearStats[] = insersupResults.map((row) => {
    const nbSortants = row.nbSortants;
    const nbEtudiants = row.nbEtudiants;
    const nbPoursuivants = row.nbPoursuivants;

    insersupTotalSortants += nbSortants;
    insersupTotalEtudiants += nbEtudiants;
    insersupTotalPoursuivants += nbPoursuivants;

    for (const p of row.programs) {
      insersupPrograms.add(p);
    }

    globalSal6 += row.emploiSalFr6;
    globalSal12 += row.emploiSalFr12;
    globalSal18 += row.emploiSalFr18;
    globalSal24 += row.emploiSalFr24;
    globalSal30 += row.emploiSalFr30;
    globalNonSal6 += row.emploiNonSal6;
    globalNonSal12 += row.emploiNonSal12;
    globalNonSal18 += row.emploiNonSal18;
    globalNonSal24 += row.emploiNonSal24;
    globalNonSal30 += row.emploiNonSal30;
    globalStable6 += row.emploiStable6;
    globalStable12 += row.emploiStable12;
    globalStable18 += row.emploiStable18;
    globalStable24 += row.emploiStable24;
    globalStable30 += row.emploiStable30;

    const canShowPercentages = nbSortants >= PRIVACY_THRESHOLD;

    const genderData = genderByPromo.get(row._id);
    const femmeStats = buildGenderStats(genderData?.femme);
    const hommeStats = buildGenderStats(genderData?.homme);

    if (canShowPercentages) {
      const rates = computeRates(nbSortants, {
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
      return {
        promo: row._id,
        nbEtudiants,
        nbSortants,
        nbPoursuivants,
        canShowPercentages: true,
        emploiSalFr: rates.emploiSalFr,
        emploiNonSal: rates.emploiNonSal,
        emploiStable: rates.emploiStable,
        byGender: { femme: femmeStats, homme: hommeStats },
      };
    }

    return {
      promo: row._id,
      nbEtudiants,
      nbSortants,
      nbPoursuivants,
      canShowPercentages: false,
      emploiSalFr: null,
      emploiNonSal: null,
      emploiStable: null,
      byGender: { femme: femmeStats, homme: hommeStats },
    };
  });

  const insersupGlobalCanShow = insersupTotalSortants >= PRIVACY_THRESHOLD;
  const globalFemmeCanShow = globalFemmeSortants >= PRIVACY_THRESHOLD;
  const globalHommeCanShow = globalHommeSortants >= PRIVACY_THRESHOLD;

  const cacheDoc: WorkspaceCacheDoc = {
    workspaceId,
    updatedAt: new Date(),
    programCount: programIds.length,
    studentsAggregations: {
      totalStudents: totals.totalStudents || 0,
      totalFemale: totals.totalFemale || 0,
      totalMale: totals.totalMale || 0,
      totalPrograms: totals.totalPrograms || 0,
      byYear: siseResult?.byYear || [],
      byCycle: siseResult?.byCycle || [],
      byAcademy: siseResult?.byAcademy || [],
      byRegion: siseResult?.byRegion || [],
      byDiploma: siseResult?.byDiploma || [],
      byInstitution: siseResult?.byInstitution || [],
      byDiscipline: siseResult?.byDiscipline || [],
      byLargeDiscipline: siseResult?.byLargeDiscipline || [],
    },
    programAggregations: {
      byCycle: programResult?.byCycle || [],
      byAcademy: programResult?.byAcademy || [],
      byRegion: programResult?.byRegion || [],
      byDiploma: programResult?.byDiploma || [],
      byInstitution: programResult?.byInstitution || [],
      byDiscipline: programResult?.byDiscipline || [],
      byRome: programResult?.byRome || [],
    },
    insersupAggregations: {
      totalPrograms: insersupPrograms.size,
      totalSortants: insersupTotalSortants,
      totalEtudiants: insersupTotalEtudiants,
      totalPoursuivants: insersupTotalPoursuivants,
      totalSortantsFrancais,
      totalSortantsEtrangers,
      canShowPercentages: insersupGlobalCanShow,
      byYear: insersupByYear,
      globalRates: insersupGlobalCanShow
        ? computeRates(insersupTotalSortants, {
            sal6: globalSal6,
            sal12: globalSal12,
            sal18: globalSal18,
            sal24: globalSal24,
            sal30: globalSal30,
            nonSal6: globalNonSal6,
            nonSal12: globalNonSal12,
            nonSal18: globalNonSal18,
            nonSal24: globalNonSal24,
            nonSal30: globalNonSal30,
            stable6: globalStable6,
            stable12: globalStable12,
            stable18: globalStable18,
            stable24: globalStable24,
            stable30: globalStable30,
          })
        : null,
      globalRatesByGender: {
        femme: globalFemmeCanShow
          ? {
              nbSortants: globalFemmeSortants,
              canShowPercentages: true,
              ...computeRates(globalFemmeSortants, globalFemmeData),
            }
          : {
              nbSortants: globalFemmeSortants,
              canShowPercentages: false,
              emploiSalFr: null,
              emploiNonSal: null,
              emploiStable: null,
            },
        homme: globalHommeCanShow
          ? {
              nbSortants: globalHommeSortants,
              canShowPercentages: true,
              ...computeRates(globalHommeSortants, globalHommeData),
            }
          : {
              nbSortants: globalHommeSortants,
              canShowPercentages: false,
              emploiSalFr: null,
              emploiNonSal: null,
              emploiStable: null,
            },
      },
    },
  };

  // Upsert the cache document
  await collections.workspaceCache.updateOne({ workspaceId }, { $set: cacheDoc }, { upsert: true });

  return cacheDoc;
}

/**
 * Get cached aggregations for a workspace
 * Returns null if cache doesn't exist
 */
export async function getWorkspaceCache(workspaceId: string): Promise<WorkspaceCacheDoc | null> {
  return collections.workspaceCache.findOne({ workspaceId });
}

/**
 * Get cached aggregations, computing if necessary
 * @param maxAge Maximum age in milliseconds before recomputing (default: 1 hour)
 */
export async function getOrComputeWorkspaceCache(
  workspaceId: string,
  maxAge: number = 3600000,
): Promise<WorkspaceCacheDoc | null> {
  const cached = await getWorkspaceCache(workspaceId);

  if (cached) {
    const age = Date.now() - cached.updatedAt.getTime();
    if (age < maxAge) {
      return cached;
    }
  }

  // Cache is stale or doesn't exist, recompute
  return updateWorkspaceCache(workspaceId);
}

/**
 * Invalidate (delete) the cache for a workspace
 * Call this when programs are added/removed
 */
export async function invalidateWorkspaceCache(workspaceId: string): Promise<void> {
  await collections.workspaceCache.deleteOne({ workspaceId });
}

/**
 * Invalidate and immediately recompute cache
 * Use this for immediate feedback after program changes
 */
export async function refreshWorkspaceCache(
  workspaceId: string,
): Promise<WorkspaceCacheDoc | null> {
  await invalidateWorkspaceCache(workspaceId);
  return updateWorkspaceCache(workspaceId);
}
