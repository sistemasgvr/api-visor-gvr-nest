/** Contrato de integración limitado a la capacidad Bim360. */
export interface AutodeskBim360Port {
  actualizarAdjuntoBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    attachmentId: string,
    data: Record<string, any>,
  ): Promise<any>;
  actualizarIncidenciaBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any>;
  crearAdjuntoBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any>;
  crearComentarioBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any>;
  crearIncidenciaBim360(
    accessToken: string,
    projectId: string,
    data: Record<string, any>,
  ): Promise<any>;
  obtenerAdjuntosBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerCategoriasRaizBim360(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerComentariosBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerDefinicionesAtributosBim360(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerIncidenciaPorIdBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
  ): Promise<any>;
  obtenerIncidenciasBim360(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerMapeosAtributosBim360(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerPerfilUsuarioBim360(
    accessToken: string,
    projectId: string,
  ): Promise<any>;
  obtenerTiposIncidenciasBim360(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
}
