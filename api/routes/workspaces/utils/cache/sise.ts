import { collections } from '~/database/mongo';
import type { SiseAggregations, SiseYearStats } from '~/schemas/aggregations';

const NOT_BEFORE = '2015';

export const emptySiseAggregations: SiseAggregations = {
  byYear: [],
};

interface YearTotalsResult {
  _id: string;
  totalStudents: number;
  totalFemale: number;
  totalMale: number;
  programs: string[];
}

interface ProgramResult {
  _id: { year: string; inf: string };
  totalStudents: number;
  totalFemale: number;
  totalMale: number;
}

interface GroupedResult {
  _id: { year: string; key: string; keyLabel?: string };
  total: number;
  female: number;
  male: number;
}

interface InstitutionResult {
  _id: { year: string; paysageId: string; name: string };
  total: number;
  female: number;
  male: number;
}

/**
 * Compute SISE (student counts) aggregations for a workspace
 * Returns per-year detailed breakdowns
 */
export async function computeSiseAggregations(programIds: string[]): Promise<SiseAggregations> {
  if (programIds.length === 0) {
    return emptySiseAggregations;
  }

  // Pipeline 1: Get totals by year
  const totalsByYearPipeline = [
    { $match: { inf: { $in: programIds }, annee: { $gte: NOT_BEFORE } } },
    {
      $group: {
        _id: '$annee_universitaire',
        totalStudents: { $sum: '$effectif' },
        totalFemale: { $sum: '$femmes' },
        totalMale: { $sum: '$hommes' },
        programs: { $addToSet: '$inf' },
      },
    },
    { $sort: { _id: -1 as const } },
  ];

  // Pipeline 2: By cycle per year
  const byCyclePipeline = [
    { $match: { inf: { $in: programIds }, annee: { $gte: NOT_BEFORE } } },
    {
      $group: {
        _id: { year: '$annee_universitaire', key: '$cursus_lmd' },
        total: { $sum: '$effectif' },
        female: { $sum: '$femmes' },
        male: { $sum: '$hommes' },
      },
    },
  ];

  // Pipeline 3: By academy per year
  const byAcademyPipeline = [
    { $match: { inf: { $in: programIds }, annee: { $gte: NOT_BEFORE } } },
    {
      $group: {
        _id: { year: '$annee_universitaire', key: '$etablissement_academie' },
        total: { $sum: '$effectif' },
        female: { $sum: '$femmes' },
        male: { $sum: '$hommes' },
      },
    },
  ];

  // Pipeline 4: By region per year
  const byRegionPipeline = [
    { $match: { inf: { $in: programIds }, annee: { $gte: NOT_BEFORE } } },
    {
      $group: {
        _id: { year: '$annee_universitaire', key: '$etablissement_region' },
        total: { $sum: '$effectif' },
        female: { $sum: '$femmes' },
        male: { $sum: '$hommes' },
      },
    },
  ];

  // Pipeline 5: By diploma per year
  const byDiplomaPipeline = [
    { $match: { inf: { $in: programIds }, annee: { $gte: NOT_BEFORE } } },
    {
      $group: {
        _id: {
          year: '$annee_universitaire',
          key: '$typ_diplome',
          keyLabel: '$typ_diplome_lib',
        },
        total: { $sum: '$effectif' },
        female: { $sum: '$femmes' },
        male: { $sum: '$hommes' },
      },
    },
  ];

  // Pipeline 6: By institution per year
  const byInstitutionPipeline = [
    { $match: { inf: { $in: programIds }, annee: { $gte: NOT_BEFORE } } },
    {
      $group: {
        _id: {
          year: '$annee_universitaire',
          paysageId: '$etablissement_id_paysage',
          name: '$etablissement_lib',
        },
        total: { $sum: '$effectif' },
        female: { $sum: '$femmes' },
        male: { $sum: '$hommes' },
      },
    },
  ];

  // Pipeline 7: By discipline per year
  const byDisciplinePipeline = [
    { $match: { inf: { $in: programIds }, annee: { $gte: NOT_BEFORE } } },
    {
      $group: {
        _id: {
          year: '$annee_universitaire',
          key: '$sect_disciplinaire',
          keyLabel: '$sect_disciplinaire_lib',
        },
        total: { $sum: '$effectif' },
        female: { $sum: '$femmes' },
        male: { $sum: '$hommes' },
      },
    },
  ];

  // Pipeline 8: By large discipline per year
  const byLargeDisciplinePipeline = [
    { $match: { inf: { $in: programIds }, annee: { $gte: NOT_BEFORE } } },
    {
      $group: {
        _id: {
          year: '$annee_universitaire',
          key: '$gd_disciscipline',
          keyLabel: '$gd_disciscipline_lib',
        },
        total: { $sum: '$effectif' },
        female: { $sum: '$femmes' },
        male: { $sum: '$hommes' },
      },
    },
  ];

  // Pipeline 9: Per-program data per year
  const byProgramPipeline = [
    { $match: { inf: { $in: programIds }, annee: { $gte: NOT_BEFORE } } },
    {
      $group: {
        _id: { year: '$annee_universitaire', inf: '$inf' },
        totalStudents: { $sum: '$effectif' },
        totalFemale: { $sum: '$femmes' },
        totalMale: { $sum: '$hommes' },
      },
    },
    { $sort: { totalStudents: -1 as const } },
  ];

  // Run all pipelines in parallel
  const [
    totalsByYear,
    byCycleResults,
    byAcademyResults,
    byRegionResults,
    byDiplomaResults,
    byInstitutionResults,
    byDisciplineResults,
    byLargeDisciplineResults,
    byProgramResults,
  ] = await Promise.all([
    collections.sise.aggregate<YearTotalsResult>(totalsByYearPipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byCyclePipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byAcademyPipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byRegionPipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byDiplomaPipeline).toArray(),
    collections.sise.aggregate<InstitutionResult>(byInstitutionPipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byDisciplinePipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byLargeDisciplinePipeline).toArray(),
    collections.sise.aggregate<ProgramResult>(byProgramPipeline).toArray(),
  ]);

  // Helper to group results by year
  function groupByYear<T extends { _id: { year: string } }>(results: T[]): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const r of results) {
      const year = r._id.year;
      if (!map.has(year)) {
        map.set(year, []);
      }
      map.get(year)!.push(r);
    }
    return map;
  }

  // Group all breakdown results by year
  const cycleByYear = groupByYear(byCycleResults);
  const academyByYear = groupByYear(byAcademyResults);
  const regionByYear = groupByYear(byRegionResults);
  const programByYear = groupByYear(byProgramResults);
  const diplomaByYear = groupByYear(byDiplomaResults);
  const institutionByYear = groupByYear(byInstitutionResults);
  const disciplineByYear = groupByYear(byDisciplineResults);
  const largeDisciplineByYear = groupByYear(byLargeDisciplineResults);

  // Build the byYear array
  const byYear: SiseYearStats[] = totalsByYear.map((yearData) => {
    const year = yearData._id;

    // Helper to build sorted breakdown arrays
    const buildBreakdown = (
      results: GroupedResult[] | undefined,
      keyMapper: (r: GroupedResult) => Record<string, unknown>,
    ) => {
      if (!results) return [];
      return results
        .filter((r) => r._id.key)
        .sort((a, b) => b.total - a.total)
        .map((r) => ({
          ...keyMapper(r),
          total: r.total,
          female: r.female,
          male: r.male,
        }));
    };

    return {
      year,
      totalPrograms: yearData.programs.length,
      totalStudents: yearData.totalStudents,
      totalFemale: yearData.totalFemale,
      totalMale: yearData.totalMale,
      programs: (programByYear.get(year) || [])
        .sort((a, b) => b.totalStudents - a.totalStudents)
        .map((p) => ({
          inf: p._id.inf,
          totalStudents: p.totalStudents,
          totalFemale: p.totalFemale,
          totalMale: p.totalMale,
        })),
      byCycle: buildBreakdown(cycleByYear.get(year), (r) => ({
        cycle: r._id.key,
      })) as SiseYearStats['byCycle'],
      byAcademy: buildBreakdown(academyByYear.get(year), (r) => ({
        academy: r._id.key,
      })) as SiseYearStats['byAcademy'],
      byRegion: buildBreakdown(regionByYear.get(year), (r) => ({
        region: r._id.key,
      })) as SiseYearStats['byRegion'],
      byDiploma: buildBreakdown(diplomaByYear.get(year), (r) => ({
        diploma: r._id.key,
        diplomaLabel: r._id.keyLabel || r._id.key,
      })) as SiseYearStats['byDiploma'],
      byInstitution: (institutionByYear.get(year) || [])
        .filter((r) => r._id.paysageId)
        .sort((a, b) => b.total - a.total)
        .slice(0, 50)
        .map((r) => ({
          paysageId: r._id.paysageId,
          name: r._id.name || 'Non renseigné',
          total: r.total,
          female: r.female,
          male: r.male,
        })),
      byDiscipline: buildBreakdown(disciplineByYear.get(year), (r) => ({
        id: String(r._id.key),
        label: r._id.keyLabel || String(r._id.key),
      })).slice(0, 30) as SiseYearStats['byDiscipline'],
      byLargeDiscipline: buildBreakdown(largeDisciplineByYear.get(year), (r) => ({
        id: String(r._id.key),
        label: r._id.keyLabel || String(r._id.key),
      })).slice(0, 30) as SiseYearStats['byLargeDiscipline'],
    };
  });

  return {
    byYear,
  };
}
