import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import type { ISesionRepository } from '../../domain/repositories/sesion.repository.interface';
import { SESION_REPOSITORY } from '../../domain/repositories/sesion.repository.interface';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import type {
  Menu,
  Permission,
  Role,
  TrabajadorEnUsuario,
} from '../../domain/entities/auth-user.entity';
import { LoginDto } from '../dtos/login.dto';

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

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(SESION_REPOSITORY)
    private readonly sesionRepository: ISesionRepository,
    private readonly jwtService: JwtService,
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
      throw new UnauthorizedException('Credenciales inválidas');
    }
    // Get user from database
    const user = await this.authRepository.login(correo);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Fix: PHP bcrypt uses $2y$, Node.js bcrypt uses $2a$ or $2b$
    // They are functionally identical, so we can safely convert
    let passwordHash = user.contrasena;
    if (passwordHash.startsWith('$2y$')) {
      passwordHash = passwordHash.replace(/^\$2y\$/, '$2a$');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(contrasena, passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
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

    // Cerrar todas las sesiones anteriores del usuario (registro completo: fechaFin en authSesiones)
    try {
      await this.sesionRepository.cerrarTodasLasSesiones(user.id, user.id);
    } catch (err) {
      console.error('Error cerrando sesiones anteriores:', err);
    }

    // Registrar nueva sesión en authSesiones (si falla, el login falla para poder ver el error)
    await this.sesionRepository.crearSesion(
      user.id,
      access_token,
      ip ?? null,
      userAgent ?? null,
    );

    // Return user data without password (trabajador viene de la BD en authLoginUsuarioV2)
    return {
      access_token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        estado: user.estado,
        fotoPerfil: user.fotoPerfil,
        roles: user.roles,
        permisos: user.permisos,
        menus: user.menus,
        ...(user.trabajador &&
          user.trabajador.id != null && { trabajador: user.trabajador }),
      },
    };
  }
}
