import type {
  AuthorizationPolicyRegistry,
  AuthorizationReader,
  ProtectedResource,
} from '../ports/authorization.port';

/**
 * Las políticas cargan hechos del servidor y verifican el límite de cuenta/empresa.
 * Una acción sin política registrada se deniega, incluso si existe en el catálogo.
 */
export class AuthorizationService {
  constructor(
    private readonly reader: AuthorizationReader,
    private readonly policies: AuthorizationPolicyRegistry,
  ) {}

  async can(
    userId: number,
    code: string,
    resource: ProtectedResource | null = null,
  ): Promise<boolean> {
    if (!Number.isSafeInteger(userId) || userId < 1) return false;
    const policy = this.policies.get(code);
    if (!policy) return false;
    if (policy.mode === 'resource') {
      if (
        !policy.resourceType ||
        !resource ||
        typeof resource.id !== 'string' ||
        !resource.id.trim() ||
        resource.type !== policy.resourceType
      )
        return false;
    } else if (resource !== null) {
      return false;
    }

    // Unavailable readers/policies deny access; availability is not permission.
    try {
      const snapshot = await this.reader.readCurrent(userId);
      if (snapshot.active !== true) return false;
      const scopes = snapshot.grants
        .filter((grant) => grant.code === code)
        .flatMap((grant) => [...grant.scopes])
        .filter((scope) => policy.allowedScopes.includes(scope));
      if (!scopes.length) return false;
      const facts = await policy.resolve(userId, resource);
      if (facts.activeBoundary !== true || facts.businessRulesAllow !== true)
        return false;
      if (policy.mode === 'global')
        return facts.resource === null && scopes.includes('global');
      if (
        !resource ||
        !facts.resource ||
        facts.resource.type !== resource.type ||
        facts.resource.id !== resource.id
      )
        return false;
      // 'todos' still requires the authoritative boundary and process rules above.
      return (
        scopes.includes('todos') ||
        (scopes.includes('propios') && facts.ownerUserId === userId) ||
        (scopes.includes('asignados') &&
          facts.assignedUserIds?.includes(userId) === true)
      );
    } catch {
      return false;
    }
  }
}
