export class CreateContratoTrabajadorDto {
  idTipoContrato: number;

  idDuracionContrato?: number;

  fechaInicio?: string;

  fechaFin?: string;

  remuneracion?: number;

  fechaInicioLabores?: string;

  idPuestoTrabajo?: number;
}
