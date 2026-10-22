# PRD — Backend de Planificación de proyectos

Fecha: 22 de octubre de 2026.
Estado: **backend implementado y verificado localmente el 2026-10-22**. Los 24 endpoints, la autorización y la integración con proyectos, entregables y Control Operativo están desarrollados. Las instrucciones siguientes conservan el contrato funcional y sirven para preparar otros entornos.

Resultado y comandos reproducibles: [PLANIFICACION-IMPLEMENTACION.md](PLANIFICACION-IMPLEMENTACION.md). Por autorización del usuario se aplicaron los seeds y las 51 funciones exclusivamente a `127.0.0.1:5434/gvr_produccion`. No se ejecutaron cambios en Supabase. Las pruebas funcionales locales revierten sus datos al terminar.

| Pieza | Estado |
| --- | --- |
| 11 tablas `pla*` y complementos de `proproyecto`, `proentregable` y `conactividad` | Aplicadas el 2026-10-21. |
| 51 funciones SQL (37 nuevas y 14 versiones siguientes) | Aplicadas y verificadas en PostgreSQL local; sin desplegar en Supabase. PostgreSQL embebido: 135 comprobaciones OK. |
| Listados (4 listas, 22 opciones) | Bloque final de `api-visor-gvr-sql/seeds/insert_data.sql`, aplicado solo en la copia local. |
| Permisos granulares `proyectos.planificacion.*` | `api-visor-gvr-sql/seeds/permisos-granulares-planificacion.sql`, aplicado solo en la copia local. |
| Matriz de permisos del front | `proyectos.planificacion` ya está ubicada en *Gestión GVR › Proyectos*. |

Las reglas de negocio completas están en [MODELO-TABLAS-PROYECTOS.md](../../api-visor-gvr-sql/docs/planificacion/MODELO-TABLAS-PROYECTOS.md), sobre todo en las secciones 7 y 13. Este documento dice **cómo construir el backend** encima de esas funciones. Sigue la misma arquitectura que calendarios ([ARQUITECTURA.md](ARQUITECTURA.md) y [CALENDARIOS.md](CALENDARIOS.md)).

**Fuera de alcance:** estadísticas, curva S, semáforos, costos y cierre mensual (`placierrecosto`), plantillas, notificaciones, importación y exportación.

---

## 1. Antes de programar: base de datos

Ejecutar en este orden, primero en la copia local y nunca directamente en producción:

1. **Listados:** solo el bloque final `NUEVOS CATÁLOGOS — Planificación de proyectos` de `seeds/insert_data.sql`, desde su `BEGIN` hasta su `COMMIT`.
2. **Permisos:** `seeds/permisos-granulares-planificacion.sql`, completo.
3. **Funciones:** en el orden de la sección 13.2 del modelo. Como usan `CREATE FUNCTION`, fallan si ya existen. Si ya creaste alguna en local, haz `DROP FUNCTION` primero. Dos funciones cambiaron el 2026-10-22: `pla_AutorizarOperacionPlan` y `con_ValidarActividadV2`.
4. **Acceso del rol del backend:** con `postgres` (propietario) no hace falta nada. Si usas una cuenta dedicada (`seeds/permisos-granulares-acceso-backend-manual.sql`), concede `EXECUTE` sobre las funciones nuevas y crea políticas RLS para las 11 tablas `pla*`, que tienen RLS activo y `PUBLIC` revocado.

Los dos seeds son **idempotentes**: se pueden repetir sin duplicar. Además, **se cancelan completos** si un ID está ocupado por otro registro o si un nombre ya existe con otro ID o inactivo.

Comprobación rápida después de ejecutarlos:

```sql
SELECT l.id, l.nombre, o.id AS idopcion, o.nombre AS opcion
FROM genlistado l JOIN genlistadoopciones o ON o.idlista = l.id
WHERE l.id BETWEEN 49 AND 52 ORDER BY o.id;                      -- 22 filas, 700..721

SELECT m.codigo || '.' || o.codigo || '.' || p.accion AS codigo, p.id
FROM authpermisosgranulares p JOIN authopciones o ON o.id = p.idopcion
JOIN authmodulos m ON m.id = o.idmodulo WHERE o.id = 41 ORDER BY p.id;   -- 203..208
```

---

## 2. IDs fijos y constantes

### 2.1. Listas y opciones

Las funciones SQL resuelven las opciones **por nombre** con `pla_ResolverOpcion`, así que en SQL no hay IDs fijos. El backend usa los IDs para constantes y para entregar las opciones al front.

| Lista | ID | Opciones (ID) | Columna |
| --- | --- | --- | --- |
| Estado del plan | **49** | 700 Borrador · 701 En ejecución · 702 Cerrado | `plaplanproyecto.idestadoplan` |
| Estado de actividad planificada | **50** | 703 Por iniciar · 704 En proceso · 705 En revisión · 706 Culminado | `plaactividad.idestadoactividad`, `plaasignacion.idestadoactividad`, `plamovimientoestado` |
| Estado de solicitud de ampliación | **51** | 707 Pendiente · 708 Aprobada · 709 Rechazada | `plaampliacion.idestadosolicitud` |
| Tipo de cambio de planificación | **52** | 710 Reglas · 711 Actividad · 712 Asignaciones · 713 Dependencias · 714 Orden · 715 Reprogramación · 716 Línea base · 717 Publicación · 718 Estado del plan · 719 Ampliación · 720 Proyecto · 721 Entregable | `plabitacoracambio.idtipocambio` |

