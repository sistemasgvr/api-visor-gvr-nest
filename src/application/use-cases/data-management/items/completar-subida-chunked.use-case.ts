import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import {
  ACC_REPOSITORY,
  type IAccRepository,
} from '../../../../domain/repositories/acc.repository.interface';
import {
  AUDITORIA_REPOSITORY,
  type IAuditoriaRepository,
} from '../../../../domain/repositories/auditoria.repository.interface';
import {
  AUTH_REPOSITORY,
  type IAuthRepository,
} from '../../../../domain/repositories/auth.repository.interface';
import { CompletarSubidaChunkedDto } from '../../../dtos/data-management/items/completar-subida-chunked.dto';

@Injectable()
export class CompletarSubidaChunkedUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskApiService,
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: IAuditoriaRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    dto: CompletarSubidaChunkedDto,
    ipAddress?: string,
    userAgent?: string,
    userRole?: string,
  ) {
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }
    if (!dto.folderId || !dto.fileName || !dto.storageId) {
      throw new BadRequestException(
        'folderId, fileName y storageId son requeridos',
      );
    }

    const token = await this.accRepository.obtenerToken3LeggedPorUsuario(userId);
    if (!token) {
      throw new ForbiddenException('No se encontró token de Autodesk');
    }
    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new ForbiddenException('El token de Autodesk ha expirado.');
    }

    const projectIdNorm = projectId.startsWith('b.') ? projectId : `b.${projectId}`;

    let existingItem: { id: string; attributes?: any } | null = null;
    try {
      const contenido = await this.autodeskApiService.obtenerContenidoCarpeta(
        token.tokenAcceso,
        projectIdNorm,
        dto.folderId,
        { 'filter[type]': 'items' },
      );
      const items = (contenido?.data || []) as any[];
      existingItem =
        items.find(
          (i: any) =>
            (i.attributes?.displayName || i.attributes?.name || '').trim() ===
            dto.fileName.trim(),
        ) || null;
    } catch {
      // Ignorar para no bloquear la finalización.
    }

    const uploadCompleteResult = await this.autodeskApiService.completarSubida(
      token.tokenAcceso,
      dto.bucketKey,
      dto.objectKey,
      dto.uploadKey,
      { eTags: dto.eTags, size: dto.fileSize },
    );

    let itemId: string | undefined;
    let itemName: string;
    let itemResult: any;
    let newVersionId: string | null = null;

    if (existingItem) {
      const versionData = {
        type: 'versions',
        attributes: {
          name: dto.fileName,
          displayName: dto.fileName,
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
            data: { type: 'objects', id: dto.storageId },
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
      itemName = dto.fileName;
      itemResult = {
        data: {
          ...existingItem,
          attributes: { ...existingItem.attributes, displayName: dto.fileName },
        },
        included: [],
      };
    } else {
      const itemData = {
        jsonapi: { version: '1.0' },
        data: {
          type: 'items',
          attributes: {
            displayName: dto.fileName,
            extension: {
              type: 'items:autodesk.bim360:File',
              version: '1.0',
            },
          },
          relationships: {
            tip: { data: { type: 'versions', id: '1' } },
            parent: { data: { type: 'folders', id: dto.folderId } },
          },
        },
        included: [
          {
            type: 'versions',
            id: '1',
            attributes: {
              name: dto.fileName,
              extension: {
                type: 'versions:autodesk.bim360:File',
                version: '1.0',
              },
            },
            relationships: {
              storage: { data: { type: 'objects', id: dto.storageId } },
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
      itemName = itemResult.data?.attributes?.displayName || dto.fileName;
    }

    const ip = ipAddress || 'unknown';
    const ua = userAgent || 'unknown';
    if (itemId) {
      if (!newVersionId) {
        await this.auditoriaRepository
          .registrarAccion(
            userId,
            'FILE_UPLOAD',
            'file',
            null,
            `Archivo subido: ${itemName.substring(0, 100)}`,
            null,
            {
              itemId,
              projectId,
              folderId: dto.folderId,
              fileName: itemName.substring(0, 100),
              fileSize: dto.fileSize,
              source: 'chunked-direct-s3',
            },
            ip,
            ua,
            {
              projectId,
              accItemId: itemId,
              rol: userRole || null,
            },
          )
          .catch(() => undefined);
      } else {
        let idEmpresaUsuario: number | null = null;
        let nombreEmpresaUsuario: string | null = null;
        let rolNombre: string | null = userRole || null;
        try {
          const perfil = await this.authRepository.obtenerPerfilUsuario(userId);
          if (perfil) {
            idEmpresaUsuario = perfil.idempresa ?? perfil.idEmpresaUsuario ?? null;
            nombreEmpresaUsuario =
              perfil.nombreempresa ?? perfil.nombreEmpresa ?? perfil.empresa ?? null;
            if (!rolNombre) {
              const roles =
                perfil.roles && Array.isArray(perfil.roles) ? perfil.roles : [];
              rolNombre = roles[0]?.nombre ?? roles[0]?.name ?? perfil.rol ?? null;
            }
          }
        } catch {
          // ignore
        }
        await this.auditoriaRepository
          .registrarAccion(
            userId,
            'FILE_VERSION_SAVE',
            'file',
            null,
            `Nueva versión por subida (mismo nombre): ${itemName.substring(0, 100)}`,
            null,
            {
              itemId,
              projectId,
              folderId: dto.folderId,
              fileName: itemName.substring(0, 100),
              source: 'chunked-direct-s3',
            },
            ip,
            ua,
            {
              projectId,
              accItemId: itemId,
              accVersionId: newVersionId,
              ...(rolNombre && { rol: rolNombre }),
            },
            idEmpresaUsuario ?? undefined,
            nombreEmpresaUsuario ?? undefined,
          )
          .catch(() => undefined);
      }
    }

    return {
      success: true,
      upload: uploadCompleteResult,
      item: itemResult.data,
      included: itemResult.included || [],
    };
  }
}
