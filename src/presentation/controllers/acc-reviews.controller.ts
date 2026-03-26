import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    BadRequestException,
    ParseIntPipe,
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
import { ObtenerReferenciasRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-referencias-revision.use-case';
import { AgregarReferenciaRevisionUseCase } from '../../application/use-cases/acc/reviews/agregar-referencia-revision.use-case';
import { EliminarReferenciaRevisionUseCase } from '../../application/use-cases/acc/reviews/eliminar-referencia-revision.use-case';
import { AnularRevisionEntireUseCase } from '../../application/use-cases/acc/reviews/anular-revision-entire.use-case';
import { SaltarPasoRevisionUseCase } from '../../application/use-cases/acc/reviews/saltar-paso-revision.use-case';
import { VolverPasoAnteriorRevisionUseCase } from '../../application/use-cases/acc/reviews/volver-paso-anterior-revision.use-case';

// DTOs
import { ObtenerRevisionesDto } from '../../application/dtos/acc/reviews/obtener-revisiones.dto';
import { CrearRevisionDto } from '../../application/dtos/acc/reviews/crear-revision.dto';
import { AgregarReferenciaRevisionDto } from '../../application/dtos/acc/reviews/agregar-referencia-revision.dto';
import { AnularRevisionDto } from '../../application/dtos/acc/reviews/anular-revision.dto';
import { SaltarPasoRevisionDto } from '../../application/dtos/acc/reviews/saltar-paso-revision.dto';
import { VolverPasoAnteriorRevisionDto } from '../../application/dtos/acc/reviews/volver-paso-anterior-revision.dto';

@Controller('acc/projects/:projectId/reviews')
export class AccReviewsController {
    constructor(
        private readonly obtenerRevisionesUseCase: ObtenerRevisionesUseCase,
        private readonly crearRevisionUseCase: CrearRevisionUseCase,
        private readonly obtenerRevisionPorIdUseCase: ObtenerRevisionPorIdUseCase,
        private readonly obtenerWorkflowRevisionUseCase: ObtenerWorkflowRevisionUseCase,
        private readonly obtenerProgresoRevisionUseCase: ObtenerProgresoRevisionUseCase,
        private readonly obtenerVersionesRevisionUseCase: ObtenerVersionesRevisionUseCase,
        private readonly obtenerReferenciasRevisionUseCase: ObtenerReferenciasRevisionUseCase,
        private readonly agregarReferenciaRevisionUseCase: AgregarReferenciaRevisionUseCase,
        private readonly eliminarReferenciaRevisionUseCase: EliminarReferenciaRevisionUseCase,
        private readonly anularRevisionEntireUseCase: AnularRevisionEntireUseCase,
        private readonly saltarPasoRevisionUseCase: SaltarPasoRevisionUseCase,
        private readonly volverPasoAnteriorRevisionUseCase: VolverPasoAnteriorRevisionUseCase,
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

    /**
     * GET /acc/projects/:projectId/reviews/:reviewId/references
     * Lista las referencias de una revisión
     */
    @Get(':reviewId/references')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async obtenerReferenciasRevision(
        @Param('reviewId') reviewId: string,
        @Req() request: Request,
    ) {
        if (!reviewId) throw new BadRequestException('El ID de la revisión es requerido');

        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisión inválido');

        const resultado = await this.obtenerReferenciasRevisionUseCase.execute(idRevision);
        return ApiResponseDto.success(resultado, 'Referencias obtenidas exitosamente');
    }

    /**
     * POST /acc/projects/:projectId/reviews/:reviewId/references
     * Agrega una o varias referencias a una revisión
     */
    @Post(':reviewId/references')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async agregarReferenciasRevision(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: AgregarReferenciaRevisionDto | AgregarReferenciaRevisionDto[],
        @Req() request: Request,
    ) {
        if (!reviewId) throw new BadRequestException('El ID de la revisión es requerido');

        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisión inválido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const items = Array.isArray(dto) ? dto : [dto];
        const resultados = await Promise.all(
            items.map((item) => this.agregarReferenciaRevisionUseCase.execute(idRevision, projectId, item, userId))
        );

        return ApiResponseDto.created(resultados, 'Referencia(s) agregada(s) exitosamente');
    }

    /**
     * DELETE /acc/projects/:projectId/reviews/:reviewId/references/:refId
     * Elimina una referencia de una revisión
     */
    @Delete(':reviewId/references/:refId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async eliminarReferenciaRevision(
        @Param('refId', ParseIntPipe) refId: number,
        @Req() request: Request,
    ) {
        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.eliminarReferenciaRevisionUseCase.execute(refId, userId);
        return ApiResponseDto.success(resultado, resultado.message);
    }

    /**
     * POST /acc/projects/:projectId/reviews/:reviewId/void
     * Anula completamente una revisión (Void entire review).
     */
    @Post(':reviewId/void')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async anularRevisionEntire(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: AnularRevisionDto,
        @Req() request: Request,
    ) {
        if (!reviewId) throw new BadRequestException('El ID de la revisión es requerido');

        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisión inválido');
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.anularRevisionEntireUseCase.execute(userId, projectId, idRevision, dto);
        return ApiResponseDto.success(resultado, resultado.message);
    }

    /**
     * POST /acc/projects/:projectId/reviews/:reviewId/skip-step
     * Salta el paso actual y avanza al siguiente.
     */
    @Post(':reviewId/skip-step')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async saltarPasoRevision(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: SaltarPasoRevisionDto,
        @Req() request: Request,
    ) {
        if (!reviewId) throw new BadRequestException('El ID de la revisión es requerido');

        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisión inválido');
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.saltarPasoRevisionUseCase.execute(userId, projectId, idRevision, dto);
        return ApiResponseDto.success(resultado, resultado.message);
    }

    /**
     * POST /acc/projects/:projectId/reviews/:reviewId/return-step
     * Devuelve la revisión al paso anterior.
     */
    @Post(':reviewId/return-step')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async volverPasoAnterior(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: VolverPasoAnteriorRevisionDto,
        @Req() request: Request,
    ) {
        if (!reviewId) throw new BadRequestException('El ID de la revisión es requerido');

        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisión inválido');
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.volverPasoAnteriorRevisionUseCase.execute(userId, projectId, idRevision, dto);
        return ApiResponseDto.success(resultado, resultado.message);
    }
}
