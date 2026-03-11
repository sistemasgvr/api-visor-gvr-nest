import {
    Controller,
    Get,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';

// Use Cases
import { ObtenerApprovalStatusesVersionUseCase } from '../../application/use-cases/acc/reviews/obtener-approval-statuses-version.use-case';

// DTOs
import { ObtenerApprovalStatusesDto } from '../../application/dtos/acc/reviews/obtener-approval-statuses.dto';

@Controller('acc/projects/:projectId/versions')
export class AccVersionsReviewsController {
    constructor(
        private readonly obtenerApprovalStatusesVersionUseCase: ObtenerApprovalStatusesVersionUseCase,
    ) { }

    /**
     * GET /acc/projects/:projectId/versions/:versionId/approval-statuses
     * Historial de revisiones y estado de aprobación de una versión de archivo
     */
    @Get(':versionId/approval-statuses')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async obtenerApprovalStatuses(
        @Param('projectId') projectId: string,
        @Param('versionId') versionId: string,
        @Query() dto: ObtenerApprovalStatusesDto,
        @Req() request: Request,
    ) {
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');
        if (!versionId) throw new BadRequestException('El ID de la versión es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerApprovalStatusesVersionUseCase.execute(
            userId,
            projectId,
            versionId,
            dto,
        );

        if (resultado?.pagination) {
            return ApiResponseDto.custom(
                resultado.results ?? resultado,
                'Approval statuses obtenidos exitosamente',
                200,
                resultado.pagination,
            );
        }

        return ApiResponseDto.success(resultado, 'Approval statuses obtenidos exitosamente');
    }
}
