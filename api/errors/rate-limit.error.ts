import { AppError } from './base.error';

export class RateLimitError extends AppError {
  status = 429;
  code = 'RATE_LIMIT_EXCEEDED';

  public readonly retryAfter: number;

  constructor(
    message = 'Too many requests. Please try again later.',
    retryAfter = 60,
    details?: Record<string, unknown>,
  ) {
    super(message, details);
    this.retryAfter = retryAfter;
  }
}
