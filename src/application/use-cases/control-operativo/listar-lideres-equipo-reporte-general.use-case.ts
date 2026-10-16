import { ROLES_ADMIN_CONTROL_OPERATIVO } from '../../../domain/constants/auth-role.constants';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import type {
  IControlOperativoRepository,
  LiderEquipoReporteGeneralItem,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { ForbiddenError } from '../../errors/application.error';

export class ListarLideresEquipoReporteGeneralUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,

    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(input: {
    idUsuario: number;
    rolesAdminPermitidos: number[];
  }): Promise<LiderEquipoReporteGeneralItem[]> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(
      input.idUsuario,
    );
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new ForbiddenError(
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
      throw new ForbiddenError(
        'Solo administradores pueden acceder al reporte general',
      );
    }
    return this.controlOperativoRepository.listarLideresEquipoReporteGeneral();
  }
}
