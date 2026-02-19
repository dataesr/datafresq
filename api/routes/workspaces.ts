import { Elysia, t } from 'elysia';
import { authMacro } from '~/macros/authMacro';
import { workspaceAggregationsResponseSchema } from '~/schemas/aggregations';
import { errorResponseSchema, idParamSchema, successResponseSchema } from '~/schemas/common';
import { programLightSchema } from '~/schemas/programs';
import {
  addProgramsSchema,
  addUsersSchema,
  createWorkspaceSchema,
  listPublicWorkspacesQuerySchema,
  listUserWorkspacesQuerySchema,
  previewAddProgramsResponseSchema,
  previewAddProgramsSchema,
  readWorkspaceSchema,
  removeProgramsSchema,
  removeUsersSchema,
  updateUserRoleSchema,
  updateWorkspaceSchema,
  workspaceHistoryQuerySchema,
  workspaceHistoryResponseSchema,
} from '~/schemas/workspaces';
import * as workspacesService from '~/services/workspaces.service';

const TAGS = ['Espaces de travail'];

// =============================================================================
// PUBLIC & PERSONAL WORKSPACE ROUTES
// =============================================================================

const workspaces = new Elysia()
  .use(authMacro)
  .guard({
    isAuth: true,
    allow: ['user', 'admin', 'root'],
    detail: { tags: TAGS },
    response: {
      401: errorResponseSchema,
    },
  })
  .post(
    '/workspaces',
    ({ body, user }) => workspacesService.createWorkspace({ ...body, ownerId: user.id }),
    {
      body: createWorkspaceSchema,
      response: {
        200: readWorkspaceSchema,
        400: errorResponseSchema,
      },
      detail: {
        summary: 'Créer un espace de travail',
        description:
          'Crée un nouvel espace de travail. Accepte des ' +
          'formations directement via `programs` (liste ' +
          "d'INF) et/ou des critères de recherche via " +
          '`searchParams` pour importer automatiquement ' +
          'les formations correspondantes. Limité à ' +
          '5 000 formations depuis une recherche.',
      },
    },
  )
  .get('/workspaces', ({ query }) => workspacesService.listPublicWorkspaces(query), {
    query: listPublicWorkspacesQuerySchema,
    response: {
      200: t.Array(readWorkspaceSchema),
    },
    detail: {
      summary: 'Lister les espaces de travail publics',
      description:
        'Retourne la liste des espaces de travail dont ' +
        'la visibilité est publique. Supporte la ' +
        'recherche par nom, le tri par nom ou date ' +
        'de création, et la pagination via `size`.',
    },
  })
  .get(
    '/me/workspaces',
    ({ user, query }) => workspacesService.listUserWorkspaces(user.id, query),
    {
      query: listUserWorkspacesQuerySchema,
      response: {
        200: t.Array(readWorkspaceSchema),
      },
      detail: {
        summary: 'Lister mes espaces de travail',
        description:
          'Retourne les espaces de travail dont ' +
          "l'utilisateur connecté est propriétaire ou " +
          'membre.\n\n' +
          'Filtres disponibles :\n' +
          '- `all` (défaut) : tous les espaces\n' +
          '- `owned` : uniquement ceux dont ' +
          "l'utilisateur est propriétaire\n" +
          '- `shared` : uniquement ceux partagés avec ' +
          "l'utilisateur",
      },
    },
  )
  .get(
    '/workspaces/:id',
    ({ params: { id }, user }) => workspacesService.getWorkspace(id, user.id),
    {
      params: idParamSchema,
      response: {
        200: readWorkspaceSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: 'Obtenir un espace de travail',
        description:
          "Retourne les détails complets d'un espace de " +
          'travail : métadonnées, liste des formations ' +
          "(INF), membres et rôles. L'utilisateur doit " +
          "être propriétaire, membre ou l'espace doit " +
          'être public.',
      },
    },
  )
  .get(
    '/workspaces/:id/programs',
    ({ params: { id }, user }) => workspacesService.getWorkspacePrograms(id, user.id),
    {
      params: idParamSchema,
      response: {
        200: t.Array(programLightSchema),
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: "Lister les formations d'un espace",
        description:
          'Retourne la liste complète des formations ' +
          "d'un espace de travail avec leurs données " +
          'résumées (intitulé, cycle, diplôme, ' +
          "établissements). L'utilisateur doit avoir " +
          "accès à l'espace.",
      },
    },
  )
  .get(
    '/workspaces/:id/aggregations',
    ({ params: { id }, user }) => workspacesService.getAggregations(id, user.id),
    {
      params: idParamSchema,
      response: {
        200: workspaceAggregationsResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: "Obtenir les agrégations d'un espace",
        description:
          'Retourne les agrégations pré-calculées et ' +
          'mises en cache pour un espace de travail : ' +
          'données SISE (effectifs étudiants par année), ' +
          'InserSup (insertion professionnelle) et ' +
          'répartitions des formations (cycle, académie, ' +
          'région, diplôme, discipline).',
      },
    },
  );

