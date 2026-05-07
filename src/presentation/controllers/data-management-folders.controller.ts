import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { RequestInfoHelper } from '../../shared/helpers/request-info.helper';

// Use cases - Group 1
import { ObtenerCarpetaPorIdUseCase } from '../../application/use-cases/data-management/folders/obtener-carpeta-por-id.use-case';
import { ObtenerContenidoCarpetaUseCase } from '../../application/use-cases/data-management/folders/obtener-contenido-carpeta.use-case';
import { BuscarEnContenidoCarpetaUseCase } from '../../application/use-cases/data-management/folders/buscar-en-contenido-carpeta.use-case';
import { ObtenerCarpetaPadreUseCase } from '../../application/use-cases/data-management/folders/obtener-carpeta-padre.use-case';
import { ObtenerReferenciasUseCase } from '../../application/use-cases/data-management/folders/obtener-referencias.use-case';

// Use cases - Group 2
import { ObtenerRelacionesLinksUseCase } from '../../application/use-cases/data-management/folders/obtener-relaciones-links.use-case';
import { ObtenerRelacionesRefsUseCase } from '../../application/use-cases/data-management/folders/obtener-relaciones-refs.use-case';
import { BuscarEnCarpetaUseCase } from '../../application/use-cases/data-management/folders/buscar-en-carpeta.use-case';

// Use cases - Group 3
import { CrearCarpetaUseCase } from '../../application/use-cases/data-management/folders/crear-carpeta.use-case';
import { CrearSubcarpetaUseCase } from '../../application/use-cases/data-management/folders/crear-subcarpeta.use-case';
import { CrearReferenciaCarpetaUseCase } from '../../application/use-cases/data-management/folders/crear-referencia-carpeta.use-case';
import { ActualizarCarpetaUseCase } from '../../application/use-cases/data-management/folders/actualizar-carpeta.use-case';
import { EliminarCarpetaUseCase } from '../../application/use-cases/data-management/folders/eliminar-carpeta.use-case';
import { SincronizarCarpetasProyectoUseCase } from '../../application/use-cases/data-management/folders/sincronizar-carpetas-proyecto.use-case';
import { ExportarRegistroArchivosPdfUseCase } from '../../application/use-cases/data-management/folders/exportar-registro-archivos-pdf.use-case';
import { ExportarPermisosCarpetaPdfUseCase } from '../../application/use-cases/data-management/folders/exportar-permisos-carpeta-pdf.use-case';
import { ExportarRegistroArchivosPdfDto } from '../../application/dtos/data-management/folders/exportar-registro-archivos-pdf.dto';
import { ExportarPermisosCarpetaPdfDto } from '../../application/dtos/data-management/folders/exportar-permisos-carpeta-pdf.dto';

// DTOs - Group 1
import { ObtenerCarpetaPorIdDto } from '../../application/dtos/data-management/folders/obtener-carpeta-por-id.dto';
import { BuscarEnContenidoCarpetaDto } from '../../application/dtos/data-management/folders/buscar-en-contenido-carpeta.dto';
import { ObtenerCarpetaPadreDto } from '../../application/dtos/data-management/folders/obtener-carpeta-padre.dto';
import { ObtenerReferenciasDto } from '../../application/dtos/data-management/folders/obtener-referencias.dto';

// DTOs - Group 2
import { ObtenerRelacionesLinksDto } from '../../application/dtos/data-management/folders/obtener-relaciones-links.dto';
import { ObtenerRelacionesRefsDto } from '../../application/dtos/data-management/folders/obtener-relaciones-refs.dto';
import { BuscarEnCarpetaDto } from '../../application/dtos/data-management/folders/buscar-en-carpeta.dto';

