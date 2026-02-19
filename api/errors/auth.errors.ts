import { AppError } from './base.error';

export class UnauthorizedError extends AppError {
  code = 'UNAUTHORIZED';

  constructor(message = 'Authentification requise', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class InvalidCredentialsError extends AppError {
  code = 'INVALID_CREDENTIALS';

  constructor(message = 'Identifiants incorrects', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class ForbiddenError extends AppError {
  code = 'FORBIDDEN';

  constructor(
    message = "Vous n'avez pas la permission d'effectuer cette action",
    details?: Record<string, unknown>,
  ) {
    super(message, details);
  }
}

export class AccountInactiveError extends AppError {
  code = 'ACCOUNT_INACTIVE';

  constructor(message = 'Compte inactif', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class EmailAlreadyExistsError extends AppError {
  code = 'EMAIL_ALREADY_EXISTS';

  constructor(message = 'Cet email est déjà utilisé', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class InvalidTokenError extends AppError {
  code = 'INVALID_TOKEN';

  constructor(message = 'Jeton invalide ou expiré', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class TokenMissingError extends AppError {
  code = 'TOKEN_MISSING';

  constructor(message = 'Jeton requis', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class PasswordMismatchError extends AppError {
  code = 'PASSWORD_MISMATCH';

  constructor(
    message = 'Les mots de passe ne correspondent pas',
    details?: Record<string, unknown>,
  ) {
    super(message, details);
  }
}

export class JWTFailedError extends AppError {
  code = 'JWT_FAILED';

  constructor(message = 'Échec de la génération du jeton JWT', details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class MailerFailedError extends AppError {
  code = 'MAILER_FAILED';

  constructor(message = "Échec de l'envoi de l'email", details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class UserNotFoundError extends AppError {
  code = 'USER_NOT_FOUND';

  constructor(message = 'Utilisateur introuvable', details?: Record<string, unknown>) {
    super(message, details);
  }
}
