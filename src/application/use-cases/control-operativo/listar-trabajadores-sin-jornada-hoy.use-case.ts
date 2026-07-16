import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { ROLES_ADMIN_CONTROL_OPERATIVO } from '../../../domain/constants/auth-role.constants';
import type { TrabajadorSinJornadaHoyItem } from '../../../domain/repositories/control-operativo.repository.interface';

export interface ListarTrabajadoresSinJornadaHoyResult {
  data: TrabajadorSinJornadaHoyItem[];
  total: number;
}

@Injectable()
export class ListarTrabajadoresSinJornadaHoyUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    idUsuario: number,
    fecha: string,
    rolesAdminPermitidos: number[],
  ): Promise<ListarTrabajadoresSinJornadaHoyResult> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(idUsuario);
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new UnauthorizedException(
        'Solo administradores pueden ver quién no ha registrado hoy',
      );
    }
    const permitidos = rolesAdminPermitidos?.length
      ? rolesAdminPermitidos
      : [...ROLES_ADMIN_CONTROL_OPERATIVO];
    const rolesIds = (perfil.roles as { id?: number }[])
      .map((r) => r?.id)
      .filter((id): id is number => id != null);
    const esAdmin = permitidos.some((id) => rolesIds.includes(id));
    if (!esAdmin) {
      throw new UnauthorizedException(
        'Solo administradores pueden ver quién no ha registrado hoy',
      );
    }
    const [data, total] = await Promise.all([
      this.controlOperativoRepository.listarTrabajadoresSinJornadaHoy(fecha),
      this.controlOperativoRepository.contarTrabajadoresEsperadosJornadaHoy(
        fecha,
      ),
    ]);
    return { data, total };
  }
}
