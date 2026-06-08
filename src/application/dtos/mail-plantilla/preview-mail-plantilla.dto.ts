import { IsEmail, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PreviewMailPlantillaDto {
  @ApiPropertyOptional({
    description: 'ID de plantilla guardada. Si se omite, usar slug o cuerpo inline.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @ApiPropertyOptional({ example: 'welcome' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  asuntoPlantilla?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cuerpoMjml?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cuerpoHtml?: string;

  @ApiPropertyOptional({ default: 'base' })
  @IsOptional()
  @IsString()
  claveLayout?: string;

  @ApiPropertyOptional({
    description: 'Variables Handlebars para la vista previa',
    example: { name: 'Juan', appName: 'GVR' },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;
}

export class TestSendMailPlantillaDto extends PreviewMailPlantillaDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombreDestinatario?: string;
}
