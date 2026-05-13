export class Empresa {
  id: number;
  razonSocial: string;
  nombreComercial?: string;
  idTipoDocumento: number;
  nroDocumento: string;
  celularEmpresa?: string | null;
  correoEmpresa?: string | null;
  urlLogo?: string | null;
  estado: number;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  idUsuarioCreacion?: number;
  idUsuarioModificacion?: number;

  constructor(data: Partial<Empresa>) {
    Object.assign(this, data);
  }
}
