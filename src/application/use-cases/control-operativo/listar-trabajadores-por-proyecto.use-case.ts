import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import {
  AuthRole,
  ROLES_ADMIN_CONTROL_OPERATIVO,
} from '../../../domain/constants/auth-role.constants';
import type { TrabajadorPorProyectoItem } from '../../../domain/repositories/control-operativo.repository.interface';

export interface ListarTrabajadoresPorProyectoInput {
  idUsuario: number;
  idProyecto: number;
  /** IDs de roles considerados admin (Desempeño / reportes). */
  rolesAdminPermitidos: number[];
}

/** Roles que pueden usar esta lista (admin, coordinador o colaborador de entregables). */
const ROLES_ACCESO_LISTA_TRABAJADORES_PROYECTO: number[] = [
  ...ROLES_ADMIN_CONTROL_OPERATIVO,
  AuthRole.Coordinador,
  AuthRole.Modelador,
  AuthRole.DesarrolladorWeb,
];

@Injectable()
export class ListarTrabajadoresPorProyectoUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    input: ListarTrabajadoresPorProyectoInput,
  ): Promise<TrabajadorPorProyectoItem[]> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(
      input.idUsuario,
    );
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new ForbiddenException(
        'No tienes permiso para listar trabajadores del proyecto',
      );
    }
    const rolesIds = (perfil.roles as { id?: number }[])
      .map((r) => r?.id)
      .filter((id): id is number => id != null);

    const puedeAcceder = ROLES_ACCESO_LISTA_TRABAJADORES_PROYECTO.some((id) =>
      rolesIds.includes(id),
    );
    if (!puedeAcceder) {
      throw new ForbiddenException(
        'No tienes permiso para listar trabajadores del proyecto',
      );
    }

    const permitidosAdmin = input.rolesAdminPermitidos?.length
      ? input.rolesAdminPermitidos
      : [...ROLES_ADMIN_CONTROL_OPERATIVO];
    const esAdmin = permitidosAdmin.some((id) => rolesIds.includes(id));
    const esCoordinador = rolesIds.includes(AuthRole.Coordinador);

    const yo = this.trabajadorDesdePerfil(perfil);

    // Colaborador (modelador / desarrollador): solo se ve a sí mismo para autoasignarse.
    if (!esAdmin && !esCoordinador) {
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
