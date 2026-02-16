import { Elysia, t } from 'elysia';

import { collections } from '~/database/mongo';
import type { WorkspaceDoc, WorkspaceUserDoc } from '~/database/types';
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError } from '~/errors';
import { DatabaseError } from '~/errors/database.error';
import { authMacro } from '~/macros/authMacro';
import { workspaceAggregationsResponseSchema } from '~/schemas/aggregations';
import { errorResponseSchema, successResponseSchema } from '~/schemas/common';
import { type ProgramLight, programLightSchema } from '~/schemas/programs';
import { USER_LIGHT_PROJECTION } from '~/schemas/users';
import {
  addProgramsSchema,
  addUsersSchema,
  createWorkspaceSchema,
  previewAddProgramsResponseSchema,
  previewAddProgramsSchema,
  type ReadWorkspace,
  readWorkspaceSchema,
  removeProgramsSchema,
  removeUsersSchema,
  updateUserRoleSchema,
  updateWorkspaceSchema,
  type WorkspaceEvent,
  workspaceHistoryResponseSchema,
} from '~/schemas/workspaces';
import { generateId } from '~/utils/id';
import { fetchAllProgramIds, previewSearchOverlap, SEARCH_CONFIG } from '~/utils/programs-search';
import { getOrComputeWorkspaceCache, refreshWorkspaceCache } from './utils/cache';
import {
  logProgramsAdded,
  logProgramsRemoved,
  logUserAdded,
  logUserRemoved,
  logUserRoleChanged,
  logWorkspaceCreated,
  logWorkspaceUpdated,
} from './utils/events';
import { escapeRegex } from '~/utils/strings';
import { ALLOWED_SORT_FIELDS } from './utils/constants';

const workspacePipeline = [
  // Lookup owner info by ID
  {
    $lookup: {
      from: 'users',
      localField: 'owner',
      foreignField: 'id',
      as: 'ownerInfo',
      pipeline: [{ $project: USER_LIGHT_PROJECTION }],
    },
  },
  { $set: { ownerInfo: { $first: '$ownerInfo' } } },
  // Lookup all user infos by userId
  {
    $lookup: {
      from: 'users',
      localField: 'users.userId',
      foreignField: 'id',
      as: '_userInfos',
      pipeline: [{ $project: { ...USER_LIGHT_PROJECTION, id: 1 } }],
    },
  },
  // Merge user info back into users array
  {
    $set: {
      users: {
        $map: {
          input: '$users',
          as: 'user',
          in: {
            userId: '$$user.userId',
            role: '$$user.role',
            addedAt: '$$user.addedAt',
            addedBy: '$$user.addedBy',
            userInfo: {
              $first: {
                $filter: {
                  input: '$_userInfos',
                  as: 'info',
                  cond: { $eq: ['$$info.id', '$$user.userId'] },
                },
              },
            },
          },
        },
      },
    },
  },
  { $project: { _id: 0, _userInfos: 0 } },
];

/**
 * Check if user has edit permission (owner or editor)
 */
function canEdit(workspace: WorkspaceDoc, userId: string): boolean {
  if (workspace.owner === userId) return true;
  return workspace.users.some((u) => u.userId === userId && u.role === 'editor');
}

/**
 * Check if user has view permission (owner, editor, viewer, or public)
 */
function canView(workspace: WorkspaceDoc, userId: string): boolean {
  if (workspace.isPublic) return true;
  if (workspace.owner === userId) return true;
  return workspace.users.some((u) => u.userId === userId);
}

// =============================================================================
// PUBLIC & PERSONAL WORKSPACE ROUTES
// =============================================================================

