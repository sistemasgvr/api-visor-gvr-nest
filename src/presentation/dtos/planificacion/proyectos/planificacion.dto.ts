import { z } from 'zod';
import { defineZodDto, mappedDto, isoDate } from '../../../validation/zod-dto';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class ProyectoPlanParamsDto {
  static readonly schema: z.ZodType<ProyectoPlanParamsDto> =
    defineZodDto<ProyectoPlanParamsDto>('ProyectoPlanParamsDto', {
      id: { schema: z.number().int().max(2147483647).min(1), coerce: 'number' },
    });

  id!: number;
}
export class PlanParamsDto extends ProyectoPlanParamsDto {
  static readonly schema: z.ZodType<PlanParamsDto> =
    defineZodDto<PlanParamsDto>(
      'PlanParamsDto',
      {
        idPlan: {
          schema: z.number().int().max(2147483647).min(1),
          coerce: 'number',
        },
      },
      () => mappedDto(ProyectoPlanParamsDto.schema),
    );

  idPlan!: number;
}
export class ActividadPlanParamsDto extends PlanParamsDto {
  static readonly schema: z.ZodType<ActividadPlanParamsDto> =
    defineZodDto<ActividadPlanParamsDto>(
      'ActividadPlanParamsDto',
      {
        idActividad: {
          schema: z.number().int().max(2147483647).min(1),
          coerce: 'number',
        },
      },
      () => mappedDto(PlanParamsDto.schema),
    );

  idActividad!: number;
}
export class AmpliacionPlanParamsDto extends PlanParamsDto {
  static readonly schema: z.ZodType<AmpliacionPlanParamsDto> =
    defineZodDto<AmpliacionPlanParamsDto>(
      'AmpliacionPlanParamsDto',
      {
        idAmpliacion: {
          schema: z.number().int().max(2147483647).min(1),
          coerce: 'number',
        },
      },
      () => mappedDto(PlanParamsDto.schema),
    );

  idAmpliacion!: number;
}
export class AsignacionParamsDto {
  static readonly schema: z.ZodType<AsignacionParamsDto> =
    defineZodDto<AsignacionParamsDto>('AsignacionParamsDto', {
      idAsignacion: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
    });

  idAsignacion!: number;
}
export class CrearPlanDto {
  static readonly schema: z.ZodType<CrearPlanDto> = defineZodDto<CrearPlanDto>(
    'CrearPlanDto',
    {
      idaprobador: {
        schema: z.number().int().max(2147483647).min(1),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
    },
  );

  idaprobador?: number;
}
export class RevisionPlanDto {
  static readonly schema: z.ZodType<RevisionPlanDto> =
    defineZodDto<RevisionPlanDto>('RevisionPlanDto', {
      revisionPlan: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
      motivo: {
        schema: z.string().min(1).max(1000),
        when: (_o, v) => v !== undefined,
        transforms: [trim],
      },
    });

  revisionPlan!: number;

  motivo?: string;
}
export class RevisionActividadDto extends RevisionPlanDto {
  static readonly schema: z.ZodType<RevisionActividadDto> =
    defineZodDto<RevisionActividadDto>(
      'RevisionActividadDto',
      {
        revision: {
          schema: z.number().int().max(2147483647).min(1),
          coerce: 'number',
        },
      },
      () => mappedDto(RevisionPlanDto.schema),
    );

  revision!: number;
}
export class MotivoPlanDto {
  static readonly schema: z.ZodType<MotivoPlanDto> =
    defineZodDto<MotivoPlanDto>('MotivoPlanDto', {
      revisionPlan: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
      motivo: { schema: z.string().min(1).max(1000), transforms: [trim] },
    });

  revisionPlan!: number;

