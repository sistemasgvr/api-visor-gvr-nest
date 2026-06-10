import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MailTemplateVariableDto } from './mail-template-variable.dto';

export class CreateMailPlantillaDto {
  @ApiProperty({ example: 'welcome' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug debe ser kebab-case (ej. reset-password)',
  })
  slug!: string;

  @ApiProperty({ example: 'Bienvenida' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre!: string;

  @ApiProperty({ example: 'Bienvenido a {{appName}}' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  asuntoPlantilla!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'MJML (GrapesJS). Si se envía, se compila a HTML.' })
  @IsOptional()
  @IsString()
  cuerpoMjml?: string;

  @ApiPropertyOptional({ description: 'HTML ya compilado (opcional si hay MJML)' })
  @IsOptional()
  @IsString()
  cuerpoHtml?: string;

  @ApiPropertyOptional({ description: 'Proyecto GrapesJS (JSON)' })
  @IsOptional()
  @IsObject()
  designJson?: Record<string, unknown>;

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

  @ApiPropertyOptional({ default: 'base' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  claveLayout?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  esSistema?: boolean;
}
