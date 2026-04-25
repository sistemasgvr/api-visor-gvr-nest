export interface IAuditoriaRepository {
  listarAuditorias(
    idUsuario: number | null,
    accion: string | null,
    entidad: string | null,
    fechaDesde: string | null,
    fechaHasta: string | null,
    limit: number,
    offset: number,
  ): Promise<any[]>;

  obtenerAuditoriaPorId(id: number): Promise<any | null>;

  obtenerHistorialEntidad(entidad: string, identidad: string): Promise<any[]>;

  obtenerAuditoriaPorMetadatos(
    entidad: string,
    accion: string,
    metadatoKey: string,
    metadatoValue: string,
  ): Promise<any | null>;

  obtenerHistorialUsuario(
    idUsuario: number,
    limit: number,
    offset: number,
  ): Promise<any[]>;

  obtenerEstadisticas(
    fechaDesde: string | null,
    fechaHasta: string | null,
  ): Promise<any | null>;

  obtenerAuditoriasPorItemId(itemId: string): Promise<any[]>;

  obtenerAuditoriasPorFolderId(folderId: string): Promise<any[]>;

  /** Registros de auditoría cuyo metadatos apunta a una incidencia ACC (accIssueId o issueId) */
  obtenerAuditoriasPorAccIssueId(
    issueId: string,
    limit?: number,
  ): Promise<any[]>;

  registrarAccion(
    idUsuario: number,
    accion: string,
    entidad: string,
    identidad: string | null,
    descripcion: string | null,
    datosAnteriores: any | null,
    datosNuevos: any | null,
    ipAddress: string,
    userAgent: string,
    metadatos: any,
    idEmpresaUsuario?: number | null,
    nombreEmpresaUsuario?: string | null,
  ): Promise<any>;
}

export const AUDITORIA_REPOSITORY = Symbol('AUDITORIA_REPOSITORY');