  motivo!: string;
}
export class ReglasDto {
  static readonly schema: z.ZodType<ReglasDto> = defineZodDto<ReglasDto>(
    'ReglasDto',
    {
      idaprobador: {
        schema: z.number().int().max(2147483647).min(1),
        when: (_o, v) => v !== undefined && v !== null,
      },
      bloquearexceso: { schema: z.boolean(), when: (_o, v) => v !== undefined },
      permitirnoplaneadas: {
        schema: z.boolean(),
        when: (_o, v) => v !== undefined,
      },
      toleranciaporcentaje: {
        schema: z.number().multipleOf(0.01).min(0).max(100),
        when: (_o, v) => v !== undefined,
      },
      alertaporcentaje: {
        schema: z.number().multipleOf(0.01).min(0).max(100),
        when: (_o, v) => v !== undefined,
      },
    },
  );

  idaprobador?: number | null;

  bloquearexceso?: boolean;

  permitirnoplaneadas?: boolean;

  toleranciaporcentaje?: number;

  alertaporcentaje?: number;
}
export class ReglasPlanDto extends RevisionPlanDto {
  static readonly schema: z.ZodType<ReglasPlanDto> =
    defineZodDto<ReglasPlanDto>(
      'ReglasPlanDto',
      {
        reglas: {
          schema: z
            .lazy(() => ReglasDto.schema)
            .refine((value) => value !== undefined && value !== null, {
              message: 'El campo es obligatorio',
            }),
        },
      },
      () => mappedDto(RevisionPlanDto.schema),
    );

  reglas!: ReglasDto;
}
export class PersonaPlanDto {
  static readonly schema: z.ZodType<PersonaPlanDto> =
    defineZodDto<PersonaPlanDto>('PersonaPlanDto', {
      idtrabajador: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
      minutosasignados: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
    });

  idtrabajador!: number;

  minutosasignados!: number;
}
export class DependenciaPlanDto {
  static readonly schema: z.ZodType<DependenciaPlanDto> =
    defineZodDto<DependenciaPlanDto>('DependenciaPlanDto', {
      idpredecesora: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
      desfasedias: {
        schema: z.number().int().max(2147483647).min(0),
        coerce: 'number',
      },
    });

  idpredecesora!: number;

