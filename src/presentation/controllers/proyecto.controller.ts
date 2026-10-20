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
  ForbiddenException,
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
import { ListarCoordinadoresProyectoUseCase } from '../../application/use-cases/proyecto/listar-coordinadores-proyecto.use-case';
import { GuardarCoordinadoresProyectoUseCase } from '../../application/use-cases/proyecto/guardar-coordinadores-proyecto.use-case';
import { ListarEstadisticasProyectosPorEstadoUseCase } from '../../application/use-cases/proyecto/listar-estadisticas-proyectos-por-estado.use-case';
import { CreateProyectoDto } from '../dtos/proyecto/create-proyecto.dto';
import { UpdateProyectoDto } from '../dtos/proyecto/update-proyecto.dto';
import { AsignarAccesoProyectoDto } from '../dtos/proyecto/asignar-acceso-proyecto.dto';
import { ActualizarNivelAccesoProyectoDto } from '../dtos/proyecto/actualizar-nivel-acceso-proyecto.dto';
import { CreateDocumentoProyectoDto } from '../dtos/proyecto/create-documento-proyecto.dto';
import { UpdateDocumentoProyectoDto } from '../dtos/proyecto/update-documento-proyecto.dto';
import { GuardarCoordinadoresProyectoDto } from '../dtos/proyecto/guardar-coordinadores-proyecto.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import {
  RequireGranularPermission,
  RequireResourcePermission,
  RequireScopedPermission,
} from '../../infrastructure/auth/granular-permission.guard';
import { GVR_PROJECT_RESOURCE } from '../../infrastructure/auth/catalog-policies';
import { AuthorizationService } from '../../application/services/authorization.service';
import { ActorId, GrantedScope } from '../http/granted-scopes.decorator';
import type { AuthorizationScope } from '../../application/ports/authorization.port';

const proyecto = (codes: string | string[], param = 'id') =>
  RequireResourcePermission(codes, GVR_PROJECT_RESOURCE, param);

