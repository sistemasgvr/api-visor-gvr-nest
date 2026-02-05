import {
    Controller,
    Get,
    Post,
    Head,
    Options,
    Param,
    Req,
    Res,
    HttpStatus,
    UseGuards,
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
    Inject,
    Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import type { IAccRepository } from '../../domain/repositories/acc.repository.interface';

@Controller('office-documents')
export class OfficeDocumentController {
    private readonly logger = new Logger(OfficeDocumentController.name);

    constructor(
        private readonly documentTokenService: DocumentTokenService,
        private readonly autodeskApiService: AutodeskApiService,
        private readonly configService: ConfigService,
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
     * OPTIONS - Preflight para CORS
     * OPTIONS /api/office-documents/view/:token
     */
    @Options('view/:token')
    async viewDocumentOptions(
        @Res() res: Response,
    ) {
        this.logger.log('OPTIONS request recibido para view document');
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400',
        });
        res.status(HttpStatus.NO_CONTENT).send();
    }

    /**
     * HEAD - Microsoft Office hace HEAD antes de GET
     * HEAD /api/office-documents/view/:token
     */
    @Head('view/:token')
    async viewDocumentHead(
        @Param('token') token: string,
        @Res() res: Response,
    ) {
        this.logger.log(`HEAD request recibido para token: ${token.substring(0, 8)}...`);
        
        const tokenData = this.documentTokenService.validateToken(token);

        if (!tokenData) {
            this.logger.warn('Token inválido o expirado en HEAD request');
            throw new NotFoundException('Token inválido o expirado');
        }

        const contentType = this.getContentType(tokenData.fileName);

        res.set({
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
        });
        res.status(HttpStatus.OK).send();
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
        this.logger.log(`GET request recibido para token: ${token.substring(0, 8)}...`);
        
        // Validar el token
        const tokenData = this.documentTokenService.validateToken(token);

        if (!tokenData) {
            this.logger.warn(`Token inválido o expirado: ${token.substring(0, 8)}...`);
            throw new NotFoundException('Token inválido o expirado');
        }

        this.logger.log(`Token válido para archivo: ${tokenData.fileName}, userId: ${tokenData.userId}`);

        try {
            // Obtener el token de Autodesk del usuario
            const accToken = await this.accRepository.obtenerToken3LeggedPorUsuario(tokenData.userId);

            if (!accToken) {
                this.logger.error('Token de Autodesk no disponible para el usuario');
                throw new UnauthorizedException('Token de Autodesk no disponible');
            }

            // Verificar si el token de Autodesk expiró
            if (this.autodeskApiService.esTokenExpirado(accToken.expiraEn)) {
                this.logger.error('Token de Autodesk expirado');
                throw new UnauthorizedException('Token de Autodesk expirado');
            }

            this.logger.log(`Descargando archivo de Autodesk: ${tokenData.itemId}`);

            // Descargar el archivo de Autodesk (descargarItem devuelve { data, fileName, storageId })
            const resultado = await this.autodeskApiService.descargarItem(
                accToken.tokenAcceso,
                tokenData.projectId,
                tokenData.itemId,
            );

            const fileBuffer = resultado?.data ?? resultado?.fileBuffer;
            if (!fileBuffer) {
                this.logger.error('No se pudo obtener el buffer del archivo');
                throw new NotFoundException('No se pudo obtener el archivo');
            }

            const bufferLength = Buffer.isBuffer(fileBuffer) ? fileBuffer.length : (fileBuffer as ArrayBuffer).byteLength;
            this.logger.log(`Archivo descargado exitosamente, tamaño: ${bufferLength} bytes`);

            // Determinar el content-type basado en la extensión
            const contentType = this.getContentType(tokenData.fileName);

            // Configurar headers para que Microsoft Office pueda leer el archivo
            res.set({
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${encodeURIComponent(tokenData.fileName)}"`,
                'Content-Length': bufferLength,
                // Headers importantes para CORS con Microsoft Office
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': '*',
                // Cache corto para evitar problemas
                'Cache-Control': 'private, max-age=300',
            });

            this.logger.log(`Enviando archivo con Content-Type: ${contentType}`);

            // Enviar el archivo (asegurar Buffer para res.send)
            const toSend = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer as ArrayBuffer);
            res.status(HttpStatus.OK).send(toSend);
        } catch (error: any) {
            this.logger.error(`Error sirviendo documento: ${error?.message}`, error?.stack);
            if (error?.status) {
                throw error;
            }
            if (error?.message?.includes('No se pudo obtener') || error?.message?.includes('No se encontró') || error?.message?.includes('inválido')) {
                throw new NotFoundException(error.message || 'No se pudo obtener el archivo');
            }
            throw new BadRequestException(error?.message || 'Error al obtener el documento');
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

    private getBaseUrl(request: Request): string {
        const forwardedProto = (request.headers['x-forwarded-proto'] as string) || request.protocol;
        const forwardedHost = (request.headers['x-forwarded-host'] as string) || request.get('host');
        return `${forwardedProto}://${forwardedHost}`;
    }
}
