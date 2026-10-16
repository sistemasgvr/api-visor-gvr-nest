import { AutodeskClientBase } from './autodesk-client.base';

export class AutodeskIssuesClient extends AutodeskClientBase {
  async obtenerPerfilUsuario(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/users/me`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener perfil de usuario: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerTiposIncidencias(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issue-types`;

      if (!filters.include) {
        filters.include = 'subtypes';
      }

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters as any).toString();
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
        `Error al obtener tipos de incidencias: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerDefinicionesAtributos(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issue-attribute-definitions`;

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters as any).toString();
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
        `Error al obtener definiciones de atributos: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerMapeosAtributos(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issue-attribute-mappings`;

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters as any).toString();
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
        `Error al obtener mapeos de atributos: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerCategoriasRaiz(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issue-root-cause-categories`;

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters as any).toString();
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
        `Error al obtener categorías de causa raíz: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerIncidencias(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues`;

      // Remover include si existe
      const cleanFilters = { ...filters };
      delete cleanFilters.include;

      if (Object.keys(cleanFilters).length > 0) {
        // Construir query string manualmente para soportar arrays con corchetes
        const queryParams: string[] = [];
        for (const [key, value] of Object.entries(cleanFilters)) {
          if (value !== undefined && value !== null) {
            // Si la clave termina con '[]', es un array
            if (key.endsWith('[]')) {
              // Para arrays, agregar cada valor con la misma clave
              const arrayKey = key;
              const arrayValues = Array.isArray(value) ? value : [value];
              arrayValues.forEach((val) => {
                queryParams.push(
                  `${encodeURIComponent(arrayKey)}=${encodeURIComponent(String(val))}`,
                );
              });
            } else {
              queryParams.push(
                `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
              );
            }
          }
        }
        if (queryParams.length > 0) {
          url += '?' + queryParams.join('&');
        }
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener incidencias: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearIncidencia(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
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
        `Error al crear incidencia: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerIncidenciaPorId(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues/${encodeURIComponent(issueId)}`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener incidencia: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async actualizarIncidencia(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
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
        `Error al actualizar incidencia: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerComentarios(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues/${encodeURIComponent(issueId)}/comments`;

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters as any).toString();
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
        `Error al obtener comentarios: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearComentario(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
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
        `Error al crear comentario: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async crearAdjunto(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/attachments`;

      const storageUrn = data.urn;
      const displayName = data.name || data.displayName || 'Attachment';

      // Generar attachmentId único
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

      const response = await this.httpClient.post<any>(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al crear adjunto: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async obtenerAdjuntos(
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
      let url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/attachments/${encodeURIComponent(issueId)}/items`;

      if (Object.keys(filters).length > 0) {
        url += '?' + new URLSearchParams(filters as any).toString();
      }

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const attachments =
        response.data.attachments ||
        response.data.results ||
        response.data.items ||
        response.data ||
        [];

      return {
        data: Array.isArray(attachments) ? attachments : [],
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404 || status === 504) {
        return { data: [], pagination: {} };
      }
      throw new Error(
        `Error al obtener adjuntos: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async eliminarAdjunto(
    accessToken: string,
    projectId: string,
    issueId: string,
    attachmentId: string,
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
      const normalizedProjectId = this.normalizarProjectId(projectId);
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/attachments/${encodeURIComponent(issueId)}/items/${encodeURIComponent(attachmentId)}`;

      await this.httpClient.delete<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        message: 'Adjunto eliminado correctamente',
      };
    } catch (error: any) {
      throw new Error(
        `Error al eliminar adjunto: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async exportarIncidencias(
    accessToken: string,
    projectId: string,
    dto: any,
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
      const normalizedProjectId = this.normalizarProjectId(projectId);

      // Construir el payload según el tipo de reporte
      const payload: any = {
        reportType: dto.tipoReporte,
        format: dto.formato,
      };

      // Agregar opciones según el tipo de reporte
      if (dto.titulo) payload.title = dto.titulo;
      if (dto.guardarEnArchivos !== undefined)
        payload.saveToFiles = dto.guardarEnArchivos;
      if (dto.diseño) payload.design = dto.diseño;

      // Opciones para incluir en el reporte
      const options: any = {};
      if (dto.incluirCubierta !== undefined)
        options.cover = dto.incluirCubierta;
      if (dto.incluirIndice !== undefined) options.index = dto.incluirIndice;
      if (dto.incluirInformacionGeneralPlano !== undefined)
        options.generalPlanInfo = dto.incluirInformacionGeneralPlano;
      if (dto.incluirCamposPersonalizados !== undefined)
        options.customFields = dto.incluirCamposPersonalizados;
      if (dto.incluirVinculosArchivo !== undefined)
        options.fileLinks = dto.incluirVinculosArchivo;
      if (dto.incluirFotos !== undefined) options.photos = dto.incluirFotos;
      if (dto.tamañoFotos) options.photoSize = dto.tamañoFotos;
      if (dto.incluirOtrasReferencias !== undefined)
        options.otherReferences = dto.incluirOtrasReferencias;
      if (dto.incluirComentarios !== undefined)
        options.comments = dto.incluirComentarios;

      if (Object.keys(options).length > 0) {
        payload.options = options;
      }

      // Para detalle de incidencia
      if (dto.tipoReporte === 'issue_detail' && dto.issueId) {
        const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/issues/${encodeURIComponent(dto.issueId)}/reports`;

        const response = await this.httpClient.post<any>(url, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          responseType: dto.formato === 'bcf' ? 'arraybuffer' : 'arraybuffer', // Para descargar archivos
        });

        return {
          success: true,
          data: response.data,
          contentType:
            dto.formato === 'pdf' ? 'application/pdf' : 'application/zip',
          filename:
            dto.titulo ||
            `reporte_${dto.tipoReporte}_${Date.now()}.${dto.formato}`,
        };
      }

      // Para resumen de incidencias o incidencias en planos
      const url = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/reports`;

      // Agregar filtros si existen
      if (dto.issueIds && dto.issueIds.length > 0) {
        payload.issueIds = dto.issueIds;
      }
      if (dto.filter_status) {
        payload.filters = payload.filters || {};
        payload.filters.status = dto.filter_status;
      }
      if (dto.filter_linkedDocumentUrn) {
        payload.filters = payload.filters || {};
        payload.filters.linkedDocumentUrn = dto.filter_linkedDocumentUrn;
      }

      const response = await this.httpClient.post<any>(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer', // Para descargar archivos
      });

      return {
        success: true,
        data: response.data,
        contentType:
          dto.formato === 'pdf' ? 'application/pdf' : 'application/zip',
        filename:
          dto.titulo ||
          `reporte_${dto.tipoReporte}_${Date.now()}.${dto.formato}`,
      };
    } catch (error: any) {
      throw new Error(
        `Error al exportar incidencias: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async subirMiniaturaIssue(
    accessToken: string,
    projectId: string,
    content: Buffer | string,
    filename: string,
    contentType: string,
  ): Promise<{ success: boolean; urn?: string; error?: string }> {
    try {
      const normalizedProjectId = this.normalizarProjectId(projectId);

      // 1. Resolver Hub y Project ID correctos
      const dmInfo = await this.resolverDataManagementProjectId(
        accessToken,
        normalizedProjectId,
      );

      if (!dmInfo) {
        // Fallback si no se encuentra (puede pasar en algunos entornos de prueba)
        return {
          success: false,
          error: 'No se pudo resolver el Project ID de Data Management',
        };
      }

      const { hubId, projectId: dmProjectId } = dmInfo;

      // 2. Obtener Root Folder (Project Files)
      let rootFolderId = null;
      const topFolders = await this.obtenerCarpetasPrincipales(
        accessToken,
        hubId,
        dmProjectId,
      );
      const folders = topFolders.data || [];

      const projectFiles = folders.find(
        (f: any) =>
          f.attributes?.name === 'Project Files' ||
          f.attributes?.displayName === 'Project Files',
      );
      if (projectFiles) {
        rootFolderId = projectFiles.id; // Usually we want the parent? PHP logic got parent. But storage goes TO a folder.
        // Wait, PHP logic: if name==Project Files, return folder['relationships']['parent']['data']['id'].
        // Why parent? Maybe strict schema requirements?
        // Actually if target is 'folders', we usually target the folder itself.
        // Let's stick to targeting the Project Files folder or the root of the project.
        // PHP code: return $folder['relationships']['parent']['data']['id'];
        // This implies it puts it in the PARENT of Project Files? That's usually the Project Root.
        // Let's assume targeting 'Project Files' is safe if we can't find parent.
        // But let's trust PHP logic: look for parent of Project Files.
        if (projectFiles.relationships?.parent?.data?.id) {
          rootFolderId = projectFiles.relationships.parent.data.id;
        } else {
          rootFolderId = projectFiles.id;
        }
      } else if (folders.length > 0) {
        // Fallback to first folder's parent
        if (folders[0].relationships?.parent?.data?.id) {
          rootFolderId = folders[0].relationships.parent.data.id;
        } else {
          rootFolderId = folders[0].id;
        }
      }

      if (!rootFolderId) {
        return { success: false, error: 'No se pudo obtener el Root Folder' };
      }

      // 3. Crear Storage Location
      const storageData = {
        type: 'objects',
        attributes: {
          name: filename,
        },
        relationships: {
          target: {
            data: {
              type: 'folders',
              id: rootFolderId,
            },
          },
        },
      };

      const storageResult = await this.crearStorage(
        accessToken,
        dmProjectId,
        storageData,
      );
      const storageId = storageResult.data?.id;

      if (!storageId) {
        return { success: false, error: 'Error creando storage location' };
      }

      // 4. Extraer Bucket y Object Key
      // urn:adsk.objects:os.object:bucketKey/objectKey
      const regex = /urn:adsk\.objects:os\.object:([^\/]+)\/(.+)/;
      const matches = storageId.match(regex);

      if (!matches || matches.length !== 3) {
        return { success: false, error: 'Formato de Storage ID inválido' };
      }

      const bucketKey = matches[1];
      const objectKey = matches[2];

      // 5. Obtener URL Firmada S3
      const signedData = await this.obtenerUrlFirmadaS3Upload(
        accessToken,
        bucketKey,
        objectKey,
      );
      if (!signedData.data?.urls?.[0] || !signedData.data?.uploadKey) {
        return { success: false, error: 'No se recibió URL firmada' };
      }

      const uploadUrl = signedData.data.urls[0];
      const uploadKey = signedData.data.uploadKey;

      // 6. Subir archivo
      await this.subirArchivoS3(uploadUrl, content, contentType);

      // 7. Finalizar Subida
      const finishResult = await this.finalizarUploadS3(
        accessToken,
        bucketKey,
        objectKey,
        uploadKey,
      );

      const urn = finishResult.data?.objectId; // or id? PHP looks for objectId in response

      if (urn) {
        return { success: true, urn };
      } else if (finishResult.data?.id) {
        return { success: true, urn: finishResult.data.id };
      }

      return { success: false, error: 'No se recibió URN final' };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