- **«Sin planificación» no es una opción:** significa que el proyecto no tiene una fila activa en `plaplanproyecto`.
- **No confundir dos listas parecidas:** «Estado de actividad planificada» (50) es el tablero. El estado del registro diario es otra lista: `Estado Actividad` (16): 374 Por aprobar, 375 Aprobado, 376 Observado, 377 Rechazado.
- **El rango 700–721 es un bloque reservado** para no chocar con las opciones creadas desde la aplicación. La secuencia continúa en 722.

Constantes a crear (mismo estilo que `estado-actividad.constants.ts`):

```ts
// src/domain/constants/gen-listado.constants.ts
export const ID_LISTA_ESTADO_PLAN = 49;
export const ID_LISTA_ESTADO_ACTIVIDAD_PLANIFICADA = 50;
export const ID_LISTA_ESTADO_AMPLIACION = 51;
export const ID_LISTA_TIPO_CAMBIO_PLANIFICACION = 52;

// src/domain/constants/estado-planificacion.constants.ts (nuevo)
export const ID_ESTADO_PLAN_BORRADOR = 700;
export const ID_ESTADO_PLAN_EN_EJECUCION = 701;
export const ID_ESTADO_PLAN_CERRADO = 702;
export const ID_ESTADO_ACTIVIDAD_PLAN_POR_INICIAR = 703;
export const ID_ESTADO_ACTIVIDAD_PLAN_EN_PROCESO = 704;
export const ID_ESTADO_ACTIVIDAD_PLAN_EN_REVISION = 705;
export const ID_ESTADO_ACTIVIDAD_PLAN_CULMINADO = 706;
export const ID_ESTADO_AMPLIACION_PENDIENTE = 707;
export const ID_ESTADO_AMPLIACION_APROBADA = 708;
export const ID_ESTADO_AMPLIACION_RECHAZADA = 709;
```

El front obtiene las opciones con el endpoint genérico de listas (`gen_ObtenerOpcionesPorLista`, que ordena por ID). En el tablero, las columnas salen en el orden 703 → 706.

### 2.2. Permisos granulares

Opción **41** `proyectos.planificacion` («Planificación del proyecto»), dentro del módulo `proyectos`. Admite los alcances `asignados` y `todos`.

| ID | Código | Habilita |
| --- | --- | --- |
| 203 | `proyectos.planificacion.ver` | Ver el plan, el cronograma, el detalle de una actividad, el historial y las ampliaciones. El aprobador del plan resuelve ampliaciones con este permiso. |
| 204 | `proyectos.planificacion.editar` | Crear el borrador; guardar o eliminar actividades, reparto, dependencias y orden; previsualizar. También se exige al editar un proyecto o entregable que ya tiene plan. |
| 205 | `proyectos.planificacion.configurar` | Reglas del plan (aprobador, bloqueo de exceso, tolerancia, alerta, no planificadas). Cerrar y reabrir el plan. |
| 206 | `proyectos.planificacion.publicar` | Publicar el plan (crea la línea base inicial) y establecer nuevas líneas base. |
| 207 | `proyectos.planificacion.reprogramar` | Reprogramar una actividad con motivo. |
| 208 | `proyectos.planificacion.dar_conformidad` | Tablero: cambiar el estado de la actividad conjunta y reabrir una parte individual culminada. |

El seed concede los permisos de forma **equivalente** a lo que cada rol ya hacía con `proyectos.proyectos.*`, con los mismos alcances:

- `ver` → `ver`.
- `editar` → `editar`, `reprogramar` y `dar_conformidad`.
- `configurar` → `configurar` y `publicar`.

El rol 1 recibe todo. Los demás ajustes se hacen desde *Configuración › Roles y permisos*.

El **trabajo propio del colaborador** no usa esta opción: registrar, culminar su parte y solicitar ampliación siguen con `control_operativo.actividades.*` (alcance `propios`).

---

## 3. Dónde se valida cada cosa

Decisión del 2026-10-22: **los permisos granulares (código y alcance) se validan solo en el backend (guard) y en el front (mostrar u ocultar). Las funciones SQL no leen permisos.** En SQL quedan solo reglas que dependen de los datos y deben evaluarse en la misma transacción.

| Control | Dónde | Cómo |
| --- | --- | --- |
| Código de permiso + alcance `asignados`/`todos` sobre el proyecto | **Backend (guard)** | `RequireResourcePermission(código, GVR_PROJECT_RESOURCE, 'id')`: el helper `proyecto(...)` de `proyecto.controller.ts`. La política `gvr_project` ya resuelve «asignados» (acceso en `proaccesoproyecto` o coordinador). |
| Que `:idPlan`, `:idActividad` o `:idAmpliacion` pertenezcan al proyecto `:id` de la ruta | **Backend (caso de uso)** | Obligatorio (IDOR). Ver 3.1. |
| Reabrir una parte individual culminada | **Backend (caso de uso)** | Si el estado actual de la asignación es 706 y el destino no lo es, exigir `proyectos.planificacion.dar_conformidad` sobre el proyecto (`AuthorizationService.can`). Antes lo hacía SQL. |
| Editar un proyecto, o crear, editar o eliminar un entregable, **cuando el proyecto tiene plan activo** | **Backend (caso de uso)** | Además del permiso propio del endpoint, exigir `proyectos.planificacion.editar`. Antes lo hacía SQL con `pla_BloquearPlan`. |
| «Administrador total» al validar registros (`p_es_admin_total`) | **Backend** | Ya se calcula así: `accesoTotal: alcances.includes('todos')` en `control-operativo.controller.ts`. `con_ValidarActividadV2` confía en ese parámetro. |
| `idtrabajador` del colaborador en endpoints personales | **Backend** | Se obtiene del actor (`tratrabajador.idusuario = actor`); nunca se acepta del body o de la query. |
| Usuario activo, proyecto activo, acción conocida | SQL | `pla_AutorizarOperacionPlan`. |
| Quién registra, edita o elimina un registro diario (propio o de otra persona) | **Backend (guard de Control Operativo)** | Alcances `propios`/`asignados`/`todos` de `control_operativo.actividades.*`. SQL no exige que el actor sea el trabajador: un coordinador o administrador puede registrar por otra persona. |
| Que la asignación usada en un registro sea del trabajador de ese registro | SQL | `pla_ValidarRegistroPlan`. |
| Que la asignación sea del propio usuario (parte, solicitar, consultar propias) | SQL | `pla_AutorizarOperacionPlan`, acciones personales. |
| Ser el aprobador actual para resolver ampliaciones | SQL | `pla_ResolverAmpliacion`. |
| Revisión (concurrencia), plan cerrado, transiciones de estado, reparto, ciclos, saldo y tolerancia | SQL | Funciones `pla_*` y apoyos. |

