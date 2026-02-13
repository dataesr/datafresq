export interface SearchFieldConfig {
  field: string;
  boost?: number;
  displayName: string;
  displayGroup?: string;
}

export const PROGRAM_SEARCH_FIELDS: SearchFieldConfig[] = [
  {
    field: 'search.label',
    boost: 8,
    displayName: 'Intitulé',
  },
  {
    field: 'search.inf',
    displayName: 'INF',
  },
  {
    field: 'search.disciplinarySector',
    boost: 2,
    displayName: 'Secteur disciplinaire',
  },
  {
    field: 'search.etablissements.name',
    boost: 4,
    displayName: 'Nom',
    displayGroup: 'Établissements',
  },
  {
    field: 'search.etablissements.paysageName',
    boost: 3,
    displayName: 'Nom Paysage',
    displayGroup: 'Établissements',
  },
  {
    field: 'search.etablissements.shortName',
    boost: 2,
    displayName: 'Nom court',
    displayGroup: 'Établissements',
  },
  {
    field: 'search.etablissements.sigle',
    boost: 2,
    displayName: 'Sigle',
    displayGroup: 'Établissements',
  },
  {
    field: 'search.etablissements.city',
    boost: 2,
    displayName: 'Ville',
    displayGroup: 'Établissements',
  },
  {
    field: 'search.etablissements.uai',
    displayName: 'UAI',
    displayGroup: 'Établissements',
  },
  {
    field: 'search.etapes.label',
    boost: 3,
    displayName: 'Intitulé',
    displayGroup: 'Étapes',
  },
  {
    field: 'search.etapes.infe',
    displayName: 'INFE',
    displayGroup: 'Étapes',
  },
  {
    field: 'search.etapes.pedagogicalInfoKeywords',
    boost: 2,
    displayName: 'Mots-clés',
    displayGroup: 'Infos pédagogiques',
  },
  {
    field: 'search.etapes.pedagogicalInfoKeywordsdisciplines',
    boost: 2,
    displayName: 'Disciplines',
    displayGroup: 'Infos pédagogiques',
  },
  {
    field: 'search.etapes.pedagogicalInfoKeywordsjobs',
    boost: 2,
    displayName: 'Métiers',
    displayGroup: 'Infos pédagogiques',
  },
  {
    field: 'search.etapes.pedagogicalInfoKeywordssectors',
    boost: 2,
    displayName: 'Secteurs',
    displayGroup: 'Infos pédagogiques',
  },
  {
    field: 'search.etapes.recruitmentInfoExpectations',
    displayName: 'Attendus',
    displayGroup: 'Recrutement',
  },
  {
    field: 'search.parcours.label',
    boost: 3,
    displayName: 'Intitulé',
    displayGroup: 'Parcours',
  },
  {
    field: 'search.parcours.infp',
    displayName: 'INFP',
    displayGroup: 'Parcours',
  },
  {
    field: 'search.rncpInfos.rncp',
    displayName: 'Code RNCP',
    displayGroup: 'RNCP',
  },
  {
    field: 'search.rncpInfos.typeEmploiAccessibles',
    boost: 2,
    displayName: "Types d'emploi accessibles",
    displayGroup: 'RNCP',
  },
  {
    field: 'search.romeInfos.label',
    boost: 2,
    displayName: 'Intitulé',
    displayGroup: 'ROME',
  },
  {
    field: 'search.romeInfos.codeRome',
    displayName: 'Code ROME',
    displayGroup: 'ROME',
  },
  {
    field: 'search.romeInfos.level1',
    displayName: 'Domaine',
    displayGroup: 'ROME',
  },
  {
    field: 'search.romeInfos.level2',
    displayName: 'Sous-domaine',
    displayGroup: 'ROME',
  },
  {
    field: 'search.romeInfos.level3',
    displayName: 'Famille',
    displayGroup: 'ROME',
  },
  {
    field: 'search.romeInfos.idLevel1',
    displayName: 'ID domaine',
    displayGroup: 'ROME',
  },
  {
    field: 'search.romeInfos.idLevel2',
    displayName: 'ID sous-domaine',
    displayGroup: 'ROME',
  },
  {
    field: 'search.romeInfos.ogr',
    displayName: 'OGR',
    displayGroup: 'ROME',
  },
  {
    field: 'search.romeInfos.rncp',
    displayName: 'RNCP',
    displayGroup: 'ROME',
  },
];

export function buildSearchFields(): string[] {
  return PROGRAM_SEARCH_FIELDS.map((config) =>
    config.boost ? `${config.field}^${config.boost}` : config.field,
  );
}

export function buildHighlightFields(): Record<string, object> {
  return PROGRAM_SEARCH_FIELDS.reduce(
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
