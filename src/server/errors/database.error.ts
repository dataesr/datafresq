import { AppError } from './base.error';

export class DatabaseError extends AppError {
  status = 500;
  code = 'DATABASE_ERROR';

  constructor(message = '') {
    super(message);
  }
}