// DTOs - Group 3
import { CrearCarpetaDto } from '../../application/dtos/data-management/folders/crear-carpeta.dto';
import { CrearSubcarpetaDto } from '../../application/dtos/data-management/folders/crear-subcarpeta.dto';
import { CrearReferenciaDto } from '../../application/dtos/data-management/folders/crear-referencia.dto';
import { ActualizarCarpetaDto } from '../../application/dtos/data-management/folders/actualizar-carpeta.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('acc-data')
@ApiBearerAuth('access-token')
@Controller('data-management/folders')
@UseGuards(JwtAuthGuard)
export class DataManagementFoldersController {
  constructor(
    // Group 1
    private readonly obtenerCarpetaPorIdUseCase: ObtenerCarpetaPorIdUseCase,
    private readonly obtenerContenidoCarpetaUseCase: ObtenerContenidoCarpetaUseCase,
    private readonly buscarEnContenidoCarpetaUseCase: BuscarEnContenidoCarpetaUseCase,
    private readonly obtenerCarpetaPadreUseCase: ObtenerCarpetaPadreUseCase,
    private readonly obtenerReferenciasUseCase: ObtenerReferenciasUseCase,
    // Group 2
    private readonly obtenerRelacionesLinksUseCase: ObtenerRelacionesLinksUseCase,
    private readonly obtenerRelacionesRefsUseCase: ObtenerRelacionesRefsUseCase,
    private readonly buscarEnCarpetaUseCase: BuscarEnCarpetaUseCase,
    // Group 3
    private readonly crearCarpetaUseCase: CrearCarpetaUseCase,
    private readonly crearSubcarpetaUseCase: CrearSubcarpetaUseCase,
    private readonly crearReferenciaCarpetaUseCase: CrearReferenciaCarpetaUseCase,
    private readonly actualizarCarpetaUseCase: ActualizarCarpetaUseCase,
    private readonly eliminarCarpetaUseCase: EliminarCarpetaUseCase,
    private readonly sincronizarCarpetasProyectoUseCase: SincronizarCarpetasProyectoUseCase,
    private readonly exportarRegistroArchivosPdfUseCase: ExportarRegistroArchivosPdfUseCase,
    private readonly exportarPermisosCarpetaPdfUseCase: ExportarPermisosCarpetaPdfUseCase,
  ) {}

