# Validación Zod y documentación completa de la API

Actualizado: 22 de octubre de 2026.

## Resultado

La validación HTTP de todos los módulos se migró a Zod 4.6.7. También se migró la configuración del proceso. Se retiraron las dependencias directas de `class-validator`, `class-transformer` y Joi, los decoradores de validación de los DTO, los pipes anteriores y el traductor de mensajes que ya no se utilizaba.

Scalar en `/api/docs` y el documento público `/api/openapi.json` comparten el mismo OpenAPI completo. La auditoría actual cubre **501 operaciones HTTP, 452 modelos publicados, 11 operaciones binarias y dos operaciones legítimas sin cuerpo**. No quedan modelos objeto vacíos publicados ni operaciones con contenido sin esquema de respuesta. Se comprobó además el JSON del servidor local en el puerto 4001: `ActualizarFeriadoDto` muestra sus siete campos y el GET del plan declara su respuesta.

Las propiedades de solicitudes y modelos provienen de los mismos contratos Zod que valida la API. Las respuestas se describen desde los tipos y retornos reales del backend, las proyecciones de sus controladores y un snapshot versionado de firmas SQL. Los datos variables de Autodesk, JSON de diseño y otros contenidos extensibles se identifican como JSON de estructura variable; no se inventa una forma fija para ellos.

## Organización

| Archivo | Función |
| --- | --- |
| `src/presentation/validation/zod-dto.ts` | Construcción y registro de contratos; reglas heredadas, condiciones entre campos, transformaciones y validación anidada. |
| `src/presentation/validation/zod-validation.pipe.ts` | Pipe global y local de Zod; errores HTTP 400 en español, con rutas de campos y sin imprimir valores recibidos. |
| `src/presentation/dtos/**/*.dto.ts` | 239 archivos migrados, con 316 contratos de clase, incluidos modelos privados y heredados. Los tipos de sus propiedades siguen disponibles para Nest y TypeScript. |
| `src/config/env.validation.ts` | Esquema Zod compartido por ConfigModule y la configuración tipada. Conserva variables, conversiones y valores predeterminados. |
| `src/presentation/openapi/complete-openapi.ts` | Completa el documento de Swagger que consumen Scalar y el endpoint JSON. |
| `src/presentation/openapi/operation-notes.ts` | Reglas de negocio y ejemplos documentales de las 24 operaciones de planificación. |
| `scripts/openapi/generate.cjs` | Generación estática de contratos de respuesta, parámetros, archivos, protocolos y registro de DTO. |
| `scripts/openapi/sql-contracts.snapshot.json` | Firmas de retorno y campos de filas, sin cuerpos de funciones ni datos. Permite construir el backend sin el repositorio SQL adyacente. |
| `scripts/openapi/check.cjs` | Rechaza contratos generados desactualizados. Se ejecuta en CI. |

Dominio y aplicación continúan independientes de Nest y Zod. Los cambios de tipos de planificación describen resultados de estado y asignaciones personales que antes figuraban como JSON genérico; no cambian su ejecución SQL.

## Reglas preservadas y diferencias explícitas

Se conservaron el recorte y transformación de cadenas, las conversiones numéricas y booleanas donde existían, los defaults, la diferencia entre omisión y null, límites, enumeraciones, expresiones regulares, listas anidadas, unicidad y herencia de reglas.

Las condiciones se evalúan después de transformar el objeto completo. Los validadores entre campos de planificación siguen exigiendo fechas coherentes y hitos de cero minutos sin personas. Las propiedades no declaradas se rechazan; las identidades del actor permanecen en JWT/guards. Los controles de pertenencia, permisos, revisiones, saldos, estados y demás reglas transaccionales siguen en sus capas existentes.

Antes de migrar se registraron **16 562 decisiones sintéticas** del validador anterior sobre 1 274 propiedades. La prueba permanente de compatibilidad conserva esos resultados y admite únicamente **25 casos más estrictos**: valores primitivos o arreglos enviados donde los tipos de ACC declaran objetos o listas, como `products`, `projectValue`, `pushpinPosition`, `viewerState` y `additionalOptions`. No se detectaron reglas anteriores debilitadas en esa batería. El fixture contiene únicamente valores sintéticos.

