import type { Request, Response } from 'express';
import type { Options } from 'pino-http';
import type { EnvironmentVariables } from '../config/env.validation';
import { Environment } from '../config/env.validation';
import { ensureRequestId } from './apply-core-middlewares';

type LoggingConfiguration = Pick<
  EnvironmentVariables,
  'NODE_ENV' | 'LOG_LEVEL' | 'LOG_PRETTY'
>;

/** Un mismo logger para Nest, los adaptadores y el contexto HTTP. */
export function createPinoHttpOptions(
  configuration: LoggingConfiguration,
): Options<Request, Response> {
  const pretty =
    configuration.LOG_PRETTY ??
    configuration.NODE_ENV === Environment.Development;
  return {
    level: configuration.LOG_LEVEL,
    quietReqLogger: true,
    customAttributeKeys: { reqId: 'requestId' },
    genReqId: ensureRequestId,
    wrapSerializers: false,
    serializers: {
      // Evita serializar config/response/cause de errores de proveedores HTTP.
      err: (error: Error) => ({
        type: error.name,
        message: error.message,
        stack: error.stack,
      }),
      // Lista explícita: nunca registrar cookies, autorización, query o bodies.
      req: (request: Request) => ({
        requestId: request.requestId,
        method: request.method,
        url: (request.originalUrl || request.url).split(/[?#]/, 1)[0],
        remoteAddress: request.socket.remoteAddress,
      }),
      res: (response: Response) => ({ statusCode: response.statusCode }),
    },
    redact: {
      paths: [
        'password',
        'contrasena',
        'token',
        'access_token',
        'refresh_token',
        'authorization',
        'cookie',
        'secret',
        '*.password',
        '*.contrasena',
        '*.token',
        '*.access_token',
        '*.refresh_token',
        '*.authorization',
        '*.cookie',
        '*.secret',
        'req.headers',
        'req.body',
        'req.query',
        'res.headers',
        'res.body',
      ],
      censor: '[REDACTED]',
    },
    customLogLevel: (_request, response, error) => {
      if (error || response.statusCode >= 500) return 'error';
      if (response.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: () => 'Solicitud HTTP completada',
    customErrorMessage: () => 'Solicitud HTTP fallida',
    ...(pretty
      ? {
          transport: {
            target: require.resolve('pino-pretty'),
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              singleLine: true,
            },
          },
        }
      : {}),
  };
}
