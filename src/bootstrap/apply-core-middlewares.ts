import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Application, Request, Response, NextFunction } from 'express';

/** Compartido con Pino para que cabecera, logs y petición tengan el mismo ID. */
export function ensureRequestId(
  request: IncomingMessage & { requestId?: string },
  response: ServerResponse,
): string {
  const candidate = request.requestId ?? request.headers['x-request-id'];
  const id =
    typeof candidate === 'string' &&
    /^[A-Za-z0-9._:-]{1,128}$/.test(candidate.trim())
      ? candidate.trim()
      : randomUUID();
  request.requestId = id;
  request.id = id;
  response.setHeader('X-Request-Id', id);
  return id;
}

/**
 * Asocia o propaga `X-Request-Id` para correlación de logs.
 */
export function useRequestId(app: INestApplication): void {
  const http = app.getHttpAdapter().getInstance() as Application;
  http.use((req: Request, res: Response, next: NextFunction) => {
    ensureRequestId(req, res);
    next();
  });
}
