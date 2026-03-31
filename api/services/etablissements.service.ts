import type { Filter } from 'mongodb';
import { collections } from '~/database/mongo';
import type { EtablissementAggDoc } from '~/database/types';
import type {
  EtablissementDetailResponse,
  EtablissementsFacetsResponse,
  EtablissementsParams,
  EtablissementsSearchResponse,
} from '~/schemas/etablissements';

// ============================================================================
// Helpers
// ============================================================================

function toArray(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
}

function buildFilter(params: EtablissementsParams): Filter<EtablissementAggDoc> {
  const filter: Filter<EtablissementAggDoc> = {};

  if (params.q) {
    filter.$text = { $search: params.q };
  }

  const types = toArray(params.type);
  if (types?.length) filter.type = { $in: types };

  const typologies = toArray(params.typologie);
  if (typologies?.length) filter.typologie = { $in: typologies };

  const academies = toArray(params.academie);
  if (academies?.length) filter.academie = { $in: academies };

  const regions = toArray(params.region);
  if (regions?.length) filter.region = { $in: regions };

  const departements = toArray(params.departement);
  if (departements?.length) filter.departement = { $in: departements };

  return filter;
}

function parseSortParam(sort?: string): Record<string, 1 | -1> {
  if (!sort) return { totalStudents: -1 };

  const parts = sort.split(':');
  const field = parts[0] ?? '';
  const direction = parts[1];
  const dir = direction === 'asc' ? 1 : -1;

  const allowedFields: Record<string, string> = {
    name: 'name',
    totalStudents: 'totalStudents',
    academie: 'academie',
    region: 'region',
    type: 'type',
  };

  const mongoField = allowedFields[field];
  if (!mongoField) return { totalStudents: -1 };

  return { [mongoField]: dir };
}

const SUMMARY_PROJECTION = {
  _id: 0,
  paysageId: 1,
  name: 1,
  type: 1,
  typologie: 1,
  commune: 1,
  departement: 1,
  academie: 1,
  region: 1,
  totalStudents: 1,
  totalFemale: 1,
  totalMale: 1,
  years: 1,
} as const;

const INTERNAL_PROJECTION = {
  ...SUMMARY_PROJECTION,
  byYear: 1,
} as const;

// ============================================================================
// Search
// ============================================================================

export async function searchEtablissements(
  params: EtablissementsParams,
): Promise<EtablissementsSearchResponse> {
  const filter = buildFilter(params);
  const sort = parseSortParam(params.sort);
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const [rawResults, totalCount] = await Promise.all([
    collections.etablissementsAgg
      .find(filter, { projection: INTERNAL_PROJECTION })
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .toArray(),
    collections.etablissementsAgg.countDocuments(filter),
  ]);

  const etablissements = rawResults.map((doc) => {
    const { byYear, ...rest } = doc as EtablissementAggDoc;
    const lastYear = rest.years?.length ? rest.years[rest.years.length - 1] : '';
    const lastYearData = lastYear && byYear ? byYear.find((y) => y.year === lastYear) : null;

    return {
      ...rest,
      lastYear: lastYear || '',
      lastYearStudents: lastYearData?.total ?? 0,
    };
  });

  return { etablissements, totalCount };
}

// ============================================================================
// Detail
// ============================================================================

export async function getEtablissement(
  paysageId: string,
): Promise<EtablissementDetailResponse | null> {
  const doc = await collections.etablissementsAgg.findOne(
    { paysageId },
    { projection: { _id: 0, updatedAt: 0 } },
  );

  return doc as EtablissementDetailResponse | null;
}

// ============================================================================
// Facets
// ============================================================================

export async function getEtablissementsFacets(
  params: EtablissementsParams,
): Promise<EtablissementsFacetsResponse> {
  const filter = buildFilter(params);

  const pipeline = [
    { $match: filter },
    {
      $facet: {
        totalCount: [{ $count: 'count' }],
        types: [
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 as const } },
          { $project: { _id: 0, key: '$_id', count: 1 } },
        ],
        typologies: [
          { $group: { _id: '$typologie', count: { $sum: 1 } } },
          { $sort: { count: -1 as const } },
          { $project: { _id: 0, key: '$_id', count: 1 } },
        ],
        academies: [
          { $group: { _id: '$academie', count: { $sum: 1 } } },
          { $sort: { count: -1 as const } },
          { $project: { _id: 0, key: '$_id', count: 1 } },
        ],
        regions: [
          { $group: { _id: '$region', count: { $sum: 1 } } },
          { $sort: { count: -1 as const } },
          { $project: { _id: 0, key: '$_id', count: 1 } },
        ],
        departements: [
          { $group: { _id: '$departement', count: { $sum: 1 } } },
          { $sort: { count: -1 as const } },
          { $project: { _id: 0, key: '$_id', count: 1 } },
        ],
      },
    },
  ];

  const [result] = await collections.etablissementsAgg.aggregate(pipeline).toArray();

  const totalCount = result?.totalCount?.[0]?.count ?? 0;

  return {
    totalCount,
    facets: {
      types: (result?.types ?? []).filter((f: { key: string }) => f.key),
      typologies: (result?.typologies ?? []).filter((f: { key: string }) => f.key),
      academies: (result?.academies ?? []).filter((f: { key: string }) => f.key),
      regions: (result?.regions ?? []).filter((f: { key: string }) => f.key),
      departements: (result?.departements ?? []).filter((f: { key: string }) => f.key),
    },
  };
}
