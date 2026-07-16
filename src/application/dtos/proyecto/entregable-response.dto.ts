import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ID_ESTADO_ENTREGABLE_PROCESO } from '../../../domain/constants/estado-entregable.constants';

/** Item devuelto en listado y detalle de entregables */
export class EntregableItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10 })
  idproyecto: number;

  @ApiPropertyOptional({ example: 'Proyecto Torre Norte' })
  nombreproyecto?: string;

  @ApiProperty({ example: 'Entrega fase 1' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Descripción del entregable' })
  descripcion?: string;

  @ApiProperty({ example: ID_ESTADO_ENTREGABLE_PROCESO })
  idestado: number;

  @ApiPropertyOptional({ example: 'PROCESO' })
  estadonombre?: string;

  @ApiPropertyOptional({ example: '2026-06-15T00:00:00.000Z' })
  fechaestimada?: string;

  @ApiPropertyOptional({ example: null })
  fechaentrega?: string;

  @ApiProperty({ example: 1 })
  estado: number;

  @ApiPropertyOptional()
  fechacreacion?: string;

  @ApiPropertyOptional()
  fechamodificacion?: string;

  @ApiPropertyOptional({ example: 1 })
  idusuariocreacion?: number;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  nombreusuariocreacion?: string;

  @ApiPropertyOptional({ example: 1 })
  idusuariomodificacion?: number;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  nombreusuariomodificacion?: string;

  @ApiPropertyOptional({
    example: 42,
    description: 'ID del responsable principal (atajo v1)',
  })
  idtrabajadorresponsable?: number | null;

  @ApiPropertyOptional({
    example: 'Carlos Frontado',
    description: 'Nombre del responsable principal',
  })
  nombretrabajadorresponsable?: string | null;

  @ApiPropertyOptional({
    description: 'Lista de responsables activos (preparado para multi-asignación)',
    type: 'array',
    example: [
      {
        idtrabajador: 42,
        nombretrabajador: 'Carlos Frontado',
        esprincipal: true,
      },
    ],
  })
  responsables?: Array<{
    idtrabajador: number;
    nombretrabajador: string;
    esprincipal: boolean;
  }>;
}

export class EntregableMutationResultDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Entregable creado exitosamente' })
  message: string;

  @ApiPropertyOptional({ example: 12, description: 'Solo en crear' })
  id?: number;
}

export class EntregablesPaginationDto {
  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 3 })
  total_pages: number;

  @ApiProperty({ example: 1 })
  current_page: number;
}

export class ListarEntregablesDataDto {
  @ApiProperty({ type: [EntregableItemDto] })
  data: EntregableItemDto[];

  @ApiProperty({ type: EntregablesPaginationDto })
  pagination: EntregablesPaginationDto;
}

/** Opción { value, label } para CustomSelectSearch */
export class EntregableSelectOptionDto {
  @ApiProperty({ example: 12, description: 'ID del entregable' })
  value: number;

  @ApiProperty({ example: 'Entrega fase 1 (PROCESO)' })
  label: string;
}
