import { describe, expect, it } from 'bun:test';
import type { WorkspaceDoc } from '~/database/types';
import { ForbiddenError } from '~/errors';
import { assertOwner, canEdit, canView } from '~/services/workspace-permissions.service';

const NOW = new Date();

function makeWorkspace(overrides: Partial<WorkspaceDoc> = {}): WorkspaceDoc {
  return {
    id: 'ws-1',
    name: 'Test Workspace',
    description: 'A test workspace',
    color: '#000091',
    isPublic: false,
    owner: 'owner-1',
    programs: [],
    users: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

describe('workspace-permissions.service', () => {
  describe('canEdit', () => {
    it('returns true for the workspace owner', () => {
      const workspace = makeWorkspace();
      expect(canEdit(workspace, 'owner-1')).toBe(true);
    });

    it('returns true for a user with editor role', () => {
      const workspace = makeWorkspace({
        users: [{ userId: 'editor-1', role: 'editor', addedAt: NOW, addedBy: 'owner-1' }],
      });
      expect(canEdit(workspace, 'editor-1')).toBe(true);
    });

    it('returns false for a user with viewer role', () => {
      const workspace = makeWorkspace({
        users: [{ userId: 'viewer-1', role: 'viewer', addedAt: NOW, addedBy: 'owner-1' }],
      });
      expect(canEdit(workspace, 'viewer-1')).toBe(false);
    });

    it('returns false for a user not in the workspace', () => {
      const workspace = makeWorkspace();
      expect(canEdit(workspace, 'stranger-1')).toBe(false);
    });

    it('returns false for a viewer even when multiple users exist', () => {
      const workspace = makeWorkspace({
        users: [
          { userId: 'editor-1', role: 'editor', addedAt: NOW, addedBy: 'owner-1' },
          { userId: 'viewer-1', role: 'viewer', addedAt: NOW, addedBy: 'owner-1' },
          { userId: 'editor-2', role: 'editor', addedAt: NOW, addedBy: 'owner-1' },
        ],
      });
      expect(canEdit(workspace, 'viewer-1')).toBe(false);
    });

    it('returns true for the owner even if also listed as viewer in users array', () => {
      const workspace = makeWorkspace({
        users: [{ userId: 'owner-1', role: 'viewer', addedAt: NOW, addedBy: 'owner-1' }],
      });
      expect(canEdit(workspace, 'owner-1')).toBe(true);
    });
  });

  describe('canView', () => {
    it('returns true for the workspace owner', () => {
      const workspace = makeWorkspace();
      expect(canView(workspace, 'owner-1')).toBe(true);
    });

    it('returns true for a user with viewer role on private workspace', () => {
      const workspace = makeWorkspace({
        users: [{ userId: 'viewer-1', role: 'viewer', addedAt: NOW, addedBy: 'owner-1' }],
      });
      expect(canView(workspace, 'viewer-1')).toBe(true);
    });

    it('returns true for a user with editor role on private workspace', () => {
      const workspace = makeWorkspace({
        users: [{ userId: 'editor-1', role: 'editor', addedAt: NOW, addedBy: 'owner-1' }],
      });
      expect(canView(workspace, 'editor-1')).toBe(true);
    });

    it('returns false for a stranger on private workspace', () => {
      const workspace = makeWorkspace();
      expect(canView(workspace, 'stranger-1')).toBe(false);
    });

    it('returns true for anyone on a public workspace', () => {
      const workspace = makeWorkspace({ isPublic: true });
      expect(canView(workspace, 'stranger-1')).toBe(true);
    });

    it('returns true for the owner on a public workspace', () => {
      const workspace = makeWorkspace({ isPublic: true });
      expect(canView(workspace, 'owner-1')).toBe(true);
    });

    it('returns true for a member on a public workspace', () => {
      const workspace = makeWorkspace({
        isPublic: true,
        users: [{ userId: 'viewer-1', role: 'viewer', addedAt: NOW, addedBy: 'owner-1' }],
      });
      expect(canView(workspace, 'viewer-1')).toBe(true);
    });
  });

  describe('assertOwner', () => {
    it('does not throw for the workspace owner', () => {
      const workspace = makeWorkspace();
      expect(() => assertOwner(workspace, 'owner-1')).not.toThrow();
    });

    it('throws ForbiddenError for a non-owner', () => {
      const workspace = makeWorkspace();
      expect(() => assertOwner(workspace, 'other-user')).toThrow(ForbiddenError);
    });

    it('throws ForbiddenError for an editor (not owner)', () => {
      const workspace = makeWorkspace({
        users: [{ userId: 'editor-1', role: 'editor', addedAt: NOW, addedBy: 'owner-1' }],
      });
      expect(() => assertOwner(workspace, 'editor-1')).toThrow(ForbiddenError);
    });

    it('throws with a message about not being the owner', () => {
      const workspace = makeWorkspace();
      try {
        assertOwner(workspace, 'other-user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenError);
        expect((err as ForbiddenError).message).toContain('propriétaire');
      }
    });
  });
});
