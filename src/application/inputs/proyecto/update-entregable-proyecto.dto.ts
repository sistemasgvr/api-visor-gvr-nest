export class UpdateEntregableProyectoDto {
  nombre: string;

  color?: string | null;

  descripcion?: string;

  idEstado?: number;

  fechaEstimada?: string;

  fechaEntrega?: string;

  idTrabajadoresResponsables?: number[];

  idTrabajadorResponsable?: number;
  revisionPlan?: number;
  motivo?: string;
  orden?: number;
}
