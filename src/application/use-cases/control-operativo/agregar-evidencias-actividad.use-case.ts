import type {
  ActividadEvidenciaEntrada,
  IControlOperativoRepository,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export interface AgregarEvidenciasActividadInput {
  idActividad: number;
  evidencias: ActividadEvidenciaEntrada[];
  idUsuario: number;
}

export class AgregarEvidenciasActividadUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(input: AgregarEvidenciasActividadInput): Promise<number> {
    if (input.idActividad == null || input.idActividad < 1) {
      throw new NotFoundError('Actividad no encontrada');
    }
    const actividad = await this.controlOperativoRepository.obtenerActividad(
      input.idActividad,
    );
    if (actividad == null) {
      throw new NotFoundError('Actividad no encontrada');
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
