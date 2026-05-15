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
  Footer,
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
  firmaBuffer?: Buffer | null;
  firmaMime?: 'png' | 'jpg' | null;
  /**
   * Si false (defecto legal), no se muestra «Horas dedicadas» en el detalle por actividad.
   * Solo true para roles en `REPORTE_ACTIVIDAD_WORD_ROLES_CON_HORAS_DEDICADAS`.
   */
  incluirHorasDedicadasEnDetalle?: boolean;
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

/** Iguala espacios y guiones para detectar líneas repetidas (“Desarrollo Web - …” duplicadas). */
function normalizarParaClaveViñeta(line: string): string {
  return line
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*([\-–—])\s*/g, '—')
    .toLowerCase();
}

/** Una viñeta por línea única (usa `linea` del SQL cuando existe; si no construye tipo - proyecto). */
function buildResumenLaboresPortada(
  actividades: ActividadInformeServicioLinea[],
): string[] {
  const ordenadas = [...actividades].sort((a, b) => {
    const da = normalizeStoredValueToYmd(a.diajornada);
    const db = normalizeStoredValueToYmd(b.diajornada);
    if ((da || '') !== (db || '')) {
      return (da || '').localeCompare(db || '');
    }
    const hc = s(a.horainicio).localeCompare(s(b.horainicio));
    if (hc !== 0) return hc;
    return s(a.nombreactividad).localeCompare(s(b.nombreactividad));
  });

  const vistos = new Set<string>();
  const lineas: string[] = [];
  for (const act of ordenadas) {
    const tipo = s(act.nombretipoactividad) || s(act.nombreactividad);
    const proyecto = s(act.nombreproyecto) || 'Sin proyecto';
    const baseTrim = s(act.linea);
    const base =
      baseTrim ||
      (tipo ? `${tipo.replace(/\s+/g, ' ').trim()} - ${proyecto.replace(/\s+/g, ' ').trim()}` : '');
    if (!base.trim()) continue;
    const key = normalizarParaClaveViñeta(base);
    if (!key || vistos.has(key)) continue;
    vistos.add(key);
    lineas.push(base.replace(/\s+/g, ' ').trim());
  }
  return lineas;
}

function formatHorasPe(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Encabezado de día agrupador: «Lunes 15 de mayo de 2026». */
function formatoEncabezadoDiaInforme(raw: string | null | undefined): string {
  const ymd = normalizeStoredValueToYmd(raw);
  if (!ymd) return 'Fecha de jornada no registrada';
  const parts = ymd.split('-').map((x) => parseInt(x, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return ymd;
  const [y, mo, d] = parts;
  const dt = new Date(y, mo - 1, d);
  const weekday = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
  }).format(dt);
  const weekdayCap =
    weekday.length > 0
      ? weekday.charAt(0).toUpperCase() + weekday.slice(1)
      : weekday;
  const monthName = new Intl.DateTimeFormat('es-PE', {
    month: 'long',
  }).format(dt);
  return `${weekdayCap} ${d} de ${monthName} de ${y}`;
}

function guessImageType(buf: Buffer): 'png' | 'jpg' {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  return 'png';
}

/** Una línea de texto por cada salto proveniente del SQL (dirección empresa). */
function pieFooterParagraphs(direccionPie: string | null | undefined): Paragraph[] {
  const raw = direccionPie != null ? String(direccionPie).trim() : '';
  if (!raw) return [];
  const lines = raw
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  return lines.map(
    (line) =>
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 30 },
        children: [new TextRun({ text: line, size: 18 })],
      }),
  );
}

async function paragraphFirmaTrabajadorOpcional(
  buffer: Buffer | null | undefined,
  mime: 'png' | 'jpg' | null | undefined,
): Promise<Paragraph | null> {
  if (!buffer?.length || !mime) return null;
  const t = await rasterBufferDocxDisplayTransformation(buffer, {
    maxDisplayWidth: 220,
    maxDisplayHeight: 72,
  });
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [
      new ImageRun({
        type: mime,
        data: buffer,
        transformation: t,
      }),
    ],
  });
}

/** Márgenes típicos en celdas del informe (.docx usa unidades pequeñas consistentes con el resto del documento). */
const CELDA_INFORME_MARGINS = {
  top: 60,
  bottom: 60,
  left: 120,
  right: 120,
} as const;

const ANCHO_ETIQUETA_DOBLE = 18;
const ANCHO_VALOR_DOBLE = 32;

