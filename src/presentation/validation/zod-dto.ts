import { z } from 'zod';

export interface DtoField {
  schema: z.ZodType;
  optional?: boolean;
  when?: (object: any, value: unknown) => boolean;
  transforms?: ((input: {
    value: unknown;
    obj: Record<string, unknown>;
    key: string;
  }) => unknown)[];
  coerce?: 'number' | 'boolean' | 'string';
  defaultValue?: unknown;
  checks?: {
    validate: (value: unknown, object: Record<string, unknown>) => boolean;
    message: string;
  }[];
  description?: string;
  example?: unknown;
}
export interface DtoDefinition {
  fields: Record<string, DtoField>;
}
const definitions = new WeakMap<z.ZodType, () => DtoDefinition>();
export const dtoSchemas = new Map<string, z.ZodType>();
export function dtoDefinition(schema: z.ZodType): DtoDefinition {
  const get = definitions.get(schema);
  if (!get) throw new Error('Definición de DTO Zod no registrada');
  return get();
}
export function mappedDto(
  schema: z.ZodType,
  options: {
    omit?: readonly string[];
    pick?: readonly string[];
    partial?: boolean;
  } = {},
): DtoDefinition {
  return {
    fields: Object.fromEntries(
      Object.entries(dtoDefinition(schema).fields)
        .filter(
          ([key]) =>
            !options.omit?.includes(key) &&
            (!options.pick || options.pick.includes(key)),
        )
        .map(([key, field]) => [
          key,
          options.partial ? { ...field, optional: true } : field,
        ]),
    ),
  };
}
export function mergeDtos(...schemas: z.ZodType[]): DtoDefinition {
  return {
    fields: Object.assign(
      {},
      ...schemas.map((schema) => dtoDefinition(schema).fields),
    ) as Record<string, DtoField>,
  };
}
/** Un único contrato Zod alimenta validación HTTP y documentación OpenAPI.
 * Las condiciones cruzadas se evalúan después de transformar todos los campos. */
export function defineZodDto<T>(
  name: string,
  own: Partial<Record<keyof T & string, DtoField>>,
  base?: () => DtoDefinition,
): z.ZodType<T> {
  const getDefinition = () => {
    const inherited = base?.().fields ?? {};
    return {
      fields: {
        ...inherited,
        ...Object.fromEntries(
          Object.entries(own as Record<string, DtoField>).map(
            ([key, field]) => [
              key,
              {
                ...inherited[key],
                ...field,
                schema: inherited[key]
                  ? z.intersection(inherited[key].schema, field.schema)
                  : field.schema,
              },
            ],
          ),
        ),
      },
    };
  };
  let compiled: z.ZodType | undefined;
  const schema = z
    .lazy(() => {
      if (compiled) return compiled;
      const { fields } = getDefinition();
      const shape = Object.fromEntries(
        Object.keys(fields).map((key) => [key, z.unknown().optional()]),
      );
      const objectSchema = z
        .strictObject(shape)
        .superRefine((object, context) => {
          for (const [key, field] of Object.entries(fields)) {
            const value = object[key];
            if (
              (field.optional && value == null) ||
              (field.when && !field.when(object, value))
            )
              continue;
            const parsed = field.schema.safeParse(value);
            if (!parsed.success) {
              for (const issue of parsed.error.issues)
                context.addIssue({
                  code: 'custom',
                  path: [key, ...issue.path],
                  message: issue.message,
                });
              continue;
            }
            if (key in object || parsed.data !== undefined)
              object[key] = parsed.data;
            for (const check of field.checks ?? [])
              if (!check.validate(object[key], object))
                context.addIssue({
                  code: 'custom',
                  path: [key],
                  message: check.message,
                });
          }
        });
      const transforms = Object.values(fields).some(
        (field) =>
          field.coerce ||
          field.transforms?.length ||
          field.defaultValue !== undefined,
      );
      compiled = transforms
        ? z.preprocess((input) => {
            if (
              input === null ||
              typeof input !== 'object' ||
              Array.isArray(input)
            )
              return input;
            const object: Record<string, unknown> = { ...input };
            for (const [key, field] of Object.entries(fields)) {
              if (!(key in object) && field.defaultValue !== undefined)
                object[key] = field.defaultValue;
              if (!(key in object)) continue;
              let value = object[key];
              if (value != null && field.coerce) {
                const convert =
                  field.coerce === 'number'
                    ? Number
                    : field.coerce === 'boolean'
                      ? Boolean
                      : String;
                value = Array.isArray(value)
                  ? value.map((item) => convert(item))
                  : convert(value);
              }
              for (const transform of field.transforms ?? [])
                value = transform({ value, obj: object, key });
              object[key] = value;
            }
            return object;
          }, objectSchema)
        : objectSchema;
      return compiled;
    })
    .meta({ id: name, title: name });
  definitions.set(schema, getDefinition);
  dtoSchemas.set(name, schema);
  return schema as z.ZodType<T>;
}
/** ISO 8601; comprueba el día real para evitar normalizar 30 de febrero. */
export function isoDate(value: string, strict = false): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}(?:[T ].*)?$/.test(value) ||
    !Number.isFinite(Date.parse(value))
  )
    return false;
  if (!strict) return true;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const check = new Date(0);
  check.setUTCFullYear(year, month - 1, day);
  check.setUTCHours(0, 0, 0, 0);
  return (
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day
  );
}
