import { InvalidInputError } from '../../errors/application.error';
import { PasswordHasherPort } from '../../ports/runtime.port';

import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../../domain/policies/password-policy';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { UpdateCredentialsDto } from '../../inputs/auth/update-credentials.dto';
import { TokenServicePort } from '../../ports/runtime.port';

export class ActualizarCredencialesUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: TokenServicePort,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(
    idUsuario: number,
    updateDto: UpdateCredentialsDto,
    idUsuarioModificacion: number,
  ): Promise<any> {
    const nuevoCorreoLimpio = updateDto.nuevoCorreo?.trim() ?? '';
    const nuevaContrasenaLimpia = updateDto.nuevaContrasena?.trim() ?? '';

    if (!nuevoCorreoLimpio && !nuevaContrasenaLimpia) {
      throw new InvalidInputError(
        'Debe proporcionar al menos el nuevo correo o la nueva contraseña',
      );
    }

    // Hash password if provided
    let contrasenaHasheada: string | null = null;
    if (nuevaContrasenaLimpia) {
      if (!PASSWORD_POLICY_REGEX.test(nuevaContrasenaLimpia)) {
        throw new InvalidInputError(PASSWORD_POLICY_MESSAGE);
      }
      contrasenaHasheada = await this.passwordHasher.hash(
        nuevaContrasenaLimpia,
        10,
      );
    }

    // Call repository to update credentials
    const resultado = await this.authRepository.actualizarCredenciales(
      idUsuario,
      nuevoCorreoLimpio || null,
      contrasenaHasheada,
      idUsuarioModificacion,
    );

    if (!resultado) {
      throw new InvalidInputError('No se pudieron actualizar las credenciales');
    }

    return resultado;
  }
}
