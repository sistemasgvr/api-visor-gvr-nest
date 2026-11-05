import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import { envs } from '../../config';
import { isOriginAllowed } from '../../config/cors-origins.util';
import { ApplicationFailure } from '../../application/errors/application.error';
import {
  failureHttpStatus,
  originalTransportFailure,
} from '../../infrastructure/runtime/application-failure.adapter';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly allowedOrigins = [
    ...envs.frontendUrls,
    ...(envs.collaboraUrl ? [envs.collaboraUrl] : []),
  ];

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    let code: string | undefined;

    if (
      exception instanceof HttpException ||
      exception instanceof ApplicationFailure
    ) {
      const transportError =
        exception instanceof ApplicationFailure
          ? originalTransportFailure(exception)
          : exception;
      status = transportError
        ? transportError.getStatus()
        : failureHttpStatus[(exception as ApplicationFailure).kind];
      const exceptionResponse = transportError
        ? transportError.getResponse()
        : (exception as ApplicationFailure).details;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        const rawMsg = responseObj.message;
        if (Array.isArray(rawMsg)) {
          message = rawMsg.join(', ');
        } else if (typeof rawMsg === 'string') {
          message = rawMsg;
        }
        if (typeof responseObj.code === 'string') {
          code = responseObj.code;
        }
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as { code: string }).code === 'LIMIT_FILE_SIZE'
    ) {
      status = HttpStatus.PAYLOAD_TOO_LARGE;
      message =
        'El archivo supera el tamaño máximo permitido para esta operación.';
    } else if (exception instanceof Error) {
      message = exception.message;
      if (
        message.includes('timeout') ||
        message.includes('ETIMEDOUT') ||
        message.includes('ECONNABORTED')
      ) {
        status = HttpStatus.GATEWAY_TIMEOUT;
        message =
          'La operación tardó demasiado (timeout). Para archivos grandes en DOCS, revise el timeout del proxy y de la API.';
      }
    }

    // Pino registra la causa real de los 5xx junto al estado HTTP definitivo.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      response.err =
        exception instanceof Error
          ? exception
          : new Error('Error interno del servidor');
    }
    const errorResponse = ApiResponseDto.error(message, status, code);

    const origin = request.headers.origin;
    if (origin && isOriginAllowed(origin, this.allowedOrigins)) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Access-Control-Allow-Credentials', 'true');
      response.setHeader(
        'Access-Control-Expose-Headers',
        'Authorization, Content-Length, Content-Type, Content-Disposition',
      );
    }

    response.status(status).json(errorResponse);
  }
}
