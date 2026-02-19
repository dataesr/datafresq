import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '@/api/auth';
import { APIError, api } from '@/api/eden-treaty';
import type {
  PreviewAddProgramsResponse,
  ReadWorkspace,
  WorkspaceSearchParams,
} from '~/schemas/workspaces';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const workspaceQueryKeys = {
  all: ['workspaces'] as const,
  user: ['user-workspaces'] as const,
  public: (query?: string) => ['public-workspaces', query] as const,
  detail: (id: string) => ['workspace', id] as const,
  programs: (id: string) => ['workspace', id, 'programs'] as const,
  aggregations: (id: string) => ['workspace', id, 'aggregations'] as const,
  history: (id: string, options?: object) => ['workspace', id, 'history', options] as const,
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

type WorkspaceFilter = 'all' | 'owned' | 'shared';

async function getMyWorkspaces(filter: WorkspaceFilter = 'all') {
  const { data, error } = await api.me.workspaces.get({ query: { filter } });
  if (error) throw new APIError(error);
  return data || [];
}

async function getPublicWorkspaces(query?: string) {
  const { data, error } = await api.workspaces.get({ query: { query: query || '' } });
  if (error) throw new APIError(error);
  return data || [];
}

async function getWorkspace(id: string) {
  const { data, error } = await api.workspaces({ id }).get();
  if (error) throw new APIError(error);
  return data;
}

async function createWorkspace(input: {
  name: string;
  description?: string;
  color?: string;
  isPublic?: boolean;
  users?: { userId: string; role: 'viewer' | 'editor' }[];
  programs?: string[];
  searchParams?: WorkspaceSearchParams;
}) {
  const { data, error } = await api.workspaces.post(input);
  if (error) throw new APIError(error);
  return data;
}

async function updateWorkspace({
  id,
  ...updates
}: {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  isPublic?: boolean;
}) {
  const { data, error } = await api.workspaces({ id }).patch(updates);
  if (error) throw new APIError(error);
  return data;
}

async function deleteWorkspace(id: string) {
  const { error } = await api.workspaces({ id }).delete();
  if (error) throw new APIError(error);
}

async function addUsers({
  workspaceId,
  users,
}: {
  workspaceId: string;
  users: { userId: string; role: 'viewer' | 'editor' }[];
}) {
  const { data, error } = await api.workspaces({ id: workspaceId }).users.post({ users });
  if (error) throw new APIError(error);
  return data;
}

async function removeUsers({ workspaceId, userIds }: { workspaceId: string; userIds: string[] }) {
  const { data, error } = await api.workspaces({ id: workspaceId }).users.remove.post({ userIds });
  if (error) throw new APIError(error);
  return data;
}

async function updateUserRole({
  workspaceId,
  userId,
  role,
}: {
  workspaceId: string;
  userId: string;
  role: 'viewer' | 'editor';
}) {
  const { data, error } = await api.workspaces({ id: workspaceId }).users.patch({ userId, role });
  if (error) throw new APIError(error);
  return data;
}

async function leaveWorkspace(workspaceId: string) {
  const { error } = await api.workspaces({ id: workspaceId }).leave.post();
  if (error) throw new APIError(error);
}

async function addPrograms({
  workspaceId,
  programIds,
  searchParams,
}: {
  workspaceId: string;
  programIds?: string[];
  searchParams?: WorkspaceSearchParams;
}) {
  const { data, error } = await api.workspaces({ id: workspaceId }).programs.post({
    programs: programIds,
    searchParams,
  });
  if (error) throw new APIError(error);
  return data;
}

async function previewAddPrograms({
  workspaceId,
  programIds,
  searchParams,
}: {
  workspaceId: string;
  programIds?: string[];
  searchParams?: WorkspaceSearchParams;
}): Promise<PreviewAddProgramsResponse> {
  const { data, error } = await api.workspaces({ id: workspaceId }).programs.preview.post({
    programIds,
    searchParams,
  });
  if (error) throw new APIError(error);
  return data;
}

async function removePrograms({
  workspaceId,
  programIds,
}: {
  workspaceId: string;
  programIds: string[];
}) {
  const { data, error } = await api.workspaces({ id: workspaceId }).programs.remove.post({
    programs: programIds,
  });
  if (error) throw new APIError(error);
  return data;
}

async function getWorkspacePrograms(workspaceId: string) {
  const { data, error } = await api.workspaces({ id: workspaceId }).programs.get();
  if (error) throw new APIError(error);
  return data;
}

async function getWorkspaceAggregations(workspaceId: string) {
  const { data, error } = await api.workspaces({ id: workspaceId }).aggregations.get();
  if (error) throw new APIError(error);
  return data;
}

async function getWorkspaceHistory(
  workspaceId: string,
  options?: { limit?: number; offset?: number; type?: string },
) {
  const { data, error } = await api.workspaces({ id: workspaceId }).history.get({
    query: {
      limit: options?.limit?.toString(),
      offset: options?.offset?.toString(),
      type: options?.type,
    },
  });
  if (error) throw new APIError(error);
  return data;
}

// =============================================================================
// QUERIES
// =============================================================================

export function useWorkspaces() {
  return useSuspenseQuery({
    queryKey: workspaceQueryKeys.user,
    queryFn: () => getMyWorkspaces('owned'),
  });
}

export function useSharedWorkspaces() {
  return useSuspenseQuery({
    queryKey: [...workspaceQueryKeys.user, 'shared'] as const,
    queryFn: () => getMyWorkspaces('shared'),
  });
}

export function usePublicWorkspaces() {
  return useSuspenseQuery({
    queryKey: workspaceQueryKeys.public(),
    queryFn: () => getPublicWorkspaces(),
  });
}

export function useWorkspace(id: string) {
  return useSuspenseQuery({
    queryKey: workspaceQueryKeys.detail(id),
    queryFn: () => getWorkspace(id),
  });
}

export function useWorkspacePrograms(workspaceId: string) {
  return useSuspenseQuery({
    queryKey: workspaceQueryKeys.programs(workspaceId),
    queryFn: () => getWorkspacePrograms(workspaceId),
  });
}

export function useWorkspaceAggregations(workspaceId: string) {
  return useSuspenseQuery({
    queryKey: workspaceQueryKeys.aggregations(workspaceId),
    queryFn: () => getWorkspaceAggregations(workspaceId),
  });
}

export function useEditableWorkspaces() {
  const { data: workspaces } = useWorkspaces();
  const { data: sharedWorkspaces } = useSharedWorkspaces();
  const { user } = useAuth();

  const data = useMemo(
    () => [
      ...workspaces,
      ...sharedWorkspaces.filter((ws) =>
        ws.users.some((u) => u.userId === user?.id && u.role === 'editor'),
      ),
    ],
    [workspaces, sharedWorkspaces, user?.id],
  );

  return { data };
}

export function useWorkspaceHistory(
  workspaceId: string,
  options?: { limit?: number; offset?: number; type?: string },
) {
  return useSuspenseQuery({
    queryKey: workspaceQueryKeys.history(workspaceId, options),
    queryFn: () => getWorkspaceHistory(workspaceId, options),
  });
}

export function usePreviewAddPrograms(
  workspaceId: string,
  programIds?: string[],
  searchParams?: WorkspaceSearchParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ['workspace', workspaceId, 'preview', programIds, searchParams] as const,
    queryFn: () => previewAddPrograms({ workspaceId, programIds, searchParams }),
    enabled: enabled && !!workspaceId && (!!programIds?.length || !!searchParams),
    staleTime: 1000 * 30,
    gcTime: 5000 * 60 * 10,
  });
}

