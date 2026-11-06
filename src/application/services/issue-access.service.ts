import { ForbiddenError } from '../errors/application.error';
import type { AuthorizationService } from './authorization.service';

/** Incidencia tal como la enriquecen los casos de uso (asignaciones reales en GVR). */
interface AssignedIssue {
  assignedToRealId?: unknown;
  assignedToRealIds?: unknown;
}

/**
 * Reglas de incidencias por rol (gestion_bim.incidencias.*), compartidas por ACC
 * y BIM 360: «todos» = cualquier incidencia de los proyectos donde participa;
 * «asignados» = sólo las asignadas a la persona.
 */
export class IssueAccessService {
  constructor(private readonly authorization: AuthorizationService) {}

  /** Sin `issue` evalúa el proyecto; con '*' exige poder actuar sobre todas. */
  allowed(userId: number, action: string, projectId: string, issue?: string) {
    return this.authorization.can(userId, `gestion_bim.incidencias.${action}`, {
      type: 'acc_issue',
      id: issue ? `${projectId}/${issue}` : projectId,
    });
  }

  async require(
    userId: number,
    action: string,
    projectId: string,
    issue: unknown,
  ): Promise<void> {
    if (
      typeof issue !== 'string' ||
      !issue.trim() ||
      !(await this.allowed(userId, action, projectId, issue.trim()))
    )
      throw new ForbiddenError({
        message: 'No tienes permiso sobre esta incidencia',
        code: 'GRANULAR_PERMISSION_DENIED',
      });
  }

  /** Con alcance «asignados» sólo se devuelven las incidencias asignadas a la persona. */
  async visible<T>(
    userId: number,
    projectId: string,
    issues: T[],
  ): Promise<T[]> {
    if (await this.allowed(userId, 'ver', projectId, '*')) return issues;
    return issues.filter((issue) => {
      const item = issue as AssignedIssue;
      return (
        item.assignedToRealId === userId ||
        (Array.isArray(item.assignedToRealIds) &&
          item.assignedToRealIds.includes(userId))
      );
    });
  }

  /** Cada tipo de cambio exige su propia acción sobre la incidencia. */
  async requireChanges(
    userId: number,
    projectId: string,
    issueId: string,
    changes: object | null | undefined,
  ): Promise<void> {
    const codes = new Set<string>();
    for (const [field, value] of Object.entries(changes ?? {})) {
      if (value === undefined) continue;
      if (field === 'status') codes.add('cambiar_estado');
      else if (field === 'assignedTo' || field === 'assignedToType')
        codes.add(
          (changes as { assignedTo?: unknown }).assignedTo
            ? 'asignar'
            : 'desasignar',
        );
      else codes.add('editar');
    }
    for (const code of codes)
      if (!(await this.allowed(userId, code, projectId, issueId)))
        throw new ForbiddenError({
          message:
            'No tienes permiso para realizar este cambio en la incidencia',
          code: 'GRANULAR_PERMISSION_DENIED',
        });
  }
}
