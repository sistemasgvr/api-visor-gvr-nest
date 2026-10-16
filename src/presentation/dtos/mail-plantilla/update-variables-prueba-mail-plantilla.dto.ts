import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVariablesPruebaMailPlantillaDto {
  @ApiProperty({
    description: 'Objeto JSON con variables de prueba para vista previa',
    example: { name: 'Juan', appName: 'GVR' },
  })
  @IsObject()
  variablesPrueba!: Record<string, unknown>;
}
