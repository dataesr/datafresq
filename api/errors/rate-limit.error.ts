import { AppError } from './base.error';

export class RateLimitError extends AppError {
  code = 'RATE_LIMIT_EXCEEDED';

  public readonly retryAfter: number;

  constructor(
    message = 'Trop de requêtes. Veuillez réessayer plus tard.',
    retryAfter = 60,
    details?: Record<string, unknown>,
  ) {
    super(message, details);
    this.retryAfter = retryAfter;
  }
}
