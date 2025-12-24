import { AppError } from './base.error';

export class InvalidSessionError extends AppError {
  status = 401;
  code = 'INVALID_SESSION';

  constructor(message = 'Invalid or expired session') {
    super(message);
  }
}

export class SessionReuseError extends AppError {
  status = 401;
  code = 'SESSION_REUSE';

  constructor(message: string = 'Session reuse detected - all sessions have been revoked') {
    super(message);
  }
}

export class SessionNotFoundError extends AppError {
  status = 404;
  code = 'SESSION_NOT_FOUND';

  constructor(message: string = 'Session introuvable') {
    super(message);
  }
}
