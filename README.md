# API GVR

Backend NestJS con dominio y aplicación independientes del framework.

- `src/domain`: entidades, políticas y contratos de repositorios.
- `src/application`: casos de uso, entradas, puertos y errores de aplicación.
- `src/presentation`: controladores, DTO HTTP, gateways, validación y filtros.
- `src/infrastructure`: implementaciones de base de datos e integraciones.
- `src/composition`: módulos Nest y ensamblaje de dependencias.
- `src/config` y `src/bootstrap`: configuración y arranque.

La organización y las reglas de dependencias están documentadas en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

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
npm run typecheck
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run lint:ci
npm run build
```

Las pruebas de integración locales simulan la base de datos y no ejecutan operaciones contra Supabase o Autodesk.
