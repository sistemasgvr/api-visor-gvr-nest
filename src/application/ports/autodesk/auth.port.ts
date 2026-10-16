import type {
  Token2LeggedResponse,
  Token3LeggedResponse,
} from './autodesk.types';

/** Contrato de integración limitado a la capacidad Auth. */
export interface AutodeskAuthPort {
  actualizarImagenProyectoBim360(
    accessToken: string,
    accountId: string,
    projectId: string,
    imageData: string,
    region?: string,
  ): Promise<any>;
  actualizarProyectoBim360(
    accessToken: string,
    accountId: string,
    projectId: string,
    updateData: Record<string, any>,
    region?: string,
  ): Promise<any>;
  crearProyectoBim360(
    accessToken: string,
    accountId: string,
    projectData: Record<string, any>,
    region?: string,
  ): Promise<any>;
  esTokenExpirado(expiraEn: Date | string): boolean;
  generarUrlAutorizacion(scopes: string[], state: string): string;
  intercambiarCodigoPorToken(code: string): Promise<Token3LeggedResponse>;
  obtenerIssueContainerId(
    accessToken: string,
    accountId: string,
    projectId: string,
  ): Promise<any>;
  obtenerManifiesto(urn: string): Promise<any>;
  obtenerMetadatos(urn: string): Promise<any>;
  obtenerProyectoPorIdLegacy(
    accessToken: string,
    accountId: string,
    projectId: string,
    region?: string,
  ): Promise<any>;
  obtenerProyectoPorIdNew(
    accessToken: string,
    accountId: string,
    projectId: string,
  ): Promise<any>;
  obtenerProyectosLegacy(
    accessToken: string,
    accountId: string,
    filters?: Record<string, any>,
    region?: string,
  ): Promise<any>;
  obtenerProyectosNew(
    accessToken: string,
    accountId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerToken2Legged(scopes: string[]): Promise<Token2LeggedResponse>;
  refrescarToken(refreshToken: string): Promise<Token3LeggedResponse>;
}
