import { PdfRenderOptions } from 'src/domain/services/html-pdf-generator.interface';
import { ExportarIncidenciasDto } from 'src/application/dtos/acc/issues/exportar-incidencias.dto';

// ────────────────────────────────────────────────────────────────
// Tipos del modelo de datos del template
// ────────────────────────────────────────────────────────────────

export interface FieldRow {
  label: string;
  value: string;
  isEstado: boolean;
  /** Clase CSS fija (p. ej. issue-status-open); evita Handlebars dentro de style="" para el linter. */
  statusCssClass: string;
  isTipo: boolean;
  tipoLetra: string;
  isPosicion: boolean;
  /** true cuando la fecha de vencimiento ya pasó → texto en naranja */
  isVencido: boolean;
}

export interface VinculoArchivoItem {
  titulo: string;
  campos: { label: string; value: string }[];
}

export interface FotoItem {
  nombre: string;
  creadoEl: string;
  creadoPor: string;
  base64: string | null;
}

export interface ComentarioItem {
  creador: string;
  fecha: string;
  texto: string;
  avatarBase64: string | null;
  iniciales: string;
  /** Clase avatar-tone-0 … avatar-tone-9 según hash del nombre */
  avatarToneClass: string;
}

export interface IssueTemplateItem {
  id: string;
  titulo: string;
  camposEstandar: FieldRow[];
  informacionPlano: { label: string; value: string }[];
  camposPersonalizados: { label: string; value: string }[];
  vinculosArchivo: VinculoArchivoItem[];
  fotos: FotoItem[];
  otrasReferencias: { label: string; value: string }[];
  comentarios: ComentarioItem[];
}

export interface AccIssuesReportTemplateData extends Record<string, unknown> {
  nombreProyecto: string;
  tituloReporte: string;
  usuarioCreador: string;
  emailCreador: string;
  fechaCreacion: string;
  incluirCubierta: boolean;
  incluirIndice: boolean;
  totalIncidencias: number;
  filtrosTexto: string;
  indice: { id: string; titulo: string; pagina: number }[];
  opciones: {
    incluirFotos: boolean;
    tamañoFotos: string;
    incluirComentarios: boolean;
    incluirInformacionGeneralPlano: boolean;
    incluirCamposPersonalizados: boolean;
    incluirVinculosArchivo: boolean;
    incluirOtrasReferencias: boolean;
  };
  incidencias: IssueTemplateItem[];
}

export interface IssueReportMapperResult {
  templateData: AccIssuesReportTemplateData;
  renderOptions: PdfRenderOptions;
}

// ────────────────────────────────────────────────────────────────
// Tipos de entrada del mapper
// ────────────────────────────────────────────────────────────────

export interface IssueReportMapperInput {
  incidencias: any[];
  nombreProyecto: string;
  usuarioCreador: string;
  emailCreador: string;
  fechaCreacion: Date;
  dto: ExportarIncidenciasDto;
  downloadImageCallback?: (
    userId: number,
    projectId: string,
    issueId: string,
    adjunto: any,
  ) => Promise<Buffer | null>;
  userId?: number;
  projectId?: string;
}

// ────────────────────────────────────────────────────────────────
// Mapper
// ────────────────────────────────────────────────────────────────

