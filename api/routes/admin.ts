import { Elysia, t } from 'elysia';
import { authMacro } from '~/macros/authMacro';
import { inviteUserSchema } from '~/schemas/auth';
import { errorResponseSchema, idParamSchema, successResponseSchema } from '~/schemas/common';
import { updateUserRoleSchema, userAdminSchema } from '~/schemas/users';
import * as adminService from '~/services/admin.service';
import * as authService from '~/services/auth.service';

export const adminRoutes = new Elysia({ prefix: '/admin' })
  .use(authMacro)
  .guard({
    isAuth: true,
    allow: ['admin', 'root'],
    detail: { tags: ['Administration'] },
    response: {
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
    },
  })
  .get('/users', () => adminService.listAllUsers(), {
    response: { 200: t.Array(userAdminSchema) },
    detail: {
      summary: 'Lister tous les utilisateurs',
      description:
        'Retourne la liste complète des utilisateurs du ' +
        'système avec leurs informations détaillées ' +
        '(rôle, statut, dates de connexion). ' +
        'Réservé aux administrateurs.',
    },
  })
  .put(
    '/users/:id/role',
    async ({ params, body }) => {
      await adminService.updateUserRole(params.id, body.role);
      return {
        success: true,
        message: 'Rôle modifié avec succès',
      };
    },
    {
      params: idParamSchema,
      body: updateUserRoleSchema,
      response: { 200: successResponseSchema },
      detail: {
        summary: "Modifier le rôle d'un utilisateur",
        description:
          "Change le rôle d'un utilisateur identifié par " +
          'son ID. Les rôles disponibles sont `user`, ' +
          '`admin` et `root`. Réservé aux administrateurs.',
      },
    },
  )
  .delete(
    '/users/:id',
    async ({ params }) => {
      await adminService.deactivateUser(params.id);
      return {
        success: true,
        message: 'Utilisateur désactivé avec succès',
      };
    },
    {
      params: idParamSchema,
      response: { 200: successResponseSchema },
      detail: {
        summary: 'Désactiver un utilisateur',
        description:
          "Désactive le compte d'un utilisateur et révoque " +
          "toutes ses sessions actives. L'utilisateur ne " +
          'pourra plus se connecter. Cette action ne ' +
          'supprime pas les données associées. ' +
          'Réservé aux administrateurs.',
      },
    },
  )
  .delete(
    '/users/:id/sessions',
    async ({ params }) => {
      const deletedCount = await adminService.revokeUserSessions(params.id);
      return {
        success: true,
        message: `${deletedCount} session(s) révoquée(s)`,
      };
    },
    {
      params: idParamSchema,
      response: { 200: successResponseSchema },
      detail: {
        summary: "Révoquer les sessions d'un utilisateur",
        description:
          "Révoque toutes les sessions actives d'un " +
          'utilisateur identifié par son ID. Force la ' +
          'déconnexion de tous ses appareils sans ' +
          'désactiver le compte. Réservé aux ' +
          'administrateurs.',
      },
    },
  )
  .post(
    '/invitations',
    async ({ body, request }) => {
      await authService.inviteUser(body.email, request.url);
      return { message: 'Invitation envoyée' };
    },
    {
      body: inviteUserSchema,
      response: { 200: successResponseSchema },
      detail: {
        summary: 'Inviter un utilisateur',
        description:
          'Crée un compte utilisateur en attente et envoie ' +
          "un email d'invitation contenant un lien " +
          "d'inscription. Si l'utilisateur existe déjà " +
          'mais est inactif, un nouveau token est généré. ' +
          "Le lien d'invitation expire après 48 heures. " +
          'Réservé aux administrateurs.',
      },
    },
  );
