import { collections } from '~/database/mongo';
import type { WorkspaceUserDoc, WorkspaceUserRole } from '~/database/types';
import {
  BadRequestError,
  DatabaseError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from '~/errors';
import type { ProgramLight } from '~/schemas/programs';
import { USER_LIGHT_PROJECTION } from '~/schemas/users';
import type { CreateWorkspace, ReadWorkspace, WorkspaceEvent } from '~/schemas/workspaces';
import {
  fetchAllProgramIds,
  previewSearchOverlap,
  SEARCH_CONFIG,
} from '~/services/programs.service';
import {
  getOrComputeWorkspaceCache,
  refreshWorkspaceCache,
} from '~/services/workspace-cache.service';
import {
  logProgramsAdded,
  logProgramsRemoved,
  logUserAdded,
  logUserRemoved,
  logUserRoleChanged,
  logWorkspaceCreated,
  logWorkspaceUpdated,
} from '~/services/workspace-events.service';
import { assertOwner, canEdit, canView } from '~/services/workspace-permissions.service';
import { generateId } from '~/utils/id';
import { escapeRegex } from '~/utils/strings';

// ============================================================================
// Constants
// ============================================================================

const ALLOWED_SORT_FIELDS = new Set(['name', 'createdAt', 'updatedAt']);

// ============================================================================
// Pipeline
// ============================================================================

const workspacePipeline = [
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
  {
    $lookup: {
      from: 'users',
      localField: 'users.userId',
      foreignField: 'id',
      as: '_userInfos',
      pipeline: [{ $project: { ...USER_LIGHT_PROJECTION, id: 1 } }],
    },
  },
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

async function getWorkspaceWithInfo(id: string): Promise<ReadWorkspace> {
  const result = await collections.workspaces
    .aggregate<ReadWorkspace>([{ $match: { id } }, ...workspacePipeline])
    .toArray();

  if (!result[0]) throw new InternalServerError();
  return result[0];
}

// ============================================================================
// CRUD
// ============================================================================

type CreateWorkspaceInput = CreateWorkspace & { ownerId: string };

export async function createWorkspace(input: CreateWorkspaceInput): Promise<ReadWorkspace> {
  const {
    name,
    description,
    color,
    isPublic = false,
    programs: directPrograms = [],
    users = [],
    searchParams,
    ownerId,
  } = input;

  let allProgramIds = [...directPrograms];

  if (searchParams) {
    const { q, ...filterParams } = searchParams as Record<string, unknown>;

    const hasQuery = q && typeof q === 'string' && q.trim().length > 0;
    const hasFilters = Object.values(filterParams).some(
      (v) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true),
    );

    if (!hasQuery && !hasFilters) {
      throw new BadRequestError(
        'Au moins une requête de recherche ou un filtre est requis pour créer un espace depuis une recherche.',
      );
    }

    const { programIds, totalCount } = await fetchAllProgramIds(
      { q: q as string | undefined, ...filterParams },
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
    addedBy: ownerId,
  }));

  const { insertedId } = await collections.workspaces.insertOne({
    id: workspaceId,
    createdAt: new Date(),
    color: color ?? 'yellow-tournesol',
    description,
    isPublic,
    name,
    owner: ownerId,
    programs: allProgramIds,
    updatedAt: new Date(),
    users: usersWithMeta,
  });

  if (!insertedId) throw new DatabaseError();

  await logWorkspaceCreated(workspaceId, name, ownerId);

  for (const u of usersWithMeta) {
    await logUserAdded(workspaceId, ownerId, u.userId, u.role);
  }

  if (allProgramIds.length > 0) {
    await logProgramsAdded(workspaceId, ownerId, allProgramIds);
    await refreshWorkspaceCache(workspaceId);
  }

  return getWorkspaceWithInfo(workspaceId);
}

