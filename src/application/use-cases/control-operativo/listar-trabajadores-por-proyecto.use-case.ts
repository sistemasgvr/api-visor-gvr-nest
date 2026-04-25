import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import type { TrabajadorPorProyectoItem } from '../../../domain/repositories/control-operativo.repository.interface';

export interface ListarTrabajadoresPorProyectoInput {
  idUsuario: number;
  idProyecto: number;
  /** IDs de roles considerados admin (mismo que Desempeño). */
  rolesAdminPermitidos: number[];
}

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
      throw new UnauthorizedException(
        'Solo administradores pueden acceder a esta lista',
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
        'Solo administradores pueden acceder a esta lista',
      );
    }
    return this.controlOperativoRepository.listarTrabajadoresPorProyecto(
      input.idProyecto,
    );
  }
}
