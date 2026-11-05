import { ListarEstadosPlanesUseCase } from './listar-estados-planes.use-case';
import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import { EstadosPlanesQueryDto } from '../../../../presentation/dtos/planificacion/proyectos/estados-planes-query.dto';
describe('O1 estados de planes por lote', () => {
  const repository = {
    proyectosAsignados: jest.fn(),
    listarEstadosPlanes: jest.fn(),
    listarResumenPlanes: jest.fn(),
  };
  const useCase = new ListarEstadosPlanesUseCase(
    repository as unknown as IPlanificacionRepository,
  );
  beforeEach(() => jest.resetAllMocks());
  it('resumen filtra el alcance y consulta un solo lote, sin recalcular en TypeScript', async () => {
    repository.proyectosAsignados.mockResolvedValue([8]);
    repository.listarResumenPlanes.mockResolvedValue([{ idproyecto: 8, metricas: { avancereal: 0 } }]);
    expect(await useCase.execute(23, [8, 9, 8], 'asignados', true)).toEqual([{ idproyecto: 8, metricas: { avancereal: 0 } }]);
    expect(repository.listarResumenPlanes).toHaveBeenCalledWith(23, [8]);
    expect(repository.listarEstadosPlanes).not.toHaveBeenCalled();
  });
  it('resumen vacío o sin alcance no revela métricas ajenas', async () => {
    repository.proyectosAsignados.mockResolvedValue([]);
    expect(await useCase.execute(23, [9], 'asignados', true)).toEqual([]);
    expect(repository.listarResumenPlanes).not.toHaveBeenCalled();
    await expect(useCase.execute(23, [8], 'propios', true)).rejects.toMatchObject({ kind: 'forbidden' });
  });
  it('todos consulta una vez y elimina duplicados', async () => {
    const rows = [
      {
        idproyecto: 8,
        idplan: 2,
        idestadoplan: 700,
        revision: 1,
        publicadoen: null,
      },
    ];
    repository.listarEstadosPlanes.mockResolvedValue(rows);
    expect(await useCase.execute(23, [8, 9, 8], 'todos')).toEqual(rows);
    expect(repository.listarEstadosPlanes).toHaveBeenCalledTimes(1);
    expect(repository.listarEstadosPlanes).toHaveBeenCalledWith(23, [8, 9]);
    expect(repository.proyectosAsignados).not.toHaveBeenCalled();
  });
  it('asignados excluye proyectos ajenos antes de consultar estados', async () => {
    repository.proyectosAsignados.mockResolvedValue([8, 10]);
    repository.listarEstadosPlanes.mockResolvedValue([]);
    await useCase.execute(23, [8, 9], 'asignados');
    expect(repository.proyectosAsignados).toHaveBeenCalledWith(23);
    expect(repository.listarEstadosPlanes).toHaveBeenCalledWith(23, [8]);
  });
  it('devuelve vacío sin consulta SQL de estados cuando no hay coincidencias', async () => {
    repository.proyectosAsignados.mockResolvedValue([]);
    expect(await useCase.execute(23, [9], 'asignados')).toEqual([]);
    expect(repository.listarEstadosPlanes).not.toHaveBeenCalled();
  });
  it.each(['global', 'propios'] as const)(
    'rechaza alcance no admitido %s',
    async (alcance) => {
      await expect(useCase.execute(23, [8], alcance)).rejects.toMatchObject({
        kind: 'forbidden',
      });
      expect(repository.listarEstadosPlanes).not.toHaveBeenCalled();
    },
  );
  it('transforma CSV en IDs enteros', () => {
    expect(EstadosPlanesQueryDto.schema.parse({ ids: '8, 9,8' })).toEqual({
      ids: [8, 9, 8],
    });
  });
  it.each([
    undefined,
    '',
    '0',
    '-1',
    '1,,2',
    '1.5',
    '1e2',
    '2147483648',
    '1;SELECT 1',
    ['1', '2'],
    Array(101).fill('1').join(','),
  ])('rechaza ids inválidos %j', (ids) => {
    expect(EstadosPlanesQueryDto.schema.safeParse({ ids }).success).toBe(false);
  });
  it('rechaza campos ajenos al contrato', () => {
    expect(
      EstadosPlanesQueryDto.schema.safeParse({ ids: '8', actor: 1 }).success,
    ).toBe(false);
  });
});
