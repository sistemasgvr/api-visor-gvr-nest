import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { NotFoundError } from '../../errors/application.error';
import { resolveTrabajadorFirmaViewUrl } from '../../helpers/resolve-trabajador-firma-url.util';
import { MinioStoragePort } from '../../ports/minio-storage.port';
import { TokenServicePort } from '../../ports/runtime.port';

export class ObtenerPerfilUsuarioUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: TokenServicePort,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(token: string): Promise<any> {
    // Validate and decode token
    const payload = await this.jwtService.verifyAsync(token);

    if (!payload || !payload.sub) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Get user profile from repository
    const perfil = await this.authRepository.obtenerPerfilUsuario(payload.sub);

    if (!perfil) {
      throw new NotFoundError('Perfil no encontrado');
    }

    const fotoStored =
      perfil.fotoperfil != null ? String(perfil.fotoperfil) : '';
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
