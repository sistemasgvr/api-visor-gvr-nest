import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.use-case';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { SESION_REPOSITORY } from '../../domain/repositories/sesion.repository.interface';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { LoginDto } from '../dtos/login.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  const login = jest.fn();
  const cerrarTodasLasSesiones = jest.fn();
  const crearSesion = jest.fn();
  const signAsync = jest.fn().mockResolvedValue('test-jwt');

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: AUTH_REPOSITORY, useValue: { login } },
        {
          provide: SESION_REPOSITORY,
          useValue: { cerrarTodasLasSesiones, crearSesion },
        },
        { provide: JwtService, useValue: { signAsync } },
      ],
    }).compile();

    useCase = module.get(LoginUseCase);
  });

  it('rechaza credenciales vacías', async () => {
    const dto: LoginDto = { correo: '', contrasena: 'x' };
    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('devuelve token y usuario sin contraseña cuando el login en BD y bcrypt coinciden', async () => {
    const u = new AuthUser({
      id: 1,
      nombre: 'A',
      correo: 'a@b.c',
      contrasena: '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      estado: 1,
      fechacreacion: new Date(),
      fechamodificacion: new Date(),
      roles: [],
      permisos: [],
      menus: [],
    });
    login.mockResolvedValue(u);
    cerrarTodasLasSesiones.mockResolvedValue(undefined);
    crearSesion.mockResolvedValue(undefined);

    const r = await useCase.execute(
      { correo: 'a@b.c', contrasena: 'secret' },
      '127.0.0.1',
      'jest',
    );

    expect(r.access_token).toBe('test-jwt');
    expect(r.user.id).toBe(1);
    expect(r.user.correo).toBe('a@b.c');
    expect(signAsync).toHaveBeenCalled();
    expect(crearSesion).toHaveBeenCalledWith(
      1,
      'test-jwt',
      '127.0.0.1',
      'jest',
    );
  });
});
