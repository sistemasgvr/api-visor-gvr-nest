import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { buildReporteActividadesPrimeraPaginaBuffer } from '../../../infrastructure/word/reporte-actividades-docx';

export type ExportarActividadesJornadasWordInput = {
  idTrabajador: number;
  fechaInicio?: string;
  fechaFin?: string;
  /** YYYY-MM-DD; define el año del eslogan (genconfiguraciongeneral). Por defecto hoy. */
  fechaEmision?: string;
};

function anioDesdeYmd(ymd: string): number {
  const y = parseInt(String(ymd).trim().slice(0, 4), 10);
  if (!Number.isFinite(y) || y < 1990 || y > 2100) {
    return new Date().getFullYear();
  }
  return y;
}

function defaultPeriodoMesActual(): { ini: string; fin: string } {
  const t = new Date();
  const y = t.getFullYear();
  const m = t.getMonth() + 1;
  const last = new Date(y, m, 0).getDate();
  const p = (n: number) => String(n).padStart(2, '0');
  return { ini: `${y}-${p(m)}-01`, fin: `${y}-${p(m)}-${p(last)}` };
}

function todayYmd(): string {
  const t = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

/**
 * Genera un .docx del reporte de actividades: portada del informe de servicio y,
 * tras salto de página, registro detallado por actividad (modalidad, horas, estado, descripción).
 */
@Injectable()
export class ExportarActividadesJornadasWordUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    input: ExportarActividadesJornadasWordInput,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const def = defaultPeriodoMesActual();
    const fi = (input.fechaInicio && input.fechaInicio.trim()) || def.ini;
    const ff = (input.fechaFin && input.fechaFin.trim()) || def.fin;
    const fechaEmision =
      (input.fechaEmision && input.fechaEmision.trim()) || todayYmd();
    const anioInforme = anioDesdeYmd(fechaEmision);

    const row =
      await this.controlOperativoRepository.obtenerDatosReporteActividades(
        input.idTrabajador,
        anioInforme,
      );
    if (!row) {
      throw new NotFoundException(
        'No se encontraron datos del trabajador para el informe de servicio',
      );
    }

    const actividadesDetalle =
      await this.controlOperativoRepository.listarActividadesPeriodoReporte(
        input.idTrabajador,
        fi,
        ff,
      );

    let logoBuffer: Buffer | null = null;
    let logoMime: 'png' | 'jpg' | null = null;
    const urlLogo = row.urllogo != null ? String(row.urllogo).trim() : '';
    if (urlLogo.startsWith('http://') || urlLogo.startsWith('https://')) {
      try {
        const res = await axios.get<ArrayBuffer>(urlLogo, {
          responseType: 'arraybuffer',
          timeout: 8000,
          maxContentLength: 2_500_000,
          validateStatus: (s) => s >= 200 && s < 400,
        });
        const buf = Buffer.from(res.data);
        if (buf.length > 0) {
          logoBuffer = buf;
          const ct = String(res.headers['content-type'] || '').toLowerCase();
          if (ct.includes('jpeg') || ct.includes('jpg')) logoMime = 'jpg';
          else if (ct.includes('png')) logoMime = 'png';
        }
      } catch {
        logoBuffer = null;
      }
    }

    const buffer = await buildReporteActividadesPrimeraPaginaBuffer({
      row,
      fechaInicioYmd: fi,
      fechaFinYmd: ff,
      fechaEmisionYmd: fechaEmision,
      actividadesDetalle,
      logoBuffer,
      logoMime,
    });

    const safe = (s: string) =>
      String(s || '')
        .replace(/[/\\?%*:|"<>]/g, '-')
        .trim() || 'sin-fecha';
    const fileName = `Reporte_actividades_${input.idTrabajador}_${safe(fi)}_${safe(ff)}.docx`;

    return { buffer, fileName };
  }
}
