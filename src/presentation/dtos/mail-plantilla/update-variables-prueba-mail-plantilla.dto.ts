import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateVariablesPruebaMailPlantillaDto {
  static readonly schema: z.ZodType<UpdateVariablesPruebaMailPlantillaDto> =
    defineZodDto<UpdateVariablesPruebaMailPlantillaDto>(
      'UpdateVariablesPruebaMailPlantillaDto',
      {
        variablesPrueba: {
          schema: z.record(z.string(), z.unknown()),
          description: 'Objeto JSON con variables de prueba para vista previa',
          example: { name: 'Juan', appName: 'GVR' },
        },
      },
    );

  @ApiProperty({
    description: 'Objeto JSON con variables de prueba para vista previa',
    example: { name: 'Juan', appName: 'GVR' },
  })
  variablesPrueba!: Record<string, unknown>;
}
