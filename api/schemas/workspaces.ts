import { t } from 'elysia';
import { programsParamsSchema } from './programs';
import { userLightSchema } from './users';

// Search params for workspace operations (without pagination)
export const workspaceSearchParamsSchema = t.Omit(programsParamsSchema, ['page', 'pageSize', 'sort']);

// ============================================================================
// Schemas
// ============================================================================

export const workspaceUserRoleSchema = t.Union([t.Literal('viewer'), t.Literal('editor')]);

export const workspaceUserSchema = t.Object({
  userId: t.String(),
  role: workspaceUserRoleSchema,
  addedAt: t.Date(),
  addedBy: t.String(), // userId of user who added this member
});

export const workspaceUserWithInfoSchema = t.Object({
  userId: t.String(),
  role: workspaceUserRoleSchema,
  addedAt: t.Date(),
  addedBy: t.String(), // userId of user who added this member
  userInfo: t.Optional(userLightSchema),
});

export const createWorkspaceSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  description: t.Optional(t.String({ maxLength: 2000 })),
  isPublic: t.Optional(t.Boolean({ default: false })),
  color: t.Optional(t.String({ default: 'yellow-tournesol' })),
  programs: t.Optional(t.Array(t.String())),
  users: t.Optional(
    t.Array(
      t.Object({
        userId: t.String(),
        role: workspaceUserRoleSchema,
      }),
    ),
  ),
});

export const updateWorkspaceSchema = t.Partial(
  t.Object({
    name: t.String({ minLength: 1, maxLength: 255 }),
    description: t.String({ maxLength: 2000 }),
    isPublic: t.Boolean(),
    color: t.String(),
  }),
);

export const createWorkspaceFromSearchSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  description: t.Optional(t.String({ maxLength: 2000 })),
  isPublic: t.Optional(t.Boolean({ default: false })),
  color: t.Optional(t.String({ default: 'yellow-tournesol' })),
  searchParams: t.Omit(programsParamsSchema, ['page', 'pageSize', 'sort']),
});

export const createWorkspaceFromSearchResponseSchema = t.Object({
  id: t.String(),
  name: t.String(),
  programCount: t.Number(),
});

export const readWorkspaceSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.Optional(t.Nullable(t.String())),
  color: t.String(),
  isPublic: t.Boolean(),
  owner: t.String(),
  ownerInfo: t.Optional(userLightSchema),
  programs: t.Array(t.String()),
  users: t.Array(workspaceUserWithInfoSchema),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const workspaceEventTypeSchema = t.Union([
  t.Literal('workspace_created'),
  t.Literal('workspace_updated'),
  t.Literal('user_added'),
  t.Literal('user_removed'),
  t.Literal('user_role_changed'),
  t.Literal('program_added'),
  t.Literal('program_removed'),
  t.Literal('ownership_transferred'),
]);

export const workspaceEventDetailsSchema = t.Object({
  targetUserId: t.Optional(t.String()),
  targetUserInfo: t.Optional(userLightSchema),
  userRole: t.Optional(workspaceUserRoleSchema),
  programIds: t.Optional(t.Array(t.String())),
  changes: t.Optional(
    t.Array(
      t.Object({
        field: t.String(),
        oldValue: t.Optional(t.Unknown()),
        newValue: t.Optional(t.Unknown()),
      }),
    ),
  ),
  workspaceName: t.Optional(t.String()),
});

export const workspaceEventSchema = t.Object({
  id: t.String(),
  workspaceId: t.String(),
  type: workspaceEventTypeSchema,
  actor: t.String(),
  actorInfo: t.Optional(userLightSchema),
  timestamp: t.Date(),
  details: workspaceEventDetailsSchema,
});

export const workspaceHistoryResponseSchema = t.Object({
  data: t.Array(workspaceEventSchema),
  pagination: t.Object({
    total: t.Number(),
    limit: t.Number(),
    offset: t.Number(),
  }),
});

// Aggregation bucket schema for cache
const aggregationBucketSchema = t.Object({
  total: t.Number(),
  female: t.Number(),
  male: t.Number(),
});