// =============================================================================
// WORKSPACE SETTINGS (Owner only)
// =============================================================================

const workspaceSettings = new Elysia()
  .use(authMacro)
  .guard({
    isAuth: true,
    allow: ['user', 'admin', 'root'],
    detail: { tags: TAGS },
    response: {
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
    },
  })
  .patch(
    '/workspaces/:id',
    ({ params: { id }, body, user }) => workspacesService.updateWorkspace(id, user.id, body),
    {
      params: idParamSchema,
      body: updateWorkspaceSchema,
      response: {
        200: readWorkspaceSchema,
      },
      detail: {
        summary: 'Modifier un espace de travail',
        description:
          "Modifie les paramètres d'un espace de travail : " +
          'nom, description, couleur et visibilité ' +
          "(public/privé). Retourne l'espace mis à jour. " +
          'Réservé au propriétaire.',
      },
    },
  )
  .post(
    '/workspaces/:id/users',
    ({ params: { id }, body: { users }, user }) => workspacesService.addUsers(id, user.id, users),
    {
      params: idParamSchema,
      body: addUsersSchema,
      response: {
        200: readWorkspaceSchema,
      },
      detail: {
        summary: 'Ajouter des membres',
        description:
          'Ajoute un ou plusieurs utilisateurs à un ' +
          'espace de travail avec un rôle attribué ' +
          '(`viewer` ou `editor`). Les utilisateurs ' +
          'déjà membres sont ignorés. Réservé au ' +
          'propriétaire.',
      },
    },
  )
  .patch(
    '/workspaces/:id/users',
    ({ params: { id }, body: { userId, role }, user }) =>
      workspacesService.updateUserRole(id, user.id, userId, role),
    {
      params: idParamSchema,
      body: updateUserRoleSchema,
      response: {
        200: readWorkspaceSchema,
      },
      detail: {
        summary: "Modifier le rôle d'un membre",
        description:
          "Change le rôle d'un membre d'un espace de " +
          'travail entre `viewer` (lecture seule) et ' +
          '`editor` (ajout/suppression de formations). ' +
          'Le rôle du propriétaire ne peut pas être ' +
          'modifié. Réservé au propriétaire.',
      },
    },
  )
  .post(
    '/workspaces/:id/users/remove',
    ({ params: { id }, body: { userIds }, user }) =>
      workspacesService.removeUsers(id, user.id, userIds),
    {
      params: idParamSchema,
      body: removeUsersSchema,
      response: {
        200: readWorkspaceSchema,
      },
      detail: {
        summary: 'Retirer des membres',
        description:
          "Retire un ou plusieurs membres d'un espace " +
          'de travail. Le propriétaire ne peut pas se ' +
          'retirer lui-même via cette route (utiliser ' +
          'la suppression). Réservé au propriétaire.',
      },
    },
  )
  .delete(
    '/workspaces/:id',
    async ({ params: { id }, user }) => {
      await workspacesService.deleteWorkspace(id, user.id);
      return {
        success: true,
        message: 'Espace de travail supprimé',
      };
    },
    {
      params: idParamSchema,
      response: {
        200: successResponseSchema,
      },
      detail: {
        summary: 'Supprimer un espace de travail',
        description:
          'Supprime définitivement un espace de travail, ' +
          'son cache et son historique. Les formations ' +
          'ne sont pas supprimées du catalogue. ' +
          'Cette action est irréversible. Réservé au ' +
          'propriétaire.',
      },
    },
  );