Los mensajes de validación utilizan la localización española de Zod. El filtro común sigue entregando el formato `data/message/status` y el código opcional de negocio; no se incluyen credenciales, tokens ni valores de entrada en errores de configuración o validación.

## Qué aparece ahora en la documentación

- Campos requeridos, opcionales y nullable; límites, formatos, enumeraciones y ejemplos.
- Modelos heredados y compuestos completos: por ejemplo, `ActualizarFeriadoDto` y `SynchronizeRolePermissionsDto`.
- Cuerpos JSON, formularios multipart con sus archivos, parámetros de ruta/query/header y autenticación según el guard/protocolo.
- Respuestas con su envoltorio real, listas, booleanos, objetos y variantes nullable. Los estados del cuerpo y los estados de transporte se describen por separado cuando los controladores existentes los distinguen.
- Errores con cuerpo documentado. WOPI conserva sus respuestas de protocolo; PDF, ZIP y demás descargas tienen tipo binario.
- Redirecciones y operaciones sin contenido se documentan como tales. No se añade un JSON ficticio para ocultar un «No Body» legítimo.
- El GET del plan tiene ejemplos de proyecto con borrador y de proyecto con `plan: null`. La semana laboral de ejemplo incluye siete días distintos y pasa la validación Zod real.

Los modelos realmente vacíos que eran clases auxiliares sin campos no se publican como modelos ficticios. Las referencias locales del documento se verifican para que no apunten a componentes inexistentes.

## Mantener un DTO

```ts
import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class CrearEjemploDto {
  static readonly schema: z.ZodType<CrearEjemploDto> =
    defineZodDto<CrearEjemploDto>('CrearEjemploDto', {
      nombre: {
        schema: z.string().trim().min(1).max(120),
        description: 'Nombre visible del recurso.',
        example: 'Ejemplo',
      },
    });

  nombre!: string;
}
```

`optional: true` mantiene el comportamiento anterior de campo omitido o null. Para permitir omisión sin null, utilizar `.optional()` en el esquema. Para condiciones entre campos, usar `when` y `checks`; para herencia, `mappedDto` o `mergeDtos`. Los DTO de entrada no reciben el actor del cliente.

Las propiedades TypeScript describen el contrato de transporte y se mantienen alineadas con su esquema. No se deben reintroducir decoradores de validación de las librerías retiradas. La conversión a JSON Schema se apoya en la [API oficial de Zod](https://zod.dev/json-schema).

## Generación, CI y construcción

```powershell
npm run docs:generate
npm run check:openapi
npm run check:architecture
npm run check:contracts
npm run check:authorization-coverage
npm run typecheck
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run lint:ci
npm run build
```

`build`, `start`, `start:dev` y `start:debug` generan los contratos antes de arrancar. Los artefactos generados se versionan; CI comprueba que coincidan con las fuentes antes del build. Si se editan contratos mientras el servidor está en watch, se puede ejecutar `docs:generate` para actualizar las respuestas y parámetros inferidos.

La generación normal no conecta PostgreSQL, Supabase, Autodesk ni correo, no lee credenciales y no necesita el repositorio SQL adyacente. Docker compila con el snapshot y copia el contrato JSON al resultado de TypeScript. Para refrescar las firmas después de cambiar funciones SQL, con el proyecto SQL junto al backend:

```powershell
npm run docs:refresh-sql
npm run docs:generate
```

`docs:refresh-sql` solo lee archivos SQL y actualiza las declaraciones de retorno y campos de seis modelos de fila; no ejecuta SQL ni guarda cuerpos de funciones.

## Verificación

- 242 pruebas unitarias, incluidas las 16 562 decisiones históricas y la validación del entorno.
- 116 pruebas HTTP/e2e, incluidas ocho comprobaciones del documento OpenAPI completo.
- Tipos, arquitectura, contratos HTTP, cobertura de autorización, sincronización OpenAPI, lint de CI y compilación.
- Comprobación de campos de modelos heredados, referencias existentes, contenido en todas las respuestas que lo requieren y formatos binarios.

Esta entrega no modifica tablas, funciones SQL, datos ni permisos de negocio en la base de datos.
