# Arquitectura del backend

Actualización: 22 de octubre de 2026.

El backend conserva sus funcionalidades y contratos HTTP anteriores. La reorganización separa las reglas y operaciones de aplicación de NestJS, PostgreSQL, Autodesk, almacenamiento y otros proveedores. La configuración de calendarios añadida posteriormente sigue estas mismas reglas y se documenta en [CALENDARIOS.md](CALENDARIOS.md); no modifica SQL remoto ni integra control operativo.

## Organización y dependencias permitidas

| Carpeta | Responsabilidad | Dependencias |
| --- | --- | --- |
| `src/domain` | Entidades, políticas, constantes, contratos de repositorios y utilidades puras. | Dominio y tipos/utilidades estándar de Node. |
| `src/application/inputs` | Datos de entrada sin decoradores HTTP ni validadores de framework. | Aplicación y dominio. |
| `src/application/use-cases` | Operaciones y coordinación de las funcionalidades existentes. | Aplicación, dominio y sus contratos. |
| `src/application/ports` | Capacidades requeridas a los proveedores externos. | Aplicación y dominio; sin implementaciones externas. |
| `src/application/errors` | Errores de aplicación identificados por categorías, sin estados HTTP. | Aplicación. |
| `src/presentation` | Controladores, gateways, DTO HTTP, validación, filtros, interceptores y adaptación del protocolo. | Aplicación y adaptadores del borde HTTP/WebSocket/WOPI. |
| `src/infrastructure` | PostgreSQL, clientes de Autodesk, almacenamiento, correo, imágenes, Word, ZIP y PDF. | Contratos internos y librerías de proveedores. |
| `src/composition` | Módulos de Nest y construcción explícita de los componentes. | Todas las capas necesarias para ensamblar el sistema. |
| `src/config`, `src/bootstrap`, `src/main.ts` | Configuración del proceso y arranque de la API. | Adaptadores y composición. |

`domain` no importa `application`. Ninguna de las dos capas internas importa `presentation`, `infrastructure`, `composition`, `config` ni paquetes externos de framework. Los tipos binarios de Node se mantienen donde ya forman parte de los contratos de archivos.

## Casos de uso y providers

Los casos de uso son clases TypeScript normales. Las interfaces de repositorios siguen dentro del dominio; las capacidades técnicas como tokens, contraseñas, configuración, logging y archivos se representan mediante puertos de aplicación.

Los módulos Nest se encuentran en `src/composition/modules`. Registran los casos de uso con `applicationProvider(Clase)`. Sus dependencias ordenadas se declaran en `src/composition/application.providers.ts`. Se conservan las clases como tokens públicos para que los controladores y demás consumidores sigan resolviendo los mismos componentes.

Al añadir un componente, registrar el contrato y la dependencia explícita en composición; no importar un servicio concreto de infraestructura desde la aplicación. Las implementaciones compartidas de runtime se exponen desde `ApplicationRuntimeModule`.

`AuthenticationModule` centraliza Passport, JWT y su estrategia con las mismas opciones previas. Los módulos funcionales importan ese módulo en lugar de repetir la configuración.

## Integraciones

`infrastructure/autodesk` separa clientes de autenticación, administración, gestión de documentos, incidencias, BIM360 y revisiones. Comparten un contexto técnico con el mismo cliente HTTP, configuración y logger. La fachada `AutodeskApiService` conserva sus métodos públicos y delega en esos clientes; los cuerpos de las operaciones existentes se conservaron durante la extracción.

Los casos de uso consumen contratos de Autodesk por capacidad en `application/ports/autodesk`. El contrato agregado se mantiene para la fachada de compatibilidad y su contexto técnico.

Las operaciones de revisiones internas se implementan en `PostgresInternalReviewsRepository`. Los nombres de las funciones SQL y las consultas de lectura/actualización pertenecen a ese adaptador. Los casos de uso llaman operaciones del repositorio, con el mismo orden de parámetros que antes. Ubicaciones también utiliza casos de uso y un repositorio, conservando sus cuatro endpoints existentes.

