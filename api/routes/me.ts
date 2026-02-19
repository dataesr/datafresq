import { Elysia } from 'elysia';
import { authMacro } from '~/macros/authMacro';
import { errorResponseSchema, successResponseSchema } from '~/schemas/common';
import { changePasswordSchema, updateUserSchema, userMeSchema } from '~/schemas/users';
import * as authService from '~/services/auth.service';
import * as usersService from '~/services/users.service';

export const meRoutes = new Elysia({ prefix: '/me' })
  .use(authMacro)
  .guard({
    isAuth: true,
    allow: ['user', 'admin', 'root'],
    detail: { tags: ['Utilisateur connecté'] },
    response: {
      401: errorResponseSchema,
      404: errorResponseSchema,
    },
  })
  .get('/', ({ user }) => usersService.getMe(user.email), {
    response: { 200: userMeSchema },
    detail: {
      summary: 'Obtenir mon profil',
      description:
        "Retourne les informations du profil de l'utilisateur " +
        'connecté : email, prénom, nom, rôle et dates ' +
        "de dernière connexion. Nécessite d'être " +
        'authentifié.',
    },
  })
  .patch('/', ({ user, body }) => usersService.updateMe(user.email, body), {
    body: updateUserSchema,
    response: { 200: userMeSchema },
    detail: {
      summary: 'Modifier mon profil',
      description:
        'Met à jour les informations du profil de ' +
        "l'utilisateur connecté. Seuls le prénom et " +
        'le nom peuvent être modifiés. Retourne le ' +
        'profil complet après mise à jour.',
    },
  })
  .post(
    '/change-password',
    async ({ user, body }) => {
      await authService.changePassword(user.email, body.currentPassword, body.newPassword);
      return {
        success: true,
        message: 'Mot de passe modifié avec succès',
      };
    },
    {
      body: changePasswordSchema,
      response: { 200: successResponseSchema },
      detail: {
        summary: 'Changer mon mot de passe',
        description:
          "Modifie le mot de passe de l'utilisateur " +
          'connecté. Le mot de passe actuel doit être ' +
          'fourni pour vérification. Les sessions ' +
          'existantes restent actives après le ' +
          'changement.',
      },
    },
  );
