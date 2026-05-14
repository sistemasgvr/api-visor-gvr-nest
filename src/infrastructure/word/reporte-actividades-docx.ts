import type {
  ActividadInformeServicioLinea,
  DatosReporteActividadesRow,
} from '../../domain/repositories/control-operativo.repository.interface';
import { normalizeStoredValueToYmd } from '../../shared/utils/date.util';
import axios from 'axios';
import { rasterBufferDocxDisplayTransformation, rasterBufferToDocxRaster } from '../images/raster-buffer-to-docx-raster';
import {
  AlignmentType,
  convertInchesToTwip,
  Document,
  ExternalHyperlink,
  Header,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';

/** Textos fijos de la primera página (no en genconfiguraciongeneral). */
const TEXTO_RESUMEN_LABORES_P1 =
  'Las labores que se realizaron se detallan a continuación:';
const NOTA_PIE_PAGINA1 =
  'INDICACIONES: EN LAS SIGUIENTES PAGINAS DETALLAR LABORES SEGÚN CORRESPONDA';

const MAX_EVIDENCIA_BYTES = 6_000_000;

export type ReporteActividadesPrimeraPaginaInput = {
  row: DatosReporteActividadesRow;
  fechaInicioYmd: string;
  fechaFinYmd: string;
  fechaEmisionYmd: string;
  actividadesDetalle?: ActividadInformeServicioLinea[];
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

function formatHorasPe(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function fechaJornadaLegible(raw: string | null | undefined): string {
  const ymd = normalizeStoredValueToYmd(raw);
  if (!ymd) return '—';
  return formatFechaLargaEsPe(ymd);
}

function guessImageType(buf: Buffer): 'png' | 'jpg' {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  return 'png';
}

function labelValueTable(pairs: { label: string; value: string }[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: pairs.map(
      ({ label, value }) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: label, bold: true, size: 22 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.BOTH,
                  children: [new TextRun({ text: value || '—', size: 22 })],
                }),
              ],
            }),
          ],
        }),
    ),
  });
}

function sniffRasterImageMime(buf: Buffer): 'png' | 'jpg' | null {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'png';
  }
  return null;
}

/** Descarga la URL; prioriza conversión sharp (p. ej. WebP → PNG/JPEG) para Word. */
async function tryFetchRasterEvidence(
  url: string,
): Promise<{ buffer: Buffer; mime: 'png' | 'jpg' } | null> {
  const u = url.trim();
  if (!u.startsWith('http://') && !u.startsWith('https://')) return null;
  try {
    const res = await axios.get<ArrayBuffer>(u, {
      responseType: 'arraybuffer',
      timeout: 25000,
      maxContentLength: MAX_EVIDENCIA_BYTES,
      validateStatus: (st) => st >= 200 && st < 400,
    });
    const buf = Buffer.from(res.data);
    if (buf.length < 8 || buf.length > MAX_EVIDENCIA_BYTES) return null;

    const converted = await rasterBufferToDocxRaster(buf);
    if (converted) return converted;

    const sniffed = sniffRasterImageMime(buf);
    if (sniffed) {
      return { buffer: buf, mime: sniffed };
    }

    const ct = String(res.headers['content-type'] || '').toLowerCase();
    if (ct.includes('image/jpeg') || ct.includes('image/jpg')) {
      return { buffer: buf, mime: 'jpg' };
    }
    if (ct.includes('image/png')) {
      return { buffer: buf, mime: 'png' };
    }
    return null;
  } catch {
    return null;
  }
}

function evidenciaHyperlinkParagraph(
  label: string,
  href: string,
  index: number,
): Paragraph {
  const safeHref = href.trim();
  const display = label || `Evidencia ${index}`;
  if (safeHref.startsWith('http://') || safeHref.startsWith('https://')) {
    return new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: `${index}. `, size: 20 }),
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: display,
              style: 'Hyperlink',
              size: 20,
            }),
          ],
          link: safeHref,
        }),
      ],
    });
  }
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({
        size: 20,
        text: `${index}. ${display}${safeHref ? ` — ${safeHref}` : ''}`,
      }),
    ],
  });
}

