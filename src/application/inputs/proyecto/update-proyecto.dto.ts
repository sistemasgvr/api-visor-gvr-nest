export class UpdateProyectoDto {
  nombreProyecto: string;

  nroProyecto: string;

  idTipoProyecto: number;

  idPais: number;

  direccion1?: string;

  direccion2?: string;

  ciudad?: string;

  provincia?: string;

  codigoPostal?: string;

  idZonaHoraria?: number;

  fechaInicio?: string;

  fechaFinalizacion?: string;

  valorProyecto?: number;

  idTipoMoneda?: number;

  diaValorizar?: number;

  idCliente?: number;

  observaciones?: string;

  idModalidad?: number;

  idEstadoProyecto?: number;

  idEstadoCotizacion?: number;
  idCalendario?: number | null;
  revisionPlan?: number;
  motivo?: string;
}
