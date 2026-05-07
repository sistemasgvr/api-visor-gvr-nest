import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import {
  CrearCompanyUseCase,
  ImportarCompaniesUseCase,
  ObtenerCompaniesUseCase,
  ObtenerCompanyPorIdUseCase,
  BuscarCompaniesUseCase,
  ObtenerCompaniesProyectoUseCase,
  ActualizarCompanyUseCase,
  SubirImagenCompanyUseCase,
} from '../../application/use-cases/acc/companies';
import {
  CrearCompanyDto,
  ImportarCompaniesDto,
  ObtenerCompaniesDto,
  BuscarCompaniesDto,
  ActualizarCompanyDto,
  ObtenerCompaniesProyectoDto,
} from '../../application/dtos/acc/companies';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('companies')
@ApiBearerAuth('access-token')
@Controller('acc/companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(
    private readonly crearCompanyUseCase: CrearCompanyUseCase,
    private readonly importarCompaniesUseCase: ImportarCompaniesUseCase,
    private readonly obtenerCompaniesUseCase: ObtenerCompaniesUseCase,
    private readonly obtenerCompanyPorIdUseCase: ObtenerCompanyPorIdUseCase,
    private readonly buscarCompaniesUseCase: BuscarCompaniesUseCase,
    private readonly obtenerCompaniesProyectoUseCase: ObtenerCompaniesProyectoUseCase,
    private readonly actualizarCompanyUseCase: ActualizarCompanyUseCase,
    private readonly subirImagenCompanyUseCase: SubirImagenCompanyUseCase,
  ) {}

  /**
   * POST - Crear una nueva compañía
   * POST /acc/companies/:accountId
   */
  @ApiOperation({ summary: 'Crear una compañía en la cuenta ACC' })
  @Post(':accountId')
  @HttpCode(HttpStatus.CREATED)
  async crearCompany(
    @Param('accountId') accountId: string,
    @Body() dto: CrearCompanyDto,
  ) {
    if (!accountId) {
      throw new BadRequestException('El ID de la cuenta es requerido');
    }

    const resultado = await this.crearCompanyUseCase.execute(accountId, dto);
    return ApiResponseDto.created(
      resultado.data,
      'Compañía creada exitosamente',
    );
  }

  /**
   * POST - Importar múltiples compañías
   * POST /acc/companies/:accountId/import
   */
  @ApiOperation({ summary: 'Importar compañías en bloque' })
  @Post(':accountId/import')
  @HttpCode(HttpStatus.OK)
  async importarCompanies(
    @Param('accountId') accountId: string,
    @Body() dto: ImportarCompaniesDto,
  ) {
    if (!accountId) {
      throw new BadRequestException('El ID de la cuenta es requerido');
    }

    const resultado = await this.importarCompaniesUseCase.execute(
      accountId,
      dto,
    );
    return ApiResponseDto.success(
      resultado.data,
      'Compañías importadas exitosamente',
    );
  }

  /**
   * GET - Obtener todas las compañías de una cuenta
   * GET /acc/companies/:accountId
   */
  @ApiOperation({ summary: 'Listar compañías de la cuenta con paginación' })
  @Get(':accountId')
  @HttpCode(HttpStatus.OK)
  async obtenerCompanies(
    @Param('accountId') accountId: string,
    @Query() dto: ObtenerCompaniesDto,
  ) {
    if (!accountId) {
      throw new BadRequestException('El ID de la cuenta es requerido');
    }

    const resultado = await this.obtenerCompaniesUseCase.execute(
      accountId,
      dto,
    );
    if (resultado.pagination) {
      return ApiResponseDto.paginated(
        resultado.data,
        {
          currentPage: resultado.pagination.current_page || 1,
          itemsPerPage: resultado.pagination.limit,
          totalItems: resultado.pagination.total,
          totalPages: resultado.pagination.total_pages || 0,
        },
        'Compañías obtenidas exitosamente',
      );
    }
    return ApiResponseDto.success(
      resultado.data,
      'Compañías obtenidas exitosamente',
    );
  }

  /**
   * GET - Buscar compañías
   * GET /acc/companies/:accountId/search
   */
  @ApiOperation({ summary: 'Buscar compañías en la cuenta' })
  @Get(':accountId/search')
  @HttpCode(HttpStatus.OK)
  async buscarCompanies(
    @Param('accountId') accountId: string,
    @Query() dto: BuscarCompaniesDto,
  ) {
    if (!accountId) {
      throw new BadRequestException('El ID de la cuenta es requerido');
    }

    const resultado = await this.buscarCompaniesUseCase.execute(accountId, dto);
    if (resultado.pagination) {
      return ApiResponseDto.paginated(
        resultado.data,
        {
          currentPage: resultado.pagination.current_page || 1,
          itemsPerPage: resultado.pagination.limit,
          totalItems: resultado.pagination.total,
          totalPages: resultado.pagination.total_pages || 0,
        },
        'Búsqueda completada exitosamente',
      );
    }
    return ApiResponseDto.success(
      resultado.data,
      'Búsqueda completada exitosamente',
    );
  }

  /**
   * GET - Obtener una compañía específica por ID
   * GET /acc/companies/:accountId/:companyId
   */
  @ApiOperation({ summary: 'Obtener compañía por ID' })
  @Get(':accountId/:companyId')
  @HttpCode(HttpStatus.OK)
  async obtenerCompanyPorId(
    @Param('accountId') accountId: string,
    @Param('companyId') companyId: string,
    @Query('region') region?: string,
  ) {
    if (!accountId) {
      throw new BadRequestException('El ID de la cuenta es requerido');
    }
    if (!companyId) {
      throw new BadRequestException('El ID de la compañía es requerido');
    }

    const resultado = await this.obtenerCompanyPorIdUseCase.execute(
      accountId,
      companyId,
      region,
    );
    return ApiResponseDto.success(
      resultado.data,
      'Compañía obtenida exitosamente',
    );
  }

  /**
   * PATCH - Actualizar una compañía
   * PATCH /acc/companies/:accountId/:companyId
   */
  @ApiOperation({ summary: 'Actualizar datos de la compañía' })
  @Patch(':accountId/:companyId')
  @HttpCode(HttpStatus.OK)
  async actualizarCompany(
    @Param('accountId') accountId: string,
    @Param('companyId') companyId: string,
    @Body() dto: ActualizarCompanyDto,
  ) {
    if (!accountId) {
      throw new BadRequestException('El ID de la cuenta es requerido');
    }
    if (!companyId) {
      throw new BadRequestException('El ID de la compañía es requerido');
    }

    const resultado = await this.actualizarCompanyUseCase.execute(
      accountId,
      companyId,
      dto,
    );
    return ApiResponseDto.success(
      resultado.data,
      'Compañía actualizada exitosamente',
    );
  }

  /**
   * PATCH - Subir imagen de una compañía
   * PATCH /acc/companies/:accountId/:companyId/image
   */
  @ApiOperation({ summary: 'Subir o cambiar imagen de la compañía' })
  @Patch(':accountId/:companyId/image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  async subirImagenCompany(
    @Param('accountId') accountId: string,
    @Param('companyId') companyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('region') region?: string,
  ) {
    if (!accountId) {
      throw new BadRequestException('El ID de la cuenta es requerido');
    }
    if (!companyId) {
      throw new BadRequestException('El ID de la compañía es requerido');
    }
    if (!file) {
      throw new BadRequestException('El archivo de imagen es requerido');
    }

    const resultado = await this.subirImagenCompanyUseCase.execute(
      accountId,
      companyId,
      file,
      region,
    );
    return ApiResponseDto.success(resultado.data, 'Imagen subida exitosamente');
  }
}

