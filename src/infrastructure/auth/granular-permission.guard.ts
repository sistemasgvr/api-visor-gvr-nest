import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthorizationScope } from '../../application/ports/authorization.port';
import { AuthorizationService } from '../../application/services/authorization.service';
import { isSessionEndpoint } from './http-authorization-exceptions';
import { JwtAuthGuard } from './jwt-auth.guard';
import { firstValueFrom, isObservable } from 'rxjs';

export const GRANULAR_REQUIREMENT = 'gvr:granular-permissions';
/** OR entre acciones explícitas; cada política decide sus alcances permitidos. */
export const RequireGranularPermission = (...codes: string[]) =>
  SetMetadata(GRANULAR_REQUIREMENT, codes);

export const GRANULAR_SCOPED = 'gvr:granular-scoped';
/**
 * Listados y consultas filtrados por alcance (OR entre acciones): basta tener la
 * acción con cualquier alcance admitido. El caso de uso DEBE filtrar el resultado
 * con los alcances concedidos (`request.granularScopes`), nunca devolver todo.
 */
export const RequireScopedPermission = (...codes: string[]) =>
  applyDecorators(
    SetMetadata(GRANULAR_REQUIREMENT, codes),
    SetMetadata(GRANULAR_SCOPED, true),
  );

export const GRANULAR_CONTEXTUAL = 'gvr:contextual-authorization';
/**
 * Ruta autorizada dentro de su propio flujo (nivel documental del proyecto, token
 * firmado de un solo uso, secreto de cron, retorno OAuth). El guard granular no la
 * bloquea; los guards del controlador y el servicio siguen aplicando. Exige motivo.
 */
export const ContextualAuthorization = (reason: string) =>
  SetMetadata(GRANULAR_CONTEXTUAL, reason);

export const GRANULAR_AUTHENTICATED = 'gvr:authenticated-access';
/**
 * Datos de referencia o de la propia sesión que cualquier persona autenticada necesita
 * (listas de opciones, ubicaciones, su propio vínculo Autodesk). Exige JWT válido y motivo;
 * nunca para operaciones de negocio ni datos de otras personas.
 */
export const AuthenticatedAccess = (reason: string) =>
  SetMetadata(GRANULAR_AUTHENTICATED, reason);

export const GRANULAR_RESOURCE = 'gvr:granular-resource';
export interface GranularResourceRequirement {
  type: string;
  /** Parámetro con el ID del recurso (nombre histórico: `project`). */
  project: string;
  /** Parámetro de ruta con la incidencia, si la acción es sobre una incidencia concreta. */
  issue?: string;
  source?: 'params' | 'query' | 'body';
  /** El recurso es la propia identidad del actor (acciones «propios» personales). */
  self?: boolean;
}
/** Acciones de jornadas sobre un trabajador concreto, con límite y pertenencia en servidor. */
export const RequireWorkerPermission = (
  code: string,
  source: 'params' | 'query' | 'body' = 'params',
  param = 'idTrabajador',
) =>
  applyDecorators(
    SetMetadata(GRANULAR_REQUIREMENT, [code]),
    SetMetadata(GRANULAR_RESOURCE, {
      type: 'control_worker',
      project: param,
      source,
    } satisfies GranularResourceRequirement),
  );
/** Acción sobre el proyecto ACC de la ruta (OR entre códigos). */
export const RequireProjectPermission = (
  codes: string | string[],
  param = 'projectId',
) =>
  applyDecorators(
    SetMetadata(GRANULAR_REQUIREMENT, Array.isArray(codes) ? codes : [codes]),
    SetMetadata(GRANULAR_RESOURCE, {
      type: 'acc_project',
      project: param,
    } satisfies GranularResourceRequirement),
  );

/**
 * Acción sobre un recurso concreto (OR entre códigos). La política del tipo resuelve
 * en servidor propietario, asignación y límites; el ID de la petición sólo lo identifica.
 */
export const RequireResourcePermission = (
  codes: string | string[],
  type: string,
  param: string,
  source: 'params' | 'query' | 'body' = 'params',
) =>
  applyDecorators(
    SetMetadata(GRANULAR_REQUIREMENT, Array.isArray(codes) ? codes : [codes]),
    SetMetadata(GRANULAR_RESOURCE, {
      type,
      project: param,
      source,
    } satisfies GranularResourceRequirement),
  );

