import type {
  IProyectoRepository,
  ListarEntregablesProyectoParams,
} from '../../../domain/repositories/proyecto.repository.interface';
import { puedeGestionarEntregable } from './entregable-acceso.helper';

/** Alcances concedidos a la persona para editar y eliminar entregables (vacío: sin la acción). */
export interface GestionEntregablesAlcances {
  editar: readonly string[];
  eliminar: readonly string[];
}

export class ListarEntregablesProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  /**
   * Cada fila indica `puedeeditar` / `puedeeliminar` con la misma regla que exigen las
   * operaciones: «todos» cualquiera; «asignados» creador, responsable o coordinador.
   */
  async execute(
    params: ListarEntregablesProyectoParams,
    idUsuario?: number,
    esAdminSistemas = false,
    gestion: GestionEntregablesAlcances = { editar: [], eliminar: [] },
  ) {
    const result = await this.proyectoRepository.listarEntregablesProyecto({
      ...params,
      idUsuario,
      soloVigentes: params.soloVigentes ?? true,
      esAdminSistemas,
    });
    const permitido = async (
      alcances: readonly string[],
      entregable: Record<string, unknown>,
    ) =>
      idUsuario != null &&
      alcances.length > 0 &&
      puedeGestionarEntregable(this.proyectoRepository, {
        entregable,
        idUsuario,
        accesoTotal: alcances.includes('todos'),
      });
    const data = await Promise.all(
      result.data.map(async (entregable: Record<string, unknown>) => ({
        ...entregable,
        puedeeditar: await permitido(gestion.editar, entregable),
        puedeeliminar: await permitido(gestion.eliminar, entregable),
      })),
    );
    return { ...result, data };
  }
}
