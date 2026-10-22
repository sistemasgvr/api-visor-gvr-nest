import metadata from '../src/presentation/openapi/contracts.generated.json';
import { GuardarSemanaCalendarioDto } from '../src/presentation/dtos/planificacion/calendarios/guardar-semana-calendario.dto';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger';
import {
  completeOpenApi,
  createDtoSchemas,
} from '../src/presentation/openapi/complete-openapi';
import { writeFileSync, mkdirSync } from 'node:fs';
import type * as AppModuleTypes from '../src/app.module';

describe('OpenAPI completo de toda la API', () => {
  let document: OpenAPIObject;
  beforeAll(async () => {
    jest.useFakeTimers();
    const old = process.env.MAIL_USE_QUEUE;
    process.env.MAIL_USE_QUEUE = 'false';
    try {
      const { AppModule } =
        jest.requireActual<typeof AppModuleTypes>('../src/app.module');
      const module = await Test.createTestingModule({ imports: [AppModule] })
        .overrideProvider(getDataSourceToken())
        .useValue({
          isInitialized: true,
          entityMetadatas: [],
          options: { type: 'postgres' },
          query: jest.fn(),
          destroy: jest.fn(),
          getRepository: jest.fn(),
        })
        .setLogger({ log() {}, warn() {}, error() {} })
        .compile();
      const app = module.createNestApplication();
      app.setGlobalPrefix('api');
      document = completeOpenApi(
        SwaggerModule.createDocument(
          app,
          new DocumentBuilder()
            .setTitle('Gestión GVR')
            .setVersion('1')
            .addBearerAuth(undefined, 'access-token')
            .build(),
        ),
      );
      mkdirSync('.tmp/openapi', { recursive: true });
      writeFileSync(
        '.tmp/openapi/openapi.json',
        JSON.stringify(document, null, 2),
      );
      await app.close();
    } finally {
      if (old === undefined) delete process.env.MAIL_USE_QUEUE;
      else process.env.MAIL_USE_QUEUE = old;
      jest.clearAllTimers();
      jest.useRealTimers();
    }
  }, 60000);
  it('documenta todas las operaciones HTTP de la aplicación', () => {
    const operations = Object.values(document.paths).flatMap((item) =>
      Object.entries(item ?? {}).filter(([verb]) =>
        ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(
          verb,
        ),
      ),
    );
    expect(operations.length).toBe(501);
    for (const [, operation] of operations) {
      const op = operation as {
        summary?: string;
        responses?: Record<string, { description?: string; content?: unknown }>;
      };
      expect(op.summary).toBeTruthy();
      expect(
        Object.keys(op.responses ?? {}).some(
          (code) => Number(code) >= 200 && Number(code) < 400,
        ),
      ).toBe(true);
    }
  });
  it('muestra los campos de modelos anidados y heredados de las capturas', () => {
    const schemas = createDtoSchemas();
    expect(
      Object.keys(schemas.SynchronizeRolePermissionsDto.properties ?? {}),
    ).toEqual(['revision', 'permisos']);
    expect(Object.keys(schemas.ActualizarFeriadoDto.properties ?? {})).toEqual(
      expect.arrayContaining([
        'revision',
        'fecha',
        'nombre',
        'idtipo',
        'minutosefectivos',
        'activo',
        'idcalendarios',
      ]),
    );
    expect(Object.keys(schemas.CrearActividadPlanDto.properties ?? {})).toEqual(
      expect.arrayContaining(['revisionPlan', 'datos', 'motivo']),
    );
  });
  it('GET de planificación documenta el envoltorio y el plan nullable', () => {
    const op = document.paths['/api/proyectos/{id}/planificacion'].get;
    const response = op?.responses?.['200'] as {
      content: Record<
        string,
        {
          schema: unknown;
          example: unknown;
          examples: Record<string, { value: unknown }>;
        }
      >;
    };
    expect(response.content['application/json'].schema).toMatchObject({
      type: 'object',
      properties: { data: {} },
    });
    expect(
      response.content['application/json'].examples.conPlan.value,
    ).toMatchObject({ data: { idproyecto: 1 }, status: 200 });
    expect(
      response.content['application/json'].examples.sinPlan.value,
    ).toMatchObject({ data: { idproyecto: 1, plan: null }, status: 200 });
  });
  it('todos los $ref locales apuntan a componentes existentes', () => {
    const missing: string[] = [];
    const visit = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      const object = value as Record<string, unknown>;
      if (
        typeof object.$ref === 'string' &&
        object.$ref.startsWith('#/components/schemas/')
      ) {
        const name = object.$ref.split('/').pop()!;
        if (!document.components?.schemas?.[name]) missing.push(object.$ref);
      }
      for (const child of Object.values(object)) visit(child);
    };
    visit(document);
    expect([...new Set(missing)]).toEqual([]);
  });
  it('no publica componentes objeto vacíos como modelos', () => {
    const empty = Object.entries(document.components?.schemas ?? {}).filter(
      ([, schema]) =>
        !('$ref' in schema) &&
        schema.type === 'object' &&
        !Object.keys(schema.properties ?? {}).length &&
        !schema.additionalProperties &&
        !schema.allOf &&
        !schema.anyOf &&
        !schema.oneOf,
    );
    expect(empty.map(([name]) => name)).toEqual([]);
  });
  it('documenta PDF y ZIP como binarios, no como JSON vacío', () => {
    expect(document.paths['/api/demo/pdf'].get?.responses['200']).toMatchObject(
      {
        content: {
          'application/pdf': { schema: { type: 'string', format: 'binary' } },
        },
      },
    );
  });
  it('las respuestas con contenido no aparecen como No Body', () => {
    const missing: string[] = [];
    const contracts = metadata.operations as unknown as Record<
      string,
      { noContent?: boolean; redirect?: boolean; status: number }
    >;
    for (const [path, item] of Object.entries(document.paths))
      for (const verb of ['get', 'post', 'put', 'patch', 'delete']) {
        const operation = item?.[verb] as
          | {
              operationId?: string;
              responses?: Record<string, { content?: unknown }>;
            }
          | undefined;
        if (!operation) continue;
        const source = contracts[operation.operationId ?? ''];
        expect(source).toBeDefined();
        if (
          source.noContent ||
          source.redirect ||
          [204, 304].includes(source.status)
        )
          continue;
        const response = operation.responses?.[String(source.status)];
        if (!response?.content) missing.push(verb + ' ' + path);
      }
    expect(missing).toEqual([]);
  });
  it('el ejemplo semanal respeta los siete días y la validación Zod', () => {
    const route = Object.values(document.paths)
      .flatMap((item) => Object.values(item ?? {}) as unknown[])
      .find(
        (operation) =>
          typeof operation === 'object' &&
          operation &&
          'operationId' in operation &&
          operation.operationId === 'CalendariosController_guardarSemana',
      ) as { requestBody?: { content: Record<string, { example: unknown }> } };
    const example = route.requestBody?.content['application/json'].example;
    expect(GuardarSemanaCalendarioDto.schema.safeParse(example).success).toBe(
      true,
    );
  });
});
