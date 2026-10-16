import { IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CrearVersionCalendarioDto } from './crear-version-calendario.dto';

export class DuplicarCalendarioDto extends CrearVersionCalendarioDto {
  @ApiProperty({
    maxLength: 120,
    description:
      'Nombre del nuevo calendario. El origen puede ser borrador o publicación.',
  })
  @IsString()
  @Matches(/\S/u)
  @MaxLength(120)
  nombre: string;
}