Word, descarga y conversión de imágenes, compresión ZIP, hashing y logging se ejecutan mediante adaptadores. La aplicación coordina los datos y decisiones, y no importa esas implementaciones.

Los contratos técnicos de correo, PDF y optimización de imágenes están en `application/ports`. No se consideran servicios del dominio. `MailService` convive con los casos de uso de correo en `application/use-cases/mail`, como fachada de esas operaciones.

La generación de PDF se concentra en `infrastructure/pdf`: `html` contiene el generador con Chromium y sus plantillas HTML; `pdfkit` contiene el generador programático y sus componentes; `mappers` adapta los datos de los reportes. Las plantillas HTML se copian al compilar mediante la configuración de assets de Nest.

La traducción de errores de Autodesk está junto a sus clientes en `infrastructure/autodesk`. Los archivos únicos de dashboard están directamente en las carpetas de controladores, módulos y repositorios. Sus casos de uso conservan una carpeta propia porque agrupa varias operaciones.

No se mantienen carpetas vacías ni una clase base de persistencia sin consumidores. Las carpetas se crean cuando agrupan una responsabilidad útil; Clean Architecture no exige una carpeta por cada concepto.

La configuración de calendarios incorporada posteriormente mantiene este esquema: doce casos de uso puros, un contrato y repositorio específico, DTO/controlador HTTP y `CalendariosModule` en composición. Utiliza `DatabaseFunctionService` y las funciones `pla_*` existentes, con sus dos auxiliares reservados a PostgreSQL. No tiene dependencias de control operativo. Sus contratos se documentan en [CALENDARIOS.md](CALENDARIOS.md).

Los controladores de protocolos como WOPI/Office y los endpoints técnicos de archivos permanecen en el borde de presentación, donde se manejan solicitudes, respuestas y streams del protocolo.

## Validación y errores

Los DTO con esquemas Zod y metadatos Swagger están en `presentation/dtos`. La validación global usa `ZodValidationPipe`; se conservaron reglas, transformaciones, campos y valores iniciales con pruebas de compatibilidad. Los contratos en `application/inputs` no ejecutan validación HTTP; los controladores validan antes de invocar la aplicación.

`ApplicationFailure` expresa categorías de error sin importar Nest. En el límite de los proveedores, los errores HTTP de implementaciones existentes se traducen a errores internos. El filtro y el interceptor de presentación conservan mensajes, códigos de negocio y estados HTTP. Se mantiene la respuesta original de los errores externos, incluidos estados que no tengan una categoría específica en aplicación.

## Verificación

```powershell
npm run check:architecture
npm run check:contracts
npm run typecheck
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run lint:ci
npm run build
```

- `check:architecture` rechaza imports hacia capas externas y decoradores en dominio o aplicación. También inspecciona exports, imports de tipos, imports dinámicos y `require`.
- `check:contracts` compara los controladores y DTO originales contra el contrato registrado antes de reorganizar: rutas, configuración de guards/interceptores, métodos, campos, decoradores de validación y transformaciones. Ignora diferencias de formato.
- Las pruebas de ensamblaje verifican la construcción de componentes y la resolución de todos los módulos con una base de datos simulada. No consultan Supabase ni llaman Autodesk.
- Las pruebas de login, errores, clientes HTTP de Autodesk y persistencia de revisiones comprueban compatibilidad de los flujos representativos.
- CI ejecuta las comprobaciones de arquitectura y contratos además de las verificaciones existentes.

La verificación local utiliza dependencias simuladas para las integraciones. No reemplaza una prueba de aceptación con servicios reales en un entorno de pruebas.


La migración completa a Zod y la generación/verificación de OpenAPI están documentadas en [VALIDACION-ZOD-OPENAPI.md](VALIDACION-ZOD-OPENAPI.md). Zod se mantiene en presentación/configuración: dominio y aplicación continúan sin dependencias de librerías de validación.
