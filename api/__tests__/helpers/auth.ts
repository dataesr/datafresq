import { SignJWT } from 'jose';
import { config } from '~/config';

type TestUser = {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'root';
};

const cookieName = config.cookies.access.name;
const secret = new TextEncoder().encode(config.jwt.secret!);

export async function authCookieFor(user: TestUser): Promise<string> {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);

  return `${cookieName}=${token}`;
}
