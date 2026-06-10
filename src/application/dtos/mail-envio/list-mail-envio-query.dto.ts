import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmptyStringToUndefined } from '../common/empty-string-to-undefined.transform';

export class ListMailEnvioCoberturaQueryDto {
  @ApiProperty({ example: 'welcome' })
  @IsString()
  templateId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @EmptyStringToUndefined()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional({
    enum: ['sent', 'failed', 'skipped', 'no_enviado', 'no_aplica'],
  })
  @IsOptional()
  @EmptyStringToUndefined()
  @IsString()
  @IsIn(['sent', 'failed', 'skipped', 'no_enviado', 'no_aplica'])
  estadoEnvio?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class ListMailEnvioLogsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @EmptyStringToUndefined()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @EmptyStringToUndefined()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional({ enum: ['sent', 'failed', 'skipped'] })
  @IsOptional()
  @EmptyStringToUndefined()
  @IsString()
  @IsIn(['sent', 'failed', 'skipped'])
  status?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
