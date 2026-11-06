import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthorizationScope } from '../../application/ports/authorization.port';
import type { GranularScopesByCode } from '../../infrastructure/auth/granular-permission.guard';

type GranularRequest = {
  user?: { sub?: number };
  granularScopes?: GranularScopesByCode;
};

/** ID del usuario autenticado (validado por el guard granular). */
export const ActorId = createParamDecorator(
  (_: unknown, context: ExecutionContext): number => {
    const id = context.switchToHttp().getRequest<GranularRequest>().user?.sub;
    if (!Number.isSafeInteger(id) || (id as number) < 1)
      throw new UnauthorizedException('Sesión inválida');
    return id as number;
  },
);

const ORDER: readonly AuthorizationScope[] = [
  'global',
  'todos',
  'asignados',
  'propios',
];

/**
 * Alcance más amplio que el guard concedió para las acciones indicadas (de
 * `@RequireScopedPermission`). Sin concesión responde 403: nunca se asume «todos».
 */
export const GrantedScope = createParamDecorator(
  (codes: string | string[], context: ExecutionContext): AuthorizationScope => {
    const granted =
      context.switchToHttp().getRequest<GranularRequest>().granularScopes ?? {};
    const scopes = new Set(
      (Array.isArray(codes) ? codes : [codes]).flatMap(
        (code) => granted[code] ?? [],
      ),
    );
    const scope = ORDER.find((item) => scopes.has(item));
    if (!scope)
      throw new ForbiddenException({
        message: 'No tienes permiso para realizar esta acción',
        code: 'GRANULAR_PERMISSION_DENIED',
      });
    return scope;
  },
);
