import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import {
  ACC_REPOSITORY,
  type IAccRepository,
} from '../../../../domain/repositories/acc.repository.interface';
import {
  AUDITORIA_REPOSITORY,
  type IAuditoriaRepository,
} from '../../../../domain/repositories/auditoria.repository.interface';

/** Ventana para fusionar eventos duplicados (auditoría GVR + versiones ACC). */
const VENTANA_DEDUP_MS = 2 * 60 * 1000;

export type CategoriaActividadArchivo =
  | 'subida'
  | 'sobreescritura'
  | 'edicion'
  | 'descarga'
  | 'eliminacion'
  | 'restauracion'
  | 'movimiento'
  | 'copia'
  | 'incidencia'
  | 'otro';

@Injectable()
export class ObtenerActividadesArchivoUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskApiService,
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    try {
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!itemId) {
        throw new Error('El ID del item es requerido');
      }

      const token =
        await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

      if (!token) {
        throw new ForbiddenException(
          'No se encontró token de acceso. Por favor, autoriza la aplicación de Autodesk primero.',
        );
      }

      if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
        throw new ForbiddenException(
          'El token de Autodesk ha expirado. Por favor, refresca tu token.',
        );
      }

      const cleanProjectId = projectId.startsWith('b.')
        ? projectId.substring(2)
        : projectId;

      let itemInfo = null;
      try {
        const itemResponse = await this.autodeskApiService.obtenerItemPorId(
          token.tokenAcceso,
          cleanProjectId,
          itemId,
        );
        itemInfo = itemResponse?.data || null;
      } catch {
        // opcional
      }

      const versionesResponse =
        await this.autodeskApiService.obtenerVersionesItem(
          token.tokenAcceso,
          cleanProjectId,
          itemId,
        );

      if (!versionesResponse) {
        throw new Error('No se recibió respuesta de Autodesk API');
      }

      const versiones = versionesResponse.data || [];

      if (versiones.length === 0) {
        return {
          actividades: {
            ultimos7Dias: { actividades: [], total: 0 },
            ultimos30Dias: { actividades: [], total: 0 },
            anteriores: { actividades: [], total: 0 },
          },
          total: 0,
        };
      }

      let auditorias: any[] = [];
      try {
        auditorias =
          await this.auditoriaRepository.obtenerAuditoriasPorItemId(itemId);
      } catch (error) {
        console.warn('No se pudieron obtener auditorías del archivo:', error);
      }

      const actividadesVersiones = this.transformarVersionesEnActividades(
        versiones,
        itemInfo,
      );
      const actividadesAuditoria = this.transformarAuditoriasEnActividades(
        auditorias,
        itemId,
      );

      const todasLasActividades = this.consolidarActividades([
        ...actividadesAuditoria,
        ...actividadesVersiones,
      ]).sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );

      const actividadesAgrupadas =
        this.agruparActividadesPorPeriodo(todasLasActividades);

      return {
        actividades: actividadesAgrupadas,
        total: todasLasActividades.length,
      };
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(
        `Error al obtener actividades del archivo: ${error.message || 'Error desconocido'}`,
      );
    }
  }

  private crearActividad(partial: {
    id: string;
    tipo: string;
    categoria: CategoriaActividadArchivo;
    mensaje: string;
    usuario: string;
    fecha: string;
    fuente: 'gvr' | 'acc';
    destacado?: boolean;
    accion?: string;
    versionNumber?: number;
    versionId?: string;
    auditoriaId?: number;
    metadatos?: Record<string, unknown>;
  }): Record<string, unknown> {
    const usuario = partial.usuario || 'Usuario desconocido';
    const mensaje = partial.mensaje.trim();
    const destacado =
      partial.destacado ??
      ['subida', 'sobreescritura', 'edicion', 'eliminacion', 'restauracion'].includes(
        partial.categoria,
      );

    return {
      ...partial,
      usuario,
      mensaje,
      destacado,
      descripcion: `${usuario} ${mensaje}`,
    };
  }

  /**
   * Una actividad por versión ACC; sin par created+modified en el mismo instante.
   */
  private transformarVersionesEnActividades(
    versiones: any[],
    _itemInfo: any = null,
  ): any[] {
    const actividades: any[] = [];
    const UMBRAL_EDICION_MS = 2 * 60 * 1000;

    versiones.forEach((version) => {
      const attributes = version.attributes || {};
      const createTime = attributes.createTime;
      const lastModifiedTime = attributes.lastModifiedTime;
      const createUserName = attributes.createUserName || 'Usuario desconocido';
      const lastModifiedUserName =
        attributes.lastModifiedUserName || createUserName;
      const versionNumber = attributes.versionNumber || 1;

      if (!createTime) {
        return;
      }

      const createMs = new Date(createTime).getTime();
      const modifiedMs = lastModifiedTime
        ? new Date(lastModifiedTime).getTime()
        : createMs;
      const diffMs = Math.abs(modifiedMs - createMs);
      const esPrimeraVersion = versionNumber <= 1;
      const esSobreescritura = versionNumber > 1;

      if (esSobreescritura) {
        actividades.push(
          this.crearActividad({
            id: `${version.id}-overwrite`,
            tipo: 'file_overwritten',
            categoria: 'sobreescritura',
            mensaje: `reemplazó el archivo (versión ${versionNumber}).`,
            usuario: createUserName,
            fecha: createTime,
            fuente: 'acc',
            versionNumber,
            versionId: version.id,
          }),
        );
      } else {
        actividades.push(
          this.crearActividad({
            id: `${version.id}-upload`,
            tipo: 'file_uploaded',
            categoria: 'subida',
            mensaje: 'subió el archivo por primera vez.',
            usuario: createUserName,
            fecha: createTime,
            fuente: 'acc',
            versionNumber,
            versionId: version.id,
          }),
        );
      }

      const esEdicionReal =
        lastModifiedTime &&
        diffMs > UMBRAL_EDICION_MS &&
        lastModifiedUserName;

      if (esEdicionReal) {
        actividades.push(
          this.crearActividad({
            id: `${version.id}-edited`,
            tipo: 'file_edited',
            categoria: 'edicion',
            mensaje: `editó el archivo (versión ${versionNumber}).`,
            usuario: lastModifiedUserName,
            fecha: lastModifiedTime,
            fuente: 'acc',
            versionNumber,
            versionId: version.id,
          }),
        );
      }
    });

    return actividades;
  }

  private transformarAuditoriasEnActividades(
    auditorias: any[],
    itemId?: string,
  ): any[] {
    const actividades: any[] = [];

    auditorias.forEach((auditoria) => {
      const usuario = auditoria.usuario || 'Usuario desconocido';
      const fecha = auditoria.fechacreacion;
      const accion = auditoria.accion;
      const descripcion = auditoria.descripcion || '';
      const metadatos = this.parseMetadatos(auditoria.metadatos);
      const source =
        metadatos.source ?? metadatos.Source ?? '';

      let actividad: Record<string, unknown> | null = null;

      switch (accion) {
        case 'FILE_DOWNLOAD':
          actividad = this.crearActividad({
            id: `audit-${auditoria.id}`,
            tipo: 'file_download',
            categoria: 'descarga',
            mensaje: 'descargó este archivo.',
            usuario,
            fecha,
            fuente: 'gvr',
            accion,
            auditoriaId: auditoria.id,
            metadatos,
            destacado: false,
          });
          break;
        case 'FILE_UPLOAD':
          actividad = this.crearActividad({
            id: `audit-${auditoria.id}`,
            tipo: 'file_uploaded',
            categoria: 'subida',
            mensaje: 'subió este archivo.',
            usuario,
            fecha,
            fuente: 'gvr',
            accion,
            auditoriaId: auditoria.id,
            metadatos,
          });
          break;
        case 'FILE_VERSION_SAVE':
          if (source === 'upload') {
            actividad = this.crearActividad({
              id: `audit-${auditoria.id}`,
              tipo: 'file_overwritten',
              categoria: 'sobreescritura',
              mensaje: 'reemplazó el archivo subiendo una nueva versión.',
              usuario,
              fecha,
              fuente: 'gvr',
              accion,
              auditoriaId: auditoria.id,
              metadatos,
              versionId: this.versionIdDesdeMetadatos(metadatos),
            });
          } else {
            actividad = this.crearActividad({
              id: `audit-${auditoria.id}`,
              tipo: 'file_edited',
              categoria: 'edicion',
              mensaje: 'guardó cambios en el archivo.',
              usuario,
              fecha,
              fuente: 'gvr',
              accion,
              auditoriaId: auditoria.id,
              metadatos,
              versionId: this.versionIdDesdeMetadatos(metadatos),
            });
          }
          break;
        case 'FILE_UPDATE':
          actividad = this.crearActividad({
            id: `audit-${auditoria.id}`,
            tipo: 'file_edited',
            categoria: 'edicion',
            mensaje: 'actualizó los datos del archivo.',
            usuario,
            fecha,
            fuente: 'gvr',
            accion,
            auditoriaId: auditoria.id,
            metadatos,
          });
          break;
        case 'FILE_DELETE':
          actividad = this.crearActividad({
            id: `audit-${auditoria.id}`,
            tipo: 'file_delete',
            categoria: 'eliminacion',
            mensaje: 'eliminó este archivo.',
            usuario,
            fecha,
            fuente: 'gvr',
            accion,
            auditoriaId: auditoria.id,
            metadatos,
          });
          break;
        case 'FILE_RESTORE':
          actividad = this.crearActividad({
            id: `audit-${auditoria.id}`,
            tipo: 'file_restore',
            categoria: 'restauracion',
            mensaje:
              this.extraerMensajeSinUsuario(descripcion, usuario) ||
              'restauró este archivo.',
            usuario,
            fecha,
            fuente: 'gvr',
            accion,
            auditoriaId: auditoria.id,
            metadatos,
          });
          break;
        case 'FILE_COPY':
          actividad = this.crearActividad({
            id: `audit-${auditoria.id}`,
            tipo: 'file_copy',
            categoria: 'copia',
            mensaje:
              this.extraerMensajeSinUsuario(descripcion, usuario) ||
              'copió este archivo.',
            usuario,
            fecha,
            fuente: 'gvr',
            accion,
            auditoriaId: auditoria.id,
            metadatos,
            destacado: false,
          });
          break;
        case 'FILE_VIEW':
          actividad = this.crearActividad({
            id: `audit-${auditoria.id}`,
            tipo: 'file_view',
            categoria: 'otro',
            mensaje: 'abrió este archivo.',
            usuario,
            fecha,
            fuente: 'gvr',
            accion,
            auditoriaId: auditoria.id,
            metadatos,
            destacado: false,
          });
          break;
        case 'FILE_MOVE':
          actividad = this.crearActividad({
            id: `audit-${auditoria.id}`,
            tipo: 'file_move',
            categoria: 'movimiento',
            mensaje:
              this.extraerMensajeSinUsuario(descripcion, usuario) ||
              'movió este archivo.',
            usuario,
            fecha,
            fuente: 'gvr',
            accion,
            auditoriaId: auditoria.id,
            metadatos,
            destacado: false,
          });
          break;
        case 'ISSUE_CREATE': {
          const issueMetadatos = metadatos || {};
          const datosNuevos = auditoria.datos_nuevos || {};
          const itemIdEnMetadatos = issueMetadatos.itemId || datosNuevos.itemId;
          const linkedDocUrn =
            issueMetadatos.linkedDocumentUrn ||
            issueMetadatos.documentUrn ||
            datosNuevos.documentUrn;

          if (
            itemIdEnMetadatos === itemId ||
            (linkedDocUrn && linkedDocUrn.includes(itemId))
          ) {
            actividad = this.crearActividad({
              id: `audit-${auditoria.id}`,
              tipo: 'issue_created',
              categoria: 'incidencia',
              mensaje:
                'añadió una incidencia a este archivo en la carpeta actual.',
              usuario,
              fecha,
              fuente: 'gvr',
              accion,
              auditoriaId: auditoria.id,
              metadatos,
              destacado: false,
            });
          }
          break;
        }
        default:
          if (descripcion) {
            actividad = this.crearActividad({
              id: `audit-${auditoria.id}`,
              tipo: 'file_action',
              categoria: 'otro',
              mensaje:
                this.extraerMensajeSinUsuario(descripcion, usuario) ||
                'realizó una acción en este archivo.',
              usuario,
              fecha,
              fuente: 'gvr',
              accion,
              auditoriaId: auditoria.id,
              metadatos,
              destacado: false,
            });
          }
          break;
      }

      if (actividad) {
        actividades.push(actividad);
      }
    });

    return actividades;
  }

  /**
   * Elimina duplicados entre auditoría GVR y versiones ACC del mismo evento.
   */
  private consolidarActividades(actividades: any[]): any[] {
    const ordenadas = [...actividades].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
    const eliminar = new Set<string>();

    for (let i = 0; i < ordenadas.length; i++) {
      const a = ordenadas[i];
      if (eliminar.has(a.id)) continue;

      for (let j = i + 1; j < ordenadas.length; j++) {
        const b = ordenadas[j];
        if (eliminar.has(b.id)) continue;

        if (!this.mismaVentanaTiempo(a.fecha, b.fecha)) continue;

        const catA = a.categoria as CategoriaActividadArchivo;
        const catB = b.categoria as CategoriaActividadArchivo;

        const esCargaOSobrescrituraA =
          catA === 'subida' || catA === 'sobreescritura';
        const esCargaOSobrescrituraB =
          catB === 'subida' || catB === 'sobreescritura';
        const esParAccGvr =
          (a.fuente === 'acc' && b.fuente === 'gvr') ||
          (a.fuente === 'gvr' && b.fuente === 'acc');

        // Caso más común: ACC emite "upload/overwrite" con usuario del conector
        // y GVR emite la auditoría real con el usuario de la app.
        // Para evitar duplicado visual no exigimos mismo usuario en este cruce.
        if (esParAccGvr && esCargaOSobrescrituraA && esCargaOSobrescrituraB) {
          if (a.fuente === 'acc') eliminar.add(a.id);
          else eliminar.add(b.id);
          continue;
        }

        if (!this.mismoUsuario(a, b)) continue;

        if (
          catA === 'subida' &&
          catB === 'sobreescritura' &&
          a.fuente === 'gvr' &&
          b.fuente === 'gvr'
        ) {
          eliminar.add(a.id);
          continue;
        }

        if (
          catA === catB &&
          (catA === 'subida' ||
            catA === 'sobreescritura' ||
            catA === 'edicion') &&
          a.versionNumber != null &&
          b.versionNumber != null &&
          a.versionNumber === b.versionNumber
        ) {
          if (a.fuente === 'acc') eliminar.add(a.id);
          else if (b.fuente === 'acc') eliminar.add(b.id);
        }
      }
    }

    return ordenadas.filter((a) => !eliminar.has(a.id));
  }

  private mismaVentanaTiempo(fechaA: string, fechaB: string): boolean {
    const tA = new Date(fechaA).getTime();
    const tB = new Date(fechaB).getTime();
    if (Number.isNaN(tA) || Number.isNaN(tB)) return false;
    return Math.abs(tA - tB) <= VENTANA_DEDUP_MS;
  }

  private mismoUsuario(a: any, b: any): boolean {
    const uA = String(a.usuario || '')
      .trim()
      .toLowerCase();
    const uB = String(b.usuario || '')
      .trim()
      .toLowerCase();
    if (!uA || !uB) return false;
    return uA === uB;
  }

  private versionIdDesdeMetadatos(
    metadatos: Record<string, unknown>,
  ): string | undefined {
    const raw = metadatos.accVersionId ?? metadatos.accversionid;
    if (raw == null || raw === '') return undefined;
    return String(raw).trim() || undefined;
  }

  private parseMetadatos(raw: unknown): Record<string, unknown> {
    if (raw == null) return {};
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return {};
      }
    }
    return (raw as Record<string, unknown>) || {};
  }

  private extraerMensajeSinUsuario(
    descripcion: string,
    usuario: string,
  ): string {
    let msg = descripcion.trim();
    const u = usuario.trim();
    if (u && msg.toLowerCase().startsWith(u.toLowerCase())) {
      msg = msg.slice(u.length).trim();
    }
    msg = msg.replace(/^(ha|has|han)\s+/i, '').trim();
    if (msg && !/[.!?]$/.test(msg)) {
      msg += '.';
    }
    return msg;
  }

  private agruparActividadesPorPeriodo(actividades: any[]): any {
    const ahora = new Date();
    const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);

    const ultimos7Dias: any[] = [];
    const ultimos30Dias: any[] = [];
    const anteriores: any[] = [];

    actividades.forEach((actividad) => {
      const fechaActividad = new Date(actividad.fecha);

      if (fechaActividad >= hace7Dias) {
        ultimos7Dias.push(actividad);
      } else if (fechaActividad >= hace30Dias) {
        ultimos30Dias.push(actividad);
      } else {
        anteriores.push(actividad);
      }
    });

    return {
      ultimos7Dias: {
        actividades: ultimos7Dias,
        total: ultimos7Dias.length,
      },
      ultimos30Dias: {
        actividades: ultimos30Dias,
        total: ultimos30Dias.length,
      },
      anteriores: {
        actividades: anteriores,
        total: anteriores.length,
      },
    };
  }
}
