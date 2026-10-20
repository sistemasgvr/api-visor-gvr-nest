export type AuthorizationScope = 'global' | 'propios' | 'asignados' | 'todos';
export const AUTHORIZATION_POLICIES = Symbol('AUTHORIZATION_POLICIES');

export interface EffectiveGrant {
  code: string;
  scopes: readonly AuthorizationScope[];
}

export interface AuthorizationSnapshot {
  active: boolean;
  grants: readonly EffectiveGrant[];
}

/** Read authoritative state on each call; JWT roles/localStorage are not a source. */
export interface AuthorizationReader {
  readCurrent(userId: number): Promise<AuthorizationSnapshot>;
}

export interface ProtectedResource {
  type: string;
  id: string;
}

/** Produced by a server-side policy using trusted resource data, never a request DTO. */
export interface ResourceAuthorizationFacts {
  resource: ProtectedResource | null;
  activeBoundary: boolean;
  businessRulesAllow: boolean;
  ownerUserId?: number;
  assignedUserIds?: readonly number[];
}

export interface AuthorizationPolicy {
  mode: 'global' | 'resource';
  allowedScopes: readonly AuthorizationScope[];
  resourceType?: string;
  resolve(userId: number, resource: ProtectedResource | null): Promise<ResourceAuthorizationFacts>;
}

export type AuthorizationPolicyRegistry = ReadonlyMap<string, AuthorizationPolicy>;
