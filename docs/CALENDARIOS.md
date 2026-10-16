# Backend de configuración de calendarios

El backend usa las catorce funciones originales de calendario, actualizadas con `CREATE OR REPLACE`. Las tablas ya se aplicaron y verificaron en Supabase el 2026-10-16; el usuario confirmó la ejecución de funciones. El historial y orden de referencia están en [la guía SQL](../../api-visor-gvr-sql/docs/planificacion/CALENDARIOS.md#actualización-a-catálogos). No se crean versiones adicionales. El agente ejecutó exclusivamente cambios de tablas, sin modificar ni ejecutar las funciones.

Los tipos de excepción se reciben mediante `idtipo` (entero positivo de la lista 48), sin un enum de nombres ni una lista fija de IDs en el DTO. SQL valida que la opción pertenezca a esa lista y esté activa. El campo textual anterior `tipo` deja de aceptarse como entrada. La firma SQL de guardar excepción conserva el argumento existente `p_tipo text` para que `CREATE OR REPLACE` pueda reemplazarla sin crear sobrecargas: su contenido ahora es el ID numérico, convertido y validado dentro de SQL. El contrato HTTP recibe `idtipo` como número. Las respuestas conservan `tipo` como nombre vigente del catálogo e incluyen `idtipo`; las versiones incluyen `idestado` y `nombreestado` como referencia y nombre vigente. El listado incluye `idestadoversion` y `estadoversion`.

La lista 47 corresponde al estado de versión (615 Borrador, 616 Publicada). La lista 48 contiene inicialmente 617 Nacional, **618 Especial y 619 Empresa**, según los IDs reales de Supabase. Usar los endpoints generales de opciones de lista existentes para obtener estos valores. El campo `estado` es 0/1 para borrado lógico en las cuatro tablas. El filtro del listado sigue aplicándose al estado de la cabecera. `activo` en excepciones indica si se aplica su efecto al calendario; no sustituye el borrado lógico.

Implementado el 16 de octubre de 2026 sobre las cuatro tablas y catorce funciones cuya ejecución manual confirmó el usuario. El backend no crea objetos, ejecuta migraciones ni precarga calendarios. No integra control operativo, actividades, asignaciones ni cálculo de cronogramas.

Las cuatro tablas terminan en el bloque estándar de auditoría: estado entero (1 por defecto), IDs de creación/modificación que admiten nulo y fechas timestamp sin zona horaria con CURRENT_TIMESTAMP. Las funciones reciben el usuario autenticado y registran su auditoría. Eliminar una excepción marca estado 0; guardar la semana conserva IDs y auditoría de creación mediante actualización/inserción. Los detalles, copias, publicación y disponibilidad excluyen versiones, días y excepciones eliminados.

## Organización

- `domain/entities/calendario.entity.ts`: tipos del JSON de las funciones, sin entidades ORM ni decoradores.
- `domain/repositories/calendarios.repository.interface.ts`: contrato de persistencia y datos de configuración.
- `application/use-cases/planificacion/calendarios`: doce operaciones, con clases TypeScript puras y registro mediante `applicationProvider`.
- `infrastructure/repositories/calendarios.repository.ts`: llamadas al `DatabaseFunctionService` existente, manteniendo nombres y orden de parámetros SQL.
- `presentation/dtos/planificacion/calendarios`: validación HTTP y documentación Swagger.
- `presentation/controllers/calendarios.controller.ts`: rutas y respuestas con `ApiResponseDto`.
- `composition/modules/calendarios.module.ts`: ensamblaje con base de datos y autenticación existentes. Registrado en `AppModule`.

No se añaden servicios genéricos, conexiones, dependencias npm ni una nueva forma de invocar funciones. Los auxiliares `pla_AutorizarCalendarios` y `pla_BloquearBorradorCalendario` permanecen internos a PostgreSQL y no tienen endpoints.

## Endpoints

Todos requieren `Authorization: Bearer <token>`. Prefijo completo: **`/api/planificacion/calendarios`**. En rutas `versiones/:id`, `id` identifica la versión; en `/:id` identifica el calendario.

| Método y ruta relativa | Datos | Función SQL |
| --- | --- | --- |
| `GET /` | Query opcional: `busqueda`, `estado` (0/1), `limit` (1–100; 20 por defecto), `offset` (desde 0). | `pla_ListarCalendarios` |
| `GET /:id` | Query opcional: `idversion`. Sin ella se prioriza el borrador o la última publicación. | `pla_ObtenerCalendario` |
| `POST /` | `nombre`, `descripcion` opcional, `zonahoraria` opcional (America/Lima). | `pla_CrearCalendario` |
| `PUT /:id` | Revisión de cabecera, nombre y descripción opcional. Es reemplazo de metadatos: omitir descripción la deja vacía. | `pla_ActualizarCalendario` |
| `PATCH /:id/estado` | Revisión de cabecera y `estado` (0/1). | `pla_CambiarEstadoCalendario` |
| `POST /duplicar` | `idversionorigen`, `nombre` del calendario nuevo. Admite origen borrador o publicado, según SQL. | `pla_DuplicarCalendario` |
| `POST /versiones` | `idversionorigen` de una publicación. | `pla_CrearVersionCalendario` |
| `PUT /versiones/:id/semana` | Revisión de versión, `zonahoraria`, siete días en `semana`. | `pla_GuardarJornadaSemanal` |
| `POST /versiones/:id/excepciones` | Revisión de versión, fecha, nombre, `idtipo`, minutos y activo opcional (true). | `pla_GuardarExcepcionCalendario` con ID de excepción nulo. |
| `PUT /versiones/:id/excepciones/:idexcepcion` | Mismos datos completos de creación; permite activar/desactivar. | `pla_GuardarExcepcionCalendario` con ID del path. |
| `DELETE /versiones/:id/excepciones/:idexcepcion` | Query obligatoria: `revision` de la versión. | `pla_EliminarExcepcionCalendario` |
| `POST /versiones/:id/publicar` | Revisión de versión. | `pla_PublicarVersionCalendario` |
| `GET /versiones/:id/disponibilidad` | Query: `desde`, `hasta` en YYYY-MM-DD; rango inclusivo de hasta 366 días. | `pla_ObtenerDisponibilidadCalendario` |

El ID del usuario se obtiene exclusivamente de `request.user` después de validar el JWT. No se acepta en body o query. No se confía en los roles del JWT para conceder escritura: las funciones comprueban el estado y los roles actuales del usuario en PostgreSQL. Se mantienen las autorizaciones de SQL, sin duplicar listas de roles en el backend.

## Ejemplos de entradas

Crear un calendario:

```json
{"nombre":"Consultoría remota","descripcion":"Equipo remoto","zonahoraria":"America/Lima"}
```

Guardar la semana (sustituir `revision` por la revisión actual de la versión):

```json
{
  "revision": 1,
  "zonahoraria": "America/Lima",
  "semana": [
    {"diasemana":1,"laborable":true,"horaentrada":"08:00","horasalida":"17:00","minutosrefrigerio":60},
    {"diasemana":2,"laborable":true,"horaentrada":"08:00","horasalida":"17:00","minutosrefrigerio":60},
    {"diasemana":3,"laborable":true,"horaentrada":"08:00","horasalida":"17:00","minutosrefrigerio":60},
    {"diasemana":4,"laborable":true,"horaentrada":"08:00","horasalida":"17:00","minutosrefrigerio":60},
    {"diasemana":5,"laborable":true,"horaentrada":"08:00","horasalida":"17:00","minutosrefrigerio":60},
    {"diasemana":6,"laborable":false,"horaentrada":null,"horasalida":null,"minutosrefrigerio":0},
    {"diasemana":7,"laborable":false,"horaentrada":null,"horasalida":null,"minutosrefrigerio":0}
  ]
}
```

Crear un día reducido ficticio (no es una fecha nacional precargada):

```json
{"revision":2,"fecha":"2026-12-24","nombre":"Día especial de empresa","idtipo":619,"minutosefectivos":240,"activo":true}
```

Para un feriado completo usar `minutosefectivos: 0`. Los tipos aceptados son `Nacional`, `Empresa` y `Especial`. `activo: false` se conserva, sin convertirse a true. Para editar una excepción se requieren todos sus datos; no es un PATCH parcial.

## Respuestas y revisiones

Se devuelve la envoltura existente `{data, message, status}`. Dentro de `data` se conserva el JSON de la función, incluyendo sus nombres en minúsculas. No se recorta ni se vuelve a calcular la disponibilidad en el backend.

- Detalle y mutaciones: `calendario`, `version`, `minutossemanales`, `semana`, `excepciones`, `versiones`.
- Listado: el JSON SQL contiene `data` y `pagination`, por lo que la lista está en `respuesta.data.data` y la paginación en `respuesta.data.pagination`.
- Disponibilidad: identificadores, zona horaria, rango y `dias`, con minutos y origen de la regla.

Las horas persistidas se pueden devolver como `08:00:00`; al guardar la semana las entradas requieren `HH:MM`. No enviar de vuelta el detalle completo con auditoría o minutos generados: construir el payload con los campos del DTO.

Después de cada escritura hay que conservar la revisión devuelta. Nombre/estado usan `data.calendario.revision`; semana/excepciones/publicación usan `data.version.revision`. No usar `version.numero` como revisión. Eliminar una excepción también devuelve el detalle actualizado. Un conflicto 409 requiere recargar y resolver la edición, sin reintentos automáticos que sobrescriban datos.

## Validación y errores

Los DTO rechazan campos extra, identificadores no positivos o fuera de integer SQL, tipos inválidos y fechas con hora. La aplicación comprueba semana ISO completa sin duplicados, entrada/salida coherentes, refrigerio menor al intervalo y ausencia de horario en días libres; permite un borrador sin capacidad. Valida fechas reales y el máximo de 366 días para previsualizar. PostgreSQL conserva la validación definitiva de zona horaria, publicación, estados, unicidad y concurrencia.

| HTTP | Código estable | Situación |
| --- | --- | --- |
| 401 | Respuesta de autenticación existente. | JWT ausente, inválido, expirado o usuario inválido en el token. |
| 400 | Validación HTTP o `CALENDARIOS_DATOS_INVALIDOS`. | Datos, referencias o restricciones inválidas. |
| 403 | `CALENDARIOS_ACCESO_DENEGADO` | Usuario inactivo o sin autorización de SQL. |
| 404 | `CALENDARIOS_NO_ENCONTRADO` | Calendario, versión o excepción inexistente. |
| 409 | `CALENDARIOS_DUPLICADO` | Nombre o fecha duplicados. |
| 409 | `CALENDARIOS_REVISION_OBSOLETA` | Edición concurrente/revisión obsoleta. |
| 409 | `CALENDARIOS_ESTADO_INCOMPATIBLE` | Publicación, borrador o calendario en estado incompatible. |
| 500 | `CALENDARIOS_ERROR_INTERNO` / `CALENDARIOS_RESPUESTA_INVALIDA` | Fallo de infraestructura o contrato JSON ausente. |

Los errores del driver se traducen localmente en el repositorio; no se modifica el filtro global ni el comportamiento de módulos existentes. La respuesta no expone consultas, parámetros ni mensajes internos del driver.

## Verificación y continuidad

```powershell
npm run typecheck
npm run check:architecture
npm run check:contracts
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run lint:ci
npm run build
```

Las pruebas comprueban el contrato de las doce funciones públicas, JWT real en HTTP, validación, revisión, JSONB y errores. El ensamblaje completo de módulos sigue verificándose con DataSource simulado. Ninguna prueba conecta a Supabase ni ejecuta SQL real.

La creación remota de cuatro tablas y catorce funciones está confirmada por el usuario. La revisión posterior verificó firmas, columnas y catálogos en solo lectura, sin ejecutar funciones de negocio ni comparar sus cuerpos. Las cuatro tablas quedaron aplicadas y verificadas; el usuario confirmó la ejecución de las catorce funciones, que el agente dejó intactas. El rol de conexión configurado para el backend debe disponer de los permisos exigidos por los scripts SQL; no se cambian permisos desde el backend. El siguiente paso es comprobar estos endpoints en el entorno de pruebas y luego desarrollar el frontend modular.
