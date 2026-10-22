import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CloneRoleDto {
  static readonly schema: z.ZodType<CloneRoleDto> = defineZodDto<CloneRoleDto>(
    'CloneRoleDto',
    {
      nombre: {
        schema: z.string().min(1).max(255),
        example: 'COORDINADOR BIM (copia)',
      },
      descripcion: {
        schema: z.string().max(500),
        optional: true,
        example: 'Mismos permisos que Coordinador BIM',
      },
    },
  );

  @ApiProperty({ example: 'COORDINADOR BIM (copia)' })
  nombre!: string;

  @ApiPropertyOptional({ example: 'Mismos permisos que Coordinador BIM' })
  descripcion?: string;
}
