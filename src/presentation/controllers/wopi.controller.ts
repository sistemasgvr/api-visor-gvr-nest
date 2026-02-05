import {
    Controller,
    Get,
    Post,
    Param,
    Req,
    Res,
    Headers,
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
    Inject,
    Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { WopiLockService } from '../../infrastructure/services/wopi-lock.service';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import type { IAccRepository } from '../../domain/repositories/acc.repository.interface';

@Controller('wopi/files')
export class WopiController {
    private readonly logger = new Logger(WopiController.name);

    constructor(
        private readonly documentTokenService: DocumentTokenService,
        private readonly autodeskApiService: AutodeskApiService,
        private readonly wopiLockService: WopiLockService,
        private readonly configService: ConfigService,
        @Inject(ACC_REPOSITORY)
        private readonly accRepository: IAccRepository,
    ) { }

    private getWopiBaseUrl(req: Request): string {
        const publicUrl = this.configService.get<string>('BACKEND_PUBLIC_URL')?.replace(/\/+$/, '');
        if (publicUrl) return publicUrl;
        const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol;
        const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || '';
        return `${proto}://${host}`;
    }

    private validateAccessToken(req: Request, tokenParam: string): string {
        const accessToken =
            (req.query['access_token'] as string | undefined) ||
            (req.headers['x-wopi-access-token'] as string | undefined);

        if (accessToken && accessToken !== tokenParam) {
            throw new UnauthorizedException('Access token invÃ¡lido');
        }

        return tokenParam;
    }

    private async getAccToken(userId: number) {
        const accToken = await this.accRepository.obtenerToken3LeggedPorUsuario(userId);
        if (!accToken) {
            throw new UnauthorizedException('Token de Autodesk no disponible');
        }
        if (this.autodeskApiService.esTokenExpirado(accToken.expiraEn)) {
            throw new UnauthorizedException('Token de Autodesk expirado');
        }
        return accToken;
    }

    /**
     * CheckFileInfo
     * GET /api/wopi/files/:token
     */
    @Get(':token')
    async checkFileInfo(
        @Req() req: Request,
        @Param('token') token: string,
    ) {
        this.validateAccessToken(req, token);

        const tokenData = this.documentTokenService.validateToken(token);
        if (!tokenData) {
            throw new NotFoundException('Token invÃ¡lido o expirado');
        }

        const accToken = await this.getAccToken(tokenData.userId);
        const itemInfo = await this.autodeskApiService.obtenerItemPorId(
            accToken.tokenAcceso,
            tokenData.projectId,
            tokenData.itemId,
        );

        const tipVersionId = itemInfo?.data?.relationships?.tip?.data?.id;
        let size = 0;
        let versionId = tipVersionId || itemInfo?.data?.id || '1';

        if (tipVersionId) {
            try {
                const versionInfo = await this.autodeskApiService.obtenerVersionPorId(
                    accToken.tokenAcceso,
                    tokenData.projectId,
                    tipVersionId,
                );
                versionId = versionInfo?.data?.id || versionId;
                size =
                    Number(versionInfo?.data?.attributes?.storageSize) ||
                    Number(versionInfo?.data?.attributes?.fileSize) ||
                    0;
            } catch {
                // fallback
            }
        }

        return {
            BaseFileName: tokenData.fileName,
            Size: size,
            Version: versionId,
            OwnerId: String(tokenData.userId),
            UserId: String(tokenData.userId),
            UserFriendlyName: 'Usuario',
            UserCanWrite: true,
            SupportsUpdate: true,
            SupportsLocks: true,
            SupportsRename: false,
            SupportsExtendedLockLength: true,
            SupportsPutRelative: true,
        };
    }

    /**
     * GetFile
     * GET /api/wopi/files/:token/contents
     */
    @Get(':token/contents')
    async getFile(
        @Req() req: Request,
        @Param('token') token: string,
        @Res() res: Response,
    ) {
        this.validateAccessToken(req, token);

        const tokenData = this.documentTokenService.validateToken(token);
        if (!tokenData) {
            throw new NotFoundException('Token invÃ¡lido o expirado');
        }

        const accToken = await this.getAccToken(tokenData.userId);
        const resultado = await this.autodeskApiService.descargarItem(
            accToken.tokenAcceso,
            tokenData.projectId,
            tokenData.itemId,
        );

        const fileBuffer = resultado?.data ?? resultado?.fileBuffer;
        if (!fileBuffer) {
            throw new NotFoundException('No se pudo obtener el archivo');
        }

        const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer as ArrayBuffer);
        const contentType = this.getContentType(tokenData.fileName);

        res.set({
            'Content-Type': contentType,
            'Content-Length': buffer.length,
        });

        res.status(200).send(buffer);
    }

    /**
     * PutFile (save) / PutRelativeFile (save as new)
     * POST /api/wopi/files/:token/contents
     * X-WOPI-Override: PUT_RELATIVE → guardar como nuevo archivo en la misma carpeta
     */
    @Post(':token/contents')
    async putFile(
        @Req() req: Request,
        @Param('token') token: string,
        @Res() res: Response,
        @Headers('x-wopi-lock') lock?: string,
        @Headers('x-wopi-override') override?: string,
        @Headers('x-wopi-relativetarget') relativeTarget?: string,
    ) {
        this.validateAccessToken(req, token);

        const tokenData = this.documentTokenService.validateToken(token);
        if (!tokenData) {
            throw new NotFoundException('Token invÃ¡lido o expirado');
        }

        const currentLock = this.wopiLockService.getLock(token);
        if (currentLock && lock && currentLock !== lock) {
            res.set({
                'X-WOPI-Lock': currentLock,
                'X-WOPI-LockFailureReason': 'Lock mismatch',
            });
            return res.status(409).send();
        }

        const body = req.body as Buffer;
        if (!body || !Buffer.isBuffer(body) || body.length === 0) {
            throw new BadRequestException('Cuerpo del archivo vacÃ­o');
        }

        const accToken = await this.getAccToken(tokenData.userId);
        const projectIdNorm = tokenData.projectId.startsWith('b.')
            ? tokenData.projectId
            : `b.${tokenData.projectId}`;

        // PutRelativeFile: guardar como nuevo archivo en la misma carpeta
        if ((override || '').toUpperCase() === 'PUT_RELATIVE') {
            const newFileName = (relativeTarget || '').trim() || `Copia de ${tokenData.fileName}`;
            const itemInfo = await this.autodeskApiService.obtenerItemPorId(
                accToken.tokenAcceso,
                projectIdNorm,
                tokenData.itemId,
            );
            const folderId =
                itemInfo?.data?.relationships?.parent?.data?.id ||
                itemInfo?.data?.relationships?.folder?.data?.id;
            if (!folderId) {
                throw new BadRequestException('No se pudo determinar la carpeta del archivo');
            }
            const storageResult = await this.autodeskApiService.crearStorageParaItem(
                accToken.tokenAcceso,
                projectIdNorm,
                folderId,
                newFileName,
            );
            const storageId = storageResult?.data?.id;
            if (!storageId) {
                throw new BadRequestException('No se pudo obtener el storage ID');
            }
            const storageIdMatch = storageId.match(/urn:adsk\.objects:os\.object:([^\/]+)\/(.+)/);
            if (!storageIdMatch || storageIdMatch.length !== 3) {
                throw new BadRequestException(`Formato de storage ID invÃ¡lido: ${storageId}`);
            }
            const bucketKey = storageIdMatch[1];
            const objectKey = storageIdMatch[2];
            const signedResult = await this.autodeskApiService.obtenerUrlFirmadaS3(
                accToken.tokenAcceso,
                bucketKey,
                objectKey,
                1,
            );
            const signedUrl = signedResult?.urls?.[0];
            const uploadKey = signedResult?.uploadKey;
            if (!signedUrl || !uploadKey) {
                throw new BadRequestException('No se pudo obtener URL firmada para subir');
            }
            await this.autodeskApiService.subirArchivoAUrlFirmada(signedUrl, body);
            await this.autodeskApiService.completarSubida(
                accToken.tokenAcceso,
                bucketKey,
                objectKey,
                uploadKey,
            );
            const itemData = {
                jsonapi: { version: '1.0' },
                data: {
                    type: 'items',
                    attributes: {
                        displayName: newFileName,
                        extension: {
                            type: 'items:autodesk.bim360:File',
                            version: '1.0',
                        },
                    },
                    relationships: {
                        tip: { data: { type: 'versions', id: '1' } },
                        parent: { data: { type: 'folders', id: folderId } },
                    },
                },
                included: [
                    {
                        type: 'versions',
                        id: '1',
                        attributes: {
                            name: newFileName,
                            extension: {
                                type: 'versions:autodesk.bim360:File',
                                version: '1.0',
                            },
                        },
                        relationships: {
                            storage: { data: { type: 'objects', id: storageId } },
                        },
                    },
                ],
            };
            const itemResult = await this.autodeskApiService.crearItem(
                accToken.tokenAcceso,
                projectIdNorm,
                itemData,
            );
            const newItemId = itemResult?.data?.id;
            if (!newItemId) {
                throw new BadRequestException('No se pudo crear el nuevo archivo');
            }
            const newToken = this.documentTokenService.generateToken(
                tokenData.userId,
                projectIdNorm,
                newItemId,
                newFileName,
                120,
            );
            const baseUrl = this.getWopiBaseUrl(req);
            return res.status(200).json({
                Name: newFileName,
                Url: `${baseUrl}/api/wopi/files/${newToken}`,
            });
        }

        // Obtener item para encontrar carpeta padre
        const itemInfo = await this.autodeskApiService.obtenerItemPorId(
            accToken.tokenAcceso,
            projectIdNorm,
            tokenData.itemId,
        );
        const folderId =
            itemInfo?.data?.relationships?.parent?.data?.id ||
            itemInfo?.data?.relationships?.folder?.data?.id;

        if (!folderId) {
            throw new BadRequestException('No se pudo determinar la carpeta del archivo');
        }

        // 1) Crear storage
        const storageResult = await this.autodeskApiService.crearStorageParaItem(
            accToken.tokenAcceso,
            projectIdNorm,
            folderId,
            tokenData.fileName,
        );

        const storageId = storageResult?.data?.id;
        if (!storageId) {
            throw new BadRequestException('No se pudo obtener el storage ID');
        }

        // 2) Extraer bucket/object y obtener URL firmada
        const storageIdMatch = storageId.match(/urn:adsk\.objects:os\.object:([^\/]+)\/(.+)/);
        if (!storageIdMatch || storageIdMatch.length !== 3) {
            throw new BadRequestException(`Formato de storage ID invÃ¡lido: ${storageId}`);
        }

        const bucketKey = storageIdMatch[1];
        const objectKey = storageIdMatch[2];

        const signedResult = await this.autodeskApiService.obtenerUrlFirmadaS3(
            accToken.tokenAcceso,
            bucketKey,
            objectKey,
            1,
        );

        const signedUrl = signedResult?.urls?.[0];
        const uploadKey = signedResult?.uploadKey;
        if (!signedUrl || !uploadKey) {
            throw new BadRequestException('No se pudo obtener URL firmada para subir');
        }

        // 3) Subir archivo
        await this.autodeskApiService.subirArchivoAUrlFirmada(signedUrl, body);

        // 4) Completar subida
        await this.autodeskApiService.completarSubida(
            accToken.tokenAcceso,
            bucketKey,
            objectKey,
            uploadKey,
        );

        // 5) Crear nueva versiÃ³n
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
                item: { data: { type: 'items', id: tokenData.itemId } },
                storage: { data: { type: 'objects', id: storageId } },
            },
        };

        const versionResult = await this.autodeskApiService.crearVersion(
            accToken.tokenAcceso,
            projectIdNorm,
            versionData,
        );

        if (versionResult?.data?.id) {
            res.set('X-WOPI-ItemVersion', versionResult.data.id);
        }

        return res.status(200).send();
    }

    /**
     * Lock/Unlock/RefreshLock/GetLock
     * POST /api/wopi/files/:token
     */
    @Post(':token')
    async handleLock(
        @Req() req: Request,
        @Param('token') token: string,
        @Res() res: Response,
        @Headers('x-wopi-override') override?: string,
        @Headers('x-wopi-lock') lock?: string,
        @Headers('x-wopi-oldlock') oldLock?: string,
    ) {
        this.validateAccessToken(req, token);

        const tokenData = this.documentTokenService.validateToken(token);
        if (!tokenData) {
            throw new NotFoundException('Token invÃ¡lido o expirado');
        }

        const action = (override || '').toUpperCase();

        if (action === 'LOCK') {
            if (!lock) {
                throw new BadRequestException('Falta X-WOPI-Lock');
            }
            const result = this.wopiLockService.setLock(token, lock);
            if (!result.ok) {
                res.set({
                    'X-WOPI-Lock': result.currentLock,
                    'X-WOPI-LockFailureReason': 'Lock mismatch',
                });
                return res.status(409).send();
            }
            return res.status(200).send();
        }

        if (action === 'REFRESH_LOCK') {
            if (!lock) {
                throw new BadRequestException('Falta X-WOPI-Lock');
            }
            const result = this.wopiLockService.refreshLock(token, lock);
            if (!result.ok) {
                res.set({
                    'X-WOPI-Lock': result.currentLock,
                    'X-WOPI-LockFailureReason': 'Lock mismatch',
                });
                return res.status(409).send();
            }
            return res.status(200).send();
        }

        if (action === 'UNLOCK') {
            if (!lock) {
                throw new BadRequestException('Falta X-WOPI-Lock');
            }
            const result = this.wopiLockService.unlock(token, lock);
            if (!result.ok) {
                res.set({
                    'X-WOPI-Lock': result.currentLock,
                    'X-WOPI-LockFailureReason': 'Lock mismatch',
                });
                return res.status(409).send();
            }
            return res.status(200).send();
        }

        if (action === 'GET_LOCK') {
            const current = this.wopiLockService.getLock(token);
            if (current) {
                res.set({ 'X-WOPI-Lock': current });
            }
            return res.status(200).send();
        }

        if (action === 'UNLOCK_AND_RELOCK') {
            if (!lock || !oldLock) {
                throw new BadRequestException('Falta X-WOPI-Lock o X-WOPI-OldLock');
            }
            const unlockResult = this.wopiLockService.unlock(token, oldLock);
            if (!unlockResult.ok) {
                res.set({
                    'X-WOPI-Lock': unlockResult.currentLock,
                    'X-WOPI-LockFailureReason': 'Lock mismatch',
                });
                return res.status(409).send();
            }
            const lockResult = this.wopiLockService.setLock(token, lock);
            if (!lockResult.ok) {
                res.set({
                    'X-WOPI-Lock': lockResult.currentLock,
                    'X-WOPI-LockFailureReason': 'Lock mismatch',
                });
                return res.status(409).send();
            }
            return res.status(200).send();
        }

        this.logger.warn(`Override no soportado: ${action}`);
        return res.status(400).send();
    }

    private getContentType(fileName: string): string {
        const ext = fileName.toLowerCase().split('.').pop();
        const contentTypes: Record<string, string> = {
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            docm: 'application/vnd.ms-word.document.macroEnabled.12',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
            csv: 'text/csv',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            pptm: 'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
            pdf: 'application/pdf',
            txt: 'text/plain',
        };

        return contentTypes[ext || ''] || 'application/octet-stream';
    }
}
