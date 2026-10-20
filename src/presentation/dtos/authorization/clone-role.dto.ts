import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CloneRoleDto {
  @ApiProperty({ example: 'COORDINADOR BIM (copia)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Mismos permisos que Coordinador BIM' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}
