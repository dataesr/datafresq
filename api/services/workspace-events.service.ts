import { collections } from '~/database/mongo';
import type { WorkspaceEventDoc, WorkspaceUserRole } from '~/database/types';

async function logWorkspaceEvent(event: Omit<WorkspaceEventDoc, 'timestamp'>): Promise<void> {
  await collections.workspaceEvents.insertOne({
    ...event,
    timestamp: new Date(),
  });
}

export async function logWorkspaceCreated(
  workspaceId: string,
  workspaceName: string,
  actor: string,
): Promise<void> {
  await logWorkspaceEvent({
    workspaceId,
    type: 'workspace_created',
    actor,
    details: { workspaceName },
  });
}

export async function logWorkspaceUpdated(
  workspaceId: string,
  actor: string,
  changes: { field: string; oldValue?: unknown; newValue?: unknown }[],
): Promise<void> {
  if (changes.length === 0) return;

  await logWorkspaceEvent({
    workspaceId,
    type: 'workspace_updated',
    actor,
    details: { changes },
  });
}

export async function logUserAdded(
  workspaceId: string,
  actor: string,
  targetUserId: string,
  userRole: WorkspaceUserRole,
): Promise<void> {
  await logWorkspaceEvent({
    workspaceId,
    type: 'user_added',
    actor,
    details: { targetUserId, userRole },
  });
}

export async function logUserRemoved(
  workspaceId: string,
  actor: string,
  targetUserId: string,
): Promise<void> {
  await logWorkspaceEvent({
    workspaceId,
    type: 'user_removed',
    actor,
    details: { targetUserId },
  });
}

export async function logUserRoleChanged(
  workspaceId: string,
  actor: string,
  targetUserId: string,
  oldRole: WorkspaceUserRole,
  newRole: WorkspaceUserRole,
): Promise<void> {
  await logWorkspaceEvent({
    workspaceId,
    type: 'user_role_changed',
    actor,
    details: {
      targetUserId,
      userRole: newRole,
      changes: [{ field: 'role', oldValue: oldRole, newValue: newRole }],
    },
  });
}

export async function logProgramsAdded(
  workspaceId: string,
  actor: string,
  programIds: string[],
): Promise<void> {
  if (programIds.length === 0) return;

  await logWorkspaceEvent({
    workspaceId,
    type: 'program_added',
    actor,
    details: { programIds },
  });
}

export async function logProgramsRemoved(
  workspaceId: string,
  actor: string,
  programIds: string[],
): Promise<void> {
  if (programIds.length === 0) return;

  await logWorkspaceEvent({
    workspaceId,
    type: 'program_removed',
    actor,
    details: { programIds },
  });
}
