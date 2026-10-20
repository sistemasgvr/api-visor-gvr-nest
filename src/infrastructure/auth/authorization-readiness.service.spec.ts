import 'reflect-metadata';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { DiscoveryService } from '@nestjs/core';
import type { AuthorizationPolicyRegistry } from '../../application/ports/authorization.port';
import { RequireGranularPermission } from './granular-permission.guard';
import {
  inspectHttpAuthorization,
  AuthorizationReadinessService,
} from './authorization-readiness.service';

@Controller('protected')
class ProtectedController {
  @Get() @RequireGranularPermission('test.read') read() {}
}
@Controller('legacy')
class LegacyController {
  @Get() read() {}
}
@Controller('child')
class ChildController extends LegacyController {}
const policies: AuthorizationPolicyRegistry = new Map([
  [
    'test.read',
    {
      mode: 'global',
      allowedScopes: ['global'],
      resolve: () =>
        Promise.resolve({
          resource: null,
          activeBoundary: true,
          businessRulesAllow: true,
        }),
    },
  ],
]);
describe('Bloqueo de producción por autorización incompleta', () => {
  it('detecta operaciones sin requisito y también las heredadas', () => {
    expect(
      inspectHttpAuthorization(
        [LegacyController, ChildController],
        policies,
      ).map((gap) => gap.endpoint),
    ).toEqual(['LegacyController.read', 'ChildController.read']);
  });
  it('no da por cubierta una ruta con códigos sin política', () => {
    expect(inspectHttpAuthorization([ProtectedController], new Map())).toEqual([
      {
        endpoint: 'ProtectedController.read',
        reason: 'missing_policy',
        codes: ['test.read'],
      },
    ]);
  });
  it('acepta el control declarado cuando la política está registrada', () => {
    expect(inspectHttpAuthorization([ProtectedController], policies)).toEqual(
      [],
    );
  });
  it('no acepta requisitos vacíos ni roles como sustituto de una política', () => {
    @Controller('empty')
    class EmptyController {
      @Get() @RequireGranularPermission() read() {}
    }
    expect(
      inspectHttpAuthorization([EmptyController], policies)[0]?.reason,
    ).toBe('missing_requirement');
  });
  it('impide arrancar producción con rutas pendientes', () => {
    const discovery = {
      getControllers: () => [{ metatype: LegacyController }],
    } as unknown as DiscoveryService;
    const service = new AuthorizationReadinessService(
      discovery,
      new ConfigService({ NODE_ENV: 'production' }),
      policies,
    );
    expect(() => service.onApplicationBootstrap()).toThrow(
      'AUTHORIZATION_NOT_READY',
    );
  });
  it('permite completar la integración en desarrollo sin fingir cobertura', () => {
    const discovery = {
      getControllers: () => [{ metatype: LegacyController }],
    } as unknown as DiscoveryService;
    const service = new AuthorizationReadinessService(
      discovery,
      new ConfigService({ NODE_ENV: 'development' }),
      policies,
    );
    expect(() => service.onApplicationBootstrap()).not.toThrow();
  });
});
