export interface IUbicacionRepository {
  listarPaises(): Promise<any[]>;
  listarDepartamentos(idPais?: number): Promise<any[]>;
  listarProvincias(idDepartamento?: number): Promise<any[]>;
  listarDistritos(idProvincia?: number): Promise<any[]>;
}
export const UBICACION_REPOSITORY = Symbol('UBICACION_REPOSITORY');
