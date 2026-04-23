import { Inject, Injectable, Logger } from '@nestjs/common';
import { AUDITORIA_REPOSITORY, type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';
import { ObtenerComentariosUseCase } from './obtener-comentarios.use-case';
import { ObtenerComentariosDto } from '../../../dtos/acc/issues/obtener-comentarios.dto';
import { stripGvrFirmaDelComentario } from '../../../../shared/utils/strip-gvr-firma-text.util';

export type ActividadEntrada = {
  id: string;
  ocurridoEn: string;
  tipo: 'auditoria' | 'comentario_acc' | 'adjunto' | 'comentario_gvr';
  titulo: string;
  detalle?: string;
  actor?: string;
  accion?: string;
};

/**
 * Línea de tiempo: auditoría GVR (publicación, comentarios creados vía GVR, adjuntos, etc.)
 * + comentarios del API de Construction Issues (incl. creados fuera de GVR).
 */
@Injectable()
export class ObtenerActividadIncidenciaUseCase {
  private readonly logger = new Logger(ObtenerActividadIncidenciaUseCase.name);

  constructor(
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: IAuditoriaRepository,
    private readonly obtenerComentariosUseCase: ObtenerComentariosUseCase,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    issueId: string,
  ): Promise<{ entradas: ActividadEntrada[]; total: number }> {
    const entradas: ActividadEntrada[] = [];
    const visto = new Set<string>();

    const auditoria = await this.auditoriaRepository.obtenerAuditoriasPorAccIssueId(issueId, 500);

    const comentarioIdsGvr = new Set<string>();
    for (const row of auditoria) {
      if (row.accion === 'COMMENT_CREATE' && row.metadatos) {
        const m = parseMeta(row.metadatos);
        const id = m?.accCommentId as string | undefined;
        if (id) comentarioIdsGvr.add(String(id));
      }
    }

    for (const a of auditoria) {
      const ocurridoEn = a.fechacreacion || new Date().toISOString();
      const rawNuevos = a.datosnuevos;
      const nuevos = typeof rawNuevos === 'string' ? safeJson(rawNuevos) : (rawNuevos as Record<string, unknown> | null);
      const rawAnt = a.datosanteriores;
      const anteriores = typeof rawAnt === 'string' ? safeJson(rawAnt) : (rawAnt as Record<string, unknown> | null);
      const actor = a.usuario || undefined;

      const { titulo, detalle } = this.mapearAuditoria(
        a.accion,
        a.descripcion,
        nuevos,
        anteriores,
      );

      const id = `aud-${a.id}`;
      entradas.push({
        id,
        ocurridoEn: toIso(ocurridoEn),
        tipo: a.accion === 'COMMENT_CREATE' ? 'comentario_gvr' : a.accion === 'ATTACHMENT_CREATE' ? 'adjunto' : 'auditoria',
        titulo,
        detalle,
        actor,
        accion: a.accion,
      });
    }

    try {
      const comentRes = await this.obtenerComentariosUseCase.execute(
        userId,
        projectId,
        issueId,
        {
          limit: 200,
          offset: 0,
          sort: '-createdAt',
        } as ObtenerComentariosDto,
      );

      const comentData = (comentRes as { data?: unknown[] })?.data;
      if (Array.isArray(comentData)) {
        for (const row of comentData) {
          const c = row as Record<string, any>;
          const cid = c?.id as string | undefined;
          if (!cid) continue;
          if (comentarioIdsGvr.has(String(cid))) continue;
          if (visto.has(`c-${cid}`)) continue;
          visto.add(`c-${cid}`);
          const creado = c?.createdAt || c?.createdat;
          const body = c?.body || c?.content || c?.message || '';
          const createdBy = c?.createdByReal || c?.createdBy || c?.author || 'ACC';
          const detalleLimpio = stripGvrFirmaDelComentario(String(body)).slice(0, 5000);
          entradas.push({
            id: `c-${cid}`,
            ocurridoEn: creado ? toIso(creado) : toIso(new Date().toISOString()),
            tipo: 'comentario_acc',
            titulo: 'Se ha añadido un comentario',
            detalle: detalleLimpio,
            actor: String(createdBy),
          });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Comentarios ACC no disponibles para actividad (projectId=${projectId} issueId=${issueId}): ${message}. Se devuelve solo auditoría GVR.`,
      );
    }

    // Adjuntos: metadata fileName from ATTACHMENT entries already in auditoria

    entradas.sort((a, b) => new Date(b.ocurridoEn).getTime() - new Date(a.ocurridoEn).getTime());

    return { entradas, total: entradas.length };
  }

  private mapearAuditoria(
    accion: string,
    descripcion: string | null,
    datosNuevos: Record<string, unknown> | null,
    datosAnteriores: Record<string, unknown> | null,
  ): { titulo: string; detalle?: string } {
    if (accion === 'COMMENT_CREATE') {
      const raw = (datosNuevos as { body?: string })?.body
        ? String((datosNuevos as { body: string }).body)
        : descripcion || undefined;
      return {
        titulo: 'Se ha añadido un comentario',
        detalle: raw != null && raw !== '' ? stripGvrFirmaDelComentario(raw) : undefined,
      };
    }
    if (accion === 'ATTACHMENT_CREATE') {
      const name = (datosNuevos as { fileName?: string })?.fileName;
      return {
        titulo: 'Archivo adjunto añadido',
        detalle: name ? String(name) : descripcion || undefined,
      };
    }
    if (accion === 'ISSUE_CREATE') {
      return { titulo: 'Incidencia creada', detalle: descripcion || undefined };
    }
    if (accion === 'ISSUE_UPDATE' && datosNuevos && 'published' in (datosNuevos as object)) {
      const pub = (datosNuevos as { published?: boolean }).published;
      const was = (datosAnteriores as { published?: boolean } | null)?.published;
      if (pub === true && was === false) {
        return { titulo: 'Se ha publicado la incidencia' };
      }
      if (pub === false && was === true) {
        return { titulo: 'Se ha cancelado la publicación de la incidencia' };
      }
      if (pub === true) {
        return { titulo: 'Se ha publicado la incidencia' };
      }
      if (pub === false) {
        return { titulo: 'Se ha cancelado la publicación de la incidencia' };
      }
    }
    if (accion === 'ISSUE_UPDATE') {
      return {
        titulo: 'Incidencia actualizada',
        detalle: descripcion || this.resumirCambio(datosNuevos, datosAnteriores),
      };
    }
    return {
      titulo: descripcion || accion,
      detalle: undefined,
    };
  }

  private resumirCambio(n: Record<string, unknown> | null, a: Record<string, unknown> | null): string {
    if (!n && !a) return '';
    return '';
  }
}

function safeJson(s: string): Record<string, unknown> | null {
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toIso(d: string | Date): string {
  try {
    if (d instanceof Date) return d.toISOString();
    const t = new Date(d).getTime();
    if (isNaN(t)) return new Date().toISOString();
    return new Date(d).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function parseMeta(m: unknown): Record<string, unknown> | null {
  if (m == null) return null;
  if (typeof m === 'object' && m !== null && !Array.isArray(m)) {
    return m as Record<string, unknown>;
  }
  if (typeof m === 'string') {
    try {
      return JSON.parse(m) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}
