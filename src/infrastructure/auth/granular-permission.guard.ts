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
import { AuthorizationService } from '../../application/services/authorization.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { firstValueFrom, isObservable } from 'rxjs';

export const GRANULAR_REQUIREMENT = 'gvr:granular-permissions';
/** OR entre acciones explícitas; cada política decide sus alcances permitidos. */
export const RequireGranularPermission = (...codes: string[]) =>
  SetMetadata(GRANULAR_REQUIREMENT, codes);

export const GRANULAR_RESOURCE = 'gvr:granular-resource';
export interface GranularResourceRequirement {
  type: string;
  /** Parámetro de ruta con el proyecto. */
  project: string;
  /** Parámetro de ruta con la incidencia, si la acción es sobre una incidencia concreta. */
  issue?: string;
}
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

@Injectable()
export class GranularPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtAuthGuard,
    private readonly authorization: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const codes = this.reflector.getAllAndOverride<string[]>(
      GRANULAR_REQUIREMENT,
      [context.getHandler(), context.getClass()],
    );
    if (codes === undefined) return true;
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
    }>();
    const actor = request.user?.sub;
    if (!Number.isSafeInteger(actor) || (actor as number) < 1)
      throw new UnauthorizedException('Sesión inválida');
    const requirement =
      this.reflector.getAllAndOverride<GranularResourceRequirement>(
        GRANULAR_RESOURCE,
        [context.getHandler(), context.getClass()],
      );
    const param = (name?: string) =>
      name ? String(request.params?.[name] ?? '').trim() : '';
    const project = param(requirement?.project);
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
    throw new ForbiddenException({
      message: 'No tienes permiso para realizar esta acción',
      code: 'GRANULAR_PERMISSION_DENIED',
    });
  }
}