async function appendEvidenciasForActividad(
  children: (Paragraph | Table)[],
  a: ActividadInformeServicioLinea,
): Promise<void> {
  const linkLegacy = s(a.linkevidencia);
  if (linkLegacy) {
    const isHttp =
      linkLegacy.startsWith('http://') || linkLegacy.startsWith('https://');
    if (isHttp) {
      const img = await tryFetchRasterEvidence(linkLegacy);
      if (img) {
        const t = await rasterBufferDocxDisplayTransformation(img.buffer);
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'Enlace / evidencia de actividad (imagen): ',
                bold: true,
                size: 22,
              }),
            ],
          }),
        );
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new ImageRun({
                type: img.mime,
                data: img.buffer,
                transformation: t,
              }),
            ],
          }),
        );
      } else {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({ text: 'Enlace de actividad: ', bold: true, size: 22 }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text:
                      linkLegacy.length > 100
                        ? `${linkLegacy.slice(0, 97)}…`
                        : linkLegacy,
                    style: 'Hyperlink',
                    size: 20,
                  }),
                ],
                link: linkLegacy,
              }),
            ],
          }),
        );
      }
    } else {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: 'Enlace de actividad: ', bold: true, size: 22 }),
            new TextRun({ text: linkLegacy, size: 20 }),
          ],
        }),
      );
    }
  }

  const evs = a.evidencias ?? [];
  if (evs.length === 0) return;

  children.push(
    new Paragraph({
      spacing: { before: 160, after: 80 },
      children: [new TextRun({ text: 'Evidencias', bold: true, size: 22 })],
    }),
  );

  let ei = 0;
  for (const ev of evs) {
    ei += 1;
    const href = s(ev.viewUrl) || s(ev.url);
    const label = s(ev.nombreOriginal) || `Archivo ${ei}`;

    if (href) {
      const preview = await tryFetchRasterEvidence(href);
      if (preview) {
        const t = await rasterBufferDocxDisplayTransformation(preview.buffer);
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `${ei}. `, bold: true, size: 20 }),
              new TextRun({ text: label, size: 20 }),
            ],
          }),
        );
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new ImageRun({
                type: preview.mime,
                data: preview.buffer,
                transformation: t,
              }),
            ],
          }),
        );
      } else {
        children.push(evidenciaHyperlinkParagraph(label, href, ei));
      }
    } else {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              size: 20,
              text: `${ei}. ${label} (sin URL)`,
              italics: true,
            }),
          ],
        }),
      );
    }
  }
}

async function appendDetalleActividades(
  children: (Paragraph | Table)[],
  actividades: ActividadInformeServicioLinea[],
): Promise<void> {
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { before: 360, after: 200 },
      children: [
        new TextRun({
          text: 'REGISTRO DETALLADO DE ACTIVIDADES',
          bold: true,
          size: 26,
          allCaps: true,
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { after: 240 },
      children: [
        new TextRun({
          size: 22,
          text:
            'Detalle de cada actividad: datos generales, descripción, enlace libre si existe, y evidencias con enlace (o vista previa si la imagen está disponible).',
        }),
      ],
    }),
  );

  if (actividades.length === 0) {
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            italics: true,
            size: 22,
            text: 'No hay actividades registradas en el periodo seleccionado.',
          }),
        ],
      }),
    );
    return;
  }

  let idx = 0;
  for (const a of actividades) {
    idx += 1;
    const titulo = s(a.nombreactividad) || `Actividad ${idx}`;
    children.push(
      new Paragraph({
        spacing: { before: idx === 1 ? 120 : 360, after: 120 },
        children: [
          new TextRun({ text: `${idx}. `, bold: true, size: 24 }),
          new TextRun({ text: titulo, bold: true, size: 24 }),
        ],
      }),
    );

    children.push(
      labelValueTable([
        { label: 'Fecha de jornada', value: fechaJornadaLegible(a.diajornada) },
        { label: 'Proyecto', value: s(a.nombreproyecto) },
        { label: 'Modalidad', value: s(a.nombremodalidad) },
        { label: 'Horas dedicadas', value: formatHorasPe(a.horasdedicadas) },
        { label: 'Estado', value: s(a.estadoactividad) },
      ]),
    );

    children.push(
      new Paragraph({
        spacing: { before: 160, after: 80 },
        children: [new TextRun({ text: 'Descripción', bold: true, size: 22 })],
      }),
    );
    const desc = s(a.descripciondetallada);
    children.push(
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { after: 120 },
        children: [
          new TextRun({
            size: 22,
            text: desc || '(Sin descripción detallada registrada.)',
            ...(desc ? {} : { italics: true }),
          }),
        ],
      }),
    );

    await appendEvidenciasForActividad(children, a);
  }
}

