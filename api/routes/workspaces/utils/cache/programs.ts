import { collections } from '~/database/mongo';
import type { ProgramAggregations } from '~/schemas/aggregations';

export const emptyProgramAggregations: ProgramAggregations = {
  byCycle: [],
  byAcademy: [],
  byRegion: [],
  byDiploma: [],
  byInstitution: [],
  byDiscipline: [],
  byRome: [],
};

/**
 * Compute program aggregations for a workspace
 */
export async function computeProgramAggregations(
  programIds: string[],
): Promise<ProgramAggregations> {
  if (programIds.length === 0) {
    return emptyProgramAggregations;
  }

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
          { $limit: 50 },
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

  const results = await collections.programs.aggregate(programsPipeline).toArray();
  const result = results[0];

  return {
    byCycle: result?.byCycle || [],
    byAcademy: result?.byAcademy || [],
    byRegion: result?.byRegion || [],
    byDiploma: result?.byDiploma || [],
    byInstitution: result?.byInstitution || [],
    byDiscipline: result?.byDiscipline || [],
    byRome: result?.byRome || [],
  };
}
