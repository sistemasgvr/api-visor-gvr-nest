import { AuthUser } from '../../domain/entities/auth-user.entity';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import type { ISesionRepository } from '../../domain/repositories/sesion.repository.interface';
import { UnauthenticatedError } from '../errors/application.error';
import type { MinioStoragePort } from '../ports/minio-storage.port';
import type {
  PasswordHasherPort,
  TokenServicePort,
} from '../ports/runtime.port';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase (sin Nest ni servicios externos)', () => {
  const login = jest.fn();
  const crearSesion = jest.fn();
  const signAsync = jest.fn();
  const compare = jest.fn();
  const resolveViewUrlForEvidenciaStoredUrl = jest.fn();
  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.resetAllMocks();
    compare.mockResolvedValue(true);
    signAsync.mockResolvedValue('test-jwt');
    resolveViewUrlForEvidenciaStoredUrl.mockResolvedValue(
      'https://files.test/photo',
    );
    useCase = new LoginUseCase(
      { login } as unknown as IAuthRepository,
      { crearSesion } as unknown as ISesionRepository,
      { signAsync } as unknown as TokenServicePort,
      { resolveViewUrlForEvidenciaStoredUrl } as unknown as MinioStoragePort,
      { compare } as unknown as PasswordHasherPort,
    );
  });

  const user = () =>
    new AuthUser({
      id: 1,
      nombre: 'A',
      correo: 'a@b.c',
      contrasena: '$2y$10$hash',
      estado: 1,
      fechacreacion: new Date(),
      fechamodificacion: new Date(),
      roles: [],
      permisos: [],
      menus: [],
      fotoPerfil: 'stored-photo',
    });

  it('rechaza credenciales vacías sin consultar ni registrar sesiones', async () => {
    await expect(
      useCase.execute({ correo: ' ', contrasena: 'x' }),
    ).rejects.toBeInstanceOf(UnauthenticatedError);
    expect(login).not.toHaveBeenCalled();
    expect(crearSesion).not.toHaveBeenCalled();
  });

  it('conserva normalización, bcrypt PHP, sesión, foto y respuesta sin contraseña', async () => {
    login.mockResolvedValue(user());
    const result = await useCase.execute(
      { correo: ' a@b.c ', contrasena: ' secret ' },
      '127.0.0.1',
      'jest',
    );
    expect(login).toHaveBeenCalledWith('a@b.c');
    expect(compare).toHaveBeenCalledWith('secret', '$2a$10$hash');
    expect(crearSesion).toHaveBeenCalledWith(
      1,
      'test-jwt',
      '127.0.0.1',
      'jest',
    );
    expect(result.access_token).toBe('test-jwt');
    expect(result.user.fotoPerfil).toBe('https://files.test/photo');
    expect(result.user).not.toHaveProperty('contrasena');
  });

  it('no firma ni registra una sesión si la contraseña no coincide', async () => {
    login.mockResolvedValue(user());
    compare.mockResolvedValue(false);
    await expect(
      useCase.execute({ correo: 'a@b.c', contrasena: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthenticatedError);
    expect(signAsync).not.toHaveBeenCalled();
    expect(crearSesion).not.toHaveBeenCalled();
  });
});
