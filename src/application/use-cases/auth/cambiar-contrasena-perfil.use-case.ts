import {
  InvalidInputError,
  UnauthenticatedError,
} from '../../errors/application.error';
import { PasswordHasherPort } from '../../ports/runtime.port';

import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../../domain/policies/password-policy';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { ChangePasswordDto } from '../../inputs/auth/change-password.dto';
import { TokenServicePort } from '../../ports/runtime.port';

export class CambiarContrasenaPerfilUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: TokenServicePort,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(
    token: string,
    dto: ChangePasswordDto,
  ): Promise<{ contrasenaActualizada: boolean }> {
    let payload: { sub?: number };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthenticatedError('Token inválido o expirado');
    }

    const userId = payload.sub;
    if (!userId) {
      throw new UnauthenticatedError('Token inválido');
    }

    const contrasenaActual = (dto.contrasenaActual ?? '').trim();
    const nuevaContrasena = (dto.nuevaContrasena ?? '').trim();

    if (!contrasenaActual || !nuevaContrasena) {
      throw new InvalidInputError(
        'Debe indicar la contraseña actual y la nueva contraseña',
      );
    }

    if (contrasenaActual === nuevaContrasena) {
      throw new InvalidInputError(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    if (!PASSWORD_POLICY_REGEX.test(nuevaContrasena)) {
      throw new InvalidInputError(PASSWORD_POLICY_MESSAGE);
    }

    const perfil = await this.authRepository.obtenerPerfilUsuario(userId);
    const correo = perfil?.correo ?? perfil?.Correo;
    if (!correo || typeof correo !== 'string') {
      throw new UnauthenticatedError('No se pudo verificar el usuario');
    }

    const user = await this.authRepository.login(correo.trim());
    if (!user?.contrasena) {
      throw new UnauthenticatedError('La contraseña actual no es correcta');
    }

    let passwordHash = user.contrasena;
    if (passwordHash.startsWith('$2y$')) {
      passwordHash = passwordHash.replace(/^\$2y\$/, '$2a$');
    }

    const isCurrentValid = await this.passwordHasher.compare(
      contrasenaActual,
      passwordHash,
    );
    if (!isCurrentValid) {
      throw new UnauthenticatedError('La contraseña actual no es correcta');
    }

    const contrasenaHasheada = await this.passwordHasher.hash(
      nuevaContrasena,
      10,
    );
    const resultado = await this.authRepository.actualizarCredenciales(
      userId,
      null,
      contrasenaHasheada,
      userId,
    );

    if (!resultado) {
      throw new InvalidInputError('No se pudo actualizar la contraseña');
    }

    return { contrasenaActualizada: true };
  }
}
