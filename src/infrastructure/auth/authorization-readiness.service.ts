import {
  Injectable,
  Inject,
  type OnApplicationBootstrap,
  type Type,
} from '@nestjs/common';
import { METHOD_METADATA } from '@nestjs/common/constants';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService, Reflector } from '@nestjs/core';
import {
  AUTHORIZATION_POLICIES,
  type AuthorizationPolicyRegistry,
} from '../../application/ports/authorization.port';
import {
  GRANULAR_AUTHENTICATED,
  GRANULAR_CONTEXTUAL,
  GRANULAR_REQUIREMENT,
} from './granular-permission.guard';

import { isSessionEndpoint } from './http-authorization-exceptions';

export interface AuthorizationCoverageGap {
  endpoint: string;
  reason: 'missing_requirement' | 'missing_policy';
  codes: string[];
}
export function inspectHttpAuthorization(
  controllers: readonly Type<unknown>[],
  policies: AuthorizationPolicyRegistry,
): AuthorizationCoverageGap[] {
  const reflector = new Reflector();
  const gaps: AuthorizationCoverageGap[] = [];
  for (const controller of controllers) {
    const visited = new Set<string>();
    let prototype = controller.prototype as Record<string, unknown> | null;
    while (prototype && prototype !== Object.prototype) {
      for (const name of Object.getOwnPropertyNames(prototype)) {
        if (visited.has(name)) continue;
        visited.add(name);
        const handler = Object.getOwnPropertyDescriptor(prototype, name)
          ?.value as unknown;
        if (
          typeof handler !== 'function' ||
          Reflect.getMetadata(METHOD_METADATA, handler) === undefined
        )
          continue;
        const endpoint = `${controller.name}.${name}`;
        if (isSessionEndpoint(controller.name, name)) continue;
        const codes = reflector.getAllAndOverride<string[]>(
          GRANULAR_REQUIREMENT,
          [handler, controller],
        );
        const contextual =
          reflector.getAllAndOverride<string>(GRANULAR_CONTEXTUAL, [
            handler,
            controller,
          ]) ??
          reflector.getAllAndOverride<string>(GRANULAR_AUTHENTICATED, [
            handler,
            controller,
          ]);
        if (!Array.isArray(codes) || !codes.length) {
          // Autorización declarada dentro del flujo (token, nivel documental, cron).
          if (contextual?.trim()) continue;
          gaps.push({ endpoint, reason: 'missing_requirement', codes: [] });
        } else {
          const missing = codes.filter((code) => !policies.has(code));
          if (missing.length)
            gaps.push({ endpoint, reason: 'missing_policy', codes: missing });
        }
      }
      prototype = Object.getPrototypeOf(prototype) as Record<
        string,
        unknown
      > | null;
    }
  }
  return gaps;
}
/**
 * Evita arrancar producción con operaciones HTTP sin control granular declarado
 * o con políticas inexistentes. No sustituye las pruebas de alcances/IDOR.
 * Desarrollo permanece disponible para completar la migración y sus pruebas.
 */
@Injectable()
export class AuthorizationReadinessService implements OnApplicationBootstrap {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly config: ConfigService,
    @Inject(AUTHORIZATION_POLICIES)
    private readonly policies: AuthorizationPolicyRegistry,
  ) {}
  onApplicationBootstrap(): void {
    if (
      this.config.get<string>('NODE_ENV')?.trim().toLowerCase() !== 'production'
    )
      return;
    const controllers = this.discovery
      .getControllers()
      .map((wrapper) => wrapper.metatype)
      .filter((type): type is Type<unknown> => typeof type === 'function');
    const gaps = inspectHttpAuthorization(controllers, this.policies);
    if (gaps.length)
      throw new Error(
        `AUTHORIZATION_NOT_READY: ${gaps.length} operaciones HTTP requieren integración de permisos. Producción bloqueada. ${gaps
          .slice(0, 12)
          .map((gap) => gap.endpoint)
          .join(', ')}`,
      );
  }
}
