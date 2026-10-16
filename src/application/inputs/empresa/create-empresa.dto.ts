export class CreateEmpresaDto {
  razonSocial: string;

  nombreComercial?: string;

  idTipoDocumento: number;

  nroDocumento: string;

  celularEmpresa?: string;

  correoEmpresa?: string;

  urlLogo?: string;

  direccion?: string;

  idDepartamento?: number;

  idProvincia?: number;

  idDistrito?: number;
}
