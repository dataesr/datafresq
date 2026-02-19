import { Elysia } from 'elysia';
import { authMacro } from '~/macros/authMacro';
import { errorResponseSchema, successResponseSchema } from '~/schemas/common';
import {
  guideReviewBodySchema,
  guideReviewsListResponseSchema,
  guideReviewsQuerySchema,
} from '~/schemas/guide';
import * as guideService from '~/services/guide.service';

export const guideRoutes = new Elysia({ prefix: '/guide' })
  .use(authMacro)
  .guard({
    isAuth: true,
    allow: ['user', 'admin', 'root'],
    detail: { tags: ['Guide'] },
    response: {
      401: errorResponseSchema,
    },
  })
  .post(
    '/reviews',
    async ({ user, body }) => {
      await guideService.addReview(user.id, user.email, body);
      return {
        success: true as const,
        message: 'Votre avis a été pris en compte',
      };
    },
    {
      body: guideReviewBodySchema,
      response: {
        200: successResponseSchema,
        400: errorResponseSchema,
      },
      detail: {
        summary: 'Soumettre un avis sur une page du guide',
        description:
          'Enregistre un avis (pouce haut ou bas) avec un ' +
          'commentaire optionnel pour une page du guide.',
      },
    },
  )
  .get('/reviews', async ({ query }) => guideService.listReviews(query), {
    allow: ['admin', 'root'],
    query: guideReviewsQuerySchema,
    response: {
      200: guideReviewsListResponseSchema,
      403: errorResponseSchema,
    },
    detail: {
      summary: 'Lister les avis du guide',
      description:
        'Retourne la liste paginée des avis laissés sur ' +
        'les pages du guide. Supporte la recherche par ' +
        'email utilisateur ou contenu du commentaire, ' +
        'le filtrage par page, type de vote et période. ' +
        'Réservé aux administrateurs.',
    },
  });
