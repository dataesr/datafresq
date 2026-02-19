import { mock } from 'bun:test';

// ============================================================================
// Environment mocks — prevent side effects at import time
// ============================================================================

export const TEST_JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long!!';

export const mockConfig = {
  nodeEnv: 'test',
  isDevelopment: false,
  isProduction: false,
  isTest: true,
  mongodb: { uri: 'mongodb://localhost:27017', database: 'test' },
  jwt: { secret: TEST_JWT_SECRET },
  tokens: { accessExpSeconds: 900, invitationExpSeconds: 172800, resetPasswordExpSeconds: 3600 },
  cookies: {
    access: {
      name: 'fqv_token',
      config: {
        domain: '',
        httpOnly: false,
        secure: false,
        sameSite: 'lax' as const,
        maxAge: 900,
        path: '/',
      },
    },
    session: {
      name: 'fqv_session',
      config: {
        domain: '',
        httpOnly: false,
        secure: false,
        sameSite: 'lax' as const,
        maxAge: 604800,
        path: '/',
      },
    },
  },
  brevo: { apiKey: 'test-key', url: 'https://api.brevo.test' },
  elastic: {
    node: 'http://localhost:9200',
    auth: { username: 'elastic', password: 'test' },
    indexes: {
      programs: 'test-programs',
      institutions: 'test-institutions',
      specializations: 'test-specializations',
      careers: 'test-careers',
    },
  },
} as const;

export function setupMockConfig() {
  mock.module('~/config', () => ({
    config: mockConfig,
    validateConfig: mock(),
  }));
}

export function setupMockEmailTemplates() {
  mock.module('emails/render', () => ({
    renderEmail: mock(() => '<html>mock</html>'),
  }));
  mock.module('emails/templates/InvitationEmail', () => ({
    InvitationEmail: mock(() => null),
  }));
  mock.module('emails/templates/PasswordResetEmail', () => ({
    PasswordResetEmail: mock(() => null),
  }));
}

export function setupMockElasticClient() {
  mock.module('@elastic/elasticsearch', () => ({
    Client: class MockClient {
      ping() {
        return Promise.resolve(true);
      }
      search() {
        return Promise.resolve({ hits: { hits: [], total: { value: 0 } } });
      }
      openPointInTime() {
        return Promise.resolve({ id: 'mock-pit' });
      }
      closePointInTime() {
        return Promise.resolve();
      }
    },
    HttpConnection: class MockHttpConnection {},
  }));
}

// ============================================================================
// Mock spies — shared across all test files that call setupMockDb()
// ============================================================================

export const mockCollections = {
  db: {
    command: mock(() => Promise.resolve({ ok: 1 })),
  },
  users: {
    findOne: mock(),
    find: mock(),
    updateOne: mock(),
    insertOne: mock(),
    createIndex: mock(),
  },
  tokens: {
    findOne: mock(),
    insertOne: mock(),
    updateOne: mock(),
    createIndex: mock(),
  },
  sessions: {
    findOne: mock(),
    find: mock(),
    insertOne: mock(),
    updateOne: mock(),
    deleteOne: mock(),
    deleteMany: mock(),
    createIndex: mock(),
  },
  sise: {
    aggregate: mock(),
    createIndex: mock(),
  },
  insersup: {
    aggregate: mock(),
    createIndex: mock(),
  },
  workspaces: {
    findOne: mock(),
    find: mock(),
    insertOne: mock(),
    updateOne: mock(),
    deleteOne: mock(),
    aggregate: mock(),
    createIndex: mock(),
  },
  workspaceEvents: {
    find: mock(),
    insertOne: mock(),
    deleteMany: mock(),
    countDocuments: mock(),
    aggregate: mock(),
    createIndex: mock(),
  },
  workspaceCache: {
    findOne: mock(),
    updateOne: mock(),
    deleteOne: mock(),
    createIndex: mock(),
  },
  programs: {
    findOne: mock(),
    aggregate: mock(),
    createIndex: mock(),
  },
  rateLimits: {
    findOne: mock(),
    updateOne: mock(),
    createIndex: mock(),
  },
  guideReviews: {
    findOne: mock(),
    find: mock(),
    insertOne: mock(),
    updateOne: mock(),
    deleteOne: mock(),
    aggregate: mock(),
    createIndex: mock(),
  },
};

// ============================================================================
// Real implementations (inlined to avoid circular mock.module issues)
//
// These mirror ~/utils/token and ~/utils/password so that:
//  - utility tests exercising the real modules still get real crypto
//  - service/route tests can override individual spies as needed
// ============================================================================

function _generateToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Buffer.from(arr).toString('hex');
}

function _hashToken(token: string): string {
  const hasher = new Bun.CryptoHasher('sha256');
  hasher.update(token);
  return hasher.digest('hex');
}

function _generateTokenWithHash(): { token: string; tokenHash: string } {
  const token = _generateToken();
  const tokenHash = _hashToken(token);
  return { token, tokenHash };
}

function _generateSessionInfo() {
  const sessionToken = _generateToken(32);
  const sessionTokenHash = _hashToken(sessionToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return { sessionToken, sessionTokenHash, expiresAt };
}

async function _hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, {
    algorithm: 'argon2id',
    memoryCost: 65536,
    timeCost: 3,
  });
}

async function _verifyPassword(password: string, hash: string): Promise<boolean> {
  return Bun.password.verify(password, hash);
}

