/** Item devuelto en listado y detalle de entregables */
export class EntregableItemDto {
  id: number;

  idproyecto: number;

  nombreproyecto?: string;

  nombre: string;

  descripcion?: string;

  idestado: number;

  estadonombre?: string;

  fechaestimada?: string;

  fechaentrega?: string;

  estado: number;

  fechacreacion?: string;

  fechamodificacion?: string;

  idusuariocreacion?: number;

  nombreusuariocreacion?: string;

  fotoperfilusuariocreacion?: string | null;

  idusuariomodificacion?: number;

  nombreusuariomodificacion?: string;

  idtrabajadorresponsable?: number | null;

  nombretrabajadorresponsable?: string | null;

  responsables?: Array<{
    idtrabajador: number;
    nombretrabajador: string;
    esprincipal: boolean;
  }>;
}

export class EntregableMutationResultDto {
  success: boolean;

  message: string;

  id?: number;
}

export class EntregablesPaginationDto {
  total: number;

  limit: number;

  offset: number;

  total_pages: number;

  current_page: number;
}

export class EntregableConteoEstadoDto {
  idestado: number;

  estadonombre: string;

  cantidad: number;
}

export class ListarEntregablesDataDto {
  data: EntregableItemDto[];

  pagination: EntregablesPaginationDto;

  conteosPorEstado: EntregableConteoEstadoDto[];
}

/** Opción { value, label } para CustomSelectSearch */
export class EntregableSelectOptionDto {
  value: number;

  label: string;
}
