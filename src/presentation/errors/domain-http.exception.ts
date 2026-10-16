import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Error de reglas de negocio con código estable para el cliente (front).
 * El {@link GlobalExceptionFilter} reenvía `code` en {@link ApiResponseDto}.
 */
export class DomainException extends HttpException {
  constructor(
    message: string,
    public readonly businessCode: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ message, code: businessCode, statusCode: status }, status);
  }
}
