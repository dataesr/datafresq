import { AppError } from './base.error';

export class InvalidSessionError extends AppError {
  code = 'INVALID_SESSION';

  constructor(message = 'Session invalide ou expirée') {
    super(message);
  }
}

export class SessionReuseError extends AppError {
  code = 'SESSION_REUSE';

  constructor(
    message: string = 'Réutilisation de session détectée — toutes les sessions ont été révoquées',
  ) {
    super(message);
  }
}

export class SessionNotFoundError extends AppError {
  code = 'SESSION_NOT_FOUND';

  constructor(message: string = 'Session introuvable') {
    super(message);
  }
}
