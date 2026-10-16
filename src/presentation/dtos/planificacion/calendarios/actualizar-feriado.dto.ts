import { IntersectionType } from '@nestjs/swagger';
import { CrearFeriadoDto } from './crear-feriado.dto';
import { RevisionCalendarioDto } from './revision-calendario.dto';

export class ActualizarFeriadoDto extends IntersectionType(
  CrearFeriadoDto,
  RevisionCalendarioDto,
) {}
