import 'reflect-metadata';
import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  GranularPermissionGuard,
  RequireGranularPermission,
  RequireWorkerPermission,
} from './granular-permission.guard';
import type { AuthorizationService } from '../../application/services/authorization.service';
import type { JwtAuthGuard } from './jwt-auth.guard';
class UnmappedController {
  operation() {}
}
class MappedController {
  @RequireGranularPermission('seguridad.roles.ver') operation() {}
}
class AuthController {
  login() {}
  register() {}
}
class WorkerController {
  @RequireWorkerPermission('control_operativo.jornadas.ver') operation() {}
  @RequireWorkerPermission('control_operativo.jornadas.ver', 'query')
  filter() {}
}
function context(
  controller: typeof UnmappedController | typeof AuthController,
  method = 'operation',
  request: Record<string, unknown> = {},
): ExecutionContext {
  return {
    getHandler: () =>
      (controller.prototype as unknown as Record<string, unknown>)[method],
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => ({
        user: { sub: 7, roles: [{ id: 1 }], permisos: ['todo'] },
        ...request,
      }),
    }),
  } as unknown as ExecutionContext;
}
describe('Guard HTTP con denegación por defecto', () => {
  const jwt = { canActivate: jest.fn(() => true) };
  const authorization = { can: jest.fn(() => Promise.resolve(true)) };
  const guard = new GranularPermissionGuard(
    new Reflector(),
    jwt as unknown as JwtAuthGuard,
    authorization as unknown as AuthorizationService,
  );
  beforeEach(() => {
    jest.clearAllMocks();
    jwt.canActivate.mockReturnValue(true);
    authorization.can.mockResolvedValue(true);
  });
  it('bloquea una ruta sin política incluso si JWT dice Administrador y todo', async () => {
    await expect(
      guard.canActivate(context(UnmappedController)),
    ).rejects.toMatchObject({
      response: { code: 'GRANULAR_POLICY_NOT_CONFIGURED' },
    });
    expect(authorization.can).not.toHaveBeenCalled();
  });
  it('valida la identidad antes de rechazar rutas pendientes', async () => {
    jwt.canActivate.mockReturnValue(false);
    await expect(
      guard.canActivate(context(UnmappedController)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('no permite una operación registrada cuando se retira su permiso', async () => {
    expect(await guard.canActivate(context(MappedController))).toBe(true);
    authorization.can.mockResolvedValue(false);
    await expect(
      guard.canActivate(context(MappedController)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('solo conserva excepciones puntuales del ciclo de sesión', async () => {
    expect(await guard.canActivate(context(AuthController, 'login'))).toBe(
      true,
    );
    expect(jwt.canActivate).not.toHaveBeenCalled();
    await expect(
      guard.canActivate(context(AuthController, 'register')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('autoriza el trabajador de la ruta, sin permitir que query lo sustituya', async () => {
    expect(
      await guard.canActivate(
        context(WorkerController, 'operation', {
          params: { idTrabajador: '109' },
          query: { idTrabajador: '999' },
        }),
      ),
    ).toBe(true);
    expect(authorization.can).toHaveBeenCalledWith(
      7,
      'control_operativo.jornadas.ver',
      { type: 'control_worker', id: '109' },
    );
  });
  it('autoriza el trabajador del filtro con la identidad JWT', async () => {
    expect(
      await guard.canActivate(
        context(WorkerController, 'filter', { query: { idTrabajador: '109' } }),
      ),
    ).toBe(true);
    expect(authorization.can).toHaveBeenCalledWith(
      7,
      'control_operativo.jornadas.ver',
      { type: 'control_worker', id: '109' },
    );
  });
  it('no convierte un filtro sin trabajador en un permiso global', async () => {
    await expect(
      guard.canActivate(context(WorkerController, 'filter')),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(authorization.can).not.toHaveBeenCalled();
  });
});
