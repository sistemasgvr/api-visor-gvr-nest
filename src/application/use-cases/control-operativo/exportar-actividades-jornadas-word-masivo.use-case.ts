import { UnprocessableError } from '../../errors/application.error';
import {
  ApplicationLogger,
  LoggerFactoryPort,
  ZipArchivePort,
} from '../../ports/runtime.port';

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

export class ExportarActividadesJornadasWordMasivoUseCase {
  private readonly logger: ApplicationLogger;

  constructor(
    private readonly exportarActividadesJornadasWordUseCase: ExportarActividadesJornadasWordUseCase,
    private readonly loggerFactory: LoggerFactoryPort,
    private readonly zipArchive: ZipArchivePort,
  ) {
    this.logger = this.loggerFactory.create(
      ExportarActividadesJornadasWordMasivoUseCase.name,
    );
  }

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
      throw new UnprocessableError(
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
      throw new UnprocessableError(
        `No se pudo generar ningún documento. Detalle:\n${detalle}`,
      );
    }

    const archiveFiles: Array<{ name: string; buffer: Buffer }> = [];

    for (const item of ok) {
      archiveFiles.push({ buffer: item.buffer, name: item.name });
    }

    if (errores.length > 0) {
      const texto =
        `Exportación masiva — ${new Date().toISOString()}\n` +
        `Periodo: ${fi} a ${ff}\n` +
        `Generados: ${ok.length} de ${ids.length}\n\n` +
        errores.map((l) => `- ${l}`).join('\n') +
        '\n';
      archiveFiles.push({
        buffer: Buffer.from(texto, 'utf8'),
        name: 'exportacion_errores.txt',
      });
    }

    const buffer = await this.zipArchive.create(archiveFiles);

    const base = `Actividades_masivo_${compactoYmdDesdeTexto(fi)}-${compactoYmdDesdeTexto(ff)}`;
    const fileName = `${base}.zip`;

    return { buffer, fileName };
  }
}
