import { ReordenarUseCase } from './reordenar.use-case';
import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import { OrdenPlanDto } from '../../../../presentation/dtos/planificacion/proyectos/planificacion.dto';
describe('Reorganización del cronograma', () => {
  const ctx = { id: 38, idPlan: 2 };
  const data = {
    revisionPlan: 8,
    entregables: [4, 3],
    actividades: [6, 5],
    movimientos: [{ idactividad: 5, identregable: 4, revision: 2 }],
  };
  it('valida pertenencia antes de enviar una operación atómica', async () => {
    const repository = {
      comprobarPertenencia: jest.fn().mockResolvedValue(undefined),
      reordenar: jest.fn().mockResolvedValue(true),
    };
    expect(
      await new ReordenarUseCase(
        repository as unknown as IPlanificacionRepository,
      ).execute(1, ctx, data),
    ).toBe(true);
    expect(repository.comprobarPertenencia).toHaveBeenCalledWith(ctx);
    expect(repository.reordenar).toHaveBeenCalledWith(1, ctx, data);
    expect(
      repository.comprobarPertenencia.mock.invocationCallOrder[0],
    ).toBeLessThan(repository.reordenar.mock.invocationCallOrder[0]!);
  });
  it('no escribe si el plan no pertenece al proyecto', async () => {
    const repository = {
      comprobarPertenencia: jest
        .fn()
        .mockRejectedValue(new Error('Otro proyecto')),
      reordenar: jest.fn(),
    };
    await expect(
      new ReordenarUseCase(
        repository as unknown as IPlanificacionRepository,
      ).execute(1, ctx, data),
    ).rejects.toThrow('Otro proyecto');
    expect(repository.reordenar).not.toHaveBeenCalled();
  });
  it('mantiene el contrato de orden sin movimientos', () => {
    expect(
      OrdenPlanDto.schema.safeParse({ ...data, movimientos: undefined })
        .success,
    ).toBe(true);
  });
  it.each([
    { ...data, movimientos: [data.movimientos[0], data.movimientos[0]] },
    { ...data, movimientos: [{ ...data.movimientos[0], revision: 0 }] },
    { ...data, movimientos: [{ ...data.movimientos[0], identregable: -1 }] },
    {
      ...data,
      movimientos: [{ ...data.movimientos[0], nombre: 'no se edita' }],
    },
    { ...data, actividades: [5, 5] },
  ])('rechaza movimientos mal formados o repetidos', (invalid) => {
    expect(OrdenPlanDto.schema.safeParse(invalid).success).toBe(false);
  });
});
