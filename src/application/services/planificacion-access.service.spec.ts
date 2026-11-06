import { PlanificacionAccessService } from './planificacion-access.service';
import { AuthorizationService } from './authorization.service';
import type { IPlanificacionRepository } from '../../domain/repositories/planificacion.repository.interface';
import { CrearActividadPlanUseCase } from '../use-cases/planificacion/proyectos/crear-actividad.use-case';
import { MisAsignacionesUseCase } from '../use-cases/planificacion/proyectos/mis-asignaciones.use-case';
import { EstadoParteUseCase } from '../use-cases/planificacion/proyectos/estado-parte.use-case';
import { NotFoundError } from '../errors/application.error';
describe('Acceso de planificación y coordinación de casos de uso', () => {
  const repo = {
    tienePlan: jest.fn(),
    obtenerAsignacionPropia: jest.fn(),
    comprobarPertenencia: jest.fn(),
    crearActividad: jest.fn(),
    obtenerTrabajador: jest.fn(),
    misAsignaciones: jest.fn(),
    estadoParte: jest.fn(),
  };
  const authorization = { can: jest.fn() };
  const repository = repo as unknown as IPlanificacionRepository;
  const access = new PlanificacionAccessService(
    repository,
    authorization as unknown as AuthorizationService,
  );
  beforeEach(() => {
    jest.resetAllMocks();
    authorization.can.mockResolvedValue(true);
  });
  it('no llama la escritura si la entidad no pertenece al proyecto', async () => {
    repo.comprobarPertenencia.mockRejectedValue(new NotFoundError());
    await expect(
      new CrearActividadPlanUseCase(repository).execute(
        23,
        { id: 1, idPlan: 2 },
        { revisionPlan: 1, datos: { identregable: 1, nombre: 'A' } },
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.crearActividad).not.toHaveBeenCalled();
  });
  it.each([false, true])(
    'exige editar solo cuando existe plan: %s',
    async (tienePlan) => {
      repo.tienePlan.mockResolvedValue(tienePlan);
      authorization.can.mockResolvedValue(false);
      if (tienePlan)
        await expect(access.editarProyectoConPlan(23, 8)).rejects.toMatchObject(
          { kind: 'forbidden' },
        );
      else await access.editarProyectoConPlan(23, 8);
      expect(authorization.can).toHaveBeenCalledTimes(tienePlan ? 1 : 0);
      if (tienePlan)
        expect(authorization.can).toHaveBeenCalledWith(
          23,
          'proyectos.planificacion.editar',
          { type: 'gvr_project', id: '8' },
        );
    },
  );
  it('una parte culminada exige conformidad sobre su proyecto antes de escribir', async () => {
    repo.obtenerAsignacionPropia.mockResolvedValue({
      idproyecto: 8,
      idestadoactividad: 706,
      idtrabajador: 9,
    });
    authorization.can.mockResolvedValue(false);
    await expect(
      new EstadoParteUseCase(repository, access).execute(23, 4, {
        revision: 1,
        idEstadoDestino: 704,
        motivo: 'Reabrir',
      }),
    ).rejects.toMatchObject({ kind: 'forbidden' });
    expect(repo.estadoParte).not.toHaveBeenCalled();
    expect(authorization.can).toHaveBeenCalledWith(
      23,
      'proyectos.planificacion.dar_conformidad',
      { type: 'gvr_project', id: '8' },
    );
  });
  it('terminar una parte propia no exige el permiso del planificador', async () => {
    repo.obtenerAsignacionPropia.mockResolvedValue({
      idproyecto: 8,
      idestadoactividad: 704,
      idtrabajador: 9,
    });
    await new EstadoParteUseCase(repository, access).execute(23, 4, {
      revision: 1,
      idEstadoDestino: 706,
      motivo: 'Terminé',
    });
    expect(authorization.can).not.toHaveBeenCalled();
    expect(repo.estadoParte).toHaveBeenCalled();
  });
  it('el selector recibe la persona resuelta del JWT', async () => {
    repo.obtenerTrabajador.mockResolvedValue(9);
    await new MisAsignacionesUseCase(repository).execute(23, {
      fecha: '2026-10-22',
    });
    expect(repo.obtenerTrabajador).toHaveBeenCalledWith(23);
    expect(repo.misAsignaciones).toHaveBeenCalledWith(23, 9, {
      fecha: '2026-10-22',
    });
  });
});
