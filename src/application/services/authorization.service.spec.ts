import { AuthorizationService } from './authorization.service';
import type { AuthorizationPolicy, AuthorizationSnapshot, ResourceAuthorizationFacts } from '../ports/authorization.port';

describe('Prepared granular authorization service (no SQL)', () => {
  const resource = { type: 'proyecto', id: '42' };
  let snapshot: AuthorizationSnapshot;
  let facts: ResourceAuthorizationFacts;
  let policy: AuthorizationPolicy;
  let readCurrent: jest.Mock;
  let service: AuthorizationService;
  beforeEach(() => {
    snapshot = { active: true, grants: [{ code: 'proyectos.proyectos.editar', scopes: ['asignados'] }] };
    facts = { resource, activeBoundary: true, businessRulesAllow: true, assignedUserIds: [7] };
    readCurrent = jest.fn(async () => snapshot);
    policy = { mode: 'resource', allowedScopes: ['propios', 'asignados', 'todos'], resourceType: 'proyecto', resolve: jest.fn(async () => facts) };
    service = new AuthorizationService({ readCurrent }, new Map([['proyectos.proyectos.editar', policy]]));
  });
  it('denies an undefined policy and invalid identities', async () => {
    expect(await service.can(7, 'desconocido', resource)).toBe(false);
    expect(await service.can(0, 'proyectos.proyectos.editar', resource)).toBe(false);
  });
  it('checks the actual assignment for the requested resource', async () => {
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(true);
    facts = { ...facts, assignedUserIds: [8] };
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
  });
  it('requires ownership for own resources', async () => {
    snapshot.grants = [{ code: 'proyectos.proyectos.editar', scopes: ['propios'] }];
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
    facts.ownerUserId = 7;
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(true);
  });
  it('keeps company/account boundaries and business rules for all resources', async () => {
    snapshot.grants = [{ code: 'proyectos.proyectos.editar', scopes: ['todos'] }];
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(true);
    facts.activeBoundary = false;
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
    facts.activeBoundary = true; facts.businessRulesAllow = false;
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
  });
  it('denies inactive users and absent grants', async () => {
    snapshot.active = false;
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
    snapshot = { active: true, grants: [] };
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
  });
  it('does not interpret string booleans as affirmative authorization facts', async () => {
    snapshot.active = 'false' as unknown as boolean;
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
    snapshot.active = true; facts.activeBoundary = 'false' as unknown as boolean;
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
  });
  it('does not treat global as a wildcard on resources', async () => {
    snapshot.grants = [{ code: 'proyectos.proyectos.editar', scopes: ['global'] }];
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
  });
  it('rejects a different resource type or facts for another ID', async () => {
    expect(await service.can(7, 'proyectos.proyectos.editar', { type: 'empresa', id: '42' })).toBe(false);
    facts.resource = { type: 'proyecto', id: '99' };
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
  });
  it('observes revocation on the next call instead of caching grants', async () => {
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(true);
    snapshot.grants = [];
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
    expect(readCurrent).toHaveBeenCalledTimes(2);
  });
  it('fails closed on unavailable authorization data or policy resolution', async () => {
    readCurrent.mockRejectedValueOnce(new Error('reader unavailable'));
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
    policy.resolve = async () => { throw new Error('resource unavailable'); };
    expect(await service.can(7, 'proyectos.proyectos.editar', resource)).toBe(false);
  });
  it('requires explicit global policy and scope for administrative actions', async () => {
    const code = 'seguridad.roles.asignar_permisos';
    snapshot.grants = [{ code, scopes: ['global'] }];
    const global = new AuthorizationService({ readCurrent }, new Map([[code, {
      mode: 'global', allowedScopes: ['global'], resolve: async () => ({ resource: null, activeBoundary: true, businessRulesAllow: true }),
    }]]));
    expect(await global.can(7, code)).toBe(true);
    expect(await global.can(7, code, resource)).toBe(false);
    snapshot.grants = [{ code, scopes: ['asignados'] }];
    expect(await global.can(7, code)).toBe(false);
  });
});
