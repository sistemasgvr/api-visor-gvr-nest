import { ConflictError } from '../errors/application.error';
import { PasswordHasherPort } from '../ports/runtime.port';

import { AuthUser } from '../../domain/entities/auth-user.entity';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { RegisterDto } from '../inputs/register.dto';

export class RegisterUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(registerDto: RegisterDto): Promise<AuthUser> {
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await this.passwordHasher.hash(
      registerDto.contrasena,
      saltRounds,
    );

    // Call the database function with hashed password
    try {
      const user = await this.authRepository.register({
        nombre: registerDto.nombre,
        correo: registerDto.correo,
        contrasena: hashedPassword,
        estado: registerDto.estado ?? 1, // Default to active
        id: registerDto.id ?? null,
      });

      return user;
    } catch (error) {
      // Handle duplicate email error
      if (
        error.message?.includes('duplicate') ||
        error.message?.includes('already exists')
      ) {
        throw new ConflictError('El correo ya está registrado');
      }
      throw error;
    }
  }
}
