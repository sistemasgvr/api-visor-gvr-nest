import { PayloadTooLargeException } from '@nestjs/common';
import { AutodeskClientBase } from './autodesk-client.base';

export class AutodeskAdminClient extends AutodeskClientBase {
  async getAccProjects(
    accountId: string,
    options: Record<string, any> = {},
    token?: string,
  ): Promise<any> {
    try {
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }

      // Get token if not provided
      let accessToken = token;
      if (!accessToken) {
        const tokenData = await this.obtenerToken2Legged(['account:read']);
        accessToken = tokenData.access_token;
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      let url = `${baseUrl}/construction/admin/v1/accounts/${encodeURIComponent(accountId)}/projects`;

      // Build query parameters
      const queryParams = this.buildAccQueryParameters(options);
      if (queryParams) {
        url += '?' + queryParams;
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener proyectos ACC: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getAccProjectById(
    projectId: string,
    fields: string[] = [],
    token?: string,
  ): Promise<any> {
    try {
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      // Get token if not provided
      let accessToken = token;
      if (!accessToken) {
        const tokenData = await this.obtenerToken2Legged(['account:read']);
        accessToken = tokenData.access_token;
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      let url = `${baseUrl}/construction/admin/v1/projects/${encodeURIComponent(projectId)}`;

      if (fields.length > 0) {
        url += '?fields=' + fields.join(',');
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener proyecto ACC: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async createAccProject(
    accountId: string,
    projectData: Record<string, any>,
    token?: string,
    userId?: string,
  ): Promise<any> {
    try {
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }

      if (!projectData.name) {
        throw new Error('El nombre del proyecto es requerido');
      }

      // Get token if not provided (use 3-legged for write operations)
      let accessToken = token;
      if (!accessToken) {
        // Use requested scopes for broader access
        const tokenData = await this.obtenerToken2Legged([
          'account:write',
          'account:read',
          'data:read',
          'data:write',
          'bucket:read',
        ]);
        accessToken = tokenData.access_token;
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/construction/admin/v1/accounts/${encodeURIComponent(accountId)}/projects`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      if (userId) {
        headers['User-Id'] = userId;
      }

      const response = await this.httpClient.post<any>(url, projectData, {
        headers,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al crear proyecto ACC: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async updateAccProject(
    accountId: string,
    projectId: string,
    projectData: Record<string, any>,
    token?: string,
    userId?: string,
  ): Promise<any> {
    try {
      if (!accountId || !projectId) {
        throw new Error('Account ID y Project ID son requeridos');
      }

      if (Object.keys(projectData).length === 0) {
        throw new Error('Debe proporcionar datos para actualizar');
      }

      // Get token if not provided
      let accessToken = token;
      if (!accessToken) {
        const tokenData = await this.obtenerToken2Legged(['account:write']);
        accessToken = tokenData.access_token;
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/construction/admin/v1/accounts/${encodeURIComponent(accountId)}/projects/${encodeURIComponent(projectId)}`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      if (userId) {
        headers['User-Id'] = userId;
      }

      const response = await this.httpClient.patch<any>(url, projectData, {
        headers,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al actualizar proyecto ACC: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async uploadAccProjectImage(
    accountId: string,
    projectId: string,
    file: Express.Multer.File,
    token?: string,
  ): Promise<any> {
    try {
      if (!accountId || !projectId) {
        throw new Error('Account ID y Project ID son requeridos');
      }

      if (!file) {
        throw new Error('El archivo es requerido');
      }

      // Get token if not provided
      let accessToken = token;
      if (!accessToken) {
        const tokenData = await this.obtenerToken2Legged(['account:write']);
        accessToken = tokenData.access_token;
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/projects/${encodeURIComponent(projectId)}/image`;

      // Create form data
      const FormData = require('form-data');
      const formData = new FormData();

      // Determine file extension based on mime type
      const extensionMap: Record<string, string> = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/bmp': 'bmp',
        'image/gif': 'gif',
      };
      const ext = extensionMap[file.mimetype] || 'jpg';
      const fileName = `project_image_${Date.now()}.${ext}`;

      formData.append('chunk', file.buffer, {
        filename: fileName,
        contentType: file.mimetype,
      });

      // Use PATCH method as per Autodesk API documentation
      const response = await this.httpClient.patch<any>(url, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...formData.getHeaders(),
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 413) {
        throw new PayloadTooLargeException(
          'La imagen supera el tamaño máximo admitido por Autodesk. Reduzca peso o resolución e inténtelo de nuevo.',
        );
      }
      throw new Error(
        `Error al subir imagen del proyecto: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearCompany(
    accessToken: string,
    accountId: string,
    companyData: Record<string, any>,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/companies`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.post<any>(url, companyData, {
        headers,
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear compañía: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async importarCompanies(
    accessToken: string,
    accountId: string,
    companies: any[],
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!companies || companies.length === 0) {
        throw new Error(
          'Debe proporcionar al menos una compañía para importar',
        );
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/companies/import`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.post<any>(
        url,
        { companies },
        { headers },
      );

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al importar compañías: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerCompanies(
    accessToken: string,
    accountId: string,
    params: Record<string, any> = {},
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      let url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/companies`;

      const queryParams: Record<string, string> = {};
      if (params.limit) queryParams.limit = params.limit.toString();
      if (params.offset) queryParams.offset = params.offset.toString();
      if (params.filter) {
        if (typeof params.filter === 'object') {
          for (const [key, value] of Object.entries(params.filter)) {
            queryParams[`filter[${key}]`] = String(value);
          }
        } else {
          queryParams.filter = String(params.filter);
        }
      }

      if (Object.keys(queryParams).length > 0) {
        url += '?' + new URLSearchParams(queryParams).toString();
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data.results || response.data,
        pagination: response.data.pagination || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener compañías: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerCompanyPorId(
    accessToken: string,
    accountId: string,
    companyId: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!companyId) {
        throw new Error('El ID de la compañía es requerido');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/companies/${encodeURIComponent(companyId)}`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener compañía: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async buscarCompanies(
    accessToken: string,
    accountId: string,
    searchTerm: string,
    params: Record<string, any> = {},
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!searchTerm) {
        throw new Error('El término de búsqueda es requerido');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      let url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/companies/search`;

      const queryParams: Record<string, string> = {
        term: searchTerm,
      };
      if (params.limit) queryParams.limit = params.limit.toString();
      if (params.offset) queryParams.offset = params.offset.toString();

      url += '?' + new URLSearchParams(queryParams).toString();

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data.results || response.data,
        pagination: response.data.pagination || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al buscar compañías: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerCompaniesPorProyecto(
    accessToken: string,
    accountId: string,
    projectId: string,
    params: Record<string, any> = {},
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

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      let url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/projects/${encodeURIComponent(projectId)}/companies`;

      const queryParams: Record<string, string> = {};
      if (params.limit) queryParams.limit = params.limit.toString();
      if (params.offset) queryParams.offset = params.offset.toString();

      if (Object.keys(queryParams).length > 0) {
        url += '?' + new URLSearchParams(queryParams).toString();
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data.results || response.data,
        pagination: response.data.pagination || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener compañías del proyecto: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async actualizarCompany(
    accessToken: string,
    accountId: string,
    companyId: string,
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
      if (!companyId) {
        throw new Error('El ID de la compañía es requerido');
      }
      if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('Debe proporcionar datos para actualizar');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/companies/${encodeURIComponent(companyId)}`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.patch<any>(url, updateData, {
        headers,
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al actualizar compañía: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async subirImagenCompany(
    accessToken: string,
    accountId: string,
    companyId: string,
    file: Express.Multer.File,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!companyId) {
        throw new Error('El ID de la compañía es requerido');
      }
      if (!file) {
        throw new Error('El archivo de imagen es requerido');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/companies/${encodeURIComponent(companyId)}/image`;

      const FormData = require('form-data');
      const formData = new FormData();

      const extensionMap: Record<string, string> = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/bmp': 'bmp',
        'image/gif': 'gif',
      };
      const ext = extensionMap[file.mimetype] || 'jpg';
      const fileName = `company_image_${Date.now()}.${ext}`;

      formData.append('file', file.buffer, {
        filename: fileName,
        contentType: file.mimetype,
      });

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        ...formData.getHeaders(),
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.patch<any>(url, formData, {
        headers,
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al subir imagen de compañía: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerProductosUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!userId) {
        throw new Error('El ID del usuario es requerido');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/users/${encodeURIComponent(userId)}/products`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener productos del usuario: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerRolesUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!userId) {
        throw new Error('El ID del usuario es requerido');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/users/${encodeURIComponent(userId)}/roles`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener roles del usuario: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerUsuariosProyecto(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
    region?: string,
    userId?: string,
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
      let url = `${baseUrl}/construction/admin/v1/projects/${encodeURIComponent(projectId)}/users`;

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters as any).toString();
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }
      if (userId) {
        headers['User-Id'] = userId;
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener usuarios del proyecto: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async buscarUsuariosProyecto(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
    region?: string,
    userId?: string,
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
      let url = `${baseUrl}/construction/admin/v1/projects/${encodeURIComponent(projectId)}/users/search`;

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters as any).toString();
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }
      if (userId) {
        headers['User-Id'] = userId;
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al buscar usuarios en el proyecto: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async importarUsuariosProyecto(
    accessToken: string,
    projectId: string,
    users: any[],
    region?: string,
    userId?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!users || users.length === 0) {
        throw new Error('Debe proporcionar al menos un usuario');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/construction/admin/v1/projects/${encodeURIComponent(projectId)}/users:import`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }
      if (userId) {
        headers['User-Id'] = userId;
      }

      const response = await this.httpClient.post<any>(
        url,
        { users },
        { headers },
      );

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al importar usuarios al proyecto: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerBusinessUnits(
    accessToken: string,
    accountId: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/business_units_structure`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data.business_units || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener business units: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerBusinessUnitPorId(
    accessToken: string,
    accountId: string,
    businessUnitId: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!businessUnitId) {
        throw new Error('El ID de la business unit es requerido');
      }

      const resultado = await this.obtenerBusinessUnits(
        accessToken,
        accountId,
        region,
      );
      const businessUnits = resultado.data;

      const businessUnit = businessUnits.find(
        (unit: any) => unit.id === businessUnitId,
      );

      if (!businessUnit) {
        throw new Error(
          `Business unit no encontrada con ID: ${businessUnitId}`,
        );
      }

      return {
        data: businessUnit,
      };
    } catch (error: any) {
      throw new Error(`Error al obtener business unit: ${error.message}`);
    }
  }

  async obtenerBusinessUnitsHijas(
    accessToken: string,
    accountId: string,
    parentId?: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }

      const resultado = await this.obtenerBusinessUnits(
        accessToken,
        accountId,
        region,
      );
      const businessUnits = resultado.data;

      const hijas = businessUnits.filter(
        (unit: any) => unit.parent_id === parentId,
      );

      return {
        data: hijas,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener business units hijas: ${error.message}`,
      );
    }
  }

  async obtenerArbolBusinessUnits(
    accessToken: string,
    accountId: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }

      const resultado = await this.obtenerBusinessUnits(
        accessToken,
        accountId,
        region,
      );
      const businessUnits = resultado.data;

      const unitsMap: Record<string, any> = {};
      businessUnits.forEach((unit: any) => {
        unitsMap[unit.id] = { ...unit, children: [] };
      });

      const tree: any[] = [];
      businessUnits.forEach((unit: any) => {
        if (unit.parent_id === null || unit.parent_id === undefined) {
          tree.push(unitsMap[unit.id]);
        } else {
          if (unitsMap[unit.parent_id]) {
            unitsMap[unit.parent_id].children.push(unitsMap[unit.id]);
          }
        }
      });

      return {
        data: tree,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener árbol de business units: ${error.message}`,
      );
    }
  }

  async buscarBusinessUnits(
    accessToken: string,
    accountId: string,
    searchTerm: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!searchTerm) {
        throw new Error('El término de búsqueda es requerido');
      }

      const resultado = await this.obtenerBusinessUnits(
        accessToken,
        accountId,
        region,
      );
      const businessUnits = resultado.data;

      const searchTermLower = searchTerm.toLowerCase();
      const resultados = businessUnits.filter((unit: any) => {
        const nameLower = (unit.name || '').toLowerCase();
        const descriptionLower = (unit.description || '').toLowerCase();
        return (
          nameLower.includes(searchTermLower) ||
          descriptionLower.includes(searchTermLower)
        );
      });

      return {
        data: resultados,
      };
    } catch (error: any) {
      throw new Error(`Error al buscar business units: ${error.message}`);
    }
  }

  async crearOActualizarBusinessUnits(
    accessToken: string,
    accountId: string,
    businessUnits: any[],
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!businessUnits || businessUnits.length === 0) {
        throw new Error('Debe proporcionar al menos una business unit');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/business_units_structure`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.put<any>(
        url,
        { business_units: businessUnits },
        { headers },
      );

      return {
        data: response.data.business_units || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear/actualizar business units: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }
}
