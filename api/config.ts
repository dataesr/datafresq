const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isDevelopment = nodeEnv === 'development';
const isTest = nodeEnv === 'test';

export const config = {
  // Environment
  nodeEnv,
  isDevelopment,
  isProduction,
  isTest,

  // Database
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    database: process.env.MONGO_DB || 'datafresq',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
  },

  // Tokens & Sessions
  tokens: {
    accessExpSeconds: Number(process.env.ACCESS_EXP_SECONDS || '900'), // 15 minutes
    invitationExpSeconds: Number(process.env.INVITATION_EXP_SECONDS || '172800'), // 2 days
    resetPasswordExpSeconds: Number(process.env.RESET_PASSWORD_EXP_SECONDS || '3600'), // 1 hour
  },

  cookies: {
    access: {
      name: 'fqv_token',
      config: {
        domain: process.env.COOKIE_DOMAIN || '',
        httpOnly: !isTest,
        secure: isProduction,
        sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
        maxAge: Number(process.env.ACCESS_EXP_SECONDS || '900'), // 15 minutes
        path: '/',
      },
    },
    session: {
      name: 'fqv_session',
      config: {
        domain: process.env.COOKIE_DOMAIN || '',
        httpOnly: !isTest,
        secure: isProduction,
        sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
        maxAge: Number(process.env.SESSION_EXP_SECONDS || '604800'), // 7 days
        path: '/',
      },
    },
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    url: process.env.BREVO_URL || '',
  },
  elastic: {
    node: process.env.ELASTIC_NODE || '',
    auth: {
      username: process.env.ELASTIC_USERNAME || '',
      password: process.env.ELASTIC_PASSWORD || '',
    },
    indexes: {
      programs: process.env.ES_PROGRAMS_INDEX,
      institutions: process.env.ES_INSTITUTIONS_INDEX,
      specializations: process.env.ES_SPECIALIZATIONS_INDEX,
      careers: process.env.ES_CAREERS_INDEX,
    },
  },
} as const;

/**
 * Validate configuration
 */
export function validateConfig() {
  const errors: string[] = [];

  if (!config.jwt.secret) errors.push('JWT_SECRET is required');
  if (config.jwt.secret && config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // Production-specific validation
  if (isProduction) {
    if (!process.env.MONGO_URI) {
      errors.push('MONGO_URI must be explicitly set in production');
    }

    if (config.mongodb.uri.includes('localhost')) {
      console.warn('⚠️  Warning: Using localhost MongoDB in production');
    }

    if (!process.env.COOKIE_DOMAIN) {
      console.warn('⚠️  Warning: COOKIE_DOMAIN not set in production');
    }

    if (!config.elastic.node) {
      errors.push('ELASTIC_HOST must be explicitly set in production');
    }

    if (!config.elastic.auth.username || !config.elastic.auth.password) {
      errors.push('ELASTIC_USERNAME and ELASTIC_PASSWORD must be explicitly set in production');
    }

    if (!config.brevo.apiKey) {
      errors.push('BREVO_API_KEY must be explicitly set in production');
    }

    if (!config.brevo.url) {
      errors.push('BREVO_URL must be explicitly set in production');
    }

    if (!config.elastic.indexes.programs) {
      errors.push('ES_PROGRAMS_INDEX must be explicitly set in production');
    }

    if (!config.elastic.indexes.institutions) {
      errors.push('ES_INSTITUTIONS_INDEX must be explicitly set in production');
    }

    if (!config.elastic.indexes.specializations) {
      errors.push('ES_SPECIALIZATIONS_INDEX must be explicitly set in production');
    }

    if (!config.elastic.indexes.careers) {
      errors.push('ES_CAREERS_INDEX must be explicitly set in production');
    }
  }

  // Throw if any errors
  if (errors.length > 0) {
    throw new Error(`❌ Configuration validation failed:\n  - ${errors.join('\n  - ')}`);
  }

  console.log('✅ Configuration validated');
}
