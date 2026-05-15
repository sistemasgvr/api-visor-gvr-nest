import {
  Injectable,
  Inject,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ISesionRepository } from '../../../domain/repositories/sesion.repository.interface';
import { SESION_REPOSITORY } from '../../../domain/repositories/sesion.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';
import { resolveTrabajadorFirmaViewUrl } from '../../../shared/utils/resolve-trabajador-firma-url.util';

@Injectable()
export class ObtenerPerfilUseCase {
  constructor(
    @Inject(SESION_REPOSITORY)
    private readonly sesionRepository: ISesionRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly minioStorage: MinioStorageService,
  ) {}

  async execute(token: string): Promise<any> {
    // Validar token
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Verificar sesión activa
    const sesion = await this.sesionRepository.obtenerSesionPorToken(token);

    if (!sesion || sesion.estado !== 1) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    // Obtener perfil completo del usuario
    const perfil = await this.authRepository.obtenerPerfilUsuario(payload.sub);

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const fotoStored = perfil.fotoperfil != null ? String(perfil.fotoperfil) : '';
    if (fotoStored.trim()) {
      const viewUrl =
        await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(fotoStored);
      perfil.fotoperfil = viewUrl;
      perfil.fotoperfilviewurl = viewUrl;
    }

    if (perfil.trabajador) {
      try {
        const trabajador =
          typeof perfil.trabajador === 'string'
            ? JSON.parse(perfil.trabajador)
            : perfil.trabajador;
        await resolveTrabajadorFirmaViewUrl(trabajador, this.minioStorage);
        perfil.trabajador = trabajador;
      } catch {
        // mantener trabajador sin url de firma resuelta
      }
    }

    return perfil;
  }
}
