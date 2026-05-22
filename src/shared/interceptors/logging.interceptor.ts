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

// ========= FLAGS DE LOG (activar/desactivar aquí) =========
const LOG_REQUEST_META = true; // método, URL, IP, user-agent
const LOG_REQUEST_QUERY = false; // request.query
const LOG_REQUEST_BODY = false; // request.body
const LOG_RESPONSE_BODY = false; // body de respuesta
const LOG_ERROR_STACK = false; // stack trace en errores
const MAX_LOG_PAYLOAD_CHARS = 4000;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Log de la petición entrante
    if (LOG_REQUEST_META) {
      this.logger.log(`📥 ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);
    }
    if (LOG_REQUEST_QUERY && request.query && Object.keys(request.query).length > 0) {
      this.logger.log(`   Query: ${this.stringifyForLog(request.query)}`);
    }
    if (
      LOG_REQUEST_BODY &&
      request.body &&
      typeof request.body === 'object' &&
      Object.keys(request.body).length > 0
    ) {
      this.logger.log(`   Body: ${this.stringifyForLog(request.body)}`);
    }

    return next.handle().pipe(
      tap((responseBody) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;
        const statusEmoji = this.getStatusEmoji(statusCode);

        this.logger.log(
          `${statusEmoji} ${method} ${url} - ${statusCode} - ${duration}ms`,
        );

        if (LOG_RESPONSE_BODY) {
          this.logger.log(`   Response: ${this.stringifyForLog(responseBody)}`);
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

          if (LOG_ERROR_STACK && error.stack) {
            this.logger.log(`   Stack: ${error.stack}`);
          }
        }

        throw error;
      }),
    );
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

  private stringifyForLog(payload: unknown): string {
    try {
      const serialized =
        typeof payload === 'string' ? payload : JSON.stringify(payload);
      if (serialized.length <= MAX_LOG_PAYLOAD_CHARS) return serialized;
      return `${serialized.slice(0, MAX_LOG_PAYLOAD_CHARS)}... [truncated]`;
    } catch {
      return '[unserializable payload]';
    }
  }
}