const workspaces = new Elysia()
  .use(authMacro)
  .post(
    '/workspaces',
    async ({
      body: {
        description,
        isPublic = false,
        name,
        color,
        programs: directPrograms = [],
        users = [],
        searchParams,
      },
      user,
    }) => {
      let allProgramIds = [...directPrograms];

      if (searchParams) {
        const { q, ...filterParams } = searchParams;

        const hasQuery = q && q.trim().length > 0;
        const hasFilters = Object.values(filterParams).some(
          (v) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true),
        );

        if (!hasQuery && !hasFilters) {
          throw new BadRequestError(
            'Au moins une requête de recherche ou un filtre est requis pour créer un espace depuis une recherche.',
          );
        }

        const { programIds, totalCount } = await fetchAllProgramIds(
          { q, ...filterParams },
          SEARCH_CONFIG.maxWorkspacePrograms,
        );

        if (programIds.length === 0) {
          throw new BadRequestError('Aucune formation ne correspond à cette recherche.');
        }

        if (totalCount > SEARCH_CONFIG.maxWorkspacePrograms) {
          throw new BadRequestError(
            `Cette recherche contient ${totalCount.toLocaleString('fr-FR')} formations, ce qui dépasse la limite de ${SEARCH_CONFIG.maxWorkspacePrograms.toLocaleString('fr-FR')}. Veuillez affiner votre recherche.`,
          );
        }

        allProgramIds = [...new Set([...allProgramIds, ...programIds])];
      }

      const workspaceId = generateId();

      const usersWithMeta: WorkspaceUserDoc[] = users.map((u) => ({
        userId: u.userId,
        role: u.role,
        addedAt: new Date(),
        addedBy: user.id,
      }));

      const { insertedId } = await collections.workspaces.insertOne({
        id: workspaceId,
        createdAt: new Date(),
        color: color ?? 'yellow-tournesol',
        description,
        isPublic,
        name,
        owner: user.id,
        programs: allProgramIds,
        updatedAt: new Date(),
        users: usersWithMeta,
      });

      if (!insertedId) throw new DatabaseError();

      await logWorkspaceCreated(workspaceId, name, user.id);

      for (const u of usersWithMeta) {
        await logUserAdded(workspaceId, user.id, u.userId, u.role);
      }

      if (allProgramIds.length > 0) {
        await logProgramsAdded(workspaceId, user.id, allProgramIds);
        await refreshWorkspaceCache(workspaceId);
      }

      const workspace = await collections.workspaces
        .aggregate<ReadWorkspace>([{ $match: { id: workspaceId } }, ...workspacePipeline])
        .toArray();

      if (!workspace?.[0]) throw new InternalServerError();
      return workspace[0];
    },
    {
      isAuth: true,
      body: createWorkspaceSchema,
      response: {
        200: readWorkspaceSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        422: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Créer un espace de travail',
        description:
          "**Crée un espace de travail. Accepte des formations directement via `programs` et/ou des critères de recherche via `searchParams`.** Limité à 5000 formations depuis une recherche.",
        tags: ['Espaces de travail'],
      },
    },
  )
  // List public workspaces
  .get(
    '/workspaces',
    async ({ query: { query, size, sortBy, sortOrder = '1' } }) => {
      const queryFilter = query
        ? [
            {
              $match: {
                $or: [
                  { description: { $regex: escapeRegex(query), $options: 'i' } },
                  { name: { $regex: escapeRegex(query), $options: 'i' } },
                ],
              },
            },
          ]
        : [];
      const limit = size ? [{ $limit: Number(size) }] : [];
      const sort = sortBy && ALLOWED_SORT_FIELDS.has(sortBy)
        ? [{ $sort: { [sortBy]: Number(sortOrder) } }] : [];

      const workspacesList = await collections.workspaces
        .aggregate<ReadWorkspace>([
          { $match: { isPublic: true } },
          ...queryFilter,
          ...sort,
          ...limit,
          ...workspacePipeline,
        ])
        .toArray();

      return workspacesList;
    },
    {
      isAuth: true,
      query: t.Optional(
        t.Object({
          query: t.Optional(t.String()),
          size: t.Optional(t.String()),
          sortBy: t.Optional(t.String()),
          sortOrder: t.Optional(t.Union([t.Literal('1'), t.Literal('-1')])),
        }),
      ),
      response: {
        200: t.Array(readWorkspaceSchema),
        401: errorResponseSchema,
      },
      detail: {
        summary: 'Lister les espaces de travail publics',
        tags: ['Espaces de travail'],
      },
    },
  )
  // List user's workspaces (owned or member)
  .get(
    '/me/workspaces',
    async ({ user, query: { query, filter = 'all' } }) => {
      const matches = new Map([
        ['owned', { owner: user.id }],
        ['shared', { 'users.userId': user.id, owner: { $ne: user.id } }],
        ['all', { $or: [{ owner: user.id }, { 'users.userId': user.id }] }],
      ]);

      const baseMatch = matches.get(filter);

      const queryFilter = query
        ? {
            $and: [
              baseMatch,
              {
                $or: [
                  { description: { $regex: escapeRegex(query), $options: 'i' } },
                  { name: { $regex: escapeRegex(query), $options: 'i' } },
                ],
              },
            ],
          }
        : baseMatch;

      const workspacesList = await collections.workspaces
        .aggregate<ReadWorkspace>([{ $match: queryFilter }, ...workspacePipeline])
        .toArray();

      return workspacesList;
    },
    {
      isAuth: true,
      query: t.Optional(
        t.Object({
          query: t.Optional(t.String()),
          filter: t.Optional(t.Union([t.Literal('all'), t.Literal('owned'), t.Literal('shared')])),
        }),
      ),
      response: {
        200: t.Array(readWorkspaceSchema),
        401: errorResponseSchema,
      },
      detail: {
        summary: "Lister les espaces de travail de l'utilisateur",
        description:
          "**Permet à l'utilisateur connecté de lister les espaces de travail dont il est propriétaire ou membre.**\n\n" +
          'Filtres disponibles:\n' +
          '- `all` (défaut): tous les espaces (propriétaire ou membre)\n' +
          "- `owned`: uniquement les espaces dont l'utilisateur est propriétaire\n" +
          "- `shared`: uniquement les espaces partagés avec l'utilisateur (pas propriétaire)",
        tags: ['Espaces de travail'],
      },
    },
  )
  // Get workspace by ID
  .get(
    '/workspaces/:id',
    async ({ params: { id }, user }) => {
      const workspace = await collections.workspaces.findOne({ id });

      if (!workspace) throw new NotFoundError();
      if (!canView(workspace, user.id)) throw new ForbiddenError();

      const workspaceWithInfo = await collections.workspaces
        .aggregate<ReadWorkspace>([{ $match: { id } }, ...workspacePipeline])
        .toArray();

      if (!workspaceWithInfo[0]) throw new InternalServerError();
      return workspaceWithInfo[0];
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: readWorkspaceSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: "Obtenir les détails de l'espace de travail spécifié",
        tags: ['Espaces de travail'],
      },
    },
  )
  .get(
    '/workspaces/:id/programs',
    async ({ params: { id }, user }) => {
      const workspace = await collections.workspaces.findOne({ id });

      if (!workspace) throw new NotFoundError();
      if (!canView(workspace, user.id)) throw new ForbiddenError();

      if (!workspace.programs?.length) return [];

      // Lookup programs from MongoDB programs collection
      const programs = await collections.programs
        .aggregate<ProgramLight>([
          { $match: { inf: { $in: workspace.programs } } },
          {
            $project: {
              _id: 0,
              inf: 1,
              label: 1,
              cycle: 1,
              accreditation: 1,
              diploma: 1,
              etablissements: 1,
              hasSiseInfos: 1,
              hasRncpInfos: 1,
              hasRomeInfos: 1,
            },
          },
        ])
        .toArray();

      return programs;
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Array(programLightSchema),
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: "Récupérer les formations d'un espace de travail",
        description:
          "Récupérer les formations d'un espace de travail par son ID avec les données complètes",
        tags: ['Espaces de travail'],
      },
    },
  )
  .get(
    '/workspaces/:id/aggregations',
    async ({ params: { id }, user }) => {
      const workspace = await collections.workspaces.findOne({ id });

      if (!workspace) throw new NotFoundError();
      if (!canView(workspace, user.id)) throw new ForbiddenError();

      // Get from cache or compute
      const cache = await getOrComputeWorkspaceCache(id);

      if (!cache) {
        return {
          programCount: 0,
          studentsAggregations: null,
          programAggregations: null,
          insersupAggregations: null,
          updatedAt: new Date(),
        };
      }

      return {
        programCount: cache.programCount,
        studentsAggregations: cache.studentsAggregations,
        programAggregations: cache.programAggregations,
        insersupAggregations: cache.insersupAggregations,
        updatedAt: cache.updatedAt,
      };
    },
    {
      isAuth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: workspaceAggregationsResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: "Obtenir les agrégations d'un espace de travail",
        description:
          'Retourne les agrégations pré-calculées depuis le cache (SISE pour étudiants, programs pour formations)',
        tags: ['Espaces de travail'],
      },
    },
  );

