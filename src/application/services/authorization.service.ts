import type {
  AuthorizationPolicyRegistry,
  AuthorizationReader,
  AuthorizationScope,
  ProtectedResource,
} from '../ports/authorization.port';

/** De mayor a menor amplitud; `global` sólo aplica a políticas globales. */
const SCOPE_ORDER: readonly AuthorizationScope[] = [
  'global',
  'todos',
  'asignados',
  'propios',
];

/**
 * Las políticas cargan hechos del servidor y verifican el límite de cuenta/empresa.
 * Una acción sin política registrada se deniega, incluso si existe en el catálogo.
 */
export class AuthorizationService {
  constructor(
    private readonly reader: AuthorizationReader,
    private readonly policies: AuthorizationPolicyRegistry,
  ) {}

  /**
   * Alcances vigentes de la acción que su política admite (vacío si no la tiene).
   * Sirve para filtrar listados en el servidor; no autoriza por sí solo un recurso concreto.
   */
  async scopesFor(userId: number, code: string): Promise<AuthorizationScope[]> {
    if (!Number.isSafeInteger(userId) || userId < 1) return [];
    const policy = this.policies.get(code);
    if (!policy) return [];
    try {
      const snapshot = await this.reader.readCurrent(userId);
      if (snapshot.active !== true) return [];
      const granted = new Set(
        snapshot.grants
          .filter((grant) => grant.code === code)
          .flatMap((grant) => [...grant.scopes])
          .filter((scope) => policy.allowedScopes.includes(scope)),
      );
      return SCOPE_ORDER.filter((scope) => granted.has(scope));
    } catch {
      return [];
    }
  }

  /** Alcance más amplio concedido para la acción, o `null` si no la tiene. */
  async broadestScope(
    userId: number,
    code: string,
  ): Promise<AuthorizationScope | null> {
    return (await this.scopesFor(userId, code))[0] ?? null;
  }

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
