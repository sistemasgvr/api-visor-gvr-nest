import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import type {
  IControlOperativoRepository,
  TrabajadorPorProyectoItem,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { ForbiddenError } from '../../errors/application.error';

export interface ListarTrabajadoresPorProyectoInput {
  idUsuario: number;
  idProyecto: number;
  /**
   * true si el permiso de la pantalla (desempeño / entregables) alcanza a todo el proyecto:
   * «todos», o «asignados» en un proyecto de su ámbito. Si no, sólo la propia persona.
   */
  verProyecto: boolean;
}

export class ListarTrabajadoresPorProyectoUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,

    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    input: ListarTrabajadoresPorProyectoInput,
  ): Promise<TrabajadorPorProyectoItem[]> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(
      input.idUsuario,
    );
    if (!perfil) {
      throw new ForbiddenError(
        'No tienes permiso para listar trabajadores del proyecto',
      );
    }

    const yo = this.trabajadorDesdePerfil(perfil);

    // Alcance propio: sólo se ve a sí mismo (p. ej. para autoasignarse un entregable).
    if (!input.verProyecto) {
      return yo ? [yo] : [];
    }

    const lista =
      await this.controlOperativoRepository.listarTrabajadoresPorProyecto(
        input.idProyecto,
      );

    if (!yo) return lista;
    if (lista.some((t) => Number(t.idtrabajador) === Number(yo.idtrabajador))) {
      return lista;
    }
    return [yo, ...lista];
  }

  private trabajadorDesdePerfil(
    perfil: Record<string, unknown>,
  ): TrabajadorPorProyectoItem | null {
    const raw = perfil.trabajador;
    const t = Array.isArray(raw) ? raw[0] : raw;
    if (t == null || typeof t !== 'object') return null;
    const row = t as {
      id?: number;
      nombres?: string | null;
      apellidos?: string | null;
    };
    if (row.id == null || Number(row.id) < 1) return null;
    const nombre = [row.nombres, row.apellidos]
      .map((x) => (x != null ? String(x).trim() : ''))
      .filter(Boolean)
      .join(' ')
      .trim();
    return {
      idtrabajador: Number(row.id),
      nombretrabajador: nombre || `Trabajador ${row.id}`,
    };
  }
}