/**
 * Controller para obtener compañías de un proyecto específico
 * GET /projects/:accountId/:projectId/companies
 */
@ApiTags('companies')
@ApiBearerAuth('access-token')
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsCompaniesController {
  constructor(
    private readonly obtenerCompaniesProyectoUseCase: ObtenerCompaniesProyectoUseCase,
  ) {}

  @ApiOperation({
    summary: 'Listar compañías del proyecto BIM/ACC',
  })
  @Get(':accountId/:projectId/companies')
  @HttpCode(HttpStatus.OK)
  async obtenerCompaniesPorProyecto(
    @Param('accountId') accountId: string,
    @Param('projectId') projectId: string,
    @Query() dto: ObtenerCompaniesProyectoDto,
  ) {
    if (!accountId) {
      throw new BadRequestException('El ID de la cuenta es requerido');
    }
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }

    const resultado = await this.obtenerCompaniesProyectoUseCase.execute(
      accountId,
      projectId,
      dto,
    );
    if (resultado.pagination) {
      return ApiResponseDto.paginated(
        resultado.data,
        {
          currentPage: resultado.pagination.current_page || 1,
          itemsPerPage: resultado.pagination.limit,
          totalItems: resultado.pagination.total,
          totalPages: resultado.pagination.total_pages || 0,
        },
        'Compañías del proyecto obtenidas exitosamente',
      );
    }
    return ApiResponseDto.success(
      resultado.data,
      'Compañías del proyecto obtenidas exitosamente',
    );
  }
}
