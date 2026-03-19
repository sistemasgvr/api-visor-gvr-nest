import {
    Controller,
    Get,
    Post,
    Body,
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
import { ObtenerRevisionesUseCase } from '../../application/use-cases/acc/reviews/obtener-revisiones.use-case';
import { CrearRevisionUseCase } from '../../application/use-cases/acc/reviews/crear-revision.use-case';
import { ObtenerRevisionPorIdUseCase } from '../../application/use-cases/acc/reviews/obtener-revision-por-id.use-case';
import { ObtenerWorkflowRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-workflow-revision.use-case';
import { ObtenerProgresoRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-progreso-revision.use-case';
import { ObtenerVersionesRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-versiones-revision.use-case';

// DTOs
import { ObtenerRevisionesDto } from '../../application/dtos/acc/reviews/obtener-revisiones.dto';
import { CrearRevisionDto } from '../../application/dtos/acc/reviews/crear-revision.dto';

@Controller('acc/projects/:projectId/reviews')
export class AccReviewsController {
    constructor(
        private readonly obtenerRevisionesUseCase: ObtenerRevisionesUseCase,
        private readonly crearRevisionUseCase: CrearRevisionUseCase,
        private readonly obtenerRevisionPorIdUseCase: ObtenerRevisionPorIdUseCase,
        private readonly obtenerWorkflowRevisionUseCase: ObtenerWorkflowRevisionUseCase,
        private readonly obtenerProgresoRevisionUseCase: ObtenerProgresoRevisionUseCase,
        private readonly obtenerVersionesRevisionUseCase: ObtenerVersionesRevisionUseCase,
    ) { }

    /**
     * GET /acc/projects/:projectId/reviews
     * Lista todas las revisiones del proyecto con filtros opcionales
     */
    @Get()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async obtenerRevisiones(
        @Param('projectId') projectId: string,
        @Query() dto: ObtenerRevisionesDto,
        @Req() request: Request,
    ) {
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerRevisionesUseCase.execute(userId, projectId, dto);

        if (resultado?.pagination) {
            return ApiResponseDto.custom(
                resultado.results ?? resultado,
                'Revisiones obtenidas exitosamente',
                200,
                resultado.pagination,
            );
        }

        return ApiResponseDto.success(resultado, 'Revisiones obtenidas exitosamente');
    }

    /**
     * POST /acc/projects/:projectId/reviews
     * Crea una nueva revisión
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async crearRevision(
        @Param('projectId') projectId: string,
        @Body() dto: CrearRevisionDto,
        @Req() request: Request,
    ) {
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const ipAddress = request.ip ?? request.socket?.remoteAddress ?? '';
        const userAgent = request.headers['user-agent'] ?? '';

        const resultado = await this.crearRevisionUseCase.execute(
            userId,
            projectId,
            dto,
            ipAddress,
            userAgent,
        );

        return ApiResponseDto.created(resultado, 'Revisión creada exitosamente');
    }

    /**
     * GET /acc/projects/:projectId/reviews/:reviewId
     * Obtiene el detalle de una revisión
     */
    @Get(':reviewId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async obtenerRevisionPorId(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Req() request: Request,
    ) {
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');
        if (!reviewId)  throw new BadRequestException('El ID de la revisión es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerRevisionPorIdUseCase.execute(userId, projectId, reviewId);

        return ApiResponseDto.success(resultado, 'Revisión obtenida exitosamente');
    }

    /**
     * GET /acc/projects/:projectId/reviews/:reviewId/workflow
     * Obtiene el workflow de una revisión
     */
    @Get(':reviewId/workflow')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async obtenerWorkflowRevision(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Req() request: Request,
    ) {
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');
        if (!reviewId)  throw new BadRequestException('El ID de la revisión es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerWorkflowRevisionUseCase.execute(userId, projectId, reviewId);

        return ApiResponseDto.success(resultado, 'Workflow de revisión obtenido exitosamente');
    }

    /**
     * GET /acc/projects/:projectId/reviews/:reviewId/progress
     * Obtiene el progreso de una revisión
     */
    @Get(':reviewId/progress')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async obtenerProgresoRevision(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Req() request: Request,
    ) {
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');
        if (!reviewId)  throw new BadRequestException('El ID de la revisión es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerProgresoRevisionUseCase.execute(userId, projectId, reviewId);

        return ApiResponseDto.success(resultado, 'Progreso de revisión obtenido exitosamente');
    }

    /**
     * GET /acc/projects/:projectId/reviews/:reviewId/versions
     * Obtiene las versiones de documentos vinculados a una revisión
     */
    @Get(':reviewId/versions')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async obtenerVersionesRevision(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Req() request: Request,
    ) {
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');
        if (!reviewId)  throw new BadRequestException('El ID de la revisión es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerVersionesRevisionUseCase.execute(userId, projectId, reviewId);

        return ApiResponseDto.success(resultado, 'Versiones de revisión obtenidas exitosamente');
    }
}
