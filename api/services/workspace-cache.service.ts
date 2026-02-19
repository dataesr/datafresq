import { collections } from '~/database/mongo';
import type { WorkspaceAggregationsResponse } from '~/schemas/aggregations';
import {
  aggregateInsersupForWorkspace,
  emptyInsersupAggregations,
} from '~/services/insersup.service';
import { computeProgramAggregations, emptyProgramAggregations } from '~/services/programs.service';
import { aggregateSiseForWorkspace, emptySiseAggregations } from '~/services/sise.service';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MAX_AGE_MS = 3600000; // 1 hour

// ============================================================================
// Cache operations
// ============================================================================

export async function updateWorkspaceCache(
  workspaceId: string,
): Promise<WorkspaceAggregationsResponse | null> {
  const workspace = await collections.workspaces.findOne(
    { id: workspaceId },
    { projection: { programs: 1 } },
  );

  if (!workspace) return null;

  const programIds = workspace.programs || [];

  if (programIds.length === 0) {
    const emptyCache: WorkspaceAggregationsResponse = {
      workspaceId,
      updatedAt: new Date(),
      programCount: 0,
      studentsAggregations: emptySiseAggregations,
      programAggregations: emptyProgramAggregations,
      insersupAggregations: emptyInsersupAggregations,
    };

    await collections.workspaceCache.updateOne(
      { workspaceId },
      { $set: emptyCache },
      { upsert: true },
    );

    return emptyCache;
  }

  const [studentsAggregations, programAggregations, insersupAggregations] = await Promise.all([
    aggregateSiseForWorkspace(programIds),
    computeProgramAggregations(programIds),
    aggregateInsersupForWorkspace(programIds),
  ]);

  const cacheDoc: WorkspaceAggregationsResponse = {
    workspaceId,
    updatedAt: new Date(),
    programCount: programIds.length,
    studentsAggregations,
    programAggregations,
    insersupAggregations,
  };

  await collections.workspaceCache.updateOne({ workspaceId }, { $set: cacheDoc }, { upsert: true });

  return cacheDoc;
}

export async function getWorkspaceCache(
  workspaceId: string,
): Promise<WorkspaceAggregationsResponse | null> {
  return collections.workspaceCache.findOne({ workspaceId });
}

export async function invalidateWorkspaceCache(workspaceId: string): Promise<void> {
  await collections.workspaceCache.deleteOne({ workspaceId });
}

export async function refreshWorkspaceCache(
  workspaceId: string,
): Promise<WorkspaceAggregationsResponse | null> {
  await invalidateWorkspaceCache(workspaceId);
  return updateWorkspaceCache(workspaceId);
}

export async function getOrComputeWorkspaceCache(
  workspaceId: string,
  maxAge: number = DEFAULT_MAX_AGE_MS,
): Promise<WorkspaceAggregationsResponse | null> {
  const cached = await getWorkspaceCache(workspaceId);

  if (cached) {
    const age = Date.now() - cached.updatedAt.getTime();
    if (age < maxAge) return cached;
  }

  return updateWorkspaceCache(workspaceId);
}
