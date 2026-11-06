import { ObtenerContenidoCarpetaUseCase } from './obtener-contenido-carpeta.use-case';

type Dependencies = ConstructorParameters<
  typeof ObtenerContenidoCarpetaUseCase
>;

describe('Contenido de carpeta sin saturar consultas de auditoría', () => {
  function setup() {
    const items = Array.from({ length: 13 }, (_, id) => ({
      id: `folder-${id}`,
      type: 'folders',
    }));
    const api = {
      esTokenExpirado: jest.fn().mockReturnValue(false),
      obtenerContenidoCarpeta: jest.fn().mockResolvedValue({ data: items }),
    };
    const acc = {
      obtenerToken3LeggedPorUsuario: jest
        .fn()
        .mockResolvedValue({ tokenAcceso: 'fixture' }),
    };
    const audit = {
      obtenerAuditoriaPorMetadatos: jest.fn().mockResolvedValue(null),
      obtenerAuditoriasPorFolderId: jest.fn().mockResolvedValue([]),
    };
    const resources = {
      listarPermisosUsuario: jest.fn().mockResolvedValue({
        data: [{ resourcetype: 'folder', externalid: 'folder-0' }],
        pagination: { total: 1 },
      }),
    };
    return {
      items,
      audit,
      useCase: new ObtenerContenidoCarpetaUseCase(
        api as unknown as Dependencies[0],
        acc as unknown as Dependencies[1],
        audit as unknown as Dependencies[2],
        resources as unknown as Dependencies[3],
      ),
    };
  }

  it('limita la concurrencia a cuatro y conserva el orden de todos los elementos', async () => {
    const { useCase, items, audit } = setup();
    let active = 0,
      peak = 0;
    audit.obtenerAuditoriaPorMetadatos.mockImplementation(async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise<void>((resolve) => setImmediate(resolve));
      active--;
      return null;
    });
    const result = (await useCase.execute(
      1,
      'project',
      'folder',
      {},
      'administrador',
    )) as { data: unknown[] };
    expect(result.data).toEqual(items);
    expect(peak).toBe(4);
    expect(audit.obtenerAuditoriaPorMetadatos).toHaveBeenCalledTimes(
      items.length,
    );
    expect(audit.obtenerAuditoriasPorFolderId).toHaveBeenCalledTimes(
      items.length,
    );
  });

  it('no consulta la auditoría de carpetas sin acceso', async () => {
    const { useCase, items, audit } = setup();
    const result = (await useCase.execute(1, 'project', 'folder', {})) as {
      data: unknown[];
    };
    expect(result.data).toEqual([items[0]]);
    expect(audit.obtenerAuditoriaPorMetadatos).toHaveBeenCalledTimes(1);
    expect(audit.obtenerAuditoriaPorMetadatos).toHaveBeenCalledWith(
      'folder',
      'FOLDER_CREATE',
      'accFolderId',
      'folder-0',
    );
  });

  it('conserva los elementos cuando falla el enriquecimiento de auditoría', async () => {
    const { useCase, items, audit } = setup();
    audit.obtenerAuditoriaPorMetadatos.mockRejectedValue(
      new Error('Pool no disponible'),
    );
    const result = (await useCase.execute(
      1,
      'project',
      'folder',
      {},
      'administrador',
    )) as { data: unknown[] };
    expect(result.data).toEqual(items);
  });
});
