import { collections } from '~/database/mongo';
import type {
  InsersupAggregations,
  ProgramAggregations,
  SiseAggregations,
} from '~/schemas/aggregations';
import { computeInsersupAggregations, emptyInsersupAggregations } from './insersup';
import { computeProgramAggregations, emptyProgramAggregations } from './programs';
import { computeSiseAggregations, emptySiseAggregations } from './sise';

interface WorkspaceCacheDoc {
  workspaceId: string;
  updatedAt: Date;
  programCount: number;
  studentsAggregations: SiseAggregations;
  programAggregations: ProgramAggregations;
  insersupAggregations: InsersupAggregations;
}

/**
 * Compute all aggregations for a workspace and update the cache
 */
export async function updateWorkspaceCache(workspaceId: string): Promise<WorkspaceCacheDoc | null> {
  // Get the workspace to retrieve program IDs
  const workspace = await collections.workspaces.findOne(
    { id: workspaceId },
    { projection: { programs: 1 } },
  );

  if (!workspace) {
    return null;
  }

  const programIds = workspace.programs || [];

  // If no programs, store empty cache
  if (programIds.length === 0) {
    const emptyCache: WorkspaceCacheDoc = {
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

  // Run all aggregations in parallel
  const [studentsAggregations, programAggregations, insersupAggregations] = await Promise.all([
    computeSiseAggregations(programIds),
    computeProgramAggregations(programIds),
    computeInsersupAggregations(programIds),
  ]);

  // Build cache document
  const cacheDoc: WorkspaceCacheDoc = {
    workspaceId,
    updatedAt: new Date(),
    programCount: programIds.length,
    studentsAggregations,
    programAggregations,
    insersupAggregations,
  };

  // Upsert the cache document
  await collections.workspaceCache.updateOne({ workspaceId }, { $set: cacheDoc }, { upsert: true });

  return cacheDoc;
}

/**
 * Get cached aggregations for a workspace
 * Returns null if cache doesn't exist
 */
export async function getWorkspaceCache(workspaceId: string): Promise<WorkspaceCacheDoc | null> {
  return collections.workspaceCache.findOne({ workspaceId });
}

/**
 * Get cached aggregations, computing if necessary
 * @param maxAge Maximum age in milliseconds before recomputing (default: 1 hour)
 */
export async function getOrComputeWorkspaceCache(
  workspaceId: string,
  maxAge: number = 3600000,
): Promise<WorkspaceCacheDoc | null> {
  const cached = await getWorkspaceCache(workspaceId);

  if (cached) {
    const age = Date.now() - cached.updatedAt.getTime();
    if (age < maxAge) {
      return cached;
    }
  }

  // Cache is stale or doesn't exist, recompute
  return updateWorkspaceCache(workspaceId);
}

/**
 * Invalidate (delete) the cache for a workspace
 * Call this when programs are added/removed
 */
export async function invalidateWorkspaceCache(workspaceId: string): Promise<void> {
  await collections.workspaceCache.deleteOne({ workspaceId });
}

/**
 * Invalidate and immediately recompute cache
 * Use this for immediate feedback after program changes
 */
export async function refreshWorkspaceCache(
  workspaceId: string,
): Promise<WorkspaceCacheDoc | null> {
  await invalidateWorkspaceCache(workspaceId);
  return updateWorkspaceCache(workspaceId);
}

export type { WorkspaceCacheDoc };
