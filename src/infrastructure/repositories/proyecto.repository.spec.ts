import { ProyectoRepository } from './proyecto.repository';
import type { DatabaseFunctionService } from '../database/database-function.service';
import type { MinioStorageService } from '../storage/minio-storage.service';
import { EditarProyectoUseCase } from '../../application/use-cases/proyecto/editar-proyecto.use-case';
import type { PlanificacionAccessService } from '../../application/services/planificacion-access.service';
import type { UpdateProyectoDto } from '../../application/inputs/proyecto/update-proyecto.dto';
import {
  InvalidInputError,
  UnprocessableError,
} from '../../application/errors/application.error';

describe('Proyectos: contrato success/message de las versiones pro_*', () => {
  const database = { callFunctionSingle: jest.fn() };
  const repository = new ProyectoRepository(
    database as unknown as DatabaseFunctionService,
    {} as MinioStorageService,
  );
  const rechazo = {
    success: false,
    message: 'Ya existe otro proyecto con este número',
  };
  beforeEach(() => jest.resetAllMocks());

  it.each([
    [
      'editarProyecto',
      () => repository.editarProyecto({ idProyecto: 8 } as never),
    ],
    ['crearProyecto', () => repository.crearProyecto({} as never)],
    ['eliminarProyecto', () => repository.eliminarProyecto(8, 23)],
    [
      'eliminarEntregableProyecto',
      () => repository.eliminarEntregableProyecto(3, 23, 2, 'Retirar'),
    ],
  ])('%s devuelve success=false sin lanzar error', async (_name, call) => {
    database.callFunctionSingle.mockResolvedValue(rechazo);
    await expect(call()).resolves.toEqual(rechazo);
  });

  it('un error que SQL no capturó se sigue traduciendo', async () => {
    database.callFunctionSingle.mockRejectedValue({
      driverError: {
        code: 'P0001',
        message: 'No se elimina un proyecto con planificación activa',
      },
    });
    await expect(repository.eliminarProyecto(8, 23)).rejects.toBeInstanceOf(
      UnprocessableError,
    );
  });

  it('editar proyecto responde 400 con el mensaje de SQL, como antes', async () => {
    database.callFunctionSingle
      .mockResolvedValueOnce({ id: 8, idcalendario: 5 })
      .mockResolvedValueOnce(rechazo);
    const access = {
      editarProyectoConPlan: jest.fn().mockResolvedValue(undefined),
    } as unknown as PlanificacionAccessService;
    const error = await new EditarProyectoUseCase(repository, access)
      .execute(8, { nroProyecto: 'P1' } as UpdateProyectoDto, 23)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(InvalidInputError);
    expect((error as Error).message).toBe(rechazo.message);
  });
});
