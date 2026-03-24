import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
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
import { CrearFlujoRevisionGvrUseCase } from '../../application/use-cases/acc/reviews/crear-flujo-revision-gvr.use-case';
import { ActualizarFlujoRevisionGvrUseCase } from '../../application/use-cases/acc/reviews/actualizar-flujo-revision-gvr.use-case';
import { CambiarEstadoFlujoGvrUseCase } from '../../application/use-cases/acc/reviews/cambiar-estado-flujo-gvr.use-case';
import { GuardarWorkflowCandidatosUseCase, type GuardarWorkflowCandidatosDto } from '../../application/use-cases/acc/reviews/guardar-workflow-candidatos.use-case';
import { ObtenerWorkflowCandidatosUseCase } from '../../application/use-cases/acc/reviews/obtener-workflow-candidatos.use-case';

// DTOs
import { ObtenerWorkflowsDto } from '../../application/dtos/acc/reviews/obtener-workflows.dto';
import { CrearWorkflowDto } from '../../application/dtos/acc/reviews/crear-workflow.dto';
import { CambiarEstadoWorkflowDto } from '../../application/dtos/acc/reviews/cambiar-estado-workflow.dto';

@Controller('acc/projects/:projectId/workflows')
export class AccWorkflowsController {
    constructor(
        private readonly obtenerWorkflowsUseCase: ObtenerWorkflowsUseCase,
        private readonly obtenerWorkflowPorIdUseCase: ObtenerWorkflowPorIdUseCase,
        private readonly crearFlujoRevisionGvrUseCase: CrearFlujoRevisionGvrUseCase,
        private readonly actualizarFlujoRevisionGvrUseCase: ActualizarFlujoRevisionGvrUseCase,
        private readonly cambiarEstadoFlujoGvrUseCase: CambiarEstadoFlujoGvrUseCase,
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
     * GET /acc/projects/:projectId/workflows/:workflowId/candidatos
     * (Ruta más específica antes que :workflowId)
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

    /**
     * PATCH /acc/projects/:projectId/workflows/:workflowId/status
     * Activo / Borrador (flujos GVR numéricos)
     */
    @Patch(':workflowId/status')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async cambiarEstadoWorkflow(
        @Param('projectId') projectId: string,
        @Param('workflowId') workflowId: string,
        @Body() dto: CambiarEstadoWorkflowDto,
        @Req() request: Request,
    ) {
        if (!projectId)  throw new BadRequestException('El ID del proyecto es requerido');
        if (!workflowId) throw new BadRequestException('El ID del workflow es requerido');

        const user = (request as any).user;
        if (!user?.sub && !user?.id) throw new BadRequestException('User ID es requerido');

        const resultado = await this.cambiarEstadoFlujoGvrUseCase.execute(projectId, workflowId, dto);
        return ApiResponseDto.success(resultado, 'Estado del flujo actualizado');
    }

    /**
     * PUT /acc/projects/:projectId/workflows/:workflowId
     * Actualización completa (flujos GVR numéricos)
     */
    @Put(':workflowId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async actualizarWorkflow(
        @Param('projectId') projectId: string,
        @Param('workflowId') workflowId: string,
        @Body() dto: CrearWorkflowDto,
        @Req() request: Request,
    ) {
        if (!projectId)  throw new BadRequestException('El ID del proyecto es requerido');
        if (!workflowId) throw new BadRequestException('El ID del workflow es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.actualizarFlujoRevisionGvrUseCase.execute(
            userId,
            projectId,
            workflowId,
            dto,
        );

        return ApiResponseDto.success(
            {
                id: resultado.id,
                name: resultado.name,
                idProyectoAcc: resultado.idProyectoAcc,
                mensaje: resultado.mensaje,
            },
            'Flujo de trabajo actualizado exitosamente',
        );
    }

    /**
     * GET /acc/projects/:projectId/workflows/:workflowId
     * GVR (id numérico) desde BD; si no, Autodesk.
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

        const resultado = await this.crearFlujoRevisionGvrUseCase.execute(userId, projectId, dto);

        return ApiResponseDto.created(
            {
                id: resultado.id,
                name: resultado.name,
                idProyectoAcc: resultado.idProyectoAcc,
                mensaje: resultado.mensaje,
            },
            'Flujo de trabajo creado exitosamente',
        );
    }

    /**
     * POST /acc/projects/:projectId/workflows/:workflowId/candidatos
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
}
