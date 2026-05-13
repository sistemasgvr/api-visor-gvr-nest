import type { InformeServicioPagina1Row } from '../../domain/repositories/control-operativo.repository.interface';
import {
  AlignmentType,
  Document,
  Header,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';

export type InformeServicioPrimeraPaginaInput = {
  row: InformeServicioPagina1Row;
  fechaInicioYmd: string;
  fechaFinYmd: string;
  fechaEmisionYmd: string;
  logoBuffer?: Buffer | null;
  logoMime?: 'png' | 'jpg' | null;
};

function s(v: string | null | undefined): string {
  return v != null && String(v).trim() !== '' ? String(v).trim() : '';
}

function formatFechaCortaPe(ymd: string): string {
  const p = ymd.trim().split('-');
  if (p.length !== 3) return ymd;
  const [y, m, d] = p;
  if (!y || !m || !d) return ymd;
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y.slice(-2)}`;
}

function formatFechaLargaEsPe(ymd: string): string {
  const p = ymd.trim().split('-').map((x) => parseInt(x, 10));
  if (p.length !== 3 || p.some((n) => !Number.isFinite(n))) return ymd;
  const [y, m, d] = p;
  const dt = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dt);
}

function guessImageType(buf: Buffer): 'png' | 'jpg' {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  return 'png';
}

function bulletLines(raw: string | null | undefined): string[] {
  const t = s(raw);
  if (!t) return [];
  return t
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function headerTable(
  row: InformeServicioPagina1Row,
  logoBuffer: Buffer | null,
  logoMime: 'png' | 'jpg' | null,
): Table {
  const nomCom = s(row.nombrecomercial) || s(row.razonsocial);
  const leftChildren: (Paragraph | Table)[] = [];

  if (logoBuffer && logoBuffer.length > 0) {
    const type = logoMime ?? guessImageType(logoBuffer);
    leftChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            type,
            data: logoBuffer,
            transformation: { width: 120, height: 48 },
          }),
        ],
      }),
    );
  }

  leftChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: nomCom, bold: true, size: 22 }),
      ],
    }),
  );

  const cel = s(row.celularempresa);
  const mail = s(row.correoempresa);
  const rightBits: string[] = [];
  if (cel) rightBits.push(cel);
  if (mail) rightBits.push(mail);
  const rightParas: Paragraph[] =
    rightBits.length > 0
      ? rightBits.map(
          (line) =>
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: line, size: 18 })],
            }),
        )
      : [new Paragraph({ text: '' })];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 52, type: WidthType.PERCENTAGE },
            children: leftChildren,
          }),
          new TableCell({
            verticalAlign: VerticalAlign.TOP,
            width: { size: 48, type: WidthType.PERCENTAGE },
            children: rightParas,
          }),
        ],
      }),
    ],
  });
}

export async function buildInformeServicioPrimeraPaginaBuffer(
  input: InformeServicioPrimeraPaginaInput,
): Promise<Buffer> {
  const { row, fechaInicioYmd, fechaFinYmd, fechaEmisionYmd } = input;
  const logoBuf =
    input.logoBuffer && input.logoBuffer.length > 0 ? input.logoBuffer : null;
  const logoMime = input.logoMime ?? null;

  const eslogan = s(row.eslogan_anio);
  const ciudad = s(row.ciudad_documento) || 'Piura';
  const destinatario = s(row.linea_destinatario);
  const puesto = s(row.puesto_trabajo) || '(puesto según contrato)';
  const preparador = s(row.nombrecompletotrabajador);
  const periodoDe = formatFechaCortaPe(fechaInicioYmd);
  const periodoAl = formatFechaCortaPe(fechaFinYmd);
  const fechaLarga = formatFechaLargaEsPe(fechaEmisionYmd);

  const bullets = bulletLines(row.texto_actividades_bullets);
  const resumen = s(row.texto_resumen_labores);
  const notaPie = s(row.nota_pie_pagina1);

  const children: Paragraph[] = [];

  if (eslogan) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: eslogan, bold: true, size: 22 })],
      }),
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'INFORME DE SERVICIO',
          bold: true,
          size: 28,
          allCaps: true,
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'A: ', bold: true }),
        new TextRun({ text: destinatario || s(row.razonsocial) }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: 'Asunto: Informe de servicio.' })],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'Referencia: ', bold: true }),
        new TextRun({
          text: `Contrato de Locación de Servicios - ${puesto}`,
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: 'Fecha: ', bold: true }),
        new TextRun({ text: `${ciudad}, ${fechaLarga}` }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text:
            'Por medio del presente informe se comunica el desarrollo de las labores en el periodo comprendido entre el ',
        }),
        new TextRun({ text: periodoDe, bold: true }),
        new TextRun({ text: ' al ' }),
        new TextRun({ text: periodoAl, bold: true }),
        new TextRun({
          text: `, desempeñando el puesto o labor de ${puesto}, en el marco del contrato de locación de servicios.`,
        }),
      ],
    }),
  );

  if (resumen) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { after: 160 },
        children: [new TextRun({ text: resumen })],
      }),
    );
  }

  if (bullets.length > 0) {
    for (const line of bullets) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          bullet: { level: 0 },
          children: [new TextRun({ text: line })],
        }),
      );
    }
    children.push(new Paragraph({ text: '' }));
  }

  children.push(
    new Paragraph({
      spacing: { before: 400, after: 80 },
      children: [new TextRun({ text: 'Preparado por:' })],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 120 },
      border: {
        bottom: { style: 'single', size: 6, color: '000000' },
      },
      children: [new TextRun({ text: '\u00a0' })],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: preparador || '(apellidos y nombres completos)',
          italics: true,
        }),
      ],
    }),
  );

  if (notaPie) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { before: 200 },
        children: [new TextRun({ text: notaPie, italics: true, size: 18 })],
      }),
    );
  }

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [headerTable(row, logoBuf, logoMime)],
          }),
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
