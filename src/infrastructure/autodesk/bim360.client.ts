import { AutodeskClientBase } from './autodesk-client.base';

export class AutodeskBim360Client extends AutodeskClientBase {
  async obtenerPerfilUsuarioBim360(
    accessToken: string,
    projectId: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/users/me`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener perfil de usuario BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerTiposIncidenciasBim360(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issue-types`;

      const queryParams: Record<string, string> = {};
      if (filters.limit) queryParams.limit = filters.limit.toString();
      if (filters.offset) queryParams.offset = filters.offset.toString();

      if (Object.keys(queryParams).length > 0) {
        url += '?' + new URLSearchParams(queryParams).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.results || [],
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener tipos de incidencias BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerDefinicionesAtributosBim360(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issue-attribute-definitions`;

      const queryParams: Record<string, string> = {};
      if (filters.limit) queryParams.limit = filters.limit.toString();
      if (filters.offset) queryParams.offset = filters.offset.toString();

      if (Object.keys(queryParams).length > 0) {
        url += '?' + new URLSearchParams(queryParams).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.results || [],
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener definiciones de atributos BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerMapeosAtributosBim360(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issue-attribute-mappings`;

      const queryParams: Record<string, string> = {};
      if (filters.limit) queryParams.limit = filters.limit.toString();
      if (filters.offset) queryParams.offset = filters.offset.toString();

      if (Object.keys(queryParams).length > 0) {
        url += '?' + new URLSearchParams(queryParams).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.results || [],
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener mapeos de atributos BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerCategoriasRaizBim360(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issue-root-cause-categories`;

      const queryParams: Record<string, string> = {};
      if (filters.limit) queryParams.limit = filters.limit.toString();
      if (filters.offset) queryParams.offset = filters.offset.toString();

      if (Object.keys(queryParams).length > 0) {
        url += '?' + new URLSearchParams(queryParams).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.results || [],
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener categorías de causa raíz BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerIncidenciasBim360(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues`;

      const queryParams: Record<string, string> = {};
      if (filters.limit) queryParams.limit = filters.limit.toString();
      if (filters.offset) queryParams.offset = filters.offset.toString();

      if (filters.filter && typeof filters.filter === 'object') {
        for (const [key, value] of Object.entries(filters.filter)) {
          queryParams[`filter[${key}]`] = String(value);
        }
      }

      if (Object.keys(queryParams).length > 0) {
        url += '?' + new URLSearchParams(queryParams).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.results || [],
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener incidencias BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearIncidenciaBim360(
    accessToken: string,
    projectId: string,
    data: Record<string, any>,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues`;

      const response = await this.httpClient.post<any>(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al crear incidencia BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerIncidenciaPorIdBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!issueId) {
        throw new Error('El ID de la incidencia es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues/${encodeURIComponent(issueId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener incidencia BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async actualizarIncidenciaBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!issueId) {
        throw new Error('El ID de la incidencia es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues/${encodeURIComponent(issueId)}`;

      const response = await this.httpClient.patch<any>(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al actualizar incidencia BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerComentariosBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!issueId) {
        throw new Error('El ID de la incidencia es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues/${encodeURIComponent(issueId)}/comments`;

      const queryParams: Record<string, string> = {};
      if (filters.limit) queryParams.limit = filters.limit.toString();
      if (filters.offset) queryParams.offset = filters.offset.toString();

      if (Object.keys(queryParams).length > 0) {
        url += '?' + new URLSearchParams(queryParams).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.results || [],
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener comentarios BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearComentarioBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!issueId) {
        throw new Error('El ID de la incidencia es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues/${encodeURIComponent(issueId)}/comments`;

      const response = await this.httpClient.post<any>(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al crear comentario BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerAdjuntosBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!issueId) {
        throw new Error('El ID de la incidencia es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues/${encodeURIComponent(issueId)}/attachments`;

      const queryParams: Record<string, string> = {};
      if (filters.limit) queryParams.limit = filters.limit.toString();
      if (filters.offset) queryParams.offset = filters.offset.toString();

      if (Object.keys(queryParams).length > 0) {
        url += '?' + new URLSearchParams(queryParams).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.results || [],
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404 || status === 504) {
        return { data: [], pagination: {} };
      }
      throw new Error(
        `Error al obtener adjuntos BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearAdjuntoBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!issueId) {
        throw new Error('El ID de la incidencia es requerido');
      }
      if (!data.urn) {
        throw new Error('El campo urn es requerido para crear un attachment');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues/${encodeURIComponent(issueId)}/attachments`;

      const storageUrn = data.urn;
      const displayName = data.name || data.displayName || 'Attachment';

      // Generar attachmentId único si es posible desde el URN
      let attachmentId: string | null = null;
      const match = storageUrn.match(
        /urn:adsk\.objects:os\.object:[^\/]+\/(.+)$/,
      );
      if (match) {
        const objectKey = match[1];
        const path = require('path');
        attachmentId = path.parse(objectKey).name;
      }

      if (!attachmentId) {
        const { randomUUID } = require('crypto');
        attachmentId = randomUUID();
      }

      let fileName = data.fileName || null;
      if (!fileName && match) {
        fileName = match[1];
      }
      if (!fileName) {
        fileName = displayName;
      }

      const payload = {
        domainEntityId: issueId,
        attachments: [
          {
            attachmentId: attachmentId,
            displayName: displayName,
            fileName: fileName,
            attachmentType: 'issue-attachment',
            storageUrn: storageUrn,
          },
        ],
      };

      // Para BIM 360 a veces se espera el array directamente o la estructura anterior
      // Con Unified API (construction/issues/v1), la estructura es domainEntityId + attachments array

      const response = await this.httpClient.post<any>(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al crear adjunto BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async actualizarAdjuntoBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    attachmentId: string,
    data: Record<string, any>,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!issueId) {
        throw new Error('El ID de la incidencia es requerido');
      }
      if (!attachmentId) {
        throw new Error('El ID del adjunto es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarBim360ProjectId(projectId);
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues/${encodeURIComponent(issueId)}/attachments/${encodeURIComponent(attachmentId)}`;

      const response = await this.httpClient.patch<any>(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al actualizar adjunto BIM 360: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearProyectoBim360(
    accessToken: string,
    accountId: string,
    projectData: Record<string, any>,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }

      const url = this.buildBim360ProjectsUrl(accountId, region);

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region.toUpperCase();
      }

      const response = await this.httpClient.post<any>(url, projectData, {
        headers,
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear proyecto BIM 360: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerProyectosLegacy(
    accessToken: string,
    accountId: string,
    filters: Record<string, any> = {},
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }

      let url = this.buildBim360ProjectsUrl(accountId, region);

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters as any).toString();
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region.toUpperCase();
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener proyectos legacy: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerProyectoPorIdLegacy(
    accessToken: string,
    accountId: string,
    projectId: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      const url = this.buildBim360ProjectsUrl(accountId, region, projectId);

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region.toUpperCase();
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener proyecto legacy: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async actualizarProyectoBim360(
    accessToken: string,
    accountId: string,
    projectId: string,
    updateData: Record<string, any>,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      const url = this.buildBim360ProjectsUrl(accountId, region, projectId);

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region.toUpperCase();
      }

      const response = await this.httpClient.patch<any>(url, updateData, {
        headers,
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al actualizar proyecto BIM 360: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async actualizarImagenProyectoBim360(
    accessToken: string,
    accountId: string,
    projectId: string,
    imageData: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!imageData) {
        throw new Error('Los datos de la imagen son requeridos');
      }

      const url = this.buildBim360ProjectsUrl(
        accountId,
        region,
        projectId,
        'image',
      );

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region.toUpperCase();
      }

      const response = await this.httpClient.patch<any>(
        url,
        { image: imageData },
        { headers },
      );

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al actualizar imagen del proyecto BIM 360: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }
}
