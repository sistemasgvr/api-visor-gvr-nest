import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    Req,
    UseGuards,
    UnauthorizedException,
    ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { ListarProyectosUseCase } from '../../application/use-cases/proyecto/listar-proyectos.use-case';
import { ObtenerProyectoUseCase } from '../../application/use-cases/proyecto/obtener-proyecto.use-case';
import { CrearProyectoUseCase } from '../../application/use-cases/proyecto/crear-proyecto.use-case';
import { EditarProyectoUseCase } from '../../application/use-cases/proyecto/editar-proyecto.use-case';
import { EliminarProyectoUseCase } from '../../application/use-cases/proyecto/eliminar-proyecto.use-case';
import { ListarUsuariosProyectoUseCase } from '../../application/use-cases/proyecto/listar-usuarios-proyecto.use-case';
import { AsignarAccesoProyectoUseCase } from '../../application/use-cases/proyecto/asignar-acceso-proyecto.use-case';
import { ActualizarNivelAccesoProyectoUseCase } from '../../application/use-cases/proyecto/actualizar-nivel-acceso-proyecto.use-case';
import { RemoverAccesoProyectoUseCase } from '../../application/use-cases/proyecto/remover-acceso-proyecto.use-case';
import { ListarUsuariosDisponiblesProyectoUseCase } from '../../application/use-cases/proyecto/listar-usuarios-disponibles-proyecto.use-case';
import { ListarDocumentosProyectoUseCase } from '../../application/use-cases/proyecto/listar-documentos-proyecto.use-case';
import { CrearDocumentoProyectoUseCase } from '../../application/use-cases/proyecto/crear-documento-proyecto.use-case';
import { ActualizarDocumentoProyectoUseCase } from '../../application/use-cases/proyecto/actualizar-documento-proyecto.use-case';
import { EliminarDocumentoProyectoUseCase } from '../../application/use-cases/proyecto/eliminar-documento-proyecto.use-case';
import { CreateProyectoDto } from '../../application/dtos/proyecto/create-proyecto.dto';
import { UpdateProyectoDto } from '../../application/dtos/proyecto/update-proyecto.dto';
import { AsignarAccesoProyectoDto } from '../../application/dtos/proyecto/asignar-acceso-proyecto.dto';
import { ActualizarNivelAccesoProyectoDto } from '../../application/dtos/proyecto/actualizar-nivel-acceso-proyecto.dto';
import { CreateDocumentoProyectoDto } from '../../application/dtos/proyecto/create-documento-proyecto.dto';
import { UpdateDocumentoProyectoDto } from '../../application/dtos/proyecto/update-documento-proyecto.dto';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('proyectos')
@UseGuards(JwtAuthGuard)
export class ProyectoController {
    constructor(
        private readonly listarProyectosUseCase: ListarProyectosUseCase,
        private readonly obtenerProyectoUseCase: ObtenerProyectoUseCase,
        private readonly crearProyectoUseCase: CrearProyectoUseCase,
        private readonly editarProyectoUseCase: EditarProyectoUseCase,
        private readonly eliminarProyectoUseCase: EliminarProyectoUseCase,
        private readonly listarUsuariosProyectoUseCase: ListarUsuariosProyectoUseCase,
        private readonly asignarAccesoProyectoUseCase: AsignarAccesoProyectoUseCase,
        private readonly actualizarNivelAccesoProyectoUseCase: ActualizarNivelAccesoProyectoUseCase,
        private readonly removerAccesoProyectoUseCase: RemoverAccesoProyectoUseCase,
        private readonly listarUsuariosDisponiblesProyectoUseCase: ListarUsuariosDisponiblesProyectoUseCase,
        private readonly listarDocumentosProyectoUseCase: ListarDocumentosProyectoUseCase,
        private readonly crearDocumentoProyectoUseCase: CrearDocumentoProyectoUseCase,
        private readonly actualizarDocumentoProyectoUseCase: ActualizarDocumentoProyectoUseCase,
        private readonly eliminarDocumentoProyectoUseCase: EliminarDocumentoProyectoUseCase,
        private readonly jwtService: JwtService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async listarProyectos(
        @Req() request: Request,
        @Query('idTipoProyecto', new ParseIntPipe({ optional: true })) idTipoProyecto?: number,
        @Query('idPais', new ParseIntPipe({ optional: true })) idPais?: number,
        @Query('busqueda') busqueda?: string,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
        @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    ) {
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('Token no proporcionado');
        }

        const payload = await this.jwtService.verifyAsync(token);
        const idUsuario = payload.sub;

        const data = await this.listarProyectosUseCase.execute({
            idUsuario,
            idTipoProyecto,
            idPais,
            busqueda,
            limit,
            offset,
        });

        return ApiResponseDto.success(data, 'Proyectos obtenidos exitosamente');
    }

    @Get(':id/usuarios/available')
    @HttpCode(HttpStatus.OK)
    async listarUsuariosDisponiblesProyecto(
        @Param('id', ParseIntPipe) id: number,
        @Query('busqueda') busqueda?: string,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
        @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    ) {
        const data = await this.listarUsuariosDisponiblesProyectoUseCase.execute({
            idProyecto: id,
            busqueda: busqueda ?? '',
            limit,
            offset,
        });
        return ApiResponseDto.success(data, 'Usuarios disponibles obtenidos');
    }

    @Get(':id/usuarios')
    @HttpCode(HttpStatus.OK)
    async listarUsuariosProyecto(@Param('id', ParseIntPipe) id: number) {
        const data = await this.listarUsuariosProyectoUseCase.execute(id);
        return ApiResponseDto.success(data, 'Usuarios con acceso al proyecto');
    }

