import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { AccResourcesModule } from '../src/composition/modules/acc-resources.module';
import { DatabaseFunctionService } from '../src/infrastructure/database/database-function.service';
import { AccResourcesController } from '../src/presentation/controllers/acc-resources.controller';

describe('Carga de permisos del proyecto ACC', () => {
  let module: TestingModule;
  let controller: AccResourcesController;
  const database = {
    callFunction: jest.fn(),
    callFunctionSingle: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({ imports: [AccResourcesModule] })
      .overrideProvider(DatabaseFunctionService)
      .useValue(database)
      .compile();
    controller = module.get(AccResourcesController);
  });

  beforeEach(() => jest.resetAllMocks());
  afterAll(async () => module?.close());

  it('resuelve el recurso del proyecto con el repositorio inyectado', async () => {
    database.callFunctionSingle.mockResolvedValue({
      success: true,
      id: 78,
      message: 'Recurso actualizado exitosamente',
    });

    const response = await controller.store(
      {
        external_id: 'b.b49b0876-3ea4-49a6-9819-a35ceffb6fb4',
        resource_type: 'project',
        name: 'Proyecto',
      },
      { user: { id: 1, sub: 1 } } as Request,
    );

    expect(response).toMatchObject({ status: 201, data: { id: 78 } });
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'acc_CreateRecurso',
      [
        'b49b0876-3ea4-49a6-9819-a35ceffb6fb4',
        'project',
        'Proyecto',
        null,
        null,
        1,
      ],
    );
  });

  it('devuelve el catálogo de niveles de permiso', async () => {
    const levels = [{ id: 6, code: 'admin', name: 'Administrador' }];
    database.callFunction.mockResolvedValue(levels);

    await expect(controller.listPermissionLevels()).resolves.toMatchObject({
      status: 200,
      data: levels,
    });
    expect(database.callFunction).toHaveBeenCalledWith(
      'acc_ListarPermissionLevels',
      [],
    );
  });

  it('devuelve los usuarios y sus permisos del recurso resuelto', async () => {
    const users = [{ id: 601, userid: 25, permissionlevelcode: 'admin' }];
    database.callFunction.mockResolvedValue(users);

    await expect(controller.listResourceUsers('78')).resolves.toMatchObject({
      status: 200,
      data: users,
    });
    expect(database.callFunction).toHaveBeenCalledWith(
      'acc_ListarUsuariosRecurso',
      [78],
    );
  });
});
