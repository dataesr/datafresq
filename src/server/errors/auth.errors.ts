import { AppError } from './base.error';

export class UnauthorizedError extends AppError {
  status = 401;
  code = 'UNAUTHORIZED';

  constructor(message = 'Authentication required', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class InvalidCredentialsError extends AppError {
  status = 401;
  code = 'INVALID_CREDENTIALS';

  constructor(message = 'Invalid email or password', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class ForbiddenError extends AppError {
  status = 403;
  code = 'FORBIDDEN';

  constructor(
    message = 'You do not have permission to perform this action',
    details?: Record<string, unknown>,
  ) {
    super(message, details);
  }
}

export class AccountInactiveError extends AppError {
  status = 403;
  code = 'ACCOUNT_INACTIVE';

  constructor(message = 'Account is inactive', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class EmailAlreadyExistsError extends AppError {
  status = 409;
  code = 'EMAIL_ALREADY_EXISTS';

  constructor(message = 'Email already exists', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class InvalidTokenError extends AppError {
  status = 400;
  code = 'INVALID_TOKEN';

  constructor(message = 'Invalid or expired token', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class TokenMissingError extends AppError {
  status = 400;
  code = 'TOKEN_MISSING';

  constructor(message = 'Token is required', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class PasswordMismatchError extends AppError {
  status = 400;
  code = 'PASSWORD_MISMATCH';

  constructor(message = 'Passwords do not match', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class JWTFailedError extends AppError {
  status = 500;
  code = 'JWT_FAILED';

  constructor(message = 'Failed to generate JWT token', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class MailerFailedError extends AppError {
  status = 500;
  code = 'MAILER_FAILED';

  constructor(message = 'Failed to send email', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class UserNotFoundError extends AppError {
  status = 404;
  code = 'USER_NOT_FOUND';

  constructor(message = 'User not found', details?: Record<string, unknown>) {
    super(message, details);
  }
}