    @Post(':id/usuarios')
    @HttpCode(HttpStatus.CREATED)
    async asignarAccesoProyecto(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AsignarAccesoProyectoDto,
        @Req() request: Request,
    ) {
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException('Token no proporcionado');
        const payload = await this.jwtService.verifyAsync(token);
        const data = await this.asignarAccesoProyectoUseCase.execute(id, dto, payload.sub);
        return ApiResponseDto.created(data, 'Acceso asignado exitosamente');
    }

    @Patch(':id/usuarios/:idAcceso')
    @HttpCode(HttpStatus.OK)
    async actualizarNivelAccesoProyecto(
        @Param('id', ParseIntPipe) id: number,
        @Param('idAcceso', ParseIntPipe) idAcceso: number,
        @Body() dto: ActualizarNivelAccesoProyectoDto,
        @Req() request: Request,
    ) {
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException('Token no proporcionado');
        const payload = await this.jwtService.verifyAsync(token);
        const data = await this.actualizarNivelAccesoProyectoUseCase.execute(id, idAcceso, dto, payload.sub);
        return ApiResponseDto.success(data, 'Nivel de acceso actualizado');
    }

    @Delete(':id/usuarios/:idAcceso')
    @HttpCode(HttpStatus.OK)
    async removerAccesoProyecto(
        @Param('id', ParseIntPipe) id: number,
        @Param('idAcceso', ParseIntPipe) idAcceso: number,
        @Req() request: Request,
    ) {
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException('Token no proporcionado');
        const payload = await this.jwtService.verifyAsync(token);
        const data = await this.removerAccesoProyectoUseCase.execute(id, idAcceso, payload.sub);
        return ApiResponseDto.success(data, 'Acceso removido exitosamente');
    }

    @Get(':id/documentos')
    @HttpCode(HttpStatus.OK)
    async listarDocumentosProyecto(@Param('id', ParseIntPipe) id: number) {
        const data = await this.listarDocumentosProyectoUseCase.execute(id);
        return ApiResponseDto.success(data, 'Documentos del proyecto');
    }

    @Post(':id/documentos')
    @HttpCode(HttpStatus.CREATED)
    async crearDocumentoProyecto(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateDocumentoProyectoDto,
        @Req() request: Request,
    ) {
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException('Token no proporcionado');
        const payload = await this.jwtService.verifyAsync(token);
        const data = await this.crearDocumentoProyectoUseCase.execute(id, dto, payload.sub);
        return ApiResponseDto.created(data, 'Documento creado exitosamente');
    }

    @Patch(':id/documentos/:idDocumento')
    @HttpCode(HttpStatus.OK)
    async actualizarDocumentoProyecto(
        @Param('id', ParseIntPipe) id: number,
        @Param('idDocumento', ParseIntPipe) idDocumento: number,
        @Body() dto: UpdateDocumentoProyectoDto,
        @Req() request: Request,
    ) {
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException('Token no proporcionado');
        const payload = await this.jwtService.verifyAsync(token);
        const data = await this.actualizarDocumentoProyectoUseCase.execute(idDocumento, dto, payload.sub);
        return ApiResponseDto.success(data, 'Documento actualizado exitosamente');
    }

    @Delete(':id/documentos/:idDocumento')
    @HttpCode(HttpStatus.OK)
    async eliminarDocumentoProyecto(
        @Param('id', ParseIntPipe) id: number,
        @Param('idDocumento', ParseIntPipe) idDocumento: number,
        @Req() request: Request,
    ) {
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException('Token no proporcionado');
        const payload = await this.jwtService.verifyAsync(token);
        const data = await this.eliminarDocumentoProyectoUseCase.execute(idDocumento, payload.sub);
        return ApiResponseDto.success(data, 'Documento eliminado exitosamente');
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async obtenerProyecto(@Param('id', ParseIntPipe) id: number) {
        const data = await this.obtenerProyectoUseCase.execute(id);

        return ApiResponseDto.success(data, 'Proyecto obtenido exitosamente');
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async crearProyecto(
        @Body() createDto: CreateProyectoDto,
        @Req() request: Request,
    ) {
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('Token no proporcionado');
        }

        const payload = await this.jwtService.verifyAsync(token);
        const idUsuarioCreacion = payload.sub;

        const data = await this.crearProyectoUseCase.execute(createDto, idUsuarioCreacion);

        return ApiResponseDto.created(data, 'Proyecto creado exitosamente');
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async editarProyecto(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateProyectoDto,
        @Req() request: Request,
    ) {
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('Token no proporcionado');
        }

        const payload = await this.jwtService.verifyAsync(token);
        const idUsuarioModificacion = payload.sub;

        const data = await this.editarProyectoUseCase.execute(id, updateDto, idUsuarioModificacion);

        return ApiResponseDto.success(data, 'Proyecto actualizado exitosamente');
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async eliminarProyecto(
        @Param('id', ParseIntPipe) id: number,
        @Req() request: Request,
    ) {
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('Token no proporcionado');
        }

        const payload = await this.jwtService.verifyAsync(token);
        const idUsuarioModificacion = payload.sub;

        const data = await this.eliminarProyectoUseCase.execute(id, idUsuarioModificacion);

        return ApiResponseDto.success(data, 'Proyecto eliminado exitosamente');
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return undefined;
        }

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}
