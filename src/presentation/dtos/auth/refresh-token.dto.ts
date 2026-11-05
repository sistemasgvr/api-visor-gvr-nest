import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';
// DTO vacío - el token viene en el header Authorization
export class RefreshTokenDto {
  static readonly schema: z.ZodType<RefreshTokenDto> =
    defineZodDto<RefreshTokenDto>('RefreshTokenDto', {});
}
