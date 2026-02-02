import {
    Controller,
    Get,
    Post,
    Param,
    Req,
    Res,
    HttpStatus,
    UseGuards,
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import type { IAccRepository } from '../../domain/repositories/acc.repository.interface';

@Controller('office-documents')
export class OfficeDocumentController {
    constructor(
        private readonly documentTokenService: DocumentTokenService,
        private readonly autodeskApiService: AutodeskApiService,
        @Inject(ACC_REPOSITORY)
        private readonly accRepository: IAccRepository,
    ) { }

    /**
     * POST - Genera un token temporal para acceder a un documento
     * Este endpoint SÍ requiere autenticación JWT
     * POST /api/office-documents/generate-token/:projectId/:itemId
     */
    @Post('generate-token/:projectId/:itemId')
    @UseGuards(JwtAuthGuard)
    async generateToken(
        @Req() request: Request,
        @Param('projectId') projectId: string,
        @Param('itemId') itemId: string,
    ) {
        const user = (request as any).user;

        if (!user?.sub) {
            throw new UnauthorizedException('Usuario no autenticado');
        }

        // Obtener información del archivo para el nombre
        const accToken = await this.accRepository.obtenerToken3LeggedPorUsuario(user.sub);
        if (!accToken) {
            throw new UnauthorizedException('No se encontró token de Autodesk');
        }

        let fileName = 'documento';
        try {
            const itemInfo = await this.autodeskApiService.obtenerItemPorId(
                accToken.tokenAcceso,
                projectId,
                itemId,
            );
            fileName = itemInfo.data?.attributes?.displayName || 'documento';
        } catch (error) {
            // Si falla obtener el nombre, usar uno genérico
        }

        const token = this.documentTokenService.generateToken(
            user.sub,
            projectId,
            itemId,
            fileName,
        );

        return {
            status: 200,
            data: {
                token,
                fileName,
                // URL pública para Microsoft Office
                viewUrl: `/api/office-documents/view/${token}`,
            },
            message: 'Token generado exitosamente',
        };
    }

    /**
     * GET - Sirve el documento para Microsoft Office
     * Este endpoint NO requiere autenticación JWT (es público)
     * GET /api/office-documents/view/:token
     */
    @Get('view/:token')
    async viewDocument(
        @Param('token') token: string,
        @Res() res: Response,
    ) {
        // Validar el token
        const tokenData = this.documentTokenService.validateToken(token);

        if (!tokenData) {
            throw new NotFoundException('Token inválido o expirado');
        }

        try {
            // Obtener el token de Autodesk del usuario
            const accToken = await this.accRepository.obtenerToken3LeggedPorUsuario(tokenData.userId);

            if (!accToken) {
                throw new UnauthorizedException('Token de Autodesk no disponible');
            }

            // Verificar si el token de Autodesk expiró
            if (this.autodeskApiService.esTokenExpirado(accToken.expiraEn)) {
                throw new UnauthorizedException('Token de Autodesk expirado');
            }

            // Descargar el archivo de Autodesk
            const resultado = await this.autodeskApiService.descargarItem(
                accToken.tokenAcceso,
                tokenData.projectId,
                tokenData.itemId,
            );

            if (!resultado.fileBuffer) {
                throw new NotFoundException('No se pudo obtener el archivo');
            }

            // Determinar el content-type basado en la extensión
            const contentType = this.getContentType(tokenData.fileName);

            // Configurar headers para que Microsoft Office pueda leer el archivo
            res.set({
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${encodeURIComponent(tokenData.fileName)}"`,
                'Content-Length': resultado.fileBuffer.length,
                // Headers importantes para CORS con Microsoft Office
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': '*',
                // Cache corto para evitar problemas
                'Cache-Control': 'private, max-age=300',
            });

            // Enviar el archivo
            res.status(HttpStatus.OK).send(resultado.fileBuffer);
        } catch (error: any) {
            console.error('Error sirviendo documento:', error.message);
            
            if (error.status) {
                throw error;
            }
            
            throw new BadRequestException('Error al obtener el documento');
        }
    }

    /**
     * HEAD - Microsoft Office a veces hace peticiones HEAD primero
     * GET /api/office-documents/view/:token
     */
    @Get('view/:token/info')
    async documentInfo(
        @Param('token') token: string,
    ) {
        const tokenData = this.documentTokenService.validateToken(token);

        if (!tokenData) {
            throw new NotFoundException('Token inválido o expirado');
        }

        return {
            fileName: tokenData.fileName,
            contentType: this.getContentType(tokenData.fileName),
            expiresAt: tokenData.expiresAt,
        };
    }

    /**
     * Determina el content-type basado en la extensión del archivo
     */
    private getContentType(fileName: string): string {
        const ext = fileName.toLowerCase().split('.').pop();

        const contentTypes: Record<string, string> = {
            // Word
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'docm': 'application/vnd.ms-word.document.macroEnabled.12',
            // Excel
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xlsm': 'application/vnd.ms-excel.sheet.macroEnabled.12',
            'csv': 'text/csv',
            // PowerPoint
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'pptm': 'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
            // Otros
            'pdf': 'application/pdf',
            'txt': 'text/plain',
        };

        return contentTypes[ext || ''] || 'application/octet-stream';
    }
}
