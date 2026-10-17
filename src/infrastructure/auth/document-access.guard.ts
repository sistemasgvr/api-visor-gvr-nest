import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom, isObservable } from 'rxjs';
import { DocumentAccessService } from '../../application/services/document-access.service';
import { JwtAuthGuard } from './jwt-auth.guard';

export const DOCUMENT_PROJECT_REQUIREMENT = 'gvr:document-project';
export interface DocumentProjectRequirement {
  /** member: alguna asignación en el proyecto; admin: «Administrar» en el proyecto. */
  access: 'member' | 'admin';
  /** Parámetro de ruta con el proyecto ACC. */
  param: string;
}

/**
 * Acceso a nivel de proyecto BIM según las asignaciones del proyecto/carpetas
 * (revisiones, flujos, configuración documental). El acceso total por rol lo cubre.
 */
export const RequireDocumentProject = (
  access: DocumentProjectRequirement['access'],
  param = 'projectId',
) =>
  SetMetadata(DOCUMENT_PROJECT_REQUIREMENT, {
    access,
    param,
  } satisfies DocumentProjectRequirement);

@Injectable()
export class DocumentAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtAuthGuard,
    private readonly documents: DocumentAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement =
      this.reflector.getAllAndOverride<DocumentProjectRequirement>(
        DOCUMENT_PROJECT_REQUIREMENT,
        [context.getHandler(), context.getClass()],
      );
    if (!requirement) return true;
    // APP_GUARD corre antes que los guards locales: validar JWT antes de usar la identidad.
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
    const project = String(request.params?.[requirement.param] ?? '').trim();
    if (requirement.access === 'admin')
      await this.documents.assertProjectAdmin(actor as number, project);
    else await this.documents.assertProjectMember(actor as number, project);
    return true;
  }
}
