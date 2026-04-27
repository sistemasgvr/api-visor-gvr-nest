import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { MinioStorageService } from '../../infrastructure/storage/minio-storage.service';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { UploadEvidenciaDto } from '../../application/dtos/storage/upload-evidencia.dto';
import { UploadPrefixedDto } from '../../application/dtos/storage/upload-prefixed.dto';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

@ApiTags('storage')
@ApiBearerAuth('access-token')
@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly minioStorage: MinioStorageService) {}

  @Get('presign')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'key', required: true, description: 'Clave del objeto en el bucket' })
  @ApiQuery({
    name: 'expires',
    required: false,
    description: 'Segundos de validez (60–604800). Por defecto 3600.',
  })
  @ApiOperation({
    summary: 'URL firmada de lectura (GET)',
    description:
      'Útil si el bucket es privado: devuelve una URL temporal para descargar el objeto por su clave.',
  })
  async presignGet(
    @Query('key') key: string,
    @Query('expires') expiresRaw?: string,
  ) {
    if (!key?.trim()) {
      throw new BadRequestException('Parámetro key es obligatorio');
    }
    const expires = Math.min(
      Math.max(parseInt(expiresRaw ?? '3600', 10) || 3600, 60),
      7 * 24 * 3600,
    );
    const url = await this.minioStorage.getPresignedGetUrl(key.trim(), expires);
    return ApiResponseDto.success(
      { url, expiresInSeconds: expires },
      'URL generada',
    );
  }

  @Post('evidencias')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir evidencia (MinIO)',
    description:
      'Guarda en `evidencias/usuarios/{id}-{nombre}/{actividadId}-{slug}/...` y devuelve la URL pública (si el bucket es legible) y la clave del objeto.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'actividadId', 'actividadSlug'],
      properties: {
        file: { type: 'string', format: 'binary' },
        actividadId: { type: 'integer', example: 250 },
        actividadSlug: { type: 'string', example: 'instalacion-cableado' },
      },
    },
  })
  async uploadEvidencia(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadEvidenciaDto,
    @Req() req: Request,
  ) {
    const user = req.user!;
    const displayName = user.nombre?.trim() || user.correo || `usuario-${user.id}`;
    const meta = await this.minioStorage.uploadEvidenciaUsuarioActividad({
      userId: user.id,
      userDisplayName: displayName,
      actividadId: dto.actividadId,
      actividadSlug: dto.actividadSlug,
      file,
    });
    return ApiResponseDto.success(meta, 'Archivo subido correctamente');
  }

  @Post('upload')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir archivo con prefijo libre',
    description:
      'Subida genérica bajo un prefijo (carpetas virtuales S3). Útil para otros módulos.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'prefix'],
      properties: {
        file: { type: 'string', format: 'binary' },
        prefix: { type: 'string', example: 'documentos/contratos' },
        filename: { type: 'string', example: 'contrato.pdf' },
      },
    },
  })
  async uploadPrefixed(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadPrefixedDto,
  ) {
    const meta = await this.minioStorage.uploadUnderPrefix({
      prefix: dto.prefix,
      file,
      filename: dto.filename,
    });
    return ApiResponseDto.success(meta, 'Archivo subido correctamente');
  }
}
