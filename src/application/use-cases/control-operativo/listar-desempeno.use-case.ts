import { ROLES_ADMIN_CONTROL_OPERATIVO } from '../../../domain/constants/auth-role.constants';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import type {
  IControlOperativoRepository,
  ListarDesempenoResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { ForbiddenError } from '../../errors/application.error';

export interface ListarDesempenoInput {
  idUsuario: number;
  idProyecto: number;
  fechaInicio: string;
  fechaFin: string;
  /** IDs de roles considerados admin (enviados por el front desde ROLES_ADMIN_CONTROL_OPERATIVO). */
  rolesAdminPermitidos: number[];
  /** Opcional: filtrar por un solo trabajador. */
  idTrabajador?: number | null;
}

export class ListarDesempenoUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,

    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(input: ListarDesempenoInput): Promise<ListarDesempenoResult> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(
      input.idUsuario,
    );
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new ForbiddenError(
        'Solo administradores pueden acceder a la evaluación de desempeño',
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
        'Solo administradores pueden acceder a la evaluación de desempeño',
      );
    }
    return this.controlOperativoRepository.listarDesempeno({
      idProyecto: input.idProyecto,
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
      idTrabajador: input.idTrabajador ?? undefined,
    });
  }
}
