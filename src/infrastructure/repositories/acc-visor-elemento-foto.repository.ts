import { Injectable } from '@nestjs/common';
import type {
  ActualizarVisorElementoFotoParams,
  AgregarArchivosVisorElementoFotoParams,
  CrearVisorElementoFotoParams,
  CrearVisorElementoFotoResult,
  IAccVisorElementoFotoRepository,
  VisorElementoFotoArchivoEntrada,
  VisorElementoFotoDetalle,
  VisorElementoFotoListItem,
} from '../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';
import { MinioStorageService } from '../storage/minio-storage.service';

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

function archivosToJson(archivos: VisorElementoFotoArchivoEntrada[]): string {
  const payload = archivos.map((a) => ({
    url: a.url,
    nombreOriginal: a.nombreOriginal ?? null,
    tipoMime: a.tipoMime ?? null,
    tamanoBytes:
      a.tamanoBytes != null && Number.isFinite(a.tamanoBytes)
        ? Math.trunc(a.tamanoBytes)
        : null,
  }));
  return JSON.stringify(payload);
}

@Injectable()
export class AccVisorElementoFotoRepository implements IAccVisorElementoFotoRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
    private readonly minioStorage: MinioStorageService,
  ) {}

  async crear(params: CrearVisorElementoFotoParams): Promise<CrearVisorElementoFotoResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_CrearVisorElementoFoto', [
      params.idProyectoAcc,
      params.idProyectoGvr ?? null,
      params.documentUrn,
      params.itemId,
      params.versionId ?? null,
      params.nombreDocumento ?? null,
      params.objectId,
      params.externalId ?? null,
      params.nombreElemento ?? null,
      params.posicionX,
      params.posicionY,
      params.posicionZ,
      params.viewableGuid ?? null,
      params.viewableName ?? null,
      params.is3D ?? false,
      params.viewerState ?? null,
      params.titulo ?? null,
      params.descripcion ?? null,
      archivosToJson(params.archivos),
      params.idUsuario,
    ]);

    return {
      success: pickBool(row, 'success'),
      message: pickStr(row, 'message') ?? 'Error al crear anclaje de fotos',
      id: pickInt(row, 'id_visorelementofoto'),
    };
  }

  async actualizar(params: ActualizarVisorElementoFotoParams): Promise<void> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_ActualizarVisorElementoFoto', [
      params.id,
      params.titulo ?? null,
      params.descripcion ?? null,
      params.posicionX ?? null,
      params.posicionY ?? null,
      params.posicionZ ?? null,
      params.nombreElemento ?? null,
      params.idUsuario,
    ]);
    if (!pickBool(row, 'success')) {
      throw new Error(pickStr(row, 'message') ?? 'No se pudo actualizar el anclaje');
    }
  }

  async agregarArchivos(
    params: AgregarArchivosVisorElementoFotoParams,
  ): Promise<number> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_AgregarArchivosVisorElementoFoto', [
      params.idVisorElementoFoto,
      archivosToJson(params.archivos),
      params.idUsuario,
    ]);
    const insertados = pickInt(row, 'insertados') ?? 0;
    if (insertados < 1) {
      throw new Error(pickStr(row, 'message') ?? 'No se pudieron agregar archivos');
    }
    return insertados;
  }

  async listarPorDocumento(
    idProyectoAcc: string,
    documentUrn: string,
    viewableGuid?: string | null,
  ): Promise<VisorElementoFotoListItem[]> {
    const rows = await this.databaseFunctionService.callFunction<
      Record<string, unknown>
    >('acc_ListarVisorElementoFotosPorDocumento', [
      idProyectoAcc,
      documentUrn,
      viewableGuid ?? null,
    ]);

    const items = (rows ?? []).map((r) => this.mapListRow(r));
    return this.enrichListPreviewUrls(items);
  }

  async obtenerPorElemento(
    idProyectoAcc: string,
    documentUrn: string,
    viewableGuid: string | null | undefined,
    objectId: number,
  ): Promise<VisorElementoFotoDetalle | null> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_ObtenerVisorElementoFotoPorElemento', [
      idProyectoAcc,
      documentUrn,
      viewableGuid ?? null,
      objectId,
    ]);
    if (!row?.id && pickInt(row, 'id') == null) return null;
    const id = pickInt(row, 'id');
    if (id == null) return null;
    return this.obtenerPorId(id);
  }

  async obtenerPorId(id: number): Promise<VisorElementoFotoDetalle | null> {
    const rows = await this.databaseFunctionService.callFunction<
      Record<string, unknown>
    >('acc_ObtenerVisorElementoFoto', [id]);
    if (!rows?.length) return null;
    return this.mapDetalleRows(rows);
  }

  async eliminarArchivo(
    idVisorElementoFoto: number,
    idArchivoJunction: number,
    idUsuario: number,
  ): Promise<string | null> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_EliminarArchivoVisorElementoFoto', [
      idVisorElementoFoto,
      idArchivoJunction,
      idUsuario,
    ]);
    if (row == null) return null;
    const v = Object.values(row)[0];
    return v != null && String(v).trim() !== '' ? String(v).trim() : null;
  }

  async eliminar(id: number, idUsuario: number): Promise<void> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('acc_EliminarVisorElementoFoto', [id, idUsuario]);
    if (!pickBool(row, 'success')) {
      throw new Error(pickStr(row, 'message') ?? 'No se pudo eliminar el anclaje');
    }
  }

  private mapListRow(r: Record<string, unknown>): VisorElementoFotoListItem {
    return {
      id: pickInt(r, 'id') ?? 0,
      idProyectoAcc: pickStr(r, 'idproyectoacc') ?? '',
      documentUrn: pickStr(r, 'documenturn') ?? '',
      itemId: pickStr(r, 'itemid') ?? '',
      objectId: pickInt(r, 'objectid') ?? 0,
      externalId: pickStr(r, 'externalid'),
      nombreElemento: pickStr(r, 'nombreelemento'),
      posicionX: Number(r.posicionx ?? r.posicionX ?? 0),
      posicionY: Number(r.posiciony ?? r.posicionY ?? 0),
      posicionZ: Number(r.posicionz ?? r.posicionZ ?? 0),
      viewableGuid: pickStr(r, 'viewableguid'),
      viewableName: pickStr(r, 'viewablename'),
      is3D: pickBool(r, 'is3d'),
      titulo: pickStr(r, 'titulo'),
      descripcion: pickStr(r, 'descripcion'),
      cantidadArchivos: Number(r.cantidadarchivos ?? r.cantidadArchivos ?? 0),
      urlPreview: pickStr(r, 'urlpreview') ?? pickStr(r, 'urlPreview'),
      fechaModificacion:
        pickStr(r, 'fechamodificacion') ?? pickStr(r, 'fechaModificacion'),
    };
  }

  private async enrichListPreviewUrls(
    items: VisorElementoFotoListItem[],
  ): Promise<VisorElementoFotoListItem[]> {
    return Promise.all(
      items.map(async (item) => {
        if (!item.urlPreview) return item;
        const urlPreviewView =
          await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(
            item.urlPreview,
          );
        return { ...item, urlPreviewView };
      }),
    );
  }

  private async mapDetalleRows(
    rows: Record<string, unknown>[],
  ): Promise<VisorElementoFotoDetalle> {
    const head = rows[0]!;
    const archivos = (
      await Promise.all(
        rows
          .filter((r) => pickInt(r, 'idarchivojunction') != null)
          .map(async (r) => {
            const url = pickStr(r, 'urlarchivo') ?? '';
            const viewUrl = url
              ? await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(url)
              : undefined;
            return {
              idArchivoJunction: pickInt(r, 'idarchivojunction') ?? 0,
              idArchivo: pickInt(r, 'idarchivo') ?? 0,
              urlArchivo: url,
              viewUrl,
              nombreOriginal: pickStr(r, 'nombreoriginal'),
              tipoMime: pickStr(r, 'tipomime'),
              tamanoBytes: pickInt(r, 'tamanobytes'),
              ordenArchivo: pickInt(r, 'ordenarchivo') ?? 0,
            };
          }),
      )
    ).sort((a, b) => a.ordenArchivo - b.ordenArchivo);

    let viewerState: Record<string, unknown> | null = null;
    const rawState = head.viewerstate ?? head.viewerState;
    if (rawState && typeof rawState === 'object') {
      viewerState = rawState as Record<string, unknown>;
    } else if (typeof rawState === 'string') {
      try {
        viewerState = JSON.parse(rawState) as Record<string, unknown>;
      } catch {
        viewerState = null;
      }
    }

    return {
      id: pickInt(head, 'id') ?? 0,
      idProyectoAcc: pickStr(head, 'idproyectoacc') ?? '',
      idProyectoGvr: pickInt(head, 'idproyectogvr'),
      documentUrn: pickStr(head, 'documenturn') ?? '',
      itemId: pickStr(head, 'itemid') ?? '',
      versionId: pickStr(head, 'versionid'),
      nombreDocumento: pickStr(head, 'nombredocumento'),
      objectId: pickInt(head, 'objectid') ?? 0,
      externalId: pickStr(head, 'externalid'),
      nombreElemento: pickStr(head, 'nombreelemento'),
      posicionX: Number(head.posicionx ?? head.posicionX ?? 0),
      posicionY: Number(head.posiciony ?? head.posicionY ?? 0),
      posicionZ: Number(head.posicionz ?? head.posicionZ ?? 0),
      viewableGuid: pickStr(head, 'viewableguid'),
      viewableName: pickStr(head, 'viewablename'),
      is3D: pickBool(head, 'is3d'),
      viewerState,
      titulo: pickStr(head, 'titulo'),
      descripcion: pickStr(head, 'descripcion'),
      cantidadArchivos: archivos.length,
      fechaCreacion: pickStr(head, 'fechacreacion'),
      fechaModificacion: pickStr(head, 'fechamodificacion'),
      archivos,
    };
  }
}
