export type FailureKind =
  | 'invalid_input'
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'internal'
  | 'unprocessable'
  | 'too_large'
  | 'bad_gateway'
  | 'unavailable'
  | 'timeout';

export type FailureDetails = string | Record<string, any>;

/** Fallo de aplicación independiente de HTTP, Nest y los proveedores externos. */
export class ApplicationFailure extends Error {
  constructor(
    public readonly kind: FailureKind,
    public readonly details: FailureDetails,
  ) {
    super(
      typeof details === 'string'
        ? details
        : typeof details.message === 'string'
          ? details.message
          : 'Error de aplicación',
    );
    this.name = new.target.name;
  }
}

export class InvalidInputError extends ApplicationFailure {
  constructor(details: FailureDetails = 'Bad Request') {
    super('invalid_input', details);
  }
}
export class UnauthenticatedError extends ApplicationFailure {
  constructor(details: FailureDetails = 'Unauthorized') {
    super('unauthenticated', details);
  }
}
export class ForbiddenError extends ApplicationFailure {
  constructor(details: FailureDetails = 'Forbidden') {
    super('forbidden', details);
  }
}
export class NotFoundError extends ApplicationFailure {
  constructor(details: FailureDetails = 'Not Found') {
    super('not_found', details);
  }
}
export class ConflictError extends ApplicationFailure {
  constructor(details: FailureDetails = 'Conflict') {
    super('conflict', details);
  }
}
export class InternalError extends ApplicationFailure {
  constructor(details: FailureDetails = 'Internal Server Error') {
    super('internal', details);
  }
}
export class UnprocessableError extends ApplicationFailure {
  constructor(details: FailureDetails = 'Unprocessable Entity') {
    super('unprocessable', details);
  }
}
export class TooLargeError extends ApplicationFailure {
  constructor(details: FailureDetails = 'Payload Too Large') {
    super('too_large', details);
  }
}
export class MailDeliveryError extends ApplicationFailure {
  constructor(message: string, code = 'MAIL_SEND_FAILED') {
    super('bad_gateway', { message, code });
  }
}
