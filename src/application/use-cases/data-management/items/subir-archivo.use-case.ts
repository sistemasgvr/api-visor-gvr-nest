import { Injectable, Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { ACC_REPOSITORY, type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { AUDITORIA_REPOSITORY, type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';
import { AUTH_REPOSITORY, type IAuthRepository } from '../../../../domain/repositories/auth.repository.interface';
import type { Express } from 'express';

@Injectable()
export class SubirArchivoUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        @Inject(ACC_REPOSITORY)
        private readonly accRepository: IAccRepository,
        @Inject(AUDITORIA_REPOSITORY)
        private readonly auditoriaRepository: IAuditoriaRepository,
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository,
    ) { }

    async execute(
        userId: number,
        projectId: string,
        folderId: string,
        file: Express.Multer.File,
        ipAddress?: string,
        userAgent?: string,
        userRole?: string,
    ): Promise<any> {
        // Validaciones
        if (!projectId) {
            throw new BadRequestException('El ID del proyecto es requerido');
        }

        if (!folderId) {
            throw new BadRequestException('El ID de la carpeta (folderId) es requerido');
        }

        if (!file) {
            throw new BadRequestException('El archivo es requerido');
        }

        // Obtener token del usuario
        const token = await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

        if (!token) {
            throw new ForbiddenException('No se encontró token de acceso. Por favor, autoriza la aplicación de Autodesk primero.');
        }

        if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
            throw new ForbiddenException('El token de Autodesk ha expirado. Por favor, refresca tu token.');
        }

        const fileName = file.originalname;
        const fileBuffer = file.buffer;
        const projectIdNorm = projectId.startsWith('b.') ? projectId : `b.${projectId}`;

        // Buscar si ya existe un item con el mismo nombre en la carpeta (para crear nueva versión como en ACC)
        let existingItem: { id: string; attributes?: any } | null = null;
        try {
            const contenido = await this.autodeskApiService.obtenerContenidoCarpeta(
                token.tokenAcceso,
                projectIdNorm,
                folderId,
                { 'filter[type]': 'items' },
            );
            const items = (contenido?.data || []) as any[];
            existingItem = items.find(
                (i: any) =>
                    (i.attributes?.displayName || i.attributes?.name || '').trim() === fileName.trim(),
            ) || null;
        } catch {
            // Si falla obtener contenido, continuar con flujo de nuevo item
        }

        // PASO 1: Crear storage
        const storageResult = await this.autodeskApiService.crearStorageParaItem(
            token.tokenAcceso,
            projectIdNorm,
            folderId,
            fileName,
        );

        if (!storageResult.data?.id) {
            throw new BadRequestException('No se pudo obtener el storage ID');
        }

        const storageId = storageResult.data.id;

        // Extraer bucketKey y objectKey del storage ID
        // Formato: urn:adsk.objects:os.object:wip.dm.prod/archivo.xlsx
        const storageIdMatch = storageId.match(/urn:adsk\.objects:os\.object:([^\/]+)\/(.+)/);

        if (!storageIdMatch || storageIdMatch.length !== 3) {
            throw new BadRequestException(`Formato de storage ID inválido: ${storageId}`);
        }

        const bucketKey = storageIdMatch[1];
        const objectKey = storageIdMatch[2];

        // PASO 2: Obtener URL firmada de S3
        const signedResult = await this.autodeskApiService.obtenerUrlFirmadaS3(
            token.tokenAcceso,
            bucketKey,
            objectKey,
            1,
        );

        if (!signedResult.urls || !signedResult.urls[0]) {
            throw new BadRequestException('No se pudo obtener la URL firmada de S3');
        }

        const signedUrl = signedResult.urls[0];
        const uploadKey = signedResult.uploadKey;

        // PASO 3: Subir archivo a la URL firmada de S3
        await this.autodeskApiService.subirArchivoAUrlFirmada(signedUrl, fileBuffer);

        // PASO 4: Completar la subida
        const uploadCompleteResult = await this.autodeskApiService.completarSubida(
            token.tokenAcceso,
            bucketKey,
            objectKey,
            uploadKey,
        );

        // PASO 5: Crear nueva versión (si existe item con mismo nombre) o crear item (primera versión)
        let itemId: string | undefined;
        let itemName: string;
        let itemResult: any;

        let newVersionId: string | null = null;

        if (existingItem) {
            // Crear nueva versión del item existente (mismo nombre y tipo → ACC crea nueva versión)
            const versionData = {
                type: 'versions',
                attributes: {
                    name: fileName,
                    displayName: fileName,
                    extension: {
                        type: 'versions:autodesk.bim360:File',
                        version: '1.0',
                    },
                },
                relationships: {
                    item: {
                        data: { type: 'items', id: existingItem.id },
                    },
                    storage: {
                        data: { type: 'objects', id: storageId },
                    },
                },
            };
            const versionResult = await this.autodeskApiService.crearVersion(
                token.tokenAcceso,
                projectIdNorm,
                versionData,
            );
            newVersionId = versionResult?.data?.id ?? null;
            itemId = existingItem.id;
            itemName = fileName;
            itemResult = {
                data: { ...existingItem, attributes: { ...existingItem.attributes, displayName: fileName } },
                included: [],
            };
        } else {
            // Crear nuevo item (primera versión)
            const itemData = {
                jsonapi: { version: '1.0' },
                data: {
                    type: 'items',
                    attributes: {
                        displayName: fileName,
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
                            name: fileName,
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
            itemResult = await this.autodeskApiService.crearItem(
                token.tokenAcceso,
                projectIdNorm,
                itemData,
            );
            itemId = itemResult.data?.id;
            itemName = itemResult.data?.attributes?.displayName || fileName;
        }

        // Registrar auditoría si el archivo se subió exitosamente
        if (itemId && ipAddress && userAgent) {
            try {
                await this.auditoriaRepository.registrarAccion(
                    userId,
                    'FILE_UPLOAD',
                    'file',
                    null, // No usar el ID de ACC como identidad porque es string
                    `Archivo subido: ${itemName.substring(0, 100)}`,
                    null,
                    {
                        itemId,
                        projectId,
                        folderId,
                        fileName: itemName.substring(0, 100),
                        fileSize: file.size,
                        mimeType: file.mimetype || 'unknown',
                    },
                    ipAddress,
                    userAgent,
                    {
                        projectId,
                        accItemId: itemId, // ID del archivo de ACC (string/UUID)
                        accFolderId: folderId,
                        rol: userRole || null,
                    },
                );
            } catch (error) {
                // No fallar la operación si la auditoría falla
                console.error('Error registrando auditoría de subida de archivo:', error);
            }

            // Si se creó una nueva versión (subida con mismo nombre → ACC crea versión), registrar FILE_VERSION_SAVE
            // para que el historial de versiones muestre "Actualizado por" / "Versión añadida por" = quien subió
            if (newVersionId) {
                try {
                    let idEmpresaUsuario: number | null = null;
                    let nombreEmpresaUsuario: string | null = null;
                    let rolNombre: string | null = userRole || null;
                    try {
                        const perfil = await this.authRepository.obtenerPerfilUsuario(userId);
                        if (perfil) {
                            idEmpresaUsuario = perfil.idempresa ?? perfil.idEmpresaUsuario ?? null;
                            nombreEmpresaUsuario = perfil.nombreempresa ?? perfil.nombreEmpresa ?? perfil.empresa ?? null;
                            if (!rolNombre) {
                                const roles = perfil.roles && Array.isArray(perfil.roles) ? perfil.roles : [];
                                rolNombre = roles[0]?.nombre ?? roles[0]?.name ?? perfil.rol ?? null;
                            }
                        }
                    } catch {
                        // ignorar
                    }
                    await this.auditoriaRepository.registrarAccion(
                        userId,
                        'FILE_VERSION_SAVE',
                        'file',
                        null,
                        `Nueva versión por subida (mismo nombre): ${itemName.substring(0, 100)}`,
                        null,
                        {
                            itemId,
                            projectId,
                            folderId,
                            fileName: itemName.substring(0, 100),
                            source: 'upload',
                        },
                        ipAddress,
                        userAgent,
                        {
                            projectId,
                            accItemId: itemId,
                            accVersionId: newVersionId,
                            ...(rolNombre && { rol: rolNombre }),
                        },
                        idEmpresaUsuario ?? undefined,
                        nombreEmpresaUsuario ?? undefined,
                    );
                } catch (error) {
                    console.error('Error registrando auditoría FILE_VERSION_SAVE (subida):', error);
                }
            }
        }

        return {
            success: true,
            storage: storageResult,
            upload: uploadCompleteResult,
            item: itemResult.data,
            included: itemResult.included || [],
        };
    }
}

