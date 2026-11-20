import { RolRepository } from './rol.repository';
import { DatabaseFunctionService } from '../database/database-function.service';

describe('Arreglos de permisos PostgreSQL', () => {
  const callFunctionSingle = jest.fn().mockResolvedValue({ success: true });
  const repo = new RolRepository({ callFunctionSingle } as unknown as DatabaseFunctionService);
  beforeEach(() => callFunctionSingle.mockClear());
  it('envía integer[] al asignar un lote, sin convertirlo en JSON', async () => {
    await repo.asignarPermisosRol({ idRol: 1, permisos: [2, 3], idUsuarioCreacion: 4 });
    expect(callFunctionSingle).toHaveBeenCalledWith('auth_AsignarPermisosRol', [1, [2, 3], 4]);
  });
  it('conserva integer[] al sincronizar con la firma existente', async () => {
    await repo.sincronizarPermisosRol({ idRol: 1, permisos: [], idUsuarioModificacion: 4 });
    expect(callFunctionSingle).toHaveBeenCalledWith('auth_SincronizarPermisosRol', [1, [], 4]);
  });
});
