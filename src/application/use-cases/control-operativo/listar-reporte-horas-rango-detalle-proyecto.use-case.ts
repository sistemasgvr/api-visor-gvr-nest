import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type {
  IControlOperativoRepository,
  ReporteHorasTrabajadorRangoDetalleProyectoParams,
  ReporteHorasRangoTrabajadorProyectoDetalleResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { ROLES_ADMIN_CONTROL_OPERATIVO } from '../../../domain/constants/auth-role.constants';

export interface ListarReporteHorasRangoDetalleProyectoInput
  extends ReporteHorasTrabajadorRangoDetalleProyectoParams {
  idUsuario: number;
  rolesAdminPermitidos: number[];
}

@Injectable()
export class ListarReporteHorasRangoDetalleProyectoUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    input: ListarReporteHorasRangoDetalleProyectoInput,
  ): Promise<ReporteHorasRangoTrabajadorProyectoDetalleResult> {
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
      : [...ROLES_ADMIN_CONTROL_OPERATIVO];
    const esAdmin = permitidos.some((id) => rolesIds.includes(id));
    if (!esAdmin) {
      throw new UnauthorizedException(
        'Solo administradores pueden acceder a este reporte',
      );
    }
    return this.controlOperativoRepository.listarReporteHorasDedicadasRangoPorTrabajadorYProyecto(
      {
        fechaInicio: input.fechaInicio,
        fechaFin: input.fechaFin,
        idTrabajadores: input.idTrabajadores ?? null,
        idProyectos: input.idProyectos ?? null,
        idEstadosActividad: input.idEstadosActividad ?? null,
      },
    );
  }
}
