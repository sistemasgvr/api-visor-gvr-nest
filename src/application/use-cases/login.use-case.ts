import { UnauthenticatedError } from '../errors/application.error';
import { PasswordHasherPort } from '../ports/runtime.port';

import type {
  Menu,
  Permission,
  Role,
  TrabajadorEnUsuario,
} from '../../domain/entities/auth-user.entity';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import type { ISesionRepository } from '../../domain/repositories/sesion.repository.interface';
import { LoginDto } from '../inputs/login.dto';
import { MinioStoragePort } from '../ports/minio-storage.port';
import { TokenServicePort } from '../ports/runtime.port';

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    correo: string;
    estado: number;
    fotoPerfil?: string;
    roles: Role[];
    permisos: Permission[];
    menus: Menu[];
    /** Trabajador asociado al usuario (desde perfil), para filtros y contexto. */
    trabajador?: TrabajadorEnUsuario;
  };
}

export class LoginUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,

    private readonly sesionRepository: ISesionRepository,
    private readonly jwtService: TokenServicePort,
    private readonly minioStorage: MinioStoragePort,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(
    loginDto: LoginDto,
    ip?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    // Normalizar para evitar espacios/autocompletado de iOS que provocan "credenciales inválidas"
    const correo = (loginDto.correo ?? '').trim();
    const contrasena = (loginDto.contrasena ?? '').trim();
    if (!correo || !contrasena) {
      throw new UnauthenticatedError('Credenciales inválidas');
    }
    // Get user from database
    const user = await this.authRepository.login(correo);

    if (!user) {
      throw new UnauthenticatedError('Credenciales inválidas');
    }

    // Fix: PHP bcrypt uses $2y$, Node.js bcrypt uses $2a$ or $2b$
    // They are functionally identical, so we can safely convert
    let passwordHash = user.contrasena;
    if (passwordHash.startsWith('$2y$')) {
      passwordHash = passwordHash.replace(/^\$2y\$/, '$2a$');
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(
      contrasena,
      passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthenticatedError('Credenciales inválidas');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      correo: user.correo,
      nombre: user.nombre,
      roles: user.roles,
      permisos: user.permisos,
    };

    const access_token = await this.jwtService.signAsync(payload);

    // Registrar nueva sesión en authSesiones.
    // No se cierran sesiones previas para permitir múltiples sesiones concurrentes
    // (p. ej. producción + local, o varias ventanas/dispositivos del mismo usuario).
    await this.sesionRepository.crearSesion(
      user.id,
      access_token,
      ip ?? null,
      userAgent ?? null,
    );

    const fotoPerfil = user.fotoPerfil?.trim()
      ? await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(
          user.fotoPerfil,
        )
      : undefined;

    // Return user data without password (trabajador viene de la BD en authLoginUsuarioV2)
    return {
      access_token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        estado: user.estado,
        fotoPerfil,
        roles: user.roles,
        permisos: user.permisos,
        menus: user.menus,
        ...(user.trabajador &&
          user.trabajador.id != null && { trabajador: user.trabajador }),
      },
    };
  }
}
