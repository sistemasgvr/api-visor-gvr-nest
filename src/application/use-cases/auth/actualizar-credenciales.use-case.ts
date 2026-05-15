import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { UpdateCredentialsDto } from '../../dtos/auth/update-credentials.dto';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../../shared/validation/password-policy';

@Injectable()
export class ActualizarCredencialesUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    idUsuario: number,
    updateDto: UpdateCredentialsDto,
    idUsuarioModificacion: number,
  ): Promise<any> {
    const nuevoCorreoLimpio = updateDto.nuevoCorreo?.trim() ?? '';
    const nuevaContrasenaLimpia = updateDto.nuevaContrasena?.trim() ?? '';

    if (!nuevoCorreoLimpio && !nuevaContrasenaLimpia) {
      throw new BadRequestException(
        'Debe proporcionar al menos el nuevo correo o la nueva contraseña',
      );
    }

    // Hash password if provided
    let contrasenaHasheada: string | null = null;
    if (nuevaContrasenaLimpia) {
      if (!PASSWORD_POLICY_REGEX.test(nuevaContrasenaLimpia)) {
        throw new BadRequestException(PASSWORD_POLICY_MESSAGE);
      }
      contrasenaHasheada = await bcrypt.hash(nuevaContrasenaLimpia, 10);
    }

    // Call repository to update credentials
    const resultado = await this.authRepository.actualizarCredenciales(
      idUsuario,
      nuevoCorreoLimpio || null,
      contrasenaHasheada,
      idUsuarioModificacion,
    );

    if (!resultado) {
      throw new BadRequestException(
        'No se pudieron actualizar las credenciales',
      );
    }

    return resultado;
  }
}