export class IssueReportMapper {
  static async toTemplateData(
    input: IssueReportMapperInput,
  ): Promise<IssueReportMapperResult> {
    const { dto, incidencias, nombreProyecto, usuarioCreador, emailCreador, fechaCreacion } =
      input;

    const fechaFormateada = IssueReportMapper.formatDate(fechaCreacion, true);

    const issueItems = await Promise.all(
      incidencias.map((inc) =>
        IssueReportMapper.mapIssue(inc, usuarioCreador, emailCreador, dto, input),
      ),
    );

    const pageOffset =
      (dto.incluirCubierta ? 1 : 0) + (dto.incluirIndice ? 1 : 0) + 1;
    const indice = issueItems.map((i, idx) => ({
      id: i.id,
      titulo: i.titulo,
      pagina: pageOffset + idx,
    }));

    const templateData: AccIssuesReportTemplateData = {
      nombreProyecto,
      tituloReporte: dto.titulo || 'Detalle de la incidencia',
      usuarioCreador,
      emailCreador,
      fechaCreacion: fechaFormateada,
      incluirCubierta: dto.incluirCubierta ?? false,
      incluirIndice: dto.incluirIndice ?? false,
      totalIncidencias: incidencias.length,
      filtrosTexto: IssueReportMapper.buildFiltrosTexto(dto),
      indice,
      opciones: {
        incluirFotos: dto.incluirFotos ?? true,
        tamañoFotos: dto.tamañoFotos || 'normal',
        incluirComentarios: dto.incluirComentarios ?? true,
        incluirInformacionGeneralPlano: dto.incluirInformacionGeneralPlano ?? false,
        incluirCamposPersonalizados: dto.incluirCamposPersonalizados ?? true,
        incluirVinculosArchivo: dto.incluirVinculosArchivo ?? true,
        incluirOtrasReferencias: dto.incluirOtrasReferencias ?? true,
      },
      incidencias: issueItems,
    };

    const renderOptions: PdfRenderOptions = {
      format: 'A4',
      displayHeaderFooter: true,
      headerTemplate: IssueReportMapper.buildHeaderTemplate(nombreProyecto, dto.titulo || 'Detalle de la incidencia'),
      footerTemplate: IssueReportMapper.buildFooterTemplate(usuarioCreador, fechaFormateada),
      margin: { top: '28mm', right: '15mm', bottom: '22mm', left: '15mm' },
    };

    return { templateData, renderOptions };
  }

  // ── Mapeo de cada incidencia ──────────────────────────────────

  private static async mapIssue(
    inc: any,
    usuarioCreador: string,
    emailCreador: string,
    dto: ExportarIncidenciasDto,
    input: IssueReportMapperInput,
  ): Promise<IssueTemplateItem> {
    const camposEstandar = IssueReportMapper.buildCamposEstandar(inc, usuarioCreador, emailCreador);

    const informacionPlano =
      dto.incluirInformacionGeneralPlano
        ? IssueReportMapper.buildInformacionPlano(inc)
        : [];

    const camposPersonalizados =
      dto.incluirCamposPersonalizados && inc.customAttributes?.length > 0
        ? IssueReportMapper.buildCamposPersonalizados(inc.customAttributes)
        : [];

    const vinculosArchivo =
      dto.incluirVinculosArchivo && inc.linkedDocuments?.length > 0
        ? IssueReportMapper.buildVinculosArchivo(inc.linkedDocuments)
        : [];

    const fotos =
      dto.incluirFotos
        ? await IssueReportMapper.buildFotos(inc, dto, input)
        : [];

    const otrasReferencias =
      dto.incluirOtrasReferencias
        ? IssueReportMapper.buildOtrasReferencias(inc)
        : [];

    const comentarios =
      dto.incluirComentarios && inc.comentarios?.length > 0
        ? IssueReportMapper.buildComentarios(inc.comentarios, usuarioCreador)
        : [];

    return {
      id: inc.displayId || inc.id,
      titulo: inc.title || 'Sin título',
      camposEstandar,
      informacionPlano,
      camposPersonalizados,
      vinculosArchivo,
      fotos,
      otrasReferencias,
      comentarios,
    };
  }

  // ── Campos estándar ──────────────────────────────────────────

