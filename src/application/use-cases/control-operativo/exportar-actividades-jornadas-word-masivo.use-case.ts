import {
  Injectable,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { finished } from 'node:stream/promises';
import archiver = require('archiver');
import {
  ExportarActividadesJornadasWordUseCase,
  compactoYmdDesdeTexto,
} from './exportar-actividades-jornadas-word.use-case';

export type ExportarActividadesJornadasWordMasivoInput = {
  idsTrabajador: number[];
  fechaInicio: string;
  fechaFin: string;
  fechaEmision?: string;
  incluirHorasDedicadasEnWord: boolean;
};

@Injectable()
export class ExportarActividadesJornadasWordMasivoUseCase {
  private readonly logger = new Logger(
    ExportarActividadesJornadasWordMasivoUseCase.name,
  );

  constructor(
    private readonly exportarActividadesJornadasWordUseCase: ExportarActividadesJornadasWordUseCase,
  ) {}

  /**
   * Genera un ZIP con un .docx por colaborador. Si alguno falla, el ZIP incluye
   * `exportacion_errores.txt` y se omiten solo esos archivos.
   * Si todos fallan, lanza 422 con el detalle.
   */
  async execute(
    input: ExportarActividadesJornadasWordMasivoInput,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const fi = input.fechaInicio.trim();
    const ff = input.fechaFin.trim();
    const ids = [...new Set(input.idsTrabajador.filter((n) => n >= 1))];
    if (ids.length === 0) {
      throw new UnprocessableEntityException(
        'No hay ids de colaborador válidos para exportar.',
      );
    }

    const ok: { name: string; buffer: Buffer }[] = [];
    const errores: string[] = [];

    for (const idTrabajador of ids) {
      try {
        const { buffer, fileName } =
          await this.exportarActividadesJornadasWordUseCase.execute({
            idTrabajador,
            fechaInicio: fi,
            fechaFin: ff,
            fechaEmision: input.fechaEmision?.trim(),
            incluirHorasDedicadasEnWord: input.incluirHorasDedicadasEnWord,
          });
        ok.push({ name: fileName, buffer });
      } catch (e: unknown) {
        const msg =
          e instanceof Error
            ? e.message
            : typeof e === 'object' && e !== null && 'message' in e
              ? String((e as { message: unknown }).message)
              : String(e);
        errores.push(`idTrabajador=${idTrabajador}: ${msg}`);
        this.logger.warn(
          `[export-word-masivo] Falló export para trabajador ${idTrabajador}: ${msg}`,
        );
      }
    }

    if (ok.length === 0) {
      const detalle = errores.join('\n');
      throw new UnprocessableEntityException(
        `No se pudo generar ningún documento. Detalle:\n${detalle}`,
      );
    }

    const archive = archiver('zip', { zlib: { level: 6 } });
    const chunks: Buffer[] = [];
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));

    for (const item of ok) {
      archive.append(item.buffer, { name: item.name });
    }

    if (errores.length > 0) {
      const texto =
        `Exportación masiva — ${new Date().toISOString()}\n` +
        `Periodo: ${fi} a ${ff}\n` +
        `Generados: ${ok.length} de ${ids.length}\n\n` +
        errores.map((l) => `- ${l}`).join('\n') +
        '\n';
      archive.append(Buffer.from(texto, 'utf8'), {
        name: 'exportacion_errores.txt',
      });
    }

    const endPromise = finished(archive);
    await archive.finalize();
    await endPromise;
    const buffer = Buffer.concat(chunks);

    const base = `Actividades_masivo_${compactoYmdDesdeTexto(fi)}-${compactoYmdDesdeTexto(ff)}`;
    const fileName = `${base}.zip`;

    return { buffer, fileName };
  }
}
