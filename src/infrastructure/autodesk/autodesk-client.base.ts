import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AutodeskApiPort,
  Token2LeggedResponse,
} from '../../application/ports/autodesk-api.port';
import { HttpClientService } from '../http/http-client.service';
export interface AutodeskClientContext {
  api: AutodeskApiPort;
  httpClient: HttpClientService;
  configService: ConfigService;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  logger: Logger;
}
export abstract class AutodeskClientBase {
  protected readonly logger: Logger;
  protected readonly clientId: string;
  protected readonly clientSecret: string;
  protected readonly callbackUrl: string;
  protected readonly authUrl =
    'https://developer.api.autodesk.com/authentication/v2/token';
  protected readonly authorizeUrl =
    'https://developer.api.autodesk.com/authentication/v2/authorize';
  protected readonly httpClient: HttpClientService;
  protected readonly configService: ConfigService;
  constructor(protected readonly context: AutodeskClientContext) {
    this.logger = context.logger;
    this.httpClient = context.httpClient;
    this.configService = context.configService;
    this.clientId = context.clientId;
    this.clientSecret = context.clientSecret;
    this.callbackUrl = context.callbackUrl;
  }
  protected buildAccQueryParameters(options: Record<string, any>): string {
    const params: Record<string, string> = {};

    if (options.fields && Array.isArray(options.fields)) {
      params.fields = options.fields.join(',');
    }

    // Filters
    const filterKeys = [
      'classification',
      'platform',
      'products',
      'name',
      'type',
      'status',
      'businessUnitId',
      'jobNumber',
      'updatedAt',
    ];

    for (const key of filterKeys) {
      const filterKey = `filter[${key}]`;
      if (options[filterKey]) {
        if (Array.isArray(options[filterKey])) {
          params[filterKey] = options[filterKey].join(',');
        } else {
          params[filterKey] = options[filterKey];
        }
      }
    }

    if (options.filterTextMatch) {
      params.filterTextMatch = options.filterTextMatch;
    }

    if (options.sort) {
      params.sort = options.sort;
    }

    if (options.limit !== undefined) {
      params.limit = Math.min(Number(options.limit), 200).toString();
    }

    if (options.offset !== undefined) {
      params.offset = Number(options.offset).toString();
    }

    return new URLSearchParams(params).toString();
  }

  protected normalizarProjectId(projectId: string): string {
    return projectId.startsWith('b.') ? projectId.substring(2) : projectId;
  }

  protected normalizarBim360ProjectId(projectId: string): string {
    return projectId.startsWith('b.') ? projectId.substring(2) : projectId;
  }

  protected buildBim360ProjectsUrl(
    accountId: string,
    region?: string,
    projectId?: string,
    endpoint?: string,
  ): string {
    const baseUrl =
      this.configService.get<string>('AUTODESK_API_BASE_URL') ||
      'https://developer.api.autodesk.com';
    let url = '';

    if (region && region.toUpperCase() !== 'US') {
      url = `${baseUrl}/hq/v1/regions/${region.toLowerCase()}/accounts/${encodeURIComponent(accountId)}/projects`;
    } else {
      url = `${baseUrl}/hq/v1/accounts/${encodeURIComponent(accountId)}/projects`;
    }

    if (projectId) {
      url += `/${encodeURIComponent(projectId)}`;
    }

    if (endpoint) {
      url += `/${endpoint}`;
    }

    return url;
  }

  protected esErrorItemEliminado(error: any): boolean {
    const detail = String(
      error?.response?.data?.errors?.[0]?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        '',
    ).toLowerCase();
    return (
      detail.includes('has been deleted') ||
      detail.includes('been deleted') ||
      detail.includes('resource does not exist')
    );
  }

