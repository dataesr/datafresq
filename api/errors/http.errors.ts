import { AppError } from './base.error';

export class BadRequestError extends AppError {
  code = 'BAD_REQUEST';

  constructor(message = 'Requête invalide') {
    super(message);
  }
}

export class NotFoundError extends AppError {
  code = 'NOT_FOUND';

  constructor(message = 'Ressource introuvable') {
    super(message);
  }
}

export class InternalServerError extends AppError {
  code = 'INTERNAL_SERVER_ERROR';

  constructor(message = 'Erreur interne du serveur') {
    super(message);
  }
}
