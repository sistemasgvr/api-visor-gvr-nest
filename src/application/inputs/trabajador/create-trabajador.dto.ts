export class CreateTrabajadorDto {
  nombres: string;
  apellidos: string;
  idTipoDocumento: number;
  nroDocumento: string;
  correo: string;
  idEmpresa: number;

  idResponsable?: number;
  idRol?: number;

  fechaNacimiento?: string;
  celular?: string;
  telefonoEmergencia?: string;
  contactoEmergenciaNombre?: string;

  idContactoEmergenciaParentesco?: number;
  direccionDomiciliaria?: string;
  observaciones?: string;
  idPais?: number;
  idDepartamento?: number;
  idProvincia?: number;
  idDistrito?: number;
  nroRuc?: string;
  idGradoInstruccion?: number;
  idCarrera?: number;
  idEntidadBancaria?: number;
  nroCuentaCorriente?: string;
  nroCci?: string;
  remuneracion?: number;
  idTipoContrato?: number;
  idDuracionContrato?: number;

  fechaInicioLabores?: string;

  fechaInicioContrato?: string;

  fechaFinContrato?: string;
  idModalidad?: number;
  idCalendario?: number | null;
  idPuestoTrabajo?: number;
  adjuntos?: { idTipoAdjunto: number; ruta: string }[];
}
