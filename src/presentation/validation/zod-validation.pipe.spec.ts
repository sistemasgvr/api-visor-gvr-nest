import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from './zod-validation.pipe';
import { LoginDto } from '../dtos/login.dto';
import {
  CrearActividadPlanDto,
  HistorialPlanDto,
  ReprogramarPlanDto,
  ReglasPlanDto,
} from '../dtos/planificacion/proyectos/planificacion.dto';
import { ActualizarFeriadoDto } from '../dtos/planificacion/calendarios/actualizar-feriado.dto';
import { SynchronizeRolePermissionsDto } from '../dtos/authorization/synchronize-permissions.dto';
import { ListarFeriadosDto } from '../dtos/planificacion/calendarios/listar-feriados.dto';

describe('Validación HTTP Zod en español', () => {
  const pipe = new ZodValidationPipe();
  it('devuelve 400 y una ruta de campo sin mostrar el valor rechazado', () => {
    try {
      pipe.transform(
        { correo: 'secreto-invalido', contrasena: '123456' },
        { type: 'body', metatype: LoginDto },
      );
      fail('Debe rechazar el correo');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const body = (error as BadRequestException).getResponse() as {
        message: string[];
      };
      expect(body.message.join(' ')).toMatch(/correo/);
      expect(body.message.join(' ')).not.toContain('secreto-invalido');
    }
  });
  it('rechaza claves extra e identidades elegidas por el cliente', () => {
    expect(() =>
      pipe.transform(
        { revision: 1, permisos: [], actor: 999 },
        { type: 'body', metatype: SynchronizeRolePermissionsDto },
      ),
    ).toThrow(BadRequestException);
  });
  it('valida modelos heredados de múltiples DTO', () => {
    const value = {
      fecha: '2026-12-25',
      nombre: 'Feriado',
      idtipo: 620,
      minutosefectivos: 0,
      idcalendarios: [1],
      revision: 2,
    };
    expect(ActualizarFeriadoDto.schema.safeParse(value).success).toBe(true);
    expect(
      ActualizarFeriadoDto.schema.safeParse({ ...value, revision: 0 }).success,
    ).toBe(false);
  });
  it('preserva los límites y conversiones heredados', () => {
    expect(
      pipe.transform(
        { limit: '12' },
        { type: 'query', metatype: ListarFeriadosDto },
      ),
    ).toMatchObject({ limit: 12 });
    expect(() =>
      pipe.transform(
        { limit: 0 },
        { type: 'query', metatype: ListarFeriadosDto },
      ),
    ).toThrow();
  });
  it('comprueba arrays anidados y unicidad', () => {
    const value = {
      revision: 1,
      permisos: [
        { idpermiso: 2, alcances: ['todos'] },
        { idpermiso: 2, alcances: ['propios'] },
      ],
    };
    expect(SynchronizeRolePermissionsDto.schema.safeParse(value).success).toBe(
      false,
    );
  });
  it('rechaza fechas imposibles, fechas finales anteriores y hitos con esfuerzo', () => {
    expect(
      ReprogramarPlanDto.schema.safeParse({
        revision: 1,
        revisionPlan: 1,
        motivo: 'Demora',
        fechaNoIniciarAntes: '2026-02-30',
      }).success,
    ).toBe(false);
    expect(
      ReprogramarPlanDto.schema.safeParse({
        revision: 1,
        revisionPlan: 1,
        motivo: 'Demora',
        fechaNoIniciarAntes: '2026-11-02',
        fechaNoFinalizarAntes: '2026-11-01',
      }).success,
    ).toBe(false);
    expect(
      CrearActividadPlanDto.schema.safeParse({
        revisionPlan: 1,
        datos: {
          identregable: 1,
          nombre: 'Hito',
          eshito: true,
          minutosestimados: 1,
        },
      }).success,
    ).toBe(false);
  });
  it('exige idLineaBase solo en el detalle y diferencia null de omisión', () => {
    expect(
      HistorialPlanDto.schema.safeParse({ tipo: 'detallelineabase' }).success,
    ).toBe(false);
    expect(HistorialPlanDto.schema.safeParse({ tipo: 'cambios' }).success).toBe(
      true,
    );
    expect(
      ReglasPlanDto.schema.safeParse({
        revisionPlan: 1,
        reglas: { idaprobador: null },
      }).success,
    ).toBe(true);
    expect(
      ReglasPlanDto.schema.safeParse({
        revisionPlan: 1,
        reglas: { bloquearexceso: null },
      }).success,
    ).toBe(false);
  });
});