// =============================================================================
// WORKSPACE PROGRAMS (Editor + Owner)
// =============================================================================

const workspacePrograms = new Elysia()
  .use(authMacro)
  .guard({
    isAuth: true,
    allow: ['user', 'admin', 'root'],
    detail: { tags: TAGS },
    response: {
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  })
  .post(
    '/workspaces/:id/programs/preview',
    ({ params: { id }, body, user }) => workspacesService.previewAddPrograms(id, user.id, body),
    {
      params: idParamSchema,
      body: previewAddProgramsSchema,
      response: {
        200: previewAddProgramsResponseSchema,
        400: errorResponseSchema,
      },
      detail: {
        summary: "Prévisualiser l'ajout de formations",
        description:
          'Simule un ajout de formations sans modifier ' +
          "l'espace. Retourne le nombre de formations " +
          'qui seront ajoutées et le nombre déjà ' +
          "présentes dans l'espace. Utile pour afficher " +
          'une confirmation avant ajout.',
      },
    },
  )
  .post(
    '/workspaces/:id/programs',
    ({ params: { id }, body, user }) => workspacesService.addPrograms(id, user.id, body),
    {
      params: idParamSchema,
      body: addProgramsSchema,
      response: {
        200: readWorkspaceSchema,
        400: errorResponseSchema,
      },
      detail: {
        summary: 'Ajouter des formations',
        description:
          'Ajoute des formations à un espace de travail ' +
          "par liste d'INF (`programs`) et/ou depuis " +
          'des critères de recherche (`searchParams`). ' +
          'Les formations déjà présentes sont ignorées. ' +
          'Le cache est recalculé automatiquement. ' +
          'Réservé au propriétaire et aux éditeurs.',
      },
    },
  )
  .post(
    '/workspaces/:id/programs/remove',
    ({ params: { id }, body: { programs }, user }) =>
      workspacesService.removePrograms(id, user.id, programs),
    {
      params: idParamSchema,
      body: removeProgramsSchema,
      response: {
        200: readWorkspaceSchema,
        400: errorResponseSchema,
      },
      detail: {
        summary: 'Retirer des formations',
        description:
          "Retire une ou plusieurs formations d'un " +
          "espace de travail par liste d'INF. Le cache " +
          'est recalculé automatiquement. Réservé au ' +
          'propriétaire et aux éditeurs.',
      },
    },
  )
  .get(
    '/workspaces/:id/history',
    ({ params: { id }, query, user }) => workspacesService.getHistory(id, user.id, query),
    {
      params: idParamSchema,
      query: workspaceHistoryQuerySchema,
      response: {
        200: workspaceHistoryResponseSchema,
      },
      detail: {
        summary: "Consulter l'historique",
        description:
          "Retourne l'historique des événements d'un " +
          'espace de travail : création, ajout et ' +
          'suppression de formations, gestion des ' +
          'membres, modifications des paramètres. ' +
          'Paginé via `limit` et `offset`, filtrable ' +
          "par `type` d'événement.",
      },
    },
  )
  .post(
    '/workspaces/:id/leave',
    async ({ user, params: { id } }) => {
      await workspacesService.leaveWorkspace(id, user.id);
      return {
        success: true,
        message: "Vous avez quitté l'espace de travail.",
      };
    },
    {
      params: idParamSchema,
      response: {
        200: successResponseSchema,
        400: errorResponseSchema,
      },
      detail: {
        summary: 'Quitter un espace de travail',
        description:
          'Permet à un membre de quitter un espace de ' +
          'travail. Le propriétaire ne peut pas quitter ' +
          'son propre espace (il doit le supprimer ou ' +
          'transférer la propriété). Le membre est ' +
          "retiré de la liste et perd l'accès.",
      },
    },
  );

export const workspacesRoutes = new Elysia()
  .use(workspaces)
  .use(workspacePrograms)
  .use(workspaceSettings);
