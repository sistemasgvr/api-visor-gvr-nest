import {
  Controller,
  Get,
  Logger,
  Param,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';
import axios from 'axios';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CollaboraService } from '../../infrastructure/services/collabora.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';

@Controller('collabora')
export class CollaboraController {
  private readonly logger = new Logger(CollaboraController.name);

  constructor(
    private readonly collaboraService: CollaboraService,
    private readonly autodeskApiService: AutodeskApiService,
    private readonly documentTokenService: DocumentTokenService,
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

      const accessToken = req.user?.autodeskAccessToken || req.headers['autodesk-access-token'];
      const userId = req.user?.sub || 0;

      if (!accessToken) {
        return {
          status: 401,
          message: 'Token de Autodesk no encontrado',
        };
      }

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

      // Generar token temporal para la descarga
      const downloadToken = this.documentTokenService.generateToken(
        userId,
        projectId,
        itemId,
        fileInfo.fileName,
        60, // 60 minutos
        accessToken, // Guardamos el accessToken para usarlo en la descarga
      );

      // Construir URL de descarga desde nuestro backend
      const backendUrl = process.env.BACKEND_PUBLIC_URL || 'http://localhost:4001';
      const fileUrl = `${backendUrl}/api/collabora/download/${downloadToken}`;

      // Generar URL de Collabora
      const collaboraUrl = this.collaboraService.generateCollaboraUrl(fileUrl, 'edit');

      return {
        status: 200,
        data: {
          collaboraUrl,
          fileName: fileInfo.fileName,
          documentUrl: fileUrl,
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
   * Endpoint para descargar el archivo (usado por Collabora)
   * GET /api/collabora/download/:token
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

      // Enviar el archivo a Collabora
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', fileBuffer.length);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(tokenData.fileName)}"`,
      );
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

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
