import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import {
  CreateNamingStandardFromTemplateUseCase,
  GenerarNombreDocumentoUseCase,
  ListarDocumentAttributesUseCase,
  ListarDocumentMetadataPorCarpetaUseCase,
  ListarDocumentNamingStandardsUseCase,
  ObtenerDocumentMetadataUseCase,
  ObtenerFolderNamingRuleUseCase,
  ObtenerNamingTemplatePreviewUseCase,
  UpsertDocumentAttributeUseCase,
  UpsertDocumentMetadataUseCase,
  UpsertDocumentNamingStandardUseCase,
  UpsertFolderNamingRuleUseCase,
} from '../../application/use-cases/acc/document-config';
import { CreateNamingStandardFromTemplateDto } from '../../application/dtos/acc/document-config/create-naming-standard-from-template.dto';
import { ListDocumentAttributesQueryDto } from '../../application/dtos/acc/document-config/list-document-attributes-query.dto';
import { UpsertDocumentAttributeDto } from '../../application/dtos/acc/document-config/upsert-document-attribute.dto';
import { UpsertDocumentNamingStandardDto } from '../../application/dtos/acc/document-config/upsert-document-naming-standard.dto';
import { UpsertFolderNamingRuleDto } from '../../application/dtos/acc/document-config/upsert-folder-naming-rule.dto';
import { GenerarNombreDocumentoDto } from '../../application/dtos/acc/document-config/generar-nombre-documento.dto';
import { UpsertDocumentMetadataDto } from '../../application/dtos/acc/document-config/upsert-document-metadata.dto';

@ApiTags('acc')
@ApiBearerAuth('access-token')
@Controller('acc/docs-config')
@UseGuards(JwtAuthGuard)
export class AccDocumentConfigController {
  constructor(
    private readonly listarDocumentAttributesUseCase: ListarDocumentAttributesUseCase,
    private readonly upsertDocumentAttributeUseCase: UpsertDocumentAttributeUseCase,
    private readonly listarDocumentNamingStandardsUseCase: ListarDocumentNamingStandardsUseCase,
    private readonly upsertDocumentNamingStandardUseCase: UpsertDocumentNamingStandardUseCase,
    private readonly createNamingStandardFromTemplateUseCase: CreateNamingStandardFromTemplateUseCase,
    private readonly obtenerNamingTemplatePreviewUseCase: ObtenerNamingTemplatePreviewUseCase,
    private readonly obtenerFolderNamingRuleUseCase: ObtenerFolderNamingRuleUseCase,
    private readonly upsertFolderNamingRuleUseCase: UpsertFolderNamingRuleUseCase,
    private readonly generarNombreDocumentoUseCase: GenerarNombreDocumentoUseCase,
    private readonly upsertDocumentMetadataUseCase: UpsertDocumentMetadataUseCase,
    private readonly obtenerDocumentMetadataUseCase: ObtenerDocumentMetadataUseCase,
    private readonly listarDocumentMetadataPorCarpetaUseCase: ListarDocumentMetadataPorCarpetaUseCase,
  ) {}

  @Get(':projectExternalId/attributes')
  @ApiOperation({ summary: 'Listar atributos de documentos del proyecto' })
  async listarAttributes(
    @Param('projectExternalId') projectExternalId: string,
    @Query() query: ListDocumentAttributesQueryDto,
  ) {
    const result = await this.listarDocumentAttributesUseCase.execute({
      projectExternalId,
      busqueda: query.busqueda,
      limit: query.limit,
      offset: query.offset,
    });

    return ApiResponseDto.paginated(
      result.data,
      {
        currentPage: result.pagination.current_page,
        itemsPerPage: result.pagination.limit,
        totalItems: result.pagination.total,
        totalPages: result.pagination.total_pages,
      },
      'Atributos obtenidos correctamente',
    );
  }

