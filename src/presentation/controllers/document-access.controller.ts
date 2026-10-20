import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { DocumentAccessService } from '../../application/services/document-access.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import { AuthenticatedAccess } from '../../infrastructure/auth/granular-permission.guard';

@ApiTags('gestion-bim')
@ApiBearerAuth('access-token')
@Controller('gestion-bim/documentos')
@UseGuards(JwtAuthGuard)
export class DocumentAccessController {
  constructor(private readonly access: DocumentAccessService) {}

  @ApiOperation({
    summary:
      'Nivel efectivo de la sesión en un proyecto o carpeta (sólo para presentar acciones; cada operación se valida de nuevo)',
  })
  @Get('acceso')
  @AuthenticatedAccess(
    'Nivel documental de la propia persona en un proyecto/carpeta',
  )
  async current(
    @Req() request: Request,
    @Query('projectId') projectId?: string,
    @Query('folderId') folderId?: string,
  ) {
    const actor = request.user?.sub;
    if (!Number.isSafeInteger(actor) || (actor as number) < 1)
      throw new UnauthorizedException('Sesión inválida');
    if (typeof projectId !== 'string' || !projectId.trim())
      throw new BadRequestException('projectId es requerido');
    return ApiResponseDto.success(
      await this.access.forFolder(
        actor as number,
        projectId.trim(),
        typeof folderId === 'string' && folderId.trim()
          ? folderId.trim()
          : null,
      ),
    );
  }
}
