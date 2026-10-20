import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { DocumentAccessService } from '../../application/services/document-access.service';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import {
  ObtenerVersionPorIdUseCase,
  ObtenerFormatosDescargaUseCase,
  ObtenerDescargasUseCase,
  ObtenerItemUseCase,
  ObtenerReferenciasUseCase,
  ObtenerRelacionesLinksUseCase,
  ObtenerRelacionesRefsUseCase,
  CrearVersionUseCase,
  CrearReferenciaUseCase,
  ActualizarVersionUseCase,
} from '../../application/use-cases/data-management/versions';
import {
  CrearVersionDto,
  CrearReferenciaDto,
  ActualizarVersionDto,
} from '../dtos/data-management/versions';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireGranularPermission } from '../../infrastructure/auth/granular-permission.guard';
import { DocumentLevelAccess } from '../../infrastructure/auth/document-access.guard';

@ApiTags('acc-data')
@ApiBearerAuth('access-token')
@Controller('data-management/versions')
@UseGuards(JwtAuthGuard)
export class DataManagementVersionsController {
  private documentActor(request: Request): number {
    const id = request.user?.sub;
    if (!Number.isSafeInteger(id) || (id as number) < 1)
      throw new UnauthorizedException('Sesión inválida');
    return id as number;
  }

  constructor(
    private readonly documentAccess: DocumentAccessService,
    private readonly obtenerVersionPorIdUseCase: ObtenerVersionPorIdUseCase,
    private readonly obtenerFormatosDescargaUseCase: ObtenerFormatosDescargaUseCase,
    private readonly obtenerDescargasUseCase: ObtenerDescargasUseCase,
    private readonly obtenerItemUseCase: ObtenerItemUseCase,
    private readonly obtenerReferenciasUseCase: ObtenerReferenciasUseCase,
    private readonly obtenerRelacionesLinksUseCase: ObtenerRelacionesLinksUseCase,
    private readonly obtenerRelacionesRefsUseCase: ObtenerRelacionesRefsUseCase,
    private readonly crearVersionUseCase: CrearVersionUseCase,
    private readonly crearReferenciaUseCase: CrearReferenciaUseCase,
    private readonly actualizarVersionUseCase: ActualizarVersionUseCase,
  ) {}

