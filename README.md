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
