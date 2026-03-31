import { Elysia } from 'elysia';
import { authMacro } from '~/macros/authMacro';
import { errorResponseSchema, paysageIdParamSchema } from '~/schemas/common';
import {
  etablissementDetailResponseSchema,
  etablissementsFacetsResponseSchema,
  etablissementsParamsSchema,
  etablissementsSearchResponseSchema,
} from '~/schemas/etablissements';
import * as etablissementsService from '~/services/etablissements.service';

export const etablissementsRoutes = new Elysia({ prefix: '/etablissements' })
  .use(authMacro)
  .guard({
    isAuth: true,
    allow: ['user', 'admin', 'root'],
    detail: { tags: ['Établissements'] },
  })
  .get('/', ({ query }) => etablissementsService.searchEtablissements(query), {
    query: etablissementsParamsSchema,
    response: {
      200: etablissementsSearchResponseSchema,
    },
    detail: {
      summary: 'Rechercher des établissements',
      description:
        'Recherche paginée dans les établissements ' +
        'agrégés à partir des données SISE avec filtres ' +
        'optionnels (type, typologie, académie, région, ' +
        'département). Supporte la recherche plein texte ' +
        'sur le nom.',
    },
  })
  .get('/facets', ({ query }) => etablissementsService.getEtablissementsFacets(query), {
    query: etablissementsParamsSchema,
    response: {
      200: etablissementsFacetsResponseSchema,
    },
    detail: {
      summary: 'Obtenir les facettes de filtrage',
      description:
        'Retourne les agrégations pour alimenter les ' +
        'menus déroulants de filtrage (types, typologies, ' +
        'académies, régions, départements) avec le nombre ' +
        "d'établissements correspondant à chaque valeur.",
    },
  })
  .get(
    '/:paysageId',
    async ({ params: { paysageId }, set }) => {
      const result = await etablissementsService.getEtablissement(paysageId);
      if (!result) {
        set.status = 404;
        return { code: 'NOT_FOUND', message: 'Établissement introuvable' };
      }
      return result;
    },
    {
      params: paysageIdParamSchema,
      response: {
        200: etablissementDetailResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: "Obtenir le détail d'un établissement",
        description:
          "Retourne les informations complètes d'un " +
          'établissement identifié par son Paysage ID, ' +
          'incluant les données agrégées SISE (effectifs ' +
          'étudiants par année, ventilations par cycle, ' +
          'diplôme et discipline).',
      },
    },
  );