Registrar las acciones nuevas en la política de proyectos. Si falta este paso, el guard deniega todo y, en producción, `AuthorizationReadinessService` bloquea el arranque:

```ts
// src/infrastructure/auth/catalog-policies.ts
export const GVR_PROJECT_ACTIONS: Record<string, readonly string[]> = {
  'proyectos.proyectos': ['ver', 'editar', 'eliminar', 'configurar'],
  // ...
  'proyectos.planificacion': ['ver', 'editar', 'configurar', 'publicar', 'reprogramar', 'dar_conformidad'],
};
```

El front lee los permisos efectivos del usuario con `GET /api/autorizacion/me` para mostrar u ocultar acciones. Ocultar un botón no sustituye al guard.

### 3.1. Pertenencia al proyecto (IDOR)

Los códigos `proyectos.planificacion.*` se evalúan sobre el **proyecto**, porque cada código tiene una sola política en el registro. Las funciones, en cambio, reciben `idplan`, `idactividad`, `idasignacion` o `idampliacion`. Por eso todas las rutas cuelgan de `/proyectos/:id/planificacion`, y **antes de llamar la función** el caso de uso comprueba que el recurso sea de ese proyecto. Si no lo es, responde `NotFoundError`, para no revelar que existe.

```sql
-- plan
SELECT 1 FROM public.plaplanproyecto WHERE id = $1 AND idproyecto = $2 AND estado = 1;
-- actividad del plan
SELECT 1 FROM public.plaactividad WHERE id = $1 AND idplan = $2 AND idproyecto = $3 AND estado = 1;
-- ampliación del plan
SELECT 1 FROM public.plaampliacion q JOIN public.plaasignacion s ON s.id = q.idasignacion
JOIN public.plaactividad a ON a.id = s.idactividad
WHERE q.id = $1 AND a.idplan = $2 AND a.idproyecto = $3 AND q.estado = 1;
```

Pon estas consultas en el repositorio con `database.executeQuery` (como `catalog-policies.ts`) o en una función SQL de lectura, si prefieres mantener todo en funciones.

---

## 4. Estructura de archivos (igual que calendarios)

```
src/domain/constants/estado-planificacion.constants.ts
src/domain/entities/planificacion.entity.ts              # tipos de las respuestas jsonb
src/domain/repositories/planificacion.repository.interface.ts   # PLANIFICACION_REPOSITORY + IPlanificacionRepository
src/application/inputs/planificacion/*.input.ts           # sin decoradores
src/application/use-cases/planificacion/proyectos/*.use-case.ts # uno por operación
src/infrastructure/repositories/planificacion.repository.ts     # llamadas SQL + mapeo de errores
src/presentation/dtos/planificacion/proyectos/*.dto.ts    # esquemas Zod
src/presentation/controllers/planificacion.controller.ts          # /proyectos/:id/planificacion
src/presentation/controllers/planificacion-colaborador.controller.ts # /planificacion (trabajo propio)
src/composition/modules/planificacion.module.ts            # registrar en el módulo raíz
test/planificacion.e2e-spec.ts
```

- Registrar los casos de uso con `applicationProvider(...)` y declarar sus dependencias en `src/composition/application.providers.ts`.
- Al agregar controladores y DTO, actualizar `test/contracts/http-contract.json`: `check:contracts` exige que el número de controladores coincida con el contrato registrado.
- `check:architecture`: dominio y aplicación sin Nest, TypeORM ni `class-validator`.

---

## 5. Convenciones de llamada a SQL

1. **Patrón `call<T>()` de `CalendariosRepository`:** `callFunctionSingle` devuelve una fila con el nombre de la función como columna (`row['pla_ObtenerPlanProyecto']`). Sirve para las funciones `RETURNS jsonb` y `RETURNS boolean`. Las que devuelven `TABLE` (`con_*`, `pro_*`) se leen con `callFunction`, como hoy.
2. **Parámetros `jsonb`:** enviar `JSON.stringify(valor)`, como `guardarSemana` en calendarios. Un arreglo JS sin serializar se convierte en arreglo PostgreSQL y falla. Aplica a `p_reglas`, `p_datos`, `p_asignaciones`, `p_dependencias` y `p_cambios`.
3. **Parámetros `integer[]`** (`p_entregables` y `p_actividades` de `pla_ReordenarCronograma`): enviar el arreglo JS tal cual.
4. **Fechas:** cadenas `YYYY-MM-DD`. En las respuestas `jsonb` llegan como texto: no convertirlas a `Date`, porque se desplazan por la zona horaria.
5. **Esfuerzo siempre en minutos enteros** en la API. El front convierte horas ↔ minutos.
6. **El actor siempre sale de `@ActorId()`** y se pasa como primer parámetro (`p_idusuario`). Nunca se toma del body.
7. **Cada función es una transacción completa.** No encadenar dos escrituras en un caso de uso esperando que sean atómicas. Para crear una actividad con su reparto, usar una sola llamada: `pla_GuardarActividad` con `asignaciones` dentro de `p_datos`.
8. **Concurrencia optimista:**
   - Casi todas las escrituras piden `revisionPlan` y la mayoría también la revisión de la entidad.
   - Cada escritura incrementa la revisión del plan.
   - Después de cada escritura, el front vuelve a pedir el cronograma, que trae `plan.revision` y las fechas recalculadas.
