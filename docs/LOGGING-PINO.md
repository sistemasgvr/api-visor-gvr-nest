# Logging con Pino

El backend usa `nestjs-pino`, `pino` y `pino-http`. `main.ts` activa `bufferLogs` y conecta el logger con `app.useLogger(...)` antes del arranque HTTP. Los mensajes existentes de `Logger` de Nest y del adaptador `NestLoggerFactory` pasan por Pino, sin incorporar dependencias de Nest o Pino a las capas de dominio y aplicación.

## Configuración

| Variable | Valor predeterminado | Uso |
| --- | --- | --- |
| `LOG_LEVEL` | `info` | `trace`, `debug`, `info`, `warn`, `error`, `fatal` o `silent`. |
| `LOG_PRETTY` | `true` en `development`; `false` en `production` y `test` | `true` presenta logs legibles con `pino-pretty`; `false` produce JSON por línea en stdout. |

Ambas variables se validan con Zod al arrancar. No hace falta agregarlas al `.env` para usar los valores predeterminados. Para inspeccionar registros JSON en desarrollo:

```dotenv
LOG_LEVEL=debug
LOG_PRETTY=false
```

En producción se recomienda JSON para que Docker y el colector de logs puedan indexar los campos. Esta integración escribe en stdout; la rotación, retención y envío a un servicio de observabilidad se configuran en la infraestructura.

## Solicitudes HTTP

`ensureRequestId` comparte el identificador entre `request.requestId`, `request.id`, la cabecera `X-Request-Id` y el campo `requestId` de Pino. Se acepta un identificador entrante de hasta 128 caracteres alfanuméricos, punto, guion, guion bajo o dos puntos; si falta o es inválido, se genera un UUID. Es un identificador de correlación, no una identidad autenticada.

Pino conserva el contexto durante la ejecución asíncrona. Los mensajes de servicios emitidos durante una solicitud incluyen su `requestId`; fuera de una solicitud no se inventa un ID HTTP.

Cada respuesta registra método, ruta sin query, dirección remota, estado HTTP y `responseTime` en milisegundos. Los estados menores de 400 usan `info`, los 4xx usan `warn` y los 5xx usan `error`. El filtro global adjunta la causa de los 5xx para registrar nombre, mensaje y stack. Los errores de cliente mantienen su nivel `warn`. Se retiró el antiguo `LoggingInterceptor` para evitar duplicar los registros de entrada y salida.

Ejemplo simplificado:

```json
{"level":30,"requestId":"demo-123","req":{"requestId":"demo-123","method":"GET","url":"/api/health","remoteAddress":"127.0.0.1"},"res":{"statusCode":200},"responseTime":8,"msg":"Solicitud HTTP completada"}
```

El middleware de `nestjs-pino` cubre el pipeline de rutas de Nest. Middleware que responda antes de llegar a él, como un parser que rechaza JSON malformado, puede terminar la petición antes de generar ese registro HTTP.

## Datos sensibles y uso

Los serializadores HTTP omiten todas las cabeceras, cookies, parámetros de consulta y cuerpos de solicitud/respuesta. El serializador de errores omite propiedades arbitrarias como `config`, `response` y `cause` de Axios. Además se redactan campos estructurados conocidos de contraseñas, tokens y secretos en la raíz y un nivel anidado.

La redacción por campos no elimina secretos interpolados dentro de texto libre o stacks. No escribir credenciales, URLs firmadas ni objetos de configuración completos en mensajes. Los `console.*` heredados conservan su comportamiento de consola y no pasan por Pino; el código nuevo debe usar el logger de Nest en infraestructura/presentación o `LoggerFactoryPort` en aplicación.

Las pruebas de `test/logging.e2e-spec.ts` verifican correlación, aislamiento concurrente, niveles 200/400/404/500, causa de errores, ausencia de duplicados y exclusión de credenciales/cuerpos. Se ejecutan sin base de datos ni servicios externos:

```powershell
npm run test:e2e -- --runInBand logging.e2e-spec
```

Referencias: [nestjs-pino](https://github.com/iamolegga/nestjs-pino) y [pino-http](https://github.com/pinojs/pino-http).
