import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { RequestInfoHelper } from '../../shared/helpers/request-info.helper';

// Use cases - Grupo 1
import { ObtenerItemPorIdUseCase } from '../../application/use-cases/data-management/items/obtener-item-por-id.use-case';
import { DescargarItemUseCase } from '../../application/use-cases/data-management/items/descargar-item.use-case';
import { ObtenerStorageUrlItemUseCase } from '../../application/use-cases/data-management/items/obtener-storage-url-item.use-case';
import { ObtenerItemPadreUseCase } from '../../application/use-cases/data-management/items/obtener-item-padre.use-case';
import { ObtenerReferenciasItemUseCase } from '../../application/use-cases/data-management/items/obtener-referencias-item.use-case';
import { ObtenerRelacionesLinksItemUseCase } from '../../application/use-cases/data-management/items/obtener-relaciones-links-item.use-case';

// Use cases - Grupo 2
import { ObtenerRelacionesRefsItemUseCase } from '../../application/use-cases/data-management/items/obtener-relaciones-refs-item.use-case';
import { ObtenerTipVersionUseCase } from '../../application/use-cases/data-management/items/obtener-tip-version.use-case';
import { ObtenerVersionesUseCase } from '../../application/use-cases/data-management/items/obtener-versiones.use-case';
import { ObtenerActividadesArchivoUseCase } from '../../application/use-cases/data-management/items/obtener-actividades-archivo.use-case';
import { SubirArchivoUseCase } from '../../application/use-cases/data-management/items/subir-archivo.use-case';
import { CrearItemUseCase } from '../../application/use-cases/data-management/items/crear-item.use-case';
import { CrearReferenciaItemUseCase } from '../../application/use-cases/data-management/items/crear-referencia-item.use-case';
import { ActualizarItemUseCase } from '../../application/use-cases/data-management/items/actualizar-item.use-case';
import { EliminarItemUseCase } from '../../application/use-cases/data-management/items/eliminar-item.use-case';
import { DesplazarItemUseCase } from '../../application/use-cases/data-management/items/desplazar-item.use-case';
import { CopiarItemUseCase } from '../../application/use-cases/data-management/items/copiar-item.use-case';

// DTOs
import { SubirArchivoDto } from '../../application/dtos/data-management/items/subir-archivo.dto';
import { CrearItemDto } from '../../application/dtos/data-management/items/crear-item.dto';
import { CrearReferenciaItemDto } from '../../application/dtos/data-management/items/crear-referencia-item.dto';
import { ActualizarItemDto } from '../../application/dtos/data-management/items/actualizar-item.dto';
import { DesplazarItemDto } from '../../application/dtos/data-management/items/desplazar-item.dto';
import { CopiarItemDto } from '../../application/dtos/data-management/items/copiar-item.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('acc-data')
@ApiBearerAuth('access-token')
@Controller('data-management/items')
@UseGuards(JwtAuthGuard)
export class DataManagementItemsController {
  constructor(
    // Grupo 1
    private readonly obtenerItemPorIdUseCase: ObtenerItemPorIdUseCase,
    private readonly descargarItemUseCase: DescargarItemUseCase,
    private readonly obtenerStorageUrlItemUseCase: ObtenerStorageUrlItemUseCase,
    private readonly obtenerItemPadreUseCase: ObtenerItemPadreUseCase,
    private readonly obtenerReferenciasItemUseCase: ObtenerReferenciasItemUseCase,
    private readonly obtenerRelacionesLinksItemUseCase: ObtenerRelacionesLinksItemUseCase,
    // Grupo 2
    private readonly obtenerRelacionesRefsItemUseCase: ObtenerRelacionesRefsItemUseCase,
    private readonly obtenerTipVersionUseCase: ObtenerTipVersionUseCase,
    private readonly obtenerVersionesUseCase: ObtenerVersionesUseCase,
    private readonly obtenerActividadesArchivoUseCase: ObtenerActividadesArchivoUseCase,
    // Upload
    private readonly subirArchivoUseCase: SubirArchivoUseCase,
    // Create/Update/Delete
    private readonly crearItemUseCase: CrearItemUseCase,
    private readonly crearReferenciaItemUseCase: CrearReferenciaItemUseCase,
    private readonly actualizarItemUseCase: ActualizarItemUseCase,
    private readonly eliminarItemUseCase: EliminarItemUseCase,
    private readonly desplazarItemUseCase: DesplazarItemUseCase,
    private readonly copiarItemUseCase: CopiarItemUseCase,
  ) {}

