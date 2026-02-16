import { Elysia } from 'elysia';

/**
 * ANSI Color Codes
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Methods
  get: '\x1b[36m', // Cyan
  post: '\x1b[33m', // Yellow
  put: '\x1b[35m', // Magenta
  delete: '\x1b[31m', // Red
  patch: '\x1b[34m', // Blue

  // Status codes
  success: '\x1b[32m', // Green (2xx)
  redirect: '\x1b[36m', // Cyan (3xx)
  clientError: '\x1b[33m', // Yellow (4xx)
  serverError: '\x1b[31m', // Red (5xx)

  // Timing
  fast: '\x1b[32m', // Green (< 100ms)
  medium: '\x1b[33m', // Yellow (100-500ms)
  slow: '\x1b[31m', // Red (> 500ms)

  gray: '\x1b[90m',
  white: '\x1b[37m',
} as const;

/**
 * Logger Plugin Options
 */
export interface LoggerOptions {
  /** Enable logging (default: true in development, false in production) */
  enabled?: boolean;
  /** Use colored output (default: true) */
  colors?: boolean;
  /** Show timestamp (default: false) */
  timestamp?: boolean;
  /** Show query parameters (default: true) */
  showQuery?: boolean;
  /** Custom logger function (default: console.log) */
  log?: (message: string) => void;
}

/**
 * Get color for HTTP method
 */
function getMethodColor(method: string): string {
  const methodColors: Record<string, string> = {
    GET: colors.get,
    POST: colors.post,
    PUT: colors.put,
    DELETE: colors.delete,
    PATCH: colors.patch,
  };
  return methodColors[method.toUpperCase()] || colors.white;
}

/**
 * Get color for status code
 */
function getStatusColor(status: number | undefined | string): string {
  if (typeof status === 'string') return colors.white;
  if (status === undefined) return colors.white;
  if (status >= 200 && status < 300) return colors.success;
  if (status >= 300 && status < 400) return colors.redirect;
  if (status >= 400 && status < 500) return colors.clientError;
  if (status >= 500) return colors.serverError;
  return colors.white;
}

/**
 * Get color for response time
 */
function getTimingColor(ms: number): string {
  if (ms < 100) return colors.fast;
  if (ms < 500) return colors.medium;
  return colors.slow;
}

/**
 * Format timing with appropriate unit
 */
function formatTiming(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Request Logger Plugin
 *
 * Logs HTTP requests with colored output and timing information
 *
 * @example
 * ```ts
 * app.use(logger())
 * app.use(logger({ timestamp: true, colors: false }))
 * ```
 */
export const logger = (options: LoggerOptions = {}) => {
  const { enabled = true } = options;

  return new Elysia({ name: 'logger' })
    .state('startTime', 0)
    .onBeforeHandle(({ store }) => {
      if (!enabled) return;

      store.startTime = performance.now();
    })
    .onAfterResponse(({ request, set, store }) => {
      if (!enabled) return;

      const startTime = store.startTime || 0;
      const duration = performance.now() - startTime;

      const { method, url } = request;
      const status = set.status || 200;

      // Parse URL
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const query = urlObj.search;

      // Build log message
      const parts: string[] = [];

      // Timestamp
      const time = new Date().toLocaleTimeString('fr-FR');
      parts.push(`${colors.gray}[${time}]${colors.reset}`);

      // Method
      const methodColor = getMethodColor(method);
      parts.push(`${methodColor}${method.padEnd(7)}${colors.reset}`);

      // Status
      const statusColor = getStatusColor(status);
      parts.push(`${statusColor}${status}${colors.reset}`);

      // Timing
      const timingStr = formatTiming(duration);
      const timingColor = getTimingColor(duration);
      parts.push(`${timingColor}${colors.bright}${timingStr}${colors.reset}`);

      // Path
      parts.push(`${colors.white}${path}${colors.reset}`);

      // Query
      if (query) {
        parts.push(`${colors.dim}${query}${colors.reset}`);
      }

      // Log
      console.log(parts.join(' '));
    })
    .as('scoped');
};
