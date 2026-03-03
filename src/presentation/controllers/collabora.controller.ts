import {
  Controller,
  Get,
  Post,
  Logger,
  Param,
  Res,
  Req,
  UseGuards,
  Inject,
  Headers,
} from '@nestjs/common';
import * as express from 'express';
import axios from 'axios';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CollaboraService } from '../../infrastructure/services/collabora.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import type { IAccRepository } from '../../domain/repositories/acc.repository.interface';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';
import type { IAuditoriaRepository } from '../../domain/repositories/auditoria.repository.interface';

@Controller('collabora')
export class CollaboraController {
  private readonly logger = new Logger(CollaboraController.name);

  constructor(
    private readonly collaboraService: CollaboraService,
    private readonly autodeskApiService: AutodeskApiService,
    private readonly documentTokenService: DocumentTokenService,
    private readonly broadcastService: BroadcastService,
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: IAuditoriaRepository,
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

      const userId = Number(req.user?.sub) || 0;

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

      // ID estable por documento: mismo (projectId, itemId) = mismo docId = misma sesión en Collabora (coautoría)
      const stableDocId = this.documentTokenService.generateStableDocId(projectId, itemId);
      const userSessionToken = this.documentTokenService.createUserSessionToken(
        userId,
        projectId,
        itemId,
        fileInfo.fileName,
        8 * 60,
        accessToken,
      );

      const backendUrl = process.env.BACKEND_PUBLIC_URL || 'http://localhost:4001';
      const wopiSrcUrl = `${backendUrl}/api/collabora/wopi/files/${stableDocId}?access_token=${encodeURIComponent(userSessionToken)}`;

      const collaboraUrl = this.collaboraService.generateCollaboraUrl(wopiSrcUrl, 'edit');

      this.logger.log(`[WOPI] URL generada (coautoría) - docId: ${stableDocId}`);

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
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Obtiene el access_token de la petición (query, URL o header Authorization).
   * Collabora suele enviarlo en la URL; en POST el query puede no estar parseado, por eso se lee también de req.url.
   */
  private getWopiAccessToken(req: express.Request): string | null {
    const fromQuery = req.query?.access_token;
    if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
    if (req.url && req.url.includes('access_token=')) {
      try {
        const start = req.url.indexOf('access_token=') + 13;
        let end = req.url.indexOf('&', start);
        if (end === -1) end = req.url.length;
        const token = req.url.slice(start, end);
        if (token) return decodeURIComponent(token);
      } catch {
        // ignore
      }
    }
    const auth = req.headers?.authorization;
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7);
    return null;
  }