  /**
   * POST - Subir archivo completo a una carpeta específica
   * POST /data-management/items/:projectId/upload
   * IMPORTANTE: Esta ruta debe estar ANTES de otras rutas POST con {projectId}
   */
  @ApiOperation({
    summary: 'Subir archivo con flujo resumido multipart',
    description: 'Multipart file + dto.folderId; crea primera versión en ACC.',
  })
  @Post(':projectId/upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async subirArchivo(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SubirArchivoDto,
  ) {
    const user = request.user!;
    const requestInfo = RequestInfoHelper.extract(request);
    const userRole =
      user?.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]?.nombre || user.roles[0]?.name || undefined
        : undefined;
    const resultado = await this.subirArchivoUseCase.execute(
      user.sub,
      projectId,
      dto.folderId,
      file,
      requestInfo.ipAddress,
      requestInfo.userAgent,
      userRole,
    );

    return ApiResponseDto.success(
      {
        storage: resultado.storage,
        item: resultado.item,
        included: resultado.included,
      },
      'Archivo subido exitosamente',
    );
  }

  /**
   * POST - Crear un nuevo item (primera versión de un archivo) - Método manual avanzado
   * POST /data-management/items/:projectId
   * IMPORTANTE: Esta ruta debe estar DESPUÉS de /upload
   */
  @ApiOperation({
    summary: 'Crear item manual (primer storage ya reservado)',
    description: 'Flujo avanzado sin multipart directo.',
  })
  @Post(':projectId')
  @HttpCode(HttpStatus.CREATED)
  async crearItem(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() dto: CrearItemDto,
  ) {
    const user = request.user!;
    const resultado = await this.crearItemUseCase.execute(
      user.sub,
      projectId,
      dto,
    );

    return ApiResponseDto.success(
      {
        item: resultado.data,
        included: resultado.included || [],
      },
      'Item creado exitosamente',
    );
  }

  /**
   * GET - Obtener un item específico por ID
   * GET /data-management/items/:projectId/:itemId
   */
  @ApiOperation({ summary: 'Obtener metadata del item desde ACC', description: 'Acepta includes vía query.' })
  @Get(':projectId/:itemId')
  @HttpCode(HttpStatus.OK)
  async obtenerItemPorId(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Query() queryParams: any,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerItemPorIdUseCase.execute(
      user.sub,
      projectId,
      itemId,
      queryParams,
    );

    return ApiResponseDto.success(resultado.data, 'Item obtenido exitosamente');
  }

  /**
   * GET - Descargar un item (archivo)
   * GET /data-management/items/:projectId/:itemId/download
   * Query opcional: versionId — si se envía, se descarga esa versión concreta (desde historial de versiones).
   */
  @ApiOperation({
    summary: 'Descargar binario del archivo',
    description:
      'Query versionId opcional para historial; audita rol del usuario JWT.',
  })
  @Get(':projectId/:itemId/download')
  @HttpCode(HttpStatus.OK)
  async descargarItem(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Query('versionId') versionIdQuery: string | undefined,
    @Query() queryParams: any,
    @Res() res: Response,
  ) {
    const user = request.user!;
    const requestInfo = RequestInfoHelper.extract(request);
    const userRole =
      user?.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]?.nombre || user.roles[0]?.name || undefined
        : undefined;
    const versionId =
      typeof versionIdQuery === 'string' && versionIdQuery.trim() !== ''
        ? versionIdQuery.trim()
        : Array.isArray(queryParams?.versionId) &&
            queryParams.versionId.length > 0
          ? String(queryParams.versionId[0]).trim()
          : undefined;
    const resultado = await this.descargarItemUseCase.execute(
      user.sub,
      projectId,
      itemId,
      { ...queryParams, versionId },
      requestInfo.ipAddress,
      requestInfo.userAgent,
      userRole,
    );

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${resultado.fileName}"`,
      'Content-Length': resultado.data.length,
    });

    res.send(resultado.data);
  }

  /**
   * GET - Obtener la URL de storage (URL firmada) de un item para visualización
   * GET /data-management/items/:projectId/:itemId/storage-url
   */
  @ApiOperation({
    summary: 'URL firmada S3/visualización rápida',
    description:
      'Usa APS para resolver storage del tip y devolver cadena HTTPS.',
  })
  @Get(':projectId/:itemId/storage-url')
  @HttpCode(HttpStatus.OK)
  async obtenerStorageUrl(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerStorageUrlItemUseCase.execute(
      user.sub,
      projectId,
      itemId,
    );

    return ApiResponseDto.success(
      resultado,
      'URL de storage obtenida exitosamente',
    );
  }

  /**
   * GET - Obtener el padre de un item
   * GET /data-management/items/:projectId/:itemId/parent
   */
  @ApiOperation({ summary: 'Carpeta contenedora inmediata del item' })
  @Get(':projectId/:itemId/parent')
  @HttpCode(HttpStatus.OK)
  async obtenerItemPadre(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Query() queryParams: any,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerItemPadreUseCase.execute(
      user.sub,
      projectId,
      itemId,
      queryParams,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Item padre obtenido exitosamente',
    );
  }

  /**
   * GET - Obtener las referencias (refs) de un item
   * GET /data-management/items/:projectId/:itemId/refs
   */
  @ApiOperation({ summary: 'Referencias APS del item (refs)' })
  @Get(':projectId/:itemId/refs')
  @HttpCode(HttpStatus.OK)
  async obtenerReferencias(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Query() queryParams: any,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerReferenciasItemUseCase.execute(
      user.sub,
      projectId,
      itemId,
      queryParams,
    );

    return ApiResponseDto.success(
      { ...resultado, data: resultado.data, links: resultado.links },
      'Referencias obtenidas exitosamente',
    );
  }

  /**
   * GET - Obtener las relaciones de links de un item
   * GET /data-management/items/:projectId/:itemId/relationships/links
   */
  @ApiOperation({ summary: 'Relaciones links del item' })
  @Get(':projectId/:itemId/relationships/links')
  @HttpCode(HttpStatus.OK)
  async obtenerRelacionesLinks(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Query() queryParams: any,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerRelacionesLinksItemUseCase.execute(
      user.sub,
      projectId,
      itemId,
      queryParams,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Relaciones de links obtenidas exitosamente',
    );
  }

  /**
   * GET - Obtener las relaciones de refs de un item
   * GET /data-management/items/:projectId/:itemId/relationships/refs
   */
  @ApiOperation({ summary: 'Relaciones refs del item' })
  @Get(':projectId/:itemId/relationships/refs')
  @HttpCode(HttpStatus.OK)
  async obtenerRelacionesRefs(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Query() queryParams: any,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerRelacionesRefsItemUseCase.execute(
      user.sub,
      projectId,
      itemId,
      queryParams,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Relaciones de refs obtenidas exitosamente',
    );
  }

  /**
   * GET - Obtener la versión tip (más reciente) de un item
   * GET /data-management/items/:projectId/:itemId/tip
   */
  @ApiOperation({
    summary: 'Versión TIP más reciente',
    description: 'Devuelve el puntero a la última versión publicada.',
  })
  @Get(':projectId/:itemId/tip')
  @HttpCode(HttpStatus.OK)
  async obtenerTipVersion(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Query() queryParams: any,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerTipVersionUseCase.execute(
      user.sub,
      projectId,
      itemId,
      queryParams,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Versión tip obtenida exitosamente',
    );
  }

  /**
   * GET - Obtener las versiones de un item
   * GET /data-management/items/:projectId/:itemId/versions
   */
  @ApiOperation({ summary: 'Historial cronológico de versiones APS' })
  @Get(':projectId/:itemId/versions')
  @HttpCode(HttpStatus.OK)
  async obtenerVersiones(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Query() queryParams: any,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerVersionesUseCase.execute(
      user.sub,
      projectId,
      itemId,
      queryParams,
    );

    return ApiResponseDto.success(
      { ...resultado, data: resultado.data, links: resultado.links },
      'Versiones obtenidas exitosamente',
    );
  }

  /**
   * GET - Obtener las actividades de un archivo
   * GET /data-management/items/:projectId/:itemId/activities
   */
  @ApiOperation({
    summary: 'Timeline de auditoría/actividad GVR sobre el archivo',
  })
  @Get(':projectId/:itemId/activities')
  @HttpCode(HttpStatus.OK)
  async obtenerActividadesArchivo(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerActividadesArchivoUseCase.execute(
      user.sub,
      projectId,
      itemId,
    );

    return ApiResponseDto.success(
      resultado,
      'Actividades del archivo obtenidas exitosamente',
    );
  }

  /**
   * POST - Crear una referencia en un item
   * POST /data-management/items/:projectId/:itemId/relationships/refs
   */
  @ApiOperation({ summary: 'Crear nueva ref que apunta a otro recurso' })
  @Post(':projectId/:itemId/relationships/refs')
  @HttpCode(HttpStatus.CREATED)
  async crearReferencia(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Body() dto: CrearReferenciaItemDto,
  ) {
    const user = request.user!;
    const resultado = await this.crearReferenciaItemUseCase.execute(
      user.sub,
      projectId,
      itemId,
      dto.data,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Referencia creada exitosamente',
    );
  }

  /**
   * PATCH - Actualizar un item
   * PATCH /data-management/items/:projectId/:itemId
   */
  @ApiOperation({ summary: 'Actualizar nombre o incluso cambiar estado lógico' })
  @Patch(':projectId/:itemId')
  @HttpCode(HttpStatus.OK)
  async actualizarItem(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Body() dto: ActualizarItemDto,
  ) {
    const user = request.user!;
    const requestInfo = RequestInfoHelper.extract(request);
    const userRole =
      user?.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]?.nombre || user.roles[0]?.name || undefined
        : undefined;
    const resultado = await this.actualizarItemUseCase.execute(
      user.sub,
      projectId,
      itemId,
      dto,
      requestInfo.ipAddress,
      requestInfo.userAgent,
      userRole,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Item actualizado exitosamente',
    );
  }

  /**
   * DELETE - Eliminar un item (marcar como oculto/mover a papelera)
   * DELETE /data-management/items/:projectId/:itemId
   */
  @ApiOperation({
    summary: 'Eliminar archivo (marca Deleted en ACC)',
    description: 'Versión Deleted + auditoría de rol/IP.',
  })
  @Delete(':projectId/:itemId')
  @HttpCode(HttpStatus.OK)
  async eliminarItem(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
  ) {
    const user = request.user!;
    const requestInfo = RequestInfoHelper.extract(request);
    const userRole =
      user?.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]?.nombre || user.roles[0]?.name || undefined
        : undefined;
    const resultado = await this.eliminarItemUseCase.execute(
      user.sub,
      projectId,
      itemId,
      requestInfo.ipAddress,
      requestInfo.userAgent,
      userRole,
    );

    const message =
      resultado.message ||
      (resultado.wasAlreadyDeleted
        ? 'El item ya estaba marcado como eliminado'
        : 'Item marcado como eliminado creando versión Deleted');

    return ApiResponseDto.success(
      {
        deletedVersion: resultado.data || null,
        deletedAt: resultado.deletedAt || null,
        wasAlreadyDeleted: resultado.wasAlreadyDeleted || false,
      },
      message,
    );
  }

  /**
   * PATCH - Desplazar (mover) un item a otra carpeta
   * PATCH /data-management/items/:projectId/:itemId/move
   */
  @ApiOperation({ summary: 'Mover item entre carpetas APS' })
  @Patch(':projectId/:itemId/move')
  @HttpCode(HttpStatus.OK)
  async desplazarItem(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Body() dto: DesplazarItemDto,
  ) {
    const user = request.user!;
    const requestInfo = RequestInfoHelper.extract(request);
    const userRole =
      user?.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]?.nombre || user.roles[0]?.name || undefined
        : undefined;
    const resultado = await this.desplazarItemUseCase.execute(
      user.sub,
      projectId,
      itemId,
      dto,
      requestInfo.ipAddress,
      requestInfo.userAgent,
      userRole,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Archivo desplazado exitosamente',
    );
  }

  /**
   * POST - Copiar un item (versión) a una carpeta destino
   * POST /data-management/items/:projectId/copy
   */
  @ApiOperation({
    summary: 'Duplicar contenido seleccionando versión fuente destino',
  })
  @Post(':projectId/copy')
  @HttpCode(HttpStatus.CREATED)
  async copiarItem(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() dto: CopiarItemDto,
  ) {
    const user = request.user!;
    const requestInfo = RequestInfoHelper.extract(request);
    const userRole =
      user?.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]?.nombre || user.roles[0]?.name || undefined
        : undefined;
    const resultado = await this.copiarItemUseCase.execute(
      user.sub,
      projectId,
      dto,
      requestInfo.ipAddress,
      requestInfo.userAgent,
      userRole,
    );

    return ApiResponseDto.success(
      resultado?.data ?? resultado,
      'Archivo copiado exitosamente',
    );
  }
}