// =============================================================================
// WORKSPACE SETTINGS (Owner only)
// =============================================================================

const workspaceSettings = new Elysia()
  .use(authMacro)
  .resolve(async ({ user, params: { id } }) => {
    const workspace = await collections.workspaces.findOne({ id });
    if (!workspace) throw new NotFoundError('Workspace not found');
    if (workspace.owner !== user?.id)
      throw new ForbiddenError('You are not the owner of this workspace');
    return { workspace };
  })
  .patch(
    '/workspaces/:id',
    async ({ params: { id }, body, workspace, user }) => {
      const changes: { field: string; oldValue?: unknown; newValue?: unknown }[] = [];

      if (body.name !== undefined && body.name !== workspace.name) {
        changes.push({ field: 'name', oldValue: workspace.name, newValue: body.name });
      }
      if (body.description !== undefined && body.description !== workspace.description) {
        changes.push({
          field: 'description',
          oldValue: workspace.description,
          newValue: body.description,
        });
      }
      if (body.color !== undefined && body.color !== workspace.color) {
        changes.push({ field: 'color', oldValue: workspace.color, newValue: body.color });
      }
      if (body.isPublic !== undefined && body.isPublic !== workspace.isPublic) {
        changes.push({ field: 'isPublic', oldValue: workspace.isPublic, newValue: body.isPublic });
      }

      const { acknowledged } = await collections.workspaces.updateOne(
        { id },
        { $set: { ...body, updatedAt: new Date() } },
      );

      if (!acknowledged) throw new InternalServerError('Failed to update workspace');

      if (changes.length > 0) {
        await logWorkspaceUpdated(id, user.id, changes);
      }

      const updatedWorkspace = await collections.workspaces
        .aggregate<ReadWorkspace>([{ $match: { id } }, ...workspacePipeline])
        .toArray();

      if (!updatedWorkspace[0]) throw new InternalServerError();
      return updatedWorkspace[0];
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: updateWorkspaceSchema,
      response: {
        200: readWorkspaceSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Modifier un espace de travail',
        description:
          'Modifier les paramètres (nom, description, couleur, visibilité) - propriétaire uniquement',
        tags: ['Espaces de travail'],
      },
    },
  )
  .post(
    '/workspaces/:id/users',
    async ({ params: { id }, body: { users }, user, workspace }) => {
      // Filter out users that are already in the workspace
      const existingUserIds = workspace.users.map((u) => u.userId);
      const newUsersFiltered = users.filter((u) => !existingUserIds.includes(u.userId));

      if (newUsersFiltered.length === 0) {
        // Return current workspace if no new users to add
        const currentWorkspace = await collections.workspaces
          .aggregate<ReadWorkspace>([{ $match: { id } }, ...workspacePipeline])
          .toArray();
        if (!currentWorkspace[0]) throw new InternalServerError();
        return currentWorkspace[0];
      }

      const newUsers: WorkspaceUserDoc[] = newUsersFiltered.map((u) => ({
        userId: u.userId,
        role: u.role,
        addedAt: new Date(),
        addedBy: user.id,
      }));

      const { acknowledged } = await collections.workspaces.updateOne(
        { id },
        {
          $push: {
            users: { $each: newUsers },
          },
          $set: { updatedAt: new Date() },
        },
      );

      if (!acknowledged) throw new InternalServerError('Failed to add users to workspace');

      for (const u of newUsers) {
        await logUserAdded(id, user.id, u.userId, u.role);
      }

      const updatedWorkspace = await collections.workspaces
        .aggregate<ReadWorkspace>([{ $match: { id } }, ...workspacePipeline])
        .toArray();

      if (!updatedWorkspace[0]) throw new InternalServerError();
      return updatedWorkspace[0];
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: addUsersSchema,
      response: {
        200: readWorkspaceSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Ajouter des utilisateurs à un espace de travail',
        description:
          'Ajouter des utilisateurs avec un rôle (viewer ou editor) - propriétaire uniquement',
        tags: ['Espaces de travail'],
      },
    },
  )
  .patch(
    '/workspaces/:id/users',
    async ({ params: { id }, body: { userId, role }, user }) => {
      // Find the workspace and the user's current role
      const workspace = await collections.workspaces.findOne({ id });
      if (!workspace) throw new NotFoundError('Workspace not found');

      const existingUser = workspace.users.find((u) => u.userId === userId);
      if (!existingUser) throw new NotFoundError('User not found in workspace');

      // Don't update if role is the same
      if (existingUser.role === role) {
        const current = await collections.workspaces
          .aggregate<ReadWorkspace>([{ $match: { id } }, ...workspacePipeline])
          .toArray();
        if (!current[0]) throw new InternalServerError();
        return current[0];
      }

      const oldRole = existingUser.role;

      const { acknowledged } = await collections.workspaces.updateOne(
        { id, 'users.userId': userId },
        {
          $set: {
            'users.$.role': role,
            updatedAt: new Date(),
          },
        },
      );

      if (!acknowledged) throw new InternalServerError('Failed to update user role');

      await logUserRoleChanged(id, user.id, userId, oldRole, role);

      const updatedWorkspace = await collections.workspaces
        .aggregate<ReadWorkspace>([{ $match: { id } }, ...workspacePipeline])
        .toArray();

      if (!updatedWorkspace[0]) throw new InternalServerError();
      return updatedWorkspace[0];
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: updateUserRoleSchema,
      response: {
        200: readWorkspaceSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: "Modifier le rôle d'un utilisateur",
        description: "Changer le rôle d'un utilisateur dans un espace de travail",
        tags: ['Espaces de travail'],
      },
    },
  )
  .delete(
    '/workspaces/:id/users',
    async ({ params: { id }, body: { userIds }, user }) => {
      const { acknowledged } = await collections.workspaces.updateOne(
        { id },
        {
          $pull: { users: { userId: { $in: userIds } } },
          $set: { updatedAt: new Date() },
        },
      );

      if (!acknowledged) throw new InternalServerError();

      for (const targetUserId of userIds) {
        await logUserRemoved(id, user.id, targetUserId);
      }

      const workspace = await collections.workspaces
        .aggregate<ReadWorkspace>([{ $match: { id } }, ...workspacePipeline])
        .toArray();

      if (!workspace[0]) throw new InternalServerError();
      return workspace[0];
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: removeUsersSchema,
      response: {
        200: readWorkspaceSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: "Retirer des utilisateurs d'un espace de travail",
        tags: ['Espaces de travail'],
      },
    },
  )
  .delete(
    '/workspaces/:id',
    async ({ params: { id } }) => {
      const { deletedCount } = await collections.workspaces.deleteOne({ id });

      if (deletedCount === 0) throw new InternalServerError('Failed to delete workspace');

      await collections.workspaceEvents.deleteMany({ workspaceId: id });
      await collections.workspaceCache.deleteOne({ workspaceId: id });

      return { message: 'Workspace deleted successfully' };
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: successResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Supprimer un espace de travail',
        description: 'Supprimer définitivement un espace de travail - propriétaire uniquement',
        tags: ['Espaces de travail'],
      },
    },
  );

