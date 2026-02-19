import { Elysia } from 'elysia';
import { InvalidSessionError } from '~/errors';
import { authMacro } from '~/macros/authMacro';
import { cookiesPlugin } from '~/plugins/cookies';
import { authCookieSchema } from '~/schemas/auth';
import { errorResponseSchema, idParamSchema, successResponseSchema } from '~/schemas/common';
import { currentSessionResponseSchema, sessionsListResponseSchema } from '~/schemas/sessions';
import * as sessionsService from '~/services/sessions.service';

export const sessionsRoutes = new Elysia({ prefix: '/sessions' })
  .use(authMacro)
  .use(cookiesPlugin)
  .guard({
    isAuth: true,
    allow: ['user', 'admin', 'root'],
    detail: { tags: ['Sessions'] },
    response: {
      401: errorResponseSchema,
    },
  })
  .get(
    '/',
    async ({ user }) => {
      const sessions = await sessionsService.listSessionsForEmail(user.email);
      return { sessions, total: sessions.length };
    },
    {
      response: {
        200: sessionsListResponseSchema,
      },
      detail: {
        summary: 'Lister les sessions actives',
        description:
          "Retourne toutes les sessions actives de l'utilisateur " +
          'connecté, triées par date de dernier rafraîchissement. ' +
          'Chaque session contient les informations du navigateur, ' +
          "l'adresse IP et les dates de création/expiration.",
      },
    },
  )
  .get(
    '/current',
    async ({ user, authCookies }) => {
      const { session: currentSessionToken } = authCookies.get();
      if (!currentSessionToken) {
        throw new InvalidSessionError('Jeton de session manquant');
      }

      const data = await sessionsService.getCurrentSessionForEmail(user.email, currentSessionToken);
      return { success: true, data };
    },
    {
      response: {
        200: currentSessionResponseSchema,
      },
      detail: {
        summary: 'Obtenir la session courante',
        description:
          'Retourne les détails de la session associée au cookie ' +
          "de session actuel. Permet au client d'identifier " +
          "quelle session correspond à l'appareil en cours " +
          "d'utilisation.",
      },
      cookie: authCookieSchema,
    },
  )
  .delete(
    '/:id',
    async ({ params, user }) => {
      await sessionsService.revokeSessionForEmail(params.id, user.email);
      return { success: true, message: 'Session révoquée' };
    },
    {
      params: idParamSchema,
      response: {
        200: successResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: 'Révoquer une session spécifique',
        description:
          'Révoque une session par son identifiant. Permet à ' +
          "l'utilisateur de déconnecter un appareil spécifique " +
          'sans affecter ses autres sessions actives.',
      },
    },
  )
  .delete(
    '/',
    async ({ user, authCookies }) => {
      const deletedCount = await sessionsService.revokeAllSessionsForEmail(user.email);
      authCookies.clear();

      return {
        success: true,
        message: `${deletedCount} session(s) révoquée(s)`,
      };
    },
    {
      response: {
        200: successResponseSchema,
      },
      detail: {
        summary: 'Révoquer toutes les sessions',
        description:
          "Révoque toutes les sessions actives de l'utilisateur " +
          'connecté et supprime les cookies de session. Équivaut ' +
          'à une déconnexion globale de tous les appareils.',
      },
    },
  );
