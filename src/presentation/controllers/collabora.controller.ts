import {
  Controller,
  Get,
  Logger,
  Param,
  Res,
  UseGuards,
  Req,
  Inject,
} from '@nestjs/common';
import type { Response } from 'express';
import axios from 'axios';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CollaboraService } from '../../infrastructure/services/collabora.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';
import { ACC_REPOSITORY, type IAccRepository } from '../../domain/repositories/acc.repository.interface';

@Controller('collabora')
export class CollaboraController {
  private readonly logger = new Logger(CollaboraController.name);

  constructor(
    private readonly collaboraService: CollaboraService,
    private readonly autodeskApiService: AutodeskApiService,
    private readonly documentTokenService: DocumentTokenService,
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
  ) {}

  /**
   * Endpoint para obtener la URL de Collabora para abrir un documento
   * GET /api/collabora/config/:projectId/:itemId
   */
  @Get('config/:projectId/:itemId')
  @UseGuards(JwtAuthGuard)
  async getCollaboraConfig(
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Req() req: any,
  ) {
    try {
      this.logger.log(`Generando configuración Collabora para item: ${itemId}`);

      const userId = req.user?.sub || 0;

      // Obtener el token de Autodesk desde la base de datos
      const accToken = await this.accRepository.obtenerToken3LeggedPorUsuario(userId);
      
      if (!accToken) {
        this.logger.error(`Token de Autodesk no encontrado para usuario: ${userId}`);
        return {
          status: 401,
          message: 'Token de Autodesk no encontrado. Por favor, reconecta tu cuenta de Autodesk.',
        };
      }

      // Verificar si el token está expirado
      if (this.autodeskApiService.esTokenExpirado(accToken.expiraEn)) {
        this.logger.warn(`Token de Autodesk expirado para usuario: ${userId}`);
        return {
          status: 401,
          message: 'Token de Autodesk expirado. Por favor, reconecta tu cuenta de Autodesk.',
        };
      }

      const accessToken = accToken.tokenAcceso;

      // Obtener información del archivo desde Autodesk
      const fileInfo = await this.autodeskApiService.obtenerStorageUrl(
        accessToken,
        projectId,
        itemId,
      );

      if (!fileInfo || !fileInfo.storageUrl) {
        return {
          status: 404,
          message: 'Archivo no encontrado en Autodesk',
        };
      }

      // Generar token temporal para el acceso WOPI
      const wopiToken = this.documentTokenService.generateToken(
        userId,
        projectId,
        itemId,
        fileInfo.fileName,
        60, // 60 minutos
        accessToken, // Guardamos el accessToken para usarlo en las peticiones WOPI
      );

      // Construir URL del endpoint WOPI CheckFileInfo
      const backendUrl = process.env.BACKEND_PUBLIC_URL || 'http://localhost:4001';
      const wopiSrcUrl = `${backendUrl}/api/collabora/wopi/files/${wopiToken}`;

      // Generar URL de Collabora con protocolo WOPI
      const collaboraUrl = this.collaboraService.generateCollaboraUrl(wopiSrcUrl, 'edit');

      this.logger.log(`[WOPI] URL generada - WOPISrc: ${wopiSrcUrl}`);

      return {
        status: 200,
        data: {
          collaboraUrl,
          fileName: fileInfo.fileName,
          wopiSrc: wopiSrcUrl,
        },
        message: 'Configuración de Collabora generada exitosamente',
      };
    } catch (error) {
      this.logger.error('Error al generar configuración de Collabora', error);
      return {
        status: 500,
        message: 'Error al generar configuración de Collabora',
        error: error.message,
      };
    }
  }

