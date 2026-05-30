import { Injectable } from '@nestjs/common';
import type {
  IAccDocumentConfigRepository,
  ListarDocumentAttributesParams,
  ListarDocumentAttributesResponse,
  UpsertDocumentAttributeData,
  UpsertDocumentNamingStandardData,
  UpsertFolderNamingRuleData,
  GenerarNombreDocumentoData,
  UpsertDocumentMetadataData,
} from '../../domain/repositories/acc-document-config.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';
import { normalizeExternalId } from '../../shared/utils/normalize-external-id.util';

function pickJsonbFromFunctionRow(
  row: Record<string, unknown> | null | undefined,
): unknown {
  if (!row || typeof row !== 'object') return null;
  const values = Object.values(row).filter((v) => v !== undefined && v !== null);
  if (values.length === 1) return values[0];
  return (
    values.find(
      (v) =>
        typeof v === 'object' &&
        v !== null &&
        !Array.isArray(v) &&
        ('success' in v || 'data' in v || 'message' in v),
    ) ?? row
  );
}

function parseJsonbResult(result: Record<string, unknown> | null): any {
  if (!result) return null;
  const jsonbResult = pickJsonbFromFunctionRow(result);
  if (typeof jsonbResult === 'string') {
    try {
      return JSON.parse(jsonbResult);
    } catch {
      return null;
    }
  }
  return jsonbResult;
}

@Injectable()
export class AccDocumentConfigRepository implements IAccDocumentConfigRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

  async listarAttributes(
    params: ListarDocumentAttributesParams,
  ): Promise<ListarDocumentAttributesResponse> {
    const {
      projectExternalId,
      busqueda = '',
      limit = 100,
      offset = 0,
    } = params;

    const result = await this.databaseFunctionService.callFunction<any>(
      'acc_ListarDocumentAttributes',
      [normalizeExternalId(projectExternalId), busqueda, limit, offset],
    );

    if (!result?.length) {
      return {
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          total_pages: 0,
          current_page: 1,
        },
      };
    }

    const totalRegistros = Number(result[0]?.total_registros ?? 0);

    return {
      data: result,
      pagination: {
        total: totalRegistros,
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(totalRegistros / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
    };
  }

  async upsertAttribute(data: UpsertDocumentAttributeData): Promise<any> {
    return this.databaseFunctionService.callFunctionSingle<any>(
      'acc_UpsertDocumentAttribute',
      [
        data.id ?? null,
        normalizeExternalId(data.projectExternalId),
        data.codigo,
        data.nombre,
        data.tipo,
        data.descripcion ?? null,
        data.esObligatorio ?? true,
        data.orden ?? 0,
        JSON.stringify(data.opciones ?? []),
        data.idUsuario ?? null,
      ],
    );
  }

  async listarNamingStandards(projectExternalId: string): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ListarDocumentNamingStandards',
      [normalizeExternalId(projectExternalId)],
    );
    return parseJsonbResult(result);
  }

  async upsertNamingStandard(
    data: UpsertDocumentNamingStandardData,
  ): Promise<any> {
    return this.databaseFunctionService.callFunctionSingle<any>(
      'acc_UpsertDocumentNamingStandard',
      [
        data.id ?? null,
        normalizeExternalId(data.projectExternalId),
        data.codigo,
        data.nombre,
        data.descripcion ?? null,
        data.separador ?? '-',
        JSON.stringify(data.partes ?? []),
        data.idUsuario ?? null,
      ],
    );
  }

  async obtenerFolderNamingRule(
    projectExternalId: string,
    folderExternalId: string,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ObtenerFolderNamingRule',
      [
        normalizeExternalId(projectExternalId),
        normalizeExternalId(folderExternalId),
      ],
    );
    return parseJsonbResult(result);
  }

  async upsertFolderNamingRule(
    data: UpsertFolderNamingRuleData,
  ): Promise<any> {
    return this.databaseFunctionService.callFunctionSingle<any>(
      'acc_UpsertFolderNamingRule',
      [
        normalizeExternalId(data.projectExternalId),
        normalizeExternalId(data.folderExternalId),
        data.namingStandardId,
        data.idUsuario ?? null,
      ],
    );
  }

  async generarNombreDocumento(
    data: GenerarNombreDocumentoData,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_GenerarNombreDocumento',
      [
        normalizeExternalId(data.projectExternalId),
        normalizeExternalId(data.folderExternalId),
        JSON.stringify(data.valores ?? {}),
        data.extension ?? '',
      ],
    );
    return parseJsonbResult(result);
  }

  async upsertMetadata(data: UpsertDocumentMetadataData): Promise<any> {
    return this.databaseFunctionService.callFunctionSingle<any>(
      'acc_UpsertDocumentMetadata',
      [
        normalizeExternalId(data.projectExternalId),
        normalizeExternalId(data.folderExternalId),
        normalizeExternalId(data.itemExternalId),
        data.versionExternalId
          ? normalizeExternalId(data.versionExternalId)
          : null,
        data.namingStandardId ?? null,
        data.nombreGenerado,
        JSON.stringify(data.valores ?? {}),
        data.idUsuario ?? null,
      ],
    );
  }

  async obtenerMetadata(
    projectExternalId: string,
    itemExternalId: string,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ObtenerDocumentMetadata',
      [
        normalizeExternalId(projectExternalId),
        normalizeExternalId(itemExternalId),
      ],
    );
    return parseJsonbResult(result);
  }

  async listarMetadataPorCarpeta(
    projectExternalId: string,
    folderExternalId: string,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ListarDocumentMetadataPorCarpeta',
      [
        normalizeExternalId(projectExternalId),
        normalizeExternalId(folderExternalId),
      ],
    );
    return parseJsonbResult(result);
  }
}