function headerTable(
  row: DatosReporteActividadesRow,
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
  if (leftChildren.length === 0) {
    leftChildren.push(new Paragraph({ text: '' }));
  }

  const cel = s(row.celularempresa);
  const mail = s(row.correoempresa);
  const rightParas: Paragraph[] = [];
  if (nomCom) {
    rightParas.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: cel || mail ? 80 : 0 },
        children: [new TextRun({ text: nomCom, bold: true, size: 22 })],
      }),
    );
  }
  if (cel) {
    rightParas.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: cel, size: 18 })],
      }),
    );
  }
  if (mail) {
    rightParas.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: mail, size: 18 })],
      }),
    );
  }
  if (rightParas.length === 0) {
    rightParas.push(new Paragraph({ text: '' }));
  }

  return new Table({
    borders: TableBorders.NONE,
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

/** Informe de servicio: portada + salto de página + detalle de actividades. */
export async function buildReporteActividadesPrimeraPaginaBuffer(
  input: ReporteActividadesPrimeraPaginaInput,
): Promise<Buffer> {
  const { row, fechaInicioYmd, fechaFinYmd, fechaEmisionYmd } = input;
  const logoBuf =
    input.logoBuffer && input.logoBuffer.length > 0 ? input.logoBuffer : null;
  const logoMime = input.logoMime ?? null;

  const eslogan = s(row.eslogan_anio);
  const ciudad = s(row.ciudad_documento);
  const destinatario = s(row.linea_destinatario);
  const puesto = s(row.puesto_trabajo) || '(puesto según contrato)';
  const preparador = s(row.nombrecompletotrabajador);
  const nombreReferencia =
    preparador || '(apellidos y nombres completos)';
  const periodoDe = formatFechaCortaPe(fechaInicioYmd);
  const periodoAl = formatFechaCortaPe(fechaFinYmd);
  const fechaLarga = formatFechaLargaEsPe(fechaEmisionYmd);
  const ubicacionFecha =
    ciudad.length > 0 ? `${ciudad}, ${fechaLarga}` : fechaLarga;

  const actividades = input.actividadesDetalle ?? [];
  const bullets = actividades.map((a) => s(a.linea)).filter(Boolean);
  const resumen = TEXTO_RESUMEN_LABORES_P1;
  const notaPie = NOTA_PIE_PAGINA1;

  const children: (Paragraph | Table)[] = [];

  if (eslogan) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 180 },
        children: [new TextRun({ text: eslogan, bold: true, size: 22 })],
      }),
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: eslogan ? 0 : 120, after: 280 },
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
      spacing: { after: 180 },
      children: [
        new TextRun({ text: 'A: ', bold: true }),
        new TextRun({ text: destinatario || s(row.razonsocial) }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 180 },
      children: [new TextRun({ text: 'Asunto: Informe de servicio.' })],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 180 },
      children: [
        new TextRun({ text: 'Referencia: ', bold: true }),
        new TextRun({
          text: `Contrato de Locación de Servicios - ${nombreReferencia}`,
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 280 },
      children: [
        new TextRun({ text: 'Fecha: ', bold: true }),
        new TextRun({ text: ubicacionFecha }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { after: 280 },
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

  children.push(
    new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { after: 220 },
      children: [new TextRun({ text: resumen })],
    }),
  );

  if (bullets.length > 0) {
    for (const line of bullets) {
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          bullet: { level: 0 },
          children: [new TextRun({ text: line })],
        }),
      );
    }
    children.push(new Paragraph({ text: '' }));
  }

  children.push(
    new Paragraph({
      spacing: { after: 280 },
      children: [new TextRun({ text: '\u00a0' })],
    }),
  );
  children.push(
    new Paragraph({
      spacing: { after: 360 },
      children: [new TextRun({ text: '\u00a0' })],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { before: 560, after: 100 },
      children: [new TextRun({ text: 'Preparado por:' })],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 160 },
      border: {
        bottom: { style: 'single', size: 6, color: '000000' },
      },
      children: [new TextRun({ text: '\u00a0' })],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 320 },
      children: [
        new TextRun({
          text: nombreReferencia,
          italics: true,
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { before: 280, after: 480 },
      children: [new TextRun({ text: notaPie, italics: true, size: 18 })],
    }),
  );

  await appendDetalleActividades(children, actividades);

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              headerTable(row, logoBuf, logoMime),
              /** Aire bajo la tabla del encabezado (cada página); w:pgMar `header` no separa el cuerpo del dibujo. */
              new Paragraph({
                spacing: { after: 480 },
                children: [new TextRun({ text: '\u00a0' })],
              }),
            ],
          }),
        },
        /** Margen superior mayor: el cuerpo arranca más abajo, lejos del bloque del encabezado. */
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1.35),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              footer: convertInchesToTwip(0.5),
              gutter: 0,
            },
          },
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
