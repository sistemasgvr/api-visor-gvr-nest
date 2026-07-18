import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import type {
  IControlOperativoRepository,
  ReporteHorasTrabajadorRangoParams,
  ReporteHorasTrabajadorRangoResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { ROLES_ADMIN_CONTROL_OPERATIVO } from '../../../domain/constants/auth-role.constants';

export interface ListarReporteHorasMesProyectoTrabajadorInput
  extends ReporteHorasTrabajadorRangoParams {
  idUsuario: number;
  /** IDs de roles considerados admin (enviados por el front desde ROLES_ADMIN_CONTROL_OPERATIVO). */
  rolesAdminPermitidos: number[];
}

@Injectable()
export class ListarReporteHorasMesProyectoTrabajadorUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    input: ListarReporteHorasMesProyectoTrabajadorInput,
  ): Promise<ReporteHorasTrabajadorRangoResult> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(
      input.idUsuario,
    );
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new ForbiddenException(
        'Solo administradores pueden acceder a este reporte',
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
      throw new ForbiddenException(
        'Solo administradores pueden acceder a este reporte',
      );
    }
    return this.controlOperativoRepository.listarReporteHorasDedicadasRangoPorTrabajador(
      {
        fechaInicio: input.fechaInicio,
        fechaFin: input.fechaFin,
        idTrabajadores: input.idTrabajadores ?? null,
        idProyectos: input.idProyectos ?? null,
        idEstadosActividad: input.idEstadosActividad ?? null,
        horasMetaDia: input.horasMetaDia,
      },
    );
  }
}
