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
    Res,
    BadRequestException,
    ParseIntPipe,
} from '@nestjs/common';
import type { Request, Response } from 'express';
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
import { IniciarPasoRevisionUseCase } from '../../application/use-cases/acc/reviews/iniciar-paso-revision.use-case';
import { DelegarPasoRevisionUseCase } from '../../application/use-cases/acc/reviews/delegar-paso-revision.use-case';
import { EnviarResenaPasoUseCase } from '../../application/use-cases/acc/reviews/enviar-resena-paso.use-case';
import { GetComentariosArchivoUseCase } from '../../application/use-cases/acc/reviews/get-comentarios-archivo.use-case';
import { AddComentarioArchivoUseCase } from '../../application/use-cases/acc/reviews/add-comentario-archivo.use-case';
import { AddComentarioArchivoDto } from '../../application/dtos/acc/reviews/add-comentario-archivo.dto';
import { ExportarRevisionesPdfUseCase } from '../../application/use-cases/acc/reviews/exportar-revisiones-pdf.use-case';
import { ExportarRevisionDetallePdfUseCase } from '../../application/use-cases/acc/reviews/exportar-revision-detalle-pdf.use-case';

// DTOs
import { ObtenerRevisionesDto } from '../../application/dtos/acc/reviews/obtener-revisiones.dto';
import { ExportarRevisionesPdfQueryDto } from '../../application/dtos/acc/reviews/exportar-revisiones-pdf-query.dto';
import { CrearRevisionDto } from '../../application/dtos/acc/reviews/crear-revision.dto';
import { AgregarReferenciaRevisionDto } from '../../application/dtos/acc/reviews/agregar-referencia-revision.dto';
import { AnularRevisionDto } from '../../application/dtos/acc/reviews/anular-revision.dto';
import { SaltarPasoRevisionDto } from '../../application/dtos/acc/reviews/saltar-paso-revision.dto';
import { VolverPasoAnteriorRevisionDto } from '../../application/dtos/acc/reviews/volver-paso-anterior-revision.dto';
import { EnviarResenaPasoDto } from '../../application/dtos/acc/reviews/enviar-resena-paso.dto';
import { NotificarRevisoresRevisionDto } from '../../application/dtos/acc/reviews/notificar-revisores-revision.dto';
import { NotificarRevisoresRevisionUseCase } from '../../application/use-cases/acc/reviews/notificar-revisores-revision.use-case';

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
        private readonly iniciarPasoRevisionUseCase: IniciarPasoRevisionUseCase,
        private readonly delegarPasoRevisionUseCase: DelegarPasoRevisionUseCase,
        private readonly enviarResenaPasoUseCase: EnviarResenaPasoUseCase,
        private readonly notificarRevisoresRevisionUseCase: NotificarRevisoresRevisionUseCase,
        private readonly getComentariosArchivoUseCase: GetComentariosArchivoUseCase,
        private readonly addComentarioArchivoUseCase: AddComentarioArchivoUseCase,
        private readonly exportarRevisionesPdfUseCase: ExportarRevisionesPdfUseCase,
        private readonly exportarRevisionDetallePdfUseCase: ExportarRevisionDetallePdfUseCase,
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
     * GET /acc/projects/:projectId/reviews/export/pdf
     * PDF del listado de revisiones con los mismos filtros opcionales que el listado (sin paginar en cliente).
     */
    @Get('export/pdf')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async exportarRevisionesPdf(
        @Param('projectId') projectId: string,
        @Query() query: ExportarRevisionesPdfQueryDto,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const userIdNumero = typeof userId === 'number' ? userId : parseInt(userId.toString(), 10);
        if (isNaN(userIdNumero) || userIdNumero <= 0) {
            throw new BadRequestException('User ID inv�lido');
        }

        const resultado = await this.exportarRevisionesPdfUseCase.execute(userIdNumero, projectId, query);

        response.setHeader('Content-Type', resultado.contentType);
        response.setHeader('Content-Disposition', `attachment; filename="${resultado.filename}"`);
        response.send(Buffer.from(resultado.data));
    }

    /**
     * POST /acc/projects/:projectId/reviews
     * Crea una nueva revisi?n
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

        return ApiResponseDto.created(resultado, 'Revisi?n creada exitosamente');
    }

    /**
     * GET /acc/projects/:projectId/reviews/:reviewId/export/pdf
     * PDF genérico con resumen, flujo, archivos, comentarios por archivo, referencias y actividad.
     */
    @Get(':reviewId/export/pdf')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async exportarRevisionDetallePdf(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');
        if (!reviewId) throw new BadRequestException('El ID de la revisi?n es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const userIdNumero = typeof userId === 'number' ? userId : parseInt(userId.toString(), 10);
        if (isNaN(userIdNumero) || userIdNumero <= 0) {
            throw new BadRequestException('User ID inválido');
        }

        const resultado = await this.exportarRevisionDetallePdfUseCase.execute(userIdNumero, projectId, reviewId);

        response.setHeader('Content-Type', resultado.contentType);
        response.setHeader('Content-Disposition', `attachment; filename="${resultado.filename}"`);
        response.send(Buffer.from(resultado.data));
    }

    /**
     * GET /acc/projects/:projectId/reviews/:reviewId
     * Obtiene el detalle de una revisi?n
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
        if (!reviewId)  throw new BadRequestException('El ID de la revisi?n es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerRevisionPorIdUseCase.execute(userId, projectId, reviewId);

        return ApiResponseDto.success(resultado, 'Revisi?n obtenida exitosamente');
    }

    /**
     * GET /acc/projects/:projectId/reviews/:reviewId/workflow
     * Obtiene el workflow de una revisi?n
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
        if (!reviewId)  throw new BadRequestException('El ID de la revisi?n es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerWorkflowRevisionUseCase.execute(userId, projectId, reviewId);

        return ApiResponseDto.success(resultado, 'Workflow de revisi?n obtenido exitosamente');
    }

    /**
     * GET /acc/projects/:projectId/reviews/:reviewId/progress
     * Obtiene el progreso de una revisi?n
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
        if (!reviewId)  throw new BadRequestException('El ID de la revisi?n es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerProgresoRevisionUseCase.execute(userId, projectId, reviewId);

        return ApiResponseDto.success(resultado, 'Progreso de revisi?n obtenido exitosamente');
    }

    /**
     * GET /acc/projects/:projectId/reviews/:reviewId/versions
     * Obtiene las versiones de documentos vinculados a una revisi?n
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
        if (!reviewId)  throw new BadRequestException('El ID de la revisi?n es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.obtenerVersionesRevisionUseCase.execute(userId, projectId, reviewId);

        return ApiResponseDto.success(resultado, 'Versiones de revisi?n obtenidas exitosamente');
    }

    /**
     * GET /acc/projects/:projectId/reviews/:reviewId/references
     * Lista las referencias de una revisi?n
     */
    @Get(':reviewId/references')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async obtenerReferenciasRevision(
        @Param('reviewId') reviewId: string,
        @Req() request: Request,
    ) {
        if (!reviewId) throw new BadRequestException('El ID de la revisi?n es requerido');

        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisi?n inv?lido');

        const resultado = await this.obtenerReferenciasRevisionUseCase.execute(idRevision);
        return ApiResponseDto.success(resultado, 'Referencias obtenidas exitosamente');
    }

    /**
     * POST /acc/projects/:projectId/reviews/:reviewId/references
     * Agrega una o varias referencias a una revisi?n
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
        if (!reviewId) throw new BadRequestException('El ID de la revisi?n es requerido');

        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisi?n inv?lido');

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
     * Elimina una referencia de una revisi?n
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
     * Anula completamente una revisi?n (Void entire review).
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
        if (!reviewId) throw new BadRequestException('El ID de la revisi?n es requerido');

        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisi?n inv?lido');
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
        if (!reviewId) throw new BadRequestException('El ID de la revisi?n es requerido');

        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisi?n inv?lido');
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.saltarPasoRevisionUseCase.execute(userId, projectId, idRevision, dto);
        return ApiResponseDto.success(resultado, resultado.message);
    }

    /**
     * POST /acc/projects/:projectId/reviews/:reviewId/return-step
     * Devuelve la revisi?n al paso anterior.
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
        if (!reviewId) throw new BadRequestException('El ID de la revisi?n es requerido');

        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisi?n inv?lido');
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');

        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.volverPasoAnteriorRevisionUseCase.execute(userId, projectId, idRevision, dto);
        return ApiResponseDto.success(resultado, resultado.message);
    }

    /** POST /acc/projects/:projectId/reviews/:reviewId/claim-step ��� Inicia / reclama el paso actual */
    @Post(':reviewId/claim-step')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async iniciarPasoRevision(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Req() request: Request,
    ) {
        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisi?n inv?lido');
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');
        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');
        const resultado = await this.iniciarPasoRevisionUseCase.execute(userId, projectId, idRevision);
        return ApiResponseDto.success(resultado, resultado.message);
    }

    /** POST /acc/projects/:projectId/reviews/:reviewId/delegate-step ��� Delega / libera el paso actual */
    @Post(':reviewId/delegate-step')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async delegarPasoRevision(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Req() request: Request,
    ) {
        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisi?n inv?lido');
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');
        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');
        const resultado = await this.delegarPasoRevisionUseCase.execute(userId, projectId, idRevision);
        return ApiResponseDto.success(resultado, resultado.message);
    }

    /** POST /acc/projects/:projectId/reviews/:reviewId/submit-step ��� Entrega la rese?a del paso actual */
    @Post(':reviewId/submit-step')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async enviarResenaPaso(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: EnviarResenaPasoDto,
        @Req() request: Request,
    ) {
        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisi?n inv?lido');
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');
        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');
        const resultado = await this.enviarResenaPasoUseCase.execute(userId, projectId, idRevision, dto);
        return ApiResponseDto.success(resultado, resultado.message);
    }

    /**
     * POST /acc/projects/:projectId/reviews/:reviewId/notify-reviewers
     * Encola correos a revisores (plantilla revision-reviewer-notify).
     */
    @Post(':reviewId/notify-reviewers')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async notificarRevisoresRevision(
        @Param('projectId') projectId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: NotificarRevisoresRevisionDto,
        @Req() request: Request,
    ) {
        if (!reviewId) throw new BadRequestException('El ID de la revisi?n es requerido');
        if (!projectId) throw new BadRequestException('El ID del proyecto es requerido');
        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');

        const resultado = await this.notificarRevisoresRevisionUseCase.execute(
            Number(userId),
            projectId,
            reviewId,
            dto,
        );
        return ApiResponseDto.success(resultado, 'Notificaciones encoladas correctamente');
    }

    /** GET /acc/projects/:projectId/reviews/:reviewId/files/:fileId/comments */
    @Get(':reviewId/files/:fileId/comments')
    @UseGuards(JwtAuthGuard)
    async getComentariosArchivo(
        @Param('reviewId') reviewId: string,
        @Param('fileId') fileId: string,
    ) {
        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        const idArchivo = parseInt(fileId, 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisi?n inv?lido');
        if (isNaN(idArchivo)) throw new BadRequestException('ID de archivo inv?lido');
        const data = await this.getComentariosArchivoUseCase.execute(idRevision, idArchivo);
        return ApiResponseDto.success(data);
    }

    /** POST /acc/projects/:projectId/reviews/:reviewId/files/:fileId/comments */
    @Post(':reviewId/files/:fileId/comments')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async addComentarioArchivo(
        @Param('reviewId') reviewId: string,
        @Param('fileId') fileId: string,
        @Body() dto: AddComentarioArchivoDto,
        @Req() request: Request,
    ) {
        const idRevision = parseInt(reviewId.replace(/^GVR-/i, ''), 10);
        const idArchivo = parseInt(fileId, 10);
        if (isNaN(idRevision)) throw new BadRequestException('ID de revisi?n inv?lido');
        if (isNaN(idArchivo)) throw new BadRequestException('ID de archivo inv?lido');
        const user = (request as any).user;
        const userId = user?.sub || user?.id;
        if (!userId) throw new BadRequestException('User ID es requerido');
        const resultado = await this.addComentarioArchivoUseCase.execute(userId, idRevision, idArchivo, dto);
        return ApiResponseDto.success(resultado, resultado.message);
    }
}
