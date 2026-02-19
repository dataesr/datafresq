import { Elysia } from 'elysia';
import { authMacro } from '~/macros/authMacro';
import {
  institutionSearchParamsSchema,
  institutionSearchResponseSchema,
} from '~/schemas/institutions';
import * as institutionsService from '~/services/institutions.service';

export const institutionsRoutes = new Elysia({ prefix: '/institutions' })
  .use(authMacro)
  .guard({
    isAuth: true,
    allow: ['user', 'admin', 'root'],
    detail: { tags: ['Institutions'] },
  })
  .get(
    '/',
    ({ query }) => institutionsService.searchInstitutions(query.q, query.page, query.pageSize),
    {
      query: institutionSearchParamsSchema,
      response: { 200: institutionSearchResponseSchema },
      detail: {
        summary: 'Rechercher des établissements',
        description:
          'Recherche dans le référentiel des établissements ' +
          "d'enseignement supérieur. Retourne les " +
          'identifiants Paysage (`paysage_elt.id`) ' +
          'utilisables pour filtrer les formations par ' +
          'établissement.',
      },
    },
  );
