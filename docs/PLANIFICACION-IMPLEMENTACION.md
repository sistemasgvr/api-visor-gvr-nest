# Implementación del backend de planificación

Fecha: 22 de octubre de 2026. Referencia funcional: [PRD](PLANIFICACION-PRD.md).

## Resultado

Implementadas las seis fases del PRD, con 24 operaciones HTTP y 24 casos de uso independientes. Las consultas, escrituras y cálculos utilizan las funciones SQL preparadas; no se duplicó el motor de cronograma en TypeScript.

| Área | Implementación |
| --- | --- |
| Planificador | `GET/POST /api/proyectos/:id/planificacion` y las 18 rutas de cronograma, reglas, actividades, reparto, dependencias, orden, previsualización, publicación, líneas base, reprogramación, estados, historial y ampliaciones de la sección 7.1 del PRD. |
| Colaborador | Las cuatro rutas de `/api/planificacion`: mis asignaciones, estado de parte, solicitud de ampliación y mis ampliaciones. |
| Dominio | Constantes de listas y estados; contratos tipados de plan, actividad, asignación, saldo, fechas, cronograma, previsualización y ampliaciones. Tipos de entrada sin framework en `domain/entities/planificacion-input.entity.ts`, reexportados por `application/inputs/planificacion/proyectos/planificacion.input.ts`. |
| Persistencia | `PlanificacionRepository`: llamadas parametrizadas, JSONB serializado, arreglos PostgreSQL sin serializar y verificación del formato de respuesta. |
| Composición | `PlanificacionModule` registrado en `AppModule`; casos de uso registrados con `applicationProvider`. `ProyectoModule` consume el servicio de acceso exportado. |

## Autorización y concurrencia

- Las seis acciones `proyectos.planificacion.*` están registradas en `GVR_PROJECT_ACTIONS`. El guard aplica el permiso al proyecto de la URL, con los alcances existentes `asignados` y `todos`.
- Antes de consultar o escribir, los casos de uso comprueban que el plan, la actividad y la ampliación pertenecen al proyecto de la ruta. Un recurso ajeno devuelve 404 antes de invocar la función de negocio.
- Las rutas personales mantienen los permisos de Control Operativo. El selector resuelve al trabajador activo desde el actor; no recibe una identidad elegida por el cliente. SQL comprueba la propiedad en las escrituras personales.
- Reabrir una asignación culminada exige además `dar_conformidad` sobre su proyecto. La lectura previa se combina con la revisión optimista que valida SQL.
- Editar un proyecto o crear, editar o eliminar un entregable con plan activo exige también `planificacion.editar`, incluso cuando el permiso operativo tiene alcance `todos`.
- El actor de las rutas nuevas procede de `@ActorId()`. Se añadió su propagación a creación, actualización y baja del registro diario. El indicador de administrador total al validar sigue derivándose de los alcances concedidos.
- El bloqueo transaccional y las revisiones permanecen en SQL. Alta de actividad y reparto se envían en una sola llamada. La previsualización realiza una única consulta sin escritura.

## Validación y respuestas

Los DTO validan objetos y arreglos anidados, claves permitidas, duplicados, revisiones positivas, límites de tamaño, minutos enteros, estados de catálogo y fechas civiles reales. Un hito no admite minutos positivos ni personas asignadas. Las fechas finales se validan contra el inicio cuando ambos están presentes. Las reglas parciales distinguen omisión de `null`: únicamente el aprobador y las restricciones de fecha admiten borrado explícito.

Se conservan las fechas JSON como texto, sin transformarlas a `Date`. Se exponen los metadatos de revisión y auditoría proporcionados por las funciones para los flujos de seguimiento e historial; no se devuelven objetos del driver. Los listados, objetos y booleanos se verifican antes de devolverlos.

`planificacion-errors.ts` centraliza SQLSTATE → errores de aplicación/HTTP: acceso 403, recurso 404, concurrencia/duplicidad 409, datos 400, reglas de negocio 422 y configuración/errores internos 500. Solo P0001 expone el mensaje SQL. El catálogo incompleto se registra con un mensaje fijo. Las mutaciones `pro_*` conservan `success/message`: el repositorio devuelve `success=false` y los casos de uso mantienen su respuesta previa de datos inválidos (400). Las excepciones P0001 que SQL no captura siguen respondiendo 422.

## Integración existente

Se sustituyeron las 14 versiones SQL de la sección 8 del PRD:

- Registro diario: creación/actualización V4, eliminación V3 con actor, validación V2 y detalle/listado V3. `idAsignacion` llega a SQL y `idasignacion` se conserva en las respuestas.
- Proyectos: creación, edición, consulta y eliminación V2; los contratos admiten calendario y, al editar, revisión del plan y motivo.
- Entregables: creación/actualización V3 y baja V2; revisión, motivo y orden atraviesan DTO, aplicación y repositorio. La baja recibe revisión y motivo por query.
- Las notificaciones existentes de culminación usan el resultado SQL, para no emitir una culminación que SQL haya ignorado en un proyecto planificado.
- No se identificaron tareas del backend que invocaran el sincronizador anterior; tampoco existe un `cron.job` local que lo llame.

