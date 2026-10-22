import { TrabajadorRepository } from './trabajador.repository';
import type { DatabaseFunctionService } from '../database/database-function.service';
import type { MinioStorageService } from '../storage/minio-storage.service';
import type { EditarTrabajadorData } from '../../domain/repositories/trabajador.repository.interface';
import { dtoDefinition } from '../../presentation/validation/zod-dto';
import { CreateTrabajadorDto } from '../../presentation/dtos/trabajador/create-trabajador.dto';
import { UpdateTrabajadorDto } from '../../presentation/dtos/trabajador/update-trabajador.dto';

describe('Calendario del colaborador', () => {
  const database = {
    callFunctionSingle: jest.fn().mockResolvedValue({ success: true }),
    callFunction: jest.fn().mockResolvedValue([]),
  };
  const repository = new TrabajadorRepository(
    database as unknown as DatabaseFunctionService,
    {} as MinioStorageService,
  );
  const base: EditarTrabajadorData = {
    idTrabajador: 1,
    nombres: 'Prueba',
    apellidos: 'Calendario',
    idTipoDocumento: 1,
    nroDocumento: '12345678',
    correo: 'test@example.invalid',
    idEmpresa: 1,
    idUsuarioModificacion: 1,
  };
  beforeEach(() => jest.clearAllMocks());

  it.each([
    [undefined, false],
    [null, true],
    [2, true],
  ])(
    'envía calendario %s sin confundir omisión con eliminación',
    async (calendar, update) => {
      await repository.editarTrabajador({ ...base, idCalendario: calendar });
      const [name, args] = database.callFunctionSingle.mock.calls[0];
      expect(name).toBe('tra_EditarTrabajadorV2');
      expect(args.slice(-2)).toEqual([calendar ?? null, update]);
    },
  );

  it('crear sin calendario envía null y usa V2', async () => {
    await repository.crearTrabajador({ ...base, idUsuarioCreacion: 1 });
    const [name, args] = database.callFunctionSingle.mock.calls[0];
    expect(name).toBe('tra_CrearTrabajadorV2');
    expect(args.at(-1)).toBeNull();
  });

  it('obtiene el catálogo publicado mediante la función específica', async () => {
    await repository.listarCalendariosPublicados();
    expect(database.callFunction).toHaveBeenCalledWith(
      'tra_ListarCalendariosPublicados',
    );
  });

  for (const Dto of [CreateTrabajadorDto, UpdateTrabajadorDto]) {
    it(`${Dto.name}: acepta null y rechaza identificadores inválidos`, async () => {
      for (const value of [null, undefined, 2]) {
        const parsed = dtoDefinition(Dto.schema)
          .fields.idCalendario.schema.nullish()
          .safeParse(value);
        expect(parsed.success).toBe(true);
      }
      for (const value of [0, -1, 1.5, 'abc']) {
        const parsed = dtoDefinition(
          Dto.schema,
        ).fields.idCalendario.schema.safeParse(value);
        expect(parsed.success).toBe(false);
      }
    });
  }
});
