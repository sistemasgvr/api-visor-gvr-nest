import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { GranularPermissionsService } from '../../application/services/granular-permissions.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import {
  SynchronizeMenuPermissionsDto,
  SynchronizeRolePermissionsDto,
} from '../dtos/authorization/synchronize-permissions.dto';

@ApiTags('autorizacion')
@ApiBearerAuth('access-token')
@Controller('autorizacion')
@UseGuards(JwtAuthGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class AuthorizationController {
  constructor(private readonly permissions: GranularPermissionsService) {}

  private actor(request: Request): number {
    const id = request.user?.sub;
    if (!Number.isSafeInteger(id) || (id as number) < 1)
      throw new UnauthorizedException('Sesión inválida');
    return id as number;
  }

  @ApiOperation({
    summary:
      'Permisos efectivos actuales de la sesión; no concede acceso a recursos por sí solo',
  })
  @Get('me')
  async current(@Req() request: Request) {
    return ApiResponseDto.success(
      await this.permissions.current(this.actor(request)),
    );
  }

  @ApiOperation({ summary: 'Catálogo granular agrupado por módulo y opción' })
  @Get('catalogo')
  async catalog(@Req() request: Request) {
    return ApiResponseDto.success(
      await this.permissions.catalog(this.actor(request)),
    );
  }

  @ApiOperation({
    summary:
      'Resumen de cada rol: acciones concedidas, personas activas y última modificación',
  })
  @Get('roles/resumen')
  async roleSummaries(@Req() request: Request) {
    return ApiResponseDto.success(
      await this.permissions.roleSummaries(this.actor(request)),
    );
  }

  @ApiOperation({ summary: 'Personas activas que tienen asignado el rol' })
  @Get('roles/:id/personas')
  async roleMembers(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return ApiResponseDto.success(
      await this.permissions.roleMembers(this.actor(request), id),
    );
  }

  @Get('roles/:id/permisos')
  async role(@Req() request: Request, @Param('id', ParseIntPipe) id: number) {
    return ApiResponseDto.success(
      await this.permissions.role(this.actor(request), id),
    );
  }

  @ApiOperation({
    summary:
      'Reemplazar permisos y alcances del rol usando la revisión leída; [] retira todos',
  })
  @Put('roles/:id/permisos')
  async synchronizeRole(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SynchronizeRolePermissionsDto,
  ) {
    return ApiResponseDto.success(
      await this.permissions.synchronizeRole(
        this.actor(request),
        id,
        body.permisos,
        body.revision,
      ),
    );
  }

  @Get('menus/:id/permisos')
  async menu(@Req() request: Request, @Param('id', ParseIntPipe) id: number) {
    return ApiResponseDto.success(
      await this.permissions.menu(this.actor(request), id),
    );
  }

  @ApiOperation({
    summary:
      'Vincular acciones al menú con revisión; basta una de ellas para acceso directo',
  })
  @Put('menus/:id/permisos')
  async synchronizeMenu(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SynchronizeMenuPermissionsDto,
  ) {
    return ApiResponseDto.success(
      await this.permissions.synchronizeMenu(
        this.actor(request),
        id,
        body.permisos,
        body.revision,
      ),
    );
  }

  @Get('menus/:id/acceso')
  async navigation(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return ApiResponseDto.success(
      await this.permissions.canNavigate(this.actor(request), id),
    );
  }
}
