export class CreateEntregableProyectoDto {
  idProyecto: number;

  nombre: string;

  descripcion?: string;

  idEstado?: number;

  fechaEstimada?: string;

  fechaEntrega?: string;

  idTrabajadoresResponsables?: number[];

  idTrabajadorResponsable?: number;
}
