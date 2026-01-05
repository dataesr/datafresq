import { t } from 'elysia';

// ============================================================================
// Schemas
// ============================================================================

export const userRoleSchema = t.Union([t.Literal('user'), t.Literal('admin')], { default: 'user' });

export const updateUserSchema = t.Object({
  firstName: t.Optional(
    t.String({
      minLength: 1,
      maxLength: 50,
      error: 'Le prénom doit contenir entre 1 et 50 caractères',
    }),
  ),
  lastName: t.Optional(
    t.String({
      minLength: 1,
      maxLength: 50,
      error: 'Le nom doit contenir entre 1 et 50 caractères',
    }),
  ),
});

export const changePasswordSchema = t.Object({
  currentPassword: t.String({
    minLength: 1,
    error: 'Le mot de passe actuel est requis',
  }),
  newPassword: t.String({
    minLength: 8,
    pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$',
    error:
      'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
  }),
});

export const updateUserRoleSchema = t.Object({
  role: userRoleSchema,
});

export const userMeSchema = t.Object({
  id: t.String(),
  email: t.String(),
  firstName: t.Nullable(t.String()),
  lastName: t.Nullable(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  lastLogin: t.Nullable(t.Date()),
  role: userRoleSchema,
});

export const userAdminSchema = t.Object({
  id: t.String(),
  email: t.String(),
  firstName: t.Nullable(t.String()),
  lastName: t.Nullable(t.String()),
  role: userRoleSchema,
  isActive: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  lastLogin: t.Nullable(t.Date()),
});

// Light user info for embedding in other responses (workspaces, etc.)
export const userLightSchema = t.Object({
  email: t.String(),
  firstName: t.Nullable(t.String()),
  lastName: t.Nullable(t.String()),
});

// User search result - for user search endpoints
export const userSearchSchema = t.Object({
  id: t.String(),
  email: t.String(),
  firstName: t.Nullable(t.String()),
  lastName: t.Nullable(t.String()),
});

// ============================================================================
// Types
// ============================================================================

export type UserRole = typeof userRoleSchema.static;
export type UpdateUser = typeof updateUserSchema.static;
export type ChangePassword = typeof changePasswordSchema.static;
export type UpdateUserRole = typeof updateUserRoleSchema.static;
export type UserMe = typeof userMeSchema.static;
export type UserAdmin = typeof userAdminSchema.static;
export type UserLight = typeof userLightSchema.static;
export type UserSearch = typeof userSearchSchema.static;

// ============================================================================
// MongoDB Projections
// ============================================================================

export const USER_ME_PROJECTION = {
  _id: 0,
  id: 1,
  email: 1,
  firstName: 1,
  lastName: 1,
  createdAt: 1,
  updatedAt: 1,
  lastLogin: 1,
  role: 1,
} as const;

export const USER_ADMIN_PROJECTION = {
  _id: 0,
  id: 1,
  email: 1,
  firstName: 1,
  lastName: 1,
  role: 1,
  isActive: 1,
  createdAt: 1,
  updatedAt: 1,
  lastLogin: 1,
} as const;

export const USER_LIGHT_PROJECTION = {
  _id: 0,
  email: 1,
  firstName: 1,
  lastName: 1,
} as const;

export const USER_SEARCH_PROJECTION = {
  _id: 0,
  id: 1,
  email: 1,
  firstName: 1,
  lastName: 1,
} as const;
