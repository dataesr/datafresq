import type { WorkspaceDoc } from '~/database/types';
import { ForbiddenError } from '~/errors';

export function canEdit(workspace: WorkspaceDoc, userId: string): boolean {
  if (workspace.owner === userId) return true;
  return workspace.users.some((u) => u.userId === userId && u.role === 'editor');
}

export function canView(workspace: WorkspaceDoc, userId: string): boolean {
  if (workspace.isPublic) return true;
  if (workspace.owner === userId) return true;
  return workspace.users.some((u) => u.userId === userId);
}

export function assertOwner(workspace: WorkspaceDoc, userId: string): void {
  if (workspace.owner !== userId) {
    throw new ForbiddenError("Vous n'êtes pas le propriétaire de cet espace");
  }
}
