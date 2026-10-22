import { operationNotes } from './operation-notes';
import './dto-registry.generated';
import { z } from 'zod';
import type { OpenAPIObject } from '@nestjs/swagger';
import type {
  OperationObject,
  SchemaObject,
  ReferenceObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import contracts from './contracts.generated.json';
import { dtoDefinition, dtoSchemas } from '../validation/zod-dto';

type JsonSchema = Record<string, any>;
const humanize = (name: string) =>
  name.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ');
const ref = (name: string) => ({ $ref: '#/components/schemas/' + name });
function normalize(schema: JsonSchema): JsonSchema {
  const result = JSON.parse(
    JSON.stringify(schema).replaceAll(
      '#/definitions/',
      '#/components/schemas/',
    ),
  ) as JsonSchema;
  delete result.$schema;
  delete result.definitions;
  delete result.$defs;
  if (result.allOf?.length === 1 && Object.keys(result).length === 1)
    return result.allOf[0];
  return result;
}
export function createDtoSchemas(): Record<string, SchemaObject> {
  const result: Record<string, SchemaObject> = {};
  const schemaNames = new Map(
    [...dtoSchemas].map(([name, schema]) => [schema, name]),
  );
  for (const [name, schema] of dtoSchemas) {
    const properties: Record<string, SchemaObject | ReferenceObject> = {};
    const required: string[] = [];
    for (const [key, field] of Object.entries(dtoDefinition(schema).fields)) {
      const generated = normalize(
        z.toJSONSchema(field.schema, {
          target: 'openapi-3.0',
          io: 'input',
          unrepresentable: 'any',
          override(context) {
            const nestedName = schemaNames.get(
              context.zodSchema as unknown as z.ZodType,
            );
            if (nestedName) {
              for (const key of Object.keys(context.jsonSchema))
                delete (context.jsonSchema as JsonSchema)[key];
              Object.assign(context.jsonSchema, ref(nestedName));
            }
          },
        }),
      );
      const nullable =
        field.optional ||
        field.schema.safeParse(null).success ||
        (!!field.when && !field.when({ [key]: null }, null));
      const output: JsonSchema = generated.$ref
        ? { allOf: [generated] }
        : generated;
      if (nullable) output.nullable = true;
      if (
        output.pattern &&
        /(?:\\d|\[0-9\])\{4\}/.test(output.pattern) &&
        output.pattern.endsWith('$') &&
        !output.pattern.includes('T')
      )
        output.format = 'date';
      output.description =
        field.description ||
        output.description ||
        humanize(key) +
          (field.when
            ? '. Su obligatoriedad depende de las reglas del recurso.'
            : '.');
      if (output['x-unique-by'])
        output.description +=
          ' No se permite repetir ' + output['x-unique-by'] + '.';
      if (field.checks?.length)
        output.description +=
          ' ' + field.checks.map((check) => check.message).join('. ') + '.';
      if (field.example !== undefined) output.example = field.example;
      if (field.defaultValue !== undefined) output.default = field.defaultValue;
      if (
        !field.optional &&
        !field.when &&
        !field.schema.safeParse(undefined).success &&
        field.defaultValue === undefined
      )
        required.push(key);
      properties[key] = output as SchemaObject;
    }
    if (!Object.keys(properties).length) continue;
    result[name] = {
      type: 'object',
      title: name,
      description: 'Contrato de ' + humanize(name.replace(/Dto$/, '')) + '.',
      properties,
      additionalProperties: false,
      ...(required.length ? { required } : {}),
    };
  }
  return result;
}
function exampleFor(
  schema: JsonSchema | undefined,
  schemas: Record<string, JsonSchema>,
  depth = 0,
  key = '',
  index = 0,
): unknown {
  if (!schema || depth > 7) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum?.length) return schema.enum[0];
  if (schema.$ref)
    return exampleFor(
      schemas[schema.$ref.split('/').pop()],
      schemas,
      depth + 1,
      key,
      index,
    );
  if (schema.allOf) {
    const values = schema.allOf.map((s: JsonSchema) =>
      exampleFor(s, schemas, depth + 1, key, index),
    );
    return values.every(
      (v: unknown) => v && typeof v === 'object' && !Array.isArray(v),
    )
      ? Object.assign({}, ...values)
      : values[0];
  }
  if (schema.anyOf || schema.oneOf)
    return exampleFor(
      (schema.anyOf || schema.oneOf)[0],
      schemas,
      depth + 1,
      key,
      index,
    );
  if (schema.type === 'array')
    return Array.from(
      { length: Math.max(1, schema.minItems ?? 1) },
      (_unused, index) =>
        exampleFor(schema.items, schemas, depth + 1, key, index),
    );
  if (schema.type === 'object' || schema.properties)
    return Object.fromEntries(
      Object.entries(schema.properties || {}).map(([k, s]) => [
        k,
        exampleFor(s as JsonSchema, schemas, depth + 1, k, index),
      ]),
    );
  if (schema.type === 'boolean') return true;
  if (schema.type === 'number' || schema.type === 'integer')
    return /diasemana/i.test(key)
      ? index + 1
      : (schema.minimum ?? (/status/i.test(key) ? 200 : 1));
  if (schema.type === 'string') {
    if (schema.format === 'binary') return undefined;
    if (schema.format === 'date') return '2026-10-22';
    if (schema.format === 'date-time') return '2026-10-22T08:00:00-05:00';
    if (schema.format === 'email' || /correo|email/i.test(key))
      return 'usuario@example.invalid';
    if (schema.format === 'uuid') return '123e4567-e89b-42d3-a456-426614174000';
    if (/password|contrasena/i.test(key)) return 'Ejemplo-Seguro-123!';
    if (/token|secret/i.test(key)) return 'VALOR_DE_EJEMPLO';
    if (/zonahoraria/i.test(key)) return 'America/Lima';
    if (/horaentrada|horainicio/i.test(key)) return '08:00';
    if (/horasalida|horafin/i.test(key)) return '17:00';
    if (/url|link/i.test(key)) return 'https://example.invalid/recurso';
    if (/^fecha|fecha$/i.test(key)) return '2026-10-22';
    return humanize(key) || 'Ejemplo';
  }
  return null;
}
const errorSchema: SchemaObject = {
  type: 'object',
  required: ['data', 'message', 'status'],
  properties: {
    data: { nullable: true, enum: [null] },
    message: {
      type: 'string',
      example: 'No tiene permiso para realizar esta operación',
    },
    status: { type: 'integer', example: 403 },
    code: {
      type: 'string',
      description:
        'Código estable de error cuando la operación lo proporciona.',
      example: 'GRANULAR_PERMISSION_DENIED',
    },
  },
};
/** Completa Scalar y el JSON público con los contratos de todos los controladores.
 * No cambia solicitudes, respuestas ni permisos de ejecución. */
