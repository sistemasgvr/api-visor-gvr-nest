import { Injectable } from '@nestjs/common';
import type {
  ActualizarVisorMarcaRevisionParams,
  ContarVisorMarcasRevisionParams,
  ContarVisorMarcasRevisionResult,
  CrearVisorMarcaRevisionParams,
  CrearVisorMarcaRevisionResult,
  DuplicarVisorMarcaRevisionParams,
  DuplicarVisorMarcaRevisionResult,
  IAccVisorMarcaRevisionRepository,
  ListarVisorMarcasRevisionParams,
  OperacionVisorMarcaRevisionResult,
  VisorMarcaRevisionDetalle,
  VisorMarcaRevisionItem,
} from '../../domain/repositories/acc-visor-marca-revision.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';

function pickBool(row: Record<string, unknown> | null, key: string): boolean {
  if (!row) return false;
  const v = row[key] ?? row[key.toLowerCase()];
  return v === true || v === 't' || v === 1 || v === '1';
}

function pickInt(row: Record<string, unknown> | null, key: string): number | null {
  if (!row) return null;
  const v = row[key] ?? row[key.toLowerCase()];
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function pickStr(row: Record<string, unknown> | null, key: string): string | null {
  if (!row) return null;
  const v = row[key] ?? row[key.toLowerCase()];
  if (v == null) return null;
  const s = String(v).trim();
  return s.length > 0 ? s : null;
}

function pickJsonObject(
  row: Record<string, unknown> | null,
  key: string,
): Record<string, unknown> | null {
  if (!row) return null;
  const raw = row[key] ?? row[key.toLowerCase()];
  if (raw == null) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function mapOperacion(row: Record<string, unknown> | null): OperacionVisorMarcaRevisionResult {
  return {
    success: pickBool(row, 'success'),
    message: pickStr(row, 'message') ?? 'Operación no completada',
  };
}

@Injectable()
export class AccVisorMarcaRevisionRepository implements IAccVisorMarcaRevisionRepository {
  constructor(private readonly databaseFunctionService: DatabaseFunctionService) {}

  async crear(params: CrearVisorMarcaRevisionParams): Promise<CrearVisorMarcaRevisionResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_CrearVisorMarcaRevision', [
      params.idProyectoAcc,
      params.documentUrn,
      params.itemId,
      params.tipoMarca,
      params.markupPayload,
      params.idProyectoGvr ?? null,
      params.versionId ?? null,
      params.nombreDocumento ?? null,
      params.viewableGuid ?? null,
      params.viewableName ?? null,
      params.paginaNumero ?? null,
      params.is3D ?? false,
      params.viewerState ?? null,
      params.idRevisionArchivo ?? null,
      params.titulo ?? null,
      params.markupIdAps ?? null,
      params.layerName ?? null,
      params.estilos ?? null,
      params.boundingBox ?? null,
      params.miniaturaSvg ?? null,
      params.idUsuario,
    ]);

    return {
      success: pickBool(row, 'success'),
      message: pickStr(row, 'message') ?? 'Error al crear marca de revisión',
      id: pickInt(row, 'id_visormarcarevision'),
    };
  }

  async actualizar(
    params: ActualizarVisorMarcaRevisionParams,
  ): Promise<OperacionVisorMarcaRevisionResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_ActualizarVisorMarcaRevision', [
      params.id,
      params.idUsuario,
      params.titulo ?? null,
      params.markupPayload ?? null,
      params.markupIdAps ?? null,
      params.estilos ?? null,
      params.boundingBox ?? null,
      params.miniaturaSvg ?? null,
      params.viewerState ?? null,
      params.viewableGuid ?? null,
      params.viewableName ?? null,
      params.paginaNumero ?? null,
    ]);
    return mapOperacion(row);
  }

  async duplicar(
    params: DuplicarVisorMarcaRevisionParams,
  ): Promise<DuplicarVisorMarcaRevisionResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_DuplicarVisorMarcaRevision', [
      params.idMarcaOrigen,
      params.idUsuario,
      params.desplazamiento ?? null,
      params.titulo ?? null,
    ]);
    return {
      success: pickBool(row, 'success'),
      message: pickStr(row, 'message') ?? 'Error al duplicar marca',
      id: pickInt(row, 'id_visormarcarevision'),
    };
  }

  async publicar(id: number, idUsuario: number): Promise<OperacionVisorMarcaRevisionResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_PublicarVisorMarcaRevision', [id, idUsuario]);
    return mapOperacion(row);
  }

  async anularPublicacion(
    id: number,
    idUsuario: number,
  ): Promise<OperacionVisorMarcaRevisionResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_AnularPublicacionVisorMarcaRevision', [id, idUsuario]);
    return mapOperacion(row);
  }

  async suprimir(id: number, idUsuario: number): Promise<OperacionVisorMarcaRevisionResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_SuprimirVisorMarcaRevision', [id, idUsuario]);
    return mapOperacion(row);
  }

  async listar(params: ListarVisorMarcasRevisionParams): Promise<VisorMarcaRevisionItem[]> {
    const rows = await this.databaseFunctionService.callFunction<
      Record<string, unknown>
    >('acc_ListarVisorMarcasRevision', [
      params.idProyectoAcc,
      params.documentUrn,
      params.idUsuario,
      params.viewableGuid ?? null,
      params.paginaNumero ?? null,
      params.versionId ?? null,
      params.idRevisionArchivo ?? null,
      params.soloPublicadas ?? null,
      params.soloPropias ?? null,
    ]);
    return (rows ?? []).map((r) => this.mapItemRow(r));
  }

  async contar(
    params: ContarVisorMarcasRevisionParams,
  ): Promise<ContarVisorMarcasRevisionResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_ContarVisorMarcasRevision', [
      params.idProyectoAcc,
      params.documentUrn,
      params.idUsuario,
      params.viewableGuid ?? null,
      params.paginaNumero ?? null,
      params.versionId ?? null,
    ]);
    return {
      totalVisibles: Number(row?.totalvisibles ?? row?.totalVisibles ?? 0),
      totalPublicadas: Number(row?.totalpublicadas ?? row?.totalPublicadas ?? 0),
      totalPropias: Number(row?.totalpropias ?? row?.totalPropias ?? 0),
      totalPropiasPrivadas: Number(
        row?.totalpropiasprivadas ?? row?.totalPropiasPrivadas ?? 0,
      ),
    };
  }

  async obtenerPorId(
    id: number,
    idUsuario?: number | null,
  ): Promise<VisorMarcaRevisionDetalle | null> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_ObtenerVisorMarcaRevision', [id, idUsuario ?? null]);
    if (!row || pickInt(row, 'id') == null) return null;
    return this.mapDetalleRow(row);
  }

  async sincronizarMarkupIdAps(
    id: number,
    idUsuario: number,
    markupIdAps: string,
  ): Promise<OperacionVisorMarcaRevisionResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_SincronizarMarkupIdApsVisorMarcaRevision', [id, idUsuario, markupIdAps]);
    return mapOperacion(row);
  }

  private mapItemRow(r: Record<string, unknown>): VisorMarcaRevisionItem {
    return {
      id: pickInt(r, 'id') ?? 0,
      idProyectoAcc: pickStr(r, 'idproyectoacc') ?? '',
      idProyectoGvr: pickInt(r, 'idproyectogvr'),
      documentUrn: pickStr(r, 'documenturn') ?? '',
      itemId: pickStr(r, 'itemid') ?? '',
      versionId: pickStr(r, 'versionid'),
      nombreDocumento: pickStr(r, 'nombredocumento'),
      viewableGuid: pickStr(r, 'viewableguid'),
      viewableName: pickStr(r, 'viewablename'),
      paginaNumero: pickInt(r, 'paginanumero'),
      is3D: pickBool(r, 'is3d'),
      idRevisionArchivo: pickInt(r, 'idrevisionarchivo'),
      tipoMarca: pickStr(r, 'tipomarca') ?? '',
      titulo: pickStr(r, 'titulo'),
      markupIdAps: pickStr(r, 'markupidaps'),
      layerName: pickStr(r, 'layername') ?? 'GVR-Markups',
      markupPayload: pickJsonObject(r, 'markuppayload') ?? {},
      estilos: pickJsonObject(r, 'estilos'),
      boundingBox: pickJsonObject(r, 'boundingbox'),
      miniaturaSvg: pickStr(r, 'miniaturasvg'),
      publicado: pickBool(r, 'publicado'),
      fechaPublicacion: pickStr(r, 'fechapublicacion'),
      idMarcaOrigen: pickInt(r, 'idmarcaorigen'),
      idUsuarioCreacion: pickInt(r, 'idusuariocreacion'),
      nombreUsuarioCreacion: pickStr(r, 'nombreusuariocreacion'),
      esPropia: pickBool(r, 'espropia'),
      puedeEditar: pickBool(r, 'puedeeditar'),
      fechaCreacion: pickStr(r, 'fechacreacion'),
      fechaModificacion: pickStr(r, 'fechamodificacion'),
    };
  }

  private mapDetalleRow(r: Record<string, unknown>): VisorMarcaRevisionDetalle {
    return {
      ...this.mapItemRow(r),
      viewerState: pickJsonObject(r, 'viewerstate'),
      idUsuarioPublicacion: pickInt(r, 'idusuariopublicacion'),
    };
  }
}