@ApiTags('proyectos')
@ApiBearerAuth('access-token')
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
    private readonly listarCoordinadoresProyectoUseCase: ListarCoordinadoresProyectoUseCase,
    private readonly guardarCoordinadoresProyectoUseCase: GuardarCoordinadoresProyectoUseCase,
    private readonly listarEstadisticasProyectosPorEstadoUseCase: ListarEstadisticasProyectosPorEstadoUseCase,
    private readonly jwtService: JwtService,
    private readonly authorization: AuthorizationService,
  ) {}

  @ApiOperation({
    summary: 'Estadísticas de proyectos agrupadas por estado',
    description: 'Conteos por estado operativo del proyecto.',
  })
  @Get('estadisticas-por-estado')
  @HttpCode(HttpStatus.OK)
  @RequireGranularPermission('inicio.indicadores.ver_progreso_proyectos')
  async listarEstadisticasProyectosPorEstado() {
    const data =
      await this.listarEstadisticasProyectosPorEstadoUseCase.execute();
    return ApiResponseDto.success(data, 'Estadísticas de proyectos por estado');
  }

  @ApiOperation({
    summary: 'Listar proyectos',
    description:
      'Filtros por tipo, país, cliente y texto; alcance según permisos del usuario.',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('proyectos.proyectos.ver')
  async listarProyectos(
    @GrantedScope('proyectos.proyectos.ver') alcance: AuthorizationScope,
    @Req() request: Request,
    @Query('idTipoProyecto', new ParseIntPipe({ optional: true }))
    idTipoProyecto?: number,
    @Query('idPais', new ParseIntPipe({ optional: true })) idPais?: number,
    @Query('idCliente', new ParseIntPipe({ optional: true }))
    idCliente?: number,
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
      soloAsignados: alcance !== 'todos',
      idTipoProyecto,
      idPais,
      idCliente,
      busqueda,
      limit,
      offset,
    });

    return ApiResponseDto.success(data, 'Proyectos obtenidos exitosamente');
  }

  @ApiOperation({
    summary: 'Usuarios disponibles para asignar al proyecto',
    description:
      'Usuarios que aún no tienen acceso o para ampliar roles (según búsqueda).',
  })
  @Get(':id/usuarios/available')
  @HttpCode(HttpStatus.OK)
  @proyecto('proyectos.accesos.asignar')
  async listarUsuariosDisponiblesProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Query('busqueda') busqueda?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('idRol', new ParseIntPipe({ optional: true })) idRol?: number,
  ) {
    const data = await this.listarUsuariosDisponiblesProyectoUseCase.execute({
      idProyecto: id,
      busqueda: busqueda ?? '',
      limit,
      offset,
      idRol,
    });
    return ApiResponseDto.success(data, 'Usuarios disponibles obtenidos');
  }

  @ApiOperation({ summary: 'Usuarios con acceso al proyecto' })
  @Get(':id/usuarios')
  @HttpCode(HttpStatus.OK)
  @proyecto('proyectos.accesos.ver')
  async listarUsuariosProyecto(@Param('id', ParseIntPipe) id: number) {
    const usuarios = await this.listarUsuariosProyectoUseCase.execute(id);
    // Coordinar un equipo implica validar sus actividades: pueden coordinar quienes validan.
    const data = await Promise.all(
      (usuarios ?? []).map(async (usuario: { idusuario?: number }) => ({
        ...usuario,
        puedecoordinar:
          (
            await this.authorization.scopesFor(
              Number(usuario.idusuario),
              'control_operativo.validacion.ver',
            )
          ).length > 0,
      })),
    );
    return ApiResponseDto.success(data, 'Usuarios con acceso al proyecto');
  }

  @ApiOperation({ summary: 'Asignar acceso de usuario al proyecto' })
  @Post(':id/usuarios')
  @HttpCode(HttpStatus.CREATED)
  @proyecto('proyectos.accesos.asignar')
  async asignarAccesoProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarAccesoProyectoDto,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync(token);
    const data = await this.asignarAccesoProyectoUseCase.execute(
      id,
      dto,
      payload.sub,
    );
    return ApiResponseDto.created(data, 'Acceso asignado exitosamente');
  }

  @ApiOperation({
    summary: 'Cambiar nivel de acceso del usuario en el proyecto',
  })
  @Patch(':id/usuarios/:idAcceso')
  @HttpCode(HttpStatus.OK)
  @proyecto('proyectos.accesos.cambiar_nivel')
  async actualizarNivelAccesoProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Param('idAcceso', ParseIntPipe) idAcceso: number,
    @Body() dto: ActualizarNivelAccesoProyectoDto,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync(token);
    const data = await this.actualizarNivelAccesoProyectoUseCase.execute(
      id,
      idAcceso,
      dto,
      payload.sub,
    );
    return ApiResponseDto.success(data, 'Nivel de acceso actualizado');
  }

  @ApiOperation({ summary: 'Quitar acceso del usuario al proyecto' })
  @Delete(':id/usuarios/:idAcceso')
  @HttpCode(HttpStatus.OK)
  @proyecto('proyectos.accesos.retirar')
  async removerAccesoProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Param('idAcceso', ParseIntPipe) idAcceso: number,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync(token);
    const data = await this.removerAccesoProyectoUseCase.execute(
      id,
      idAcceso,
      payload.sub,
    );
    return ApiResponseDto.success(data, 'Acceso removido exitosamente');
  }

  @ApiOperation({ summary: 'Listar coordinadores BIM del proyecto' })
  @Get(':id/coordinadores')
  @HttpCode(HttpStatus.OK)
  @proyecto('proyectos.coordinadores.ver')
  async listarCoordinadoresProyecto(@Param('id', ParseIntPipe) id: number) {
    const data = await this.listarCoordinadoresProyectoUseCase.execute(id);
    return ApiResponseDto.success(data, 'Coordinadores del proyecto');
  }

  @ApiOperation({ summary: 'Guardar coordinadores del proyecto' })
  @Put(':id/coordinadores')
  @HttpCode(HttpStatus.OK)
  @proyecto([
    'proyectos.coordinadores.asignar',
    'proyectos.coordinadores.gestionar_equipo',
  ])
  async guardarCoordinadoresProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GuardarCoordinadoresProyectoDto,
    @Req() request: Request,
    @ActorId() actor: number,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync(token);
    await this.exigirCambiosCoordinadores(actor, id, dto);
    const data = await this.guardarCoordinadoresProyectoUseCase.execute(
      id,
      dto,
      payload.sub,
    );
    return ApiResponseDto.success(data, 'Coordinadores actualizados');
  }

  @ApiOperation({ summary: 'Documentos asociados al proyecto' })
  @Get(':id/documentos')
  @HttpCode(HttpStatus.OK)
  @proyecto('proyectos.documentos.ver')
  async listarDocumentosProyecto(@Param('id', ParseIntPipe) id: number) {
    const data = await this.listarDocumentosProyectoUseCase.execute(id);
    return ApiResponseDto.success(data, 'Documentos del proyecto');
  }

  @ApiOperation({ summary: 'Registrar documento en el proyecto' })
  @Post(':id/documentos')
  @HttpCode(HttpStatus.CREATED)
  @proyecto('proyectos.documentos.crear')
  async crearDocumentoProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateDocumentoProyectoDto,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync(token);
    const data = await this.crearDocumentoProyectoUseCase.execute(
      id,
      dto,
      payload.sub,
    );
    return ApiResponseDto.created(data, 'Documento creado exitosamente');
  }

  @ApiOperation({ summary: 'Actualizar metadatos de documento del proyecto' })
  @Patch(':id/documentos/:idDocumento')
  @HttpCode(HttpStatus.OK)
  @proyecto('proyectos.documentos.editar')
  async actualizarDocumentoProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Param('idDocumento', ParseIntPipe) idDocumento: number,
    @Body() dto: UpdateDocumentoProyectoDto,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync(token);
    const data = await this.actualizarDocumentoProyectoUseCase.execute(
      idDocumento,
      dto,
      payload.sub,
    );
    return ApiResponseDto.success(data, 'Documento actualizado exitosamente');
  }

  @ApiOperation({ summary: 'Eliminar documento del proyecto' })
  @Delete(':id/documentos/:idDocumento')
  @HttpCode(HttpStatus.OK)
  @proyecto('proyectos.documentos.eliminar')
  async eliminarDocumentoProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Param('idDocumento', ParseIntPipe) idDocumento: number,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync(token);
    const data = await this.eliminarDocumentoProyectoUseCase.execute(
      idDocumento,
      payload.sub,
    );
    return ApiResponseDto.success(data, 'Documento eliminado exitosamente');
  }

  @ApiOperation({ summary: 'Obtener proyecto por id' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @proyecto([
    'proyectos.proyectos.ver',
    'proyectos.proyectos.configurar',
    'proyectos.proyectos.editar',
  ])
  async obtenerProyecto(@Param('id', ParseIntPipe) id: number) {
    const data = await this.obtenerProyectoUseCase.execute(id);

    return ApiResponseDto.success(data, 'Proyecto obtenido exitosamente');
  }

  @ApiOperation({ summary: 'Crear proyecto' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireGranularPermission('proyectos.proyectos.crear')
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

    const data = await this.crearProyectoUseCase.execute(
      createDto,
      idUsuarioCreacion,
    );

    return ApiResponseDto.created(data, 'Proyecto creado exitosamente');
  }

  @ApiOperation({ summary: 'Actualizar proyecto' })
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @proyecto('proyectos.proyectos.editar')
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

    const data = await this.editarProyectoUseCase.execute(
      id,
      updateDto,
      idUsuarioModificacion,
    );

    return ApiResponseDto.success(data, 'Proyecto actualizado exitosamente');
  }

  @ApiOperation({ summary: 'Eliminar proyecto (baja lógica)' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @proyecto('proyectos.proyectos.eliminar')
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

    const data = await this.eliminarProyectoUseCase.execute(
      id,
      idUsuarioModificacion,
    );

    return ApiResponseDto.success(data, 'Proyecto eliminado exitosamente');
  }

  /** Cambiar quiénes coordinan exige «asignar»; cambiar los equipos, «gestionar equipo». */
  private async exigirCambiosCoordinadores(
    actor: number,
    idProyecto: number,
    dto: GuardarCoordinadoresProyectoDto,
  ) {
    const idDe = (m: unknown) =>
      Number(
        typeof m === 'object' && m
          ? ((m as { idtrabajador?: number; id?: number }).idtrabajador ??
              (m as { id?: number }).id)
          : m,
      );
    const firma = (
      items: { idtrabajador: unknown; miembros: unknown[] }[],
    ) => ({
      coordinadores: items
        .map((c) => Number(c.idtrabajador))
        .sort((a, b) => a - b)
        .join(','),
      equipos: items
        .map(
          (c) =>
            `${Number(c.idtrabajador)}:${c.miembros
              .map(idDe)
              .sort((a, b) => a - b)
              .join('|')}`,
        )
        .sort()
        .join(','),
    });
    const actuales =
      await this.listarCoordinadoresProyectoUseCase.execute(idProyecto);
    const antes = firma(
      actuales.map((c) => ({
        idtrabajador: (c as { idtrabajador?: unknown }).idtrabajador,
        miembros: (c as { miembrosEquipo?: unknown[] }).miembrosEquipo ?? [],
      })),
    );
    const despues = firma(
      (dto.coordinadores ?? []).map((c) => ({
        idtrabajador: c.idtrabajador,
        miembros: c.miembrosEquipo ?? [],
      })),
    );
    const recurso = { type: GVR_PROJECT_RESOURCE, id: String(idProyecto) };
    const exigir = async (codigo: string) => {
      if (!(await this.authorization.can(actor, codigo, recurso)))
        throw new ForbiddenException({
          message: 'No tienes permiso para realizar esta acción',
          code: 'GRANULAR_PERMISSION_DENIED',
        });
    };
    if (antes.coordinadores !== despues.coordinadores)
      await exigir('proyectos.coordinadores.asignar');
    if (antes.equipos !== despues.equipos)
      await exigir('proyectos.coordinadores.gestionar_equipo');
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
