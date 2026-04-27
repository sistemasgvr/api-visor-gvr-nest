import {
  ForbiddenException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  CONTROL_OPERATIVO_REPOSITORY,
  type IControlOperativoRepository,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';

export interface EliminarEvidenciaActividadInput {
  idActividad: number;
  idEvidencia: number;
  idUsuario: number;
}

@Injectable()
export class EliminarEvidenciaActividadUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
    private readonly minioStorage: MinioStorageService,
  ) {}

  async execute(input: EliminarEvidenciaActividadInput): Promise<void> {
    if (input.idActividad == null || input.idActividad < 1) {
      throw new NotFoundException('Actividad no encontrada');
    }
    if (input.idEvidencia == null || input.idEvidencia < 1) {
      throw new NotFoundException('Evidencia no encontrada');
    }
    const idTrabajador =
      await this.controlOperativoRepository.obtenerIdTrabajadorPorIdUsuario(
        input.idUsuario,
      );
    if (idTrabajador == null) {
      throw new ForbiddenException('Sin perfil de trabajador asociado al usuario');
    }
    const actividad = await this.controlOperativoRepository.obtenerActividad(
      input.idActividad,
    );
    if (actividad == null) {
      throw new NotFoundException('Actividad no encontrada');
    }
    if (actividad.idtrabajador !== idTrabajador) {
      throw new ForbiddenException(
        'Solo puede eliminar evidencias de sus propias actividades',
      );
    }
    const urlAlmacenada = await this.controlOperativoRepository.eliminarEvidenciaActividad(
      {
        idActividad: input.idActividad,
        idEvidencia: input.idEvidencia,
        idUsuario: input.idUsuario,
      },
    );
    if (urlAlmacenada == null) {
      throw new NotFoundException('Evidencia no encontrada o ya eliminada');
    }
    await this.minioStorage.tryDeleteEvidenciaStoredObject(urlAlmacenada);
  }
}
