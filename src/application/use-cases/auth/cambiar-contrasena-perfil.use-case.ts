import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { ChangePasswordDto } from '../../dtos/auth/change-password.dto';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../../shared/validation/password-policy';

@Injectable()
export class CambiarContrasenaPerfilUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    token: string,
    dto: ChangePasswordDto,
  ): Promise<{ contrasenaActualizada: boolean }> {
    let payload: { sub?: number };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const userId = payload.sub;
    if (!userId) {
      throw new UnauthorizedException('Token inválido');
    }

    const contrasenaActual = (dto.contrasenaActual ?? '').trim();
    const nuevaContrasena = (dto.nuevaContrasena ?? '').trim();

    if (!contrasenaActual || !nuevaContrasena) {
      throw new BadRequestException(
        'Debe indicar la contraseña actual y la nueva contraseña',
      );
    }

    if (contrasenaActual === nuevaContrasena) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    if (!PASSWORD_POLICY_REGEX.test(nuevaContrasena)) {
      throw new BadRequestException(PASSWORD_POLICY_MESSAGE);
    }

    const perfil = await this.authRepository.obtenerPerfilUsuario(userId);
    const correo = perfil?.correo ?? perfil?.Correo;
    if (!correo || typeof correo !== 'string') {
      throw new UnauthorizedException('No se pudo verificar el usuario');
    }

    const user = await this.authRepository.login(correo.trim());
    if (!user?.contrasena) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    let passwordHash = user.contrasena;
    if (passwordHash.startsWith('$2y$')) {
      passwordHash = passwordHash.replace(/^\$2y\$/, '$2a$');
    }

    const isCurrentValid = await bcrypt.compare(contrasenaActual, passwordHash);
    if (!isCurrentValid) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    const contrasenaHasheada = await bcrypt.hash(nuevaContrasena, 10);
    const resultado = await this.authRepository.actualizarCredenciales(
      userId,
      null,
      contrasenaHasheada,
      userId,
    );

    if (!resultado) {
      throw new BadRequestException('No se pudo actualizar la contraseña');
    }

    return { contrasenaActualizada: true };
  }
}