  private static buildCamposEstandar(
    inc: any,
    usuarioCreador: string,
    emailCreador: string,
  ): FieldRow[] {
    const f = (
      label: string,
      value: string,
      tipo?: 'estado' | 'tipo' | 'posicion',
      extra?: { statusCssClass?: string; tipoLetra?: string; isVencido?: boolean },
    ): FieldRow => ({
      label,
      value,
      isEstado: tipo === 'estado',
      statusCssClass: extra?.statusCssClass ?? '',
      isTipo: tipo === 'tipo',
      tipoLetra: extra?.tipoLetra ?? '',
      isPosicion: tipo === 'posicion',
      isVencido: extra?.isVencido ?? false,
    });

    const statusLabel = IssueReportMapper.getStatusLabel(inc.status);
    const statusCssClass = IssueReportMapper.getStatusCssClass(inc.status);

    let tipoTexto = inc.issueSubtypeName || inc.issueTypeName || 'Design';
    if (inc.issueTypeName && inc.issueSubtypeName) {
      tipoTexto = `${inc.issueTypeName} > ${inc.issueSubtypeName}`;
    }
    const tipoLetra = tipoTexto.charAt(0).toUpperCase();

    const asignadoA =
      inc.assignedToRealMultiple?.map((u: any) => u.usuario).join(', ') ||
      inc.assignedToReal || '—';

    const creadoPor = `${inc.createdByReal || usuarioCreador} (${emailCreador})`;

    const creadoEl = inc.createdAt
      ? IssueReportMapper.formatDate(new Date(inc.createdAt), false)
      : '—';

    let vencimiento = '—';
    let isVencido = false;
    if (inc.dueDate) {
      const due = new Date(inc.dueDate);
      const dias = Math.floor((Date.now() - due.getTime()) / 86400000);
      const fecha = IssueReportMapper.formatDate(due, false);
      isVencido = dias > 0;
      vencimiento = isVencido ? `${fecha} (${dias} días tarde)` : fecha;
    }

    const fechaInicio = inc.startDate
      ? IssueReportMapper.formatDate(new Date(inc.startDate), false)
      : '—';

    const posicion =
      inc.linkedDocuments?.[0]?.details?.viewable?.name ||
      inc.linkedDocuments?.[0]?.urn?.split('/').pop() || '—';

    return [
      f('Estado', statusLabel, 'estado', { statusCssClass }),
      f('Tipo', tipoTexto, 'tipo', { tipoLetra }),
      f('Descripción', inc.description || '—'),
      f('Asignado a', asignadoA),
      f('Creado por', creadoPor),
      f('Creado el', creadoEl),
      f('Ubicación', inc.locationId || '—'),
      f('Detalles de la ubicación', inc.locationDetails || '—'),
      f('Vencimiento', vencimiento, undefined, { isVencido }),
      f('Fecha de inicio', fechaInicio),
      f('Posición', posicion, 'posicion'),
      f('Causa principal', inc.rootCauseId || '—'),
    ];
  }

  // ── Información del plano ─────────────────────────────────────

  private static buildInformacionPlano(inc: any): { label: string; value: string }[] {
    const campos: { label: string; value: string }[] = [];
    const ld = inc.linkedDocuments?.[0];
    if (!ld) return campos;
    if (ld.details?.viewable?.name) campos.push({ label: 'Nombre del documento', value: ld.details.viewable.name });
    if (ld.urn) campos.push({ label: 'URN', value: ld.urn });
    if (ld.createdAt) campos.push({ label: 'Fecha de creación', value: IssueReportMapper.formatDate(new Date(ld.createdAt), true) });
    if (ld.createdBy) campos.push({ label: 'Creado por', value: ld.createdBy });
    return campos;
  }

  // ── Campos personalizados ─────────────────────────────────────

  private static buildCamposPersonalizados(attrs: any[]): { label: string; value: string }[] {
    return attrs.map((a) => ({
      label: a.name || a.label || a.id || 'Campo',
      value: a.value != null ? (typeof a.value === 'object' ? JSON.stringify(a.value) : String(a.value)) : '—',
    }));
  }

  // ── Vínculos de archivo ───────────────────────────────────────

  private static buildVinculosArchivo(linkedDocs: any[]): VinculoArchivoItem[] {
    return linkedDocs.map((ld, idx) => {
      const campos: { label: string; value: string }[] = [];
      if (ld.type) campos.push({ label: 'Tipo', value: ld.type });
      if (ld.urn) campos.push({ label: 'URN', value: ld.urn });
      if (ld.createdAt) campos.push({ label: 'Fecha de creación', value: IssueReportMapper.formatDate(new Date(ld.createdAt), true) });
      if (ld.createdBy) campos.push({ label: 'Creado por', value: ld.createdBy });
      if (ld.createdAtVersion) campos.push({ label: 'Versión', value: String(ld.createdAtVersion) });
      return { titulo: `Documento ${idx + 1}`, campos };
    });
  }

  // ── Fotos ─────────────────────────────────────────────────────

