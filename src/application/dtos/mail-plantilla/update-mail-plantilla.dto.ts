import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MailTemplateVariableDto } from './mail-template-variable.dto';

export class UpdateMailPlantillaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  asuntoPlantilla?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cuerpoMjml?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cuerpoHtml?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  designJson?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: [MailTemplateVariableDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MailTemplateVariableDto)
  esquemaVariables?: MailTemplateVariableDto[];

  @ApiPropertyOptional({
    description: 'Valores JSON para vista previa / envío de prueba en el editor admin',
    example: { name: 'Juan', appName: 'GVR' },
  })
  @IsOptional()
  @IsObject()
  variablesPrueba?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  claveLayout?: string;

  @ApiPropertyOptional({ enum: [0, 1] })
  @IsOptional()
  @IsInt()
  estado?: number;
}
