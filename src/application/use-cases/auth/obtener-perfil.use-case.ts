import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import type { ISesionRepository } from '../../../domain/repositories/sesion.repository.interface';
import {
  NotFoundError,
  UnauthenticatedError,
} from '../../errors/application.error';
import { resolveTrabajadorFirmaViewUrl } from '../../helpers/resolve-trabajador-firma-url.util';
import { MinioStoragePort } from '../../ports/minio-storage.port';
import { TokenServicePort } from '../../ports/runtime.port';

export class ObtenerPerfilUseCase {
  constructor(
    private readonly sesionRepository: ISesionRepository,

    private readonly authRepository: IAuthRepository,
    private readonly jwtService: TokenServicePort,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(token: string): Promise<any> {
    // Validar token
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthenticatedError('Token inválido o expirado');
    }

    // Verificar sesión activa
    const sesion = await this.sesionRepository.obtenerSesionPorToken(token);

    if (!sesion || sesion.estado !== 1) {
      throw new UnauthenticatedError('Sesión inválida o expirada');
    }

    // Obtener perfil completo del usuario
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
