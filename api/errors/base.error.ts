export abstract class AppError extends Error {
  abstract code: string;

  constructor(
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