  @Post(':projectExternalId/attributes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear o actualizar atributo de documento' })
  async upsertAttribute(
    @Param('projectExternalId') projectExternalId: string,
    @Body() dto: UpsertDocumentAttributeDto,
    @Req() req: Request,
  ) {
    const userId = this.getUserId(req);
    const data = await this.upsertDocumentAttributeUseCase.execute({
      id: dto.id,
      projectExternalId,
      codigo: dto.codigo,
      nombre: dto.nombre,
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      esObligatorio: dto.esObligatorio,
      orden: dto.orden,
      opciones: dto.opciones,
      idUsuario: userId,
    });

    return ApiResponseDto.success(data, String(data.message ?? 'Atributo guardado'));
  }

  @Get(':projectExternalId/naming-standards')
  @ApiOperation({ summary: 'Listar nomenclaturas del proyecto' })
  async listarNamingStandards(
    @Param('projectExternalId') projectExternalId: string,
  ) {
    const data = await this.listarDocumentNamingStandardsUseCase.execute(
      projectExternalId,
    );
    return ApiResponseDto.success(data, 'Nomenclaturas obtenidas correctamente');
  }

  @Post(':projectExternalId/naming-standards')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear o actualizar nomenclatura' })
  async upsertNamingStandard(
    @Param('projectExternalId') projectExternalId: string,
    @Body() dto: UpsertDocumentNamingStandardDto,
    @Req() req: Request,
  ) {
    const userId = this.getUserId(req);
    const data = await this.upsertDocumentNamingStandardUseCase.execute({
      id: dto.id,
      projectExternalId,
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      separador: dto.separador,
      partes: dto.partes,
      idUsuario: userId,
    });

    return ApiResponseDto.success(
      data,
      String(data.message ?? 'Nomenclatura guardada'),
    );
  }

  @Post(':projectExternalId/naming-standards/from-template')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear nomenclatura desde plantilla (ISO 19650)' })
  async createNamingStandardFromTemplate(
    @Param('projectExternalId') projectExternalId: string,
    @Body() dto: CreateNamingStandardFromTemplateDto,
    @Req() req: Request,
  ) {
    const userId = this.getUserId(req);
    const data = await this.createNamingStandardFromTemplateUseCase.execute({
      projectExternalId,
      templateCode: dto.templateCode,
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      separador: dto.separador,
      idUsuario: userId,
    });

    return ApiResponseDto.success(
      data,
      String(data.message ?? 'Nomenclatura creada desde plantilla'),
    );
  }

  @Get(':projectExternalId/naming-templates/:templateCode/preview')
  @ApiOperation({ summary: 'Obtener vista previa de plantilla de nomenclatura' })
  async getNamingTemplatePreview(
    @Param('templateCode') templateCode: string,
  ) {
    const data = this.obtenerNamingTemplatePreviewUseCase.execute(templateCode);
    return ApiResponseDto.success(data, 'Plantilla obtenida correctamente');
  }

  @Get(':projectExternalId/folders/:folderExternalId/naming-rule')
  @ApiOperation({ summary: 'Obtener regla de nomenclatura de una carpeta' })
  async obtenerFolderNamingRule(
    @Param('projectExternalId') projectExternalId: string,
    @Param('folderExternalId') folderExternalId: string,
  ) {
    const data = await this.obtenerFolderNamingRuleUseCase.execute(
      projectExternalId,
      folderExternalId,
    );
    return ApiResponseDto.success(data, 'Regla de carpeta obtenida correctamente');
  }

  @Put(':projectExternalId/folders/:folderExternalId/naming-rule')
  @ApiOperation({ summary: 'Asignar nomenclatura a una carpeta' })
  async upsertFolderNamingRule(
    @Param('projectExternalId') projectExternalId: string,
    @Param('folderExternalId') folderExternalId: string,
    @Body() dto: UpsertFolderNamingRuleDto,
    @Req() req: Request,
  ) {
    const userId = this.getUserId(req);
    const data = await this.upsertFolderNamingRuleUseCase.execute({
      projectExternalId,
      folderExternalId,
      namingStandardId: dto.namingStandardId,
      idUsuario: userId,
    });

    return ApiResponseDto.success(
      data,
      String(data.message ?? 'Regla de carpeta guardada'),
    );
  }

  @Post(':projectExternalId/generate-name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar nombre de documento según nomenclatura' })
  async generarNombre(
    @Param('projectExternalId') projectExternalId: string,
    @Body() dto: GenerarNombreDocumentoDto,
  ) {
    const data = await this.generarNombreDocumentoUseCase.execute({
      projectExternalId,
      folderExternalId: dto.folderExternalId,
      valores: dto.valores,
      extension: dto.extension,
    });

    return ApiResponseDto.success(data, 'Nombre generado correctamente');
  }

  @Get(':projectExternalId/folders/:folderExternalId/metadata')
  @ApiOperation({ summary: 'Listar metadatos GVR de archivos en una carpeta' })
  async listarMetadataPorCarpeta(
    @Param('projectExternalId') projectExternalId: string,
    @Param('folderExternalId') folderExternalId: string,
  ) {
    const data = await this.listarDocumentMetadataPorCarpetaUseCase.execute(
      projectExternalId,
      folderExternalId,
    );
    return ApiResponseDto.success(data, 'Metadatos de carpeta obtenidos correctamente');
  }

  @Get(':projectExternalId/metadata/:itemExternalId')
  @ApiOperation({ summary: 'Obtener metadatos GVR de un documento' })
  async obtenerMetadata(
    @Param('projectExternalId') projectExternalId: string,
    @Param('itemExternalId') itemExternalId: string,
  ) {
    const data = await this.obtenerDocumentMetadataUseCase.execute(
      projectExternalId,
      itemExternalId,
    );
    return ApiResponseDto.success(data, 'Metadatos obtenidos correctamente');
  }

  @Post(':projectExternalId/metadata')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Guardar metadatos GVR tras subida a ACC' })
  async upsertMetadata(
    @Param('projectExternalId') projectExternalId: string,
    @Body() dto: UpsertDocumentMetadataDto,
    @Req() req: Request,
  ) {
    const userId = this.getUserId(req);
    const data = await this.upsertDocumentMetadataUseCase.execute({
      projectExternalId,
      folderExternalId: dto.folderExternalId,
      itemExternalId: dto.itemExternalId,
      versionExternalId: dto.versionExternalId,
      namingStandardId: dto.namingStandardId,
      nombreGenerado: dto.nombreGenerado,
      valores: dto.valores,
      idUsuario: userId,
    });

    return ApiResponseDto.success(
      data,
      String(data.message ?? 'Metadatos guardados'),
    );
  }

  private getUserId(req: Request): number {
    const user = req.user as { sub?: number; id?: number } | undefined;
    const userId = user?.sub ?? user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return userId;
  }
}
