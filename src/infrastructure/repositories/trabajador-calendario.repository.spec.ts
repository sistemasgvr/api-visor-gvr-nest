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
      expect(name).toBe('tra_EditarTrabajadorV3');
      // Calendario y su indicador; después área, su indicador y registra asistencia.
      expect(args.slice(-5, -3)).toEqual([calendar ?? null, update]);
    },
  );

  it.each([
    [undefined, null, false],
    [null, null, true],
    [3, 3, true],
  ])(
    'envía área %s sin confundir omisión con eliminación',
    async (area, enviado, actualizar) => {
      await repository.editarTrabajador({ ...base, idArea: area });
      const [, args] = database.callFunctionSingle.mock.calls[0];
      expect(args.slice(-3)).toEqual([enviado, actualizar, null]);
    },
  );

  it('editar conserva registra asistencia si no se envía y lo cambia si se envía', async () => {
    await repository.editarTrabajador({ ...base, registraAsistencia: true });
    expect(database.callFunctionSingle.mock.calls[0][1].at(-1)).toBe(true);
  });

  it('crear sin calendario ni área envía null, registra asistencia en false y usa V3', async () => {
    await repository.crearTrabajador({ ...base, idUsuarioCreacion: 1 });
    const [name, args] = database.callFunctionSingle.mock.calls[0];
    expect(name).toBe('tra_CrearTrabajadorV3');
    expect(args.slice(-3)).toEqual([null, null, false]);
  });

  it('obtiene el detalle con área mediante la V3', async () => {
    database.callFunctionSingle.mockResolvedValueOnce({ id: 1, idarea: 3 });
    await repository.obtenerTrabajadorPorId(1);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'tra_ObtenerTrabajadorPorIdV3',
      [1],
    );
  });

  it('obtiene el catálogo publicado mediante la función específica', async () => {
    await repository.listarCalendariosPublicados();
    expect(database.callFunction).toHaveBeenCalledWith(
      'tra_ListarCalendariosPublicados',
    );
  });

  it('CreateTrabajadorDto: exige el calendario', () => {
    for (const value of [null, undefined, 0, -1, 1.5, 'abc']) {
      expect(
        dtoDefinition(CreateTrabajadorDto.schema).fields.idCalendario.schema.safeParse(
          value,
        ).success,
      ).toBe(false);
    }
  });

  for (const Dto of [UpdateTrabajadorDto]) {
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