9. **Bloqueo:** todas las escrituras de planificación y del registro diario en proyectos con plan se serializan con `pg_advisory_xact_lock(20261021,1)`. No hacer trabajo lento (correo, PDF) dentro de la misma petición antes de responder.
10. **Mapear las respuestas a tipos de dominio**, sin devolver filas crudas a ciegas. Las funciones devuelven `to_jsonb(fila)`, que incluye columnas de auditoría; decidir cuáles se exponen.

---

## 6. Errores SQL → HTTP

Implementar en `PlanificacionRepository.call()`, igual que en calendarios. No exponer SQL, parámetros ni el error del driver.

| SQLSTATE | Origen | HTTP | Código sugerido |
| --- | --- | --- | --- |
| `42501` | Usuario inactivo, asignación ajena | 403 | `PLANIFICACION_ACCESO_DENEGADO` |
| `P0002` | Proyecto inexistente o inactivo | 404 | `PLANIFICACION_NO_ENCONTRADO` |
| `40001`, `40P01` | Revisión desactualizada («El plan cambió; recargue antes de guardar», «Actividad modificada»), bloqueo mutuo | 409 | `PLANIFICACION_REVISION_OBSOLETA` |
| `23505` | Plan activo duplicado, persona o dependencia repetida | 409 | `PLANIFICACION_DUPLICADO` |
| `22023` con mensaje que empieza por `Se requiere una opción única y activa` | Falta el seed de listados | **500**, con log | `PLANIFICACION_CATALOGO_INCOMPLETO` |
| `22023`, `22P02`, `22007`, `22008`, `22003`, `23502`, `23503`, `23514` | Datos inválidos, FK o CHECK | 400 | `PLANIFICACION_DATOS_INVALIDOS` |
| `P0001` | Regla de negocio (`RAISE EXCEPTION` sin código) | **422** con el **mensaje de SQL** | `PLANIFICACION_REGLA_NEGOCIO` |
| Otro | — | 500 | `PLANIFICACION_ERROR_INTERNO` |

**Exponer el mensaje solo para `P0001`.** Esos mensajes están escritos en español para el usuario y el front puede mostrarlos tal cual. Los principales:

| Situación | Mensaje SQL |
| --- | --- |
| Crear plan | `El proyecto ya tiene un plan activo`, `Aprobador inactivo` |
| Reglas | `Reglas no válidas`, `El plan publicado requiere aprobador` |
| Actividad | `Campos de actividad inválidos`, `Entregable no válido`, `Reabra la actividad antes de modificarla`, `No se cambia el entregable de una actividad con registros`, `Aumente horas mediante ampliación` |
| Reparto | `Reparto X distinto del esfuerzo Y`, `Un hito no admite asignaciones`, `Los minutos asignados no pueden ser inferiores a su consumo`, `Colaborador repetido`, `Asignación inválida`, `Colaborador sin acceso al proyecto`, `Resuelva las ampliaciones pendientes antes de cambiar el reparto` |
| Dependencias / orden | `Las dependencias forman un ciclo`, `Dependencias con actividades inactivas o ajenas`, `No se cambian dependencias de una actividad culminada`, `Debe enviar todos los IDs del plan una sola vez` |
| Baja | `La actividad tiene ejecución, solicitudes o dependencias; no puede darse de baja` |
| Publicar / línea base | `El plan ya fue publicado; no se repite la publicación`, `Proyecto, inicio y aprobador activo son obligatorios`, `Calendario N sin versión publicada`, `El plan no tiene actividades`, `Entregable inactivo`, `Colaborador inactivo`, `Primero publique el plan`, `La línea base requiere consumo en minutos enteros; revise los horarios del registro` |
| Motor de fechas | `Se requiere fecha de inicio del proyecto`, `No hay capacidad para resolver el desfase`, `Capacidad insuficiente en el horizonte de diez años`, `Calendario del proyecto sin capacidad suficiente`, `Sin día laborable para hito` |
| Estados | `Transición no permitida: a → b`, `Faltan partes individuales por culminar`, `Motivo requerido`, `Plan sin publicar o actividad modificada`, `Reabra primero la actividad conjunta`, `Plan no disponible`, `El plan está cerrado`, `Use la operación de publicación`, `Hay actividades o ampliaciones pendientes` |
| Bitácora | `Se requiere motivo para cambiar un plan publicado` |
| Ampliaciones | `La asignación no admite ampliaciones`, `Ya existe una solicitud pendiente`, `Solicitud inexistente o ya resuelta`, `Solo resuelve el aprobador actual`, `Resolución inválida o plan cerrado`, `No se amplía una actividad o parte culminada sin reabrirla` |
| Registro diario | `No se registra contra un borrador`, `El plan no admite trabajo no planificado`, `Asignación ajena o retirada`, `Actividad o parte culminada`, `El registro supera los minutos disponibles con tolerancia`, `Plan cerrado: reabrir antes de registrar o corregir`, `La validación excede el saldo autorizado` |
| Consultas | `Paginación inválida`, `Tipo de historial desconocido`, `Línea base ajena al plan`, `Fecha o colaborador inválido` |