  protected async restaurarVersionConCopyFrom(
    accessToken: string,
    projectId: string,
    copyFromVersionId: string,
    itemId?: string,
  ): Promise<any> {
    const dataManagementProjectId = projectId.startsWith('b.')
      ? projectId
      : `b.${projectId}`;
    const baseUrl =
      this.configService.get<string>('AUTODESK_API_BASE_URL') ||
      'https://developer.api.autodesk.com';
    const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/versions?copyFrom=${encodeURIComponent(copyFromVersionId)}`;

    const versionPayload: Record<string, unknown> = { type: 'versions' };
    if (itemId) {
      versionPayload.relationships = {
        item: {
          data: {
            type: 'items',
            id: itemId,
          },
        },
      };
    }

    const body = {
      jsonapi: { version: '1.0' },
      data: versionPayload,
    };

    const response = await this.httpClient.post<any>(url, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/vnd.api+json',
      },
    });

    return response.data?.data || null;
  }

  protected async resolverDataManagementProjectId(
    accessToken: string,
    issuesProjectId: string,
  ): Promise<{ hubId: string; projectId: string } | null> {
    // Método 1: Verificar si ya es correcto (b. o urn:)
    if (
      issuesProjectId.startsWith('b.') ||
      issuesProjectId.startsWith('urn:')
    ) {
      const hubId = await this.obtenerHubIdDesdeProjectId(
        accessToken,
        issuesProjectId,
      );
      if (hubId) {
        return { hubId, projectId: issuesProjectId };
      }
    }

    // Método 2: Buscar en todos los hubs (costoso pero necesario)
    const hubsResponse = await this.obtenerHubs(accessToken);
    const hubs = hubsResponse.data || [];

    for (const hub of hubs) {
      const projectsResponse = await this.obtenerProyectos(accessToken, hub.id);
      const projects = projectsResponse.data || [];

      for (const project of projects) {
        const projectId = project.id;
        const containerId = project.attributes?.extension?.data?.containerId;

        // Match por containerId (UUID issues)
        if (containerId === issuesProjectId) {
          return { hubId: hub.id, projectId };
        }

        // Match por ID sin prefijo
        const cleanId = projectId.startsWith('b.')
          ? projectId.substring(2)
          : projectId;
        if (cleanId === issuesProjectId) {
          return { hubId: hub.id, projectId };
        }
      }
    }

    return null;
  }

  protected async obtenerHubIdDesdeProjectId(
    accessToken: string,
    projectId: string,
  ): Promise<string | null> {
    try {
      const hubsResponse = await this.obtenerHubs(accessToken);
      const hubs = hubsResponse.data || [];

      for (const hub of hubs) {
        // Verificar proyecto en hub
        try {
          await this.obtenerHubDeProyecto(accessToken, hub.id, projectId);
          return hub.id;
        } catch (e) {
          continue; // No está en este hub
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  protected obtenerToken2Legged(
    scopes: string[],
  ): Promise<Token2LeggedResponse> {
    return this.context.api.obtenerToken2Legged(scopes);
  }
  protected obtenerHubs(
    accessToken: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.context.api.obtenerHubs(accessToken, filters);
  }
  protected obtenerProyectos(
    accessToken: string,
    hubId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.context.api.obtenerProyectos(accessToken, hubId, filters);
  }
  protected obtenerItemPorId(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.context.api.obtenerItemPorId(accessToken, projectId, itemId);
  }
  protected obtenerVersionesItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.context.api.obtenerVersionesItem(
      accessToken,
      projectId,
      itemId,
    );
  }
  protected obtenerHubDeProyecto(
    accessToken: string,
    hubId: string,
    projectId: string,
  ): Promise<any> {
    return this.context.api.obtenerHubDeProyecto(accessToken, hubId, projectId);
  }
  protected obtenerCarpetasPrincipales(
    accessToken: string,
    hubId: string,
    projectId: string,
  ): Promise<any> {
    return this.context.api.obtenerCarpetasPrincipales(
      accessToken,
      hubId,
      projectId,
    );
  }
  protected crearStorage(
    accessToken: string,
    projectId: string,
    storageData: any,
  ): Promise<any> {
    return this.context.api.crearStorage(accessToken, projectId, storageData);
  }
  protected obtenerStorageUrlPorVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<{
    storageUrl: string;
    fileName: string;
    fileType: string;
    storageId: string;
    itemId: string;
  }> {
    return this.context.api.obtenerStorageUrlPorVersion(
      accessToken,
      projectId,
      versionId,
    );
  }
  protected obtenerTipVersion(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.context.api.obtenerTipVersion(accessToken, projectId, itemId);
  }
  protected obtenerVersionPorId(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    return this.context.api.obtenerVersionPorId(
      accessToken,
      projectId,
      versionId,
    );
  }
  protected obtenerItemVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    return this.context.api.obtenerItemVersion(
      accessToken,
      projectId,
      versionId,
    );
  }
  protected obtenerBusinessUnits(
    accessToken: string,
    accountId: string,
    region?: string,
  ): Promise<any> {
    return this.context.api.obtenerBusinessUnits(
      accessToken,
      accountId,
      region,
    );
  }
  protected copiarItem(
    accessToken: string,
    projectId: string,
    sourceVersionUrn: string,
    targetFolderId: string,
    fileName: string,
  ): Promise<any> {
    return this.context.api.copiarItem(
      accessToken,
      projectId,
      sourceVersionUrn,
      targetFolderId,
      fileName,
    );
  }
  protected actualizarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    itemData: any,
  ): Promise<any> {
    return this.context.api.actualizarItem(
      accessToken,
      projectId,
      itemId,
      itemData,
    );
  }
  protected obtenerUrlFirmadaS3Upload(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
  ): Promise<any> {
    return this.context.api.obtenerUrlFirmadaS3Upload(
      accessToken,
      bucketKey,
      objectKey,
    );
  }
  protected subirArchivoS3(
    uploadUrl: string,
    content: Buffer | string,
    contentType: string,
  ): Promise<any> {
    return this.context.api.subirArchivoS3(uploadUrl, content, contentType);
  }
  protected finalizarUploadS3(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
    uploadKey: string,
  ): Promise<any> {
    return this.context.api.finalizarUploadS3(
      accessToken,
      bucketKey,
      objectKey,
      uploadKey,
    );
  }
}
