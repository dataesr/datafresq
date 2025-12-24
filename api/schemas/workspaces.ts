import { t } from 'elysia';
import { userLightSchema } from './users';

// ============================================================================
// Schemas
// ============================================================================

export const workspaceUserRoleSchema = t.Union([t.Literal('viewer'), t.Literal('editor')]);

export const workspaceUserSchema = t.Object({
  email: t.String(),
  role: workspaceUserRoleSchema,
  addedAt: t.Date(),
  addedBy: t.String(),
});

export const workspaceUserWithInfoSchema = t.Object({
  email: t.String(),
  role: workspaceUserRoleSchema,
  addedAt: t.Date(),
  addedBy: t.String(),
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
        email: t.String({ format: 'email' }),
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
  targetUser: t.Optional(t.String()),
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
      email: t.String({ format: 'email' }),
      role: workspaceUserRoleSchema,
    }),
  ),
});

export const removeUsersSchema = t.Object({
  users: t.Array(t.String({ format: 'email' })),
});

export const addProgramsSchema = t.Object({
  programs: t.Array(t.String()),
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
export type UpdateWorkspace = typeof updateWorkspaceSchema.static;
export type ReadWorkspace = typeof readWorkspaceSchema.static;
export type WorkspaceEventType = typeof workspaceEventTypeSchema.static;
export type WorkspaceEventDetails = typeof workspaceEventDetailsSchema.static;
export type WorkspaceEvent = typeof workspaceEventSchema.static;
export type WorkspaceHistoryResponse = typeof workspaceHistoryResponseSchema.static;
export type WorkspaceCache = typeof workspaceCacheSchema.static;
export type AddUsers = typeof addUsersSchema.static;
export type RemoveUsers = typeof removeUsersSchema.static;
export type AddPrograms = typeof addProgramsSchema.static;
export type RemovePrograms = typeof removeProgramsSchema.static;
