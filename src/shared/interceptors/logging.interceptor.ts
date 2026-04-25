import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body, query, params, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Log de la petición entrante
    this.logger.log(
      `📥 ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    // Log del body si existe (excepto buffers binarios y passwords)
    if (
      body &&
      !Buffer.isBuffer(body) &&
      typeof body === 'object' &&
      Object.keys(body).length > 0
    ) {
      try {
        const sanitizedBody = this.sanitizeBody(body);
        this.logger.log(`   Body: ${JSON.stringify(sanitizedBody)}`);
      } catch {
        this.logger.log('   Body: [no serializable]');
      }
    }

    // Log de query params si existen
    if (query && Object.keys(query).length > 0) {
      this.logger.log(`   Query: ${JSON.stringify(query)}`);
    }

    // Log de params si existen
    if (params && Object.keys(params).length > 0) {
      this.logger.log(`   Params: ${JSON.stringify(params)}`);
    }

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;
        const statusEmoji = this.getStatusEmoji(statusCode);

        this.logger.log(
          `${statusEmoji} ${method} ${url} - ${statusCode} - ${duration}ms`,
        );

        // Log de la respuesta (evitar circular refs: Response, Request, Socket)
        if (data !== undefined && data !== null) {
          try {
            const safe = this.safeStringify(data);
            if (safe !== undefined) this.logger.log(`   Response: ${safe}`);
          } catch {
            this.logger.log('   Response: [no serializable]');
          }
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode =
          error instanceof HttpException
            ? error.getStatus()
            : error.status || 500;
        const statusEmoji = this.getStatusEmoji(statusCode);
        const clientError =
          error instanceof HttpException &&
          statusCode >= 400 &&
          statusCode < 500;

        if (clientError) {
          this.logger.warn(
            `${statusEmoji} ${method} ${url} - ${statusCode} - ${duration}ms — ${error.message}`,
          );
        } else {
          this.logger.error(
            `${statusEmoji} ${method} ${url} - ${statusCode} - ${duration}ms`,
          );
          this.logger.error(`   Error: ${error.message}`);

          if (error.stack) {
            this.logger.log(`   Stack: ${error.stack}`);
          }
        }

        throw error;
      }),
    );
  }

  /**
   * Sanitiza el body removiendo campos sensibles como passwords
   */
  private sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Serializa de forma segura evitando referencias circulares (Socket, Request, Response)
   */
  private safeStringify(value: any): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (
      typeof value === 'function' ||
      (typeof value === 'object' && 'socket' in value)
    )
      return undefined;
    try {
      return JSON.stringify(value);
    } catch {
      return undefined;
    }
  }

  /**
   * Retorna un emoji basado en el código de estado HTTP
   */
  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) {
      return '✅'; // Success
    } else if (statusCode >= 300 && statusCode < 400) {
      return '🔄'; // Redirect
    } else if (statusCode >= 400 && statusCode < 500) {
      return '⚠️'; // Client error
    } else if (statusCode >= 500) {
      return '❌'; // Server error
    }
    return '📋'; // Other
  }
}
