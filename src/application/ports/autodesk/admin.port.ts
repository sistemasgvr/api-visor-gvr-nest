import type { UploadedFile } from '../uploaded-file';
import type { Token2LeggedResponse } from './autodesk.types';

/** Contrato de integración limitado a la capacidad Admin. */
export interface AutodeskAdminPort {
  actualizarCompany(
    accessToken: string,
    accountId: string,
    companyId: string,
    updateData: Record<string, any>,
    region?: string,
  ): Promise<any>;
  actualizarUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
    userData: Record<string, any>,
    region?: string,
  ): Promise<any>;
  actualizarUsuarioProyecto(
    accessToken: string,
    projectId: string,
    projectUserId: string,
    userData: Record<string, any>,
    region?: string,
    userId?: string,
  ): Promise<any>;
  agregarUsuarioProyecto(
    accessToken: string,
    projectId: string,
    userData: Record<string, any>,
    region?: string,
    userId?: string,
  ): Promise<any>;
  buscarBusinessUnits(
    accessToken: string,
    accountId: string,
    searchTerm: string,
    region?: string,
  ): Promise<any>;
  buscarCompanies(
    accessToken: string,
    accountId: string,
    searchTerm: string,
    params?: Record<string, any>,
    region?: string,
  ): Promise<any>;
  buscarUsuarios(
    accessToken: string,
    accountId: string,
    searchTerm: string,
    filters?: Record<string, any>,
    region?: string,
  ): Promise<any>;
  buscarUsuariosProyecto(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
    region?: string,
    userId?: string,
  ): Promise<any>;
  crearCompany(
    accessToken: string,
    accountId: string,
    companyData: Record<string, any>,
    region?: string,
  ): Promise<any>;
  crearOActualizarBusinessUnits(
    accessToken: string,
    accountId: string,
    businessUnits: any[],
    region?: string,
  ): Promise<any>;
  crearUsuario(
    accessToken: string,
    accountId: string,
    userData: Record<string, any>,
    region?: string,
  ): Promise<any>;
  createAccProject(
    accountId: string,
    projectData: Record<string, any>,
    token?: string,
    userId?: string,
  ): Promise<any>;
  eliminarUsuarioProyecto(
    accessToken: string,
    projectId: string,
    projectUserId: string,
    region?: string,
    userId?: string,
  ): Promise<any>;
  esTokenExpirado(expiraEn: Date | string): boolean;
  getAccProjectById(
    projectId: string,
    fields?: string[],
    token?: string,
  ): Promise<any>;
  getAccProjects(
    accountId: string,
    options?: Record<string, any>,
    token?: string,
  ): Promise<any>;
  importarCompanies(
    accessToken: string,
    accountId: string,
    companies: any[],
    region?: string,
  ): Promise<any>;
  importarUsuarios(
    accessToken: string,
    accountId: string,
    users: any[],
    region?: string,
  ): Promise<any>;
  importarUsuariosProyecto(
    accessToken: string,
    projectId: string,
    users: any[],
    region?: string,
    userId?: string,
  ): Promise<any>;
  obtenerArbolBusinessUnits(
    accessToken: string,
    accountId: string,
    region?: string,
  ): Promise<any>;
  obtenerBusinessUnitPorId(
    accessToken: string,
    accountId: string,
    businessUnitId: string,
    region?: string,
  ): Promise<any>;
  obtenerBusinessUnits(
    accessToken: string,
    accountId: string,
    region?: string,
  ): Promise<any>;
  obtenerBusinessUnitsHijas(
    accessToken: string,
    accountId: string,
    parentId?: string,
    region?: string,
  ): Promise<any>;
  obtenerCompanies(
    accessToken: string,
    accountId: string,
    params?: Record<string, any>,
    region?: string,
  ): Promise<any>;
  obtenerCompaniesPorProyecto(
    accessToken: string,
    accountId: string,
    projectId: string,
    params?: Record<string, any>,
    region?: string,
  ): Promise<any>;
  obtenerCompanyPorId(
    accessToken: string,
    accountId: string,
    companyId: string,
    region?: string,
  ): Promise<any>;
  obtenerProductosUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
    region?: string,
  ): Promise<any>;
  obtenerProyectosUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
    filters?: Record<string, any>,
    region?: string,
  ): Promise<any>;
  obtenerRolesUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
    region?: string,
  ): Promise<any>;
  obtenerToken2Legged(scopes: string[]): Promise<Token2LeggedResponse>;
  obtenerUsuarioPorId(
    accessToken: string,
    accountId: string,
    userId: string,
    region?: string,
  ): Promise<any>;
  obtenerUsuarioProyectoPorId(
    accessToken: string,
    projectId: string,
    projectUserId: string,
    region?: string,
    userId?: string,
  ): Promise<any>;
  obtenerUsuarios(
    accessToken: string,
    accountId: string,
    filters?: Record<string, any>,
    region?: string,
  ): Promise<any>;
  obtenerUsuariosProyecto(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
    region?: string,
    userId?: string,
  ): Promise<any>;
  subirImagenCompany(
    accessToken: string,
    accountId: string,
    companyId: string,
    file: UploadedFile,
    region?: string,
  ): Promise<any>;
  updateAccProject(
    accountId: string,
    projectId: string,
    projectData: Record<string, any>,
    token?: string,
    userId?: string,
  ): Promise<any>;
  uploadAccProjectImage(
    accountId: string,
    projectId: string,
    file: UploadedFile,
    token?: string,
  ): Promise<any>;
}
