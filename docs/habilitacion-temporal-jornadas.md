# Backend de habilitación temporal de jornadas

El repositorio de Control Operativo usa las funciones nuevas que el usuario
confirmó haber ejecutado manualmente. Este cambio no ejecuta SQL ni configura jobs.

## Habilitar por usuarios

`POST /control-operativo/jornadas/habilitar-usuarios`, con JWT de administrador
o gerencia (roles 1, 5, 11).

```json
{
  "idTrabajadores": [101, 102],
  "fechaInicio": "2026-10-12",
  "fechaFin": "2026-10-16",
  "duracionMinutos": 120
}
```

`idTrabajadores` contiene los IDs de `tratrabajador` de la pantalla Usuarios.
Las fechas son inclusivas, en formato YYYY-MM-DD. La duración es un entero
positivo en minutos contado desde la habilitación, no desde `fechaInicio`.
El ID del administrador se obtiene del JWT. El cliente no debe enviar un actor.

La respuesta HTTP 200 usa el sobre habitual `{ data, message, status }`.
`data` contiene una fila por trabajador con `idtrabajador`, `jornadas_habilitadas`,
`habilitaciondesde` y `habilitacionhasta`. Puede haber filas con cantidad cero si
no hay días laborables en el rango. Las funciones SQL crean las jornadas
laborables que falten y excluyen feriados.

## Habilitación individual

`PATCH /control-operativo/jornadas/:idJornada/estado` conserva la ruta y ahora
valida el rol administrativo y toma el actor de la sesión.

```json
{ "idEstadoJornada": 372, "duracionMinutos": 120 }
```

**Al abrir (372), la duración es obligatoria.** Para otros estados se puede
omitir. El frontend actual debe actualizar sus habilitaciones individuales y
masivas por días para solicitar/enviar este dato; no se asigna un plazo implícito.
Este cambio de backend no incluye el modal ni la selección en Usuarios.

## Vencimiento y cron

El endpoint habitual `GET /control-operativo/cron/cierre-jornadas` usa ahora
`con_CronCierreJornadasV2`. Respeta los permisos temporales aún vigentes y
persiste el cierre de los vencidos.

Para persistir el cierre más frecuentemente está disponible:

`GET /control-operativo/cron/cierre-habilitaciones-vencidas?key=CRON_SECRET`

Este endpoint exige `CRON_SECRET` configurado y una clave coincidente. Se puede
programar cada minuto en el servicio que ya ejecuta los crons. **No se creó un
programador nuevo.** Devuelve `pasados_culminado` y `pasados_incompleto`.
El vencimiento se comprueba también al listar jornadas y en las funciones nuevas
de escritura; no depende de que el cron diario haya persistido el estado.
El detalle de actividades consulta `con_EstadoJornadaVigenteV2`, tanto si el
listado está vacío como si tiene filas, para evitar mostrar una apertura vencida.

## Funciones conectadas

| Operación | Función |
| --- | --- |
| Listar jornadas | `con_ListarJornadasTrabajadorV2` |
| Crear/reutilizar jornada | `con_CrearJornadaV2` |
| Cambiar estado | `con_ActualizarEstadoJornadaV2` |
| Habilitar por usuarios | `con_HabilitarJornadasUsuariosV2` |
| Cron habitual | `con_CronCierreJornadasV2` |
| Cerrar permisos vencidos | `con_CerrarHabilitacionesVencidasV2` |
| Estado del detalle de actividades | `con_EstadoJornadaVigenteV2` |
| Crear actividad | `con_CrearActividadV3` |
| Editar actividad | `con_ActualizarActividadV3` |
| Eliminar actividad | `con_EliminarActividadV2` |

Las columnas `habilitaciondesde` y `habilitacionhasta` se conservan en la respuesta
del listado de jornadas. La eliminación lee el booleano de la columna nueva
devuelta por PostgreSQL. La corrección de actividades observadas conserva el
argumento existente al llamar a la función V3.

## Verificación

Las pruebas usan repositorios, servicios y sesiones simulados; no escriben en
la base de datos. Cubren el orden de parámetros SQL, el booleano de eliminación,
el estado efectivo en el detalle, validaciones, deduplicación, actor autenticado,
roles y la protección del cron. Las pruebas HTTP levantan un servidor local
efímero, sin conectarse a servicios externos.