Casos especiales:

- `pla_CambiarEstadoActividad` informa una revisión desactualizada con `P0001` («Plan sin publicar o actividad modificada»), no con `40001`. El front debe recargar también en ese caso.
- `pro_*V2/V3` conservan el contrato `success/message`: capturan la excepción y devuelven `success=false` con `SQLERRM`. Tras la corrección del usuario, el repositorio conserva `success/message` y los casos de uso mantienen su respuesta previa (400 con ese `message`); no se puede distinguir 403 de 409 en ese retorno. Las excepciones que SQL no captura siguen usando el mapeo anterior.

---

## 7. Endpoints

Prefijo global `/api`. Todas las rutas de la tabla 7.1 van bajo `/proyectos/:id/planificacion`, donde `:id` es el proyecto. Las que tienen `:idPlan`, `:idActividad` o `:idAmpliacion` requieren la comprobación de pertenencia de 3.1.

### 7.1. Planificador

| # | Método y ruta | Permiso (guard `proyecto(...)`) | Función SQL (parámetros en orden) | Respuesta |
| --- | --- | --- | --- | --- |
| 1 | `GET /` | `ver` | `pla_ObtenerPlanProyecto(actor, id)` | `{ idproyecto, plan \| null }`: `null` = sin planificación |
| 2 | `POST /` | `editar` | `pla_CrearPlanProyecto(actor, id, idaprobador?)` | Fila del plan (estado 700, `revision` 1). 201 |
| 3 | `GET /:idPlan/cronograma` | `ver` | `pla_ObtenerCronogramaProyecto(actor, idPlan)` | `{ plan, entregables[], actividades[], asignaciones[], dependencias[], fechas[] }` |
| 4 | `PUT /:idPlan/reglas` | `configurar` | `pla_ActualizarReglasPlan(actor, idPlan, revisionPlan, reglas::jsonb, motivo?)` | Fila del plan |
| 5 | `POST /:idPlan/actividades` | `editar` | `pla_GuardarActividad(actor, idPlan, revisionPlan, datos::jsonb, NULL, NULL, motivo?)` | Fila de la actividad. 201 |
| 6 | `GET /:idPlan/actividades/:idActividad` | `ver` | `pla_ObtenerActividadPlan(actor, idActividad)` | `{ actividad, asignaciones[] (con saldo), dependencias[] }` |
| 7 | `PUT /:idPlan/actividades/:idActividad` | `editar` | `pla_GuardarActividad(actor, idPlan, revisionPlan, datos::jsonb, idActividad, revision, motivo?)` | Fila de la actividad |
| 8 | `DELETE /:idPlan/actividades/:idActividad?revisionPlan=&revision=&motivo=` | `editar` | `pla_EliminarActividad(actor, idActividad, revisionPlan, revision, motivo?)` | `true` |
| 9 | `PUT /:idPlan/actividades/:idActividad/asignaciones` | `editar` | `pla_GuardarAsignacionesActividad(actor, idActividad, revisionPlan, revisionActividad, asignaciones::jsonb, motivo?)` | Todas las asignaciones de la actividad, incluidas las retiradas |
| 10 | `PUT /:idPlan/actividades/:idActividad/dependencias` | `editar` | `pla_GuardarDependenciasActividad(actor, idActividad, revisionPlan, dependencias::jsonb, motivo?)` | Dependencias activas de la actividad |
| 11 | `PUT /:idPlan/orden` | `editar` | `pla_ReordenarCronograma(actor, idPlan, revisionPlan, entregables int[], actividades int[], motivo?)` | `true` |
| 12 | `POST /:idPlan/previsualizar` | `editar` | `pla_PrevisualizarCambioCronograma(actor, idPlan, cambios::jsonb)` | `{ revisionplan, antes[], despues[], afectadas[], afectacapacidadotrosproyectos }`. **No escribe** |
| 13 | `POST /:idPlan/publicar` | `publicar` | `pla_PublicarPlanProyecto(actor, idPlan, revisionPlan, motivo)` | `{ idlineabase, revisionplan }` |
| 14 | `POST /:idPlan/lineas-base` | `publicar` | `pla_EstablecerLineaBase(actor, idPlan, revisionPlan, nombre, motivo)` | `{ idlineabase, revisionplan }`. 201 |
| 15 | `POST /:idPlan/actividades/:idActividad/reprogramar` | `reprogramar` | `pla_ReprogramarActividad(actor, idActividad, revisionPlan, revision, fechaNoIniciarAntes?, fechaNoFinalizarAntes?, motivo)` | `fechas[]` del cronograma recalculado |
| 16 | `PATCH /:idPlan/actividades/:idActividad/estado` | `dar_conformidad` | `pla_CambiarEstadoActividad(actor, idActividad, revisionPlan, revision, idEstadoDestino, motivo)` | `{ idactividad, revision, revisionplan, idestadoactividad }` |
| 17 | `PATCH /:idPlan/estado` | `configurar` | `pla_CambiarEstadoPlanProyecto(actor, idPlan, revisionPlan, idEstadoDestino, motivo)` | `{ idplan, revision, idestadoplan }`. Solo 701 → 702 (cerrar) y 702 → 701 (reabrir) |
| 18 | `GET /:idPlan/historial?tipo=&offset=&limite=&idLineaBase=` | `ver` | `pla_ConsultarHistorialPlan(actor, idPlan, tipo, offset, limite, idLineaBase?)` | Arreglo o, con `detallelineabase`, `{ lineabase, actividades[], asignaciones[] }` |
| 19 | `GET /:idPlan/ampliaciones?offset=&limite=` | `ver` | `pla_ListarAmpliaciones(actor, idPlan, offset, limite)` | Arreglo de solicitudes. El aprobador ve todas; los demás, solo las suyas |
| 20 | `PATCH /:idPlan/ampliaciones/:idAmpliacion` | `ver` (+ ser el aprobador, en SQL) | `pla_ResolverAmpliacion(actor, idAmpliacion, minutosAprobados, resolucion)` | Fila de la ampliación. `0` = rechazar |

