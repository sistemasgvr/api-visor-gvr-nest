import { AuthorizationService } from '../../application/services/authorization.service';
import type { AuthorizationScope } from '../../application/ports/authorization.port';
import type { DatabaseFunctionService } from '../database/database-function.service';
import { controlWorkerPolicies } from './control-worker-policies';

describe('Jornadas: permisos granulares y alcance del trabajador', () => {
  let scopes: AuthorizationScope[];
  const database = { executeQuery: jest.fn() };
  const authorization = new AuthorizationService(
    {
      readCurrent: () =>
        Promise.resolve({
          active: true,
          grants: [{ code: 'control_operativo.jornadas.ver', scopes }],
        }),
    },
    controlWorkerPolicies(database as unknown as DatabaseFunctionService),
  );
  const target = { type: 'control_worker', id: '109' };
  beforeEach(() => {
    scopes = ['propios'];
    database.executeQuery
      .mockReset()
      .mockResolvedValue([{ owner: 114, assigned: true }]);
  });
  it('concede el recurso propio y revoca inmediatamente al retirar la casilla', async () => {
    expect(
      await authorization.can(114, 'control_operativo.jornadas.ver', target),
    ).toBe(true);
    scopes = [];
    expect(
      await authorization.can(114, 'control_operativo.jornadas.ver', target),
    ).toBe(false);
  });
  it('propios no autoriza las jornadas de otra persona de la misma empresa', async () => {
    database.executeQuery.mockResolvedValue([{ owner: 999, assigned: true }]);
    expect(
      await authorization.can(114, 'control_operativo.jornadas.ver', target),
    ).toBe(false);
  });
  it('asignados requiere pertenencia al equipo del actor', async () => {
    scopes = ['asignados'];
    expect(
      await authorization.can(114, 'control_operativo.jornadas.ver', target),
    ).toBe(true);
    database.executeQuery.mockResolvedValue([{ owner: 999, assigned: false }]);
    expect(
      await authorization.can(114, 'control_operativo.jornadas.ver', target),
    ).toBe(false);
  });
  it('todos abarca a cualquier trabajador activo, sin límite de empresa', async () => {
    scopes = ['todos'];
    database.executeQuery.mockResolvedValue([{ owner: 999, assigned: false }]);
    expect(
      await authorization.can(114, 'control_operativo.jornadas.ver', target),
    ).toBe(true);
    database.executeQuery.mockResolvedValue([]);
    expect(
      await authorization.can(114, 'control_operativo.jornadas.ver', target),
    ).toBe(false);
  });
  it('rechaza identidades de recurso inválidas antes de consultar datos', async () => {
    expect(
      await authorization.can(114, 'control_operativo.jornadas.ver', {
        ...target,
        id: '1 OR true',
      }),
    ).toBe(false);
    expect(database.executeQuery).not.toHaveBeenCalled();
  });
  it('una autorización de lectura no concede creación ni exportación', async () => {
    expect(
      await authorization.can(114, 'control_operativo.jornadas.crear', target),
    ).toBe(false);
    expect(
      await authorization.can(
        114,
        'control_operativo.jornadas.exportar_word',
        target,
      ),
    ).toBe(false);
  });
});