  desfasedias!: number;
}
export class CrearDatosActividadDto {
  static readonly schema: z.ZodType<CrearDatosActividadDto> =
    defineZodDto<CrearDatosActividadDto>('CrearDatosActividadDto', {
      identregable: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
      nombre: { schema: z.string().min(1).max(240), transforms: [trim] },
      descripcion: {
        schema: z.string().max(4000),
        when: (_o, v) => v !== undefined,
      },
      eshito: { schema: z.boolean(), when: (_o, v) => v !== undefined },
      minutosestimados: {
        schema: z.number().int().max(2147483647).min(0),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
      orden: {
        schema: z.number().int().max(2147483647).min(0),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
      fechanoiniciarantes: {
        schema: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        when: (_o, v) => v !== undefined && v !== null,
      },
      fechanofinalizarantes: {
        schema: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        when: (_o, v) => v !== undefined && v !== null,
        checks: [
          {
            validate: (value, object) =>
              value == null ||
              object['fechanoiniciarantes'] == null ||
              String(value) >= String(object['fechanoiniciarantes']),
            message: 'La fecha final debe ser mayor o igual a la inicial',
          },
        ],
      },
      fechalimite: {
        schema: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        when: (_o, v) => v !== undefined && v !== null,
      },
      asignaciones: {
        schema: z
          .array(z.lazy(() => PersonaPlanDto.schema))
          .max(100)
          .refine(
            (values) => {
              const keys = values.map((v: PersonaPlanDto) => v.idtrabajador);
              return new Set(keys).size === keys.length;
            },
            { message: 'No se permiten valores repetidos' },
          )
          .meta({ 'x-unique-by': 'idtrabajador' }),
        when: (_o, v) => v !== undefined,
      },
    });

  identregable!: number;

  nombre!: string;

  descripcion?: string;

  eshito?: boolean;

  minutosestimados?: number;

  orden?: number;

  fechanoiniciarantes?: string | null;

  fechanofinalizarantes?: string | null;

  fechalimite?: string | null;

  asignaciones?: PersonaPlanDto[];
}
export class EditarDatosActividadDto {
  static readonly schema: z.ZodType<EditarDatosActividadDto> =
    defineZodDto<EditarDatosActividadDto>('EditarDatosActividadDto', {
      identregable: {
        schema: z.number().int().max(2147483647).min(1),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
      nombre: {
        schema: z.string().min(1).max(240),
        when: (_o, v) => v !== undefined,
        transforms: [trim],
      },
      descripcion: {
        schema: z.string().max(4000),
        when: (_o, v) => v !== undefined,
      },
      eshito: { schema: z.boolean(), when: (_o, v) => v !== undefined },
      minutosestimados: {
        schema: z.number().int().max(2147483647).min(0),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
      orden: {
        schema: z.number().int().max(2147483647).min(0),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
      fechanoiniciarantes: {
        schema: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        when: (_o, v) => v !== undefined && v !== null,
      },
      fechanofinalizarantes: {
        schema: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        when: (_o, v) => v !== undefined && v !== null,
        checks: [
          {
            validate: (value, object) =>
              value == null ||
              object['fechanoiniciarantes'] == null ||
              String(value) >= String(object['fechanoiniciarantes']),
            message: 'La fecha final debe ser mayor o igual a la inicial',
          },
        ],
      },
      fechalimite: {
        schema: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        when: (_o, v) => v !== undefined && v !== null,
      },
      asignaciones: {
        schema: z
          .array(z.lazy(() => PersonaPlanDto.schema))
          .max(100)
          .refine(
            (values) => {
              const keys = values.map((v: PersonaPlanDto) => v.idtrabajador);
              return new Set(keys).size === keys.length;
            },
            { message: 'No se permiten valores repetidos' },
          )
          .meta({ 'x-unique-by': 'idtrabajador' }),
        when: (_o, v) => v !== undefined,
      },
    });

  identregable?: number;

  nombre?: string;

  descripcion?: string;

  eshito?: boolean;

  minutosestimados?: number;

  orden?: number;

  fechanoiniciarantes?: string | null;

  fechanofinalizarantes?: string | null;

  fechalimite?: string | null;

  asignaciones?: PersonaPlanDto[];
}
export class CrearActividadPlanDto extends RevisionPlanDto {
  static readonly schema: z.ZodType<CrearActividadPlanDto> =
    defineZodDto<CrearActividadPlanDto>(
      'CrearActividadPlanDto',
      {
        datos: {
          schema: z
            .lazy(() => CrearDatosActividadDto.schema)
            .refine((value) => value !== undefined && value !== null, {
              message: 'El campo es obligatorio',
            }),
          checks: [
            {
              validate: (value) => {
                if (!value || typeof value !== 'object' || Array.isArray(value))
                  return false;
                const data = value as {
                  eshito?: boolean;
                  minutosestimados?: number;
                  asignaciones?: unknown[];
                };
                return (
                  data.eshito !== true ||
                  ((data.minutosestimados === undefined ||
                    data.minutosestimados === 0) &&
                    (!data.asignaciones || data.asignaciones.length === 0))
                );
              },
              message: 'Un hito requiere cero minutos y no admite asignaciones',
            },
          ],
        },
      },
      () => mappedDto(RevisionPlanDto.schema),
    );

  datos!: CrearDatosActividadDto;
}
export class EditarActividadPlanDto extends RevisionActividadDto {
  static readonly schema: z.ZodType<EditarActividadPlanDto> =
    defineZodDto<EditarActividadPlanDto>(
      'EditarActividadPlanDto',
      {
        datos: {
          schema: z
            .lazy(() => EditarDatosActividadDto.schema)
            .refine((value) => value !== undefined && value !== null, {
              message: 'El campo es obligatorio',
            }),
          checks: [
            {
              validate: (value) => {
                if (!value || typeof value !== 'object' || Array.isArray(value))
                  return false;
                const data = value as {
                  eshito?: boolean;
                  minutosestimados?: number;
                  asignaciones?: unknown[];
                };
                return (
                  data.eshito !== true ||
                  ((data.minutosestimados === undefined ||
                    data.minutosestimados === 0) &&
                    (!data.asignaciones || data.asignaciones.length === 0))
                );
              },
              message: 'Un hito requiere cero minutos y no admite asignaciones',
            },
          ],
        },
      },
      () => mappedDto(RevisionActividadDto.schema),
    );

  datos!: EditarDatosActividadDto;
}
export class AsignacionesPlanDto extends RevisionPlanDto {
  static readonly schema: z.ZodType<AsignacionesPlanDto> =
    defineZodDto<AsignacionesPlanDto>(
      'AsignacionesPlanDto',
      {
        revisionActividad: {
          schema: z.number().int().max(2147483647).min(1),
          coerce: 'number',
        },
        asignaciones: {
          schema: z
            .array(z.lazy(() => PersonaPlanDto.schema))
            .max(100)
            .refine(
              (values) => {
                const keys = values.map((v: PersonaPlanDto) => v.idtrabajador);
                return new Set(keys).size === keys.length;
              },
              { message: 'No se permiten valores repetidos' },
            )
            .meta({ 'x-unique-by': 'idtrabajador' }),
        },
      },
      () => mappedDto(RevisionPlanDto.schema),
    );

  revisionActividad!: number;

  asignaciones!: PersonaPlanDto[];
}
export class DependenciasPlanDto extends RevisionPlanDto {
  static readonly schema: z.ZodType<DependenciasPlanDto> =
    defineZodDto<DependenciasPlanDto>(
      'DependenciasPlanDto',
      {
        dependencias: {
          schema: z
            .array(z.lazy(() => DependenciaPlanDto.schema))
            .max(200)
            .refine(
              (values) => {
                const keys = values.map(
                  (v: DependenciaPlanDto) => v.idpredecesora,
                );
                return new Set(keys).size === keys.length;
              },
              { message: 'No se permiten valores repetidos' },
            )
            .meta({ 'x-unique-by': 'idpredecesora' }),
        },
      },
      () => mappedDto(RevisionPlanDto.schema),
    );

  dependencias!: DependenciaPlanDto[];
}
export class OrdenPlanDto extends RevisionPlanDto {
  static readonly schema: z.ZodType<OrdenPlanDto> = defineZodDto<OrdenPlanDto>(
    'OrdenPlanDto',
    {
      entregables: {
        schema: z
          .array(z.number().int().min(1))
          .max(2000)
          .refine(
            (values) => {
              const keys = values.map((value) => value);
              return new Set(keys).size === keys.length;
            },
            { message: 'No se permiten valores repetidos' },
          )
          .meta({ uniqueItems: true }),
      },
      actividades: {
        schema: z
          .array(z.number().int().min(1))
          .max(2000)
          .refine(
            (values) => {
              const keys = values.map((value) => value);
              return new Set(keys).size === keys.length;
            },
            { message: 'No se permiten valores repetidos' },
          )
          .meta({ uniqueItems: true }),
      },
    },
    () => mappedDto(RevisionPlanDto.schema),
  );

  entregables!: number[];

  actividades!: number[];
}
export class CambioActividadDto {
  static readonly schema: z.ZodType<CambioActividadDto> =
    defineZodDto<CambioActividadDto>('CambioActividadDto', {
      idactividad: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
      fechanoiniciarantes: {
        schema: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        when: (_o, v) => v !== undefined && v !== null,
      },
      fechanofinalizarantes: {
        schema: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        when: (_o, v) => v !== undefined && v !== null,
        checks: [
          {
            validate: (value, object) =>
              value == null ||
              object['fechanoiniciarantes'] == null ||
              String(value) >= String(object['fechanoiniciarantes']),
            message: 'La fecha final debe ser mayor o igual a la inicial',
          },
        ],
      },
      orden: {
        schema: z.number().int().max(2147483647).min(0),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
    });

  idactividad!: number;

  fechanoiniciarantes?: string | null;

  fechanofinalizarantes?: string | null;

  orden?: number;
}
export class CambioAsignacionDto {
  static readonly schema: z.ZodType<CambioAsignacionDto> =
    defineZodDto<CambioAsignacionDto>('CambioAsignacionDto', {
      idactividad: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
      personas: {
        schema: z
          .array(z.lazy(() => PersonaPlanDto.schema))
          .max(100)
          .refine(
            (values) => {
              const keys = values.map((v: PersonaPlanDto) => v.idtrabajador);
              return new Set(keys).size === keys.length;
            },
            { message: 'No se permiten valores repetidos' },
          )
          .meta({ 'x-unique-by': 'idtrabajador' }),
      },
    });

  idactividad!: number;

  personas!: PersonaPlanDto[];
}
export class CambioDependenciaDto {
  static readonly schema: z.ZodType<CambioDependenciaDto> =
    defineZodDto<CambioDependenciaDto>('CambioDependenciaDto', {
      idsucesora: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
      predecesoras: {
        schema: z
          .array(z.lazy(() => DependenciaPlanDto.schema))
          .max(200)
          .refine(
            (values) => {
              const keys = values.map(
                (v: DependenciaPlanDto) => v.idpredecesora,
              );
              return new Set(keys).size === keys.length;
            },
            { message: 'No se permiten valores repetidos' },
          )
          .meta({ 'x-unique-by': 'idpredecesora' }),
      },
    });

  idsucesora!: number;

  predecesoras!: DependenciaPlanDto[];
}
export class CambioEntregableDto {
  static readonly schema: z.ZodType<CambioEntregableDto> =
    defineZodDto<CambioEntregableDto>('CambioEntregableDto', {
      identregable: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
      orden: {
        schema: z.number().int().max(2147483647).min(0),
        coerce: 'number',
      },
    });

  identregable!: number;

  orden!: number;
}
export class CambiosDto {
  static readonly schema: z.ZodType<CambiosDto> = defineZodDto<CambiosDto>(
    'CambiosDto',
    {
      idactividad: {
        schema: z.number().int().max(2147483647).min(1),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
      fechanoiniciarantes: {
        schema: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        when: (_o, v) => v !== undefined && v !== null,
      },
      fechanofinalizarantes: {
        schema: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        when: (_o, v) => v !== undefined && v !== null,
        checks: [
          {
            validate: (value, object) =>
              value == null ||
              object['fechanoiniciarantes'] == null ||
              String(value) >= String(object['fechanoiniciarantes']),
            message: 'La fecha final debe ser mayor o igual a la inicial',
          },
        ],
      },
      actividades: {
        schema: z
          .array(z.lazy(() => CambioActividadDto.schema))
          .max(200)
          .refine(
            (values) => {
              const keys = values.map((v: CambioActividadDto) => v.idactividad);
              return new Set(keys).size === keys.length;
            },
            { message: 'No se permiten valores repetidos' },
          )
          .meta({ 'x-unique-by': 'idactividad' }),
        when: (_o, v) => v !== undefined,
      },
      asignaciones: {
        schema: z
          .array(z.lazy(() => CambioAsignacionDto.schema))
          .max(200)
          .refine(
            (values) => {
              const keys = values.map(
                (v: CambioAsignacionDto) => v.idactividad,
              );
              return new Set(keys).size === keys.length;
            },
            { message: 'No se permiten valores repetidos' },
          )
          .meta({ 'x-unique-by': 'idactividad' }),
        when: (_o, v) => v !== undefined,
      },
      dependencias: {
        schema: z
          .array(z.lazy(() => CambioDependenciaDto.schema))
          .max(200)
          .refine(
            (values) => {
              const keys = values.map(
                (v: CambioDependenciaDto) => v.idsucesora,
              );
              return new Set(keys).size === keys.length;
            },
            { message: 'No se permiten valores repetidos' },
          )
          .meta({ 'x-unique-by': 'idsucesora' }),
        when: (_o, v) => v !== undefined,
      },
      entregables: {
        schema: z
          .array(z.lazy(() => CambioEntregableDto.schema))
          .max(200)
          .refine(
            (values) => {
              const keys = values.map(
                (v: CambioEntregableDto) => v.identregable,
              );
              return new Set(keys).size === keys.length;
            },
            { message: 'No se permiten valores repetidos' },
          )
          .meta({ 'x-unique-by': 'identregable' }),
        when: (_o, v) => v !== undefined,
      },
    },
  );

  idactividad?: number;

  fechanoiniciarantes?: string | null;

  fechanofinalizarantes?: string | null;

  actividades?: CambioActividadDto[];

  asignaciones?: CambioAsignacionDto[];

  dependencias?: CambioDependenciaDto[];

  entregables?: CambioEntregableDto[];
}
export class PrevisualizarPlanDto {
  static readonly schema: z.ZodType<PrevisualizarPlanDto> =
    defineZodDto<PrevisualizarPlanDto>('PrevisualizarPlanDto', {
      cambios: {
        schema: z
          .lazy(() => CambiosDto.schema)
          .refine((value) => value !== undefined && value !== null, {
            message: 'El campo es obligatorio',
          }),
      },
    });

  cambios!: CambiosDto;
}
export class LineaBaseDto extends MotivoPlanDto {
  static readonly schema: z.ZodType<LineaBaseDto> = defineZodDto<LineaBaseDto>(
    'LineaBaseDto',
    { nombre: { schema: z.string().min(1).max(160), transforms: [trim] } },
    () => mappedDto(MotivoPlanDto.schema),
  );

  nombre!: string;
}
export class ReprogramarPlanDto extends MotivoPlanDto {
  static readonly schema: z.ZodType<ReprogramarPlanDto> =
    defineZodDto<ReprogramarPlanDto>(
      'ReprogramarPlanDto',
      {
        revision: {
          schema: z.number().int().max(2147483647).min(1),
          coerce: 'number',
        },
        fechaNoIniciarAntes: {
          schema: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .refine((value) => isoDate(value, true), {
              message: 'Debe ser una fecha ISO válida',
            })
            .meta({ format: 'date-time' }),
          when: (_o, v) => v !== undefined && v !== null,
        },
        fechaNoFinalizarAntes: {
          schema: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .refine((value) => isoDate(value, true), {
              message: 'Debe ser una fecha ISO válida',
            })
            .meta({ format: 'date-time' }),
          when: (_o, v) => v !== undefined && v !== null,
          checks: [
            {
              validate: (value, object) =>
                value == null ||
                object['fechaNoIniciarAntes'] == null ||
                String(value) >= String(object['fechaNoIniciarAntes']),
              message: 'La fecha final debe ser mayor o igual a la inicial',
            },
          ],
        },
      },
      () => mappedDto(MotivoPlanDto.schema),
    );

  revision!: number;

  fechaNoIniciarAntes?: string | null;

  fechaNoFinalizarAntes?: string | null;
}
export class EstadoActividadPlanDto extends MotivoPlanDto {
  static readonly schema: z.ZodType<EstadoActividadPlanDto> =
    defineZodDto<EstadoActividadPlanDto>(
      'EstadoActividadPlanDto',
      {
        revision: {
          schema: z.number().int().max(2147483647).min(1),
          coerce: 'number',
        },
        idEstadoDestino: {
          schema: z
            .number()
            .int()
            .max(2147483647)
            .refine(
              (value) =>
                ([703, 704, 705, 706] as readonly unknown[]).includes(value),
              { message: 'Seleccione una opción válida' },
            )
            .meta({ enum: [703, 704, 705, 706] }),
        },
      },
      () => mappedDto(MotivoPlanDto.schema),
    );

  revision!: number;

  idEstadoDestino!: number;
}
export class EstadoPlanDto extends MotivoPlanDto {
  static readonly schema: z.ZodType<EstadoPlanDto> =
    defineZodDto<EstadoPlanDto>(
      'EstadoPlanDto',
      {
        idEstadoDestino: {
          schema: z
            .number()
            .int()
            .max(2147483647)
            .refine(
              (value) => ([701, 702] as readonly unknown[]).includes(value),
              { message: 'Seleccione una opción válida' },
            )
            .meta({ enum: [701, 702] }),
        },
      },
      () => mappedDto(MotivoPlanDto.schema),
    );

  idEstadoDestino!: number;
}
export class PaginacionPlanDto {
  static readonly schema: z.ZodType<PaginacionPlanDto> =
    defineZodDto<PaginacionPlanDto>('PaginacionPlanDto', {
      offset: {
        schema: z.number().int().max(2147483647).min(0),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
      limite: {
        schema: z.number().int().max(2147483647).min(1).max(200),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
    });

  offset?: number;

  limite?: number;
}
export class HistorialPlanDto extends PaginacionPlanDto {
  static readonly schema: z.ZodType<HistorialPlanDto> =
    defineZodDto<HistorialPlanDto>(
      'HistorialPlanDto',
      {
        tipo: {
          schema: z
            .union([
              z.literal('cambios'),
              z.literal('movimientos'),
              z.literal('lineasbase'),
              z.literal('detallelineabase'),
            ])
            .refine(
              (value) =>
                (
                  [
                    'cambios',
                    'movimientos',
                    'lineasbase',
                    'detallelineabase',
                  ] as readonly unknown[]
                ).includes(value),
              { message: 'Seleccione una opción válida' },
            )
            .meta({
              enum: [
                'cambios',
                'movimientos',
                'lineasbase',
                'detallelineabase',
              ],
            }),
        },
        idLineaBase: {
          schema: z.number().int().max(2147483647).min(1),
          when: (o: HistorialPlanDto, v) =>
            o.tipo === 'detallelineabase' || v !== undefined,
          coerce: 'number',
        },
      },
      () => mappedDto(PaginacionPlanDto.schema),
    );

  tipo!: 'cambios' | 'movimientos' | 'lineasbase' | 'detallelineabase';

  idLineaBase?: number;
}
export class ResolverAmpliacionDto {
  static readonly schema: z.ZodType<ResolverAmpliacionDto> =
    defineZodDto<ResolverAmpliacionDto>('ResolverAmpliacionDto', {
      minutosAprobados: {
        schema: z.number().int().max(2147483647).min(0),
        coerce: 'number',
      },
      resolucion: { schema: z.string().min(1).max(1000), transforms: [trim] },
    });

  minutosAprobados!: number;

  resolucion!: string;
}
export class MisAsignacionesDto {
  static readonly schema: z.ZodType<MisAsignacionesDto> =
    defineZodDto<MisAsignacionesDto>('MisAsignacionesDto', {
      fecha: {
        schema: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
      },
      idProyecto: {
        schema: z.number().int().max(2147483647).min(1),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
    });

  fecha!: string;

  idProyecto?: number;
}
export class EstadoParteDto {
  static readonly schema: z.ZodType<EstadoParteDto> =
    defineZodDto<EstadoParteDto>('EstadoParteDto', {
      revision: {
        schema: z.number().int().max(2147483647).min(1),
        coerce: 'number',
      },
      idEstadoDestino: {
        schema: z
          .number()
          .int()
          .max(2147483647)
          .refine(
            (value) =>
              ([703, 704, 705, 706] as readonly unknown[]).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: [703, 704, 705, 706] }),
      },
      motivo: { schema: z.string().min(1).max(1000), transforms: [trim] },
    });

  revision!: number;

  idEstadoDestino!: number;

  motivo!: string;
}
export class SolicitarAmpliacionDto {
  static readonly schema: z.ZodType<SolicitarAmpliacionDto> =
    defineZodDto<SolicitarAmpliacionDto>('SolicitarAmpliacionDto', {
      minutos: {
        schema: z.number().int().max(2147483647).min(1).max(60000),
        coerce: 'number',
      },
      motivo: { schema: z.string().min(1).max(1000), transforms: [trim] },
    });

  minutos!: number;

  motivo!: string;
}
export class MisAmpliacionesDto extends PaginacionPlanDto {
  static readonly schema: z.ZodType<MisAmpliacionesDto> =
    defineZodDto<MisAmpliacionesDto>(
      'MisAmpliacionesDto',
      {
        idPlan: {
          schema: z.number().int().max(2147483647).min(1),
          coerce: 'number',
        },
      },
      () => mappedDto(PaginacionPlanDto.schema),
    );

  idPlan!: number;
}
