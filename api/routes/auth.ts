import { Elysia } from 'elysia';
import { InvalidSessionError, JWTFailedError } from '~/errors';
import { authMacro } from '~/macros/authMacro';
import { rateLimitMacro } from '~/macros/rateLimitMacro';
import { clientInfoPlugin } from '~/plugins/client-info';
import { cookiesPlugin } from '~/plugins/cookies';
import { jwtAccessToken } from '~/plugins/jwt';
import {
  forgotPasswordSchema,
  optionalAuthCookieSchema,
  registerSchema,
  resetPasswordSchema,
  signinSchema,
} from '~/schemas/auth';
import { errorResponseSchema, successResponseSchema } from '~/schemas/common';
import * as authService from '~/services/auth.service';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(authMacro)
  .use(jwtAccessToken)
  .use(clientInfoPlugin)
  .use(cookiesPlugin)
  .use(rateLimitMacro)
  .guard({
    allow: 'visitor',
    detail: { tags: ['Authentification'] },
    response: { 200: successResponseSchema },
  })
  .post(
    '/signin',
    async ({ body, jwtAccessToken, clientInfo, authCookies }) => {
      const { accessTokenPayload, sessionToken } = await authService.signin(
        body.email,
        body.password,
        clientInfo,
      );

      const accessToken = await jwtAccessToken.sign(accessTokenPayload);
      authCookies.set(accessToken, sessionToken);

      return { success: true, message: 'Connexion réussie' };
    },
    {
      body: signinSchema,
      response: {
        401: errorResponseSchema,
        403: errorResponseSchema,
        429: errorResponseSchema,
      },
      detail: {
        summary: 'Se connecter',
        description:
          'Authentifie un utilisateur avec son email et ' +
          'mot de passe. En cas de succès, crée une ' +
          "session et positionne les cookies d'accès " +
          '(`fqv_token`) et de session (`fqv_session`). ' +
          'Limité à 5 tentatives par minute.',
      },
      rateLimit: {
        maxRequests: 5,
        windowSeconds: 60,
        key: 'signin',
        message: 'Trop de tentatives de connexion. ' + 'Veuillez réessayer dans quelques instants.',
      },
    },
  )
  .post(
    '/session/refresh',
    async ({ jwtAccessToken, clientInfo, authCookies }) => {
      const { session: currentSessionToken } = authCookies.get();
      if (!currentSessionToken) {
        authCookies.clear();
        throw new InvalidSessionError('Jeton de session manquant');
      }

      const { accessTokenPayload, sessionToken } = await authService.refreshSession(
        currentSessionToken,
        clientInfo,
      );

      const accessToken = await jwtAccessToken.sign(accessTokenPayload);
      if (!accessToken) throw new JWTFailedError();

      authCookies.set(accessToken, sessionToken);

      return {
        success: true,
        message: 'Session renouvelée avec succès',
      };
    },
    {
      response: {
        401: errorResponseSchema,
        429: errorResponseSchema,
      },
      detail: {
        summary: "Renouveler le token d'accès",
        description:
          "Génère un nouveau token d'accès à partir du " +
          'cookie de session. Le token de session subit ' +
          'une rotation à chaque appel pour limiter les ' +
          'risques de réutilisation. Limité à 10 appels ' +
          'par minute.',
      },
      rateLimit: {
        maxRequests: 10,
        windowSeconds: 60,
        key: 'session-refresh',
        message:
          'Trop de tentatives de renouvellement de session. ' +
          'Veuillez réessayer dans quelques minutes.',
      },
    },
  )
  .post(
    '/signout',
    async ({ authCookies }) => {
      const { session } = authCookies.get();
      await authService.signout(session);
      authCookies.clear();

      return { success: true, message: 'Déconnexion réussie' };
    },
    {
      detail: {
        summary: 'Se déconnecter',
        description:
          'Révoque la session courante côté serveur et ' +
          "supprime les cookies d'authentification du " +
          'navigateur. Les autres sessions actives ne ' +
          'sont pas affectées.',
      },
      cookie: optionalAuthCookieSchema,
    },
  )
  .post(
    '/forgot-password',
    async ({ body, request }) => {
      await authService.forgotPassword(body.email, request.url);

      return {
        success: true,
        message: 'Si cet email existe, un lien de ' + 'réinitialisation a été envoyé',
      };
    },
    {
      body: forgotPasswordSchema,
      response: {
        429: errorResponseSchema,
      },
      detail: {
        summary: 'Mot de passe oublié',
        description:
          'Envoie un email contenant un lien de ' +
          'réinitialisation de mot de passe. Le token ' +
          'est valide pendant 1 heure. Par sécurité, ' +
          "la réponse est identique que l'email existe " +
          'ou non. Limité à 3 demandes toutes les ' +
          '5 minutes.',
      },
      rateLimit: {
        maxRequests: 3,
        windowSeconds: 300,
        key: 'forgot-password',
        message:
          'Trop de demandes de réinitialisation. ' + 'Veuillez réessayer dans quelques minutes.',
      },
    },
  )
  .post(
    '/reset-password',
    async ({ body }) => {
      await authService.resetPassword(body.token, body.password);

      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      };
    },
    {
      body: resetPasswordSchema,
      response: {
        400: errorResponseSchema,
        429: errorResponseSchema,
      },
      detail: {
        summary: 'Réinitialiser le mot de passe',
        description:
          "Réinitialise le mot de passe à l'aide du " +
          'token reçu par email. Le token est à usage ' +
          'unique et expire après 1 heure. Toutes les ' +
          'sessions existantes sont révoquées après la ' +
          'réinitialisation.',
      },
      rateLimit: {
        maxRequests: 5,
        windowSeconds: 300,
        key: 'reset-password',
        message:
          'Trop de tentatives de réinitialisation. ' + 'Veuillez réessayer dans quelques minutes.',
      },
    },
  )
  .post(
    '/register',
    async ({ body }) => {
      await authService.registerFromInvitation(
        body.token,
        body.firstName,
        body.lastName,
        body.password,
      );
      return {
        message: 'Compte activé. Vous pouvez vous connecter',
      };
    },
    {
      body: registerSchema,
      response: {
        400: errorResponseSchema,
        401: errorResponseSchema,
        429: errorResponseSchema,
      },
      detail: {
        summary: "Finaliser l'inscription",
        description:
          'Active un compte utilisateur en définissant le ' +
          'mot de passe, le prénom et le nom à partir du ' +
          "token d'invitation reçu par email. Le token " +
          'est à usage unique et doit être valide. ' +
          'Limité à 5 tentatives toutes les 5 minutes.',
      },
      rateLimit: {
        maxRequests: 5,
        windowSeconds: 300,
        key: 'register',
        message: "Trop de tentatives d'inscription. " + 'Veuillez réessayer dans quelques minutes.',
      },
    },
  );
