import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { TRABAJADOR_REPOSITORY } from '../../../domain/repositories/trabajador.repository.interface';
import { WorkerSignatureStorageService } from '../../../infrastructure/services/worker-signature-storage.service';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';

@Injectable()
export class SubirFirmaTrabajadorUseCase {
  constructor(
    @Inject(TRABAJADOR_REPOSITORY)
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly jwtService: JwtService,
    private readonly workerSignatureStorageService: WorkerSignatureStorageService,
    private readonly minioStorage: MinioStorageService,
  ) {}

  async execute(
    token: string,
    file: Express.Multer.File,
  ): Promise<{ urlFirma: string }> {
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

    const idTrabajador =
      await this.trabajadorRepository.obtenerIdTrabajadorActivoPorIdUsuario(
        userId,
      );
    if (!idTrabajador) {
      throw new BadRequestException(
        'No tiene un trabajador activo vinculado a su cuenta. Contacte a administración.',
      );
    }

    const workerDisplayName = payload.nombre?.trim() || `trabajador-${idTrabajador}`;

    const saved = await this.workerSignatureStorageService.save(
      idTrabajador,
      workerDisplayName,
      file,
    );

    try {
      const { urlFirma } = await this.trabajadorRepository.actualizarFirmaTrabajador(
        idTrabajador,
        saved.url,
        userId,
        saved.nombreOriginal,
        saved.tipoMime,
        saved.tamanoBytes,
      );
      let view = urlFirma;
      if (urlFirma?.trim()) {
        view = await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(
          urlFirma,
        );
      }
      return { urlFirma: view };
    } catch (error) {
      await this.workerSignatureStorageService.delete(saved.url);
      throw new InternalServerErrorException(
        'No se pudo actualizar la firma en la base de datos',
      );
    }
  }
}
