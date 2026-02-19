import { AppError } from './base.error';

export class DatabaseError extends AppError {
  code = 'DATABASE_ERROR';

  constructor(message = 'Erreur de base de données') {
    super(message);
  }
}
