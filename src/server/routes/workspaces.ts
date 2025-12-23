import { Elysia, t } from 'elysia';

import { collections } from '~/database/mongo';
import type { WorkspaceDoc, WorkspaceUserDoc } from '~/database/types';
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError } from '~/errors';
import { DatabaseError } from '~/errors/database.error';
import { authMacro } from '~/macros/authMacro';
import { errorResponseSchema, successResponseSchema } from '~/schemas/common';
import { type ProgramLight, programLightSchema } from '~/schemas/programs';
import { USER_LIGHT_PROJECTION } from '~/schemas/users';
import {
  addProgramsSchema,
  addUsersSchema,
  createWorkspaceSchema,
  type ReadWorkspace,
  readWorkspaceSchema,
  removeProgramsSchema,
  removeUsersSchema,
  updateWorkspaceSchema,
  type WorkspaceEvent,
  workspaceHistoryResponseSchema,
} from '~/schemas/workspaces';
import { generateId } from '~/utils/id';
import { getOrComputeWorkspaceCache, refreshWorkspaceCache } from './workspaces/utils/cache';
import {
  logProgramsAdded,
  logProgramsRemoved,
  logUserAdded,
  logUserRemoved,
  logWorkspaceCreated,
  logWorkspaceUpdated,
} from './workspaces/utils/events';

