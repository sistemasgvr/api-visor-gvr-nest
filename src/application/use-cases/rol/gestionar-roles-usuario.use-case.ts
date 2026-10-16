import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { GestionarRolesUsuarioDto } from '../../inputs/rol/gestionar-roles-usuario.dto';
import { BroadcastPort } from '../../ports/broadcast.port';

export class GestionarRolesUsuarioUseCase {
  constructor(
    private readonly rolRepository: IRolRepository,
    private readonly broadcastService: BroadcastPort,
  ) {}

  async execute(
    idUsuario: number,
    gestionarDto: GestionarRolesUsuarioDto,
    idUsuarioModificacion: number,
  ) {
    try {
      const resultado = await this.rolRepository.gestionarRolesUsuario(
        idUsuario,
        gestionarDto.rolesIds,
        idUsuarioModificacion,
      );

      if (!resultado) {
        throw new InvalidInputError(
          'No se pudo gestionar los roles del usuario',
        );
      }

      // Emitir evento de actualización de roles al usuario afectado
      try {
        const channel = `App.Models.User.${idUsuario}`;
        this.broadcastService.emit(channel, 'roles.updated', {
          userId: idUsuario,
          rolesIds: gestionarDto.rolesIds,
          rolesAsignados: resultado.rolesasignados || 0,
          rolesEliminados: resultado.roleseliminados || 0,
        });
      } catch (error) {
        // No fallar la operación si el broadcast falla
        console.warn(
          'Error al emitir evento de actualización de roles:',
          error,
        );
      }

      return {
        message: resultado.mensaje || 'Roles gestionados exitosamente',
        rolesAsignados: resultado.rolesasignados || 0,
        rolesEliminados: resultado.roleseliminados || 0,
      };
    } catch (error: any) {
      // Si es una excepción de PostgreSQL, extraer el mensaje
      if (error?.message) {
        throw new InvalidInputError(error.message);
      }
      throw new InvalidInputError('Error al gestionar los roles del usuario');
    }
  }
}