### 7.2. Colaborador (trabajo propio)

Controlador `/planificacion`. La propiedad de la asignación la garantiza SQL. El guard solo exige que el usuario tenga la acción de Control Operativo, con `RequireScopedPermission`. El `idtrabajador` se resuelve siempre desde el actor.

| # | Método y ruta | Permiso (guard) | Función SQL | Notas |
| --- | --- | --- | --- | --- |
| 21 | `GET /planificacion/mis-asignaciones?fecha=YYYY-MM-DD&idProyecto=` | `control_operativo.actividades.ver` | `pla_ListarAsignacionesColaborador(actor, idTrabajadorDelActor, fecha, idProyecto?)` | Selector del registro diario. Cada fila trae la asignación + `nombre`, `identregable`, `idplan`, `fecha` y `saldo` |
| 22 | `PATCH /planificacion/mis-asignaciones/:idAsignacion/estado` | `control_operativo.actividades.editar` | `pla_CambiarEstadoAsignacion(actor, idAsignacion, revision, idEstadoDestino, motivo)` | «Culminé mi parte». Si la parte está en 706, aplicar la regla de reapertura de la sección 3 |
| 23 | `POST /planificacion/mis-asignaciones/:idAsignacion/ampliaciones` | `control_operativo.actividades.editar` | `pla_SolicitarAmpliacion(actor, idAsignacion, minutos, motivo)` | Una solicitud pendiente por asignación. 201 |
| 24 | `GET /planificacion/mis-ampliaciones?idPlan=&offset=&limite=` | `control_operativo.actividades.ver` | `pla_ListarAmpliaciones(actor, idPlan, offset, limite)` | Si el usuario no es el aprobador, ve solo sus solicitudes |

### 7.3. Validación de DTO

Las reglas salen de las restricciones de las tablas. Usar los esquemas Zod estrictos y `ZodValidationPipe`, igual que el resto del proyecto. La migración completa está en [VALIDACION-ZOD-OPENAPI.md](VALIDACION-ZOD-OPENAPI.md).

| DTO / campo | Regla |
| --- | --- |
| `revisionPlan`, `revision`, `revisionActividad` | Entero ≥ 1, obligatorio en escrituras. |
| `motivo` | Texto con `trim`, 1–1000 caracteres. **Obligatorio** al publicar, establecer línea base, reprogramar, cambiar estados y solicitar ampliación. En las demás escrituras es opcional en borrador; con el plan publicado lo exige SQL. Para el endpoint 8 va en la query (URL-encoded). |
| **Crear plan** `idaprobador` | Entero ≥ 1, opcional (`tratrabajador.id`). Es obligatorio para publicar. |
| **Reglas** (objeto parcial; solo las claves enviadas cambian) | `idaprobador` entero ≥ 1 o `null` (`null` solo en borrador); `bloquearexceso` booleano; `toleranciaporcentaje` y `alertaporcentaje` numéricos 0–100 con máximo 2 decimales; `permitirnoplaneadas` booleano. Si una clave se envía, no puede ser `null`, salvo `idaprobador`. |
| **Actividad** `identregable` | Entero ≥ 1, obligatorio al crear. Debe ser un entregable del proyecto (lo valida SQL). |
| `nombre` | `trim`, 1–240, obligatorio al crear. |
| `descripcion` | Opcional, ≤ 4000. |
| `eshito` | Booleano. Si es `true`: `minutosestimados = 0` y sin `asignaciones`. |
| `minutosestimados` | Entero ≥ 0. Con el plan publicado no puede aumentar por edición: se tramita por ampliación. |
| `orden` | Entero ≥ 0. |
| `fechanoiniciarantes`, `fechanofinalizarantes`, `fechalimite` | `YYYY-MM-DD` o `null`; fin ≥ inicio. Al editar con el plan publicado se reprograma con el endpoint 15. |
| `asignaciones` | Opcional al crear (alta y reparto atómicos). Mismas reglas que el endpoint 9. |
| **Asignaciones** (lista completa; reemplaza el reparto) | Arreglo de 0–100 elementos `{ idtrabajador ≥ 1, minutosasignados entero > 0 }`, sin trabajadores repetidos. Quien no está en la lista se retira (su fila se conserva). Al volver a asignarlo, se reactiva la misma fila; sus minutos deben incluir lo ya consumido. |
| **Dependencias** (lista completa de predecesoras) | Arreglo `{ idpredecesora ≥ 1, desfasedias entero ≥ 0 }`, sin repetidos y sin la propia actividad. |
| **Orden** | `entregables` y `actividades`: arreglos de enteros ≥ 1, sin repetidos, con **todos** los activos del plan. |
| **Previsualizar** `cambios` | Objeto con `actividades[] { idactividad, fechanoiniciarantes?, fechanofinalizarantes?, orden? }`, `asignaciones[] { idactividad, personas[] { idtrabajador, minutosasignados } }`, `dependencias[] { idsucesora, predecesoras[] { idpredecesora, desfasedias } }`, `entregables[] { identregable, orden }`. También admite la forma corta `{ idactividad, fechanoiniciarantes?, fechanofinalizarantes? }`. Limitar tamaños, por ejemplo 200 elementos. |
| **Línea base** `nombre` | `trim`, 1–160. |
| **Reprogramar** | `fechaNoIniciarAntes` y `fechaNoFinalizarAntes` en `YYYY-MM-DD` o `null`; fin ≥ inicio. Se guardan **ambas tal cual**: enviar `null` quita esa restricción, así que el front debe reenviar la que no cambia. |
| **Estado de actividad o parte** `idEstadoDestino` | Entero de la lista 50 (703–706). La transición la valida SQL: 703 → 704; 704 → 705 \| 706; 705 → 704 \| 706; 706 → 704. |
| **Estado del plan** `idEstadoDestino` | 701 o 702. |
| **Solicitar ampliación** `minutos` | Entero > 0, por ejemplo ≤ 60 000. |
| **Resolver ampliación** `minutosAprobados` | Entero entre 0 y los minutos solicitados (0 = rechazar). `resolucion`: `trim`, 1–1000, obligatorio. |
| **Historial** | `tipo` ∈ `cambios` \| `movimientos` \| `lineasbase` \| `detallelineabase`; `offset` ≥ 0; `limite` 1–200 (por defecto 50); `idLineaBase` obligatorio con `detallelineabase`. |
| **Mis asignaciones** | `fecha` `YYYY-MM-DD` obligatoria; `idProyecto` opcional ≥ 1. |

