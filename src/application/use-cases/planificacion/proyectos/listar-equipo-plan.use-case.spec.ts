import { ListarEquipoPlanUseCase } from './listar-equipo-plan.use-case';
import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import { NotFoundError } from '../../../errors/application.error';
describe('O2 equipo del proyecto', () => {
  const repository = {
    comprobarPertenencia: jest.fn(),
    listarEquipoPlan: jest.fn(),
  };
  const useCase = new ListarEquipoPlanUseCase(
    repository as unknown as IPlanificacionRepository,
  );
  beforeEach(() => jest.resetAllMocks());
  it('propaga actor y proyecto sin requerir que ya exista un plan', async () => {
    const rows = [
      {
        idtrabajador: 4,
        nombre: 'Persona',
        foto: null,
        puesto: null,
        idcalendario: null,
        tienecalendariopublicado: false,
      },
    ];
    repository.listarEquipoPlan.mockResolvedValue(rows);
    expect(await useCase.execute(23, { id: 8 })).toEqual(rows);
    expect(repository.listarEquipoPlan).toHaveBeenCalledWith(23, 8);
  });
  it('no consulta otro recurso si falla la pertenencia', async () => {
    repository.comprobarPertenencia.mockRejectedValue(new NotFoundError());
    await expect(useCase.execute(23, { id: 8 })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(repository.listarEquipoPlan).not.toHaveBeenCalled();
  });
});
