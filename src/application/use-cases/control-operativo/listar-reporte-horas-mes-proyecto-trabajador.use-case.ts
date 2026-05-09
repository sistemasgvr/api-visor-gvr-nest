import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type {
  IControlOperativoRepository,
  ReporteHorasTrabajadorMesProyectoParams,
  ReporteHorasTrabajadorMesProyectoResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';

export interface ListarReporteHorasMesProyectoTrabajadorInput
  extends ReporteHorasTrabajadorMesProyectoParams {
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
  ): Promise<ReporteHorasTrabajadorMesProyectoResult> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(
      input.idUsuario,
    );
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new UnauthorizedException(
        'Solo administradores pueden acceder a este reporte',
      );
    }
    const rolesIds = (perfil.roles as { id?: number }[])
      .map((r) => r?.id)
      .filter((id): id is number => id != null);
    const permitidos = input.rolesAdminPermitidos?.length
      ? input.rolesAdminPermitidos
      : [1, 5, 11];
    const esAdmin = permitidos.some((id) => rolesIds.includes(id));
    if (!esAdmin) {
      throw new UnauthorizedException(
        'Solo administradores pueden acceder a este reporte',
      );
    }
    return this.controlOperativoRepository.listarReporteHorasDedicadasMesPorProyectoTrabajador(
      {
        anio: input.anio,
        mes: input.mes,
        idTrabajadores: input.idTrabajadores ?? null,
        idProyectos: input.idProyectos ?? null,
        idEstadosActividad: input.idEstadosActividad ?? null,
        horasMetaDia: input.horasMetaDia,
      },
    );
  }
}