  /**
   * POST - PDF registro de archivos (carpeta actual o con subcarpetas)
   * POST /data-management/folders/:projectId/:folderId/export/file-registry/pdf
   */
  @ApiOperation({
    summary: 'Exportar PDF de registro de archivos',
    description: 'Carpeta actual o incluyendo subcarpetas según filtros.',
  })
  @Post(':projectId/:folderId/export/file-registry/pdf')
  @HttpCode(HttpStatus.OK)
  async exportarRegistroArchivosPdf(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Body() dto: ExportarRegistroArchivosPdfDto,
    @Res() res: Response,
  ) {
    if (!projectId || !folderId) {
      throw new BadRequestException('projectId y folderId son requeridos');
    }
    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }
    const userIdNumero =
      typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    if (isNaN(userIdNumero) || userIdNumero <= 0) {
      throw new BadRequestException('User ID inválido');
    }
    const resultado = await this.exportarRegistroArchivosPdfUseCase.execute(
      userIdNumero,
      projectId,
      folderId,
      dto,
    );
    res.setHeader('Content-Type', resultado.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${resultado.filename}"`,
    );
    return res.send(Buffer.from(resultado.data));
  }

  /**
   * POST - PDF de permisos de carpeta (GVR: accresources + asignaciones)
   * POST /data-management/folders/:projectId/:folderId/export/permissions/pdf
   */
  @ApiOperation({
    summary: 'Exportar PDF de permisos de carpeta',
    description: 'Combina accresources locales con asignaciones GVR.',
  })
  @Post(':projectId/:folderId/export/permissions/pdf')
  @HttpCode(HttpStatus.OK)
  async exportarPermisosCarpetaPdf(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Body() dto: ExportarPermisosCarpetaPdfDto,
    @Res() res: Response,
  ) {
    if (!projectId || !folderId) {
      throw new BadRequestException('projectId y folderId son requeridos');
    }
    const user = request.user!;
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new BadRequestException('User ID es requerido');
    }
    const userIdNumero =
      typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    if (isNaN(userIdNumero) || userIdNumero <= 0) {
      throw new BadRequestException('User ID inválido');
    }
    const resultado = await this.exportarPermisosCarpetaPdfUseCase.execute(
      userIdNumero,
      projectId,
      folderId,
      dto,
    );
    res.setHeader('Content-Type', resultado.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${resultado.filename}"`,
    );
    return res.send(Buffer.from(resultado.data));
  }

  /**
   * GET - Obtener una carpeta específica por ID
   * GET /data-management/folders/:projectId/:folderId
   */
  @ApiOperation({ summary: 'Obtener carpeta por ID', description: 'Incluye filtros tipados ACC.' })
  @Get(':projectId/:folderId')
  @HttpCode(HttpStatus.OK)
  async obtenerCarpetaPorId(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Query() dto: ObtenerCarpetaPorIdDto,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerCarpetaPorIdUseCase.execute(
      user.sub,
      projectId,
      folderId,
      dto,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Carpeta obtenida exitosamente',
    );
  }

  /**
   * DELETE - Marcar carpeta como eliminada (hidden=true)
   * DELETE /data-management/folders/:projectId/:folderId
   */
  @ApiOperation({
    summary: 'Marcar carpeta como eliminada (hidden)',
    description: 'Auditoría opcional por IP/agente desde el JWT.',
  })
  @Delete(':projectId/:folderId')
  @HttpCode(HttpStatus.OK)
  async eliminarCarpeta(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
  ) {
    const user = request.user!;
    const requestInfo = RequestInfoHelper.extract(request);
    const userRole =
      user?.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]?.nombre || user.roles[0]?.name || undefined
        : undefined;
    const resultado = await this.eliminarCarpetaUseCase.execute(
      user.sub,
      projectId,
      folderId,
      requestInfo.ipAddress,
      requestInfo.userAgent,
      userRole,
    );

    const responseData = {
      folder: resultado.data || null,
      hiddenAt: resultado.hiddenAt || null,
      wasAlreadyHidden: resultado.wasAlreadyHidden || false,
    };

    const message = resultado.wasAlreadyHidden
      ? 'La carpeta ya estaba oculta'
      : 'Carpeta marcada como eliminada exitosamente';

    return ApiResponseDto.success(responseData, message);
  }

  /**
   * GET - Obtener el contenido de una carpeta (subcarpetas y archivos)
   * GET /data-management/folders/:projectId/:folderId/contents
   */
  @ApiOperation({ summary: 'Listar contenido de la carpeta (items y refs)' })
  @Get(':projectId/:folderId/contents')
  @HttpCode(HttpStatus.OK)
  async obtenerContenidoCarpeta(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Query() queryParams: any, // Usar any en lugar de DTO para permitir cualquier parámetro
  ) {
    const user = request.user!;
    const userRole =
      user?.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]?.nombre || user.roles[0]?.name || undefined
        : undefined;
    const resultado = await this.obtenerContenidoCarpetaUseCase.execute(
      user.sub,
      projectId,
      folderId,
      queryParams,
      userRole,
    );

    return ApiResponseDto.success(
      { ...resultado, data: resultado.data, links: resultado.links },
      'Contenido de carpeta obtenido exitosamente',
    );
  }

  /**
   * GET - Buscar en el contenido de una carpeta por nombre u otros criterios
   * GET /data-management/folders/:projectId/:folderId/search-content
   */
  @ApiOperation({ summary: 'Buscar dentro del listado contenido sin salir del ámbito' })
  @Get(':projectId/:folderId/search-content')
  @HttpCode(HttpStatus.OK)
  async buscarEnContenidoCarpeta(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Query() dto: BuscarEnContenidoCarpetaDto,
  ) {
    const user = request.user!;
    const resultado = await this.buscarEnContenidoCarpetaUseCase.execute(
      user.sub,
      projectId,
      folderId,
      dto,
    );

    return ApiResponseDto.success(
      { ...resultado, data: resultado.data, links: resultado.links },
      'Búsqueda completada exitosamente',
    );
  }

  /**
   * GET - Obtener la carpeta padre de una carpeta
   * GET /data-management/folders/:projectId/:folderId/parent
   */
  @ApiOperation({ summary: 'Obtener carpeta padre' })
  @Get(':projectId/:folderId/parent')
  @HttpCode(HttpStatus.OK)
  async obtenerCarpetaPadre(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Query() dto: ObtenerCarpetaPadreDto,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerCarpetaPadreUseCase.execute(
      user.sub,
      projectId,
      folderId,
      dto,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Carpeta padre obtenida exitosamente',
    );
  }

  /**
   * GET - Obtener las referencias (refs) de una carpeta
   * GET /data-management/folders/:projectId/:folderId/refs
   */
  @ApiOperation({ summary: 'Referencias (refs) de la carpeta' })
  @Get(':projectId/:folderId/refs')
  @HttpCode(HttpStatus.OK)
  async obtenerReferencias(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Query() dto: ObtenerReferenciasDto,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerReferenciasUseCase.execute(
      user.sub,
      projectId,
      folderId,
      dto,
    );

    return ApiResponseDto.success(
      { ...resultado, data: resultado.data, links: resultado.links },
      'Referencias obtenidas exitosamente',
    );
  }

  /**
   * GET - Obtener las relaciones de links de una carpeta
   * GET /data-management/folders/:projectId/:folderId/relationships/links
   */
  @ApiOperation({ summary: 'Relaciones links declaradas sobre la carpeta' })
  @Get(':projectId/:folderId/relationships/links')
  @HttpCode(HttpStatus.OK)
  async obtenerRelacionesLinks(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Query() dto: ObtenerRelacionesLinksDto,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerRelacionesLinksUseCase.execute(
      user.sub,
      projectId,
      folderId,
      dto,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Relaciones de links obtenidas exitosamente',
    );
  }

  /**
   * GET - Obtener las relaciones de refs de una carpeta
   * GET /data-management/folders/:projectId/:folderId/relationships/refs
   */
  @ApiOperation({ summary: 'Relaciones refs declaradas sobre la carpeta' })
  @Get(':projectId/:folderId/relationships/refs')
  @HttpCode(HttpStatus.OK)
  async obtenerRelacionesRefs(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Query() dto: ObtenerRelacionesRefsDto,
  ) {
    const user = request.user!;
    const resultado = await this.obtenerRelacionesRefsUseCase.execute(
      user.sub,
      projectId,
      folderId,
      dto,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Relaciones de refs obtenidas exitosamente',
    );
  }

  /**
   * GET - Buscar dentro de una carpeta (endpoint original)
   * GET /data-management/folders/:projectId/:folderId/search
   */
  @ApiOperation({ summary: 'Búsqueda global APS dentro de carpeta base' })
  @Get(':projectId/:folderId/search')
  @HttpCode(HttpStatus.OK)
  async buscarEnCarpeta(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Query() dto: BuscarEnCarpetaDto,
  ) {
    const user = request.user!;
    const resultado = await this.buscarEnCarpetaUseCase.execute(
      user.sub,
      projectId,
      folderId,
      dto,
    );

    return ApiResponseDto.success(
      { ...resultado, data: resultado.data, links: resultado.links },
      'Búsqueda completada exitosamente',
    );
  }

  /**
   * POST - Crear una nueva carpeta
   * POST /data-management/folders/:projectId
   */
  @ApiOperation({ summary: 'Crear carpeta de nivel alto en proyecto' })
  @Post(':projectId')
  @HttpCode(HttpStatus.CREATED)
  async crearCarpeta(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() dto: CrearCarpetaDto,
  ) {
    const user = request.user!;
    const requestInfo = RequestInfoHelper.extract(request);
    const userRole =
      user?.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]?.nombre || user.roles[0]?.name || undefined
        : undefined;
    const resultado = await this.crearCarpetaUseCase.execute(
      user.sub,
      projectId,
      dto,
      requestInfo.ipAddress,
      requestInfo.userAgent,
      userRole,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Carpeta creada exitosamente',
    );
  }

  /**
   * POST - Crear una subcarpeta dentro de una carpeta padre
   * POST /data-management/folders/:projectId/:parentFolderId/subfolders
   */
  @ApiOperation({ summary: 'Crear subcarpeta bajo un folder padre' })
  @Post(':projectId/:parentFolderId/subfolders')
  @HttpCode(HttpStatus.CREATED)
  async crearSubcarpeta(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('parentFolderId') parentFolderId: string,
    @Body() dto: CrearSubcarpetaDto,
  ) {
    const user = request.user!;
    const requestInfo = RequestInfoHelper.extract(request);
    const userRole =
      user?.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]?.nombre || user.roles[0]?.name || undefined
        : undefined;
    const resultado = await this.crearSubcarpetaUseCase.execute(
      user.sub,
      projectId,
      parentFolderId,
      dto,
      requestInfo.ipAddress,
      requestInfo.userAgent,
      userRole,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Subcarpeta creada exitosamente',
    );
  }

  /**
   * POST - Crear una referencia en una carpeta
   * POST /data-management/folders/:projectId/:folderId/relationships/refs
   */
  @ApiOperation({ summary: 'Adjuntar ref de otro recurso a la carpeta' })
  @Post(':projectId/:folderId/relationships/refs')
  @HttpCode(HttpStatus.CREATED)
  async crearReferencia(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Body() dto: CrearReferenciaDto,
  ) {
    const user = request.user!;
    const resultado = await this.crearReferenciaCarpetaUseCase.execute(
      user.sub,
      projectId,
      folderId,
      dto,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Referencia creada exitosamente',
    );
  }

  /**
   * PATCH - Actualizar una carpeta
   * PATCH /data-management/folders/:projectId/:folderId
   */
  @ApiOperation({ summary: 'Actualizar nombre o metadatos de carpeta' })
  @Patch(':projectId/:folderId')
  @HttpCode(HttpStatus.OK)
  async actualizarCarpeta(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('folderId') folderId: string,
    @Body() dto: ActualizarCarpetaDto,
  ) {
    const user = request.user!;
    const requestInfo = RequestInfoHelper.extract(request);
    const userRole =
      user?.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]?.nombre || user.roles[0]?.name || undefined
        : undefined;
    const resultado = await this.actualizarCarpetaUseCase.execute(
      user.sub,
      projectId,
      folderId,
      dto,
      requestInfo.ipAddress,
      requestInfo.userAgent,
      userRole,
    );

    return ApiResponseDto.success(
      resultado.data,
      'Carpeta actualizada exitosamente',
    );
  }

  /**
   * POST - Sincronizar todas las carpetas de un proyecto
   * POST /data-management/folders/sync/:hubId/:projectId
   * Body (opcional): { roles_ids: [1, 2, 3] }
   */
  @ApiOperation({
    summary: 'Sincronizar todas las carpetas del proyecto desde ACC',
    description: 'Body opcional roles_ids para asignaciones posteriores.',
  })
  @Post('sync/:hubId/:projectId')
  @HttpCode(HttpStatus.OK)
  async sincronizarCarpetasProyecto(
    @Req() request: Request,
    @Param('hubId') hubId: string,
    @Param('projectId') projectId: string,
    @Body() body?: { roles_ids?: number[] },
  ) {
    const user = request.user!;
    const rolesIds = body?.roles_ids;
    const resultado = await this.sincronizarCarpetasProyectoUseCase.execute(
      user.sub,
      projectId,
      hubId,
      rolesIds,
    );

    return ApiResponseDto.success(
      resultado,
      resultado.message || 'Sincronización completada exitosamente',
    );
  }
}
