import { config } from '~/config';

type ErrorMetadata = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export abstract class AppError extends Error {
  abstract status: number;
  abstract code: string;

  constructor(
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to HTTP response
   */
  toResponse(): Response {
    const body: ErrorMetadata = {
      code: this.code,
      message: this.message,
    };

    if (!config.isProduction && this.details) {
      body.details = this.details;
    }

    return Response.json(body, { status: this.status });
  }
}