const workspacePrograms = new Elysia()
  .use(authMacro)
  .resolve(async ({ user, params: { id } }) => {
    const workspace = await collections.workspaces.findOne({ id });
    if (!workspace) throw new NotFoundError();
    if (!canEdit(workspace, user?.id as string)) throw new ForbiddenError();
    return { workspace };
  })
  .post(
    '/workspaces/:id/programs/preview',
    async ({ workspace, body: { programIds, searchParams } }) => {
      if (searchParams) {
        return previewSearchOverlap(searchParams, workspace.programs || []);
      }

      if (programIds && programIds.length > 0) {
        const currentPrograms = new Set(workspace.programs || []);
        const alreadyPresent = programIds.filter((id) => currentPrograms.has(id)).length;
        const toAdd = programIds.length - alreadyPresent;

        return {
          toAdd,
          alreadyPresent,
          total: programIds.length,
        };
      }

      throw new BadRequestError('Either programIds or searchParams must be provided');
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: previewAddProgramsSchema,
      response: {
        200: previewAddProgramsResponseSchema,
        400: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: "Prévisualiser l'ajout de formations",
        description: 'Retourne le nombre de formations à ajouter et déjà présentes',
        tags: ['Espaces de travail'],
      },
    },
  )
  .post(
    '/workspaces/:id/programs',
    async ({ params: { id }, body: { programs, searchParams }, user }) => {
      let programIds: string[];

      if (programs && programs.length > 0) {
        programIds = programs;
      } else if (searchParams) {
        const { programIds: fetchedIds, totalCount } = await fetchAllProgramIds(
          searchParams,
          SEARCH_CONFIG.maxWorkspacePrograms,
        );

        if (totalCount > SEARCH_CONFIG.maxWorkspacePrograms) {
          throw new BadRequestError(
            `Cette recherche contient ${totalCount} résultats. Maximum autorisé: ${SEARCH_CONFIG.maxWorkspacePrograms}`,
          );
        }

        programIds = fetchedIds;
      } else {
        throw new BadRequestError('Either programs or searchParams must be provided');
      }

      if (programIds.length === 0) {
        throw new BadRequestError('No programs to add');
      }

      const { acknowledged } = await collections.workspaces.updateOne(
        { id },
        {
          $addToSet: { programs: { $each: programIds } },
          $set: { updatedAt: new Date() },
        },
      );

      if (!acknowledged) throw new InternalServerError();

      await logProgramsAdded(id, user.id, programIds);
      await refreshWorkspaceCache(id);

      const workspace = await collections.workspaces
        .aggregate<ReadWorkspace>([{ $match: { id } }, ...workspacePipeline])
        .toArray();

      if (!workspace[0]) throw new InternalServerError();
      return workspace[0];
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: addProgramsSchema,
      response: {
        200: readWorkspaceSchema,
        400: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Ajouter des formations à un espace de travail',
        description:
          'Ajouter des formations par IDs ou depuis une recherche - propriétaire et éditeurs',
        tags: ['Espaces de travail'],
      },
    },
  )
  .delete(
    '/workspaces/:id/programs',
    async ({ params: { id }, body: { programs }, user }) => {
      const { acknowledged } = await collections.workspaces.updateOne(
        { id },
        {
          $pull: { programs: { $in: programs } },
          $set: { updatedAt: new Date() },
        },
      );

      if (!acknowledged) throw new InternalServerError();

      await logProgramsRemoved(id, user.id, programs);
      await refreshWorkspaceCache(id);

      const workspace = await collections.workspaces
        .aggregate<ReadWorkspace>([{ $match: { id } }, ...workspacePipeline])
        .toArray();

      if (!workspace[0]) throw new InternalServerError();
      return workspace[0];
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: removeProgramsSchema,
      response: {
        200: readWorkspaceSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: "Retirer des formations d'un espace de travail",
        tags: ['Espaces de travail'],
      },
    },
  )
  .get(
    '/workspaces/:id/history',
    async ({ params: { id }, query: { limit = '50', offset = '0', type } }) => {
      const filter: Record<string, unknown> = { workspaceId: id };
      if (type) filter.type = type;

      const events = await collections.workspaceEvents
        .aggregate<WorkspaceEvent>([
          { $match: filter },
          { $sort: { timestamp: -1 } },
          { $skip: Number(offset) },
          { $limit: Number(limit) },
          { $set: { id: { $toString: '$_id' } } },
          {
            $lookup: {
              from: 'users',
              localField: 'actor',
              foreignField: 'id',
              as: 'actorInfo',
              pipeline: [{ $project: USER_LIGHT_PROJECTION }],
            },
          },
          { $set: { actorInfo: { $first: '$actorInfo' } } },
          {
            $lookup: {
              from: 'users',
              localField: 'details.targetUserId',
              foreignField: 'id',
              as: 'details.targetUserInfo',
              pipeline: [{ $project: USER_LIGHT_PROJECTION }],
            },
          },
          { $set: { 'details.targetUserInfo': { $first: '$details.targetUserInfo' } } },
          { $project: { _id: 0 } },
        ])
        .toArray();

      const total = await collections.workspaceEvents.countDocuments(filter);

      return {
        data: events,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
        },
      };
    },
    {
      isAuth: true,
      params: t.Object({ id: t.String() }),
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
        type: t.Optional(t.String()),
      }),
      response: {
        200: workspaceHistoryResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: "Obtenir l'historique d'un espace de travail",
        description: 'Liste des événements (ajout/suppression de formations, utilisateurs, etc.)',
        tags: ['Espaces de travail'],
      },
    },
  )
  .post(
    '/workspaces/:id/leave',
    async ({ user, params: { id } }) => {
      const workspace = await collections.workspaces.findOne({ id });

      if (!workspace) throw new NotFoundError('Workspace not found');

      // Owner cannot leave their own workspace
      if (workspace.owner === user.id) {
        throw new BadRequestError('Owner cannot leave the workspace. You may delete it.');
      }

      const isMember = workspace.users.some((u: WorkspaceUserDoc) => u.userId === user.id);
      if (!isMember) throw new BadRequestError('You are not a member of this workspace');

      const { acknowledged } = await collections.workspaces.updateOne(
        { id },
        {
          $pull: { users: { userId: user.id } },
          $set: { updatedAt: new Date() },
        },
      );

      if (!acknowledged) throw new InternalServerError('Failed to leave workspace');

      await logUserRemoved(id, user.id, user.id);

      return { message: 'You have successfully left the workspace.' };
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: successResponseSchema,
        400: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Quitter un espace de travail',
        description: "Permet à un membre de quitter l'espace de travail (pas le propriétaire)",
        tags: ['Espaces de travail'],
      },
    },
  );

export default new Elysia().use(workspaces).use(workspacePrograms).use(workspaceSettings);