  /**
   * WOPI Protocol: CheckFileInfo endpoint
   * GET /api/collabora/wopi/files/:fileId
   * fileId = stableDocId (mismo documento para todos los usuarios = coautoría).
   * access_token = sesión del usuario (query o Authorization).
   */
  @Get('wopi/files/:fileId')
  async wopiCheckFileInfo(
    @Param('fileId') fileId: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const stableDocId = fileId;
      const accessToken = this.getWopiAccessToken(req);

      this.logger.log(`[WOPI CheckFileInfo] docId: ${stableDocId}, access_token: ${accessToken ? 'present' : 'missing'}`);

      if (!accessToken) {
        return res.status(401).json({ error: 'access_token requerido' });
      }

      const tokenData = this.documentTokenService.validateUserSessionToken(accessToken);
      if (!tokenData) {
        this.logger.error('[WOPI CheckFileInfo] Sesión inválida o expirada');
        return res.status(403).json({
          error: 'Token inválido o expirado',
        });
      }

      const expectedDocId = this.documentTokenService.generateStableDocId(tokenData.projectId, tokenData.itemId);
      if (expectedDocId !== stableDocId) {
        this.logger.error('[WOPI CheckFileInfo] docId no coincide con la sesión');
        return res.status(403).json({ error: 'Documento no autorizado' });
      }

      if (!tokenData.accessToken) {
        return res.status(401).json({ error: 'Token de Autodesk no disponible' });
      }

      this.logger.log(`[WOPI CheckFileInfo] Sesión válida - Archivo: ${tokenData.fileName}, UserId: ${tokenData.userId}`);

      const projectIdNorm = tokenData.projectId.startsWith('b.') ? tokenData.projectId : `b.${tokenData.projectId}`;

      let wopiVersion = stableDocId;
      try {
        const itemInfo = await this.autodeskApiService.obtenerItemPorId(
          tokenData.accessToken,
          projectIdNorm,
          tokenData.itemId,
        );
        const tipVersionId = itemInfo?.data?.relationships?.tip?.data?.id;
        if (tipVersionId) {
          wopiVersion = tipVersionId;
        }
      } catch (error) {
        this.logger.warn('[WOPI CheckFileInfo] No se pudo obtener tip version, usando docId como versión estable');
      }

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

      let fileSize = 0;
      try {
        const headResponse = await axios.head(fileInfo.storageUrl);
        fileSize = parseInt(headResponse.headers['content-length'] || '0', 10);
      } catch (error) {
        this.logger.warn('[WOPI CheckFileInfo] No se pudo obtener tamaño del archivo');
      }

      let userFriendlyName = `Usuario ${tokenData.userId}`;
      try {
        const usuario = await this.authRepository.obtenerPerfilUsuario(tokenData.userId);
        if (usuario) {
          const trabajador = usuario.trabajador && typeof usuario.trabajador === 'object' ? usuario.trabajador : null;
          const nombres = trabajador?.nombres ?? '';
          const apellidos = trabajador?.apellidos ?? '';
          const nombreCompleto = [nombres, apellidos].filter(Boolean).join(' ').trim();
          userFriendlyName = nombreCompleto || usuario.nombre || usuario.correo || userFriendlyName;
        }
      } catch (error) {
        this.logger.warn('[WOPI CheckFileInfo] No se pudo obtener información del usuario');
      }

      const wopiResponse = {
        BaseFileName: tokenData.fileName,
        OwnerId: tokenData.userId.toString(),
        Size: fileSize,
        UserId: tokenData.userId.toString(),
        Version: wopiVersion,

        UserCanWrite: true,
        UserCanNotWriteRelative: true,
        SupportsUpdate: true,
        SupportsCoauth: true,
        SupportsLocks: false,
        SupportsGetLock: false,
        
        // Información adicional del usuario
        UserFriendlyName: userFriendlyName,
        IsAnonymousUser: false,
        IsEduUser: false,
        LicenseCheckForEditIsEnabled: false,
        
        // Idioma de la interfaz de usuario (español)
        // Algunos sistemas usan es-ES, otros es_ES, agregamos ambos por compatibilidad
        UserInterfaceLanguage: 'es-ES',
        UILanguage: 'es',
        Lang: 'es-ES',
        
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
   * fileId = stableDocId; usuario desde access_token (query o header).
   */
  @Get('wopi/files/:fileId/contents')
  async wopiGetFile(
    @Param('fileId') fileId: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const stableDocId = fileId;
      const accessToken = this.getWopiAccessToken(req);
      if (!accessToken) {
        return res.status(401).json({ error: 'access_token requerido' });
      }

      const tokenData = this.documentTokenService.validateUserSessionToken(accessToken);
      if (!tokenData) {
        this.logger.error('[WOPI GetFile] Sesión inválida o expirada');
        return res.status(403).json({ error: 'Token inválido o expirado' });
      }

      const expectedDocId = this.documentTokenService.generateStableDocId(tokenData.projectId, tokenData.itemId);
      if (expectedDocId !== stableDocId) {
        return res.status(403).json({ error: 'Documento no autorizado' });
      }

      if (!tokenData.accessToken) {
        return res.status(401).json({ error: 'Token de Autodesk no disponible' });
      }

      this.logger.log(`[WOPI GetFile] Descargando archivo: ${tokenData.fileName}`);

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
   * WOPI Protocol: PutFile endpoint
   * POST /api/collabora/wopi/files/:fileId/contents
   * fileId = stableDocId; usuario desde access_token (query o header).
   */
  @Post('wopi/files/:fileId/contents')
  async wopiPutFile(
    @Param('fileId') fileId: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
    @Headers('x-wopi-override') wopiOverride: string,
    @Headers('x-wopi-lock') wopiLock: string,
    @Headers('x-wopi-editors') wopiEditors: string,
    @Headers('x-lool-wopi-ismodifiedbyuser') isModifiedByUser: string,
    @Headers('x-lool-wopi-isautosave') isAutosave: string,
  ) {
    try {
      const stableDocId = fileId;
      const accessToken = this.getWopiAccessToken(req);
      this.logger.log(`[WOPI PutFile] access_token: ${accessToken ? 'present' : 'MISSING'}, query: ${!!req.query?.access_token}, url: ${req.url?.substring(0, 80)}...`);

      const setWopiCors = () => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-WOPI-Override, X-WOPI-Lock');
      };

      if (!accessToken) {
        this.logger.warn('[WOPI PutFile] Rechazado: access_token requerido (Collabora debe enviarlo en la URL del POST)');
        setWopiCors();
        return res.status(401).json({ error: 'access_token requerido' });
      }

      const tokenData = this.documentTokenService.validateUserSessionToken(accessToken);
      if (!tokenData) {
        this.logger.error('[WOPI PutFile] Sesión inválida o expirada - el usuario debe volver a abrir el documento');
        setWopiCors();
        return res.status(403).json({ error: 'Token inválido o expirado' });
      }

      const expectedDocId = this.documentTokenService.generateStableDocId(tokenData.projectId, tokenData.itemId);
      if (expectedDocId !== stableDocId) {
        setWopiCors();
        return res.status(403).json({ error: 'Documento no autorizado' });
      }

      if (!tokenData.accessToken) {
        setWopiCors();
        return res.status(401).json({ error: 'Token de Autodesk no disponible' });
      }

      const isAutosaveRequest = (isAutosave && String(isAutosave).toLowerCase() === 'true');
      this.logger.log(`[WOPI PutFile] FileId: ${fileId}, Override: ${wopiOverride}, IsAutosave: ${isAutosave} (solo guardado manual crea versión en ACC)`);

      const fileBuffer = (req as any).rawBody || req.body;

      if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
        this.logger.error('[WOPI PutFile] No se recibió contenido del archivo o no es un Buffer');
        setWopiCors();
        return res.status(400).json({
          error: 'Contenido del archivo no válido',
        });
      }

      this.logger.log(`[WOPI PutFile] Archivo recibido: ${fileBuffer.length} bytes`);

      if (isAutosaveRequest) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-WOPI-Override, X-WOPI-Lock');
        return res.status(200).json({
          LastModifiedTime: new Date().toISOString(),
        });
      }

      this.logger.log(`[WOPI PutFile] Guardado manual: creando nueva versión en ACC...`);
      this.logger.log(`[WOPI PutFile] ItemId: ${tokenData.itemId}, ProjectId: ${tokenData.projectId}`);

      const projectIdNorm = tokenData.projectId.startsWith('b.') 
        ? tokenData.projectId 
        : `b.${tokenData.projectId}`;

      // PASO 1: Crear storage en ACC (igual que en subir-archivo.use-case.ts)
      this.logger.log('[WOPI PutFile] Creando storage para nueva versión...');
      
      // Necesitamos el folderId del item actual, pero como itemId es el URN del item,
      // vamos a obtener información del item primero
      const itemInfo = await this.autodeskApiService.obtenerItemPorId(
        tokenData.accessToken,
        projectIdNorm,
        tokenData.itemId,
      );

      if (!itemInfo?.data) {
        this.logger.error('[WOPI PutFile] No se pudo obtener información del item');
        return res.status(404).json({
          error: 'Item no encontrado en ACC',
        });
      }

      const folderId = itemInfo.data.relationships?.parent?.data?.id;
      
      if (!folderId) {
        this.logger.error('[WOPI PutFile] No se pudo obtener el folderId del item');
        return res.status(500).json({
          error: 'No se pudo obtener el folderId del item',
        });
      }

      const storageResult = await this.autodeskApiService.crearStorageParaItem(
        tokenData.accessToken,
        projectIdNorm,
        folderId,
        tokenData.fileName,
      );

      if (!storageResult.data?.id) {
        this.logger.error('[WOPI PutFile] No se pudo obtener el storage ID');
        return res.status(500).json({
          error: 'Error al crear storage en ACC',
        });
      }

      const storageId = storageResult.data.id;
      this.logger.log(`[WOPI PutFile] Storage creado: ${storageId}`);

      // Extraer bucketKey y objectKey del storage ID (igual que en subir-archivo.use-case.ts)
      const storageIdMatch = storageId.match(/urn:adsk\.objects:os\.object:([^\/]+)\/(.+)/);

      if (!storageIdMatch || storageIdMatch.length !== 3) {
        this.logger.error(`[WOPI PutFile] Formato de storage ID inválido: ${storageId}`);
        return res.status(500).json({
          error: 'Formato de storage ID inválido',
        });
      }

      const bucketKey = storageIdMatch[1];
      const objectKey = storageIdMatch[2];

      // PASO 2: Obtener URL firmada de S3
      this.logger.log('[WOPI PutFile] Obteniendo URL firmada de S3...');
      
      const signedResult = await this.autodeskApiService.obtenerUrlFirmadaS3(
        tokenData.accessToken,
        bucketKey,
        objectKey,
        1,
      );

      if (!signedResult.urls || !signedResult.urls[0]) {
        this.logger.error('[WOPI PutFile] No se pudo obtener la URL firmada de S3');
        return res.status(500).json({
          error: 'No se pudo obtener la URL firmada de S3',
        });
      }

      const signedUrl = signedResult.urls[0];
      const uploadKey = signedResult.uploadKey;

      // PASO 3: Subir archivo a S3
      this.logger.log('[WOPI PutFile] Subiendo archivo a S3...');
      
      await this.autodeskApiService.subirArchivoAUrlFirmada(signedUrl, fileBuffer);

      this.logger.log('[WOPI PutFile] Archivo subido exitosamente a S3');

      // PASO 4: Completar la subida
      this.logger.log('[WOPI PutFile] Completando subida...');
      
      await this.autodeskApiService.completarSubida(
        tokenData.accessToken,
        bucketKey,
        objectKey,
        uploadKey,
      );

      // PASO 5: Crear nueva versión del item existente (igual que en subir-archivo.use-case.ts líneas 128-159)
      this.logger.log('[WOPI PutFile] Creando nueva versión en ACC...');
      
      const versionData = {
        type: 'versions',
        attributes: {
          name: tokenData.fileName,
          displayName: tokenData.fileName,
          extension: {
            type: 'versions:autodesk.bim360:File',
            version: '1.0',
          },
        },
        relationships: {
          item: {
            data: { type: 'items', id: tokenData.itemId },
          },
          storage: {
            data: { type: 'objects', id: storageId },
          },
        },
      };

      await this.autodeskApiService.crearVersion(
        tokenData.accessToken,
        projectIdNorm,
        versionData,
      );

      this.logger.log(`[WOPI PutFile] Nueva versión creada exitosamente para item: ${tokenData.itemId}`);

      const auditUserId = Number(tokenData.userId);
      if (!Number.isInteger(auditUserId) || auditUserId < 1) {
        this.logger.warn(`[WOPI PutFile] userId inválido para auditoría: ${tokenData.userId}`);
      } else {
        try {
          const ip = typeof (req as any).ip === 'string' ? (req as any).ip : (req as any).socket?.remoteAddress ?? '';
          const userAgent = typeof (req as any).get === 'function' ? (req as any).get('user-agent') : (req as any).headers?.['user-agent'] ?? '';
          this.logger.log(`[WOPI PutFile] Registrando auditoría idUsuario=${auditUserId}, ip=${ip || '(vacío)'}, userAgent=${userAgent ? 'present' : '(vacío)'}`);
          const auditResult = await this.auditoriaRepository.registrarAccion(
            auditUserId,
            'FILE_VERSION_SAVE',
            'file',
            null,
            `Versión guardada desde Collabora: ${tokenData.fileName}`,
            null,
            {
              projectId: tokenData.projectId,
              itemId: tokenData.itemId,
              fileName: tokenData.fileName,
              source: 'collabora',
            },
            ip || ' ',
            userAgent || ' ',
            {
              projectId: tokenData.projectId,
              accItemId: tokenData.itemId,
            },
          );
          const success = auditResult && (auditResult as any).success !== false;
          if (!success) {
            this.logger.warn('[WOPI PutFile] Auditoría devolvió error:', (auditResult as any)?.message ?? auditResult);
          } else {
            this.logger.log(`[WOPI PutFile] Auditoría registrada (id_auditoria=${(auditResult as any)?.id_auditoria ?? 'ok'})`);
          }
        } catch (e) {
          this.logger.warn('[WOPI PutFile] Error registrando auditoría:', e);
        }
      }

      try {
        this.broadcastService.emitDocumentSaved(tokenData.userId, {
          projectId: tokenData.projectId,
          itemId: tokenData.itemId,
          fileName: tokenData.fileName,
        });
      } catch (e) {
        this.logger.warn('[WOPI PutFile] No se pudo emitir document.saved por WebSocket', e);
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-WOPI-Override, X-WOPI-Lock');
      
      return res.status(200).json({
        LastModifiedTime: new Date().toISOString(),
      });
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown }; message?: string };
      const status = err.response?.status;
      const details = err.response?.data;

      this.logger.error('[WOPI PutFile] Error:', err.message ?? error);
      if (status) this.logger.error(`[WOPI PutFile] ACC/HTTP status: ${status}`);
      if (details) this.logger.error(`[WOPI PutFile] Detalles: ${JSON.stringify(details)}`);

      if (res.headersSent) return;

      if (status === 403) {
        return res.status(403).json({
          error: 'Sin permiso en el proyecto de ACC para crear versión. Verifica que tu usuario tenga permiso de edición/subida en el proyecto.',
        });
      }
      if (status === 401) {
        return res.status(401).json({
          error: 'Token de Autodesk expirado o inválido. Reconecta tu cuenta de Autodesk.',
        });
      }

      return res.status(500).json({
        error: 'Error al guardar archivo',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Endpoint para descargar el archivo (usado por Collabora) - DEPRECADO
   * GET /api/collabora/download/:token
   * Este endpoint sirve el archivo directamente con headers CORS para Collabora
   */
  @Get('download/:token')
  async downloadFile(@Param('token') token: string, @Res() res: express.Response) {
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
          error: error instanceof Error ? error.message : String(error),
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