export async function listPublicWorkspaces(options: {
  query?: string;
  size?: number;
  sortBy?: string;
  sortOrder?: number;
}): Promise<ReadWorkspace[]> {
  const { query, size, sortBy, sortOrder = 1 } = options;

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
  const limit = size ? [{ $limit: size }] : [];
  const sort =
    sortBy && ALLOWED_SORT_FIELDS.has(sortBy) ? [{ $sort: { [sortBy]: sortOrder } }] : [];

  return collections.workspaces
    .aggregate<ReadWorkspace>([
      { $match: { isPublic: true } },
      ...queryFilter,
      ...sort,
      ...limit,
      ...workspacePipeline,
    ])
    .toArray();
}

export async function listUserWorkspaces(
  userId: string,
  options: { query?: string; filter?: string },
): Promise<ReadWorkspace[]> {
  const { query, filter = 'all' } = options;

  const matches = new Map([
    ['owned', { owner: userId }],
    ['shared', { 'users.userId': userId, owner: { $ne: userId } }],
    ['all', { $or: [{ owner: userId }, { 'users.userId': userId }] }],
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

  return collections.workspaces
    .aggregate<ReadWorkspace>([{ $match: queryFilter }, ...workspacePipeline])
    .toArray();
}

export async function getWorkspace(id: string, userId: string): Promise<ReadWorkspace> {
  const workspace = await collections.workspaces.findOne({ id });

  if (!workspace) throw new NotFoundError();
  if (!canView(workspace, userId)) throw new ForbiddenError();

  return getWorkspaceWithInfo(id);
}

export async function getWorkspacePrograms(id: string, userId: string): Promise<ProgramLight[]> {
  const workspace = await collections.workspaces.findOne({ id });

  if (!workspace) throw new NotFoundError();
  if (!canView(workspace, userId)) throw new ForbiddenError();

  if (!workspace.programs?.length) return [];

  return collections.programs
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
}

export async function getAggregations(id: string, userId: string) {
  const workspace = await collections.workspaces.findOne({ id });

  if (!workspace) throw new NotFoundError();
  if (!canView(workspace, userId)) throw new ForbiddenError();

  const cache = await getOrComputeWorkspaceCache(id);

  if (!cache) {
    return {
      workspaceId: id,
      programCount: 0,
      studentsAggregations: null,
      programAggregations: null,
      insersupAggregations: null,
      updatedAt: new Date(),
    };
  }

  return cache;
}

// ============================================================================
// Settings (owner only)
// ============================================================================

export async function updateWorkspace(
  id: string,
  userId: string,
  body: { name?: string; description?: string; color?: string; isPublic?: boolean },
): Promise<ReadWorkspace> {
  const workspace = await collections.workspaces.findOne({ id });
  if (!workspace) throw new NotFoundError('Espace introuvable');
  assertOwner(workspace, userId);

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

  if (!acknowledged) throw new InternalServerError("Échec de la mise à jour de l'espace");

  if (changes.length > 0) {
    await logWorkspaceUpdated(id, userId, changes);
  }

  return getWorkspaceWithInfo(id);
}

export async function deleteWorkspace(id: string, userId: string): Promise<void> {
  const workspace = await collections.workspaces.findOne({ id });
  if (!workspace) throw new NotFoundError('Espace introuvable');
  assertOwner(workspace, userId);

  const { deletedCount } = await collections.workspaces.deleteOne({ id });
  if (deletedCount === 0) throw new InternalServerError("Échec de la suppression de l'espace");

  await collections.workspaceEvents.deleteMany({ workspaceId: id });
  await collections.workspaceCache.deleteOne({ workspaceId: id });
}

// ============================================================================
// Members
// ============================================================================

export async function addUsers(
  id: string,
  userId: string,
  users: { userId: string; role: WorkspaceUserRole }[],
): Promise<ReadWorkspace> {
  const workspace = await collections.workspaces.findOne({ id });
  if (!workspace) throw new NotFoundError('Espace introuvable');
  assertOwner(workspace, userId);

  const existingUserIds = workspace.users.map((u) => u.userId);
  const newUsersFiltered = users.filter((u) => !existingUserIds.includes(u.userId));

  if (newUsersFiltered.length === 0) {
    return getWorkspaceWithInfo(id);
  }

  const newUsers: WorkspaceUserDoc[] = newUsersFiltered.map((u) => ({
    userId: u.userId,
    role: u.role,
    addedAt: new Date(),
    addedBy: userId,
  }));

  const { acknowledged } = await collections.workspaces.updateOne(
    { id },
    {
      $push: { users: { $each: newUsers } },
      $set: { updatedAt: new Date() },
    },
  );

  if (!acknowledged) throw new InternalServerError("Échec de l'ajout d'utilisateurs à l'espace");

  for (const u of newUsers) {
    await logUserAdded(id, userId, u.userId, u.role);
  }

  return getWorkspaceWithInfo(id);
}

export async function updateUserRole(
  id: string,
  actorId: string,
  targetUserId: string,
  role: WorkspaceUserRole,
): Promise<ReadWorkspace> {
  const workspace = await collections.workspaces.findOne({ id });
  if (!workspace) throw new NotFoundError('Espace introuvable');
  assertOwner(workspace, actorId);

  const existingUser = workspace.users.find((u) => u.userId === targetUserId);
  if (!existingUser) throw new NotFoundError('Utilisateur introuvable dans cet espace');

  if (existingUser.role === role) {
    return getWorkspaceWithInfo(id);
  }

  const oldRole = existingUser.role;

  const { acknowledged } = await collections.workspaces.updateOne(
    { id, 'users.userId': targetUserId },
    {
      $set: {
        'users.$.role': role,
        updatedAt: new Date(),
      },
    },
  );

  if (!acknowledged) throw new InternalServerError('Échec de la mise à jour du rôle');

  await logUserRoleChanged(id, actorId, targetUserId, oldRole, role);

  return getWorkspaceWithInfo(id);
}

export async function removeUsers(
  id: string,
  actorId: string,
  userIds: string[],
): Promise<ReadWorkspace> {
  const workspace = await collections.workspaces.findOne({ id });
  if (!workspace) throw new NotFoundError('Espace introuvable');
  assertOwner(workspace, actorId);

  const { acknowledged } = await collections.workspaces.updateOne(
    { id },
    {
      $pull: { users: { userId: { $in: userIds } } },
      $set: { updatedAt: new Date() },
    },
  );

  if (!acknowledged) throw new InternalServerError();

  for (const targetUserId of userIds) {
    await logUserRemoved(id, actorId, targetUserId);
  }

  return getWorkspaceWithInfo(id);
}

export async function leaveWorkspace(id: string, userId: string): Promise<void> {
  const workspace = await collections.workspaces.findOne({ id });
  if (!workspace) throw new NotFoundError('Espace introuvable');

  if (workspace.owner === userId) {
    throw new BadRequestError(
      "Le propriétaire ne peut pas quitter l'espace. Vous pouvez le supprimer.",
    );
  }

  const isMember = workspace.users.some((u: WorkspaceUserDoc) => u.userId === userId);
  if (!isMember) throw new BadRequestError("Vous n'êtes pas membre de cet espace");

  const { acknowledged } = await collections.workspaces.updateOne(
    { id },
    {
      $pull: { users: { userId } },
      $set: { updatedAt: new Date() },
    },
  );

  if (!acknowledged) throw new InternalServerError("Échec du retrait de l'espace");

  await logUserRemoved(id, userId, userId);
}

// ============================================================================
// Programs
// ============================================================================

export async function previewAddPrograms(
  id: string,
  userId: string,
  input: { programIds?: string[]; searchParams?: Record<string, unknown> },
) {
  const workspace = await collections.workspaces.findOne({ id });
  if (!workspace) throw new NotFoundError();
  if (!canEdit(workspace, userId)) throw new ForbiddenError();

  if (input.searchParams) {
    return previewSearchOverlap(
      input.searchParams as Parameters<typeof previewSearchOverlap>[0],
      workspace.programs || [],
    );
  }

  if (input.programIds && input.programIds.length > 0) {
    const currentPrograms = new Set(workspace.programs || []);
    const alreadyPresent = input.programIds.filter((pid) => currentPrograms.has(pid)).length;
    const toAdd = input.programIds.length - alreadyPresent;

    return {
      toAdd,
      alreadyPresent,
      total: input.programIds.length,
    };
  }

  throw new BadRequestError(
    'Vous devez fournir des identifiants de formations ou des paramètres de recherche',
  );
}

export async function addPrograms(
  id: string,
  userId: string,
  input: { programs?: string[]; searchParams?: Record<string, unknown> },
): Promise<ReadWorkspace> {
  const workspace = await collections.workspaces.findOne({ id });
  if (!workspace) throw new NotFoundError();
  if (!canEdit(workspace, userId)) throw new ForbiddenError();

  let programIds: string[];

  if (input.programs && input.programs.length > 0) {
    programIds = input.programs;
  } else if (input.searchParams) {
    const { programIds: fetchedIds, totalCount } = await fetchAllProgramIds(
      input.searchParams as Parameters<typeof fetchAllProgramIds>[0],
      SEARCH_CONFIG.maxWorkspacePrograms,
    );

    if (totalCount > SEARCH_CONFIG.maxWorkspacePrograms) {
      throw new BadRequestError(
        `Cette recherche contient ${totalCount} résultats. Maximum autorisé: ${SEARCH_CONFIG.maxWorkspacePrograms}`,
      );
    }

    programIds = fetchedIds;
  } else {
    throw new BadRequestError('Vous devez fournir des formations ou des paramètres de recherche');
  }

  if (programIds.length === 0) {
    throw new BadRequestError('Aucune formation à ajouter');
  }

  const { acknowledged } = await collections.workspaces.updateOne(
    { id },
    {
      $addToSet: { programs: { $each: programIds } },
      $set: { updatedAt: new Date() },
    },
  );

  if (!acknowledged) throw new InternalServerError();

  await logProgramsAdded(id, userId, programIds);
  await refreshWorkspaceCache(id);

  return getWorkspaceWithInfo(id);
}

export async function removePrograms(
  id: string,
  userId: string,
  programIds: string[],
): Promise<ReadWorkspace> {
  const workspace = await collections.workspaces.findOne({ id });
  if (!workspace) throw new NotFoundError();
  if (!canEdit(workspace, userId)) throw new ForbiddenError();

  const { acknowledged } = await collections.workspaces.updateOne(
    { id },
    {
      $pull: { programs: { $in: programIds } },
      $set: { updatedAt: new Date() },
    },
  );

  if (!acknowledged) throw new InternalServerError();

  await logProgramsRemoved(id, userId, programIds);
  await refreshWorkspaceCache(id);

  return getWorkspaceWithInfo(id);
}

// ============================================================================
// History
// ============================================================================

export async function getHistory(
  id: string,
  userId: string,
  options: { limit?: string; offset?: string; type?: string },
) {
  const workspace = await collections.workspaces.findOne({ id });
  if (!workspace) throw new NotFoundError();
  if (!canEdit(workspace, userId)) throw new ForbiddenError();

  const filter: Record<string, unknown> = { workspaceId: id };
  if (options.type) filter.type = options.type;

  const events = await collections.workspaceEvents
    .aggregate<WorkspaceEvent>([
      { $match: filter },
      { $sort: { timestamp: -1 } },
      { $skip: Number(options.offset || '0') },
      { $limit: Number(options.limit || '50') },
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
      limit: Number(options.limit || '50'),
      offset: Number(options.offset || '0'),
    },
  };
}
