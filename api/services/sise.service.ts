import { collections } from '~/database/mongo';
import type { SiseAggregations, SiseYearStats } from '~/schemas/aggregations';
import type { ProgramSiseStats } from '~/schemas/programs';

// ============================================================================
// Constants
// ============================================================================

const SISE_NOT_BEFORE = '2015';

const ENROLLMENT_SUM_FIELDS = {
  total: { $sum: '$effectif' },
  female: { $sum: '$femmes' },
  male: { $sum: '$hommes' },
};

// ============================================================================
// Types (internal)
// ============================================================================

interface YearTotalsResult {
  _id: string;
  total: number;
  female: number;
  male: number;
}

interface ProgramYearTotalsResult {
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

// ============================================================================
// Utilities (internal)
// ============================================================================

function siseBaseMatch(programIds: string | string[]) {
  return {
    inf: typeof programIds === 'string' ? programIds : { $in: programIds },
    annee: { $gte: SISE_NOT_BEFORE },
  };
}

function buildBreakdownPipeline(match: Record<string, unknown>, groupId: Record<string, string>) {
  return [{ $match: match }, { $group: { _id: groupId, ...ENROLLMENT_SUM_FIELDS } }];
}

function groupByYear<T extends { _id: { year: string } }>(results: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const r of results) {
    const year = r._id.year;
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(r);
  }
  return map;
}

// ============================================================================
// Empty state
// ============================================================================

export const emptySiseAggregations: SiseAggregations = {
  byYear: [],
};

// ============================================================================
// Program-level aggregation (detail view)
// ============================================================================

export async function aggregateSiseForProgram(inf: string): Promise<ProgramSiseStats> {
  const match = { inf };
  const yearField = '$annee_universitaire';

  const totalsQuery = collections.sise
    .aggregate<YearTotalsResult>([
      { $match: match },
      { $group: { _id: yearField, ...ENROLLMENT_SUM_FIELDS } },
      { $sort: { _id: 1 as const } },
    ])
    .toArray();

  const byStudyYearQuery = collections.sise
    .aggregate<GroupedResult>(
      buildBreakdownPipeline(match, { year: yearField, key: '$degetu_lib' }),
    )
    .toArray();

  const byCityQuery = collections.sise
    .aggregate<GroupedResult>(
      buildBreakdownPipeline(match, { year: yearField, key: '$implantation_commune' }),
    )
    .toArray();

  const [totals, byStudyYearResults, byCityResults] = await Promise.all([
    totalsQuery,
    byStudyYearQuery,
    byCityQuery,
  ]);

  const extractNumber = (s: string): number => {
    const m = /(\d+)/.exec(s);
    return m?.[1] ? parseInt(m[1], 10) : 999;
  };

  const studyYearByYear = groupByYear(byStudyYearResults);
  const cityByYear = groupByYear(byCityResults);

  return {
    byYear: totals.map((row) => ({
      year: row._id,
      total: row.total,
      women: row.female,
      men: row.male,
      byStudyYear: (studyYearByYear.get(row._id) || [])
        .filter((r) => r._id.key)
        .sort((a, b) => extractNumber(a._id.key) - extractNumber(b._id.key))
        .map((r) => ({ key: r._id.key, total: r.total, women: r.female, men: r.male })),
      byCity: (cityByYear.get(row._id) || [])
        .filter((r) => r._id.key)
        .sort((a, b) => b.total - a.total)
        .map((r) => ({ key: r._id.key, total: r.total, women: r.female, men: r.male })),
    })),
  };
}

// ============================================================================
// Workspace-level aggregation
// ============================================================================

export async function aggregateSiseForWorkspace(programIds: string[]): Promise<SiseAggregations> {
  if (programIds.length === 0) {
    return emptySiseAggregations;
  }

  const match = siseBaseMatch(programIds);
  const yearField = '$annee_universitaire';

  const totalsByYearPipeline = [
    { $match: match },
    {
      $group: {
        _id: yearField,
        totalStudents: { $sum: '$effectif' },
        totalFemale: { $sum: '$femmes' },
        totalMale: { $sum: '$hommes' },
        programs: { $addToSet: '$inf' },
      },
    },
    { $sort: { _id: -1 as const } },
  ];

  const byProgramPipeline = [
    { $match: match },
    {
      $group: {
        _id: { year: yearField, inf: '$inf' },
        totalStudents: { $sum: '$effectif' },
        totalFemale: { $sum: '$femmes' },
        totalMale: { $sum: '$hommes' },
      },
    },
    { $sort: { totalStudents: -1 as const } },
  ];

  const byInstitutionPipeline = [
    { $match: match },
    {
      $group: {
        _id: {
          year: yearField,
          paysageId: '$etablissement_id_paysage',
          name: '$etablissement_lib',
        },
        ...ENROLLMENT_SUM_FIELDS,
      },
    },
  ];

  const byCyclePipeline = buildBreakdownPipeline(match, {
    year: yearField,
    key: '$cursus_lmd',
  });
  const byAcademyPipeline = buildBreakdownPipeline(match, {
    year: yearField,
    key: '$etablissement_academie',
  });
  const byRegionPipeline = buildBreakdownPipeline(match, {
    year: yearField,
    key: '$etablissement_region',
  });
  const byDiplomaPipeline = buildBreakdownPipeline(match, {
    year: yearField,
    key: '$typ_diplome',
    keyLabel: '$typ_diplome_lib',
  });
  const byDisciplinePipeline = buildBreakdownPipeline(match, {
    year: yearField,
    key: '$sect_disciplinaire',
    keyLabel: '$sect_disciplinaire_lib',
  });
  const byLargeDisciplinePipeline = buildBreakdownPipeline(match, {
    year: yearField,
    key: '$gd_disciscipline',
    keyLabel: '$gd_disciscipline_lib',
  });

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
    collections.sise.aggregate<ProgramYearTotalsResult>(totalsByYearPipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byCyclePipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byAcademyPipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byRegionPipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byDiplomaPipeline).toArray(),
    collections.sise.aggregate<InstitutionResult>(byInstitutionPipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byDisciplinePipeline).toArray(),
    collections.sise.aggregate<GroupedResult>(byLargeDisciplinePipeline).toArray(),
    collections.sise.aggregate<ProgramResult>(byProgramPipeline).toArray(),
  ]);

  const cycleByYear = groupByYear(byCycleResults);
  const academyByYear = groupByYear(byAcademyResults);
  const regionByYear = groupByYear(byRegionResults);
  const programByYear = groupByYear(byProgramResults);
  const diplomaByYear = groupByYear(byDiplomaResults);
  const institutionByYear = groupByYear(byInstitutionResults);
  const disciplineByYear = groupByYear(byDisciplineResults);
  const largeDisciplineByYear = groupByYear(byLargeDisciplineResults);

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

  const byYear: SiseYearStats[] = totalsByYear.map((yearData) => {
    const year = yearData._id;

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

  return { byYear };
}