  /**
   * GET - Obtiene una versión específica por ID
   * GET /data-management/versions/:projectId/:versionId
   */
  @ApiOperation({ summary: 'Obtener una versión por ID' })
  @Get(':projectId/:versionId')
  @HttpCode(HttpStatus.OK)
  @DocumentLevelAccess()
  async obtenerVersionPorId(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ) {
    await this.documentAccess.assertDocument(
      this.documentActor(request),
      projectId,
      versionId,
      'view',
    );
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }
    if (!versionId) {
      throw new BadRequestException('El ID de la versión es requerido');
    }

    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }

    const resultado = await this.obtenerVersionPorIdUseCase.execute(
      userId,
      projectId,
      versionId,
    );
    return ApiResponseDto.success(
      resultado.data,
      'Versión obtenida exitosamente',
    );
  }

  /**
   * GET - Obtiene los formatos de descarga disponibles para una versión
   * GET /data-management/versions/:projectId/:versionId/downloadFormats
   */
  @ApiOperation({
    summary: 'Formatos de descarga alternativos (PDF, SVF2, etc.)',
  })
  @Get(':projectId/:versionId/downloadFormats')
  @HttpCode(HttpStatus.OK)
  @DocumentLevelAccess()
  async obtenerFormatosDescarga(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ) {
    await this.documentAccess.assertDocument(
      this.documentActor(request),
      projectId,
      versionId,
      'download',
    );
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }
    if (!versionId) {
      throw new BadRequestException('El ID de la versión es requerido');
    }

    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }

    const resultado = await this.obtenerFormatosDescargaUseCase.execute(
      userId,
      projectId,
      versionId,
    );
    return ApiResponseDto.success(
      resultado.data,
      'Formatos de descarga obtenidos exitosamente',
    );
  }

  /**
   * GET - Obtiene información de descarga para una versión
   * GET /data-management/versions/:projectId/:versionId/downloads
   */
  @ApiOperation({ summary: 'Información para descarga directa desde APS' })
  @Get(':projectId/:versionId/downloads')
  @HttpCode(HttpStatus.OK)
  @DocumentLevelAccess()
  async obtenerDescargas(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ) {
    await this.documentAccess.assertDocument(
      this.documentActor(request),
      projectId,
      versionId,
      'download',
    );
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }
    if (!versionId) {
      throw new BadRequestException('El ID de la versión es requerido');
    }

    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }

    const resultado = await this.obtenerDescargasUseCase.execute(
      userId,
      projectId,
      versionId,
    );
    return ApiResponseDto.success(
      resultado.data,
      'Información de descargas obtenida exitosamente',
    );
  }

  /**
   * GET - Obtiene el item asociado a una versión
   * GET /data-management/versions/:projectId/:versionId/item
   */
  @ApiOperation({ summary: 'Item poseedor de esta versión' })
  @Get(':projectId/:versionId/item')
  @HttpCode(HttpStatus.OK)
  @DocumentLevelAccess()
  async obtenerItem(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ) {
    await this.documentAccess.assertDocument(
      this.documentActor(request),
      projectId,
      versionId,
      'view',
    );
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }
    if (!versionId) {
      throw new BadRequestException('El ID de la versión es requerido');
    }

    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }

    const resultado = await this.obtenerItemUseCase.execute(
      userId,
      projectId,
      versionId,
    );
    return ApiResponseDto.success(
      resultado.data,
      'Item de versión obtenido exitosamente',
    );
  }

  /**
   * GET - Obtiene las referencias (refs) de una versión
   * GET /data-management/versions/:projectId/:versionId/refs
   */
  @ApiOperation({ summary: 'Referencias (refs) de la versión' })
  @Get(':projectId/:versionId/refs')
  @HttpCode(HttpStatus.OK)
  @DocumentLevelAccess()
  async obtenerReferencias(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ) {
    await this.documentAccess.assertDocument(
      this.documentActor(request),
      projectId,
      versionId,
      'view',
    );
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }
    if (!versionId) {
      throw new BadRequestException('El ID de la versión es requerido');
    }

    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }

    const resultado = await this.obtenerReferenciasUseCase.execute(
      userId,
      projectId,
      versionId,
    );
    return ApiResponseDto.success(
      resultado.data,
      'Referencias obtenidas exitosamente',
    );
  }

  /**
   * GET - Obtiene las relaciones de links de una versión
   * GET /data-management/versions/:projectId/:versionId/relationships/links
   */
  @ApiOperation({ summary: 'Relaciones tipo links de la versión' })
  @Get(':projectId/:versionId/relationships/links')
  @HttpCode(HttpStatus.OK)
  @DocumentLevelAccess()
  async obtenerRelacionesLinks(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ) {
    await this.documentAccess.assertDocument(
      this.documentActor(request),
      projectId,
      versionId,
      'view',
    );
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }
    if (!versionId) {
      throw new BadRequestException('El ID de la versión es requerido');
    }

    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }

    const resultado = await this.obtenerRelacionesLinksUseCase.execute(
      userId,
      projectId,
      versionId,
    );
    return ApiResponseDto.success(
      resultado.data,
      'Relaciones de links obtenidas exitosamente',
    );
  }

  /**
   * GET - Obtiene las relaciones de refs de una versión
   * GET /data-management/versions/:projectId/:versionId/relationships/refs
   */
  @ApiOperation({ summary: 'Relaciones tipo refs de la versión' })
  @Get(':projectId/:versionId/relationships/refs')
  @HttpCode(HttpStatus.OK)
  @DocumentLevelAccess()
  async obtenerRelacionesRefs(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ) {
    await this.documentAccess.assertDocument(
      this.documentActor(request),
      projectId,
      versionId,
      'view',
    );
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }
    if (!versionId) {
      throw new BadRequestException('El ID de la versión es requerido');
    }

    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }

    const resultado = await this.obtenerRelacionesRefsUseCase.execute(
      userId,
      projectId,
      versionId,
    );
    return ApiResponseDto.success(
      resultado.data,
      'Relaciones de refs obtenidas exitosamente',
    );
  }

  /**
   * POST - Crea una nueva versión
   * POST /data-management/versions/:projectId
   */
  @ApiOperation({
    summary: 'Crear nueva versión enlazando al item y nuevo storage',
  })
  @Post(':projectId')
  @HttpCode(HttpStatus.CREATED)
  @RequireGranularPermission('gestion_bim.documentos.acceso_total')
  async crearVersion(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() dto: CrearVersionDto,
  ) {
    await this.documentAccess.assertFullAccess(this.documentActor(request));
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }

    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }

    const resultado = await this.crearVersionUseCase.execute(
      userId,
      projectId,
      dto,
    );
    return ApiResponseDto.created(
      resultado.data,
      'Versión creada exitosamente',
    );
  }

  /**
   * POST - Crea una referencia en una versión
   * POST /data-management/versions/:projectId/:versionId/relationships/refs
   */
  @ApiOperation({ summary: 'Crear ref en esta versión' })
  @Post(':projectId/:versionId/relationships/refs')
  @HttpCode(HttpStatus.CREATED)
  @RequireGranularPermission('gestion_bim.documentos.acceso_total')
  async crearReferencia(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Body() dto: CrearReferenciaDto,
  ) {
    await this.documentAccess.assertFullAccess(this.documentActor(request));
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }
    if (!versionId) {
      throw new BadRequestException('El ID de la versión es requerido');
    }

    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }

    const resultado = await this.crearReferenciaUseCase.execute(
      userId,
      projectId,
      versionId,
      dto,
    );
    return ApiResponseDto.created(
      resultado.data,
      'Referencia creada exitosamente',
    );
  }

  /**
   * PATCH - Actualiza una versión
   * PATCH /data-management/versions/:projectId/:versionId
   */
  @ApiOperation({
    summary: 'Actualizar metadatos de la versión (nombre, estado, etc.)',
  })
  @Patch(':projectId/:versionId')
  @HttpCode(HttpStatus.OK)
  @RequireGranularPermission('gestion_bim.documentos.acceso_total')
  async actualizarVersion(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Body() dto: ActualizarVersionDto,
  ) {
    await this.documentAccess.assertFullAccess(this.documentActor(request));
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }
    if (!versionId) {
      throw new BadRequestException('El ID de la versión es requerido');
    }

    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }

    const resultado = await this.actualizarVersionUseCase.execute(
      userId,
      projectId,
      versionId,
      dto,
    );
    return ApiResponseDto.success(
      resultado.data,
      'Versión actualizada exitosamente',
    );
  }
}
