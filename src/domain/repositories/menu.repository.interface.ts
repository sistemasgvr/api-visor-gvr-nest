export interface IMenuRepository {
  listarMenuOpciones(): Promise<any[]>;
  obtenerMenuOpcionPorId(id: number): Promise<any>;
  obtenerOpcionesPorLista(idLista: number): Promise<any[]>;
  /** Resuelve genListado.id por nombre exacto (catálogos dinámicos, p. ej. Puesto de trabajo). */
  obtenerIdListaPorNombre(nombre: string): Promise<number | null>;
  listarMenuRecursivo(idUsuario: number): Promise<any>;
  crearOpcionLista(idLista: number, nombre: string): Promise<any>;
}

export const MENU_REPOSITORY = 'MENU_REPOSITORY';
