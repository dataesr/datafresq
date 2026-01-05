import { collections } from '~/database/mongo';
import type { WorkspaceCacheDoc } from '~/database/types';

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

  // Run both aggregations in parallel
  const [siseResults, programResults] = await Promise.all([
    collections.sise.aggregate(sisePipeline).toArray(),
    collections.programs.aggregate(programsPipeline).toArray(),
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
