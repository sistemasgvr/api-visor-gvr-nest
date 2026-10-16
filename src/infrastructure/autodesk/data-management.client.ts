import { UPLOAD_S3_HTTP_TIMEOUT_MS } from '../../config/upload.constants';
import { translateAutodeskApiEnglishFragment } from '../utils/autodesk-error-i18n';
import { AutodeskClientBase } from './autodesk-client.base';

export class AutodeskDataManagementClient extends AutodeskClientBase {
  async obtenerHubs(
    accessToken: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      let url = `${baseUrl}/project/v1/hubs`;

      // Build query parameters for filters
      const queryParams: string[] = [];
      if (filters['id']) {
        queryParams.push(`filter[id]=${encodeURIComponent(filters['id'])}`);
      }
      if (filters['name']) {
        queryParams.push(`filter[name]=${encodeURIComponent(filters['name'])}`);
      }
      if (filters['extension.type']) {
        queryParams.push(
          `filter[extension.type]=${encodeURIComponent(filters['extension.type'])}`,
        );
      }

      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
        links: response.data.links || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener hubs: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerProyectos(
    accessToken: string,
    hubId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!hubId) {
        throw new Error('El ID del hub es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      let url = `${baseUrl}/project/v1/hubs/${encodeURIComponent(hubId)}/projects`;

      // Build query parameters for filters
      const queryParams: string[] = [];
      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          queryParams.push(`filter[${key}]=${encodeURIComponent(value)}`);
        }
      }

      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
        links: response.data.links || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener proyectos: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerProyectoPorId(
    accessToken: string,
    hubId: string,
    projectId: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!hubId) {
        throw new Error('El ID del hub es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/project/v1/hubs/${encodeURIComponent(hubId)}/projects/${encodeURIComponent(projectId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener proyecto: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerItems(
    accessToken: string,
    projectId: string,
    folderId?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }

      // Si no se especifica folderId, usar "root"
      const folder = folderId || 'root';

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/items/${encodeURIComponent(folder)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
        links: response.data.links || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener items: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerItemPorId(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!itemId) {
        throw new Error('El ID del item es requerido');
      }

      // Asegurar que projectId tenga el prefijo 'b.' para Data Management API
      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/items/${encodeURIComponent(itemId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || null,
        included: response.data.included || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener item: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerVersionesItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    // Asegurar que projectId tenga el prefijo 'b.' para Data Management API
    const dataManagementProjectId = projectId.startsWith('b.')
      ? projectId
      : `b.${projectId}`;
    const baseUrl =
      this.configService.get<string>('AUTODESK_API_BASE_URL') ||
      'https://developer.api.autodesk.com';
    const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/items/${encodeURIComponent(itemId)}/versions`;

    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!itemId) {
        throw new Error('El ID del item es requerido');
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Verificar que la respuesta tenga la estructura esperada
      if (!response || !response.data) {
        throw new Error(
          'La respuesta de Autodesk API no tiene el formato esperado',
        );
      }

      return {
        data: response.data.data || [],
        links: response.data.links || {},
      };
    } catch (error: any) {
      // Log del error para debugging
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.developerMessage ||
        error.message ||
        'Error desconocido al obtener versiones';

      const errorDetails = {
        message: errorMessage,
        status: error.response?.status,
        url: url,
        projectId: projectId,
        itemId: itemId,
      };

      throw new Error(
        `Error al obtener versiones de Autodesk: ${errorMessage}. Detalles: ${JSON.stringify(errorDetails)}`,
      );
    }
  }

  async obtenerCarpetaPorId(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId) {
        throw new Error('Token, projectId y folderId son requeridos');
      }

      // Asegurar que projectId tenga el prefijo 'b.' para Data Management API
      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/folders/${encodeURIComponent(folderId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener carpeta: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerContenidoCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId) {
        throw new Error('Token, projectId y folderId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      let url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/folders/${encodeURIComponent(folderId)}/contents`;

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
        included: response.data.included || [],
        links: response.data.links || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener contenido de carpeta: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerContenidoCarpetaTodasLasPaginas(
    accessToken: string,
    projectId: string,
    folderId: string,
    filters: Record<string, any> = {},
  ): Promise<{ data: any[]; included: any[] }> {
    const dataManagementProjectId = projectId.startsWith('b.')
      ? projectId
      : `b.${projectId}`;
    const baseUrl =
      this.configService.get<string>('AUTODESK_API_BASE_URL') ||
      'https://developer.api.autodesk.com';
    const initialPath = `${baseUrl}/data/v1/projects/${encodeURIComponent(
      dataManagementProjectId,
    )}/folders/${encodeURIComponent(folderId)}/contents`;
    const q =
      Object.keys(filters).length > 0
        ? '?' +
          new URLSearchParams(filters as Record<string, string>).toString()
        : '';
    let nextUrl: string | null = initialPath + q;
    const all: any[] = [];
    const allIncluded: any[] = [];
    const guard = 200;
    let pages = 0;
    while (nextUrl && pages < guard) {
      pages += 1;
      const response = await this.httpClient.get<any>(nextUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const chunk = response.data.data || [];
      all.push(...chunk);
      allIncluded.push(...(response.data.included || []));
      const links = response.data?.links;
      const next = links?.next;
      if (typeof next === 'string' && next.length > 0) {
        nextUrl = next;
      } else if (
        next &&
        typeof next === 'object' &&
        (next as { href?: string }).href
      ) {
        nextUrl = (next as { href: string }).href;
      } else {
        nextUrl = null;
      }
    }
    return { data: all, included: allIncluded };
  }

  async buscarEnContenidoCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    searchName?: string,
    filterType?: string,
    extensionType?: string,
    additionalFilters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId) {
        throw new Error('Token, projectId y folderId son requeridos');
      }

      // Asegurar que projectId tenga el prefijo 'b.' para Data Management API
      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      // Usar el endpoint /contents que es más confiable para obtener el contenido de una carpeta
      // El endpoint /search tiene problemas conocidos con filtros de displayName
      let url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/folders/${encodeURIComponent(folderId)}/contents`;

      const params: Record<string, string> = { ...additionalFilters };

      // Aplicar filtros que sí funcionan en /contents
      if (filterType) {
        params['filter[type]'] = filterType;
      }
      if (extensionType) {
        params['filter[extension.type]'] = extensionType;
      }

      if (Object.keys(params).length > 0) {
        url += '?' + new URLSearchParams(params).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      let allData = response.data.data || [];

      // Si hay un término de búsqueda, filtrar del lado del cliente
      // Esto es necesario porque Autodesk no soporta bien el filtro por displayName
      if (searchName && searchName.trim()) {
        const searchTermLower = searchName.trim().toLowerCase();
        allData = allData.filter((item: any) => {
          // Buscar en displayName y name (case-insensitive, búsqueda parcial)
          const displayName = (
            item.attributes?.displayName || ''
          ).toLowerCase();
          const name = (item.attributes?.name || '').toLowerCase();
          return (
            displayName.includes(searchTermLower) ||
            name.includes(searchTermLower)
          );
        });
      }

      return {
        data: allData,
        links: response.data.links || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al buscar en contenido de carpeta: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerCarpetaPadre(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId) {
        throw new Error('Token, projectId y folderId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/folders/${encodeURIComponent(folderId)}/parent`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener carpeta padre: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerReferenciasCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId) {
        throw new Error('Token, projectId y folderId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/folders/${encodeURIComponent(folderId)}/refs`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
        links: response.data.links || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener referencias: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerRelacionesLinksCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId) {
        throw new Error('Token, projectId y folderId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/folders/${encodeURIComponent(folderId)}/relationships/links`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener relaciones de links: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerRelacionesRefsCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId) {
        throw new Error('Token, projectId y folderId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/folders/${encodeURIComponent(folderId)}/relationships/refs`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener relaciones de refs: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async buscarEnCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId) {
        throw new Error('Token, projectId y folderId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      let url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/folders/${encodeURIComponent(folderId)}/search`;

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
        links: response.data.links || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al buscar en carpeta: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearCarpeta(
    accessToken: string,
    projectId: string,
    folderData: any,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderData) {
        throw new Error('Token, projectId y folderData son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/folders`;

      const body = {
        jsonapi: { version: '1.0' },
        data: folderData,
      };

      const response = await this.httpClient.post<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear carpeta: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearSubcarpeta(
    accessToken: string,
    projectId: string,
    parentFolderId: string,
    folderName: string,
    folderType?: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !parentFolderId || !folderName) {
        throw new Error(
          'Token, projectId, parentFolderId y folderName son requeridos',
        );
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/folders`;

      const folderData: any = {
        type: 'folders',
        attributes: {
          name: folderName,
        },
        relationships: {
          parent: {
            data: {
              type: 'folders',
              id: parentFolderId,
            },
          },
        },
      };

      if (folderType) {
        folderData.attributes.extension = {
          type: folderType,
          version: '1.0',
        };
      }

      const body = {
        jsonapi: { version: '1.0' },
        data: folderData,
      };

      const response = await this.httpClient.post<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear subcarpeta: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearReferenciaCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    refData: any,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId || !refData) {
        throw new Error('Token, projectId, folderId y refData son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/folders/${encodeURIComponent(folderId)}/relationships/refs`;

      const body = {
        jsonapi: { version: '1.0' },
        data: refData,
      };

      const response = await this.httpClient.post<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear referencia: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async actualizarCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    updateData: any,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId || !updateData) {
        throw new Error(
          'Token, projectId, folderId y updateData son requeridos',
        );
      }

      // Asegurar que projectId tenga el prefijo 'b.' para Data Management API
      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/folders/${encodeURIComponent(folderId)}`;

      const body = {
        jsonapi: { version: '1.0' },
        data: updateData,
      };

      const response = await this.httpClient.patch<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al actualizar carpeta: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async eliminarCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId) {
        throw new Error('Token, projectId y folderId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/folders/${encodeURIComponent(folderId)}`;

      const body = {
        jsonapi: { version: '1.0' },
        data: {
          type: 'folders',
          id: folderId,
          attributes: {
            hidden: true,
          },
        },
      };

      const response = await this.httpClient.patch<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        data: response.data.data || null,
        hiddenAt: new Date().toISOString(),
        wasAlreadyHidden: response.data.data?.attributes?.hidden === true,
      };
    } catch (error: any) {
      throw new Error(
        `Error al eliminar carpeta: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async restaurarCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId) {
        throw new Error('Token, projectId y folderId son requeridos');
      }

      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/folders/${encodeURIComponent(folderId)}`;

      const body = {
        jsonapi: { version: '1.0' },
        data: {
          type: 'folders',
          id: folderId,
          attributes: {
            hidden: false,
          },
        },
      };

      const response = await this.httpClient.patch<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        data: response.data.data || null,
        restoredAt: new Date().toISOString(),
        wasAlreadyVisible: response.data.data?.attributes?.hidden === false,
      };
    } catch (error: any) {
      throw new Error(
        `Error al restaurar carpeta: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerHubDeProyecto(
    accessToken: string,
    hubId: string,
    projectId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !hubId || !projectId) {
        throw new Error('Token, hubId y projectId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/project/v1/hubs/${encodeURIComponent(hubId)}/projects/${encodeURIComponent(projectId)}/hub`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener hub de proyecto: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerCarpetasPrincipales(
    accessToken: string,
    hubId: string,
    projectId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !hubId || !projectId) {
        throw new Error('Token, hubId y projectId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/project/v1/hubs/${encodeURIComponent(hubId)}/projects/${encodeURIComponent(projectId)}/topFolders`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
        links: response.data.links || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener carpetas principales: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearStorage(
    accessToken: string,
    projectId: string,
    storageData: any,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !storageData) {
        throw new Error('Token, projectId y storageData son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/storage`;

      const body = {
        jsonapi: { version: '1.0' },
        data: storageData,
      };

      const response = await this.httpClient.post<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      const raw = String(
        error.response?.data?.message || error.message || 'Error desconocido',
      );
      throw new Error(
        `Error al crear storage: ${translateAutodeskApiEnglishFragment(raw)}`,
      );
    }
  }

  async crearDescarga(
    accessToken: string,
    projectId: string,
    downloadData: any,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !downloadData) {
        throw new Error('Token, projectId y downloadData son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/downloads`;

      const response = await this.httpClient.post<any>(url, downloadData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear descarga: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerEstadoDescarga(
    accessToken: string,
    projectId: string,
    downloadId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !downloadId) {
        throw new Error('Token, projectId y downloadId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/downloads/${encodeURIComponent(downloadId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener estado de descarga: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerEstadoJob(
    accessToken: string,
    projectId: string,
    jobId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !jobId) {
        throw new Error('Token, projectId y jobId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/jobs/${encodeURIComponent(jobId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener estado de job: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async descargarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemId) {
        throw new Error('Token, projectId y itemId son requeridos');
      }

      // 1. Obtener información del item para conseguir el storage ID
      const itemInfo = await this.obtenerItemPorId(
        accessToken,
        projectId,
        itemId,
      );

      if (!itemInfo.data) {
        throw new Error('No se pudo obtener la información del item');
      }

      // 2. Buscar el storage ID
      let storageId: string | null = null;

      if (itemInfo.data.relationships?.tip?.data?.id) {
        const tipId = itemInfo.data.relationships.tip.data.id;

        if (itemInfo.included) {
          for (const included of itemInfo.included) {
            if (included.type === 'versions' && included.id === tipId) {
              storageId = included.relationships?.storage?.data?.id || null;
              break;
            }
          }
        }
      }

      if (!storageId) {
        throw new Error('No se encontró el storage ID del item');
      }

      // 3. Extraer bucketKey y objectKey
      const regex = /urn:adsk\.objects:os\.object:([^\/]+)\/(.+)/;
      const matches = storageId.match(regex);

      if (!matches || matches.length !== 3) {
        throw new Error(`Formato de storage ID inválido: ${storageId}`);
      }

      const bucketKey = matches[1];
      const objectKey = matches[2];

      // 4. Obtener URL firmada para descarga
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const signedUrlEndpoint = `${baseUrl}/oss/v2/buckets/${encodeURIComponent(bucketKey)}/objects/${encodeURIComponent(objectKey)}/signeds3download`;

      const signedResponse = await this.httpClient.get<any>(signedUrlEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!signedResponse.data?.url) {
        throw new Error('No se recibió URL firmada en la respuesta');
      }

      const signedUrl = signedResponse.data.url;

      // 5. Descargar el archivo usando la URL firmada
      const fileResponse = await this.httpClient.get<any>(signedUrl, {
        responseType: 'arraybuffer',
      });

      const fileName =
        itemInfo.data.attributes?.displayName || 'archivo_descargado';

      return {
        data: fileResponse.data,
        fileName: fileName,
        storageId: storageId,
      };
    } catch (error: any) {
      throw new Error(
        `Error al descargar item: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async descargarItemPorVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !versionId) {
        throw new Error('Token, projectId y versionId son requeridos');
      }

      const { storageUrl, fileName, storageId } =
        await this.obtenerStorageUrlPorVersion(
          accessToken,
          projectId,
          versionId,
        );

      const fileResponse = await this.httpClient.get<any>(storageUrl, {
        responseType: 'arraybuffer',
      });

      return {
        data: fileResponse.data,
        fileName: fileName,
        storageId: storageId,
      };
    } catch (error: any) {
      throw new Error(
        `Error al descargar versión del item: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerStorageUrl(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<{
    storageUrl: string;
    fileName: string;
    fileType: string;
    storageId: string;
  }> {
    try {
      if (!accessToken || !projectId || !itemId) {
        throw new Error('Token, projectId y itemId son requeridos');
      }

      // 1. Obtener información del item para conseguir el storage ID
      const itemInfo = await this.obtenerItemPorId(
        accessToken,
        projectId,
        itemId,
      );

      if (!itemInfo.data) {
        throw new Error('No se pudo obtener la información del item');
      }

      // 2. Buscar el storage ID en included o relationships
      let storageId: string | null = null;

      // Buscar en included
      if (itemInfo.included && Array.isArray(itemInfo.included)) {
        for (const inc of itemInfo.included) {
          if (inc.type === 'versions' && inc.relationships?.storage?.data?.id) {
            storageId = inc.relationships.storage.data.id;
            break;
          }
        }
      }

      // Si no está en included, buscar en relationships del item
      if (!storageId && itemInfo.data.relationships?.tip?.data?.id) {
        const tipVersionId = itemInfo.data.relationships.tip.data.id;
        // Obtener la versión tip para conseguir el storage
        const versionInfo = await this.obtenerVersionPorId(
          accessToken,
          projectId,
          tipVersionId,
        );
        if (versionInfo.data?.relationships?.storage?.data?.id) {
          storageId = versionInfo.data.relationships.storage.data.id;
        }
      }

      if (!storageId) {
        throw new Error('No se encontró el storage ID del archivo');
      }

      // 3. Extraer bucketKey y objectKey
      const regex = /urn:adsk\.objects:os\.object:([^\/]+)\/(.+)/;
      const matches = storageId.match(regex);

      if (!matches || matches.length !== 3) {
        throw new Error(`Formato de storage ID inválido: ${storageId}`);
      }

      const bucketKey = matches[1];
      const objectKey = matches[2];

      // 4. Obtener URL firmada para descarga (con 60 minutos de expiración)
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const signedUrlEndpoint = `${baseUrl}/oss/v2/buckets/${encodeURIComponent(bucketKey)}/objects/${encodeURIComponent(objectKey)}/signeds3download?minutesExpiration=60`;

      const signedResponse = await this.httpClient.get<any>(signedUrlEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!signedResponse.data?.url) {
        throw new Error('No se recibió URL firmada en la respuesta');
      }

      const fileName = itemInfo.data.attributes?.displayName || 'archivo';
      const fileType = itemInfo.data.attributes?.extension?.type || '';

      return {
        storageUrl: signedResponse.data.url,
        fileName: fileName,
        fileType: fileType,
        storageId: storageId,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener URL de storage: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerStorageUrlPorVersion(
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
    try {
      if (!accessToken || !projectId || !versionId) {
        throw new Error('Token, projectId y versionId son requeridos');
      }

      const versionInfo = await this.obtenerVersionPorId(
        accessToken,
        projectId,
        versionId,
      );
      const versionData = versionInfo.data;

      if (!versionData) {
        throw new Error('No se pudo obtener la información de la versión');
      }

      const storageData = versionData.relationships?.storage?.data;
      if (!storageData?.id) {
        throw new Error('No se encontró el storage de la versión');
      }

      const storageId = storageData.id;
      const regex = /urn:adsk\.objects:os\.object:([^\/]+)\/(.+)/;
      const matches = storageId.match(regex);

      if (!matches || matches.length !== 3) {
        throw new Error(`Formato de storage ID inválido: ${storageId}`);
      }

      const bucketKey = matches[1];
      const objectKey = matches[2];
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const signedUrlEndpoint = `${baseUrl}/oss/v2/buckets/${encodeURIComponent(bucketKey)}/objects/${encodeURIComponent(objectKey)}/signeds3download?minutesExpiration=60`;

      const signedResponse = await this.httpClient.get<any>(signedUrlEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!signedResponse.data?.url) {
        throw new Error('No se recibió URL firmada en la respuesta');
      }

      const fileName =
        versionData.attributes?.displayName ||
        versionData.attributes?.name ||
        'archivo';
      const fileType = versionData.attributes?.extension?.type || '';
      let itemId = '';
      try {
        const itemRes = await this.obtenerItemVersion(
          accessToken,
          projectId,
          versionId,
        );
        if (itemRes.data?.id) {
          itemId = itemRes.data.id;
        }
      } catch {
        // Si falla, el controlador puede usar versionId como referencia
      }

      return {
        storageUrl: signedResponse.data.url,
        fileName,
        fileType,
        storageId,
        itemId,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener URL de storage de la versión: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerItemPadre(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemId) {
        throw new Error('Token, projectId y itemId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/items/${encodeURIComponent(itemId)}/parent`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener item padre: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerReferenciasItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemId) {
        throw new Error('Token, projectId y itemId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/items/${encodeURIComponent(itemId)}/refs`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
        links: response.data.links || {},
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener referencias de item: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerRelacionesLinksItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemId) {
        throw new Error('Token, projectId y itemId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/items/${encodeURIComponent(itemId)}/relationships/links`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener relaciones de links de item: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerRelacionesRefsItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemId) {
        throw new Error('Token, projectId y itemId son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/items/${encodeURIComponent(itemId)}/relationships/refs`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener relaciones de refs de item: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerTipVersion(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemId) {
        throw new Error('Token, projectId y itemId son requeridos');
      }

      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/items/${encodeURIComponent(itemId)}/tip`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener versión tip: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerManifiesto(urn: string): Promise<any> {
    try {
      if (!urn) {
        throw new Error('URN es requerido');
      }

      // Obtener token 2-legged con scope viewables:read
      const tokenData = await this.obtenerToken2Legged(['viewables:read']);

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/modelderivative/v2/designdata/${encodeURIComponent(urn)}/manifest`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      return {
        data: response.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener manifiesto: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerMetadatos(urn: string): Promise<any> {
    try {
      if (!urn) {
        throw new Error('URN es requerido');
      }

      // Obtener token 2-legged con scope viewables:read
      const tokenData = await this.obtenerToken2Legged(['viewables:read']);

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/modelderivative/v2/designdata/${encodeURIComponent(urn)}/metadata`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      return {
        data: response.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener metadatos: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerUrlMiniatura(
    accessToken: string,
    snapshotUrn: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!snapshotUrn) {
        throw new Error('El snapshotUrn es requerido');
      }

      // Si ya es una URL o data URL, retornarla directamente
      if (snapshotUrn.startsWith('data:') || snapshotUrn.startsWith('http')) {
        return {
          success: true,
          url: snapshotUrn,
        };
      }

      let urn = snapshotUrn.replace(/\\\//g, '/');
      urn = decodeURIComponent(urn);

      const match = urn.match(/urn:adsk\.objects:os\.object:([^\/]+)\/(.+)/);
      if (!match) {
        throw new Error(`Formato de snapshotUrn inválido: ${snapshotUrn}`);
      }

      const bucketKey = match[1];
      const objectKey = match[2];

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/oss/v2/buckets/${encodeURIComponent(bucketKey)}/objects/${encodeURIComponent(objectKey)}/signeds3download`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.data.url) {
        throw new Error('No se recibió URL firmada en la respuesta');
      }

      return {
        success: true,
        url: response.data.url,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async obtenerVersionPorId(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!versionId) {
        throw new Error('El ID de la versión es requerido');
      }

      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/versions/${encodeURIComponent(versionId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener versión: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerFormatosDescarga(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!versionId) {
        throw new Error('El ID de la versión es requerido');
      }

      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/versions/${encodeURIComponent(versionId)}/downloadFormats`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data.data || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener formatos de descarga: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerDescargas(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!versionId) {
        throw new Error('El ID de la versión es requerido');
      }

      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/versions/${encodeURIComponent(versionId)}/downloads`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data.data || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener descargas: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerItemVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!versionId) {
        throw new Error('El ID de la versión es requerido');
      }

      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/versions/${encodeURIComponent(versionId)}/item`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener item de versión: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerReferenciasVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!versionId) {
        throw new Error('El ID de la versión es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/versions/${encodeURIComponent(versionId)}/refs`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data.data || [],
        links: response.data.links || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener referencias de versión: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerRelacionesLinksVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!versionId) {
        throw new Error('El ID de la versión es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/versions/${encodeURIComponent(versionId)}/relationships/links`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data.data || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener relaciones de links de versión: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerRelacionesRefsVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!versionId) {
        throw new Error('El ID de la versión es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/versions/${encodeURIComponent(versionId)}/relationships/refs`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data.data || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener relaciones de refs de versión: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearVersion(
    accessToken: string,
    projectId: string,
    versionData: Record<string, any>,
    copyFrom?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!versionData) {
        throw new Error('Los datos de la versión son requeridos');
      }

      // Asegurar que projectId tenga el prefijo 'b.' para Data Management API
      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      let url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/versions`;

      // Si se proporciona copyFrom, agregarlo como query parameter
      if (copyFrom) {
        url += `?copyFrom=${encodeURIComponent(copyFrom)}`;
      }

      const body = {
        jsonapi: { version: '1.0' },
        data: versionData,
      };

      const response = await this.httpClient.post<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear versión: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearReferenciaVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
    refData: Record<string, any>,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!versionId) {
        throw new Error('El ID de la versión es requerido');
      }
      if (!refData) {
        throw new Error('Los datos de la referencia son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/versions/${encodeURIComponent(versionId)}/relationships/refs`;

      const body = {
        jsonapi: { version: '1.0' },
        data: refData,
      };

      const response = await this.httpClient.post<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear referencia en versión: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async actualizarVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
    updateData: Record<string, any>,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!versionId) {
        throw new Error('El ID de la versión es requerido');
      }
      if (!updateData) {
        throw new Error('Los datos de actualización son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/versions/${encodeURIComponent(versionId)}`;

      const body = {
        jsonapi: { version: '1.0' },
        data: updateData,
      };

      const response = await this.httpClient.patch<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al actualizar versión: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearUsuario(
    accessToken: string,
    accountId: string,
    userData: Record<string, any>,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!userData.email) {
        throw new Error('El email es requerido');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/users`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.post<any>(url, userData, {
        headers,
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear usuario: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async importarUsuarios(
    accessToken: string,
    accountId: string,
    users: any[],
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }
      if (!users || users.length === 0) {
        throw new Error('Debe proporcionar al menos un usuario');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/users/import`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region;
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
        `Error al importar usuarios: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerUsuarios(
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

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      let url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/users`;

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

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener usuarios: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerUsuarioPorId(
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
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/users/${encodeURIComponent(userId)}`;

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
        `Error al obtener usuario: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerProyectosUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
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
      if (!userId) {
        throw new Error('El ID del usuario es requerido');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      let url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/users/${encodeURIComponent(userId)}/projects`;

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

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener proyectos del usuario: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async buscarUsuarios(
    accessToken: string,
    accountId: string,
    searchTerm: string,
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
      if (!searchTerm) {
        throw new Error('El término de búsqueda es requerido');
      }

      const hqBaseUrl =
        this.configService.get<string>('ACC_HQ_URL_BASE') ||
        'https://developer.api.autodesk.com/hq/v1';
      let url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/users/search`;

      const queryParams: Record<string, string> = {
        name: searchTerm,
      };
      if (filters.limit) queryParams.limit = filters.limit.toString();
      if (filters.offset) queryParams.offset = filters.offset.toString();
      if (filters.operator) queryParams.operator = filters.operator;
      if (filters.partial !== undefined)
        queryParams.partial = filters.partial.toString();

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
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al buscar usuarios: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async actualizarUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
    userData: Record<string, any>,
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
      const url = `${hqBaseUrl}/accounts/${encodeURIComponent(accountId)}/users/${encodeURIComponent(userId)}`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['Region'] = region;
      }

      const response = await this.httpClient.patch<any>(url, userData, {
        headers,
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al actualizar usuario: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerUsuarioProyectoPorId(
    accessToken: string,
    projectId: string,
    projectUserId: string,
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
      if (!projectUserId) {
        throw new Error('El ID del usuario del proyecto es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/construction/admin/v1/projects/${encodeURIComponent(projectId)}/users/${encodeURIComponent(projectUserId)}`;

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
        `Error al obtener usuario del proyecto: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async agregarUsuarioProyecto(
    accessToken: string,
    projectId: string,
    userData: Record<string, any>,
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
      if (!userData.email) {
        throw new Error('El email es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/construction/admin/v1/projects/${encodeURIComponent(projectId)}/users`;

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

      const response = await this.httpClient.post<any>(url, userData, {
        headers,
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al agregar usuario al proyecto: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async actualizarUsuarioProyecto(
    accessToken: string,
    projectId: string,
    projectUserId: string,
    userData: Record<string, any>,
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
      if (!projectUserId) {
        throw new Error('El ID del usuario del proyecto es requerido');
      }
      if (!userData || Object.keys(userData).length === 0) {
        throw new Error('Debe proporcionar datos para actualizar');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/construction/admin/v1/projects/${encodeURIComponent(projectId)}/users/${encodeURIComponent(projectUserId)}`;

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

      const response = await this.httpClient.patch<any>(url, userData, {
        headers,
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al actualizar usuario del proyecto: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async eliminarUsuarioProyecto(
    accessToken: string,
    projectId: string,
    projectUserId: string,
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
      if (!projectUserId) {
        throw new Error('El ID del usuario del proyecto es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/construction/admin/v1/projects/${encodeURIComponent(projectId)}/users/${encodeURIComponent(projectUserId)}`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
      };

      if (region) {
        headers['Region'] = region;
      }
      if (userId) {
        headers['User-Id'] = userId;
      }

      await this.httpClient.delete<any>(url, { headers });

      return {
        data: null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al eliminar usuario del proyecto: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }

  async obtenerProyectosNew(
    accessToken: string,
    accountId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!accountId) {
        throw new Error('El ID de la cuenta es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      let url = `${baseUrl}/construction/admin/v1/accounts/${encodeURIComponent(accountId)}/projects`;

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters as any).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener proyectos new: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerProyectoPorIdNew(
    accessToken: string,
    accountId: string,
    projectId: string,
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

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/construction/admin/v1/accounts/${encodeURIComponent(accountId)}/projects/${encodeURIComponent(projectId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener proyecto new: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerIssueContainerId(
    accessToken: string,
    accountId: string,
    projectId: string,
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

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';

      // Convertir accountId a hubId (agregar prefijo 'b.' si no lo tiene)
      const hubId = accountId.startsWith('b.') ? accountId : `b.${accountId}`;

      // Asegurar que projectId tenga el prefijo 'b.' para Data Management API
      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;

      const url = `${baseUrl}/project/v1/hubs/${encodeURIComponent(hubId)}/projects/${encodeURIComponent(dataManagementProjectId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Extraer el issueContainerId
      const projectIdFromResponse = response.data?.data?.id || null;

      if (!projectIdFromResponse) {
        throw new Error(
          'No se pudo obtener el ID del proyecto desde la respuesta',
        );
      }

      // Remover el prefijo 'b.' si existe para obtener el containerId
      const issueContainerId = projectIdFromResponse.startsWith('b.')
        ? projectIdFromResponse.substring(2)
        : projectIdFromResponse;

      return {
        issueContainerId,
        projectId: projectIdFromResponse,
        hubId,
        projectData: response.data?.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener issue container ID: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerBuckets(
    accessToken: string,
    region?: string,
    limit?: number,
    startAt?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      let url = `${baseUrl}/oss/v2/buckets`;

      const queryParams: Record<string, string> = {};
      if (region) queryParams.region = region;
      if (limit) queryParams.limit = limit.toString();
      if (startAt) queryParams.startAt = startAt;

      if (Object.keys(queryParams).length > 0) {
        url += '?' + new URLSearchParams(queryParams).toString();
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['region'] = region;
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data.items || [],
        next: response.data.next || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener buckets: ${error.response?.data?.reason || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerDetallesBucket(
    accessToken: string,
    bucketKey: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!bucketKey) {
        throw new Error('El bucket key es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/oss/v2/buckets/${encodeURIComponent(bucketKey)}/details`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['region'] = region;
      }

      const response = await this.httpClient.get<any>(url, { headers });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener detalles del bucket: ${error.response?.data?.reason || error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearBucket(
    accessToken: string,
    bucketKey: string,
    policyKey: string = 'transient',
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!bucketKey) {
        throw new Error('El bucket key es requerido');
      }

      const validPolicies = ['transient', 'temporary', 'persistent'];
      if (!validPolicies.includes(policyKey)) {
        throw new Error(
          'Policy key inválido. Valores permitidos: transient, temporary, persistent',
        );
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/oss/v2/buckets`;

      const payload = {
        bucketKey,
        policyKey,
      };

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (region) {
        headers['region'] = region;
      }

      const response = await this.httpClient.post<any>(url, payload, {
        headers,
      });

      return {
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear bucket: ${error.response?.data?.reason || error.response?.data?.message || error.message}`,
      );
    }
  }

  async eliminarBucket(
    accessToken: string,
    bucketKey: string,
    region?: string,
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }
      if (!bucketKey) {
        throw new Error('El bucket key es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/oss/v2/buckets/${encodeURIComponent(bucketKey)}`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      if (region) {
        headers['region'] = region;
      }

      await this.httpClient.delete<any>(url, { headers });

      return {
        message: 'Bucket eliminado exitosamente',
      };
    } catch (error: any) {
      throw new Error(
        `Error al eliminar bucket: ${error.response?.data?.reason || error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearStorageParaItem(
    accessToken: string,
    projectId: string,
    folderId: string,
    fileName: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !folderId || !fileName) {
        throw new Error('Token, projectId, folderId y fileName son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/storage`;

      const storageData = {
        jsonapi: {
          version: '1.0',
        },
        data: {
          type: 'objects',
          attributes: {
            name: fileName,
          },
          relationships: {
            target: {
              data: {
                type: 'folders',
                id: folderId,
              },
            },
          },
        },
      };

      const response = await this.httpClient.post<any>(url, storageData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        success: true,
        data: response.data.data || null,
      };
    } catch (error: any) {
      const raw = String(
        error.response?.data?.errors?.[0]?.detail ||
          error.response?.data?.message ||
          error.message ||
          'Error desconocido',
      );
      throw new Error(
        `Error al crear storage: ${translateAutodeskApiEnglishFragment(raw)}`,
      );
    }
  }

  async obtenerUrlFirmadaS3(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
    parts: number = 1,
    options?: {
      firstPart?: number;
      uploadKey?: string;
      minutesExpiration?: number;
    },
  ): Promise<any> {
    try {
      if (!accessToken || !bucketKey || !objectKey) {
        throw new Error('Token, bucketKey y objectKey son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const qs = new URLSearchParams();
      qs.set('parts', String(parts));
      qs.set('minutesExpiration', String(options?.minutesExpiration ?? 5));
      if (options?.firstPart != null && options.firstPart > 0) {
        qs.set('firstPart', String(options.firstPart));
      }
      if (options?.uploadKey) {
        qs.set('uploadKey', options.uploadKey);
      }
      const url = `${baseUrl}/oss/v2/buckets/${encodeURIComponent(bucketKey)}/objects/${encodeURIComponent(objectKey)}/signeds3upload?${qs.toString()}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener URL firmada de S3: ${error.response?.data?.reason || error.response?.data?.message || error.message}`,
      );
    }
  }

  async subirArchivoAUrlFirmada(
    signedUrl: string,
    fileBuffer: Buffer,
  ): Promise<any> {
    try {
      if (!signedUrl || !fileBuffer) {
        throw new Error('Signed URL y file buffer son requeridos');
      }

      const response = await this.httpClient.put<any>(signedUrl, fileBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileBuffer.length.toString(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: UPLOAD_S3_HTTP_TIMEOUT_MS,
      });

      return {
        success: true,
        statusCode: response.status || 200,
      };
    } catch (error: any) {
      throw new Error(
        `Error al subir archivo a S3: ${error.response?.status || error.status || 'Unknown'} - ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async completarSubida(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
    uploadKey: string,
    options?: { eTags?: string[]; size?: number },
  ): Promise<any> {
    try {
      if (!accessToken || !bucketKey || !objectKey || !uploadKey) {
        throw new Error(
          'Token, bucketKey, objectKey y uploadKey son requeridos',
        );
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/oss/v2/buckets/${encodeURIComponent(bucketKey)}/objects/${encodeURIComponent(objectKey)}/signeds3upload`;

      const payload: {
        uploadKey;
        eTags?: string[];
        size?: number;
      } = {
        uploadKey,
      };
      const eTags = options?.eTags;
      if (Array.isArray(eTags) && eTags.length > 0) {
        payload.eTags = eTags;
      }
      const uploadSize = options?.size;
      if (typeof uploadSize === 'number' && Number.isFinite(uploadSize)) {
        payload.size = Math.max(0, Math.trunc(uploadSize));
      }

      const response = await this.httpClient.post<any>(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al completar subida: ${error.response?.data?.reason || error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearItem(
    accessToken: string,
    projectId: string,
    itemData: any,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemData) {
        throw new Error('Token, projectId y itemData son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/items`;

      const response = await this.httpClient.post<any>(url, itemData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        success: true,
        data: response.data.data || null,
        included: response.data.included || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear item: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async copiarItem(
    accessToken: string,
    projectId: string,
    sourceVersionUrn: string,
    targetFolderId: string,
    fileName: string,
  ): Promise<any> {
    try {
      if (
        !accessToken ||
        !projectId ||
        !sourceVersionUrn ||
        !targetFolderId ||
        !fileName
      ) {
        throw new Error(
          'Token, projectId, sourceVersionUrn, targetFolderId y fileName son requeridos',
        );
      }

      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/items?copyFrom=${encodeURIComponent(sourceVersionUrn)}`;

      // Según la documentación de Autodesk, el body debe incluir:
      // - tip relationship con id "1" (referencia interna)
      // - parent relationship con el folder destino
      // - included array con la versión y nombre del archivo
      const body = {
        jsonapi: { version: '1.0' },
        data: {
          type: 'items',
          relationships: {
            tip: {
              data: {
                type: 'versions',
                id: '1',
              },
            },
            parent: {
              data: {
                type: 'folders',
                id: targetFolderId,
              },
            },
          },
        },
        included: [
          {
            type: 'versions',
            id: '1',
            attributes: {
              name: fileName,
            },
          },
        ],
      };

      const response = await this.httpClient.post<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        success: true,
        data: response.data.data || null,
        included: response.data.included || [],
      };
    } catch (error: any) {
      throw new Error(
        `Error al copiar item: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearReferenciaItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    refData: any,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemId || !refData) {
        throw new Error('Token, projectId, itemId y refData son requeridos');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/items/${encodeURIComponent(itemId)}/relationships/refs`;

      const body = {
        jsonapi: { version: '1.0' },
        data: refData,
      };

      const response = await this.httpClient.post<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        success: true,
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al crear referencia: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async actualizarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    itemData: any,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemId || !itemData) {
        throw new Error('Token, projectId, itemId y itemData son requeridos');
      }

      // Asegurar que projectId tenga el prefijo 'b.' para Data Management API
      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/items/${encodeURIComponent(itemId)}`;

      const response = await this.httpClient.patch<any>(url, itemData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        success: true,
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al actualizar item: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async moverItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    targetFolderId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemId || !targetFolderId) {
        throw new Error(
          'Token, projectId, itemId y targetFolderId son requeridos',
        );
      }

      // Asegurar que projectId tenga el prefijo 'b.' para Data Management API
      const dataManagementProjectId = projectId.startsWith('b.')
        ? projectId
        : `b.${projectId}`;

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(dataManagementProjectId)}/items/${encodeURIComponent(itemId)}`;

      // Estructura del body para actualizar la relación parent
      const itemData = {
        jsonapi: { version: '1.0' },
        data: {
          type: 'items',
          id: itemId,
          relationships: {
            parent: {
              data: {
                type: 'folders',
                id: targetFolderId,
              },
            },
          },
        },
      };

      const response = await this.httpClient.patch<any>(url, itemData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        success: true,
        data: response.data.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al mover item: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async eliminarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemId) {
        throw new Error('Token, projectId y itemId son requeridos');
      }

      // Paso 1: Validar la versión tip para evitar duplicar eliminaciones
      const tipInfo = await this.obtenerTipVersion(
        accessToken,
        projectId,
        itemId,
      );
      const tipData = tipInfo.data || null;
      const tipExtension = tipData?.attributes?.extension?.type || null;

      if (tipExtension && tipExtension.toLowerCase().includes('deleted')) {
        return {
          success: true,
          message:
            'El item ya estaba marcado como eliminado mediante versión Deleted',
          data: tipData,
          wasAlreadyDeleted: true,
        };
      }

      // Paso 2: Crear la versión Deleted
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/data/v1/projects/${encodeURIComponent(projectId)}/versions`;

      const payload = {
        jsonapi: {
          version: '1.0',
        },
        data: {
          type: 'versions',
          attributes: {
            extension: {
              type: 'versions:autodesk.core:Deleted',
              version: '1.0',
            },
          },
          relationships: {
            item: {
              data: {
                type: 'items',
                id: itemId,
              },
            },
          },
        },
      };

      const response = await this.httpClient.post<any>(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return {
        success: true,
        message: 'Item marcado como eliminado creando versión Deleted',
        data: response.data.data || null,
        deletedAt: new Date().toISOString(),
        wasAlreadyDeleted: false,
      };
    } catch (error: any) {
      throw new Error(
        `Error al eliminar item: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async restaurarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    parentFolderId?: string,
  ): Promise<any> {
    try {
      if (!accessToken || !projectId || !itemId) {
        throw new Error('Token, projectId y itemId son requeridos');
      }

      let itemData: any = null;
      try {
        const itemInfo = await this.obtenerItemPorId(
          accessToken,
          projectId,
          itemId,
        );
        itemData = itemInfo?.data || null;
      } catch {
        // continuar sin metadatos del item
      }

      const resolvedParentId =
        parentFolderId || itemData?.relationships?.parent?.data?.id || null;
      const fileName =
        itemData?.attributes?.name ||
        itemData?.attributes?.displayName ||
        'archivo';
      const isHidden = itemData?.attributes?.hidden === true;

      const tipInfo = await this.obtenerTipVersion(
        accessToken,
        projectId,
        itemId,
      );
      const tipData = tipInfo.data || null;
      const tipExtension = tipData?.attributes?.extension?.type || '';
      const tipIsDeleted = tipExtension.toLowerCase().includes('deleted');

      if (!tipIsDeleted) {
        if (isHidden) {
          const unhidden = await this.actualizarItem(
            accessToken,
            projectId,
            itemId,
            {
              jsonapi: { version: '1.0' },
              data: {
                type: 'items',
                id: itemId,
                attributes: {
                  hidden: false,
                },
              },
            },
          );
          return {
            success: true,
            message: 'Archivo restaurado exitosamente',
            data: unhidden.data || null,
            restoreMethod: 'unhide',
            restoredAt: new Date().toISOString(),
            wasAlreadyRestored: false,
          };
        }

        return {
          success: true,
          message: 'El archivo no está marcado como eliminado',
          data: tipData,
          wasAlreadyRestored: true,
        };
      }

      const versiones = await this.obtenerVersionesItem(
        accessToken,
        projectId,
        itemId,
      );
      const lista = versiones?.data || [];
      const versionOrigen = lista.find((v: any) => {
        const ext = String(v?.attributes?.extension?.type || '').toLowerCase();
        return !ext.includes('deleted');
      });

      if (!versionOrigen?.id) {
        throw new Error(
          'No se encontró una versión anterior válida para restaurar el archivo',
        );
      }

      const estrategias: Array<() => Promise<any>> = [
        () =>
          this.restaurarVersionConCopyFrom(
            accessToken,
            projectId,
            versionOrigen.id,
          ),
        () =>
          this.restaurarVersionConCopyFrom(
            accessToken,
            projectId,
            versionOrigen.id,
            itemId,
          ),
      ];

      let ultimoError: any = null;
      for (const estrategia of estrategias) {
        try {
          const versionRestaurada = await estrategia();
          return {
            success: true,
            message: 'Archivo restaurado exitosamente',
            data: versionRestaurada,
            restoreMethod: 'copyFrom',
            restoredFromVersionId: versionOrigen.id,
            restoredAt: new Date().toISOString(),
            wasAlreadyRestored: false,
          };
        } catch (error: any) {
          ultimoError = error;
          if (!this.esErrorItemEliminado(error)) {
            throw error;
          }
        }
      }

      if (!resolvedParentId) {
        throw new Error(
          'No se encontró la carpeta padre para restaurar el archivo eliminado',
        );
      }

      try {
        const copia = await this.copiarItem(
          accessToken,
          projectId,
          versionOrigen.id,
          resolvedParentId,
          fileName,
        );
        return {
          success: true,
          message: 'Archivo restaurado exitosamente en la carpeta original',
          data: copia.data || null,
          restoreMethod: 'recreate',
          restoredFromVersionId: versionOrigen.id,
          restoredAt: new Date().toISOString(),
          wasAlreadyRestored: false,
        };
      } catch (error: any) {
        throw (
          ultimoError ||
          error ||
          new Error('No se pudo restaurar el archivo eliminado')
        );
      }
    } catch (error: any) {
      throw new Error(
        `Error al restaurar item: ${error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerUrlFirmadaS3Upload(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
  ): Promise<any> {
    try {
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/oss/v2/buckets/${encodeURIComponent(bucketKey)}/objects/${encodeURIComponent(objectKey)}/signeds3upload?parts=1&minutesExpiration=5`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener URL firmada S3: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async subirArchivoS3(
    uploadUrl: string,
    content: Buffer | string,
    contentType: string,
  ): Promise<any> {
    try {
      // Note: direct axios call might be needed if httpClient wraps too much
      // Assuming httpClient supports custom headers and raw body
      const response = await this.httpClient.put<any>(uploadUrl, content, {
        headers: {
          'Content-Type': contentType,
          // Content-Length is usually set automatically by axios for Buffers
        },
      });

      return {
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(
        `Error al subir archivo a S3: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async finalizarUploadS3(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
    uploadKey: string,
  ): Promise<any> {
    try {
      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/oss/v2/buckets/${encodeURIComponent(bucketKey)}/objects/${encodeURIComponent(objectKey)}/signeds3upload`;

      const body = {
        uploadKey: uploadKey,
      };

      const response = await this.httpClient.post<any>(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data || null,
      };
    } catch (error: any) {
      throw new Error(
        `Error al finalizar subida S3: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}