  private static async buildFotos(
    inc: any,
    dto: ExportarIncidenciasDto,
    input: IssueReportMapperInput,
  ): Promise<FotoItem[]> {
    const adjuntos: any[] = inc.adjuntos || [];
    const fotos = adjuntos.filter((a: any) => {
      if (a.type === 'photo' || a.attachmentType === 'photo' || a.attachmentType === 'issue-attachment') return true;
      if (a.mimeType?.startsWith('image/')) return true;
      const ext = (a.fileName || a.displayName || a.name || '').toLowerCase().split('.').pop();
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return true;
      if (a.snapshotUrn || a.storageUrn || a.urn || a.thumbnailUrn) return true;
      return false;
    });

    return Promise.all(
      fotos.map(async (adj: any): Promise<FotoItem> => {
        let base64: string | null = null;
        try {
          if (input.downloadImageCallback && input.userId && input.projectId) {
            const buf = await input.downloadImageCallback(
              input.userId,
              input.projectId,
              inc.id,
              adj,
            );
            if (buf && buf.length <= 4 * 1024 * 1024) {
              const mime = IssueReportMapper.guessMime(adj);
              base64 = `data:${mime};base64,${buf.toString('base64')}`;
            }
          }
        } catch { /* continuar sin imagen */ }

        const nombre = adj.displayName || adj.fileName || adj.name || 'Thumbnail';
        const creadoEl = adj.createdAt ? IssueReportMapper.formatDate(new Date(adj.createdAt), true) : '';
        const creadoPor = adj.createdByReal || adj.createdBy || input.usuarioCreador;

        return { nombre, creadoEl, creadoPor, base64 };
      }),
    );
  }

  // ── Otras referencias ─────────────────────────────────────────

  private static buildOtrasReferencias(inc: any): { label: string; value: string }[] {
    const campos: { label: string; value: string }[] = [];
    if (inc.issueTypeId)     campos.push({ label: 'Issue Type ID',    value: inc.issueTypeId });
    if (inc.issueSubtypeId)  campos.push({ label: 'Issue Subtype ID', value: inc.issueSubtypeId });
    if (inc.containerId)     campos.push({ label: 'Container ID',     value: inc.containerId });
    if (inc.issueTemplateId) campos.push({ label: 'Template ID',      value: inc.issueTemplateId });
    if (inc.gpsCoordinates)  campos.push({ label: 'Coordenadas GPS',  value: inc.gpsCoordinates });
    if (inc.watchers?.length > 0) {
      campos.push({ label: 'Observadores', value: inc.watchers.map((w: any) => w.name || w.id).join(', ') });
    }
    return campos;
  }

  // ── Comentarios ───────────────────────────────────────────────

  private static buildComentarios(comentarios: any[], usuarioCreador: string): ComentarioItem[] {
    return comentarios.map((c: any): ComentarioItem => {
      const textoCompleto = c.comment || c.body || '';
      const texto = IssueReportMapper.procesarTextoComentario(textoCompleto);
      const gvr = c.gvrUsuario;
      const firmaInfo = IssueReportMapper.extraerFirmaInfo(textoCompleto);
      const creador = gvr?.nombre || firmaInfo.nombre || c.createdByReal || c.createdBy || usuarioCreador;
      const fecha = c.createdAt ? IssueReportMapper.formatDate(new Date(c.createdAt), true) : '';

      let avatarBase64: string | null = null;
      if (gvr?.fotoPerfilBuffer) {
        try {
          const buf: Buffer = gvr.fotoPerfilBuffer;
          if (buf.length <= 2 * 1024 * 1024) {
            avatarBase64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
          }
        } catch { /* sin foto */ }
      }

      return {
        creador,
        fecha,
        texto,
        avatarBase64,
        iniciales: IssueReportMapper.getIniciales(creador),
        avatarToneClass: IssueReportMapper.getAvatarToneClass(creador),
      };
    });
  }

  // ── Header / Footer Puppeteer ─────────────────────────────────

  private static buildHeaderTemplate(proyecto: string, titulo: string): string {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<div style="
        font-family:'Segoe UI',Arial,sans-serif;
        font-size:7px;
        width:100%;
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
        padding:0 15mm 4px;
        border-bottom:0.75px solid #d1d5db;
        color:#6b7280;
        box-sizing:border-box;
        line-height:1;">
      <span>${esc(proyecto)}</span>
      <span>${esc(titulo)}</span>
    </div>`;
  }

  private static buildFooterTemplate(usuario: string, fecha: string): string {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<div style="
        font-family:'Segoe UI',Arial,sans-serif;
        font-size:7px;
        width:100%;
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        padding:4px 15mm 0;
        border-top:0.75px solid #d1d5db;
        color:#6b7280;
        box-sizing:border-box;
        line-height:1;">
      <span>Creado por ${esc(usuario)} con Visor GVR el ${esc(fecha)}</span>
      <span>P&#225;gina <span class="pageNumber"></span> de <span class="totalPages"></span></span>
    </div>`;
  }

