import { Elysia } from 'elysia';
import { collections } from '~/database/mongo';
import { RateLimitError } from '~/errors';
import { clientInfoPlugin } from '~/plugins/client-info';

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Unique key to identify this rate limit (e.g., 'signin', 'forgot-password') */
  key?: string;
  /** Custom error message when rate limit is exceeded */
  message?: string;
}

/**
 * rateLimitMacro
 *
 * Provides rate limiting to prevent abuse on API endpoints.
 * Uses MongoDB with TTL indexes for automatic cleanup.
 * Works independently, doesn't require authentication.
 *
 * @example
 * ```ts
 * import { rateLimitMacro } from '~/macros/rateLimitMacro';
 *
 * const app = new Elysia()
 *   .use(rateLimitMacro)
 *   .post('/signin', (ctx) => ({ success: true }), {
 *     rateLimit: {
 *       maxRequests: 5,
 *       windowSeconds: 60,
 *       key: 'signin',
 *       message: 'Trop de tentatives de connexion'
 *     }
 *   });
 * ```
 */
export const rateLimitMacro = new Elysia({ name: 'rateLimit-macro' })
  .use(clientInfoPlugin)
  .macro({
    rateLimit(config: RateLimitConfig | undefined) {
      if (!config || !config.maxRequests || !config.windowSeconds) return;

      if (config.maxRequests <= 0) {
        throw new Error('rateLimit: maxRequests must be greater than 0');
      }
      if (config.windowSeconds <= 0) {
        throw new Error('rateLimit: windowSeconds must be greater than 0');
      }

      return {
        async beforeHandle({ clientInfo, set }) {
          try {
            // Use IP address, fallback to 'unknown' if not available
            const ip = clientInfo.ipAddress || 'unknown';
            const rateLimitKey = `${config.key || 'default'}:${ip}`;

            const now = new Date();
            const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);

            // Find existing rate limit record within the current window
            const record = await collections.rateLimits.findOne({
              key: rateLimitKey,
              windowStart: { $gte: windowStart },
            });

            if (record) {
              // Check if rate limit exceeded
              if (record.count >= config.maxRequests) {
                const retryAfter = Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000);

                set.status = 429;
                set.headers['Retry-After'] = Math.max(retryAfter, 1).toString();
                set.headers['X-RateLimit-Limit'] = config.maxRequests.toString();
                set.headers['X-RateLimit-Remaining'] = '0';
                set.headers['X-RateLimit-Reset'] = record.expiresAt.toISOString();

                throw new RateLimitError(
                  config.message ||
                    `Trop de requêtes. Veuillez réessayer dans ${Math.max(retryAfter, 1)} secondes.`,
                  Math.max(retryAfter, 1),
                );
              }

              // Increment counter
              await collections.rateLimits.updateOne({ _id: record._id }, { $inc: { count: 1 } });

              // Set rate limit headers
              const remaining = Math.max(config.maxRequests - record.count - 1, 0);
              set.headers['X-RateLimit-Limit'] = config.maxRequests.toString();
              set.headers['X-RateLimit-Remaining'] = remaining.toString();
              set.headers['X-RateLimit-Reset'] = record.expiresAt.toISOString();
            } else {
              // Create new rate limit record
              const expiresAt = new Date(now.getTime() + config.windowSeconds * 1000);

              // Use upsert to handle race conditions
              await collections.rateLimits.updateOne(
                { key: rateLimitKey },
                {
                  $setOnInsert: {
                    key: rateLimitKey,
                    windowStart: now,
                    expiresAt,
                  },
                  $inc: { count: 1 },
                },
                { upsert: true },
              );

              // Set rate limit headers
              set.headers['X-RateLimit-Limit'] = config.maxRequests.toString();
              set.headers['X-RateLimit-Remaining'] = (config.maxRequests - 1).toString();
              set.headers['X-RateLimit-Reset'] = expiresAt.toISOString();
            }
          } catch (error) {
            // If it's our rate limit error, rethrow it
            if (error instanceof RateLimitError) {
              throw error;
            }
            // Otherwise, log and allow request (fail open for availability)
            console.error('[rateLimit] Failed to check rate limit:', error);
          }
        },
      };
    },
  })
  .as('global');
