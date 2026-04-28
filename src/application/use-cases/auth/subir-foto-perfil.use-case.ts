import {
  Injectable,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { ProfilePhotoStorageService } from '../../../infrastructure/services/profile-photo-storage.service';

@Injectable()
export class SubirFotoPerfilUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly profilePhotoStorageService: ProfilePhotoStorageService,
  ) {}

  async execute(
    token: string,
    file: Express.Multer.File,
  ): Promise<{ fotoPerfil: string }> {
    let payload: { sub?: number; nombre?: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const userId = payload.sub;
    if (!userId) {
      throw new UnauthorizedException('Token inválido');
    }
    const userDisplayName = payload.nombre?.trim() || `usuario-${userId}`;

    // Guardar archivo primero
    const saved = await this.profilePhotoStorageService.save(
      userId,
      userDisplayName,
      file,
    );

    // Intentar actualizar en BD; si falla, eliminar el archivo subido
    try {
      const { fotoPerfil } = await this.authRepository.actualizarFotoPerfil(
        userId,
        saved.url,
        saved.nombreOriginal,
        saved.tipoMime,
        saved.tamanoBytes,
      );
      return { fotoPerfil };
    } catch (error) {
      // Rollback: eliminar archivo si la BD falla
      await this.profilePhotoStorageService.delete(saved.url);
      throw new InternalServerErrorException(
        'No se pudo actualizar la foto de perfil en la base de datos',
      );
    }
  }
}