const workspacePipeline = [
  {
    $lookup: {
      from: 'users',
      localField: 'owner',
      foreignField: 'email',
      as: 'ownerInfo',
      pipeline: [{ $project: USER_LIGHT_PROJECTION }],
    },
  },
  { $set: { ownerInfo: { $first: '$ownerInfo' } } },
  {
    $lookup: {
      from: 'users',
      localField: 'users.email',
      foreignField: 'email',
      as: '_userInfos',
      pipeline: [{ $project: USER_LIGHT_PROJECTION }],
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
            email: '$$user.email',
            role: '$$user.role',
            addedAt: '$$user.addedAt',
            addedBy: '$$user.addedBy',
            userInfo: {
              $first: {
                $filter: {
                  input: '$_userInfos',
                  as: 'info',
                  cond: { $eq: ['$$info.email', '$$user.email'] },
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
function canEdit(workspace: WorkspaceDoc, userEmail: string): boolean {
  if (workspace.owner === userEmail) return true;
  return workspace.users.some((u) => u.email === userEmail && u.role === 'editor');
}

/**
 * Check if user has view permission (owner, editor, viewer, or public)
 */
function canView(workspace: WorkspaceDoc, userEmail: string): boolean {
  if (workspace.isPublic) return true;
  if (workspace.owner === userEmail) return true;
  return workspace.users.some((u) => u.email === userEmail);
}

// =============================================================================
// PUBLIC & PERSONAL WORKSPACE ROUTES
// =============================================================================

const workspaces = new Elysia()
  .use(authMacro)
  // Create a new workspace
  .post(
    '/workspaces',
    async ({
      body: { description, isPublic = false, name, color, programs = [], users = [] },
      user,
    }) => {
      const workspaceId = generateId();

      // Transform users to include metadata
      const usersWithMeta = users.map((u) => ({
        email: u.email,
        role: u.role,
        addedAt: new Date(),
        addedBy: user.email,
      }));

      const { insertedId } = await collections.workspaces.insertOne({
        id: workspaceId,
        createdAt: new Date(),
        color: color ?? 'yellow-tournesol',
        description,
        isPublic,
        name,
        owner: user.email,
        programs: programs ?? [],
        updatedAt: new Date(),
        users: usersWithMeta,
      });

      if (!insertedId) throw new DatabaseError();

      // Log creation event
      await logWorkspaceCreated(workspaceId, name, user.email);

      // Log user additions
      for (const u of usersWithMeta) {
        await logUserAdded(workspaceId, user.email, u.email, u.role);
      }

      // If programs were added, refresh cache
      if (programs.length > 0) {
        await logProgramsAdded(workspaceId, user.email, programs);
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
          "**Permet à l'utilisateur connecté de créer un espace de travail avec les informations fournies.**",
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
                  { description: { $regex: query, $options: 'i' } },
                  { name: { $regex: query, $options: 'i' } },
                ],
              },
            },
          ]
        : [];
      const limit = size ? [{ $limit: Number(size) }] : [];
      const sort = sortBy ? [{ $sort: { [sortBy]: Number(sortOrder) } }] : [];

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
    async ({ user, query: { query } }) => {
      const baseMatch = { $or: [{ owner: user.email }, { 'users.email': user.email }] };
      const queryFilter = query
        ? {
            $and: [
              baseMatch,
              {
                $or: [
                  { description: { $regex: query, $options: 'i' } },
                  { name: { $regex: query, $options: 'i' } },
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
        }),
      ),
      response: {
        200: t.Array(readWorkspaceSchema),
        401: errorResponseSchema,
      },
      detail: {
        summary: "Lister les espaces de travail de l'utilisateur",
        description:
          "**Permet à l'utilisateur connecté de lister les espaces de travail dont il est propriétaire ou membre.**",
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
      if (!canView(workspace, user.email)) throw new ForbiddenError();

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
      if (!canView(workspace, user.email)) throw new ForbiddenError();

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
      if (!canView(workspace, user.email)) throw new ForbiddenError();

      // Get from cache or compute
      const cache = await getOrComputeWorkspaceCache(id);

      if (!cache) {
        return {
          programCount: 0,
          aggregations: null,
          updatedAt: new Date(),
        };
      }

      return {
        programCount: cache.programCount,
        aggregations: cache.aggregations,
        updatedAt: cache.updatedAt,
      };
    },
    {
      isAuth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({
          programCount: t.Number(),
          aggregations: t.Nullable(t.Any()),
          updatedAt: t.Date(),
        }),
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: "Obtenir les agrégations SISE d'un espace de travail",
        description: 'Retourne les agrégations pré-calculées depuis le cache',
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
    if (workspace.owner !== user?.email)
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
        await logWorkspaceUpdated(id, user.email, changes);
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
    async ({ params: { id }, body: { users }, user }) => {
      const newUsers: WorkspaceUserDoc[] = users.map((u) => ({
        email: u.email,
        role: u.role,
        addedAt: new Date(),
        addedBy: user.email,
      }));

      const { acknowledged } = await collections.workspaces.updateOne(
        { id },
        {
          $push: {
            users: {
              $each: newUsers.filter(
                (u) => !newUsers.some((existing) => existing.email === u.email),
              ),
            },
          },
          $set: { updatedAt: new Date() },
        },
      );

      if (!acknowledged) throw new InternalServerError('Failed to add users to workspace');

      for (const u of newUsers) {
        await logUserAdded(id, user.email, u.email, u.role);
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
  .delete(
    '/workspaces/:id/users',
    async ({ params: { id }, body: { users }, user }) => {
      const { acknowledged } = await collections.workspaces.updateOne(
        { id },
        {
          $pull: { users: { email: { $in: users } } },
          $set: { updatedAt: new Date() },
        },
      );

      if (!acknowledged) throw new InternalServerError();

      for (const targetUser of users) {
        await logUserRemoved(id, user.email, targetUser);
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
    if (!canEdit(workspace, user?.email as string)) throw new ForbiddenError();
    return { workspace };
  })
  .post(
    '/workspaces/:id/programs',
    async ({ params: { id }, body: { programs }, user }) => {
      const { acknowledged } = await collections.workspaces.updateOne(
        { id },
        {
          $addToSet: { programs: { $each: programs } },
          $set: { updatedAt: new Date() },
        },
      );

      if (!acknowledged) throw new InternalServerError();

      await logProgramsAdded(id, user.email, programs);
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
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Ajouter des formations à un espace de travail',
        description: 'Ajouter des formations par leur identifiant INF - propriétaire et éditeurs',
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

      await logProgramsRemoved(id, user.email, programs);
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
              foreignField: 'email',
              as: 'actorInfo',
              pipeline: [{ $project: USER_LIGHT_PROJECTION }],
            },
          },
          { $set: { actorInfo: { $first: '$actorInfo' } } },
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
      if (workspace.owner === user.email) {
        throw new BadRequestError('Owner cannot leave the workspace. You may delete it.');
      }

      const isMember = workspace.users.some((u: WorkspaceUserDoc) => u.email === user.email);
      if (!isMember) throw new BadRequestError('You are not a member of this workspace');

      const { acknowledged } = await collections.workspaces.updateOne(
        { id },
        {
          $pull: { users: { email: user.email } },
          $set: { updatedAt: new Date() },
        },
      );

      if (!acknowledged) throw new InternalServerError('Failed to leave workspace');

      await logUserRemoved(id, user.email, user.email);

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
