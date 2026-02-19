import { ES_INDEXES, elastic, extractTotal } from '~/database/elastic';
import { DatabaseError } from '~/errors';

const SOURCE_FIELDS = [
  'uai_etablissement',
  'denomination_etablissement',
  'libelle_etablissement',
  'sigle_etablissement',
  'ville_etablissement',
  'nature_etablissement',
  'paysage_elt.id',
  'paysage_elt.name',
];

export async function searchInstitutions(q?: string, page = 1, pageSize = 20) {
  const textQuery = q
    ? {
        multi_match: {
          query: q,
          fields: [
            'denomination_etablissement^3',
            'libelle_etablissement^3',
            'nom_etablissement^3',
            'nom_courant_etablissement^2',
            'nom_commun_etablissement^2',
            'nom_bce_etablissement^2',
            'sigle_etablissement^2',
            'paysage_elt.name^3',
            'libelle_avec_parent_etablissement',
            'uai_etablissement',
          ],
          type: 'best_fields' as const,
          fuzziness: 'AUTO',
        },
      }
    : { match_all: {} };

  const from = (page - 1) * pageSize;

  const searchResponse = await elastic
    .search({
      index: ES_INDEXES.institutions,
      from,
      size: pageSize,
      _source: SOURCE_FIELDS,
      query: textQuery,
      track_scores: true,
    })
    .catch((err) => {
      console.error('Elasticsearch error:', err);
      throw new DatabaseError(err.message);
    });

  const totalCount = extractTotal(searchResponse);

  const institutions = (searchResponse?.hits?.hits ?? [])
    .map((hit) => {
      const source = hit._source as Record<string, unknown> | undefined;
      if (!source) return null;

      const paysageElt = source.paysage_elt as { id?: string; name?: string } | undefined;

      if (!paysageElt?.id) return null;

      return {
        id: paysageElt.id,
        label:
          paysageElt.name ||
          (source.denomination_etablissement as string) ||
          (source.libelle_etablissement as string) ||
          '',
        uai: source.uai_etablissement as string | undefined,
        city: source.ville_etablissement as string | undefined,
        nature: source.nature_etablissement as string | undefined,
      };
    })
    .filter((inst): inst is NonNullable<typeof inst> => inst !== null);

  return { institutions, totalCount };
}