### 7.4. Formas de respuesta útiles para el front

- **`fechas[]` (cronograma, reprogramar, previsualizar):** `{ idactividad, idplan, inicio, fin, asignaciones: [{ idasignacion, idtrabajador, minutos, inicio, fin, idversioncalendario }], superafechalimite, superafinproyecto }`. Las actividades culminadas traen `culminada: true` y fechas reales. **Las fechas del plan salen de aquí, no de `proentregable.fechaestimada`.**
- **`entregables[]` del cronograma:** fila de `proentregable` + `idestado` derivado de sus hijas (562 CULMINADO si todas las hijas están culminadas; si no, 561 EN PROCESO) y `estadoderivado: true`. El valor guardado en la tabla no cambia.
- **`saldo` (detalle de actividad y mis asignaciones):** `{ minutosautorizados, minutosconsumidos, minutossaldo, minutostope, minutossaldocontolerancia, bloquearexceso, activa }`.
  - `minutossaldo` puede ser negativo, para no ocultar el exceso.
  - Consumen los registros Por aprobar, Aprobado y Observado; los Rechazados no.

---

## 8. Integración con módulos existentes

Hoy el backend llama las versiones anteriores. Hay que cambiarlas **en el mismo despliegue** que crea las funciones. Las versiones anteriores siguen existiendo, pero no aplican el bloqueo ni las reglas del plan.

| Endpoint actual | Hoy llama | Debe llamar | Cambio de contrato |
| --- | --- | --- | --- |
| Registrar actividad (`control-operativo.repository.ts:802`) | `con_CrearActividadV3` | `con_CrearActividadV4` | Nuevo último parámetro `p_idasignacion` (opcional). Devuelve `idasignacion` como última columna. En proyectos con plan publicado: el entregable se toma de la asignación (se ignora el enviado) y `entregableculminado` se ignora. |
| Editar actividad (`:871`) | `con_ActualizarActividadV3` | `con_ActualizarActividadV4` | Igual, con `p_idasignacion` al final. Descuenta el valor anterior al validar el saldo. |
| Eliminar actividad (`:915`) | `con_EliminarActividadV2` | `con_EliminarActividadV3(p_idactividad, p_idusuario)` | Recibe el actor. Rechaza si el plan está cerrado. |
| Validar actividad (`:899`) | `con_ValidarActividad` | `con_ValidarActividadV2` | Mismos parámetros. `p_es_admin_total` = alcance `todos` concedido. Valida contra el saldo autorizado. |
| Detalle y listado de actividades (`:751`, `:384`) | `con_ObtenerActividadV2`, `con_ListarActividadesV2` | `con_ObtenerActividadV3`, `con_ListarActividadesV3` | Añaden `idasignacion` como última columna. |
| Crear proyecto (`proyecto.repository.ts:196`) | `pro_CrearProyecto` | `pro_CrearProyectoV2` | `p_idcalendario` al final. |
| Editar proyecto (`:227`) | `pro_EditarProyecto` | `pro_EditarProyectoV2` | `p_idcalendario`, `p_revisionplan` y `p_motivo` al final. Con plan activo: exigen revisión y motivo, y el backend exige `proyectos.planificacion.editar`. |
| Detalle de proyecto (`:177`) | `pro_ObtenerProyectoPorId` | `pro_ObtenerProyectoPorIdV2` | Añade `idcalendario`. |
| Eliminar proyecto (`:262`) | `pro_EliminarProyecto` | `pro_EliminarProyectoV2` | Rechaza un proyecto con plan activo («No se elimina un proyecto con planificación activa»). |
| Crear y editar entregable (`:559`, `:592`) | `pro_CrearEntregableV2`, `pro_ActualizarEntregableV2` | `pro_CrearEntregableV3`, `pro_ActualizarEntregableV3` | `p_revisionplan`, `p_motivo` y `p_orden` al final. Con el plan publicado no se aceptan estado ni fechas («En proyectos planificados el estado y las fechas se derivan de sus actividades»). |
| Eliminar entregable (`:612`) | `pro_EliminarEntregable` | `pro_EliminarEntregableV2` | `p_revisionplan` y `p_motivo`. No deja hijas activas bajo un entregable inactivo. |

