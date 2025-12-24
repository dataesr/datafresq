import { collections } from '~/database/mongo';
import type { WorkspaceEventDoc, WorkspaceUserRole } from '~/database/types';

/**
 * Log a workspace event for history tracking
 */
export async function logWorkspaceEvent(
  event: Omit<WorkspaceEventDoc, 'timestamp'>,
): Promise<void> {
  await collections.workspaceEvents.insertOne({
    ...event,
    timestamp: new Date(),
  });
}

/**
 * Log workspace creation event
 */
export async function logWorkspaceCreated(
  workspaceId: string,
  workspaceName: string,
  actor: string,
): Promise<void> {
  await logWorkspaceEvent({
    workspaceId,
    type: 'workspace_created',
    actor,
    details: {
      workspaceName,
    },
  });
}

/**
 * Log workspace update event
 */
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
    details: {
      changes,
    },
  });
}

/**
 * Log user added to workspace event
 */
export async function logUserAdded(
  workspaceId: string,
  actor: string,
  targetUser: string,
  userRole: WorkspaceUserRole,
): Promise<void> {
  await logWorkspaceEvent({
    workspaceId,
    type: 'user_added',
    actor,
    details: {
      targetUser,
      userRole,
    },
  });
}

/**
 * Log user removed from workspace event
 */
export async function logUserRemoved(
  workspaceId: string,
  actor: string,
  targetUser: string,
): Promise<void> {
  await logWorkspaceEvent({
    workspaceId,
    type: 'user_removed',
    actor,
    details: {
      targetUser,
    },
  });
}

/**
 * Log user role changed event
 */
export async function logUserRoleChanged(
  workspaceId: string,
  actor: string,
  targetUser: string,
  oldRole: WorkspaceUserRole,
  newRole: WorkspaceUserRole,
): Promise<void> {
  await logWorkspaceEvent({
    workspaceId,
    type: 'user_role_changed',
    actor,
    details: {
      targetUser,
      userRole: newRole,
      changes: [
        {
          field: 'role',
          oldValue: oldRole,
          newValue: newRole,
        },
      ],
    },
  });
}

/**
 * Log programs added to workspace event
 */
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
    details: {
      programIds,
    },
  });
}

/**
 * Log programs removed from workspace event
 */
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
    details: {
      programIds,
    },
  });
}

/**
 * Log ownership transferred event
 */
export async function logOwnershipTransferred(
  workspaceId: string,
  actor: string,
  newOwner: string,
): Promise<void> {
  await logWorkspaceEvent({
    workspaceId,
    type: 'ownership_transferred',
    actor,
    details: {
      targetUser: newOwner,
    },
  });
}
