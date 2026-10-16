import { type IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import { ForbiddenError, NotFoundError } from '../../errors/application.error';
import { MinioStoragePort } from '../../ports/minio-storage.port';

export interface EliminarEvidenciaActividadInput {
  idActividad: number;
  idEvidencia: number;
  idUsuario: number;
}

export class EliminarEvidenciaActividadUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(input: EliminarEvidenciaActividadInput): Promise<void> {
    if (input.idActividad == null || input.idActividad < 1) {
      throw new NotFoundError('Actividad no encontrada');
    }
    if (input.idEvidencia == null || input.idEvidencia < 1) {
      throw new NotFoundError('Evidencia no encontrada');
    }
    const idTrabajador =
      await this.controlOperativoRepository.obtenerIdTrabajadorPorIdUsuario(
        input.idUsuario,
      );
    if (idTrabajador == null) {
      throw new ForbiddenError('Sin perfil de trabajador asociado al usuario');
    }
    const actividad = await this.controlOperativoRepository.obtenerActividad(
      input.idActividad,
    );
    if (actividad == null) {
      throw new NotFoundError('Actividad no encontrada');
    }
    if (actividad.idtrabajador !== idTrabajador) {
      throw new ForbiddenError(
        'Solo puede eliminar evidencias de sus propias actividades',
      );
    }
    const urlAlmacenada =
      await this.controlOperativoRepository.eliminarEvidenciaActividad({
        idActividad: input.idActividad,
        idEvidencia: input.idEvidencia,
        idUsuario: input.idUsuario,
      });
    if (urlAlmacenada == null) {
      throw new NotFoundError('Evidencia no encontrada o ya eliminada');
    }
    await this.minioStorage.tryDeleteEvidenciaStoredObject(urlAlmacenada);
  }
}