La interfaz de planificación y el selector visual del frontend quedan fuera del alcance de este PRD de backend. El consumidor debe recargar el cronograma después de cada escritura para obtener la revisión y las fechas vigentes.

## Preparación de la copia local

Se aplicaron, dentro de una transacción, las cuatro listas con sus 22 opciones, los seis permisos y las 51 funciones nuevas/versionadas. La conexión usada es exclusivamente `127.0.0.1:5434/gvr_produccion`. El rol local es propietario, por lo que no requiere nuevas concesiones RLS.

Desde `api-visor-gvr-nest`:

```powershell
node scripts/aplicar-planificacion-local.cjs
node scripts/probar-planificacion-local.cjs
```

El primer script permite solo ese host, puerto y base, verifica inventario, firmas y cuerpos de funciones ya existentes, y cancela toda la transacción ante colisiones. Se verificó una segunda ejecución: cero funciones creadas, 51 sin cambios, 22 opciones y seis permisos. No elimina funciones. Lee `DATABASE_URL` del entorno o `.env` sin imprimir credenciales.

El segundo script usa `DatabaseFunctionService`, `PlanificacionRepository`, `ProyectoRepository` y `ControlOperativoRepository` reales. Crea actores, colaboradores, calendario, proyectos y jornadas de prueba con las claves foráneas reales de la copia local. Todas las filas creadas se revierten al terminar, también ante errores; las secuencias pueden avanzar. Verifica el conteo de planes después del rollback.

## Verificación realizada

| Comprobación | Resultado |
| --- | --- |
| `check:architecture` | Correcto: 831 archivos internos, sin dependencias externas en dominio/aplicación. |
| `check:contracts` | Correcto: 53 controladores y 249 archivos de DTO. |
| `check:authorization-coverage` | Sin huecos declarativos. |
| `typecheck`, `lint:ci`, `build` | Correctos. |
| `npm test -- --runInBand` | 25 suites, 233 pruebas correctas. |
| `npm run test:e2e -- --runInBand` | Seis suites, 108 pruebas correctas, incluidas 22 nuevas de planificación. |
| SQL embebido, `scripts/probar-planificacion.cjs` | 51 funciones compiladas y 135 comprobaciones correctas con PGlite 0.5.11. |
| `scripts/probar-planificacion-local.cjs` | 44 comprobaciones correctas en PostgreSQL real, cubriendo las 24 operaciones y sus integraciones; rollback confirmado. |
| Auditoría SQL de catálogo | 208 permisos, 501 endpoints auditados y cero clasificaciones pendientes. |

La prueba local comprueba borrador, pertenencia, revisión obsoleta, ciclo, alta/reparto atómicos, orden, previsualización, publicación, historial y detalle de líneas base, reprogramación sin alteración de línea base, 20 h asignadas − 5 h registradas = 15 h pendientes, exceso, solicitud duplicada, aprobador ajeno, aprobación parcial no repetible, estados, cierre/reapertura y creación/registro/baja en un proyecto sin plan.

Los contratos HTTP incluyen los cambios de esta entrega. Se corrigieron además cuatro entradas previamente desactualizadas del manifiesto: StorageController, TrabajadorController y los DTO de alta/edición de trabajador. Se verificó que esos cuatro archivos coincidían con HEAD; solo se actualizó su registro de contrato.

Para repetir SQL embebido, instalar temporalmente `@electric-sql/pglite@0.5.11`, establecer `PGLITE_MODULE_PATH` a su carpeta y ejecutar el script existente en `api-visor-gvr-sql`. La dependencia no se añadió a `package.json` ni al lockfile del backend.

## Límites y decisiones conservadas

No se aplicaron cambios en Supabase ni se alteraron las versiones anteriores de las funciones. El despliegue a otro entorno requiere su aplicación coordinada de seeds y funciones, y las concesiones del rol concreto del backend.

Se mantienen las decisiones pendientes de la sección 11 del PRD: las ampliaciones se listan según el aprobador actual y el solicitante; no se amplió su visibilidad. Los accesos antiguos sin `idtrabajador` y los calendarios faltantes deben corregirse antes de planificar esos recursos. No se incorporaron estadísticas, curva S, semáforos, costos, plantillas, importación/exportación ni nuevas notificaciones.


Verificación posterior a las correcciones del usuario (2026-10-22): tipos, arquitectura, contratos, cobertura de autorización y build correctos; 233 pruebas unitarias, 108 HTTP y 44 comprobaciones PostgreSQL locales correctas. Se actualizó la prueba de eliminación de proyecto para comprobar `success=false` y que el proyecto siga activo. Los datos de prueba se revirtieron.
