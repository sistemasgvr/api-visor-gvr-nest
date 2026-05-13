import {
  Controller,
  Get,
  Post,
  Put,
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
import { ListarTrabajadoresUseCase } from '../../application/use-cases/trabajador/listar-trabajadores.use-case';
import { ListarAdministrativosUseCase } from '../../application/use-cases/trabajador/listar-administrativos.use-case';
import { ObtenerTrabajadorUseCase } from '../../application/use-cases/trabajador/obtener-trabajador.use-case';
import { ObtenerFotoPerfilTrabajadorUseCase } from '../../application/use-cases/trabajador/obtener-foto-perfil-trabajador.use-case';
import { CrearTrabajadorUseCase } from '../../application/use-cases/trabajador/crear-trabajador.use-case';
import { EditarTrabajadorUseCase } from '../../application/use-cases/trabajador/editar-trabajador.use-case';
import { ActualizarContratoTrabajadorUseCase } from '../../application/use-cases/trabajador/actualizar-contrato-trabajador.use-case';
import { CrearContratoTrabajadorUseCase } from '../../application/use-cases/trabajador/crear-contrato-trabajador.use-case';
import { EliminarContratoTrabajadorUseCase } from '../../application/use-cases/trabajador/eliminar-contrato-trabajador.use-case';
import { EliminarTrabajadorUseCase } from '../../application/use-cases/trabajador/eliminar-trabajador.use-case';
import { ResetearContrasenaUseCase } from '../../application/use-cases/trabajador/resetear-contrasena.use-case';
import { CreateTrabajadorDto } from '../../application/dtos/trabajador/create-trabajador.dto';
import { UpdateTrabajadorDto } from '../../application/dtos/trabajador/update-trabajador.dto';
import { UpdateContratoTrabajadorDto } from '../../application/dtos/trabajador/update-contrato-trabajador.dto';
import { CreateContratoTrabajadorDto } from '../../application/dtos/trabajador/create-contrato-trabajador.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('trabajadores')
@ApiBearerAuth('access-token')
@Controller('trabajadores')
@UseGuards(JwtAuthGuard)
export class TrabajadorController {
  constructor(
    private readonly listarTrabajadoresUseCase: ListarTrabajadoresUseCase,
    private readonly listarAdministrativosUseCase: ListarAdministrativosUseCase,
    private readonly obtenerTrabajadorUseCase: ObtenerTrabajadorUseCase,
    private readonly obtenerFotoPerfilTrabajadorUseCase: ObtenerFotoPerfilTrabajadorUseCase,
    private readonly crearTrabajadorUseCase: CrearTrabajadorUseCase,
    private readonly editarTrabajadorUseCase: EditarTrabajadorUseCase,
    private readonly actualizarContratoTrabajadorUseCase: ActualizarContratoTrabajadorUseCase,
    private readonly crearContratoTrabajadorUseCase: CrearContratoTrabajadorUseCase,
    private readonly eliminarContratoTrabajadorUseCase: EliminarContratoTrabajadorUseCase,
    private readonly eliminarTrabajadorUseCase: EliminarTrabajadorUseCase,
    private readonly resetearContrasenaUseCase: ResetearContrasenaUseCase,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Listar trabajadores administrativos
   * GET /trabajadores/administradores
   */
  @ApiOperation({
    summary: 'Listar trabajadores administrativos',
    description:
      'Usuarios con rol administrativo para asignación de permisos y gestión.',
  })
  @Get('administradores')
  @HttpCode(HttpStatus.OK)
  async listarAdministrativos() {
    const data = await this.listarAdministrativosUseCase.execute();

    return ApiResponseDto.success(
      data,
      'Administradores listados exitosamente',
    );
  }

  /**
   * Listar trabajadores con búsqueda y paginación
   * GET /trabajadores?idEmpresa=1&busqueda=texto&limit=10&offset=0
   */
  @ApiOperation({
    summary: 'Listar trabajadores',
    description:
      'Paginación y filtros por empresa, búsqueda, rol y estado. El alcance depende del usuario autenticado.',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async listarTrabajadores(
    @Req() request: Request,
    @Query('idEmpresa', new ParseIntPipe({ optional: true }))
    idEmpresa?: number,
    @Query('busqueda') busqueda?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('idRol', new ParseIntPipe({ optional: true })) idRol?: number,
    @Query('estado', new ParseIntPipe({ optional: true })) estado?: number,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const payload = await this.jwtService.verifyAsync(token);
    const idUsuario = payload.sub;

    const data = await this.listarTrabajadoresUseCase.execute({
      idUsuario,
      idEmpresa,
      busqueda,
      limit,
      offset,
      idRol,
      estado,
    });

    return ApiResponseDto.success(data, 'Trabajadores obtenidos exitosamente');
  }

  /**
   * Foto de perfil del usuario vinculado al trabajador (URL lista para mostrar).
   * GET /trabajadores/:id/foto-perfil
   */
  @ApiOperation({
    summary: 'Obtener URL de foto de perfil',
    description:
      'Devuelve la foto del usuario vinculado al trabajador (URL firmada/lista para mostrar en MinIO).',
  })
  @Get(':id/foto-perfil')
  @HttpCode(HttpStatus.OK)
  async obtenerFotoPerfilTrabajador(@Param('id', ParseIntPipe) id: number) {
    const data = await this.obtenerFotoPerfilTrabajadorUseCase.execute(id);

    return ApiResponseDto.success(
      data,
      'Foto de perfil del trabajador obtenida exitosamente',
    );
  }

  /**
   * Obtener trabajador por ID
   * GET /trabajadores/:id
   */
  @ApiOperation({
    summary: 'Obtener trabajador por id',
    description: 'Ficha completa del trabajador (datos personales, empresa, roles, adjuntos).',
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async obtenerTrabajador(@Param('id', ParseIntPipe) id: number) {
    const data = await this.obtenerTrabajadorUseCase.execute(id);

    return ApiResponseDto.success(data, 'Trabajador obtenido exitosamente');
  }

  /**
   * Actualizar un contrato del trabajador (tipo, duración, puesto, fechas, remuneración).
   * PUT /trabajadores/:id/contratos/:idContrato
   */
  @ApiOperation({
    summary: 'Actualizar contrato del trabajador',
    description:
      'Actualiza una fila de traContrato. Debe pertenecer al trabajador indicado.',
  })
  @Put(':id/contratos/:idContrato')
  @HttpCode(HttpStatus.OK)
  async actualizarContratoTrabajador(
    @Param('id', ParseIntPipe) idTrabajador: number,
    @Param('idContrato', ParseIntPipe) idContrato: number,
    @Body() dto: UpdateContratoTrabajadorDto,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const payload = await this.jwtService.verifyAsync(token);
    const idUsuario = payload.sub;
    const data = await this.actualizarContratoTrabajadorUseCase.execute(
      idTrabajador,
      idContrato,
      dto,
      idUsuario,
    );
    return ApiResponseDto.success(data, 'Contrato actualizado exitosamente');
  }

  /**
   * Registrar un nuevo contrato para el trabajador.
   * POST /trabajadores/:id/contratos
   */
  @ApiOperation({
    summary: 'Crear contrato del trabajador',
    description: 'Inserta un contrato en traContrato (empresa tomada del trabajador).',
  })
  @Post(':id/contratos')
  @HttpCode(HttpStatus.CREATED)
  async crearContratoTrabajador(
    @Param('id', ParseIntPipe) idTrabajador: number,
    @Body() dto: CreateContratoTrabajadorDto,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const payload = await this.jwtService.verifyAsync(token);
    const idUsuario = payload.sub;
    const data = await this.crearContratoTrabajadorUseCase.execute(
      idTrabajador,
      dto,
      idUsuario,
    );
    return ApiResponseDto.created(data, 'Contrato registrado exitosamente');
  }

  /**
   * Baja lógica de un contrato del trabajador.
   * DELETE /trabajadores/:id/contratos/:idContrato
   */
  @ApiOperation({
    summary: 'Eliminar contrato del trabajador',
    description: 'Marca el contrato como inactivo (estado = 0).',
  })
  @Delete(':id/contratos/:idContrato')
  @HttpCode(HttpStatus.OK)
  async eliminarContratoTrabajador(
    @Param('id', ParseIntPipe) idTrabajador: number,
    @Param('idContrato', ParseIntPipe) idContrato: number,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const payload = await this.jwtService.verifyAsync(token);
    const idUsuario = payload.sub;
    const data = await this.eliminarContratoTrabajadorUseCase.execute(
      idTrabajador,
      idContrato,
      idUsuario,
    );
    return ApiResponseDto.success(data, 'Contrato eliminado exitosamente');
  }

  /**
   * Crear nuevo trabajador (crea usuario automáticamente)
   * POST /trabajadores
   */
  @ApiOperation({
    summary: 'Crear trabajador',
    description: 'Registra trabajador y crea su usuario de acceso al sistema.',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearTrabajador(
    @Body() createDto: CreateTrabajadorDto,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const payload = await this.jwtService.verifyAsync(token);
    const idUsuarioCreacion = payload.sub;

    const data = await this.crearTrabajadorUseCase.execute(
      createDto,
      idUsuarioCreacion,
    );

    return ApiResponseDto.created(data, 'Trabajador creado exitosamente');
  }

  /**
   * Editar trabajador existente
   * PUT /trabajadores/:id
   */
  @ApiOperation({ summary: 'Actualizar trabajador' })
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async editarTrabajador(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTrabajadorDto,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const payload = await this.jwtService.verifyAsync(token);
    const idUsuarioModificacion = payload.sub;

    const data = await this.editarTrabajadorUseCase.execute(
      id,
      updateDto,
      idUsuarioModificacion,
    );

    return ApiResponseDto.success(data, 'Trabajador actualizado exitosamente');
  }

  /**
   * Eliminar trabajador (soft delete - desactiva usuario también)
   * DELETE /trabajadores/:id
   */
  @ApiOperation({
    summary: 'Eliminar trabajador (baja lógica)',
    description: 'Desactiva trabajador y usuario asociado.',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminarTrabajador(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const payload = await this.jwtService.verifyAsync(token);
    const idUsuarioModificacion = payload.sub;

    const data = await this.eliminarTrabajadorUseCase.execute(
      id,
      idUsuarioModificacion,
    );

    return ApiResponseDto.success(data, 'Trabajador eliminado exitosamente');
  }

  /**
   * Resetear contraseña de trabajador al número de documento
   * POST /trabajadores/:id/resetear-contrasena
   */
  @ApiOperation({
    summary: 'Resetear contraseña del trabajador',
    description: 'Restablece la contraseña al valor por defecto (p. ej. número de documento).',
  })
  @Post(':id/resetear-contrasena')
  @HttpCode(HttpStatus.OK)
  async resetearContrasena(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const payload = await this.jwtService.verifyAsync(token);
    const idUsuarioModificacion = payload.sub;

    const data = await this.resetearContrasenaUseCase.execute(
      id,
      idUsuarioModificacion,
    );

    return ApiResponseDto.success(data, 'Contraseña reseteada exitosamente');
  }

  // Helper method
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
