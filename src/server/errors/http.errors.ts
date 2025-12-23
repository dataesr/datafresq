import { AppError } from './base.error';

export class BadRequestError extends AppError {
  status = 400;
  code = 'BAD_REQUEST';

  constructor(message = 'Bad request') {
    super(message);
  }
}

export class NotFoundError extends AppError {
  status = 404;
  code = 'NOT_FOUND';

  constructor(message = 'Resource not found') {
    super(message);
  }
}

export class InternalServerError extends AppError {
  status = 500;
  code = 'INTERNAL_SERVER_ERROR';

  constructor(message = 'Internal server error') {
    super(message);
  }
}
