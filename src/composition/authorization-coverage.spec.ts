import 'reflect-metadata';
import { METHOD_METADATA } from '@nestjs/common/constants';
import { RolController } from '../presentation/controllers/rol.controller';
import { MenuGestionController } from '../presentation/controllers/menu-gestion.controller';
import { PermisoController } from '../presentation/controllers/permiso.controller';
import { GRANULAR_REQUIREMENT } from '../infrastructure/auth/granular-permission.guard';
import { securityPolicies } from './modules/platform/authorization.module';

describe('Cobertura del corte administrativo granular', () => {
  it.each([RolController, MenuGestionController, PermisoController])('cada ruta de %s exige una política registrada', controller => {
    const policies = securityPolicies();
    const prototype = controller.prototype;
    const handlers = Object.getOwnPropertyNames(prototype).map(key => prototype[key] as unknown)
      .filter((handler): handler is (...args: unknown[]) => unknown => typeof handler === 'function' && Reflect.getMetadata(METHOD_METADATA, handler) !== undefined);
    expect(handlers.length).toBeGreaterThan(0);
    for (const handler of handlers) {
      const codes = Reflect.getMetadata(GRANULAR_REQUIREMENT, handler) as string[];
      expect(codes?.length).toBeGreaterThan(0);
      for (const code of codes) {
        expect(policies.get(code)?.mode).toBe('global');
        expect(policies.get(code)?.allowedScopes).toEqual(['global']);
      }
    }
  });
});
