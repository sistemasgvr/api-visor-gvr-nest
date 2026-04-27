import {
  ForbiddenException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import type {
  IControlOperativoRepository,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

export interface AgregarEvidenciasActividadInput {
  idActividad: number;
  urls: string[];
  idUsuario: number;
}

@Injectable()
export class AgregarEvidenciasActividadUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(input: AgregarEvidenciasActividadInput): Promise<number> {
    if (input.idActividad == null || input.idActividad < 1) {
      throw new NotFoundException('Actividad no encontrada');
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
        'Solo puede registrar evidencias en sus propias actividades',
      );
    }
    const urls = [
      ...new Set(
        (input.urls ?? [])
          .map((u) => (u != null ? String(u).trim() : ''))
          .filter((u) => u.length > 0),
      ),
    ].slice(0, 50);
    if (urls.length === 0) {
      return 0;
    }
    return this.controlOperativoRepository.agregarEvidenciasActividad({
      idActividad: input.idActividad,
      urls,
      idUsuario: input.idUsuario,
    });
  }
}
