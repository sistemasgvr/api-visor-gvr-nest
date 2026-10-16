import { AutodeskClientBase } from './autodesk-client.base';

export class AutodeskReviewsClient extends AutodeskClientBase {
  async obtenerRevisiones(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) throw new Error('El token de acceso es requerido');
      if (!projectId) throw new Error('El ID del proyecto es requerido');

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarProjectId(projectId);
      let url = `${baseUrl}/construction/reviews/v1/projects/${encodeURIComponent(normalizedProjectId)}/reviews`;

      if (Object.keys(filters).length > 0) {
        const queryParams: string[] = [];
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            queryParams.push(
              `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
            );
          }
        }
        if (queryParams.length > 0) {
          url += '?' + queryParams.join('&');
        }
      }

      const response = await this.httpClient.get<any>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener revisiones: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearRevision(
    accessToken: string,
    projectId: string,
    data: Record<string, any>,
  ): Promise<any> {
    try {
      if (!accessToken) throw new Error('El token de acceso es requerido');
      if (!projectId) throw new Error('El ID del proyecto es requerido');

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarProjectId(projectId);
      const url = `${baseUrl}/construction/reviews/v1/projects/${encodeURIComponent(normalizedProjectId)}/reviews`;

      const response = await this.httpClient.post<any>(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al crear revisión: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerRevisionPorId(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any> {
    try {
      if (!accessToken) throw new Error('El token de acceso es requerido');
      if (!projectId) throw new Error('El ID del proyecto es requerido');
      if (!reviewId) throw new Error('El ID de la revisión es requerido');

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarProjectId(projectId);
      const url = `${baseUrl}/construction/reviews/v1/projects/${encodeURIComponent(normalizedProjectId)}/reviews/${encodeURIComponent(reviewId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener revisión: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerWorkflowRevision(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any> {
    try {
      if (!accessToken) throw new Error('El token de acceso es requerido');
      if (!projectId) throw new Error('El ID del proyecto es requerido');
      if (!reviewId) throw new Error('El ID de la revisión es requerido');

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarProjectId(projectId);
      const url = `${baseUrl}/construction/reviews/v1/projects/${encodeURIComponent(normalizedProjectId)}/reviews/${encodeURIComponent(reviewId)}/workflow`;

      const response = await this.httpClient.get<any>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener workflow de revisión: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerProgresoRevision(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any> {
    try {
      if (!accessToken) throw new Error('El token de acceso es requerido');
      if (!projectId) throw new Error('El ID del proyecto es requerido');
      if (!reviewId) throw new Error('El ID de la revisión es requerido');

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarProjectId(projectId);
      const url = `${baseUrl}/construction/reviews/v1/projects/${encodeURIComponent(normalizedProjectId)}/reviews/${encodeURIComponent(reviewId)}/progress`;

      const response = await this.httpClient.get<any>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener progreso de revisión: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerVersionesRevision(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any> {
    try {
      if (!accessToken) throw new Error('El token de acceso es requerido');
      if (!projectId) throw new Error('El ID del proyecto es requerido');
      if (!reviewId) throw new Error('El ID de la revisión es requerido');

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarProjectId(projectId);
      const url = `${baseUrl}/construction/reviews/v1/projects/${encodeURIComponent(normalizedProjectId)}/reviews/${encodeURIComponent(reviewId)}/versions`;

      const response = await this.httpClient.get<any>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener versiones de revisión: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerWorkflows(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) throw new Error('El token de acceso es requerido');
      if (!projectId) throw new Error('El ID del proyecto es requerido');

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarProjectId(projectId);
      let url = `${baseUrl}/construction/reviews/v1/projects/${encodeURIComponent(normalizedProjectId)}/workflows`;

      if (Object.keys(filters).length > 0) {
        const queryParams: string[] = [];
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            queryParams.push(
              `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
            );
          }
        }
        if (queryParams.length > 0) url += '?' + queryParams.join('&');
      }

      const response = await this.httpClient.get<any>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.response?.data?.fault?.faultstring ||
        error.message;
      const err = new Error(
        `Error al obtener workflows: ${message}`,
      ) as Error & { statusCode?: number };
      err.statusCode = status;
      throw err;
    }
  }

  async obtenerWorkflowPorId(
    accessToken: string,
    projectId: string,
    workflowId: string,
  ): Promise<any> {
    try {
      if (!accessToken) throw new Error('El token de acceso es requerido');
      if (!projectId) throw new Error('El ID del proyecto es requerido');
      if (!workflowId) throw new Error('El ID del workflow es requerido');

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarProjectId(projectId);
      const url = `${baseUrl}/construction/reviews/v1/projects/${encodeURIComponent(normalizedProjectId)}/workflows/${encodeURIComponent(workflowId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener workflow: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearWorkflow(
    accessToken: string,
    projectId: string,
    data: Record<string, any>,
  ): Promise<any> {
    try {
      if (!accessToken) throw new Error('El token de acceso es requerido');
      if (!projectId) throw new Error('El ID del proyecto es requerido');

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarProjectId(projectId);
      const url = `${baseUrl}/construction/reviews/v1/projects/${encodeURIComponent(normalizedProjectId)}/workflows`;

      const response = await this.httpClient.post<any>(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al crear workflow: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerApprovalStatusesVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) throw new Error('El token de acceso es requerido');
      if (!projectId) throw new Error('El ID del proyecto es requerido');
      if (!versionId) throw new Error('El ID de la versión es requerido');

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const normalizedProjectId = this.normalizarProjectId(projectId);
      // versionId puede ser un URN; se envía ya codificado desde el cliente
      let url = `${baseUrl}/construction/reviews/v1/projects/${encodeURIComponent(normalizedProjectId)}/versions/${versionId}/approval-statuses`;

      if (Object.keys(filters).length > 0) {
        const queryParams: string[] = [];
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            queryParams.push(
              `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
            );
          }
        }
        if (queryParams.length > 0) url += '?' + queryParams.join('&');
      }

      const response = await this.httpClient.get<any>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener approval statuses de versión: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}
