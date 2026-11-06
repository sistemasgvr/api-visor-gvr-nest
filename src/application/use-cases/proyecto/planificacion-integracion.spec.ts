import { CreateEntregableProyectoDto } from '../../../presentation/dtos/proyecto/create-entregable-proyecto.dto';
import { EditarProyectoUseCase } from './editar-proyecto.use-case';
import { CrearEntregableProyectoUseCase } from './crear-entregable-proyecto.use-case';
import { ActualizarEntregableProyectoUseCase } from './actualizar-entregable-proyecto.use-case';
import { EliminarEntregableProyectoUseCase } from './eliminar-entregable-proyecto.use-case';
import { PlanificacionAccessService } from '../../services/planificacion-access.service';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import type { IPlanificacionRepository } from '../../../domain/repositories/planificacion.repository.interface';
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
  const plan = { analizarEliminacionEntregable: jest.fn() };
  const planRepository = plan as unknown as IPlanificacionRepository;
  it('eliminar entregable exige el permiso antes de la baja', async () => {
    await expect(
      new EliminarEntregableProyectoUseCase(
        repository,
        planning,
        planRepository,
      ).execute(3, 23, true, 2, 'Retirar'),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(access.editarProyectoConPlan).toHaveBeenCalledWith(23, 8);
    expect(repo.eliminarEntregableProyecto).not.toHaveBeenCalled();
  });
  it('analizar la eliminación exige los mismos permisos que eliminar', async () => {
    await expect(
      new EliminarEntregableProyectoUseCase(
        repository,
        planning,
        planRepository,
      ).analizar(3, 23, true),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(plan.analizarEliminacionEntregable).not.toHaveBeenCalled();
  });
  it('analizar devuelve las reglas de SQL cuando el actor puede eliminar', async () => {
    access.editarProyectoConPlan.mockResolvedValue(true);
    const analisis = { permitido: false, bloqueos: [{ codigo: 'registros' }] };
    plan.analizarEliminacionEntregable.mockResolvedValue(analisis);
    await expect(
      new EliminarEntregableProyectoUseCase(
        repository,
        planning,
        planRepository,
      ).analizar(3, 23, true),
    ).resolves.toBe(analisis);
    expect(plan.analizarEliminacionEntregable).toHaveBeenCalledWith(23, 3);
  });
  it('sin alcance total, analizar rechaza a quien no gestiona el entregable', async () => {
    access.editarProyectoConPlan.mockResolvedValue(false);
    (repo as Record<string, jest.Mock>).obtenerIdTrabajadorPorIdUsuario =
      jest.fn().mockResolvedValue(null);
    await expect(
      new EliminarEntregableProyectoUseCase(
        repository,
        planning,
        planRepository,
      ).analizar(3, 23, false),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(plan.analizarEliminacionEntregable).not.toHaveBeenCalled();
  });
});

describe('Color opcional al crear un entregable', () => {
  it('acepta el contrato anterior y el color hexadecimal; rechaza formatos no válidos', () => {
    const base = { idProyecto: 1, nombre: 'Arquitectura' };
    expect(CreateEntregableProyectoDto.schema.safeParse(base).success).toBe(
      true,
    );
    expect(
      CreateEntregableProyectoDto.schema.safeParse({
        ...base,
        color: '#A1b2C3',
        revisionPlan: 2,
      }).success,
    ).toBe(true);
    for (const color of ['red', '#fff', '#12345g', ''])
      expect(
        CreateEntregableProyectoDto.schema.safeParse({ ...base, color })
          .success,
      ).toBe(false);
  });
});

describe('Creación de grupos de planificación según permisos granulares', () => {
  function setup(tienePlan: boolean) {
    const repo = {
      obtenerIdTrabajadorPorIdUsuario: jest.fn().mockResolvedValue(1),
      trabajadorPerteneceAProyecto: jest.fn().mockResolvedValue(false),
      esCoordinadorEnProyecto: jest.fn().mockResolvedValue(false),
      crearEntregableProyecto: jest
        .fn()
        .mockResolvedValue({ success: true, id: 12 }),
    };
    const access = {
      editarProyectoConPlan: jest.fn().mockResolvedValue(tienePlan),
    };
    const logger = {
      create: () => ({
        warn: jest.fn(),
        log: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }),
    };
    const useCase = new CrearEntregableProyectoUseCase(
      repo as unknown as IProyectoRepository,
      {} as BroadcastPort,
      logger as unknown as LoggerFactoryPort,
      access as unknown as PlanificacionAccessService,
    );
    return { repo, access, useCase };
  }
  it('un actor autorizado con alcance todos crea un grupo sin autoasignarse ni notificar responsables', async () => {
    const { repo, useCase } = setup(true);
    await expect(
      useCase.execute(
        { idProyecto: 38, nombre: 'Grupo', color: '#465fff', revisionPlan: 1 },
        23,
        true,
      ),
    ).resolves.toEqual({ success: true, id: 12 });
    expect(repo.crearEntregableProyecto).toHaveBeenCalledWith(
      38,
      expect.objectContaining({
        idTrabajadoresResponsables: [],
        idTrabajadorResponsable: null,
      }),
      23,
    );
    expect(repo.trabajadorPerteneceAProyecto).not.toHaveBeenCalled();
  });
  it('con alcance asignados sigue rechazando proyectos ajenos', async () => {
    const { repo, useCase } = setup(true);
    await expect(
      useCase.execute({ idProyecto: 38, nombre: 'Grupo' }, 23, false),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(repo.crearEntregableProyecto).not.toHaveBeenCalled();
  });
  it('conserva la validación de responsables enviados explícitamente y del flujo sin plan', async () => {
    for (const tienePlan of [true, false]) {
      const { repo, useCase } = setup(tienePlan);
      await expect(
        useCase.execute(
          {
            idProyecto: 38,
            nombre: 'Grupo',
            ...(tienePlan ? { idTrabajadoresResponsables: [99] } : {}),
          },
          23,
          true,
        ),
      ).rejects.toThrow('debe pertenecer al proyecto');
      expect(repo.crearEntregableProyecto).not.toHaveBeenCalled();
    }
  });
});