// =============================================================================
// PERMISSIONS
// =============================================================================

export interface WorkspacePermissions {
  isOwner: boolean;
  isEditor: boolean;
  isViewer: boolean;
  isMember: boolean;
  canEdit: boolean;
  canView: boolean;
}

export function useWorkspacePermissions(workspaceId: string): WorkspacePermissions {
  const { data: workspace } = useWorkspace(workspaceId);
  const { user } = useAuth();

  const userId = user?.id;

  const isOwner = workspace.owner === userId;
  const userMembership = workspace.users.find((u) => u.userId === userId);
  const isEditor = userMembership?.role === 'editor';
  const isViewer = userMembership?.role === 'viewer';
  const isMember = !!userMembership || isOwner;
  const canEdit = isOwner || isEditor;
  const canView = isMember || workspace.isPublic;

  return {
    isOwner,
    isEditor,
    isViewer,
    isMember,
    canEdit,
    canView,
  };
}

// =============================================================================
// MUTATIONS
// =============================================================================

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: (newWorkspace) => {
      queryClient.setQueryData<ReadWorkspace[]>(workspaceQueryKeys.user, (old) => {
        if (!old) return [newWorkspace];
        return [...old, newWorkspace];
      });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.user });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWorkspace,
    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData(workspaceQueryKeys.detail(updatedWorkspace.id), updatedWorkspace);
      queryClient.setQueryData<ReadWorkspace[]>(workspaceQueryKeys.user, (old) => {
        if (!old) return [updatedWorkspace];
        return old.map((ws) => (ws.id === updatedWorkspace.id ? updatedWorkspace : ws));
      });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.user });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.public() });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: workspaceQueryKeys.detail(deletedId) });
      queryClient.setQueryData<ReadWorkspace[]>(workspaceQueryKeys.user, (old) => {
        if (!old) return [];
        return old.filter((ws) => ws.id !== deletedId);
      });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.user });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.public() });
    },
  });
}

export function useAddUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUsers,
    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData(workspaceQueryKeys.detail(updatedWorkspace.id), updatedWorkspace);
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(updatedWorkspace.id) });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.history(updatedWorkspace.id),
      });
    },
  });
}

export function useRemoveUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeUsers,
    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData(workspaceQueryKeys.detail(updatedWorkspace.id), updatedWorkspace);
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(updatedWorkspace.id) });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.history(updatedWorkspace.id),
      });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRole,
    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData(workspaceQueryKeys.detail(updatedWorkspace.id), updatedWorkspace);
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(updatedWorkspace.id) });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.history(updatedWorkspace.id),
      });
    },
  });
}

export function useLeaveWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveWorkspace,
    onSuccess: (_, workspaceId) => {
      queryClient.removeQueries({ queryKey: workspaceQueryKeys.detail(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.user });
    },
  });
}

export function useAddPrograms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPrograms,
    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData(workspaceQueryKeys.detail(updatedWorkspace.id), updatedWorkspace);
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.programs(updatedWorkspace.id),
      });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.aggregations(updatedWorkspace.id),
      });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.history(updatedWorkspace.id),
      });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.user });
      queryClient.invalidateQueries({ queryKey: ['workspace', updatedWorkspace.id] });
    },
  });
}

export function useRemovePrograms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removePrograms,
    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData(workspaceQueryKeys.detail(updatedWorkspace.id), updatedWorkspace);
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.programs(updatedWorkspace.id),
      });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.aggregations(updatedWorkspace.id),
      });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.history(updatedWorkspace.id),
      });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.user });
    },
  });
}
