import { Injectable } from '@nestjs/common';
import { Document, Packer, Paragraph } from 'docx';

export type ExportarActividadesJornadasWordInput = {
  idTrabajador: number;
  fechaInicio?: string;
  fechaFin?: string;
};

/**
 * Genera un .docx de actividades de jornadas (por ahora documento vacío; aquí se integrará
 * el listado desde BD y plantillas cuando el negocio lo defina).
 */
@Injectable()
export class ExportarActividadesJornadasWordUseCase {
  async execute(
    input: ExportarActividadesJornadasWordInput,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const doc = new Document({
      sections: [
        {
          children: [new Paragraph({ text: '' })],
        },
      ],
    });

    const buffer = Buffer.from(await Packer.toBuffer(doc));

    const safe = (s: string) =>
      String(s || '')
        .replace(/[/\\?%*:|"<>]/g, '-')
        .trim() || 'sin-fecha';
    const fi = safe(input.fechaInicio ?? '');
    const ff = safe(input.fechaFin ?? '');
    const fileName = `Actividades_${input.idTrabajador}_${fi}_${ff}.docx`;

    return { buffer, fileName };
  }
}
