import type { z } from 'zod';
import { CreateProyectoDto } from '../dtos/proyecto/create-proyecto.dto';
import { UpdateProyectoDto } from '../dtos/proyecto/update-proyecto.dto';
import { CreateTrabajadorDto } from '../dtos/trabajador/create-trabajador.dto';
import { UpdateTrabajadorDto } from '../dtos/trabajador/update-trabajador.dto';

const rechaza = (schema: z.ZodType, campo: string, valor: unknown) => {
  const parsed = schema.safeParse(
    valor === undefined ? {} : { [campo]: valor },
  );
  return (
    !parsed.success && parsed.error.issues.some((i) => i.path[0] === campo)
  );
};

describe('Campos obligatorios al crear proyecto y colaborador', () => {
  it.each([
    ['idEstadoProyecto', 'CreateProyectoDto', CreateProyectoDto.schema],
    ['idModalidad', 'CreateTrabajadorDto', CreateTrabajadorDto.schema],
    ['idCalendario', 'CreateTrabajadorDto', CreateTrabajadorDto.schema],
  ] as const)('%s es obligatorio en %s', (campo, _nombre, schema) => {
    expect(rechaza(schema, campo, undefined)).toBe(true);
    expect(rechaza(schema, campo, null)).toBe(true);
    expect(rechaza(schema, campo, 0)).toBe(true);
    expect(rechaza(schema, campo, 2)).toBe(false);
  });

  it.each([
    ['idEstadoProyecto', 'UpdateProyectoDto', UpdateProyectoDto.schema],
    ['idModalidad', 'UpdateTrabajadorDto', UpdateTrabajadorDto.schema],
    ['idCalendario', 'UpdateTrabajadorDto', UpdateTrabajadorDto.schema],
  ] as const)('%s sigue siendo opcional en %s', (campo, _nombre, schema) => {
    expect(rechaza(schema, campo, undefined)).toBe(false);
    expect(rechaza(schema, campo, null)).toBe(false);
  });
});
