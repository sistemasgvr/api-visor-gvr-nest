import { HttpException } from '@nestjs/common';
import {
  ApplicationFailure,
  ConflictError,
  ForbiddenError,
  InternalError,
  InvalidInputError,
  NotFoundError,
  TooLargeError,
  UnauthenticatedError,
  UnprocessableError,
  type FailureKind,
} from '../../application/errors/application.error';

const errorTypes: Record<number, new (details: any) => ApplicationFailure> = {
  400: InvalidInputError,
  401: UnauthenticatedError,
  403: ForbiddenError,
  404: NotFoundError,
  409: ConflictError,
  413: TooLargeError,
  422: UnprocessableError,
  500: InternalError,
};
const kinds: Record<number, FailureKind> = {
  502: 'bad_gateway',
  503: 'unavailable',
  504: 'timeout',
};
const transportFailures = new WeakMap<ApplicationFailure, HttpException>();
export function originalTransportFailure(
  error: ApplicationFailure,
): HttpException | undefined {
  return transportFailures.get(error);
}
export const failureHttpStatus: Record<FailureKind, number> = {
  invalid_input: 400,
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  too_large: 413,
  unprocessable: 422,
  internal: 500,
  bad_gateway: 502,
  unavailable: 503,
  timeout: 504,
};

/** Traducir los errores del adaptador antes de cruzar hacia la aplicación. */
export function toApplicationFailure(error: unknown): unknown {
  if (!(error instanceof HttpException)) return error;
  const status = error.getStatus();
  const details = error.getResponse();
  const ErrorType = errorTypes[status];
  const failure = ErrorType
    ? new ErrorType(details)
    : new ApplicationFailure(
        kinds[status] ?? 'internal',
        typeof details === 'string'
          ? details
          : (details as Record<string, any>),
      );
  failure.message = error.message;
  transportFailures.set(failure, error);
  return failure;
}

const adapted = new WeakMap<object, object>();
export function applicationDependency<T>(value: T): T {
  if (!value || typeof value !== 'object') return value;
  const existing = adapted.get(value);
  if (existing) return existing as T;
  const proxy = new Proxy(value, {
    get(target, property) {
      const member = Reflect.get(target, property, target);
      if (typeof member !== 'function') return member;
      return (...args: unknown[]) => {
        try {
          const result: unknown = member.apply(target, args);
          return result instanceof Promise
            ? result.catch((error: unknown) => {
                throw toApplicationFailure(error);
              })
            : result;
        } catch (error) {
          throw toApplicationFailure(error);
        }
      };
    },
  });
  adapted.set(value, proxy);
  return proxy;
}
