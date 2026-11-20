import { ListarEquipoPlanUseCase } from './listar-equipo-plan.use-case';
import { ListarAprobadoresPlanUseCase } from './listar-aprobadores-plan.use-case';
import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type { MinioStoragePort } from '../../../ports/minio-storage.port';
import { NotFoundError } from '../../../errors/application.error';

describe.each([
  ['equipo', ListarEquipoPlanUseCase, 'listarEquipoPlan'],
  ['aprobadores', ListarAprobadoresPlanUseCase, 'listarAprobadoresPlan'],
] as const)(
  'Fotos de perfil en %s de planificación',
  (_nombre, UseCase, metodo) => {
    const repository = {
      comprobarPertenencia: jest.fn(),
      listarEquipoPlan: jest.fn(),
      listarAprobadoresPlan: jest.fn(),
    };
    const storage = { resolveViewUrlForEvidenciaStoredUrl: jest.fn() };
    const useCase = new UseCase(
      repository as unknown as IPlanificacionRepository,
      storage as unknown as MinioStoragePort,
    );
    beforeEach(() => jest.resetAllMocks());

    it('entrega la URL firmada que usa el perfil y conserva los otros datos', async () => {
      const persona = {
        idtrabajador: 4,
        nombre: 'Persona',
        foto: 'https://storage.example/bucket/perfil.jpg',
      };
      const firmada = `${persona.foto}?X-Amz-Signature=firma`;
      repository[metodo].mockResolvedValue([persona]);
      storage.resolveViewUrlForEvidenciaStoredUrl.mockResolvedValue(firmada);
      expect(await useCase.execute(23, { id: 8 })).toEqual([
        { ...persona, foto: firmada },
      ]);
      expect(storage.resolveViewUrlForEvidenciaStoredUrl).toHaveBeenCalledWith(
        persona.foto,
      );
      expect(persona.foto).not.toContain('Signature');
    });

    it('conserva las personas sin foto sin solicitar URLs', async () => {
      repository[metodo].mockResolvedValue([{ foto: null }, { foto: '  ' }]);
      expect(await useCase.execute(23, { id: 8 })).toEqual([
        { foto: null },
        { foto: null },
      ]);
      expect(
        storage.resolveViewUrlForEvidenciaStoredUrl,
      ).not.toHaveBeenCalled();
    });

    it('acepta listas vacías', async () => {
      repository[metodo].mockResolvedValue([]);
      expect(await useCase.execute(23, { id: 8 })).toEqual([]);
      expect(
        storage.resolveViewUrlForEvidenciaStoredUrl,
      ).not.toHaveBeenCalled();
    });

    it('comprueba pertenencia antes de consultar o firmar fotos', async () => {
      repository.comprobarPertenencia.mockRejectedValue(new NotFoundError());
      await expect(useCase.execute(23, { id: 8 })).rejects.toBeInstanceOf(
        NotFoundError,
      );
      expect(repository[metodo]).not.toHaveBeenCalled();
      expect(
        storage.resolveViewUrlForEvidenciaStoredUrl,
      ).not.toHaveBeenCalled();
    });
  },
);
