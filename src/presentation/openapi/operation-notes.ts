/** Reglas de negocio que complementan los esquemas de transporte. */
export const operationNotes: Record<string, string> = {
  PlanificacionController_obtenerPlan:
    'Consulta la cabecera del proyecto. `data.plan = null` significa que el proyecto todavía no tiene planificación. Las fechas civiles se devuelven como texto, sin conversión de zona horaria.',
  PlanificacionController_crearPlan:
    'Crea un único borrador activo por proyecto. La revisión inicial es 1. `idaprobador` identifica un trabajador, no un usuario. No publica el plan ni genera jornadas.',
  PlanificacionController_obtenerCronograma:
    'Devuelve plan, entregables, actividades, asignaciones, dependencias y fechas calculadas. Las fechas planificadas salen de `fechas`, no de la fecha administrativa del entregable. Consultar no guarda resultados ni consume horas.',
  PlanificacionController_actualizarReglas:
    'Actualización parcial: las claves omitidas se conservan. `idaprobador: null` elimina el aprobador solo en borrador. Las demás reglas no admiten null. `revisionPlan` debe ser la vigente.',
  PlanificacionController_crearActividad:
    '`datos` admite el reparto inicial en `asignaciones`: actividad y personas se guardan en una única transacción. El esfuerzo se expresa en minutos enteros. Un hito tiene cero esfuerzo y no admite personas.',
  PlanificacionController_obtenerActividad:
    'Incluye el reparto y el saldo por persona. El saldo puede ser negativo cuando hay exceso. Por aprobar, Aprobado y Observado consumen minutos; Rechazado no consume.',
  PlanificacionController_editarActividad:
    'Envía solo las propiedades de `datos` que cambian, más la revisión del plan y de la actividad. Tras publicar, aumentar esfuerzo requiere ampliación y cambiar restricciones de fecha requiere reprogramación.',
  PlanificacionController_eliminarActividad:
    'Revisión y motivo se envían en la query. Una actividad con ejecución, solicitudes o dependencias no puede darse de baja. El resultado de la operación es booleano.',
  PlanificacionController_guardarAsignaciones:
    'La lista reemplaza el reparto completo. Las personas omitidas se retiran conservando su fila e historial. Volver a asignarlas reactiva el mismo ID. Los minutos deben incluir el consumo anterior.',
  PlanificacionController_guardarDependencias:
    'La lista reemplaza todas las predecesoras de la actividad. No se admiten repeticiones, la propia actividad, actividades de otro plan ni ciclos. El desfase se expresa en días laborables.',
  PlanificacionController_reordenar:
    'Envía todos los IDs activos de entregables y actividades exactamente una vez. El orden de cada arreglo determina su prioridad en el cronograma.',
  PlanificacionController_previsualizar:
    'Simula restricciones, orden, reparto y dependencias. Devuelve antes, después, afectadas y un aviso de impacto sobre capacidad de otros proyectos; no expone sus actividades. No escribe ni reserva capacidad.',
  PlanificacionController_publicar:
    'Publica una sola vez y crea la primera línea base atómicamente. Requiere inicio del proyecto, aprobador activo, calendarios publicados y reparto completo. No sustituye una línea base ya existente.',
  PlanificacionController_lineaBase:
    'Establece explícitamente una nueva referencia aprobada de fechas y minutos sin reemplazar las anteriores. Requiere un plan publicado y motivo.',
  PlanificacionController_reprogramar:
    'Guarda ambas restricciones tal como se envían. `null` elimina la restricción; reenvía la que quieras conservar. Propaga el efecto por dependencias y capacidad, sin modificar línea base, horas registradas ni esfuerzo autorizado.',
  PlanificacionController_estadoActividad:
    'Transiciones: 703→704; 704→705 o 706; 705→704 o 706; 706→704. Culminar la actividad conjunta exige que todas sus partes activas estén culminadas. El motivo es obligatorio.',
  PlanificacionController_estadoPlan:
    'Solo permite 701→702 (cerrar) y 702→701 (reabrir). El cierre exige actividades culminadas y ausencia de ampliaciones pendientes. La reapertura conserva las líneas base.',
  PlanificacionController_historial:
    '`tipo`: cambios, movimientos, lineasbase o detallelineabase. Para detallelineabase, `idLineaBase` es obligatorio y debe pertenecer al plan. La paginación empieza en offset 0 y limita a 50 filas por defecto, hasta 200.',
  PlanificacionController_ampliaciones:
    'El aprobador actual consulta todas las solicitudes del plan; los demás usuarios ven las suyas. offset=0 y limite=50 por defecto; máximo 200.',
  PlanificacionController_resolverAmpliacion:
    'Solo resuelve el aprobador actual del plan. Cero minutos aprobados significa rechazo; una aprobación parcial no puede superar lo solicitado. Resolver dos veces se rechaza y los minutos se suman una sola vez.',
  PlanificacionColaboradorController_misAsignaciones:
    'Selector del registro diario. La persona se resuelve desde el JWT: no se acepta idtrabajador del cliente. `fecha` es obligatoria; `idProyecto` filtra opcionalmente. Incluye saldo y contexto de cada asignación.',
  PlanificacionColaboradorController_estadoParte:
    'Opera únicamente la asignación propia. El colaborador puede culminar su parte; reabrir una parte culminada exige además proyectos.planificacion.dar_conformidad en ese proyecto.',
  PlanificacionColaboradorController_solicitarAmpliacion:
    'Solicita minutos adicionales para la parte propia. Solo se admite una solicitud pendiente por asignación. Solicitar no modifica el esfuerzo; una resolución aprobada sí lo amplía.',
  PlanificacionColaboradorController_misAmpliaciones:
    'Consulta solicitudes del plan indicado con la visibilidad del solicitante/aprobador vigente. idPlan es obligatorio. No acepta una identidad de trabajador elegida por el cliente.',
};
