import { beforeEach, describe, expect, it } from 'bun:test';
import { mockCollections, resetAllMocks, setupMockDb } from '../helpers/mock-db';

setupMockDb();

import {
  logProgramsAdded,
  logProgramsRemoved,
  logUserAdded,
  logUserRemoved,
  logUserRoleChanged,
  logWorkspaceCreated,
  logWorkspaceUpdated,
} from '~/services/workspace-events.service';

describe('workspace-events.service', () => {
  beforeEach(() => {
    resetAllMocks();
    mockCollections.workspaceEvents.insertOne.mockResolvedValue({ insertedId: 'event-id' });
  });

  describe('logWorkspaceCreated', () => {
    it('inserts a workspace_created event with workspace name', async () => {
      await logWorkspaceCreated('ws-1', 'Mon espace', 'user-1');

      expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalledTimes(1);
      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.workspaceId).toBe('ws-1');
      expect(event.type).toBe('workspace_created');
      expect(event.actor).toBe('user-1');
      expect(event.details).toEqual({ workspaceName: 'Mon espace' });
    });

    it('includes a timestamp', async () => {
      const before = new Date();
      await logWorkspaceCreated('ws-1', 'Mon espace', 'user-1');
      const after = new Date();

      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('logWorkspaceUpdated', () => {
    it('inserts a workspace_updated event with changes', async () => {
      const changes = [
        { field: 'name', oldValue: 'Ancien nom', newValue: 'Nouveau nom' },
        { field: 'isPublic', oldValue: false, newValue: true },
      ];

      await logWorkspaceUpdated('ws-1', 'user-1', changes);

      expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalledTimes(1);
      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.workspaceId).toBe('ws-1');
      expect(event.type).toBe('workspace_updated');
      expect(event.actor).toBe('user-1');
      expect(event.details.changes).toEqual(changes);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('does not insert when changes array is empty', async () => {
      await logWorkspaceUpdated('ws-1', 'user-1', []);

      expect(mockCollections.workspaceEvents.insertOne).not.toHaveBeenCalled();
    });

    it('inserts when a single change is provided', async () => {
      const changes = [{ field: 'description', oldValue: 'old', newValue: 'new' }];

      await logWorkspaceUpdated('ws-1', 'user-1', changes);

      expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalledTimes(1);
      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.details.changes).toHaveLength(1);
      expect(event.details.changes[0].field).toBe('description');
    });
  });

  describe('logUserAdded', () => {
    it('inserts a user_added event with target user and role', async () => {
      await logUserAdded('ws-1', 'owner-1', 'user-2', 'editor');

      expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalledTimes(1);
      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.workspaceId).toBe('ws-1');
      expect(event.type).toBe('user_added');
      expect(event.actor).toBe('owner-1');
      expect(event.details.targetUserId).toBe('user-2');
      expect(event.details.userRole).toBe('editor');
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('logs viewer role correctly', async () => {
      await logUserAdded('ws-1', 'owner-1', 'user-3', 'viewer');

      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.details.userRole).toBe('viewer');
    });
  });

  describe('logUserRemoved', () => {
    it('inserts a user_removed event with target user', async () => {
      await logUserRemoved('ws-1', 'owner-1', 'user-2');

      expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalledTimes(1);
      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.workspaceId).toBe('ws-1');
      expect(event.type).toBe('user_removed');
      expect(event.actor).toBe('owner-1');
      expect(event.details.targetUserId).toBe('user-2');
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('logUserRoleChanged', () => {
    it('inserts a user_role_changed event with old and new roles', async () => {
      await logUserRoleChanged('ws-1', 'owner-1', 'user-2', 'viewer', 'editor');

      expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalledTimes(1);
      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.workspaceId).toBe('ws-1');
      expect(event.type).toBe('user_role_changed');
      expect(event.actor).toBe('owner-1');
      expect(event.details.targetUserId).toBe('user-2');
      expect(event.details.userRole).toBe('editor');
      expect(event.details.changes).toEqual([
        { field: 'role', oldValue: 'viewer', newValue: 'editor' },
      ]);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('records downgrade from editor to viewer', async () => {
      await logUserRoleChanged('ws-1', 'owner-1', 'user-2', 'editor', 'viewer');

      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.details.userRole).toBe('viewer');
      expect(event.details.changes[0].oldValue).toBe('editor');
      expect(event.details.changes[0].newValue).toBe('viewer');
    });
  });

  describe('logProgramsAdded', () => {
    it('inserts a program_added event with program ids', async () => {
      const programIds = ['prog-1', 'prog-2', 'prog-3'];

      await logProgramsAdded('ws-1', 'user-1', programIds);

      expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalledTimes(1);
      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.workspaceId).toBe('ws-1');
      expect(event.type).toBe('program_added');
      expect(event.actor).toBe('user-1');
      expect(event.details.programIds).toEqual(programIds);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('does not insert when program ids array is empty', async () => {
      await logProgramsAdded('ws-1', 'user-1', []);

      expect(mockCollections.workspaceEvents.insertOne).not.toHaveBeenCalled();
    });

    it('handles a single program id', async () => {
      await logProgramsAdded('ws-1', 'user-1', ['prog-1']);

      expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalledTimes(1);
      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.details.programIds).toEqual(['prog-1']);
    });
  });

  describe('logProgramsRemoved', () => {
    it('inserts a program_removed event with program ids', async () => {
      const programIds = ['prog-1', 'prog-2'];

      await logProgramsRemoved('ws-1', 'user-1', programIds);

      expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalledTimes(1);
      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.workspaceId).toBe('ws-1');
      expect(event.type).toBe('program_removed');
      expect(event.actor).toBe('user-1');
      expect(event.details.programIds).toEqual(programIds);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('does not insert when program ids array is empty', async () => {
      await logProgramsRemoved('ws-1', 'user-1', []);

      expect(mockCollections.workspaceEvents.insertOne).not.toHaveBeenCalled();
    });

    it('handles a single program id', async () => {
      await logProgramsRemoved('ws-1', 'user-1', ['prog-1']);

      expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalledTimes(1);
      const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
      expect(event.details.programIds).toEqual(['prog-1']);
    });
  });

  describe('event shape consistency', () => {
    it('all event types include workspaceId, type, actor, timestamp, and details', async () => {
      const calls: Array<() => Promise<void>> = [
        () => logWorkspaceCreated('ws-1', 'Name', 'actor-1'),
        () => logWorkspaceUpdated('ws-1', 'actor-1', [{ field: 'name' }]),
        () => logUserAdded('ws-1', 'actor-1', 'target-1', 'viewer'),
        () => logUserRemoved('ws-1', 'actor-1', 'target-1'),
        () => logUserRoleChanged('ws-1', 'actor-1', 'target-1', 'viewer', 'editor'),
        () => logProgramsAdded('ws-1', 'actor-1', ['prog-1']),
        () => logProgramsRemoved('ws-1', 'actor-1', ['prog-1']),
      ];

      for (const call of calls) {
        mockCollections.workspaceEvents.insertOne.mockReset();
        mockCollections.workspaceEvents.insertOne.mockResolvedValue({ insertedId: 'event-id' });
        await call();

        expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalledTimes(1);
        const event = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0];
        expect(event).toHaveProperty('workspaceId');
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('actor');
        expect(event).toHaveProperty('timestamp');
        expect(event).toHaveProperty('details');
        expect(typeof event.workspaceId).toBe('string');
        expect(typeof event.type).toBe('string');
        expect(typeof event.actor).toBe('string');
        expect(event.timestamp).toBeInstanceOf(Date);
        expect(typeof event.details).toBe('object');
      }
    });
  });
});
