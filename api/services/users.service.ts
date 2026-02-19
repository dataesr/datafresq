import { collections } from '~/database/mongo';
import { NotFoundError } from '~/errors';
import { USER_ME_PROJECTION, USER_SEARCH_PROJECTION } from '~/schemas/users';
import { escapeRegex } from '~/utils/strings';

export async function searchUsers(query: string, limit = 10) {
  const safeQuery = escapeRegex(query);
  return collections.users
    .find(
      {
        isActive: true,
        $or: [
          { email: { $regex: safeQuery, $options: 'i' } },
          { firstName: { $regex: safeQuery, $options: 'i' } },
          { lastName: { $regex: safeQuery, $options: 'i' } },
        ],
      },
      { projection: USER_SEARCH_PROJECTION, limit: Math.min(limit, 50) },
    )
    .toArray();
}

export async function getUserById(id: string) {
  return collections.users.findOne({ id, isActive: true }, { projection: USER_SEARCH_PROJECTION });
}

export async function getUserByEmail(email: string) {
  return collections.users.findOne(
    { email: email.toLowerCase() },
    { projection: USER_ME_PROJECTION },
  );
}

export async function getMe(email: string) {
  const user = await collections.users.findOne({ email }, { projection: USER_ME_PROJECTION });
  if (!user) throw new NotFoundError('Utilisateur introuvable');
  return user;
}

export async function updateMe(email: string, body: { firstName?: string; lastName?: string }) {
  const user = await collections.users.findOne({ email });
  if (!user) throw new NotFoundError('Utilisateur introuvable');

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.firstName !== undefined) updateData.firstName = body.firstName;
  if (body.lastName !== undefined) updateData.lastName = body.lastName;

  await collections.users.updateOne({ id: user.id }, { $set: updateData });

  const updatedUser = await collections.users.findOne(
    { id: user.id },
    { projection: USER_ME_PROJECTION },
  );
  if (!updatedUser) throw new NotFoundError('Utilisateur introuvable');
  return updatedUser;
}

export async function getUserIdByEmail(email: string) {
  const user = await collections.users.findOne({ email });
  if (!user) throw new NotFoundError('Utilisateur introuvable');
  return user.id;
}
