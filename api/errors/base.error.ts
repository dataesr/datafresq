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
    const body: { error: ErrorMetadata } = {
      error: {
        code: this.code,
        message: this.message,
      },
    };

    // Include details only in development
    if (process.env.NODE_ENV !== 'production' && this.details) {
      body.error.details = this.details;
    }

    return Response.json(body, { status: this.status });
  }
}
