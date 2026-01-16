// Database connection and collection types
import { type Collection, type Db, MongoClient } from 'mongodb';
import { config } from '~/config';
import type {
  InsersupDoc,
  ProgramDoc,
  RateLimitDoc,
  SessionDoc,
  SiseDoc,
  TokenDoc,
  UserDoc,
  WorkspaceCacheDoc,
  WorkspaceDoc,
  WorkspaceEventDoc,
} from './types';

export type Collections = {
  db: Db;
  users: Collection<UserDoc>;
  tokens: Collection<TokenDoc>;
  sessions: Collection<SessionDoc>;
  sise: Collection<SiseDoc>;
  insersup: Collection<InsersupDoc>;
  workspaces: Collection<WorkspaceDoc>;
  workspaceEvents: Collection<WorkspaceEventDoc>;
  workspaceCache: Collection<WorkspaceCacheDoc>;
  programs: Collection<ProgramDoc>;
  rateLimits: Collection<RateLimitDoc>;
};

let client: MongoClient | null = null;
export let collections: Collections;

/**
 * Connect to MongoDB and return typed collections
 * Idempotent - multiple calls return the same connection
 */
export async function connect(): Promise<Collections> {
  // Return cached connection if available
  if (collections) return collections;

  // Create client if needed
  if (!client) {
    client = new MongoClient(config.mongodb.uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });
  }

  await client.connect();
  const db = client.db(config.mongodb.database);

  collections = {
    db,
    users: db.collection<UserDoc>('users'),
    tokens: db.collection<TokenDoc>('tokens'),
    sessions: db.collection<SessionDoc>('sessions'),
    sise: db.collection<SiseDoc>('sise'),
    insersup: db.collection<InsersupDoc>('insersup'),
    workspaces: db.collection<WorkspaceDoc>('workspaces'),
    workspaceEvents: db.collection<WorkspaceEventDoc>('workspace_events'),
    workspaceCache: db.collection<WorkspaceCacheDoc>('workspace_cache'),
    programs: db.collection<ProgramDoc>('programs'),
    rateLimits: db.collection<RateLimitDoc>('rate_limits'),
  };

  // Ensure indexes
  await ensureIndexes(collections);

  return collections;
}

/**
 * Close database connection
 */
export async function close(): Promise<void> {
  if (client) await client.close();
}

/**
 * Ensure all indexes are there
 */
async function ensureIndexes(cols: Collections): Promise<void> {
  // === USERS ===
  await cols.users.createIndex({ id: 1 }, { unique: true });
  await cols.users.createIndex({ email: 1 }, { unique: true });

  // === TOKENS ===
  await cols.tokens.createIndex({ id: 1 }, { unique: true });
  await cols.tokens.createIndex({ userId: 1 });
  await cols.tokens.createIndex({ tokenHash: 1 });
  await cols.tokens.createIndex({ type: 1, used: 1 });
  await cols.tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // === SESSIONS ===
  await cols.sessions.createIndex({ id: 1 }, { unique: true });
  await cols.sessions.createIndex({ userId: 1 });
  await cols.sessions.createIndex({ sessionTokenHash: 1 }, { unique: true });
  await cols.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await cols.sessions.createIndex({ isRevoked: 1, expiresAt: 1 });

  // === WORKSPACES ===
  await cols.workspaces.createIndex({ id: 1 }, { unique: true });
  await cols.workspaces.createIndex({ owner: 1 });
  await cols.workspaces.createIndex({ 'users.userId': 1 });
  await cols.workspaces.createIndex({ isPublic: 1 });

  // === WORKSPACE EVENTS ===
  await cols.workspaceEvents.createIndex({ workspaceId: 1, timestamp: -1 });
  await cols.workspaceEvents.createIndex({ workspaceId: 1, type: 1 });
  await cols.workspaceEvents.createIndex({ actor: 1 });

  // === WORKSPACE CACHE ===
  await cols.workspaceCache.createIndex({ workspaceId: 1 }, { unique: true });

  // === RATE LIMITS ===
  await cols.rateLimits.createIndex({ key: 1 }, { unique: true });
  await cols.rateLimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // === PROGRAMS ===
  await cols.programs.createIndex({ inf: 1 }, { unique: true });

  // === SISE ===
  await cols.sise.createIndex({ inf: 1, annee: 1 });

  // === INSERSUP ===
  // Primary lookup by program
  await cols.insersup.createIndex({ inf: 1 });
  // Compound index for the common query pattern in cache.ts
  await cols.insersup.createIndex({
    inf: 1,
    genre: 1,
    obtention_diplome: 1,
    nationalite: 1,
    regime_inscription: 1,
  });
}
