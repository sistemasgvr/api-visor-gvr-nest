import {
  ForbiddenException,
  ValidationPipe,
  type INestApplication,
  type ExecutionContext,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { ControlOperativoController } from '../controllers/control-operativo.controller';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ControlOperativoAccess } from '../../infrastructure/auth/control-operativo-access.service';
import { ListarCoordinadoresProyectoUseCase } from '../../application/use-cases/proyecto/listar-coordinadores-proyecto.use-case';
import { HabilitarJornadasUsuariosUseCase } from '../../application/use-cases/control-operativo/habilitar-jornadas-usuarios.use-case';
import { ActualizarEstadoJornadaUseCase } from '../../application/use-cases/control-operativo/actualizar-estado-jornada.use-case';
import { CerrarHabilitacionesVencidasUseCase } from '../../application/use-cases/control-operativo/cerrar-habilitaciones-vencidas.use-case';
import type { AuthenticatedUser } from '../../domain/types/authenticated-user';

const CAMBIAR_ESTADO = 'control_operativo.jornadas.cambiar_estado';

describe('HTTP de habilitación temporal de jornadas', () => {
  let app: INestApplication;
  let user: AuthenticatedUser | undefined;
  let cronSecret: string | undefined;
  const habilitar = { execute: jest.fn() };
  const actualizar = { execute: jest.fn() };
  const cerrar = { execute: jest.fn() };
  const coordinadores = { execute: jest.fn() };
  // El alcance (propios/asignados/todos) lo resuelve el servicio de acceso con el permiso.
  const access = {
    exigirTrabajador: jest.fn(),
    trabajadorDeJornada: jest.fn(),
    proyectosPermitidos: jest.fn(),
  };
  const body = {
    idTrabajadores: [101, 102],
    fechaInicio: '2026-10-12',
    fechaFin: '2026-10-16',
    duracionMinutos: 120,
  };

  beforeAll(async () => {
    const dependencies: Array<new (...args: any[]) => unknown> =
      Reflect.getMetadata('design:paramtypes', ControlOperativoController);
    const module = await Test.createTestingModule({
      controllers: [ControlOperativoController],
      providers: dependencies.map((provide) => ({
        provide,
        useValue:
          provide === HabilitarJornadasUsuariosUseCase
            ? habilitar
            : provide === ActualizarEstadoJornadaUseCase
              ? actualizar
              : provide === CerrarHabilitacionesVencidasUseCase
                ? cerrar
                : provide === ControlOperativoAccess
                  ? access
                  : provide === ConfigService
                    ? { get: () => cronSecret }
                    : provide === ListarCoordinadoresProyectoUseCase
                      ? coordinadores
                      : {},
      })),
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          context.switchToHttp().getRequest().user = user;
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });
  afterAll(async () => app?.close());
  beforeEach(() => {
    jest.clearAllMocks();
    user = {
      id: 7,
      sub: 7,
      correo: 'admin@example.com',
      nombre: 'Admin',
      roles: [{ id: 3 }],
      permisos: [],
    };
    cronSecret = 'test-secret';
    habilitar.execute.mockResolvedValue([
      { idtrabajador: 101, jornadas_habilitadas: 5 },
    ]);
    actualizar.execute.mockResolvedValue(true);
    access.exigirTrabajador.mockResolvedValue(undefined);
    access.trabajadorDeJornada.mockResolvedValue(55);
    cerrar.execute.mockResolvedValue({
      pasados_culminado: 1,
      pasados_incompleto: 2,
    });
  });

  it('lista coordinadores con acceso de actividades sin exponer el equipo', async () => {
    access.proyectosPermitidos.mockResolvedValue([38]);
    coordinadores.execute.mockResolvedValue([
      { idtrabajador: 12, nombrecoordinador: 'Diego', miembrosEquipo: [{ idtrabajador: 13 }] },
    ]);
    const response = await request(app.getHttpServer())
      .get('/control-operativo/proyectos/38/coordinadores')
      .expect(200);
    expect(access.proyectosPermitidos).toHaveBeenCalledWith(7, 'control_operativo.actividades.crear');
    expect(coordinadores.execute).toHaveBeenCalledWith(38);
    expect(response.body.data).toEqual([{ idtrabajador: 12, nombrecoordinador: 'Diego' }]);
  });

  it('rechaza coordinadores de proyectos fuera del alcance del usuario', async () => {
    access.proyectosPermitidos.mockResolvedValue([]);
    await request(app.getHttpServer())
      .get('/control-operativo/proyectos/38/coordinadores')
      .expect(403);
    expect(coordinadores.execute).not.toHaveBeenCalled();
  });

  it('permite consultar con alcance todos o solo permiso de edición', async () => {
    access.proyectosPermitidos.mockResolvedValueOnce([]).mockResolvedValueOnce(null);
    coordinadores.execute.mockResolvedValue([]);
    await request(app.getHttpServer())
      .get('/control-operativo/proyectos/38/coordinadores')
      .expect(200);
    expect(access.proyectosPermitidos).toHaveBeenCalledWith(7, 'control_operativo.actividades.editar');
  });

  it('habilita según el permiso sobre cada trabajador y toma el actor de la sesión', async () => {
    const response = await request(app.getHttpServer())
      .post('/control-operativo/jornadas/habilitar-usuarios')
      .send(body)
      .expect(200);
    expect(access.exigirTrabajador).toHaveBeenCalledWith(
      7,
      CAMBIAR_ESTADO,
      101,
    );
    expect(access.exigirTrabajador).toHaveBeenCalledWith(
      7,
      CAMBIAR_ESTADO,
      102,
    );
    expect(habilitar.execute).toHaveBeenCalledWith({
      ...body,
      idUsuarioHabilita: 7,
    });
    expect(
      (response.body as { data: { jornadas_habilitadas: number }[] }).data[0]
        .jornadas_habilitadas,
    ).toBe(5);
  });

  it('rechaza un actor enviado por el cliente', async () => {
    await request(app.getHttpServer())
      .post('/control-operativo/jornadas/habilitar-usuarios')
      .send({ ...body, idUsuarioHabilita: 99 })
      .expect(400);
    expect(habilitar.execute).not.toHaveBeenCalled();
  });

  it('rechaza si un trabajador queda fuera de su alcance, sin importar el rol', async () => {
    user!.roles = [{ id: 1 }];
    access.exigirTrabajador
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new ForbiddenException());
    await request(app.getHttpServer())
      .post('/control-operativo/jornadas/habilitar-usuarios')
      .send(body)
      .expect(403);
    expect(habilitar.execute).not.toHaveBeenCalled();
  });

  it('exige usuario autenticado identificado', async () => {
    user = undefined;
    await request(app.getHttpServer())
      .post('/control-operativo/jornadas/habilitar-usuarios')
      .send(body)
      .expect(401);
    expect(habilitar.execute).not.toHaveBeenCalled();
  });

  it.each([
    { duracionMinutos: null },
    { duracionMinutos: '120' },
    { idTrabajadores: [] },
    { fechaInicio: '2026-02-30' },
  ])('valida el DTO: %j', async (change) => {
    await request(app.getHttpServer())
      .post('/control-operativo/jornadas/habilitar-usuarios')
      .send({ ...body, ...change })
      .expect(400);
    expect(habilitar.execute).not.toHaveBeenCalled();
  });

  it('exige duración al abrir y permite cerrar sin duración', async () => {
    const endpoint = '/control-operativo/jornadas/30/estado';
    await request(app.getHttpServer())
      .patch(endpoint)
      .send({ idEstadoJornada: 372 })
      .expect(400);
    await request(app.getHttpServer())
      .patch(endpoint)
      .send({ idEstadoJornada: 372, duracionMinutos: 60 })
      .expect(200);
    expect(access.exigirTrabajador).toHaveBeenCalledWith(7, CAMBIAR_ESTADO, 55);
    expect(actualizar.execute).toHaveBeenCalledWith({
      idJornada: 30,
      idEstadoJornada: 372,
      duracionMinutos: 60,
      idUsuarioModificacion: 7,
    });
    await request(app.getHttpServer())
      .patch(endpoint)
      .send({ idEstadoJornada: 401 })
      .expect(200);
  });

  it('protege también el cambio individual según el trabajador de la jornada', async () => {
    access.exigirTrabajador.mockRejectedValueOnce(new ForbiddenException());
    await request(app.getHttpServer())
      .patch('/control-operativo/jornadas/30/estado')
      .send({ idEstadoJornada: 372, duracionMinutos: 60 })
      .expect(403);
    expect(actualizar.execute).not.toHaveBeenCalled();
  });

  it('responde 400 si la jornada no existe', async () => {
    access.trabajadorDeJornada.mockResolvedValueOnce(null);
    await request(app.getHttpServer())
      .patch('/control-operativo/jornadas/30/estado')
      .send({ idEstadoJornada: 372, duracionMinutos: 60 })
      .expect(400);
    expect(actualizar.execute).not.toHaveBeenCalled();
  });

  it('cierra vencidas solo con clave válida y configurada', async () => {
    const endpoint = '/control-operativo/cron/cierre-habilitaciones-vencidas';
    await request(app.getHttpServer()).get(endpoint).expect(401);
    await request(app.getHttpServer())
      .get(endpoint)
      .query({ key: 'wrong' })
      .expect(401);
    expect(cerrar.execute).not.toHaveBeenCalled();
    await request(app.getHttpServer())
      .get(endpoint)
      .query({ key: 'test-secret' })
      .expect(200);
    expect(cerrar.execute).toHaveBeenCalledTimes(1);
    cronSecret = undefined;
    await request(app.getHttpServer())
      .get(endpoint)
      .query({ key: 'test-secret' })
      .expect(401);
    expect(cerrar.execute).toHaveBeenCalledTimes(1);
  });
});
