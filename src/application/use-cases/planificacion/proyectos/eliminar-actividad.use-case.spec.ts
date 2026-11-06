import { EliminarActividadPlanUseCase } from './eliminar-actividad.use-case';
import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import { EliminarActividadPlanDto } from '../../../../presentation/dtos/planificacion/proyectos/planificacion.dto';
import { PlanificacionRepository } from '../../../../infrastructure/repositories/planificacion.repository';
import type { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

describe('Eliminar actividad del cronograma', () => {
  const ctx = { id: 38, idPlan: 81, idActividad: 258 };
  const data = {
    revisionPlan: 127,
    revision: 4,
    dependencias: 'reconectar' as const,
    motivo: 'Fuera de alcance',
  };
  const crear = (overrides: Partial<Record<string, jest.Mock>> = {}) => {
    const repository = {
      comprobarPertenencia: jest.fn().mockResolvedValue(undefined),
      analizarEliminacionActividad: jest
        .fn()
        .mockResolvedValue({ permitido: true }),
      eliminarActividad: jest.fn().mockResolvedValue({ idactividad: 258 }),
      ...overrides,
    };
    return {
      repository,
      useCase: new EliminarActividadPlanUseCase(
        repository as unknown as IPlanificacionRepository,
      ),
    };
  };

  it('analiza solo después de comprobar que la actividad es del proyecto', async () => {
    const { repository, useCase } = crear();
    await expect(useCase.analizar(1, ctx)).resolves.toEqual({
      permitido: true,
    });
    expect(
      repository.comprobarPertenencia.mock.invocationCallOrder[0],
    ).toBeLessThan(
      repository.analizarEliminacionActividad.mock.invocationCallOrder[0]!,
    );
  });

  it('no elimina una actividad ajena al proyecto', async () => {
    const { repository, useCase } = crear({
      comprobarPertenencia: jest.fn().mockRejectedValue(new Error('Ajena')),
    });
    await expect(useCase.execute(1, ctx, data)).rejects.toThrow('Ajena');
    expect(repository.eliminarActividad).not.toHaveBeenCalled();
  });

  it('envía el modo de dependencias a la versión nueva de SQL', async () => {
    const database = {
      callFunctionSingle: jest.fn().mockResolvedValue({
        pla_EliminarActividadV2: {
          idactividad: 258,
          revisionplan: 128,
          dependenciasretiradas: 2,
          dependenciascreadas: [],
        },
      }),
    };
    const repository = new PlanificacionRepository(
      database as unknown as DatabaseFunctionService,
    );
    await repository.eliminarActividad(1, ctx, data);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_EliminarActividadV2',
      [1, 258, 127, 4, 'reconectar', 'Fuera de alcance'],
    );
  });

  it('rechaza una respuesta de análisis incompleta', async () => {
    const database = {
      callFunctionSingle: jest.fn().mockResolvedValue({
        pla_AnalizarEliminacionActividad: { permitido: true },
      }),
    };
    const repository = new PlanificacionRepository(
      database as unknown as DatabaseFunctionService,
    );
    await expect(
      repository.analizarEliminacionActividad(1, ctx),
    ).rejects.toThrow();
  });

  it.each([
    [{ revisionPlan: 1, revision: 1 }, true],
    [{ revisionPlan: 1, revision: 1, dependencias: 'quitar' }, true],
    [{ revisionPlan: 1, revision: 1, dependencias: 'borrar' }, false],
    [{ revisionPlan: 1, dependencias: 'quitar' }, false],
  ])('valida la query %j', (query, valido) => {
    expect(EliminarActividadPlanDto.schema.safeParse(query).success).toBe(
      valido,
    );
  });
});
