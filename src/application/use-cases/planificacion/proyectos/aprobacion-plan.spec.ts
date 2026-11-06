import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import {
  ForbiddenError,
  InvalidInputError,
} from '../../../errors/application.error';
import { PublicarUseCase } from './publicar.use-case';
import { LineaBaseUseCase } from './linea-base.use-case';

describe('Aprobación del Gantt y líneas base', () => {
  const ctx = { id: 8, idPlan: 2 };
  const data = { revisionPlan: 3, motivo: 'Revisado', nombre: 'Aprobada' };
  const repository = {
    comprobarPertenencia: jest.fn(),
    obtenerPlan: jest.fn(),
    obtenerTrabajador: jest.fn(),
    listarAprobadoresPlan: jest.fn(),
    publicar: jest.fn(),
    lineaBase: jest.fn(),
  };
  const port = repository as unknown as IPlanificacionRepository;
  beforeEach(() => {
    jest.resetAllMocks();
    repository.obtenerPlan.mockResolvedValue({
      plan: { id: 2, idaprobador: 4 },
    });
    repository.obtenerTrabajador.mockResolvedValue(4);
    repository.listarAprobadoresPlan.mockResolvedValue([
      { idtrabajador: 4, escoordinador: true },
    ]);
  });

  const operations = [
    {
      name: 'publicar',
      execute: () => new PublicarUseCase(port).execute(23, ctx, data),
    },
    {
      name: 'lineaBase',
      execute: () => new LineaBaseUseCase(port).execute(23, ctx, data),
    },
  ] as const;
  describe.each(operations)('$name', ({ name, execute }) => {
    it('permite al coordinador designado sin exigir el nuevo permiso al coordinador', async () => {
      await execute();
      expect(repository[name]).toHaveBeenCalledWith(23, ctx, data);
      expect(repository.listarAprobadoresPlan).toHaveBeenCalledWith(
        23,
        8,
        'proyectos.planificacion.aprobar_ampliaciones',
      );
    });
    it('permite al candidato adicional cuando es el aprobador designado', async () => {
      repository.listarAprobadoresPlan.mockResolvedValue([
        { idtrabajador: 4, escoordinador: false },
      ]);
      await execute();
      expect(repository[name]).toHaveBeenCalled();
    });
    it('rechaza a otro usuario aunque tenga permiso para publicar', async () => {
      repository.obtenerTrabajador.mockResolvedValue(5);
      await expect(execute()).rejects.toBeInstanceOf(ForbiddenError);
      expect(repository[name]).not.toHaveBeenCalled();
    });
    it('rechaza si se retiró la coordinación o el permiso que lo habilitaba', async () => {
      repository.listarAprobadoresPlan.mockResolvedValue([]);
      await expect(execute()).rejects.toBeInstanceOf(InvalidInputError);
      expect(repository[name]).not.toHaveBeenCalled();
    });
    it('rechaza un plan distinto del solicitado', async () => {
      repository.obtenerPlan.mockResolvedValue({
        plan: { id: 99, idaprobador: 4 },
      });
      await expect(execute()).rejects.toBeInstanceOf(ForbiddenError);
      expect(repository[name]).not.toHaveBeenCalled();
    });
  });
});
