import {
  ForbiddenException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import type {
  ActividadEvidenciaEntrada,
  IControlOperativoRepository,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

export interface AgregarEvidenciasActividadInput {
  idActividad: number;
  evidencias: ActividadEvidenciaEntrada[];
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
    const seen = new Map<string, ActividadEvidenciaEntrada>();
    for (const e of input.evidencias ?? []) {
      const u = e?.url != null ? String(e.url).trim() : '';
      if (!u) continue;
      if (seen.has(u)) continue;
      const tb = e.tamanoBytes;
      seen.set(u, {
        url: u,
        nombreOriginal: e.nombreOriginal?.trim() || null,
        tipoMime: e.tipoMime?.trim() || null,
        tamanoBytes:
          tb != null && Number.isFinite(tb)
            ? Math.min(Math.trunc(tb as number), Number.MAX_SAFE_INTEGER)
            : null,
      });
    }
    const evidencias = [...seen.values()].slice(0, 50);
    if (evidencias.length === 0) {
      return 0;
    }
    return this.controlOperativoRepository.agregarEvidenciasActividad({
      idActividad: input.idActividad,
      evidencias,
      idUsuario: input.idUsuario,
    });
  }
}
