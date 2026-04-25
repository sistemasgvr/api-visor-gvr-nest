import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Application, Request, Response, NextFunction } from 'express';

/**
 * Asocia o propaga `X-Request-Id` para correlación de logs.
 */
export function useRequestId(app: INestApplication): void {
  const http = app.getHttpAdapter().getInstance() as Application;
  http.use((req: Request, res: Response, next: NextFunction) => {
    const fromHeader = req.headers['x-request-id'];
    const id =
      typeof fromHeader === 'string' && fromHeader.trim()
        ? fromHeader.trim()
        : randomUUID();
    req.requestId = id;
    res.setHeader('X-Request-Id', id);
    next();
  });
}
