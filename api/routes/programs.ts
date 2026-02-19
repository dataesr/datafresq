import { Elysia } from 'elysia';
import { authMacro } from '~/macros/authMacro';
import { errorResponseSchema, infParamSchema } from '~/schemas/common';
import {
  exportParamsSchema,
  programDetailResponseSchema,
  programsFacetsQuerySchema,
  programsFacetsResponseSchema,
  programsParamsSchema,
  programsSearchResponseSchema,
} from '~/schemas/programs';
import * as programsService from '~/services/programs.service';

export const programsRoutes = new Elysia({ prefix: '/programs' })
  .use(authMacro)
  .guard({
    isAuth: true,
    allow: ['user', 'admin', 'root'],
    detail: { tags: ['Formations'] },
  })
  .get('/', ({ query }) => programsService.searchPrograms(query), {
    query: programsParamsSchema,
    response: {
      200: programsSearchResponseSchema,
    },
    detail: {
      summary: 'Rechercher des formations',
      description:
        'Recherche paginée dans le catalogue des ' +
        'formations avec filtres optionnels (cycle, ' +
        'diplôme, académie, région, établissement, ' +
        'secteur disciplinaire, etc.). Supporte la ' +
        'recherche plein texte avec mise en évidence ' +
        'des termes trouvés.',
    },
  })
  .get('/export', ({ query, set }) => programsService.exportPrograms(query, set), {
    query: exportParamsSchema,
    detail: {
      summary: 'Exporter des formations',
      description:
        'Exporte les formations correspondant aux ' +
        'filtres au format JSON ou XLSX. Utilise le ' +
        'scroll Elasticsearch pour gérer de grands ' +
        "volumes. L'export est limité à 10 000 " +
        'formations.',
    },
  })
  .get('/facets', ({ query }) => programsService.getFacets(query), {
    query: programsFacetsQuerySchema,
    response: {
      200: programsFacetsResponseSchema,
    },
    detail: {
      summary: 'Obtenir les facettes de filtrage',
      description:
        'Retourne les agrégations Elasticsearch pour ' +
        'alimenter les menus déroulants de filtrage ' +
        '(cycles, diplômes, académies, régions, ' +
        'secteurs, disciplines, etc.) avec le nombre ' +
        'de formations correspondant à chaque valeur. ' +
        'Accepte les mêmes filtres que la recherche.',
    },
  })
  .get('/:inf', ({ params: { inf } }) => programsService.getProgramDetail(inf), {
    params: infParamSchema,
    response: {
      200: programDetailResponseSchema,
      404: errorResponseSchema,
    },
    detail: {
      summary: "Obtenir le détail d'une formation",
      description:
        "Retourne les informations complètes d'une " +
        'formation identifiée par son code INF, ' +
        'incluant les données SISE (effectifs ' +
        'étudiants par année) et InserSup (insertion ' +
        'professionnelle des diplômés).',
    },
  });