// ============================================================================
// Token & password spies — default to real implementations
// ============================================================================

export const mockToken = {
  generateSessionInfo: mock(_generateSessionInfo),
  generateToken: mock(_generateToken),
  generateTokenWithHash: mock(_generateTokenWithHash),
  hashToken: mock(_hashToken),
};

export const mockPassword = {
  hashPassword: mock(_hashPassword),
  verifyPassword: mock(_verifyPassword),
};

export const mockId = {
  generateId: mock(() => 'mock-id'),
};

export const mockEmail = {
  sendInvitationEmail: mock(() => Promise.resolve({ ok: true })),
  sendPasswordResetEmail: mock(() => Promise.resolve({ ok: true })),
};

// ============================================================================
// Chainable cursor helper
//
// MongoDB calls like .find().sort().toArray() or .aggregate().toArray()
// return cursor-like objects. This helper builds one that resolves to `data`.
// ============================================================================

export function cursorOf<T>(data: T[] = []) {
  return {
    sort: mock(() => ({ toArray: mock(() => Promise.resolve(data)) })),
    toArray: mock(() => Promise.resolve(data)),
  };
}

// ============================================================================
// Setup functions — call BEFORE importing the module under test
// ============================================================================

export function setupMockDb() {
  mock.module('~/database/mongo', () => ({
    collections: mockCollections,
    connect: mock(() => Promise.resolve()),
    close: mock(() => Promise.resolve()),
  }));
}

export function setupMockElastic() {
  mock.module('~/database/elastic', () => ({
    elastic: {
      ping: mock(() => Promise.resolve(true)),
      search: mock(() => Promise.resolve({ hits: { hits: [], total: { value: 0 } } })),
      openPointInTime: mock(() => Promise.resolve({ id: 'mock-pit' })),
      closePointInTime: mock(() => Promise.resolve()),
    },
    ES_INDEXES: {
      programs: 'mock-programs-index',
      institutions: 'mock-institutions-index',
      specializations: 'mock-specializations-index',
      careers: 'mock-careers-index',
    },
    extractHits: mock(() => []),
    extractTotal: mock(() => 0),
    extractTermBuckets: mock(() => []),
    setFilters: mock(() => []),
    scroll: mock(() => Promise.resolve({ results: [], totalCount: 0 })),
  }));
}

export function setupMockToken() {
  mock.module('~/utils/token', () => mockToken);
}

export function setupMockPassword() {
  mock.module('~/utils/password', () => mockPassword);
}

export function setupMockId() {
  mock.module('~/utils/id', () => mockId);
}

export function setupMockEmail() {
  mock.module('~/external/email', () => mockEmail);
}

// ============================================================================
// Reset — call in beforeEach to get a clean slate between tests
//
// Resets every spy and re-applies real implementations so:
//  - utility tests always exercise real crypto
//  - chained calls like .find().sort().toArray() work
//  - service/route tests can override specific spies after reset
// ============================================================================

export function resetAllMocks() {
  // Reset all collection mocks
  for (const collection of Object.values(mockCollections)) {
    for (const fn of Object.values(collection)) {
      if (typeof fn === 'function' && 'mockReset' in fn) {
        (fn as ReturnType<typeof mock>).mockReset();
      }
    }
  }

  // Re-apply defaults for chainable methods
  mockCollections.users.find.mockReturnValue(cursorOf());
  mockCollections.sessions.find.mockReturnValue(cursorOf());
  mockCollections.sessions.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });
  mockCollections.sise.aggregate.mockReturnValue(cursorOf());
  mockCollections.insersup.aggregate.mockReturnValue(cursorOf());
  mockCollections.workspaces.aggregate.mockReturnValue(cursorOf());
  mockCollections.workspaceEvents.aggregate.mockReturnValue(cursorOf());
  mockCollections.programs.aggregate.mockReturnValue(cursorOf());
  mockCollections.guideReviews.find.mockReturnValue(cursorOf());
  mockCollections.guideReviews.aggregate.mockReturnValue(cursorOf());

  // Reset token mocks — restore real implementations
  mockToken.generateSessionInfo.mockReset();
  mockToken.generateSessionInfo.mockImplementation(_generateSessionInfo);
  mockToken.generateToken.mockReset();
  mockToken.generateToken.mockImplementation(_generateToken);
  mockToken.generateTokenWithHash.mockReset();
  mockToken.generateTokenWithHash.mockImplementation(_generateTokenWithHash);
  mockToken.hashToken.mockReset();
  mockToken.hashToken.mockImplementation(_hashToken);

  // Reset password mocks — restore real implementations
  mockPassword.hashPassword.mockReset();
  mockPassword.hashPassword.mockImplementation(_hashPassword);
  mockPassword.verifyPassword.mockReset();
  mockPassword.verifyPassword.mockImplementation(_verifyPassword);

  // Reset id mock
  mockId.generateId.mockReset();
  mockId.generateId.mockReturnValue('mock-id');

  // Reset email mocks
  mockEmail.sendInvitationEmail.mockReset();
  mockEmail.sendInvitationEmail.mockImplementation(() => Promise.resolve({ ok: true }));
  mockEmail.sendPasswordResetEmail.mockReset();
  mockEmail.sendPasswordResetEmail.mockImplementation(() => Promise.resolve({ ok: true }));
}

// ============================================================================
// Helpers — compute real hashes for use in test fixtures
// ============================================================================

export { _hashToken as realHashToken };
