import { ObtenerCalendarioPlanUseCase } from './obtener-calendario-plan.use-case';
import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import { CalendarioPlanQueryDto } from '../../../../presentation/dtos/planificacion/proyectos/calendario-plan-query.dto';
import { NotFoundError } from '../../../errors/application.error';
describe('O4 calendario operativo del plan', () => {
  const repo = {
    comprobarPertenencia: jest.fn(),
    obtenerCalendarioPlan: jest.fn(),
  };
  const useCase = new ObtenerCalendarioPlanUseCase(
    repo as unknown as IPlanificacionRepository,
  );
  const ctx = { id: 8, idPlan: 2 },
    data = { desde: '2026-10-19', hasta: '2026-10-25' };
  beforeEach(() => jest.resetAllMocks());
  it('consulta el calendario con actor y contexto después de comprobar pertenencia', async () => {
    repo.obtenerCalendarioPlan.mockResolvedValue({
      idcalendario: 6,
      nombre: 'Laboral',
      idversion: 3,
      dias: [],
    });
    await useCase.execute(23, ctx, data);
    expect(repo.comprobarPertenencia).toHaveBeenCalledWith(ctx);
    expect(repo.obtenerCalendarioPlan).toHaveBeenCalledWith(23, ctx, data);
  });
  it('no consulta un plan de otro proyecto', async () => {
    repo.comprobarPertenencia.mockRejectedValue(new NotFoundError());
    await expect(useCase.execute(23, ctx, data)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(repo.obtenerCalendarioPlan).not.toHaveBeenCalled();
  });
  it.each([
    { desde: '2026-10-19', hasta: '2026-10-19' },
    { desde: '2026-01-01', hasta: '2027-01-01' },
    { desde: '2028-01-01', hasta: '2028-12-31' },
  ])('acepta rango inclusivo válido %j', (query) => {
    expect(CalendarioPlanQueryDto.schema.parse(query)).toEqual(query);
  });
  it.each([
    {},
    { desde: '2026-10-19' },
    { hasta: '2026-10-19' },
    { desde: '2026-10-20', hasta: '2026-10-19' },
    { desde: '2026-01-01', hasta: '2027-01-02' },
    { desde: '2026-02-30', hasta: '2026-03-01' },
    { desde: '2026-02-29', hasta: '2026-03-01' },
    { desde: '0000-01-01', hasta: '0000-01-02' },
    { desde: '2026-10-19T00:00:00Z', hasta: '2026-10-20' },
    { desde: ['2026-10-19'], hasta: '2026-10-20' },
    { desde: '2026-10-19', hasta: '2026-10-20', idcalendario: 99 },
  ])('rechaza query inválida %j', (query) => {
    expect(CalendarioPlanQueryDto.schema.safeParse(query).success).toBe(false);
  });
});
