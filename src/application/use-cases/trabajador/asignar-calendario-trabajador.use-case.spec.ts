import 'reflect-metadata';
import { AsignarCalendarioTrabajadorUseCase } from './asignar-calendario-trabajador.use-case';
import { AsignarCalendarioTrabajadorDto } from '../../../presentation/dtos/trabajador/asignar-calendario-trabajador.dto';
import { TrabajadorController } from '../../../presentation/controllers/trabajador.controller';
import { GRANULAR_REQUIREMENT } from '../../../infrastructure/auth/granular-permission.guard';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
describe('Asignación puntual de calendario del colaborador', () => {
  it('exige editar colaboradores, no basta con editar planificación', () => {
    expect(
      Reflect.getMetadata(
        GRANULAR_REQUIREMENT,
        TrabajadorController.prototype.asignarCalendario,
      ),
    ).toEqual(['usuarios.trabajadores.editar']);
  });
  it('envía actor, trabajador y calendario previo para evitar sobrescrituras', async () => {
    const repo = {
      asignarCalendario: jest
        .fn()
        .mockResolvedValue({
          id: 8,
          idcalendario: 3,
          nombrecalendario: 'Laboral',
        }),
    };
    await new AsignarCalendarioTrabajadorUseCase(
      repo as unknown as ITrabajadorRepository,
    ).execute(7, 8, { idCalendario: 3, idCalendarioAnterior: null });
    expect(repo.asignarCalendario).toHaveBeenCalledWith(7, 8, 3, null);
  });
  it.each([
    { idCalendario: 0, idCalendarioAnterior: null },
    { idCalendario: 3 },
    { idCalendario: 3, idCalendarioAnterior: -1 },
    { idCalendario: 3, idCalendarioAnterior: null, nombres: 'No se modifica' },
  ])('rechaza datos inválidos o campos de ficha ajenos: %j', (datos) => {
    expect(AsignarCalendarioTrabajadorDto.schema.safeParse(datos).success).toBe(
      false,
    );
  });
  it('acepta un calendario previo nulo explícito', () => {
    expect(
      AsignarCalendarioTrabajadorDto.schema.parse({
        idCalendario: 3,
        idCalendarioAnterior: null,
      }),
    ).toEqual({ idCalendario: 3, idCalendarioAnterior: null });
  });
});