function celdaEtiquetaInforme(texto: string, anchoPct: number): TableCell {
  return new TableCell({
    width: { size: anchoPct, type: WidthType.PERCENTAGE },
    margins: CELDA_INFORME_MARGINS,
    children: [
      new Paragraph({
        children: [new TextRun({ text: texto, bold: true, size: 22 })],
      }),
    ],
  });
}

function celdaValorInforme(texto: string, anchoPct: number): TableCell {
  return new TableCell({
    width: { size: anchoPct, type: WidthType.PERCENTAGE },
    margins: CELDA_INFORME_MARGINS,
    children: [
      new Paragraph({
        alignment: AlignmentType.BOTH,
        children: [new TextRun({ text: texto || '—', size: 22 })],
      }),
    ],
  });
}

/**
 * Tabla de datos de una actividad: fila 1 y última con etiqueta + valor ancho;
 * filas centrales en 2 columnas (etiqueta–valor | etiqueta–valor) para menos altura.
 */
function tablaActividadInformeCompacta(input: {
  nEnDia: number;
  titulo: string;
  tipo: string;
  proyecto: string;
  modalidad: string;
  horas: string;
  estado: string;
  incluirHorasDedicadas: boolean;
}): Table {
  const anchoValorExpandidoPct = ANCHO_ETIQUETA_DOBLE + ANCHO_VALOR_DOBLE * 2;
  const filaModalidadHoras = input.incluirHorasDedicadas
    ? new TableRow({
        children: [
          celdaEtiquetaInforme('Modalidad', ANCHO_ETIQUETA_DOBLE),
          celdaValorInforme(input.modalidad, ANCHO_VALOR_DOBLE),
          celdaEtiquetaInforme('Horas dedicadas', ANCHO_ETIQUETA_DOBLE),
          celdaValorInforme(input.horas, ANCHO_VALOR_DOBLE),
        ],
      })
    : new TableRow({
        children: [
          celdaEtiquetaInforme('Modalidad', ANCHO_ETIQUETA_DOBLE),
          new TableCell({
            columnSpan: 3,
            width: {
              size: anchoValorExpandidoPct,
              type: WidthType.PERCENTAGE,
            },
            margins: CELDA_INFORME_MARGINS,
            children: [
              new Paragraph({
                alignment: AlignmentType.BOTH,
                children: [
                  new TextRun({
                    text: input.modalidad || '—',
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          celdaEtiquetaInforme(`Actividad ${input.nEnDia}`, ANCHO_ETIQUETA_DOBLE),
          new TableCell({
            columnSpan: 3,
            width: { size: anchoValorExpandidoPct, type: WidthType.PERCENTAGE },
            margins: CELDA_INFORME_MARGINS,
            children: [
              new Paragraph({
                alignment: AlignmentType.BOTH,
                children: [new TextRun({ text: input.titulo || '—', size: 22 })],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          celdaEtiquetaInforme('Tipo de actividad', ANCHO_ETIQUETA_DOBLE),
          celdaValorInforme(input.tipo, ANCHO_VALOR_DOBLE),
          celdaEtiquetaInforme('Proyecto', ANCHO_ETIQUETA_DOBLE),
          celdaValorInforme(input.proyecto, ANCHO_VALOR_DOBLE),
        ],
      }),
      filaModalidadHoras,
      new TableRow({
        children: [
          celdaEtiquetaInforme('Estado', ANCHO_ETIQUETA_DOBLE),
          new TableCell({
            columnSpan: 3,
            width: { size: anchoValorExpandidoPct, type: WidthType.PERCENTAGE },
            margins: CELDA_INFORME_MARGINS,
            children: [
              new Paragraph({
                alignment: AlignmentType.BOTH,
                children: [new TextRun({ text: input.estado || '—', size: 22 })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function spacerAntesBloqueActividad(espacioAntes: number): Paragraph {
  return new Paragraph({
    spacing: { before: espacioAntes, after: 0 },
    children: [new TextRun({ text: '\u200b', size: 8 })],
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
  incluirHorasDedicadas: boolean,
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

  const ordenadas = [...actividades].sort((a, b) => {
    const da = normalizeStoredValueToYmd(a.diajornada) || '';
    const db = normalizeStoredValueToYmd(b.diajornada) || '';
    if (da !== db) return da.localeCompare(db);
    return s(a.horainicio).localeCompare(s(b.horainicio));
  });

  let diaAnterior = '';
  /** Primera fila tras el párrafo introductorio de la sección (control de espacio vertical). */
  let primerEncabezadoDiaDelDocumento = true;
  let nEnDia = 0;

  for (const a of ordenadas) {
    const ymdKey = normalizeStoredValueToYmd(a.diajornada) || '__sin_fecha__';
    if (ymdKey !== diaAnterior) {
      diaAnterior = ymdKey;
      nEnDia = 0;
      const textoDia =
        ymdKey === '__sin_fecha__'
          ? 'Sin fecha de jornada registrada'
          : formatoEncabezadoDiaInforme(a.diajornada);
      children.push(
        new Paragraph({
          spacing: {
            before: primerEncabezadoDiaDelDocumento ? 120 : 460,
            after: 140,
          },
          bullet: { level: 0 },
          children: [
            new TextRun({ text: textoDia, bold: true, size: 24 }),
          ],
        }),
      );
      primerEncabezadoDiaDelDocumento = false;
    }

    nEnDia += 1;
    const titulo = s(a.nombreactividad) || `Sin título (${nEnDia})`;

    children.push(
      spacerAntesBloqueActividad(nEnDia === 1 ? 100 : 180),
    );

    children.push(
      tablaActividadInformeCompacta({
        nEnDia,
        titulo,
        tipo: s(a.nombretipoactividad) || s(a.nombreactividad) || '—',
        proyecto: s(a.nombreproyecto),
        modalidad: s(a.nombremodalidad),
        horas: formatHorasPe(a.horasdedicadas),
        estado: s(a.estadoactividad),
        incluirHorasDedicadas,
      }),
    );

    children.push(
      new Paragraph({
        spacing: { before: 160, after: 80 },
        indent: {
          left: convertInchesToTwip(0.4),
        },
        children: [new TextRun({ text: 'Descripción', bold: true, size: 22 })],
      }),
    );
    const desc = s(a.descripciondetallada);
    children.push(
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { after: 120 },
        indent: {
          left: convertInchesToTwip(0.4),
        },
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
  const puestoContrato = s(row.puesto_trabajo);
  const puestoInforme =
    puestoContrato.length > 0 ? puestoContrato : 'puesto según contrato';
  const preparador = s(row.nombrecompletotrabajador);
  const nombreFirma =
    preparador || '(apellidos y nombres completos)';
  const periodoDe = formatFechaCortaPe(fechaInicioYmd);
  const periodoAl = formatFechaCortaPe(fechaFinYmd);
  const fechaLarga = formatFechaLargaEsPe(fechaEmisionYmd);
  const ubicacionFecha =
    ciudad.length > 0 ? `${ciudad}, ${fechaLarga}` : fechaLarga;

  const footerParas = pieFooterParagraphs(row.direccion_pie_empresa);

  const actividades = input.actividadesDetalle ?? [];
  const bullets = buildResumenLaboresPortada(actividades);
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
          text: `Contrato de Locación de Servicios - ${puestoInforme}`,
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
            'El presente informe detalla las actividades llevadas a cabo en el periodo comprendido entre el ',
        }),
        new TextRun({ text: periodoDe, bold: true }),
        new TextRun({ text: ' y el ' }),
        new TextRun({ text: periodoAl, bold: true }),
        new TextRun({
          text:
            ', según el contrato de locación de servicios como ',
        }),
        new TextRun({ text: puestoInforme, bold: true }),
        new TextRun({
          text: ', correspondiente al puesto del colaborador.',
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

  const firmaP = await paragraphFirmaTrabajadorOpcional(
    input.firmaBuffer != null && input.firmaBuffer.length > 0
      ? input.firmaBuffer
      : null,
    input.firmaMime ?? null,
  );
  if (firmaP) {
    children.push(firmaP);
  }

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
          text: nombreFirma,
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

  await appendDetalleActividades(
    children,
    actividades,
    input.incluirHorasDedicadasEnDetalle === true,
  );

  const sectionBase = {
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
          footer:
            footerParas.length > 0
              ? convertInchesToTwip(0.65)
              : convertInchesToTwip(0.5),
          gutter: 0,
        },
      },
    },
    children,
  } as const;

  const doc = new Document({
    sections: [
      footerParas.length > 0
        ? {
            ...sectionBase,
            footers: {
              default: new Footer({ children: footerParas }),
            },
          }
        : sectionBase,
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
