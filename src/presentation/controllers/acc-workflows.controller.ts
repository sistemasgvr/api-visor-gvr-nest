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

// DTOs
import { ObtenerWorkflowsDto } from '../../application/dtos/acc/reviews/obtener-workflows.dto';
import { CrearWorkflowDto } from '../../application/dtos/acc/reviews/crear-workflow.dto';

@Controller('acc/projects/:projectId/workflows')
export class AccWorkflowsController {
    constructor(
        private readonly obtenerWorkflowsUseCase: ObtenerWorkflowsUseCase,
        private readonly obtenerWorkflowPorIdUseCase: ObtenerWorkflowPorIdUseCase,
        private readonly crearWorkflowUseCase: CrearWorkflowUseCase,
    ) { }

    /**
     * GET /acc/projects/:projectId/workflows
     * Lista los approval workflows del proyecto
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
     * Obtiene el detalle de un approval workflow
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
     * Crea un nuevo approval workflow
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

        const resultado = await this.crearWorkflowUseCase.execute(userId, projectId, dto);

        return ApiResponseDto.created(resultado, 'Workflow creado exitosamente');
    }
}