  /**
   * WOPI Protocol: CheckFileInfo endpoint
   * GET /api/collabora/wopi/files/:fileId
   * Devuelve metadatos del archivo en formato JSON (requerido por WOPI)
   */
  @Get('wopi/files/:fileId')
  async wopiCheckFileInfo(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      this.logger.log(`[WOPI CheckFileInfo] FileId recibido: ${fileId}`);

      // Validar el token
      const tokenData = this.documentTokenService.validateToken(fileId);

      if (!tokenData) {
        this.logger.error('[WOPI CheckFileInfo] Token inválido o expirado');
        return res.status(403).json({
          error: 'Token inválido o expirado',
        });
      }

      this.logger.log(
        `[WOPI CheckFileInfo] Token válido - Archivo: ${tokenData.fileName}`,
      );

      // Validar que tenemos accessToken
      if (!tokenData.accessToken) {
        this.logger.error('[WOPI CheckFileInfo] Token no contiene accessToken de Autodesk');
        return res.status(401).json({
          error: 'Token de Autodesk no disponible',
        });
      }

      // Obtener información del archivo desde Autodesk
      const fileInfo = await this.autodeskApiService.obtenerStorageUrl(
        tokenData.accessToken,
        tokenData.projectId,
        tokenData.itemId,
      );

      if (!fileInfo || !fileInfo.storageUrl) {
        this.logger.error('[WOPI CheckFileInfo] No se pudo obtener info del archivo');
        return res.status(404).json({
          error: 'Archivo no encontrado',
        });
      }

      // Obtener tamaño del archivo
      let fileSize = 0;
      try {
        const headResponse = await axios.head(fileInfo.storageUrl);
        fileSize = parseInt(headResponse.headers['content-length'] || '0', 10);
      } catch (error) {
        this.logger.warn('[WOPI CheckFileInfo] No se pudo obtener tamaño del archivo');
      }

      // Respuesta WOPI CheckFileInfo
      // Documentación: https://learn.microsoft.com/en-us/microsoft-365/cloud-storage-partner-program/rest/files/checkfileinfo
      const wopiResponse = {
        // Información básica del archivo
        BaseFileName: tokenData.fileName,
        OwnerId: tokenData.userId.toString(),
        Size: fileSize,
        UserId: tokenData.userId.toString(),
        Version: Date.now().toString(), // Versión basada en timestamp
        
        // Permisos
        UserCanWrite: true,
        UserCanNotWriteRelative: true,
        SupportsUpdate: true,
        SupportsLocks: false,
        SupportsGetLock: false,
        
        // Información adicional
        UserFriendlyName: `Usuario ${tokenData.userId}`,
        IsAnonymousUser: false,
        IsEduUser: false,
        LicenseCheckForEditIsEnabled: false,
        
        // URLs para acciones
        CloseUrl: '',
        DownloadUrl: '',
        FileSharingUrl: '',
        HostEditUrl: '',
        HostViewUrl: '',
        SignoutUrl: '',
      };

      this.logger.log('[WOPI CheckFileInfo] Respuesta enviada exitosamente');
      
      // Headers CORS para WOPI
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      return res.json(wopiResponse);
    } catch (error) {
      this.logger.error('[WOPI CheckFileInfo] Error:', error);
      return res.status(500).json({
        error: 'Error al obtener información del archivo',
      });
    }
  }

  /**
   * WOPI Protocol: GetFile endpoint
   * GET /api/collabora/wopi/files/:fileId/contents
   * Devuelve el contenido binario del archivo (requerido por WOPI)
   */
  @Get('wopi/files/:fileId/contents')
  async wopiGetFile(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      this.logger.log(`[WOPI GetFile] FileId recibido: ${fileId}`);

      // Validar el token
      const tokenData = this.documentTokenService.validateToken(fileId);

      if (!tokenData) {
        this.logger.error('[WOPI GetFile] Token inválido o expirado');
        return res.status(403).json({
          error: 'Token inválido o expirado',
        });
      }

      this.logger.log(
        `[WOPI GetFile] Token válido - Descargando archivo: ${tokenData.fileName}`,
      );

      // Validar que tenemos accessToken
      if (!tokenData.accessToken) {
        this.logger.error('[WOPI GetFile] Token no contiene accessToken de Autodesk');
        return res.status(401).json({
          error: 'Token de Autodesk no disponible',
        });
      }

      // Obtener la URL firmada de AWS S3 desde Autodesk
      const fileInfo = await this.autodeskApiService.obtenerStorageUrl(
        tokenData.accessToken,
        tokenData.projectId,
        tokenData.itemId,
      );

      if (!fileInfo || !fileInfo.storageUrl) {
        this.logger.error('[WOPI GetFile] No se pudo obtener URL de descarga de Autodesk');
        return res.status(404).json({
          error: 'Archivo no encontrado en Autodesk',
        });
      }

      this.logger.log(
        `[WOPI GetFile] Descargando desde S3: ${fileInfo.storageUrl.substring(0, 100)}...`,
      );

      // Descargar el archivo desde AWS S3
      const fileBuffer = await this.downloadFileFromUrl(fileInfo.storageUrl);

      if (!fileBuffer) {
        this.logger.error('[WOPI GetFile] Error al descargar archivo desde S3');
        return res.status(500).json({
          error: 'Error al descargar archivo desde storage',
        });
      }

      this.logger.log(
        `[WOPI GetFile] Archivo descargado exitosamente (${fileBuffer.length} bytes)`,
      );

      // Determinar el Content-Type según la extensión
      const contentType = this.getContentType(tokenData.fileName);

      // Headers WOPI
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', fileBuffer.length);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(tokenData.fileName)}"`,
      );
      // Headers CORS permisivos para Collabora
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');

      res.send(fileBuffer);
      this.logger.log('[WOPI GetFile] Archivo enviado a Collabora exitosamente');
    } catch (error) {
      this.logger.error('[WOPI GetFile] Error:', error);
      if (!res.headersSent) {
        return res.status(500).json({
          error: 'Error al descargar archivo',
        });
      }
    }
  }

  /**
   * Endpoint para descargar el archivo (usado por Collabora) - DEPRECADO
   * GET /api/collabora/download/:token
   * Este endpoint sirve el archivo directamente con headers CORS para Collabora
   */
  @Get('download/:token')
  async downloadFile(@Param('token') token: string, @Res() res: Response) {
    try {
      this.logger.log(`[Collabora Download] Token recibido: ${token}`);

      // Validar el token
      const tokenData = this.documentTokenService.validateToken(token);

      if (!tokenData) {
        this.logger.error('[Collabora Download] Token inválido o expirado');
        return res.status(403).json({
          status: 403,
          message: 'Token inválido o expirado',
        });
      }

      this.logger.log(
        `[Collabora Download] Token válido - Descargando archivo: ${tokenData.fileName}`,
      );

      // Validar que tenemos accessToken
      if (!tokenData.accessToken) {
        this.logger.error('[Collabora Download] Token no contiene accessToken de Autodesk');
        return res.status(401).json({
          status: 401,
          message: 'Token de Autodesk no disponible',
        });
      }

      // Obtener la URL firmada de AWS S3 desde Autodesk
      const fileInfo = await this.autodeskApiService.obtenerStorageUrl(
        tokenData.accessToken,
        tokenData.projectId,
        tokenData.itemId,
      );

      if (!fileInfo || !fileInfo.storageUrl) {
        this.logger.error('[Collabora Download] No se pudo obtener URL de descarga de Autodesk');
        return res.status(404).json({
          status: 404,
          message: 'Archivo no encontrado en Autodesk',
        });
      }

      this.logger.log(
        `[Collabora Download] Descargando desde S3: ${fileInfo.storageUrl.substring(0, 100)}...`,
      );

      // Descargar el archivo desde AWS S3
      const fileBuffer = await this.downloadFileFromUrl(fileInfo.storageUrl);

      if (!fileBuffer) {
        this.logger.error('[Collabora Download] Error al descargar archivo desde S3');
        return res.status(500).json({
          status: 500,
          message: 'Error al descargar archivo desde storage',
        });
      }

      this.logger.log(
        `[Collabora Download] Archivo descargado exitosamente (${fileBuffer.length} bytes)`,
      );

      // Determinar el Content-Type según la extensión
      const contentType = this.getContentType(tokenData.fileName);

      // Headers CORS necesarios para Collabora
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', fileBuffer.length);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(tokenData.fileName)}"`,
      );
      // Headers CORS permisivos para Collabora
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
      // Cache control
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      res.send(fileBuffer);
      this.logger.log('[Collabora Download] Archivo enviado a Collabora exitosamente');
    } catch (error) {
      this.logger.error('[Collabora Download] Error:', error);
      if (!res.headersSent) {
        return res.status(500).json({
          status: 500,
          message: 'Error al descargar archivo',
          error: error.message,
        });
      }
    }
  }

  /**
   * Endpoint de health check para Collabora
   * GET /api/collabora/health
   */
  @Get('health')
  async checkHealth() {
    const isHealthy = await this.collaboraService.checkCollaboraHealth();
    return {
      status: isHealthy ? 200 : 503,
      message: isHealthy ? 'Collabora está disponible' : 'Collabora no está disponible',
      collaboraAvailable: isHealthy,
    };
  }

  /**
   * Obtiene el Content-Type según la extensión del archivo
   */
  private getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    const contentTypes: Record<string, string> = {
      // Microsoft Office
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // OpenDocument
      odt: 'application/vnd.oasis.opendocument.text',
      ods: 'application/vnd.oasis.opendocument.spreadsheet',
      odp: 'application/vnd.oasis.opendocument.presentation',
      // Otros
      pdf: 'application/pdf',
      txt: 'text/plain',
      rtf: 'application/rtf',
      csv: 'text/csv',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Descarga un archivo desde una URL
   */
  private async downloadFileFromUrl(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 segundos
      });

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error('Error al descargar archivo desde URL', error);
      throw new Error('No se pudo descargar el archivo');
    }
  }
}
