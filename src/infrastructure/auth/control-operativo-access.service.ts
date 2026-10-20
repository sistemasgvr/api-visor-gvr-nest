import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthorizationScope } from '../../application/ports/authorization.port';
import { AuthorizationService } from '../../application/services/authorization.service';
import { DatabaseFunctionService } from '../database/database-function.service';

const denied = () =>
  new ForbiddenException({
    message: 'No tienes permiso para realizar esta acción',
    code: 'GRANULAR_PERMISSION_DENIED',
  });

/**
 * Reglas de alcance de Control operativo con datos del servidor:
 * propios = el trabajador del usuario; asignados = su equipo (`con_EquipoTrabajador`) y
 * los proyectos que coordina o a los que tiene acceso; todos = cualquiera.
 */
@Injectable()
export class ControlOperativoAccess {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly database: DatabaseFunctionService,
  ) {}

  scopes(userId: number, code: string): Promise<AuthorizationScope[]> {
    return this.authorization.scopesFor(userId, code);
  }

  async trabajadorDe(userId: number): Promise<number | null> {
    const [row] = await this.database.executeQuery<{ id: number }>(
      'SELECT t.id FROM public.tratrabajador t WHERE t.idusuario=$1 AND t.estado=1 ORDER BY t.id LIMIT 1',
      [userId],
    );
    return row ? Number(row.id) : null;
  }

  async equipo(userId: number): Promise<number[]> {
    const yo = await this.trabajadorDe(userId);
    if (yo == null) return [];
    const rows = await this.database.executeQuery<{ idtrabajador: number }>(
      'SELECT eq.idtrabajador FROM public."con_EquipoTrabajador"($1) eq',
      [yo],
    );
    return rows.map((r) => Number(r.idtrabajador));
  }

  /** Trabajadores sobre los que puede actuar con la acción (`null` = todos). */
  async trabajadoresPermitidos(
    userId: number,
    code: string,
  ): Promise<number[] | null> {
    const scopes = await this.scopes(userId, code);
    if (scopes.includes('todos')) return null;
    const ids = new Set<number>();
    if (scopes.includes('propios')) {
      const yo = await this.trabajadorDe(userId);
      if (yo != null) ids.add(yo);
    }
    if (scopes.includes('asignados'))
      for (const id of await this.equipo(userId)) ids.add(id);
    return [...ids];
  }

  async trabajadorPermitido(
    userId: number,
    code: string,
    idTrabajador: number,
  ): Promise<boolean> {
    const permitidos = await this.trabajadoresPermitidos(userId, code);
    return permitidos === null || permitidos.includes(Number(idTrabajador));
  }

  async exigirTrabajador(userId: number, code: string, idTrabajador: number) {
    if (!(await this.trabajadorPermitido(userId, code, idTrabajador)))
      throw denied();
  }

  async trabajadorDeJornada(idJornada: number): Promise<number | null> {
    const [row] = await this.database.executeQuery<{ idtrabajador: number }>(
      'SELECT j.idtrabajador FROM public.conjornada j WHERE j.id=$1 AND j.estado=1',
      [idJornada],
    );
    return row ? Number(row.idtrabajador) : null;
  }

  async trabajadorDeActividad(idActividad: number): Promise<number | null> {
    const [row] = await this.database.executeQuery<{ idtrabajador: number }>(
      'SELECT a.idtrabajador FROM public.conactividad a WHERE a.id=$1 AND a.estado=1',
      [idActividad],
    );
    return row ? Number(row.idtrabajador) : null;
  }

  /** Proyectos de empresa asignados al usuario (coordina, tiene acceso o ligados a su equipo directo). */
  async proyectosAsignados(userId: number): Promise<number[]> {
    const yo = await this.trabajadorDe(userId);
    if (yo == null) return [];
    const rows = await this.database.executeQuery<{ idproyecto: number }>(
      'SELECT p.idproyecto FROM public."pro_ListarProyectosAccesoTrabajador"($1, false, false) p',
      [yo],
    );
    return rows.map((r) => Number(r.idproyecto));
  }

  /** Proyectos permitidos para la acción: `null` con «todos»; si no, los asignados. */
  async proyectosPermitidos(
    userId: number,
    code: string,
  ): Promise<number[] | null> {
    const scopes = await this.scopes(userId, code);
    if (scopes.includes('todos')) return null;
    if (!scopes.length) return [];
    return this.proyectosAsignados(userId);
  }

  static denied = denied;
}
