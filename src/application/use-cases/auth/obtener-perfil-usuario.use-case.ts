import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';
import { resolveTrabajadorFirmaViewUrl } from '../../../shared/utils/resolve-trabajador-firma-url.util';

@Injectable()
export class ObtenerPerfilUsuarioUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly minioStorage: MinioStorageService,
  ) {}

  async execute(token: string): Promise<any> {
    // Validate and decode token
    const payload = await this.jwtService.verifyAsync(token);

    if (!payload || !payload.sub) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Get user profile from repository
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