Notas:

- **Selector del registro diario:** en proyectos con plan publicado, el front ofrece las actividades del endpoint 21. Envía `idAsignacion`, o `null` si es trabajo no planificado y el plan lo permite (`permitirnoplaneadas`). Los proyectos **sin plan** funcionan igual que hoy.
- **Sincronizador de estados de entregables:** las versiones nuevas usan `pro_SincronizarEstadoEntregablesPorFechaEstimadaV2`, que excluye los proyectos planificados. Revisar si existe un `cron.job` o una tarea del backend que llame a la versión anterior.

---

## 9. Plan de implementación

| Fase | Contenido | Terminado cuando |
| --- | --- | --- |
| 1. Base | Seeds y funciones en local; constantes; `GVR_PROJECT_ACTIONS`; entidad, contrato y repositorio con `call()` y mapeo de errores; consulta de pertenencia; módulo. | `check:architecture`, `typecheck` y las pruebas del repositorio (mapeo de errores) en verde. |
| 2. Consultas | Endpoints 1, 3, 6, 18. | Un proyecto sin plan devuelve `plan: null`; un plan de otro proyecto responde 404. |
| 3. Borrador | Endpoints 2, 4, 5, 7–12. | Crear el plan → actividades con reparto → dependencias → orden → previsualizar, todo con revisiones; un ciclo responde 422. |
| 4. Publicación y ejecución | Endpoints 13–17. | Publicar crea la línea base 1; reprogramar no la cambia; cerrar exige todo culminado; reabrir funciona. |
| 5. Colaborador y ampliaciones | Endpoints 19–24 y la regla de reapertura. | El colaborador solo opera lo suyo; una sola solicitud pendiente; solo el aprobador resuelve; aprobar suma minutos una vez. |
| 6. Integración | Sección 8 completa. | Registro con asignación y saldo; exceso bloqueado si `bloquearexceso`; proyectos sin plan sin cambios. |

---

## 10. Pruebas

- **Unitarias por caso de uso** (repositorio simulado): verifican que el actor viene del JWT, la pertenencia (IDOR), la regla de reapertura, el permiso de planificación al editar proyectos o entregables con plan, y que `jsonb` se envía serializado.
- **Repositorio:** cada SQLSTATE de la sección 6 → error de aplicación esperado, y el caso del catálogo incompleto.
- **e2e** (`test/planificacion.e2e-spec.ts`, como `calendarios.e2e-spec.ts` con `query` simulado):
  - 401 sin token;
  - 403 sin el código;
  - 403 con `asignados` en un proyecto ajeno;
  - 404 con un `idPlan` de otro proyecto;
  - 400 con DTO inválido;
  - 409 con revisión obsoleta;
  - 422 con regla de negocio (mensaje de SQL).
- **SQL:** `node scripts/probar-planificacion.cjs` en `api-visor-gvr-sql`, con `PGLITE_MODULE_PATH` apuntando a una instalación temporal de `@electric-sql/pglite@0.5.11`.
- **Comandos del backend:**

```powershell
npm run check:architecture
npm run check:contracts
npm run check:authorization-coverage
npm run typecheck
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

- **Catálogo de permisos:** `node scripts/auditar-catalogo-permisos.cjs` en `api-visor-gvr-sql` confirma que todo código usado por el backend existe en `docs/permisos/catalogo-base.json`; `proyectos.planificacion` ya está ahí.

---

## 11. Decisiones pendientes y riesgos detectados

1. **Ampliaciones para planificadores:** `pla_ListarAmpliaciones` muestra todas las solicitudes solo al aprobador. Un planificador que no es aprobador ve únicamente las suyas. Decidir si quien tiene `proyectos.planificacion.ver` debe verlas todas; requeriría ajustar la función.
2. **`proaccesoproyecto.idtrabajador` puede ser `NULL`** en accesos antiguos. `pla_GuardarAsignacionesActividad` valida el acceso por `idtrabajador` y fallaría con «Colaborador sin acceso al proyecto». Revisar los datos antes de habilitar:
   `SELECT count(*) FROM proaccesoproyecto WHERE estado = 1 AND idtrabajador IS NULL;`
3. **Calendarios obligatorios:** publicar exige `proproyecto.idcalendario` con una versión publicada, y el calendario de cada persona asignada (`tratrabajador.idcalendario`). El front debe avisar antes de publicar.
4. **Listado de proyectos con estado del plan:** ninguna función devuelve el estado del plan en `pro_ListarProyectos`. Por ahora, el detalle usa el endpoint 1. Para mostrarlo en el listado, crear una consulta liviana (por ejemplo `pla_ListarEstadoPlanes(int[])`) sin estadísticas.
5. **Bloqueo global:** `pg_advisory_xact_lock(20261021,1)` serializa todas las escrituras de planificación y del registro diario en proyectos planificados. Es suficiente para el volumen actual; medirlo si crece.
6. **Confianza en `p_es_admin_total`:** `con_ValidarActividadV2` ya no lo recalcula. El backend debe derivarlo siempre del alcance concedido, nunca de la petición.
7. **Despliegue en Supabase:** contrastar firmas y colisiones antes de aplicar; seguir el orden de 13.2 del modelo; aplicar seeds, funciones, backend y front en la misma ventana. Nada de esto se ha ejecutado en producción.
