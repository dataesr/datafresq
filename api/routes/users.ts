import { Elysia, t } from 'elysia';
import { authMacro } from '~/macros/authMacro';
import { errorResponseSchema, idParamSchema } from '~/schemas/common';
import { userSearchQuerySchema, userSearchSchema } from '~/schemas/users';
import * as usersService from '~/services/users.service';

export const usersRoutes = new Elysia({ prefix: '/users' })
  .use(authMacro)
  .guard({
    isAuth: true,
    allow: ['user', 'admin', 'root'],
    detail: { tags: ['Utilisateurs'] },
  })
  .get(
    '/search',
    async ({ query: { q, limit = '10' } }) => {
      if (!q || q.length < 2) {
        return [];
      }

      const searchLimit = Math.min(Number.parseInt(limit, 10) || 10, 50);
      return usersService.searchUsers(q, searchLimit);
    },
    {
      query: userSearchQuerySchema,
      response: {
        200: t.Array(userSearchSchema),
        401: errorResponseSchema,
      },
      detail: {
        summary: 'Rechercher des utilisateurs',
        description:
          'Recherche des utilisateurs par email, prénom ou ' +
          'nom de famille. Retourne une liste de ' +
          'correspondances avec les informations de base ' +
          '(id, email, prénom, nom). La recherche nécessite ' +
          'au minimum 2 caractères et est limitée à 50 ' +
          'résultats.',
      },
    },
  )
  .get('/:id', ({ params: { id } }) => usersService.getUserById(id), {
    params: idParamSchema,
    response: {
      200: t.Nullable(userSearchSchema),
      401: errorResponseSchema,
    },
    detail: {
      summary: 'Obtenir un utilisateur par ID',
      description:
        "Retourne les informations de base d'un " +
        'utilisateur identifié par son ID. Retourne ' +
        "`null` si l'utilisateur n'existe pas ou " +
        'est inactif.',
    },
  });
