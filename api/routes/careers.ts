import { Elysia } from 'elysia';
import { authMacro } from '~/macros/authMacro';
import { careerSearchParamsSchema, careerSearchResponseSchema } from '~/schemas/careers';
import * as careersService from '~/services/careers.service';

export const careersRoutes = new Elysia({ prefix: '/careers' })
  .use(authMacro)
  .guard({
    isAuth: true,
    allow: ['user', 'admin', 'root'],
    detail: { tags: ['Métiers'] },
  })
  .get('/', ({ query }) => careersService.searchCareers(query.q, query.page, query.pageSize), {
    query: careerSearchParamsSchema,
    response: { 200: careerSearchResponseSchema },
    detail: {
      summary: 'Rechercher des métiers',
      description:
        'Recherche dans le référentiel ROME (Répertoire ' +
        'Opérationnel des Métiers et des Emplois). ' +
        'Retourne les codes ROME correspondants avec ' +
        'leurs libellés et niveaux hiérarchiques. Les ' +
        'codes ROME peuvent être utilisés pour filtrer ' +
        'les formations via le champ `romeInfos`.',
    },
  });
