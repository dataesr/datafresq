import { beforeEach, describe, expect, it } from 'bun:test';
import {
  cursorOf,
  mockCollections,
  resetAllMocks,
  setupMockDb,
  setupMockElastic,
  setupMockElasticClient,
  setupMockEmail,
  setupMockEmailTemplates,
  setupMockId,
  setupMockPassword,
  setupMockToken,
} from '../helpers/mock-db';

setupMockEmailTemplates();
setupMockElasticClient();
setupMockDb();
setupMockElastic();
setupMockPassword();
setupMockToken();
setupMockId();
setupMockEmail();

import { treaty } from '@elysiajs/eden';
import { app } from '~/index';
import { authCookieFor } from '../helpers/auth';

const client = treaty(app).api;

// ============================================================================
// Test data
// ============================================================================

const OWNER_USER = {
  id: 'owner-001',
  email: 'owner@example.com',
  role: 'user' as const,
};

const OWNER_USER_FULL = {
  ...OWNER_USER,
  passwordHash: 'hashed_password',
  firstName: 'Owner',
  lastName: 'User',
  isActive: true,
  lastLogin: null,
  lastPasswordChange: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const OTHER_USER = {
  id: 'other-002',
  email: 'other@example.com',
  role: 'user' as const,
};

const NOW = new Date();

function makeWorkspaceDoc(overrides?: Record<string, unknown>) {
  return {
    id: 'generated-ws-id',
    name: 'Test Workspace',
    description: 'A workspace for testing',
    color: 'yellow-tournesol',
    isPublic: false,
    owner: 'owner-001',
    programs: [],
    users: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeReadWorkspace(overrides?: Record<string, unknown>) {
  return {
    ...makeWorkspaceDoc(overrides),
    ownerInfo: {
      email: OWNER_USER.email,
      firstName: OWNER_USER_FULL.firstName,
      lastName: OWNER_USER_FULL.lastName,
    },
  };
}

function fetchOpts(cookie: string) {
  return { fetch: { headers: { cookie } } } as const;
}

// ============================================================================
// Tests
// ============================================================================

describe('Workspace Flow Integration', () => {
  beforeEach(() => {
    resetAllMocks();

    mockCollections.workspaceEvents.insertOne.mockResolvedValue({ insertedId: 'event-id' });
    mockCollections.workspaceEvents.deleteMany.mockResolvedValue({ deletedCount: 0 });
    mockCollections.workspaceEvents.countDocuments.mockResolvedValue(0);

    mockCollections.workspaceCache.findOne.mockResolvedValue(null);
    mockCollections.workspaceCache.updateOne.mockResolvedValue({ acknowledged: true });
    mockCollections.workspaceCache.deleteOne.mockResolvedValue({ deletedCount: 1 });

    mockCollections.sise.aggregate.mockReturnValue(cursorOf());
    mockCollections.insersup.aggregate.mockReturnValue(cursorOf());
    mockCollections.programs.aggregate.mockReturnValue(cursorOf());
  });

  // ==========================================================================
  // Workspace creation
  // ==========================================================================

  describe('POST /workspaces', () => {
    it('creates a workspace and returns it with owner info', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.insertOne.mockResolvedValue({ insertedId: 'ws-mongo-id' });
      mockCollections.workspaces.aggregate.mockReturnValue(cursorOf([makeReadWorkspace()]));

      const { data, status } = await client.workspaces.post(
        {
          name: 'Test Workspace',
          description: 'A workspace for testing',
          color: 'yellow-tournesol',
          isPublic: false,
        },
        fetchOpts(cookie),
      );

      expect(status).toBe(200);
      expect(data!.name).toBe('Test Workspace');
      expect(data!.description).toBe('A workspace for testing');
      expect(data!.owner).toBe('owner-001');

      expect(mockCollections.workspaces.insertOne).toHaveBeenCalledTimes(1);
      const insertArg = mockCollections.workspaces.insertOne.mock.calls[0]![0] as Record<
        string,
        unknown
      >;
      expect(insertArg.name).toBe('Test Workspace');
      expect(insertArg.owner).toBe('owner-001');
      expect(insertArg.programs).toEqual([]);

      expect(mockCollections.workspaceEvents.insertOne).toHaveBeenCalled();
      const eventArg = mockCollections.workspaceEvents.insertOne.mock.calls[0]![0] as Record<
        string,
        unknown
      >;
      expect(eventArg.type).toBe('workspace_created');
      expect(eventArg.actor).toBe('owner-001');
    });

    it('returns 401 without authentication', async () => {
      const { status } = await client.workspaces.post({
        name: 'Unauthenticated',
      });

      expect(status).toBe(401);
    });

    it('returns 422 for missing name', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      const { status } = await client.workspaces.post(
        { description: 'No name' } as any,
        fetchOpts(cookie),
      );

      expect(status).toBe(422);
    });
  });

  // ==========================================================================
  // Get workspace
  // ==========================================================================

  describe('GET /workspaces/:id', () => {
    it('returns workspace details for the owner', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc());
      mockCollections.workspaces.aggregate.mockReturnValue(cursorOf([makeReadWorkspace()]));

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .get(fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data!.id).toBe('generated-ws-id');
      expect(data!.name).toBe('Test Workspace');
    });

    it('returns 403 for non-member on private workspace', async () => {
      const cookie = await authCookieFor(OTHER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc({ isPublic: false }));

      const { status } = await client.workspaces({ id: 'generated-ws-id' }).get(fetchOpts(cookie));

      expect(status).toBe(403);
    });

    it('returns 200 for non-member on public workspace', async () => {
      const cookie = await authCookieFor(OTHER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc({ isPublic: true }));
      mockCollections.workspaces.aggregate.mockReturnValue(
        cursorOf([makeReadWorkspace({ isPublic: true })]),
      );

      const { status } = await client.workspaces({ id: 'generated-ws-id' }).get(fetchOpts(cookie));

      expect(status).toBe(200);
    });

    it('returns 404 for non-existent workspace', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(null);

      const { status } = await client.workspaces({ id: 'nonexistent' }).get(fetchOpts(cookie));

      expect(status).toBe(404);
    });
  });

  // ==========================================================================
  // Update workspace
  // ==========================================================================

  describe('PATCH /workspaces/:id', () => {
    it('updates workspace name and logs the change', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc());
      mockCollections.workspaces.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });
      mockCollections.workspaces.aggregate.mockReturnValue(
        cursorOf([makeReadWorkspace({ name: 'Updated Name' })]),
      );

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .patch({ name: 'Updated Name' }, fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data!.name).toBe('Updated Name');

      const updateEvents = mockCollections.workspaceEvents.insertOne.mock.calls.filter(
        (call: unknown[]) => (call[0] as { type: string }).type === 'workspace_updated',
      );
      expect(updateEvents.length).toBe(1);
      const eventDetails = (updateEvents[0]![0] as { details: { changes: { field: string }[] } })
        .details;
      expect(eventDetails.changes[0]!.field).toBe('name');
    });

    it('returns 403 for non-owner', async () => {
      const cookie = await authCookieFor(OTHER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc());

      const { status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .patch({ name: 'Hacked Name' }, fetchOpts(cookie));

      expect(status).toBe(403);
    });
  });

  // ==========================================================================
  // Add programs (POST /workspaces/:id/programs)
  // ==========================================================================

  describe('POST /workspaces/:id/programs', () => {
    it('adds programs to workspace and refreshes cache', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      const workspace = makeWorkspaceDoc({ programs: ['INF-001'] });
      mockCollections.workspaces.findOne.mockResolvedValue(workspace);
      mockCollections.workspaces.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });

      mockCollections.workspaces.findOne.mockResolvedValue({
        ...workspace,
        programs: ['INF-001', 'INF-002', 'INF-003'],
      });

      mockCollections.workspaces.aggregate.mockReturnValue(
        cursorOf([makeReadWorkspace({ programs: ['INF-001', 'INF-002', 'INF-003'] })]),
      );

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .programs.post({ programs: ['INF-002', 'INF-003'] }, fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data!.programs).toContain('INF-002');
      expect(data!.programs).toContain('INF-003');

      expect(mockCollections.workspaces.updateOne).toHaveBeenCalled();

      const addEvents = mockCollections.workspaceEvents.insertOne.mock.calls.filter(
        (call: unknown[]) => (call[0] as { type: string }).type === 'program_added',
      );
      expect(addEvents.length).toBe(1);
      const eventDetails = (addEvents[0]![0] as { details: { programIds: string[] } }).details;
      expect(eventDetails.programIds).toEqual(['INF-002', 'INF-003']);

      expect(mockCollections.workspaceCache.deleteOne).toHaveBeenCalled();
    });

    it('returns 403 for viewer (cannot edit)', async () => {
      const cookie = await authCookieFor(OTHER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({
          users: [{ userId: 'other-002', role: 'viewer', addedAt: NOW, addedBy: 'owner-001' }],
        }),
      );

      const { status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .programs.post({ programs: ['INF-002'] }, fetchOpts(cookie));

      expect(status).toBe(403);
    });

    it('allows editor to add programs', async () => {
      const cookie = await authCookieFor(OTHER_USER);

      const workspace = makeWorkspaceDoc({
        programs: [],
        users: [{ userId: 'other-002', role: 'editor', addedAt: NOW, addedBy: 'owner-001' }],
      });
      mockCollections.workspaces.findOne.mockResolvedValue(workspace);
      mockCollections.workspaces.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });

      mockCollections.workspaces.aggregate.mockReturnValue(
        cursorOf([makeReadWorkspace({ programs: ['INF-010'] })]),
      );

      const { status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .programs.post({ programs: ['INF-010'] }, fetchOpts(cookie));

      expect(status).toBe(200);
    });

    it('returns 400 when no programs or searchParams provided', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc());

      const { status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .programs.post({} as any, fetchOpts(cookie));

      expect(status).toBe(400);
    });
  });

  // ==========================================================================
  // Remove programs (POST /workspaces/:id/programs/remove)
  // ==========================================================================

  describe('POST /workspaces/:id/programs/remove', () => {
    it('removes programs and refreshes cache', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      const workspace = makeWorkspaceDoc({ programs: ['INF-001', 'INF-002', 'INF-003'] });
      mockCollections.workspaces.findOne.mockResolvedValue(workspace);
      mockCollections.workspaces.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });

      mockCollections.workspaces.aggregate.mockReturnValue(
        cursorOf([makeReadWorkspace({ programs: ['INF-001'] })]),
      );

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .programs.remove.post({ programs: ['INF-002', 'INF-003'] }, fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data!.programs).toEqual(['INF-001']);

      const removeEvents = mockCollections.workspaceEvents.insertOne.mock.calls.filter(
        (call: unknown[]) => (call[0] as { type: string }).type === 'program_removed',
      );
      expect(removeEvents.length).toBe(1);

      expect(mockCollections.workspaceCache.deleteOne).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Aggregations
  // ==========================================================================

  describe('GET /workspaces/:id/aggregations', () => {
    it('returns empty aggregations for workspace with no programs', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc({ programs: [] }));
      mockCollections.workspaceCache.findOne.mockResolvedValue(null);

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .aggregations.get(fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data!.programCount).toBe(0);
    });

    it('returns cached aggregations when cache is fresh', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({ programs: ['INF-001', 'INF-002'] }),
      );

      const cachedData = {
        workspaceId: 'generated-ws-id',
        updatedAt: new Date(),
        programCount: 2,
        studentsAggregations: { byYear: [] },
        programAggregations: {
          byCycle: [{ cycle: 'M', count: 2 }],
          byAcademy: [],
          byRegion: [],
          byDiploma: [],
          byInstitution: [],
          byDiscipline: [],
          byRome: [],
        },
        insersupAggregations: { totalPrograms: 2, byYear: [] },
      };
      mockCollections.workspaceCache.findOne.mockResolvedValue(cachedData);

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .aggregations.get(fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data!.programCount).toBe(2);
      expect(data!.programAggregations!.byCycle).toEqual([{ cycle: 'M', count: 2 }]);
      expect(data!.studentsAggregations).toEqual({ byYear: [] });
      expect(data!.insersupAggregations!.totalPrograms).toBe(2);
    });

    it('returns 403 for non-member on private workspace', async () => {
      const cookie = await authCookieFor(OTHER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc({ isPublic: false }));

      const { status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .aggregations.get(fetchOpts(cookie));

      expect(status).toBe(403);
    });
  });

  // ==========================================================================
  // Workspace programs listing
  // ==========================================================================

  describe('GET /workspaces/:id/programs', () => {
    it('returns program list for accessible workspace', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({ programs: ['INF-001', 'INF-002'] }),
      );

      const programData = [
        {
          inf: 'INF-001',
          label: 'Master Informatique',
          cycle: 'M',
          accreditation: { startDate: '2020-01-01' },
          diploma: { code: 'M', type: 'Master', category: 'Master' },
          etablissements: [],
          hasSiseInfos: true,
          hasRncpInfos: false,
          hasRomeInfos: false,
        },
        {
          inf: 'INF-002',
          label: 'Licence Mathématiques',
          cycle: 'L',
          accreditation: { startDate: '2020-01-01' },
          diploma: { code: 'L', type: 'Licence', category: 'Licence' },
          etablissements: [],
          hasSiseInfos: false,
          hasRncpInfos: true,
          hasRomeInfos: false,
        },
      ];
      mockCollections.programs.aggregate.mockReturnValue(cursorOf(programData));

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .programs.get(fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data![0]!.inf).toBe('INF-001');
      expect(data![1]!.inf).toBe('INF-002');
    });

    it('returns empty array for workspace with no programs', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc({ programs: [] }));

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .programs.get(fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  // ==========================================================================
  // Member management
  // ==========================================================================

  describe('POST /workspaces/:id/users', () => {
    it('adds users to workspace', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc());
      mockCollections.workspaces.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });

      mockCollections.workspaces.aggregate.mockReturnValue(
        cursorOf([
          makeReadWorkspace({
            users: [
              {
                userId: 'other-002',
                role: 'editor',
                addedAt: NOW,
                addedBy: 'owner-001',
                userInfo: {
                  email: OTHER_USER.email,
                  firstName: 'Other',
                  lastName: 'User',
                },
              },
            ],
          }),
        ]),
      );

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .users.post({ users: [{ userId: 'other-002', role: 'editor' }] }, fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data!.users).toHaveLength(1);
      expect(data!.users[0]!.userId).toBe('other-002');
      expect(data!.users[0]!.role).toBe('editor');

      const addEvents = mockCollections.workspaceEvents.insertOne.mock.calls.filter(
        (call: unknown[]) => (call[0] as { type: string }).type === 'user_added',
      );
      expect(addEvents.length).toBe(1);
    });

    it('returns 403 for non-owner', async () => {
      const cookie = await authCookieFor(OTHER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({
          users: [{ userId: 'other-002', role: 'editor', addedAt: NOW, addedBy: 'owner-001' }],
        }),
      );

      const { status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .users.post({ users: [{ userId: 'new-user', role: 'viewer' }] }, fetchOpts(cookie));

      expect(status).toBe(403);
    });
  });

  describe('POST /workspaces/:id/users/remove', () => {
    it('removes users from workspace', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({
          users: [{ userId: 'other-002', role: 'editor', addedAt: NOW, addedBy: 'owner-001' }],
        }),
      );
      mockCollections.workspaces.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });

      mockCollections.workspaces.aggregate.mockReturnValue(
        cursorOf([makeReadWorkspace({ users: [] })]),
      );

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .users.remove.post({ userIds: ['other-002'] }, fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data!.users).toEqual([]);

      const removeEvents = mockCollections.workspaceEvents.insertOne.mock.calls.filter(
        (call: unknown[]) => (call[0] as { type: string }).type === 'user_removed',
      );
      expect(removeEvents.length).toBe(1);
    });
  });

  // ==========================================================================
  // User role update
  // ==========================================================================

  describe('PATCH /workspaces/:id/users', () => {
    it('changes a member role', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({
          users: [{ userId: 'other-002', role: 'viewer', addedAt: NOW, addedBy: 'owner-001' }],
        }),
      );
      mockCollections.workspaces.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });

      mockCollections.workspaces.aggregate.mockReturnValue(
        cursorOf([
          makeReadWorkspace({
            users: [
              {
                userId: 'other-002',
                role: 'editor',
                addedAt: NOW,
                addedBy: 'owner-001',
                userInfo: { email: OTHER_USER.email, firstName: 'Other', lastName: 'User' },
              },
            ],
          }),
        ]),
      );

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .users.patch({ userId: 'other-002', role: 'editor' }, fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data!.users[0]!.role).toBe('editor');

      const roleEvents = mockCollections.workspaceEvents.insertOne.mock.calls.filter(
        (call: unknown[]) => (call[0] as { type: string }).type === 'user_role_changed',
      );
      expect(roleEvents.length).toBe(1);
    });
  });

  // ==========================================================================
  // Leave workspace
  // ==========================================================================

  describe('POST /workspaces/:id/leave', () => {
    it('allows a member to leave', async () => {
      const cookie = await authCookieFor(OTHER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({
          users: [{ userId: 'other-002', role: 'editor', addedAt: NOW, addedBy: 'owner-001' }],
        }),
      );
      mockCollections.workspaces.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .leave.post({}, fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data!.success).toBe(true);
    });

    it('prevents owner from leaving their own workspace', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc());

      const { status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .leave.post({}, fetchOpts(cookie));

      expect(status).toBe(400);
    });
  });

  // ==========================================================================
  // Delete workspace
  // ==========================================================================

  describe('DELETE /workspaces/:id', () => {
    it('deletes workspace, events, and cache', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc());
      mockCollections.workspaces.deleteOne.mockResolvedValue({ deletedCount: 1 });
      mockCollections.workspaceEvents.deleteMany.mockResolvedValue({ deletedCount: 5 });
      mockCollections.workspaceCache.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const { data, status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .delete(undefined, fetchOpts(cookie));

      expect(status).toBe(200);
      expect(data!.success).toBe(true);
      expect(data!.message).toBe('Espace de travail supprimé');

      expect(mockCollections.workspaces.deleteOne).toHaveBeenCalledWith({ id: 'generated-ws-id' });

      expect(mockCollections.workspaceEvents.deleteMany).toHaveBeenCalledWith({
        workspaceId: 'generated-ws-id',
      });
      expect(mockCollections.workspaceCache.deleteOne).toHaveBeenCalledWith({
        workspaceId: 'generated-ws-id',
      });
    });

    it('returns 403 for non-owner', async () => {
      const cookie = await authCookieFor(OTHER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(makeWorkspaceDoc());

      const { status } = await client
        .workspaces({ id: 'generated-ws-id' })
        .delete(undefined, fetchOpts(cookie));

      expect(status).toBe(403);
    });

    it('returns 404 for non-existent workspace', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      mockCollections.workspaces.findOne.mockResolvedValue(null);

      const { status } = await client
        .workspaces({ id: 'nonexistent' })
        .delete(undefined, fetchOpts(cookie));

      expect(status).toBe(404);
    });
  });

  // ==========================================================================
  // Full lifecycle
  // ==========================================================================

  describe('Full workspace lifecycle', () => {
    it('create → add programs → get aggregations → remove programs → delete', async () => {
      const cookie = await authCookieFor(OWNER_USER);

      // --- Step 1: Create workspace ---
      mockCollections.workspaces.insertOne.mockResolvedValue({ insertedId: 'ws-id' });
      mockCollections.workspaces.aggregate.mockReturnValue(
        cursorOf([makeReadWorkspace({ name: 'Lifecycle Test', programs: [] })]),
      );

      const { data: created, status: createStatus } = await client.workspaces.post(
        { name: 'Lifecycle Test', isPublic: false },
        fetchOpts(cookie),
      );

      expect(createStatus).toBe(200);
      expect(created!.name).toBe('Lifecycle Test');
      expect(created!.programs).toEqual([]);

      // --- Step 2: Add programs ---
      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({ name: 'Lifecycle Test', programs: [] }),
      );
      mockCollections.workspaces.updateOne.mockResolvedValue({ acknowledged: true });

      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({
          name: 'Lifecycle Test',
          programs: ['INF-100', 'INF-200'],
        }),
      );

      mockCollections.workspaces.aggregate.mockReturnValue(
        cursorOf([
          makeReadWorkspace({
            name: 'Lifecycle Test',
            programs: ['INF-100', 'INF-200'],
          }),
        ]),
      );

      const { data: withPrograms, status: addStatus } = await client
        .workspaces({ id: 'generated-ws-id' })
        .programs.post({ programs: ['INF-100', 'INF-200'] }, fetchOpts(cookie));

      expect(addStatus).toBe(200);
      expect(withPrograms!.programs).toEqual(['INF-100', 'INF-200']);

      // --- Step 3: Get aggregations ---
      const cachedAggs = {
        workspaceId: 'generated-ws-id',
        updatedAt: new Date(),
        programCount: 2,
        studentsAggregations: { byYear: [] },
        programAggregations: {
          byCycle: [
            { cycle: 'M', count: 1 },
            { cycle: 'L', count: 1 },
          ],
          byAcademy: [],
          byRegion: [],
          byDiploma: [],
          byInstitution: [],
          byDiscipline: [],
          byRome: [],
        },
        insersupAggregations: { totalPrograms: 2, byYear: [] },
      };
      mockCollections.workspaceCache.findOne.mockResolvedValue(cachedAggs);

      const { data: aggs, status: aggStatus } = await client
        .workspaces({ id: 'generated-ws-id' })
        .aggregations.get(fetchOpts(cookie));

      expect(aggStatus).toBe(200);
      expect(aggs!.programCount).toBe(2);
      expect(aggs!.programAggregations!.byCycle).toHaveLength(2);

      // --- Step 4: Remove programs ---
      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({
          name: 'Lifecycle Test',
          programs: ['INF-100', 'INF-200'],
        }),
      );
      mockCollections.workspaces.updateOne.mockResolvedValue({ acknowledged: true });

      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({
          name: 'Lifecycle Test',
          programs: ['INF-100'],
        }),
      );

      mockCollections.workspaces.aggregate.mockReturnValue(
        cursorOf([
          makeReadWorkspace({
            name: 'Lifecycle Test',
            programs: ['INF-100'],
          }),
        ]),
      );

      const { data: afterRemove, status: removeStatus } = await client
        .workspaces({ id: 'generated-ws-id' })
        .programs.remove.post({ programs: ['INF-200'] }, fetchOpts(cookie));

      expect(removeStatus).toBe(200);
      expect(afterRemove!.programs).toEqual(['INF-100']);

      // --- Step 5: Delete workspace ---
      mockCollections.workspaces.findOne.mockResolvedValue(
        makeWorkspaceDoc({ name: 'Lifecycle Test', programs: ['INF-100'] }),
      );
      mockCollections.workspaces.deleteOne.mockResolvedValue({ deletedCount: 1 });
      mockCollections.workspaceEvents.deleteMany.mockResolvedValue({ deletedCount: 10 });
      mockCollections.workspaceCache.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const { data: deleted, status: deleteStatus } = await client
        .workspaces({ id: 'generated-ws-id' })
        .delete(undefined, fetchOpts(cookie));

      expect(deleteStatus).toBe(200);
      expect(deleted!.success).toBe(true);

      expect(mockCollections.workspaces.deleteOne).toHaveBeenCalled();
      expect(mockCollections.workspaceEvents.deleteMany).toHaveBeenCalled();
    });
  });
});