  // ── Helpers ───────────────────────────────────────────────────

  private static formatDate(date: Date, withTime: boolean): string {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    let s = `${date.getDate()} de ${meses[date.getMonth()]}. de ${date.getFullYear()}`;
    if (withTime) {
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      const off = -date.getTimezoneOffset() / 60;
      const tz = `UTC${off >= 0 ? '+' : ''}${Math.abs(off).toString().padStart(2, '0')}:00`;
      s += `, ${hh}:${mm} ${tz}`;
    }
    return s;
  }

  private static getStatusLabel(status: string): string {
    const m: Record<string, string> = {
      draft: 'Borrador',
      open: 'Abierto',
      pending: 'Pendiente',
      'in-progress': 'En Progreso',
      in_review: 'En revisión',
      closed: 'Cerrado',
    };
    return m[status] || status;
  }

  /** Clases definidas en acc-issues-report.html.
   *  Colores alineados con la paleta visual de Autodesk ACC:
   *  draft=gris, open=ámbar, pending=naranja, in-progress=naranja,
   *  in_review=púrpura, closed=verde. */
  private static getStatusCssClass(status: string): string {
    const m: Record<string, string> = {
      draft:       'issue-status-draft',
      open:        'issue-status-open',
      pending:     'issue-status-pending',
      'in-progress': 'issue-status-in-progress',
      in_review:   'issue-status-in-review',
      closed:      'issue-status-closed',
    };
    return m[status] ?? 'issue-status-default';
  }

  private static buildFiltrosTexto(dto: ExportarIncidenciasDto): string {
    const filtros: string[] = [];
    if (dto.filter_status) {
      const estados = Array.isArray(dto.filter_status) ? dto.filter_status : [dto.filter_status];
      filtros.push(`Estado (${estados.map(IssueReportMapper.getStatusLabel).join(', ')})`);
    }
    if (dto.filter_linkedDocumentUrn) filtros.push('Documento vinculado');
    return filtros.length > 0 ? filtros.join(', ') : 'Ninguno';
  }

  private static guessMime(adj: any): string {
    const name: string = adj.fileName || adj.displayName || adj.name || '';
    const ext = name.toLowerCase().split('.').pop();
    const map: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp' };
    return map[ext || ''] || 'image/jpeg';
  }

  private static getIniciales(nombre: string): string {
    if (!nombre) return '?';
    const palabras = nombre.trim().split(/\s+/);
    return palabras.length === 1
      ? palabras[0].substring(0, 2).toUpperCase()
      : (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase();
  }

  private static getAvatarToneClass(nombre: string): string {
    let h = 0;
    for (let i = 0; i < nombre.length; i++) h = nombre.charCodeAt(i) + ((h << 5) - h);
    return `avatar-tone-${Math.abs(h) % 10}`;
  }

  private static procesarTextoComentario(texto: string): string {
    if (!texto) return '';
    texto = texto.replace(/<---?FIRMA_GVR---?>[\s\S]*?<---?FIN_FIRMA_GVR---?>/gi, '');
    texto = texto.replace(/---?FIRMA_GVR---?[\s\S]*?---?FIN_FIRMA_GVR---?/gi, '');
    return texto.replace(/\s+/g, ' ').trim();
  }

  private static extraerFirmaInfo(texto: string): { nombre: string | null; rol: string | null } {
    const m = texto.match(/<---?FIRMA_GVR---?>([\s\S]*?)<---?FIN_FIRMA_GVR---?>/i)
      || texto.match(/---?FIRMA_GVR---?([\s\S]*?)---?FIN_FIRMA_GVR---?/i);
    if (!m) return { nombre: null, rol: null };
    const nombre = m[1].match(/Nombre:\s*([^R\n]+?)(?:\s*Rol:|$)/i)?.[1]?.trim() ?? null;
    const rol    = m[1].match(/Rol:\s*(.+?)(?:\s*$|\s*<)/i)?.[1]?.trim() ?? null;
    return { nombre, rol };
  }
}
