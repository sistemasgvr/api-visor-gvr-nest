import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type {
  IControlOperativoRepository,
  ReporteGeneralResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { ROLES_ADMIN_CONTROL_OPERATIVO } from '../../../domain/constants/auth-role.constants';

export interface ListarReporteGeneralInput {
  idUsuario: number;
  idTrabajadores?: number[] | null;
  idProyectos?: number[] | null;
  idEstadosActividad?: number[] | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  /** Coordinador de proyecto / responsable / coordinador en actividad (opcional). */
  idLiderEquipo?: number | null;
  limit?: number;
  offset?: number;
  /** IDs de roles considerados admin (enviados por el front desde ROLES_ADMIN_CONTROL_OPERATIVO). */
  rolesAdminPermitidos: number[];
}

@Injectable()
export class ListarReporteGeneralUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    input: ListarReporteGeneralInput,
  ): Promise<ReporteGeneralResult> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(
      input.idUsuario,
    );
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new UnauthorizedException(
        'Solo administradores pueden acceder al reporte general',
      );
    }
    const rolesIds = (perfil.roles as { id?: number }[])
      .map((r) => r?.id)
      .filter((id): id is number => id != null);
    const permitidos = input.rolesAdminPermitidos?.length
      ? input.rolesAdminPermitidos
      : [...ROLES_ADMIN_CONTROL_OPERATIVO];
    const esAdmin = permitidos.some((id) => rolesIds.includes(id));
    if (!esAdmin) {
      throw new UnauthorizedException(
        'Solo administradores pueden acceder al reporte general',
      );
    }
    return this.controlOperativoRepository.listarReporteGeneral({
      idTrabajadores: input.idTrabajadores ?? null,
      idProyectos: input.idProyectos ?? null,
      idEstadosActividad: input.idEstadosActividad ?? null,
      fechaInicio: input.fechaInicio ?? null,
      fechaFin: input.fechaFin ?? null,
      idLiderEquipo: input.idLiderEquipo ?? null,
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
    });
  }
}
