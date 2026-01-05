import { jwt } from '@elysiajs/jwt';
import { Elysia, t } from 'elysia';
import { config } from '~/config';

export const jwtSchema = t.Object({
  sub: t.String(), // User ID
  email: t.String(),
  role: t.String(),
  iat: t.Optional(t.Number()),
  exp: t.Optional(t.Number()),
});

export type JWTPayload = typeof jwtSchema.static;

const ACCESS_TOKEN_EXP = config.tokens.accessExpSeconds;

export const jwtAccessToken = new Elysia({
  name: 'jwt-access-token',
}).use(
  jwt({
    name: 'jwtAccessToken',
    secret: config.jwt.secret,
    exp: `${ACCESS_TOKEN_EXP}s`,
    schema: jwtSchema,
  }),
);