export function completeOpenApi(document: OpenAPIObject): OpenAPIObject {
  document.components ??= {};
  const inputModels = createDtoSchemas();
  for (const [name, model] of Object.entries(inputModels)) {
    const previous = document.components.schemas?.[name] as
      | SchemaObject
      | undefined;
    for (const [key, property] of Object.entries(model.properties ?? {})) {
      const prior = previous?.properties?.[key];
      if (prior && !('$ref' in prior) && !('$ref' in property))
        model.properties![key] = { ...prior, ...property };
    }
  }
  document.components.schemas = {
    ...document.components.schemas,
    ...contracts.schemas,
    ...inputModels,
    ApiErrorResponse: errorSchema,
  } as Record<string, SchemaObject>;
  const schemas = document.components.schemas as Record<string, JsonSchema>;
  schemas.ApiResponseDto = {
    type: 'object',
    properties: {
      data: { description: 'Datos de la operación.' },
      message: { type: 'string' },
      status: { type: 'integer' },
      code: { type: 'string' },
    },
    required: ['data', 'message', 'status'],
  };
  for (const [path, item] of Object.entries(document.paths))
    for (const verb of [
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'head',
      'options',
    ]) {
      const operation = item?.[verb] as OperationObject | undefined;
      if (!operation) continue;
      const contract = (contracts.operations as Record<string, any>)[
        operation.operationId ?? ''
      ];
      if (!contract) continue;
      operation.summary ||= contract.summary;
      operation.description ||= contract.description || contract.summary;
      if (operationNotes[operation.operationId ?? ''])
        operation.description +=
          '\n\n' + operationNotes[operation.operationId ?? ''];
      if (contract.permission.length) {
        const permissionText = contract.permission
          .map((p: { codes: string | string[] }) =>
            Array.isArray(p.codes) ? p.codes.join(' o ') : p.codes,
          )
          .join('; ');
        operation.description +=
          '\n\n**Permisos requeridos:** ' +
          permissionText +
          '. El alcance y la pertenencia al recurso se verifican en el servidor.';
      }
      if (contract.auth) operation.security = [{ 'access-token': [] }];
      else if (contract.contextual) operation.security = [];
      const parameters = new Map(
        (operation.parameters ?? []).map((p) => [
          '$ref' in p ? p.$ref : p.in + ':' + p.name,
          p,
        ]),
      );
      for (const entry of contract.params) {
        const location =
          entry.kind === 'Param'
            ? 'path'
            : entry.kind === 'Headers'
              ? 'header'
              : 'query';
        if (entry.name) {
          const key = location + ':' + entry.name;
          const previous = parameters.get(key) as JsonSchema | undefined;
          parameters.set(key, {
            ...previous,
            name: entry.name,
            in: location,
            required:
              location === 'path' || (previous?.required ?? entry.required),
            schema: { ...(previous?.schema ?? {}), ...entry.schema },
            description: previous?.description || humanize(entry.name),
          });
        } else {
          const model = entry.schema.$ref
            ? schemas[entry.schema.$ref.split('/').pop()]
            : entry.schema;
          for (const [name, schema] of Object.entries(model?.properties ?? {}))
            parameters.set(location + ':' + name, {
              name,
              in: location,
              required:
                location === 'path' || model.required?.includes(name) || false,
              schema: schema as SchemaObject,
              description: (schema as JsonSchema).description || humanize(name),
            });
        }
      }
      for (const name of path.matchAll(/\{([^}]+)\}/g))
        if (!parameters.has('path:' + name[1]))
          parameters.set('path:' + name[1], {
            name: name[1],
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: humanize(name[1]),
          });
      operation.parameters = [...parameters.values()];
      if (contract.body || contract.file) {
        const bodySchema = contract.body || { type: 'object', properties: {} };
        const schema: JsonSchema = JSON.parse(
          JSON.stringify(
            contract.file && bodySchema.$ref
              ? schemas[bodySchema.$ref.split('/').pop()]
              : bodySchema,
          ),
        );
        if (contract.file && !schema.$ref) {
          schema.properties ??= {};
          schema.properties[contract.fileField] = contract.filesMultiple
            ? {
                type: 'array',
                items: { type: 'string', format: 'binary' },
                description: 'Archivos adjuntos.',
              }
            : {
                type: 'string',
                format: 'binary',
                description: 'Archivo adjunto.',
              };
          schema.required = [
            ...new Set([...(schema.required ?? []), contract.fileField]),
          ];
        }
        const media =
          contract.requestMedia ||
          (contract.file ? 'multipart/form-data' : 'application/json');
        const existing = operation.requestBody as JsonSchema | undefined;
        operation.requestBody = {
          ...existing,
          required: true,
          content: {
            ...(existing?.content ?? {}),
            [media]: {
              ...(existing?.content?.[media] ?? {}),
              schema,
              ...(!existing?.content?.[media]?.examples
                ? { example: exampleFor(schema, schemas) }
                : {}),
            },
          },
        };
      }
      operation.responses ??= {};
      const status = String(contract.status);
      const previous = operation.responses[status] as JsonSchema | undefined;
      if (contract.redirect)
        operation.responses[status] = {
          description: 'Redirección al recurso autorizado.',
          headers: {
            Location: {
              schema: { type: 'string', format: 'uri' },
              description: 'URL de destino.',
            },
          },
        };
      else if (
        !contract.noContent &&
        ![204, 304].includes(contract.status) &&
        verb !== 'head'
      ) {
        const responseSchema = contract.response as JsonSchema;
        const media = contract.mediaType || 'application/json';
        const ex = exampleFor(responseSchema, schemas);
        operation.responses[status] = {
          ...previous,
          description:
            previous?.description || 'Operación completada correctamente.',
          content: {
            ...(previous?.content ?? {}),
            [media]: {
              ...(previous?.content?.[media] ?? {}),
              schema: responseSchema,
              ...(!contract.binary && !previous?.content?.[media]?.examples
                ? { example: ex }
                : {}),
            },
          },
        };
      }
      if (operation.operationId === 'PlanificacionController_obtenerPlan') {
        const media = (operation.responses['200'] as JsonSchema).content[
          'application/json'
        ];
        media.examples = {
          conPlan: { summary: 'Proyecto con borrador', value: media.example },
          sinPlan: {
            summary: 'Proyecto sin planificación',
            value: {
              data: { idproyecto: 1, plan: null },
              message: 'Operación exitosa',
              status: 200,
            },
          },
        };
        delete media.example;
      }
      if (contract.noContent)
        operation.responses[status] = {
          description: 'Operación completada sin cuerpo de respuesta.',
        };
      for (const [rawStatus, rawSchema] of Object.entries(
        contract.rawResponses ?? {},
      )) {
        if (Number(rawStatus) < 400 && contract.binary) continue;
        operation.responses[rawStatus] = {
          description:
            Number(rawStatus) < 400
              ? 'Respuesta del protocolo.'
              : 'Error del protocolo.',
          content: {
            'application/json': {
              schema: rawSchema as SchemaObject,
              example: exampleFor(rawSchema as JsonSchema, schemas),
            },
          },
        };
      }
      for (const [declaredStatus, declared] of Object.entries(
        operation.responses,
      )) {
        const code = Number(declaredStatus);
        const response = declared as JsonSchema;
        if (
          code >= 200 &&
          code < 300 &&
          code !== contract.status &&
          !contract.rawResponses?.[declaredStatus]
        ) {
          delete operation.responses[declaredStatus];
          continue;
        }
        if (code >= 400 && !response.$ref && !response.content)
          response.content = {
            'application/json': {
              schema: ref('ApiErrorResponse'),
              example: {
                data: null,
                message:
                  response.description || 'No se pudo completar la operación.',
                status: code,
              },
            },
          };
      }
      for (const code of [
        400,
        ...(contract.auth ? [401, 403] : []),
        404,
        ...(contract.verb !== 'get' ? [409, 422] : []),
        500,
      ])
        if (!operation.responses[code])
          operation.responses[code] = {
            description: (
              {
                400: 'Datos de entrada inválidos.',
                401: 'Sesión ausente o inválida.',
                403: 'Permiso o alcance insuficiente.',
                404: 'Recurso inexistente o no accesible.',
                409: 'Conflicto de estado o revisión.',
                422: 'Regla de negocio incumplida.',
                500: 'No se pudo completar la operación.',
              } as Record<number, string>
            )[code],
            content: {
              'application/json': {
                schema: ref('ApiErrorResponse'),
                example: {
                  data: null,
                  message: 'Consulte la descripción de este estado.',
                  status: code,
                },
              },
            },
          };
    }
  const empty = new Set(
    Object.entries(schemas)
      .filter(
        ([, schema]) =>
          schema.type === 'object' &&
          !Object.keys(schema.properties ?? {}).length &&
          !schema.additionalProperties &&
          !schema.allOf &&
          !schema.anyOf &&
          !schema.oneOf,
      )
      .map(([name]) => name),
  );
  function inlineEmpty(node: any) {
    if (!node || typeof node !== 'object') return;
    if (
      typeof node.$ref === 'string' &&
      empty.has(node.$ref.split('/').pop())
    ) {
      delete node.$ref;
      Object.assign(node, {
        type: 'object',
        maxProperties: 0,
        description: 'Esta operación no requiere campos.',
      });
    }
    for (const value of Object.values(node)) inlineEmpty(value);
  }
  inlineEmpty(document);
  for (const name of empty) delete schemas[name];
  document.info.description =
    (document.info.description ?? '') +
    '\n\nLos ejemplos son sintéticos. Los IDs de recursos se deben sustituir por valores del entorno. Las operaciones de archivo y protocolo conservan sus formatos propios.';
  return document;
}
