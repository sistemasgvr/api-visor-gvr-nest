import { ROLES_ADMIN_CONTROL_OPERATIVO } from '../../../domain/constants/auth-role.constants';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import type {
  IControlOperativoRepository,
  ReporteHorasRangoTrabajadorProyectoDetalleResult,
  ReporteHorasTrabajadorRangoDetalleProyectoParams,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { ForbiddenError } from '../../errors/application.error';

export interface ListarReporteHorasRangoDetalleProyectoInput extends ReporteHorasTrabajadorRangoDetalleProyectoParams {
  idUsuario: number;
  rolesAdminPermitidos: number[];
}

export class ListarReporteHorasRangoDetalleProyectoUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,

    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    input: ListarReporteHorasRangoDetalleProyectoInput,
  ): Promise<ReporteHorasRangoTrabajadorProyectoDetalleResult> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(
      input.idUsuario,
    );
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new ForbiddenError(
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
      throw new ForbiddenError(
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
