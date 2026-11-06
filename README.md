# API GVR

Backend NestJS con dominio y aplicación independientes del framework.

- `src/domain`: entidades, políticas y contratos de repositorios.
- `src/application`: casos de uso, entradas, puertos y errores de aplicación.
- `src/presentation`: controladores, DTO HTTP, gateways, validación y filtros.
- `src/infrastructure`: implementaciones de base de datos e integraciones.
- `src/composition`: módulos Nest y ensamblaje de dependencias.
- `src/config` y `src/bootstrap`: configuración y arranque.

La organización y las reglas de dependencias están documentadas en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

La configuración de calendarios, sus endpoints y ejemplos están en [docs/CALENDARIOS.md](docs/CALENDARIOS.md).

## Desarrollo

```powershell
npm ci
npm run start:dev
```

La configuración se obtiene de `.env`; consultar `.env.example` para los nombres de variables.

## Verificaciones

```powershell
npm run check:architecture
npm run check:contracts
npm run check:authorization-coverage
npm run check:openapi
npm run typecheck
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run lint:ci
npm run build
```

Las pruebas de integración locales simulan la base de datos y no ejecutan operaciones contra Supabase o Autodesk.

## Producción

El contenedor arranca con `NODE_ENV=production`. Proporcionar las variables y credenciales desde el entorno del servidor; `.env`, temporales, volcados y datos QA se excluyen del contexto Docker. El control de cobertura de autorización se mantiene activo en producción.

Aplicar SQL y publicar backend y frontend durante la misma ventana, siguiendo [MIGRACION.md](../api-visor-gvr-sql/docs/permisos/MIGRACION.md).

Los respaldos de producción se conservan en `backups/produccion/`, excluidos de Git y Docker; no son temporales de desarrollo. Cada carpeta contiene el archivo `.dump`, su contenido y un manifiesto con checksum, verificación y pasos ejecutados. La conexión de producción permanece como referencia comentada en el `.env` privado; la conexión activa local no se cambia al respaldar.


## Validación y documentación de la API

Todos los módulos HTTP y la configuración usan Zod. Los contratos de entrada también generan los modelos de OpenAPI; la documentación incluye respuestas, ejemplos, parámetros, archivos y errores.

- Interfaz Scalar: `/api/docs`.
- Documento OpenAPI: `/api/openapi.json`.
- Regenerar después de cambiar contratos: `npm run docs:generate`.
- Verificar sincronización de los contratos en CI: `npm run check:openapi`.

Detalles de la migración, reglas de compatibilidad y mantenimiento: [VALIDACION-ZOD-OPENAPI.md](docs/VALIDACION-ZOD-OPENAPI.md).

## Logs

Pino recibe los mensajes de Nest y los registros HTTP, con `requestId`, estado y duración. Usa formato legible en desarrollo y JSON en producción. `LOG_LEVEL` controla el nivel mínimo y `LOG_PRETTY` permite cambiar el formato; ambas variables son opcionales y se validan con Zod.

Configuración, protección de datos y pruebas: [LOGGING-PINO.md](docs/LOGGING-PINO.md).
