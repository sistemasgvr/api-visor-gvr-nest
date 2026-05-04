import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseDto } from '../dtos/api-response.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    let code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

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
    }

    const errorResponse = ApiResponseDto.error(message, status, code);

    response.status(status).json(errorResponse);
  }
}
