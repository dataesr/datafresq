import { collections } from '~/database/mongo';
import type { UserRole } from '~/database/types';
import { DatabaseError, NotFoundError } from '~/errors';
import { USER_ADMIN_PROJECTION } from '~/schemas/users';

export async function listAllUsers() {
  return collections.users.find({}, { projection: USER_ADMIN_PROJECTION }).toArray();
}

export async function updateUserRole(userId: string, role: UserRole) {
  const user = await collections.users.findOne({ id: userId });
  if (!user) throw new NotFoundError('Utilisateur introuvable');

  const { acknowledged, modifiedCount } = await collections.users.updateOne(
    { id: user.id },
    { $set: { role, updatedAt: new Date() } },
  );

  if (!acknowledged) throw new DatabaseError('Échec de la mise à jour du rôle utilisateur');
  if (modifiedCount === 0) throw new DatabaseError('Aucune modification effectuée');
}

export async function deactivateUser(userId: string) {
  const user = await collections.users.findOne({ id: userId });
  if (!user) throw new NotFoundError('Utilisateur introuvable');

  const { acknowledged, modifiedCount } = await collections.users.updateOne(
    { id: user.id },
    { $set: { isActive: false, updatedAt: new Date() } },
  );

  if (!acknowledged) throw new DatabaseError("Échec de la désactivation de l'utilisateur");
  if (modifiedCount === 0) throw new DatabaseError('Aucune modification effectuée');

  await collections.sessions.deleteMany({ userId: user.id });
}

export async function revokeUserSessions(userId: string) {
  const user = await collections.users.findOne({ id: userId });
  if (!user) throw new NotFoundError('Utilisateur introuvable');

  const result = await collections.sessions.deleteMany({ userId: user.id });
  return result.deletedCount;
}
