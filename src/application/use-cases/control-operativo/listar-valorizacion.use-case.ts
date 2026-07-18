import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { ROLES_ADMIN_CONTROL_OPERATIVO } from '../../../domain/constants/auth-role.constants';
import type { ListarValorizacionResult } from '../../../domain/repositories/control-operativo.repository.interface';

export interface ListarValorizacionInput {
  idUsuario: number;
  idProyecto: number;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  /** IDs de roles considerados admin (enviados por el front desde ROLES_ADMIN_CONTROL_OPERATIVO). */
  rolesAdminPermitidos: number[];
}

@Injectable()
export class ListarValorizacionUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    input: ListarValorizacionInput,
  ): Promise<ListarValorizacionResult> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(
      input.idUsuario,
    );
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new ForbiddenException(
        'Solo administradores pueden acceder a la valorización',
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
        'Solo administradores pueden acceder a la valorización',
      );
    }
    return this.controlOperativoRepository.listarValorizacion({
      idProyecto: input.idProyecto,
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
    });
  }
}