export const workspaceCacheSchema = t.Object({
  workspaceId: t.String(),
  updatedAt: t.Date(),
  programCount: t.Number(),
  aggregations: t.Object({
    totalPrograms: t.Number(),
    totalStudents: t.Number(),
    totalFemale: t.Number(),
    totalMale: t.Number(),
    byYear: t.Array(t.Composite([t.Object({ year: t.String() }), aggregationBucketSchema])),
    byCycle: t.Array(t.Composite([t.Object({ cycle: t.String() }), aggregationBucketSchema])),
    byAcademy: t.Array(t.Composite([t.Object({ academy: t.String() }), aggregationBucketSchema])),
    byRegion: t.Array(t.Composite([t.Object({ region: t.String() }), aggregationBucketSchema])),
    byDiploma: t.Array(
      t.Composite([
        t.Object({ diploma: t.String(), diplomaLabel: t.String() }),
        aggregationBucketSchema,
      ]),
    ),
    byInstitution: t.Array(
      t.Composite([t.Object({ id: t.String(), name: t.String() }), aggregationBucketSchema]),
    ),
    byDiscipline: t.Array(
      t.Composite([
        t.Object({ discipline: t.String(), disciplineLabel: t.String() }),
        aggregationBucketSchema,
      ]),
    ),
    byLargeDiscipline: t.Array(
      t.Composite([
        t.Object({ largeDiscipline: t.String(), largeDisciplineLabel: t.String() }),
        aggregationBucketSchema,
      ]),
    ),
  }),
});

export const addUsersSchema = t.Object({
  users: t.Array(
    t.Object({
      userId: t.String(),
      role: workspaceUserRoleSchema,
    }),
  ),
});

export const removeUsersSchema = t.Object({
  userIds: t.Array(t.String()),
});

export const updateUserRoleSchema = t.Object({
  userId: t.String(),
  role: workspaceUserRoleSchema,
});

export const addProgramsSchema = t.Object({
  programs: t.Optional(t.Array(t.String())),
  searchParams: t.Optional(workspaceSearchParamsSchema),
});

export const previewAddProgramsSchema = t.Object({
  programIds: t.Optional(t.Array(t.String())),
  searchParams: t.Optional(workspaceSearchParamsSchema),
});

export const previewAddProgramsResponseSchema = t.Object({
  toAdd: t.Number(),
  alreadyPresent: t.Number(),
  total: t.Number(),
});

export const removeProgramsSchema = t.Object({
  programs: t.Array(t.String()),
});

// ============================================================================
// Types
// ============================================================================

export type WorkspaceUserRole = typeof workspaceUserRoleSchema.static;
export type WorkspaceUser = typeof workspaceUserSchema.static;
export type WorkspaceUserWithInfo = typeof workspaceUserWithInfoSchema.static;
export type CreateWorkspace = typeof createWorkspaceSchema.static;
export type CreateWorkspaceFromSearch = typeof createWorkspaceFromSearchSchema.static;
export type CreateWorkspaceFromSearchResponse = typeof createWorkspaceFromSearchResponseSchema.static;
export type UpdateWorkspace = typeof updateWorkspaceSchema.static;
export type ReadWorkspace = typeof readWorkspaceSchema.static;
export type WorkspaceEventType = typeof workspaceEventTypeSchema.static;
export type WorkspaceEventDetails = typeof workspaceEventDetailsSchema.static;
export type WorkspaceEvent = typeof workspaceEventSchema.static;
export type WorkspaceHistoryResponse = typeof workspaceHistoryResponseSchema.static;
export type WorkspaceCache = typeof workspaceCacheSchema.static;
export type AddUsers = typeof addUsersSchema.static;
export type RemoveUsers = typeof removeUsersSchema.static;
export type UpdateUserRole = typeof updateUserRoleSchema.static;
export type AddPrograms = typeof addProgramsSchema.static;
export type RemovePrograms = typeof removeProgramsSchema.static;
export type PreviewAddPrograms = typeof previewAddProgramsSchema.static;
export type PreviewAddProgramsResponse = typeof previewAddProgramsResponseSchema.static;
export type WorkspaceSearchParams = typeof workspaceSearchParamsSchema.static;
