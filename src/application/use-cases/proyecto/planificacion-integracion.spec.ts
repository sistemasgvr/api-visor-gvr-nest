import { EditarProyectoUseCase } from './editar-proyecto.use-case';
import { CrearEntregableProyectoUseCase } from './crear-entregable-proyecto.use-case';
import { ActualizarEntregableProyectoUseCase } from './actualizar-entregable-proyecto.use-case';
import { EliminarEntregableProyectoUseCase } from './eliminar-entregable-proyecto.use-case';
import { PlanificacionAccessService } from '../../services/planificacion-access.service';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import type { LoggerFactoryPort } from '../../ports/runtime.port';
import type { BroadcastPort } from '../../ports/broadcast.port';
import { ForbiddenError } from '../../errors/application.error';
import type { UpdateProyectoDto } from '../../inputs/proyecto/update-proyecto.dto';
describe('Permiso adicional al cambiar proyectos y entregables planificados', () => {
  const repo = {
    obtenerEntregablePorId: jest.fn(),
    obtenerProyectoPorId: jest.fn(),
    editarProyecto: jest.fn(),
    crearEntregableProyecto: jest.fn(),
    actualizarEntregableProyecto: jest.fn(),
    eliminarEntregableProyecto: jest.fn(),
  };
  const access = { editarProyectoConPlan: jest.fn() };
  const logger = {
    create: () => ({
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    }),
  } as unknown as LoggerFactoryPort;
  const repository = repo as unknown as IProyectoRepository;
  const planning = access as unknown as PlanificacionAccessService;
  beforeEach(() => {
    jest.resetAllMocks();
    repo.obtenerEntregablePorId.mockResolvedValue({ id: 3, idproyecto: 8 });
    access.editarProyectoConPlan.mockRejectedValue(
      new ForbiddenError('Sin planificación.editar'),
    );
  });
  it('editar proyecto conserva el actor y exige el permiso antes de guardar', async () => {
    await expect(
      new EditarProyectoUseCase(repository, planning).execute(
        8,
        {} as UpdateProyectoDto,
        23,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(access.editarProyectoConPlan).toHaveBeenCalledWith(23, 8);
    expect(repo.editarProyecto).not.toHaveBeenCalled();
  });
  describe('calendario al editar proyecto', () => {
    const editar = (dto: Partial<UpdateProyectoDto>) =>
      new EditarProyectoUseCase(repository, planning).execute(
        8,
        dto as UpdateProyectoDto,
        23,
      );
    beforeEach(() => {
      access.editarProyectoConPlan.mockResolvedValue(undefined);
      repo.obtenerProyectoPorId.mockResolvedValue({ id: 8, idcalendario: 5 });
      repo.editarProyecto.mockResolvedValue({ success: true, message: 'ok' });
    });
    it('conserva el calendario actual si el formulario no lo envía', async () => {
      await editar({ nombreProyecto: 'Sin calendario en el formulario' });
      expect(repo.obtenerProyectoPorId).toHaveBeenCalledWith(8);
      expect(repo.editarProyecto).toHaveBeenCalledWith(
        expect.objectContaining({ idCalendario: 5 }),
      );
    });
    it('null explícito quita el calendario sin consultar el actual', async () => {
      await editar({ idCalendario: null });
      expect(repo.obtenerProyectoPorId).not.toHaveBeenCalled();
      expect(repo.editarProyecto).toHaveBeenCalledWith(
        expect.objectContaining({ idCalendario: null }),
      );
    });
    it('un calendario enviado reemplaza el actual', async () => {
      await editar({ idCalendario: 7 });
      expect(repo.obtenerProyectoPorId).not.toHaveBeenCalled();
      expect(repo.editarProyecto).toHaveBeenCalledWith(
        expect.objectContaining({ idCalendario: 7 }),
      );
    });
  });
  it('crear entregable exige el permiso adicional incluso con acceso total operativo', async () => {
    await expect(
      new CrearEntregableProyectoUseCase(
        repository,
        {} as BroadcastPort,
        logger,
        planning,
      ).execute({ idProyecto: 8, nombre: 'General' }, 23, true),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(access.editarProyectoConPlan).toHaveBeenCalledWith(23, 8);
    expect(repo.crearEntregableProyecto).not.toHaveBeenCalled();
  });
  it('editar entregable usa el proyecto obtenido del servidor', async () => {
    await expect(
      new ActualizarEntregableProyectoUseCase(
        repository,
        {} as BroadcastPort,
        logger,
        planning,
      ).execute(3, { nombre: 'General' }, 23, true),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(access.editarProyectoConPlan).toHaveBeenCalledWith(23, 8);
    expect(repo.actualizarEntregableProyecto).not.toHaveBeenCalled();
  });
  it('eliminar entregable exige el permiso antes de la baja', async () => {
    await expect(
      new EliminarEntregableProyectoUseCase(repository, planning).execute(
        3,
        23,
        true,
        2,
        'Retirar',
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(access.editarProyectoConPlan).toHaveBeenCalledWith(23, 8);
    expect(repo.eliminarEntregableProyecto).not.toHaveBeenCalled();
  });
});
