export interface SearchFieldConfig {
  field: string;
  boost?: number;
  highlight: boolean;
  displayName: string;
  displayGroup?: string;
}

export const PROGRAM_SEARCH_FIELDS: SearchFieldConfig[] = [
  {
    field: 'label',
    boost: 3,
    highlight: true,
    displayName: 'Intitulé',
  },
  {
    field: 'mentionNormalized',
    boost: 2,
    highlight: true,
    displayName: 'Mention',
  },
  {
    field: 'cycle',
    highlight: true,
    displayName: 'Cycle',
  },
  {
    field: 'domains',
    boost: 2,
    highlight: true,
    displayName: 'Domaines',
  },
  {
    field: 'keywords',
    boost: 2,
    highlight: true,
    displayName: 'Mots-clés',
  },
  {
    field: 'disciplinarySector',
    highlight: true,
    displayName: 'Secteur disciplinaire',
  },
  {
    field: 'diploma.type',
    boost: 2,
    highlight: true,
    displayName: 'Type de diplôme',
  },
  {
    field: 'diploma.code',
    highlight: true,
    displayName: 'Code diplôme',
  },
  {
    field: 'diploma.category',
    highlight: true,
    displayName: 'Catégorie diplôme',
  },
  {
    field: 'etablissements.name',
    boost: 2,
    highlight: true,
    displayName: 'Nom',
    displayGroup: 'Établissements',
  },
  {
    field: 'etablissements.shortName',
    highlight: true,
    displayName: 'Nom court',
    displayGroup: 'Établissements',
  },
  {
    field: 'etablissements.sigle',
    highlight: true,
    displayName: 'Sigle',
    displayGroup: 'Établissements',
  },
  {
    field: 'etablissements.academy',
    highlight: true,
    displayName: 'Académie',
    displayGroup: 'Établissements',
  },
  {
    field: 'etablissements.region',
    highlight: true,
    displayName: 'Région',
    displayGroup: 'Établissements',
  },
  {
    field: 'etablissements.address.city',
    highlight: true,
    displayName: 'Ville',
    displayGroup: 'Établissements',
  },
  {
    field: 'etapes.pedagogicalInfo.keywords',
    boost: 2,
    highlight: true,
    displayName: 'Mots-clés',
    displayGroup: 'Infos pédagogiques',
  },
  {
    field: 'etapes.pedagogicalInfo.disciplines',
    boost: 2,
    highlight: true,
    displayName: 'Disciplines',
    displayGroup: 'Infos pédagogiques',
  },
  {
    field: 'etapes.pedagogicalInfo.languages',
    highlight: true,
    displayName: 'Langues',
    displayGroup: 'Infos pédagogiques',
  },
  {
    field: 'etapes.pedagogicalInfo.teachingLanguages',
    highlight: true,
    displayName: "Langues d'enseignement",
    displayGroup: 'Infos pédagogiques',
  },
  {
    field: 'etapes.recruitmentInfo.expectations',
    highlight: true,
    displayName: 'Attendus',
    displayGroup: 'Recrutement',
  },
  {
    field: 'etapes.recruitmentInfo.recommendedDiplomas',
    highlight: true,
    displayName: 'Diplômes recommandés',
    displayGroup: 'Recrutement',
  },
  {
    field: 'parcours.label',
    highlight: true,
    displayName: 'Parcours',
  },
  {
    field: 'parcours.sigle',
    highlight: true,
    displayName: 'Sigle parcours',
  },
  {
    field: 'etapes.label',
    highlight: true,
    displayName: 'Étapes',
  },
  {
    field: 'rncp.keyword',
    highlight: true,
    displayName: 'Code RNCP',
  },
  {
    field: 'codeSise.keyword',
    highlight: true,
    displayName: 'Code SISE',
  },
  {
    field: 'parcours.rncp.keyword',
    highlight: false,
    displayName: 'RNCP parcours',
  },
  {
    field: 'parcours.codeSise.keyword',
    highlight: false,
    displayName: 'SISE parcours',
  },
  {
    field: 'rncpInfos.typeEmploiAccessibles',
    highlight: true,
    displayName: "Types d'emploi accessibles",
  },
  {
    field: 'romeInfos.label',
    highlight: true,
    displayName: 'Métiers ROME',
  },
  {
    field: 'romeInfos.level1',
    highlight: false,
    displayName: 'Domaine ROME',
  },
  {
    field: 'romeInfos.level2',
    highlight: false,
    displayName: 'Sous-domaine ROME',
  },
  {
    field: 'engineeringSpecialties',
    highlight: true,
    displayName: 'Spécialités ingénieur',
  },
  {
    field: 'healthSpecialty',
    highlight: true,
    displayName: 'Spécialité santé',
  },
];

export function buildSearchFields(): string[] {
  return PROGRAM_SEARCH_FIELDS.map((config) =>
    config.boost ? `${config.field}^${config.boost}` : config.field,
  );
}

export function buildHighlightFields(): Record<string, object> {
  return PROGRAM_SEARCH_FIELDS.filter((config) => config.highlight).reduce(
    (acc, config) => {
      acc[config.field] = {};
      return acc;
    },
    {} as Record<string, object>,
  );
}

export function getFieldDisplayName(field: string): string {
  const config = PROGRAM_SEARCH_FIELDS.find((c) => c.field === field);
  if (!config) return field;

  if (config.displayGroup) {
    return `${config.displayGroup} › ${config.displayName}`;
  }
  return config.displayName;
}

export function buildFieldDisplayNameMap(): Record<string, string> {
  return PROGRAM_SEARCH_FIELDS.reduce(
    (acc, config) => {
      acc[config.field] = getFieldDisplayName(config.field);
      return acc;
    },
    {} as Record<string, string>,
  );
}
