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
import { ObtenerWorkflowsUseCase } from '../../application/use-cases/acc/reviews/obtener-workflows.use-case';
import { ObtenerWorkflowPorIdUseCase } from '../../application/use-cases/acc/reviews/obtener-workflow-por-id.use-case';
import { CrearWorkflowUseCase } from '../../application/use-cases/acc/reviews/crear-workflow.use-case';
import { GuardarWorkflowCandidatosUseCase, type GuardarWorkflowCandidatosDto } from '../../application/use-cases/acc/reviews/guardar-workflow-candidatos.use-case';
import { ObtenerWorkflowCandidatosUseCase } from '../../application/use-cases/acc/reviews/obtener-workflow-candidatos.use-case';

// DTOs
import { ObtenerWorkflowsDto } from '../../application/dtos/acc/reviews/obtener-workflows.dto';
import { CrearWorkflowDto } from '../../application/dtos/acc/reviews/crear-workflow.dto';

@Controller('acc/projects/:projectId/workflows')
export class AccWorkflowsController {
    constructor(
        private readonly obtenerWorkflowsUseCase: ObtenerWorkflowsUseCase,
        private readonly obtenerWorkflowPorIdUseCase: ObtenerWorkflowPorIdUseCase,
        private readonly crearWorkflowUseCase: CrearWorkflowUseCase,
        private readonly guardarWorkflowCandidatosUseCase: GuardarWorkflowCandidatosUseCase,
        private readonly obtenerWorkflowCandidatosUseCase: ObtenerWorkflowCandidatosUseCase,
    ) { }

    /**
     * GET /acc/projects/:projectId/workflows
     */
    @Get()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async obtenerWorkflows(
        @Param('projectId') projectId: string,
        @Query() dto: ObtenerWorkflowsDto,
        @Req() request: Request,
    ) {
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerWorkflowsUseCase.execute(userId, projectId, dto);

        if (resultado?.pagination) {
            return ApiResponseDto.custom(
                resultado.results ?? resultado,
                'Workflows obtenidos exitosamente',
                200,
                resultado.pagination,
            );
        }

        return ApiResponseDto.success(resultado, 'Workflows obtenidos exitosamente');
    }

    /**
     * GET /acc/projects/:projectId/workflows/:workflowId
     */
    @Get(':workflowId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async obtenerWorkflowPorId(
        @Param('projectId') projectId: string,
        @Param('workflowId') workflowId: string,
        @Req() request: Request,
    ) {
        if (!projectId)  throw new BadRequestException('El ID del proyecto es requerido');
        if (!workflowId) throw new BadRequestException('El ID del workflow es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerWorkflowPorIdUseCase.execute(userId, projectId, workflowId);
        return ApiResponseDto.success(resultado, 'Workflow obtenido exitosamente');
    }

    /**
     * POST /acc/projects/:projectId/workflows
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async crearWorkflow(
        @Param('projectId') projectId: string,
        @Body() dto: CrearWorkflowDto,
        @Req() request: Request,
    ) {
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const ipAddress = (request as any).ip || request.socket?.remoteAddress || '';
        const userAgent = request.headers['user-agent'] || '';

        const resultado = await this.crearWorkflowUseCase.execute(
            userId,
            projectId,
            dto,
            ipAddress,
            userAgent,
        );

        return ApiResponseDto.created(resultado, 'Workflow creado exitosamente');
    }

    /**
     * POST /acc/projects/:projectId/workflows/:workflowId/candidatos
     * Guarda los candidatos internos GVR de un workflow
     */
    @Post(':workflowId/candidatos')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async guardarCandidatos(
        @Param('projectId') projectId: string,
        @Param('workflowId') workflowId: string,
        @Body() dto: GuardarWorkflowCandidatosDto,
        @Req() request: Request,
    ) {
        if (!projectId)  throw new BadRequestException('El ID del proyecto es requerido');
        if (!workflowId) throw new BadRequestException('El ID del workflow es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.guardarWorkflowCandidatosUseCase.execute(
            workflowId,
            projectId,
            dto,
            userId,
        );

        return ApiResponseDto.success(resultado, 'Candidatos guardados exitosamente');
    }

    /**
     * GET /acc/projects/:projectId/workflows/:workflowId/candidatos
     * Lista los candidatos internos GVR de un workflow
     */
    @Get(':workflowId/candidatos')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async obtenerCandidatos(
        @Param('projectId') projectId: string,
        @Param('workflowId') workflowId: string,
    ) {
        if (!projectId)  throw new BadRequestException('El ID del proyecto es requerido');
        if (!workflowId) throw new BadRequestException('El ID del workflow es requerido');

        const resultado = await this.obtenerWorkflowCandidatosUseCase.execute(
            workflowId,
            projectId,
        );

        return ApiResponseDto.success(resultado, 'Candidatos obtenidos exitosamente');
    }
}
