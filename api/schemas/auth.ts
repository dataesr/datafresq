import { t } from 'elysia';
import { config } from '~/config';

// ============================================================================
// Schemas
// ============================================================================
export const signinSchema = t.Object({
  email: t.String({
    format: 'email',
    error: "Format d'email invalide",
  }),
  password: t.String({
    minLength: 1,
    error: 'Le mot de passe est requis',
  }),
});

export const forgotPasswordSchema = t.Object({
  email: t.String({
    format: 'email',
    error: "Format d'email invalide",
  }),
});

export const resetPasswordSchema = t.Object({
  token: t.String({
    minLength: 1,
    error: 'Le token est requis',
  }),
  password: t.String({
    minLength: 8,
    maxLength: 128,
    pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$',
    error:
      'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
  }),
});

export const inviteUserSchema = t.Object({
  email: t.String({
    format: 'email',
    error: "Format d'email invalide",
  }),
});

export const registerSchema = t.Object({
  firstName: t.String({
    minLength: 2,
    error: 'Le nom doit contenir au moins 2 caractères',
  }),
  lastName: t.String({
    minLength: 2,
    error: 'Le nom doit contenir au moins 2 caractères',
  }),
  password: t.String({
    minLength: 8,
    maxLength: 128,
    pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$',
    error:
      'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
  }),
  token: t.String({
    minLength: 1,
    error: 'Le token est requis',
  }),
});

export const refreshTokenSchema = t.Object({});

export const userResponseDataSchema = t.Object({
  id: t.String(),
  email: t.String({ format: 'email' }),
  name: t.Nullable(t.String()),
  role: t.String(),
});

export const authSuccessResponseSchema = t.Object({
  success: t.Literal(true),
  message: t.String(),
  user: userResponseDataSchema,
});

export const forgotPasswordResponseSchema = t.Object({
  success: t.Literal(true),
  message: t.String(),
  token: t.Optional(t.String()),
});

export const authCookieSchema = t.Cookie({
  [config.cookies.access.name]: t.String(),
  [config.cookies.session.name]: t.String(),
});

export const optionalAuthCookieSchema = t.Cookie({
  [config.cookies.access.name]: t.Optional(t.String()),
  [config.cookies.session.name]: t.Optional(t.String()),
});

// ============================================================================
// Types
// ============================================================================
export type Signin = typeof signinSchema.static;
export type ForgotPassword = typeof forgotPasswordSchema.static;
export type ResetPassword = typeof resetPasswordSchema.static;
export type InviteUser = typeof inviteUserSchema.static;
export type Register = typeof registerSchema.static;
export type RefreshToken = typeof refreshTokenSchema.static;
export type UserResponseData = typeof userResponseDataSchema.static;
export type AuthSuccessResponse = typeof authSuccessResponseSchema.static;
export type ForgotPasswordResponse = typeof forgotPasswordResponseSchema.static;
