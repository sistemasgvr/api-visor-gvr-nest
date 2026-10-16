import type { Token3LeggedResponse } from './autodesk.types';

/** Contrato de integración limitado a la capacidad Issues. */
export interface AutodeskIssuesPort {
  actualizarIncidencia(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any>;
  crearAdjunto(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any>;
  crearComentario(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any>;
  crearIncidencia(
    accessToken: string,
    projectId: string,
    data: Record<string, any>,
  ): Promise<any>;
  eliminarAdjunto(
    accessToken: string,
    projectId: string,
    issueId: string,
    attachmentId: string,
  ): Promise<any>;
  esTokenExpirado(expiraEn: Date | string): boolean;
  obtenerAdjuntos(
    accessToken: string,
    projectId: string,
    issueId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerAdjuntosBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerCategoriasRaiz(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerComentarios(
    accessToken: string,
    projectId: string,
    issueId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerDefinicionesAtributos(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerIncidenciaPorId(
    accessToken: string,
    projectId: string,
    issueId: string,
  ): Promise<any>;
  obtenerIncidencias(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerMapeosAtributos(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerPerfilUsuario(accessToken: string, projectId: string): Promise<any>;
  obtenerTiposIncidencias(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerUrlMiniatura(accessToken: string, snapshotUrn: string): Promise<any>;
  refrescarToken(refreshToken: string): Promise<Token3LeggedResponse>;
  subirMiniaturaIssue(
    accessToken: string,
    projectId: string,
    content: Buffer | string,
    filename: string,
    contentType: string,
  ): Promise<{ success: boolean; urn?: string; error?: string }>;
}