export const SELF_RESOURCE = 'self';
/** Acción personal («propios») sobre los datos del propio usuario autenticado. */
export const RequireSelfPermission = (...codes: string[]) =>
  applyDecorators(
    SetMetadata(GRANULAR_REQUIREMENT, codes),
    SetMetadata(GRANULAR_RESOURCE, {
      type: SELF_RESOURCE,
      project: '',
      self: true,
    } satisfies GranularResourceRequirement),
  );

/**
 * Acción sobre incidencias del proyecto ACC de la ruta (OR entre códigos). Con
 * `issue`, la política comprueba además si la incidencia está asignada.
 */
export const RequireIssuePermission = (
  codes: string | string[],
  options: { project?: string; issue?: string } = {},
) =>
  applyDecorators(
    SetMetadata(GRANULAR_REQUIREMENT, Array.isArray(codes) ? codes : [codes]),
    SetMetadata(GRANULAR_RESOURCE, {
      type: 'acc_issue',
      project: options.project ?? 'projectId',
      issue: options.issue,
    } satisfies GranularResourceRequirement),
  );

/** Alcances concedidos por acción que el guard deja en la petición para filtrar en servidor. */
export type GranularScopesByCode = Record<string, AuthorizationScope[]>;

@Injectable()
export class GranularPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtAuthGuard,
    private readonly authorization: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const codes = this.reflector.getAllAndOverride<string[]>(
      GRANULAR_REQUIREMENT,
      targets,
    );
    // Excepciones concretas de sesión/protocolo, nunca un bypass por rol.
    if (
      codes === undefined &&
      isSessionEndpoint(context.getClass().name, context.getHandler().name)
    )
      return true;
    const contextual = this.reflector.getAllAndOverride<string>(
      GRANULAR_CONTEXTUAL,
      targets,
    );
    if (codes === undefined && contextual?.trim()) return true;
    // APP_GUARD corre antes que los guards locales: validar JWT aquí antes de usar su identidad.
    const validation = this.jwt.canActivate(context);
    const authenticated = isObservable(validation)
      ? await firstValueFrom(validation)
      : await validation;
    if (authenticated !== true)
      throw new UnauthorizedException('Sesión inválida');
    const request = context.switchToHttp().getRequest<{
      user?: { sub?: number };
      params?: Record<string, string | undefined>;
      query?: Record<string, unknown>;
      body?: Record<string, unknown>;
      granularScopes?: GranularScopesByCode;
    }>();
    const actor = request.user?.sub;
    if (!Number.isSafeInteger(actor) || (actor as number) < 1)
      throw new UnauthorizedException('Sesión inválida');
    if (
      codes === undefined &&
      this.reflector
        .getAllAndOverride<string>(GRANULAR_AUTHENTICATED, targets)
        ?.trim()
    )
      return true;
    if (!codes?.length)
      throw new ForbiddenException({
        message:
          'Esta operación todavía no tiene una política de acceso configurada',
        code: 'GRANULAR_POLICY_NOT_CONFIGURED',
      });
    if (this.reflector.getAllAndOverride<boolean>(GRANULAR_SCOPED, targets)) {
      const granted: GranularScopesByCode = {};
      for (const code of codes) {
        const scopes = await this.authorization.scopesFor(
          actor as number,
          code,
        );
        if (scopes.length) granted[code] = scopes;
      }
      if (Object.keys(granted).length) {
        request.granularScopes = { ...request.granularScopes, ...granted };
        return true;
      }
      throw this.denied();
    }
    const requirement =
      this.reflector.getAllAndOverride<GranularResourceRequirement>(
        GRANULAR_RESOURCE,
        targets,
      );
    const container =
      requirement?.source === 'query'
        ? request.query
        : requirement?.source === 'body'
          ? request.body
          : request.params;
    // Sólo identificadores escalares: un objeto en el cuerpo no identifica un recurso.
    const param = (name?: string) => {
      const raw = name ? container?.[name] : undefined;
      return typeof raw === 'string' || typeof raw === 'number'
        ? String(raw).trim()
        : '';
    };
    const project = requirement?.self
      ? String(actor)
      : param(requirement?.project);
    const issue = param(requirement?.issue);
    const resource = requirement
      ? {
          type: requirement.type,
          id: requirement.issue ? `${project}/${issue}` : project,
        }
      : null;
    if (requirement && (!project || (requirement.issue && !issue)))
      throw new ForbiddenException('Recurso no válido');
    for (const code of codes)
      if (await this.authorization.can(actor as number, code, resource))
        return true;
    throw this.denied();
  }

  private denied() {
    return new ForbiddenException({
      message: 'No tienes permiso para realizar esta acción',
      code: 'GRANULAR_PERMISSION_DENIED',
    });
  }
}
