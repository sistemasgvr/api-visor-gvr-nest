import { CALENDARIOS_REPOSITORY } from '../domain/repositories/calendarios.repository.interface';
import { ListarCalendariosUseCase } from '../application/use-cases/planificacion/calendarios/listar-calendarios.use-case';
import { ObtenerCalendarioUseCase } from '../application/use-cases/planificacion/calendarios/obtener-calendario.use-case';
import { CrearCalendarioUseCase } from '../application/use-cases/planificacion/calendarios/crear-calendario.use-case';
import { ActualizarCalendarioUseCase } from '../application/use-cases/planificacion/calendarios/actualizar-calendario.use-case';
import { DuplicarCalendarioUseCase } from '../application/use-cases/planificacion/calendarios/duplicar-calendario.use-case';
import { CrearVersionCalendarioUseCase } from '../application/use-cases/planificacion/calendarios/crear-version-calendario.use-case';
import { GuardarSemanaCalendarioUseCase } from '../application/use-cases/planificacion/calendarios/guardar-semana-calendario.use-case';
import { GuardarExcepcionCalendarioUseCase } from '../application/use-cases/planificacion/calendarios/guardar-excepcion-calendario.use-case';
import { EliminarExcepcionCalendarioUseCase } from '../application/use-cases/planificacion/calendarios/eliminar-excepcion-calendario.use-case';
import { PublicarVersionCalendarioUseCase } from '../application/use-cases/planificacion/calendarios/publicar-version-calendario.use-case';
import { CambiarEstadoCalendarioUseCase } from '../application/use-cases/planificacion/calendarios/cambiar-estado-calendario.use-case';
import { ObtenerDisponibilidadCalendarioUseCase } from '../application/use-cases/planificacion/calendarios/obtener-disponibilidad-calendario.use-case';
import type { FactoryProvider, InjectionToken, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../application/use-cases/mail/mail.service';
import { ActualizarRecursoUseCase } from '../application/use-cases/acc-recursos/actualizar-recurso.use-case';
import { GuardarRecursoUseCase } from '../application/use-cases/acc-recursos/guardar-recurso.use-case';
import { ObtenerRecursoUseCase } from '../application/use-cases/acc-recursos/obtener-recurso.use-case';
import { ObtenerRecursosHijosUseCase } from '../application/use-cases/acc-recursos/obtener-recursos-hijos.use-case';
import { ObtenerRecursosProyectoUseCase } from '../application/use-cases/acc-recursos/obtener-recursos-proyecto.use-case';
import { ObtenerRecursosUsuarioUseCase } from '../application/use-cases/acc-recursos/obtener-recursos-usuario.use-case';
import { ActualizarUsuarioUseCase } from '../application/use-cases/acc/account-users/actualizar-usuario.use-case';
import { BuscarUsuariosUseCase } from '../application/use-cases/acc/account-users/buscar-usuarios.use-case';
import { CrearUsuarioUseCase } from '../application/use-cases/acc/account-users/crear-usuario.use-case';
import { ImportarUsuariosUseCase } from '../application/use-cases/acc/account-users/importar-usuarios.use-case';
import { ObtenerProductosUsuarioUseCase } from '../application/use-cases/acc/account-users/obtener-productos-usuario.use-case';
import { ObtenerProyectosUsuarioUseCase } from '../application/use-cases/acc/account-users/obtener-proyectos-usuario.use-case';
import { ObtenerRolesUsuarioUseCase } from '../application/use-cases/acc/account-users/obtener-roles-usuario.use-case';
import { ObtenerUsuarioPorIdUseCase } from '../application/use-cases/acc/account-users/obtener-usuario-por-id.use-case';
import { ObtenerUsuariosUseCase } from '../application/use-cases/acc/account-users/obtener-usuarios.use-case';
import { BuscarBusinessUnitsUseCase } from '../application/use-cases/acc/business-units/buscar-business-units.use-case';
import { CrearOActualizarBusinessUnitsUseCase } from '../application/use-cases/acc/business-units/crear-o-actualizar-business-units.use-case';
import { ObtenerArbolBusinessUnitsUseCase } from '../application/use-cases/acc/business-units/obtener-arbol-business-units.use-case';
import { ObtenerBusinessUnitPorIdUseCase } from '../application/use-cases/acc/business-units/obtener-business-unit-por-id.use-case';
import { ObtenerBusinessUnitsHijasUseCase } from '../application/use-cases/acc/business-units/obtener-business-units-hijas.use-case';
import { ObtenerBusinessUnitsUseCase } from '../application/use-cases/acc/business-units/obtener-business-units.use-case';
import { CallbackAutorizacionUseCase } from '../application/use-cases/acc/callback-autorizacion.use-case';
import { ActualizarCompanyUseCase } from '../application/use-cases/acc/companies/actualizar-company.use-case';
import { BuscarCompaniesUseCase } from '../application/use-cases/acc/companies/buscar-companies.use-case';
import { CrearCompanyUseCase } from '../application/use-cases/acc/companies/crear-company.use-case';
import { ImportarCompaniesUseCase } from '../application/use-cases/acc/companies/importar-companies.use-case';
import { ObtenerCompaniesProyectoUseCase } from '../application/use-cases/acc/companies/obtener-companies-proyecto.use-case';
import { ObtenerCompaniesUseCase } from '../application/use-cases/acc/companies/obtener-companies.use-case';
import { ObtenerCompanyPorIdUseCase } from '../application/use-cases/acc/companies/obtener-company-por-id.use-case';
import { SubirImagenCompanyUseCase } from '../application/use-cases/acc/companies/subir-imagen-company.use-case';
import { CronRefrescarTokensAccUseCase } from '../application/use-cases/acc/cron-refrescar-tokens-acc.use-case';
import { CreateNamingStandardFromTemplateUseCase } from '../application/use-cases/acc/document-config/create-naming-standard-from-template.use-case';
import { EliminarFolderNamingRuleUseCase } from '../application/use-cases/acc/document-config/eliminar-folder-naming-rule.use-case';
import { GenerarNombreDocumentoUseCase } from '../application/use-cases/acc/document-config/generar-nombre-documento.use-case';
import { ListarDocumentAttributesUseCase } from '../application/use-cases/acc/document-config/listar-document-attributes.use-case';
import { ListarDocumentMetadataPorCarpetaUseCase } from '../application/use-cases/acc/document-config/listar-document-metadata-por-carpeta.use-case';
import { ListarDocumentNamingStandardsUseCase } from '../application/use-cases/acc/document-config/listar-document-naming-standards.use-case';
import { ObtenerDocumentMetadataUseCase } from '../application/use-cases/acc/document-config/obtener-document-metadata.use-case';
import { ObtenerFolderNamingRuleUseCase } from '../application/use-cases/acc/document-config/obtener-folder-naming-rule.use-case';
import { ObtenerNamingTemplatePreviewUseCase } from '../application/use-cases/acc/document-config/obtener-naming-template-preview.use-case';
import { UpsertDocumentAttributeUseCase } from '../application/use-cases/acc/document-config/upsert-document-attribute.use-case';
import { UpsertDocumentMetadataUseCase } from '../application/use-cases/acc/document-config/upsert-document-metadata.use-case';
import { UpsertDocumentNamingStandardUseCase } from '../application/use-cases/acc/document-config/upsert-document-naming-standard.use-case';
import { UpsertFolderNamingRuleUseCase } from '../application/use-cases/acc/document-config/upsert-folder-naming-rule.use-case';
import { GenerarUrlAutorizacionUseCase } from '../application/use-cases/acc/generar-url-autorizacion.use-case';
import { ActualizarIncidenciaUseCase } from '../application/use-cases/acc/issues/actualizar-incidencia.use-case';
import { AsignarIncidenciaUseCase } from '../application/use-cases/acc/issues/asignar-incidencia.use-case';
import { CrearAdjuntoUseCase } from '../application/use-cases/acc/issues/crear-adjunto.use-case';
import { CrearComentarioUseCase } from '../application/use-cases/acc/issues/crear-comentario.use-case';
import { CrearIncidenciaUseCase } from '../application/use-cases/acc/issues/crear-incidencia.use-case';
import { EliminarAdjuntoUseCase } from '../application/use-cases/acc/issues/eliminar-adjunto.use-case';
import { ExportarIncidenciasUseCase } from '../application/use-cases/acc/issues/exportar-incidencias.use-case';
import { ObtenerActividadIncidenciaUseCase } from '../application/use-cases/acc/issues/obtener-actividad-incidencia.use-case';
import { ObtenerAdjuntosUseCase } from '../application/use-cases/acc/issues/obtener-adjuntos.use-case';
import { ObtenerCategoriasRaizUseCase } from '../application/use-cases/acc/issues/obtener-categorias-raiz.use-case';
import { ObtenerComentariosUseCase } from '../application/use-cases/acc/issues/obtener-comentarios.use-case';
import { ObtenerDefinicionesAtributosUseCase } from '../application/use-cases/acc/issues/obtener-definiciones-atributos.use-case';
import { ObtenerIncidenciaPorIdUseCase } from '../application/use-cases/acc/issues/obtener-incidencia-por-id.use-case';
import { ObtenerIncidenciasPorDocumentoUseCase } from '../application/use-cases/acc/issues/obtener-incidencias-por-documento.use-case';
import { ObtenerIncidenciasUseCase } from '../application/use-cases/acc/issues/obtener-incidencias.use-case';
import { ObtenerMapeosAtributosUseCase } from '../application/use-cases/acc/issues/obtener-mapeos-atributos.use-case';
import { ObtenerPerfilUsuarioUseCase as ObtenerPerfilUsuarioUseCase2 } from '../application/use-cases/acc/issues/obtener-perfil-usuario.use-case';
import { ObtenerTiposIncidenciasUseCase } from '../application/use-cases/acc/issues/obtener-tipos-incidencias.use-case';
import obtener_token_valido_helper from '../application/use-cases/acc/issues/obtener-token-valido.helper';
import { ObtenerUrlMiniaturaUseCase } from '../application/use-cases/acc/issues/obtener-url-miniatura.use-case';
import { ObtenerUsuariosDisponiblesUseCase } from '../application/use-cases/acc/issues/obtener-usuarios-disponibles.use-case';
import { ObtenerMiTokenUseCase } from '../application/use-cases/acc/obtener-mi-token.use-case';
import { ObtenerToken2LeggedUseCase } from '../application/use-cases/acc/obtener-token-2legged.use-case';
import { ActualizarUsuarioProyectoUseCase } from '../application/use-cases/acc/project-users/actualizar-usuario-proyecto.use-case';
import { AgregarUsuarioProyectoUseCase } from '../application/use-cases/acc/project-users/agregar-usuario-proyecto.use-case';
import { BuscarUsuariosProyectoUseCase } from '../application/use-cases/acc/project-users/buscar-usuarios-proyecto.use-case';
import { EliminarUsuarioProyectoUseCase } from '../application/use-cases/acc/project-users/eliminar-usuario-proyecto.use-case';
import { ImportarUsuariosProyectoUseCase } from '../application/use-cases/acc/project-users/importar-usuarios-proyecto.use-case';
import { ObtenerUsuarioProyectoPorIdUseCase } from '../application/use-cases/acc/project-users/obtener-usuario-proyecto-por-id.use-case';
import { ObtenerUsuariosProyectoUseCase } from '../application/use-cases/acc/project-users/obtener-usuarios-proyecto.use-case';
import { ActivarServicioProyectoUseCase } from '../application/use-cases/acc/projects/activar-servicio-proyecto.use-case';
import { ActualizarProyectoUseCase } from '../application/use-cases/acc/projects/actualizar-proyecto.use-case';
import { ClonarProyectoUseCase } from '../application/use-cases/acc/projects/clonar-proyecto.use-case';
import { CrearProyectoUseCase as CrearProyectoUseCase2 } from '../application/use-cases/acc/projects/crear-proyecto.use-case';
import { DesactivarServicioProyectoUseCase } from '../application/use-cases/acc/projects/desactivar-servicio-proyecto.use-case';
import { GetPlantillasUseCase } from '../application/use-cases/acc/projects/get-plantillas.use-case';
import { GetProyectoPorIdUseCase } from '../application/use-cases/acc/projects/get-proyecto-por-id.use-case';
import { GetProyectosActivosUseCase } from '../application/use-cases/acc/projects/get-proyectos-activos.use-case';
import { GetProyectosPorTipoUseCase } from '../application/use-cases/acc/projects/get-proyectos-por-tipo.use-case';
import { GetProyectosUseCase } from '../application/use-cases/acc/projects/get-proyectos.use-case';
import { SubirImagenProyectoUseCase } from '../application/use-cases/acc/projects/subir-imagen-proyecto.use-case';
import { RefrescarToken3LeggedUseCase } from '../application/use-cases/acc/refrescar-token-3legged.use-case';
import { ActualizarNivelPermisoUsuarioUseCase } from '../application/use-cases/acc/resources/actualizar-nivel-permiso-usuario.use-case';
import { ActualizarRecursoUseCase as ActualizarRecursoUseCase2 } from '../application/use-cases/acc/resources/actualizar-recurso.use-case';
import { AsignarPermisoUsuarioUseCase } from '../application/use-cases/acc/resources/asignar-permiso-usuario.use-case';
import { AsignarPermisoUseCase } from '../application/use-cases/acc/resources/asignar-permiso.use-case';
import { CrearRecursoUseCase } from '../application/use-cases/acc/resources/crear-recurso.use-case';
import { EliminarRecursoUseCase } from '../application/use-cases/acc/resources/eliminar-recurso.use-case';
import { ListarNivelesPermisoUseCase } from '../application/use-cases/acc/resources/listar-niveles-permiso.use-case';
import { ListarPermisosRolUseCase as ListarPermisosRolUseCase2 } from '../application/use-cases/acc/resources/listar-permisos-rol.use-case';
import { ListarPermisosUsuarioUseCase } from '../application/use-cases/acc/resources/listar-permisos-usuario.use-case';
import { ListarRecursosUseCase } from '../application/use-cases/acc/resources/listar-recursos.use-case';
import { ListarRolesRecursoUseCase } from '../application/use-cases/acc/resources/listar-roles-recurso.use-case';
import { ListarUsuariosDisponiblesRecursoUseCase } from '../application/use-cases/acc/resources/listar-usuarios-disponibles-recurso.use-case';
import { ListarUsuariosRecursoUseCase } from '../application/use-cases/acc/resources/listar-usuarios-recurso.use-case';
import { ObtenerRecursoPorIdUseCase } from '../application/use-cases/acc/resources/obtener-recurso-por-id.use-case';
import { RemoverPermisoUsuarioUseCase } from '../application/use-cases/acc/resources/remover-permiso-usuario.use-case';
import { RemoverPermisoUseCase } from '../application/use-cases/acc/resources/remover-permiso.use-case';
import { SincronizarPermisosRolUseCase as SincronizarPermisosRolUseCase2 } from '../application/use-cases/acc/resources/sincronizar-permisos-rol.use-case';
import { SincronizarPermisosUsuarioUseCase } from '../application/use-cases/acc/resources/sincronizar-permisos-usuario.use-case';
import { ActualizarFlujoRevisionGvrUseCase } from '../application/use-cases/acc/reviews/actualizar-flujo-revision-gvr.use-case';
import { AddComentarioArchivoUseCase } from '../application/use-cases/acc/reviews/add-comentario-archivo.use-case';
import { AgregarReferenciaRevisionUseCase } from '../application/use-cases/acc/reviews/agregar-referencia-revision.use-case';
import { AnularRevisionEntireUseCase } from '../application/use-cases/acc/reviews/anular-revision-entire.use-case';
import { CambiarEstadoFlujoGvrUseCase } from '../application/use-cases/acc/reviews/cambiar-estado-flujo-gvr.use-case';
import { CrearFlujoRevisionGvrUseCase } from '../application/use-cases/acc/reviews/crear-flujo-revision-gvr.use-case';
import { CrearRevisionUseCase } from '../application/use-cases/acc/reviews/crear-revision.use-case';
import { CrearWorkflowUseCase } from '../application/use-cases/acc/reviews/crear-workflow.use-case';
import { DelegarPasoRevisionUseCase } from '../application/use-cases/acc/reviews/delegar-paso-revision.use-case';
import { EliminarReferenciaRevisionUseCase } from '../application/use-cases/acc/reviews/eliminar-referencia-revision.use-case';
import { EnviarResenaPasoUseCase } from '../application/use-cases/acc/reviews/enviar-resena-paso.use-case';
import { ExportarRevisionDetallePdfUseCase } from '../application/use-cases/acc/reviews/exportar-revision-detalle-pdf.use-case';
import { ExportarRevisionesPdfUseCase } from '../application/use-cases/acc/reviews/exportar-revisiones-pdf.use-case';
import { GetComentariosArchivoUseCase } from '../application/use-cases/acc/reviews/get-comentarios-archivo.use-case';
import { GuardarWorkflowCandidatosUseCase } from '../application/use-cases/acc/reviews/guardar-workflow-candidatos.use-case';
import { IniciarPasoRevisionUseCase } from '../application/use-cases/acc/reviews/iniciar-paso-revision.use-case';
import { NotificarRevisoresRevisionUseCase } from '../application/use-cases/acc/reviews/notificar-revisores-revision.use-case';
import { ObtenerApprovalStatusesVersionUseCase } from '../application/use-cases/acc/reviews/obtener-approval-statuses-version.use-case';
import { ObtenerProgresoRevisionUseCase } from '../application/use-cases/acc/reviews/obtener-progreso-revision.use-case';
import { ObtenerReferenciasRevisionUseCase } from '../application/use-cases/acc/reviews/obtener-referencias-revision.use-case';
import { ObtenerRevisionPorIdUseCase } from '../application/use-cases/acc/reviews/obtener-revision-por-id.use-case';
import { ObtenerRevisionesUseCase } from '../application/use-cases/acc/reviews/obtener-revisiones.use-case';
import { ObtenerVersionesRevisionUseCase } from '../application/use-cases/acc/reviews/obtener-versiones-revision.use-case';
import { ObtenerWorkflowCandidatosUseCase } from '../application/use-cases/acc/reviews/obtener-workflow-candidatos.use-case';
import { ObtenerWorkflowPorIdUseCase } from '../application/use-cases/acc/reviews/obtener-workflow-por-id.use-case';
import { ObtenerWorkflowRevisionUseCase } from '../application/use-cases/acc/reviews/obtener-workflow-revision.use-case';
import { ObtenerWorkflowsUseCase } from '../application/use-cases/acc/reviews/obtener-workflows.use-case';
import { SaltarPasoRevisionUseCase } from '../application/use-cases/acc/reviews/saltar-paso-revision.use-case';
import { VolverPasoAnteriorRevisionUseCase } from '../application/use-cases/acc/reviews/volver-paso-anterior-revision.use-case';
import { RevocarTokenUseCase } from '../application/use-cases/acc/revocar-token.use-case';
import { ValidarExpiracionUseCase } from '../application/use-cases/acc/validar-expiracion.use-case';
import { GenerarTokenViewerUseCase } from '../application/use-cases/acc/viewer/generar-token-viewer.use-case';
import { ObtenerManifiestoUseCase } from '../application/use-cases/acc/viewer/obtener-manifiesto.use-case';
import { ObtenerMetadatosUseCase } from '../application/use-cases/acc/viewer/obtener-metadatos.use-case';
import { ObtenerTokenPublicoUseCase } from '../application/use-cases/acc/viewer/obtener-token-publico.use-case';
import { ActualizarVisorElementoFotoUseCase } from '../application/use-cases/acc/visor-elemento-foto/actualizar-visor-elemento-foto.use-case';
import { AgregarArchivosVisorElementoFotoUseCase } from '../application/use-cases/acc/visor-elemento-foto/agregar-archivos-visor-elemento-foto.use-case';
import { CrearVisorElementoFotoUseCase } from '../application/use-cases/acc/visor-elemento-foto/crear-visor-elemento-foto.use-case';
import { EliminarArchivoVisorElementoFotoUseCase } from '../application/use-cases/acc/visor-elemento-foto/eliminar-archivo-visor-elemento-foto.use-case';
import { EliminarVisorElementoFotoUseCase } from '../application/use-cases/acc/visor-elemento-foto/eliminar-visor-elemento-foto.use-case';
import { ListarVisorElementoFotosPorDocumentoUseCase } from '../application/use-cases/acc/visor-elemento-foto/listar-visor-elemento-fotos-por-documento.use-case';
import { ObtenerVisorElementoFotoPorElementoUseCase } from '../application/use-cases/acc/visor-elemento-foto/obtener-visor-elemento-foto-por-elemento.use-case';
import { ObtenerVisorElementoFotoUseCase } from '../application/use-cases/acc/visor-elemento-foto/obtener-visor-elemento-foto.use-case';
import { ActualizarVisorMarcaRevisionUseCase } from '../application/use-cases/acc/visor-marca-revision/actualizar-visor-marca-revision.use-case';
import { AnularPublicacionVisorMarcaRevisionUseCase } from '../application/use-cases/acc/visor-marca-revision/anular-publicacion-visor-marca-revision.use-case';
import { ContarVisorMarcasRevisionUseCase } from '../application/use-cases/acc/visor-marca-revision/contar-visor-marcas-revision.use-case';
import { CrearVisorMarcaRevisionUseCase } from '../application/use-cases/acc/visor-marca-revision/crear-visor-marca-revision.use-case';
import { DuplicarVisorMarcaRevisionUseCase } from '../application/use-cases/acc/visor-marca-revision/duplicar-visor-marca-revision.use-case';
import { ListarVisorMarcasRevisionUseCase } from '../application/use-cases/acc/visor-marca-revision/listar-visor-marcas-revision.use-case';
import { ObtenerVisorMarcaRevisionUseCase } from '../application/use-cases/acc/visor-marca-revision/obtener-visor-marca-revision.use-case';
import { PublicarVisorMarcaRevisionUseCase } from '../application/use-cases/acc/visor-marca-revision/publicar-visor-marca-revision.use-case';
import { SincronizarMarkupIdApsVisorMarcaRevisionUseCase } from '../application/use-cases/acc/visor-marca-revision/sincronizar-markup-id-aps-visor-marca-revision.use-case';
import { SuprimirVisorMarcaRevisionUseCase } from '../application/use-cases/acc/visor-marca-revision/suprimir-visor-marca-revision.use-case';
import { VisorMarcaRevisionSyncService } from '../application/use-cases/acc/visor-marca-revision/visor-marca-revision-sync.service';
import { ListarAuditoriasUseCase } from '../application/use-cases/auditoria/listar-auditorias.use-case';
import { ObtenerAuditoriaPorIdUseCase } from '../application/use-cases/auditoria/obtener-auditoria-por-id.use-case';
import { ObtenerEstadisticasUseCase } from '../application/use-cases/auditoria/obtener-estadisticas.use-case';
import { ObtenerHistorialEntidadUseCase } from '../application/use-cases/auditoria/obtener-historial-entidad.use-case';
import { ObtenerHistorialUsuarioUseCase } from '../application/use-cases/auditoria/obtener-historial-usuario.use-case';
import { ActualizarCredencialesUseCase } from '../application/use-cases/auth/actualizar-credenciales.use-case';
import { CambiarContrasenaPerfilUseCase } from '../application/use-cases/auth/cambiar-contrasena-perfil.use-case';
import { CerrarTodasSesionesUseCase } from '../application/use-cases/auth/cerrar-todas-sesiones.use-case';
import { LogoutUseCase } from '../application/use-cases/auth/logout.use-case';
import { ObtenerEstadisticasUsuariosUseCase } from '../application/use-cases/auth/obtener-estadisticas-usuarios.use-case';
import { ObtenerPerfilUsuarioUseCase } from '../application/use-cases/auth/obtener-perfil-usuario.use-case';
import { ObtenerPerfilUseCase } from '../application/use-cases/auth/obtener-perfil.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/auth/refresh-token.use-case';
import { SubirFotoPerfilUseCase } from '../application/use-cases/auth/subir-foto-perfil.use-case';
import { ValidarSesionUseCase } from '../application/use-cases/auth/validar-sesion.use-case';
import { ActualizarImagenProyectoBim360UseCase } from '../application/use-cases/bim360/projects/actualizar-imagen-proyecto.use-case';
import { ActualizarProyectoBim360UseCase } from '../application/use-cases/bim360/projects/actualizar-proyecto.use-case';
import { CrearProyectoBim360UseCase } from '../application/use-cases/bim360/projects/crear-proyecto.use-case';
import { ObtenerIssueContainerIdUseCase } from '../application/use-cases/bim360/projects/obtener-issue-container-id.use-case';
import { ObtenerProyectoPorIdLegacyUseCase } from '../application/use-cases/bim360/projects/obtener-proyecto-por-id-legacy.use-case';
import { ObtenerProyectoPorIdNewUseCase } from '../application/use-cases/bim360/projects/obtener-proyecto-por-id-new.use-case';
import { ObtenerProyectosLegacyUseCase } from '../application/use-cases/bim360/projects/obtener-proyectos-legacy.use-case';
import { ObtenerProyectosNewUseCase } from '../application/use-cases/bim360/projects/obtener-proyectos-new.use-case';
import { ActualizarActividadUseCase } from '../application/use-cases/control-operativo/actualizar-actividad.use-case';
import { ActualizarEstadoJornadaUseCase } from '../application/use-cases/control-operativo/actualizar-estado-jornada.use-case';
import { HabilitarJornadasUsuariosUseCase } from '../application/use-cases/control-operativo/habilitar-jornadas-usuarios.use-case';
import { CerrarHabilitacionesVencidasUseCase } from '../application/use-cases/control-operativo/cerrar-habilitaciones-vencidas.use-case';
import { AgregarEvidenciasActividadUseCase } from '../application/use-cases/control-operativo/agregar-evidencias-actividad.use-case';
import { CrearActividadUseCase } from '../application/use-cases/control-operativo/crear-actividad.use-case';
import { CrearJornadaUseCase } from '../application/use-cases/control-operativo/crear-jornada.use-case';
import { CronAlertaActividadesSinValidarUseCase } from '../application/use-cases/control-operativo/cron-alerta-actividades-sin-validar.use-case';
import { CronCierreJornadasUseCase } from '../application/use-cases/control-operativo/cron-cierre-jornadas.use-case';
import { EliminarActividadUseCase } from '../application/use-cases/control-operativo/eliminar-actividad.use-case';
import { EliminarEvidenciaActividadUseCase } from '../application/use-cases/control-operativo/eliminar-evidencia-actividad.use-case';
import { ExportarActividadesJornadasWordMasivoUseCase } from '../application/use-cases/control-operativo/exportar-actividades-jornadas-word-masivo.use-case';
import { ExportarActividadesJornadasWordUseCase } from '../application/use-cases/control-operativo/exportar-actividades-jornadas-word.use-case';
import { ListarActividadesObservadasSubsanarUseCase } from '../application/use-cases/control-operativo/listar-actividades-observadas-subsanar.use-case';
import { ListarActividadesValidacionUseCase } from '../application/use-cases/control-operativo/listar-actividades-validacion.use-case';
import { ListarActividadesUseCase } from '../application/use-cases/control-operativo/listar-actividades.use-case';
import { ListarDesempenoUseCase } from '../application/use-cases/control-operativo/listar-desempeno.use-case';
import { ListarJornadasTrabajadorUseCase } from '../application/use-cases/control-operativo/listar-jornadas-trabajador.use-case';
import { ListarLideresEquipoReporteGeneralUseCase } from '../application/use-cases/control-operativo/listar-lideres-equipo-reporte-general.use-case';
import { ListarObservacionesActividadUseCase } from '../application/use-cases/control-operativo/listar-observaciones-actividad.use-case';
import { ListarProyectosAccesoTrabajadorUseCase } from '../application/use-cases/control-operativo/listar-proyectos-acceso-trabajador.use-case';
import { ListarProyectosParaValidacionUseCase } from '../application/use-cases/control-operativo/listar-proyectos-para-validacion.use-case';
import { ListarReporteGeneralUseCase } from '../application/use-cases/control-operativo/listar-reporte-general.use-case';
import { ListarReporteHorasMesProyectoTrabajadorUseCase } from '../application/use-cases/control-operativo/listar-reporte-horas-mes-proyecto-trabajador.use-case';
import { ListarReporteHorasRangoDetalleProyectoUseCase } from '../application/use-cases/control-operativo/listar-reporte-horas-rango-detalle-proyecto.use-case';
import { ListarTrabajadoresParaFiltroUseCase } from '../application/use-cases/control-operativo/listar-trabajadores-para-filtro.use-case';
import { ListarTrabajadoresPorProyectoUseCase } from '../application/use-cases/control-operativo/listar-trabajadores-por-proyecto.use-case';
import { ListarTrabajadoresSinActividadesHoyUseCase } from '../application/use-cases/control-operativo/listar-trabajadores-sin-actividades-hoy.use-case';
import { ListarTrabajadoresSinJornadaHoyUseCase } from '../application/use-cases/control-operativo/listar-trabajadores-sin-jornada-hoy.use-case';
import { ListarValorizacionUseCase } from '../application/use-cases/control-operativo/listar-valorizacion.use-case';
import { ObtenerActividadUseCase } from '../application/use-cases/control-operativo/obtener-actividad.use-case';
import { ValidarActividadUseCase } from '../application/use-cases/control-operativo/validar-actividad.use-case';
import { ObtenerCantidadActividadesObservadasUseCase } from '../application/use-cases/dashboard/obtener-cantidad-actividades-observadas.use-case';
import { ObtenerCantidadActividadesPendientesUseCase } from '../application/use-cases/dashboard/obtener-cantidad-actividades-pendientes.use-case';
import { ObtenerCantidadActividadesRechazadasUseCase } from '../application/use-cases/dashboard/obtener-cantidad-actividades-rechazadas.use-case';
import { ObtenerCantidadJornadasCompletasSemanaUseCase } from '../application/use-cases/dashboard/obtener-cantidad-jornadas-completas-semana.use-case';
import { ObtenerCantidadProyectosVigentesUseCase } from '../application/use-cases/dashboard/obtener-cantidad-proyectos-vigentes.use-case';
import { ObtenerCantidadTrabajadoresActivosUseCase } from '../application/use-cases/dashboard/obtener-cantidad-trabajadores-activos.use-case';
import { ObtenerCantidadTrabajadoresConectadoSemanaUseCase } from '../application/use-cases/dashboard/obtener-cantidad-trabajadores-conectado-semana.use-case';
import { ObtenerCantidadTrabajadoresPorProyectoUseCase } from '../application/use-cases/dashboard/obtener-cantidad-trabajadores-por-proyecto.use-case';
import { ObtenerHorasEsperadasVsRegistradasMesUseCase } from '../application/use-cases/dashboard/obtener-horas-esperadas-vs-registradas-mes.use-case';
import { ObtenerProyectosConProgresoUseCase } from '../application/use-cases/dashboard/obtener-proyectos-con-progreso.use-case';
import { ObtenerTopTrabajadoresHorasMesUseCase } from '../application/use-cases/dashboard/obtener-top-trabajadores-horas-mes.use-case';
import { CrearBucketUseCase } from '../application/use-cases/data-management/buckets/crear-bucket.use-case';
import { EliminarBucketUseCase } from '../application/use-cases/data-management/buckets/eliminar-bucket.use-case';
import { ObtenerBucketsUseCase } from '../application/use-cases/data-management/buckets/obtener-buckets.use-case';
import { ObtenerDetallesBucketUseCase } from '../application/use-cases/data-management/buckets/obtener-detalles-bucket.use-case';
import { ActualizarCarpetaUseCase } from '../application/use-cases/data-management/folders/actualizar-carpeta.use-case';
import { BuscarEnCarpetaUseCase } from '../application/use-cases/data-management/folders/buscar-en-carpeta.use-case';
import { BuscarEnContenidoCarpetaUseCase } from '../application/use-cases/data-management/folders/buscar-en-contenido-carpeta.use-case';
import { CrearCarpetaUseCase } from '../application/use-cases/data-management/folders/crear-carpeta.use-case';
import { CrearReferenciaCarpetaUseCase } from '../application/use-cases/data-management/folders/crear-referencia-carpeta.use-case';
import { CrearSubcarpetaUseCase } from '../application/use-cases/data-management/folders/crear-subcarpeta.use-case';
import { EliminarCarpetaUseCase } from '../application/use-cases/data-management/folders/eliminar-carpeta.use-case';
import { ExportarPermisosCarpetaPdfUseCase } from '../application/use-cases/data-management/folders/exportar-permisos-carpeta-pdf.use-case';
import { ExportarRegistroArchivosPdfUseCase } from '../application/use-cases/data-management/folders/exportar-registro-archivos-pdf.use-case';
import { ObtenerCarpetaPadreUseCase } from '../application/use-cases/data-management/folders/obtener-carpeta-padre.use-case';
import { ObtenerCarpetaPorIdUseCase } from '../application/use-cases/data-management/folders/obtener-carpeta-por-id.use-case';
import { ObtenerContenidoCarpetaUseCase } from '../application/use-cases/data-management/folders/obtener-contenido-carpeta.use-case';
import { ObtenerElementosEliminadosUseCase } from '../application/use-cases/data-management/folders/obtener-elementos-eliminados.use-case';
import { ObtenerReferenciasUseCase } from '../application/use-cases/data-management/folders/obtener-referencias.use-case';
import { ObtenerRelacionesLinksUseCase } from '../application/use-cases/data-management/folders/obtener-relaciones-links.use-case';
import { ObtenerRelacionesRefsUseCase } from '../application/use-cases/data-management/folders/obtener-relaciones-refs.use-case';
import { RestaurarCarpetaUseCase } from '../application/use-cases/data-management/folders/restaurar-carpeta.use-case';
import { SincronizarCarpetasProyectoUseCase } from '../application/use-cases/data-management/folders/sincronizar-carpetas-proyecto.use-case';
import { ActualizarItemUseCase } from '../application/use-cases/data-management/items/actualizar-item.use-case';
import { CompletarSubidaChunkedUseCase } from '../application/use-cases/data-management/items/completar-subida-chunked.use-case';
import { CopiarItemUseCase } from '../application/use-cases/data-management/items/copiar-item.use-case';
import { CrearItemUseCase } from '../application/use-cases/data-management/items/crear-item.use-case';
import { CrearReferenciaItemUseCase } from '../application/use-cases/data-management/items/crear-referencia-item.use-case';
import { DescargarItemUseCase } from '../application/use-cases/data-management/items/descargar-item.use-case';
import { DesplazarItemUseCase } from '../application/use-cases/data-management/items/desplazar-item.use-case';
import { EliminarItemUseCase } from '../application/use-cases/data-management/items/eliminar-item.use-case';
import { IniciarSubidaChunkedUseCase } from '../application/use-cases/data-management/items/iniciar-subida-chunked.use-case';
import { ObtenerActividadesArchivoUseCase } from '../application/use-cases/data-management/items/obtener-actividades-archivo.use-case';
import { ObtenerItemPadreUseCase } from '../application/use-cases/data-management/items/obtener-item-padre.use-case';
import { ObtenerItemPorIdUseCase as ObtenerItemPorIdUseCase2 } from '../application/use-cases/data-management/items/obtener-item-por-id.use-case';
import { ObtenerReferenciasItemUseCase } from '../application/use-cases/data-management/items/obtener-referencias-item.use-case';
import { ObtenerRelacionesLinksItemUseCase } from '../application/use-cases/data-management/items/obtener-relaciones-links-item.use-case';
import { ObtenerRelacionesRefsItemUseCase } from '../application/use-cases/data-management/items/obtener-relaciones-refs-item.use-case';
import { ObtenerStorageUrlItemUseCase } from '../application/use-cases/data-management/items/obtener-storage-url-item.use-case';
import { ObtenerTipVersionUseCase } from '../application/use-cases/data-management/items/obtener-tip-version.use-case';
import { ObtenerUrlsSubidaChunkedUseCase } from '../application/use-cases/data-management/items/obtener-urls-subida-chunked.use-case';
import { ObtenerVersionesUseCase } from '../application/use-cases/data-management/items/obtener-versiones.use-case';
import { RestaurarItemUseCase } from '../application/use-cases/data-management/items/restaurar-item.use-case';
import { SubirArchivoUseCase } from '../application/use-cases/data-management/items/subir-archivo.use-case';
import { ObtenerHubsUseCase } from '../application/use-cases/data-management/obtener-hubs.use-case';
import { ObtenerItemPorIdUseCase } from '../application/use-cases/data-management/obtener-item-por-id.use-case';
import { ObtenerItemsUseCase } from '../application/use-cases/data-management/obtener-items.use-case';
import { ObtenerProyectoPorIdUseCase } from '../application/use-cases/data-management/obtener-proyecto-por-id.use-case';
import { ObtenerProyectosUseCase } from '../application/use-cases/data-management/obtener-proyectos.use-case';
import { ObtenerVersionesItemUseCase } from '../application/use-cases/data-management/obtener-versiones-item.use-case';
import { CrearDescargaUseCase } from '../application/use-cases/data-management/projects/crear-descarga.use-case';
import { CrearStorageUseCase } from '../application/use-cases/data-management/projects/crear-storage.use-case';
import { ObtenerCarpetasPrincipalesUseCase } from '../application/use-cases/data-management/projects/obtener-carpetas-principales.use-case';
import { ObtenerEstadoDescargaUseCase } from '../application/use-cases/data-management/projects/obtener-estado-descarga.use-case';
import { ObtenerEstadoJobUseCase } from '../application/use-cases/data-management/projects/obtener-estado-job.use-case';
import { ObtenerHubDeProyectoUseCase } from '../application/use-cases/data-management/projects/obtener-hub-de-proyecto.use-case';
import { ObtenerProyectoHubPorIdUseCase } from '../application/use-cases/data-management/projects/obtener-proyecto-hub-por-id.use-case';
import { ObtenerProyectosHubUseCase } from '../application/use-cases/data-management/projects/obtener-proyectos-hub.use-case';
import { ActualizarVersionUseCase } from '../application/use-cases/data-management/versions/actualizar-version.use-case';
import { CrearReferenciaUseCase } from '../application/use-cases/data-management/versions/crear-referencia.use-case';
import { CrearVersionUseCase } from '../application/use-cases/data-management/versions/crear-version.use-case';
import { ObtenerDescargasUseCase } from '../application/use-cases/data-management/versions/obtener-descargas.use-case';
import { ObtenerFormatosDescargaUseCase } from '../application/use-cases/data-management/versions/obtener-formatos-descarga.use-case';
import { ObtenerItemUseCase } from '../application/use-cases/data-management/versions/obtener-item.use-case';
import { ObtenerReferenciasUseCase as ObtenerReferenciasUseCase2 } from '../application/use-cases/data-management/versions/obtener-referencias.use-case';
import { ObtenerRelacionesLinksUseCase as ObtenerRelacionesLinksUseCase2 } from '../application/use-cases/data-management/versions/obtener-relaciones-links.use-case';
import { ObtenerRelacionesRefsUseCase as ObtenerRelacionesRefsUseCase2 } from '../application/use-cases/data-management/versions/obtener-relaciones-refs.use-case';
import { ObtenerVersionPorIdUseCase } from '../application/use-cases/data-management/versions/obtener-version-por-id.use-case';
import { EnviarCorreoBienvenidaDemoUseCase } from '../application/use-cases/demo/enviar-correo-bienvenida-demo.use-case';
import { CrearEmpresaUseCase } from '../application/use-cases/empresa/crear-empresa.use-case';
import { EditarEmpresaUseCase } from '../application/use-cases/empresa/editar-empresa.use-case';
import { EliminarEmpresaUseCase } from '../application/use-cases/empresa/eliminar-empresa.use-case';
import { ListarEmpresasUseCase } from '../application/use-cases/empresa/listar-empresas.use-case';
import { ObtenerEmpresaUseCase } from '../application/use-cases/empresa/obtener-empresa.use-case';
import { CrearOpcionListaUseCase } from '../application/use-cases/general/crear-opcion-lista.use-case';
import { ListarMenuOpcionesUseCase } from '../application/use-cases/general/listar-menu-opciones.use-case';
import { ListarMenuRecursivoUseCase } from '../application/use-cases/general/listar-menu-recursivo.use-case';
import { ObtenerCatalogosTrabajadorUseCase } from '../application/use-cases/general/obtener-catalogos-trabajador.use-case';
import { ObtenerMenuOpcionUseCase } from '../application/use-cases/general/obtener-menu-opcion.use-case';
import { ObtenerOpcionesListaUseCase } from '../application/use-cases/general/obtener-opciones-lista.use-case';
import { ActualizarAdjuntoBim360UseCase } from '../application/use-cases/issues-bim360/actualizar-adjunto.use-case';
import { ActualizarIncidenciaBim360UseCase } from '../application/use-cases/issues-bim360/actualizar-incidencia.use-case';
import { CrearAdjuntoBim360UseCase } from '../application/use-cases/issues-bim360/crear-adjunto.use-case';
import { CrearComentarioBim360UseCase } from '../application/use-cases/issues-bim360/crear-comentario.use-case';
import { CrearIncidenciaBim360UseCase } from '../application/use-cases/issues-bim360/crear-incidencia.use-case';
import { ObtenerAdjuntosBim360UseCase } from '../application/use-cases/issues-bim360/obtener-adjuntos.use-case';
import { ObtenerCategoriasRaizBim360UseCase } from '../application/use-cases/issues-bim360/obtener-categorias-raiz.use-case';
import { ObtenerComentariosBim360UseCase } from '../application/use-cases/issues-bim360/obtener-comentarios.use-case';
import { ObtenerDefinicionesAtributosBim360UseCase } from '../application/use-cases/issues-bim360/obtener-definiciones-atributos.use-case';
import { ObtenerIncidenciaPorIdBim360UseCase } from '../application/use-cases/issues-bim360/obtener-incidencia-por-id.use-case';
import { ObtenerIncidenciasPorDocumentoBim360UseCase } from '../application/use-cases/issues-bim360/obtener-incidencias-por-documento.use-case';
import { ObtenerIncidenciasBim360UseCase } from '../application/use-cases/issues-bim360/obtener-incidencias.use-case';
import { ObtenerMapeosAtributosBim360UseCase } from '../application/use-cases/issues-bim360/obtener-mapeos-atributos.use-case';
import { ObtenerPerfilUsuarioBim360UseCase } from '../application/use-cases/issues-bim360/obtener-perfil-usuario.use-case';
import { ObtenerTiposIncidenciasBim360UseCase } from '../application/use-cases/issues-bim360/obtener-tipos-incidencias.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { ListarCoberturaEnviosMailUseCase } from '../application/use-cases/mail-envio/listar-cobertura-envios-mail.use-case';
import { ListarLogsEnvioMailUseCase } from '../application/use-cases/mail-envio/listar-logs-envio-mail.use-case';
import { ReenviarMailEnvioUseCase } from '../application/use-cases/mail-envio/reenviar-mail-envio.use-case';
import { ReenviarPendientesMailEnvioUseCase } from '../application/use-cases/mail-envio/reenviar-pendientes-mail-envio.use-case';
import { ActualizarMailPlantillaUseCase } from '../application/use-cases/mail-plantilla/actualizar-mail-plantilla.use-case';
import { ActualizarVariablesPruebaMailPlantillaUseCase } from '../application/use-cases/mail-plantilla/actualizar-variables-prueba-mail-plantilla.use-case';
import { CrearMailPlantillaUseCase } from '../application/use-cases/mail-plantilla/crear-mail-plantilla.use-case';
import { EliminarHistorialMailPlantillaUseCase } from '../application/use-cases/mail-plantilla/eliminar-historial-mail-plantilla.use-case';
import { EliminarMailPlantillaUseCase } from '../application/use-cases/mail-plantilla/eliminar-mail-plantilla.use-case';
import { ListarHistorialMailPlantillaUseCase } from '../application/use-cases/mail-plantilla/listar-historial-mail-plantilla.use-case';
import { ListarMailPlantillasUseCase } from '../application/use-cases/mail-plantilla/listar-mail-plantillas.use-case';
import { ObtenerHistorialMailPlantillaUseCase } from '../application/use-cases/mail-plantilla/obtener-historial-mail-plantilla.use-case';
import { ObtenerMailPlantillaUseCase } from '../application/use-cases/mail-plantilla/obtener-mail-plantilla.use-case';
import { PreviewMailPlantillaUseCase } from '../application/use-cases/mail-plantilla/preview-mail-plantilla.use-case';
import { SembrarMailPlantillasSistemaUseCase } from '../application/use-cases/mail-plantilla/sembrar-mail-plantillas-sistema.use-case';
import { TestSendMailPlantillaUseCase } from '../application/use-cases/mail-plantilla/test-send-mail-plantilla.use-case';
import { EnqueueOutboundEmailUseCase } from '../application/use-cases/mail/enqueue-outbound-email.use-case';
import { EnviarCorreoBienvenidaUseCase } from '../application/use-cases/mail/enviar-correo-bienvenida.use-case';
import { SendOutboundEmailUseCase } from '../application/use-cases/mail/send-outbound-email.use-case';
import { AsignarRolMenuUseCase } from '../application/use-cases/menu-gestion/asignar-rol-menu.use-case';
import { AsignarRolesMenuUseCase } from '../application/use-cases/menu-gestion/asignar-roles-menu.use-case';
import { ClonarMenuUseCase } from '../application/use-cases/menu-gestion/clonar-menu.use-case';
import { CrearMenuUseCase } from '../application/use-cases/menu-gestion/crear-menu.use-case';
import { EditarMenuUseCase } from '../application/use-cases/menu-gestion/editar-menu.use-case';
import { EliminarMenuUseCase } from '../application/use-cases/menu-gestion/eliminar-menu.use-case';
import { ListarMenuPadresDisponiblesUseCase } from '../application/use-cases/menu-gestion/listar-menu-padres-disponibles.use-case';
import { ListarMenusTreeUseCase } from '../application/use-cases/menu-gestion/listar-menus-tree.use-case';
import { ListarMenusUseCase } from '../application/use-cases/menu-gestion/listar-menus.use-case';
import { ListarRolesDisponiblesMenuUseCase } from '../application/use-cases/menu-gestion/listar-roles-disponibles-menu.use-case';
import { ListarRolesMenuUseCase } from '../application/use-cases/menu-gestion/listar-roles-menu.use-case';
import { MoverMenuUseCase } from '../application/use-cases/menu-gestion/mover-menu.use-case';
import { ObtenerDetalleMenuUseCase } from '../application/use-cases/menu-gestion/obtener-detalle-menu.use-case';
import { ObtenerMenuUseCase } from '../application/use-cases/menu-gestion/obtener-menu.use-case';
import { RemoverRolMenuUseCase } from '../application/use-cases/menu-gestion/remover-rol-menu.use-case';
import { ReordenarMenuUseCase } from '../application/use-cases/menu-gestion/reordenar-menu.use-case';
import { SincronizarRolesMenuUseCase } from '../application/use-cases/menu-gestion/sincronizar-roles-menu.use-case';
import { EliminarNotificacionUseCase } from '../application/use-cases/notificaciones/eliminar-notificacion.use-case';
import { EliminarTodasNotificacionesUseCase } from '../application/use-cases/notificaciones/eliminar-todas-notificaciones.use-case';
import { MarcarNotificacionesEntregadasUseCase } from '../application/use-cases/notificaciones/marcar-notificaciones-entregadas.use-case';
import { ObtenerNotificacionesPendientesUseCase } from '../application/use-cases/notificaciones/obtener-notificaciones-pendientes.use-case';
import { ObtenerNotificacionesUseCase } from '../application/use-cases/notificaciones/obtener-notificaciones.use-case';
import { CrearNovedadLanzamientoUseCase } from '../application/use-cases/novedad/crear-novedad-lanzamiento.use-case';
import { CrearNovedadTarjetaUseCase } from '../application/use-cases/novedad/crear-novedad-tarjeta.use-case';
import { EditarNovedadLanzamientoUseCase } from '../application/use-cases/novedad/editar-novedad-lanzamiento.use-case';
import { EditarNovedadTarjetaUseCase } from '../application/use-cases/novedad/editar-novedad-tarjeta.use-case';
import { EliminarNovedadLanzamientoUseCase } from '../application/use-cases/novedad/eliminar-novedad-lanzamiento.use-case';
import { EliminarNovedadTarjetaUseCase } from '../application/use-cases/novedad/eliminar-novedad-tarjeta.use-case';
import { ListarNovedadLanzamientosUseCase } from '../application/use-cases/novedad/listar-novedad-lanzamientos.use-case';
import { MarcarNovedadVistaUseCase } from '../application/use-cases/novedad/marcar-novedad-vista.use-case';
import { ObtenerNovedadLanzamientoUseCase } from '../application/use-cases/novedad/obtener-novedad-lanzamiento.use-case';
import { ObtenerNovedadPendientesUsuarioUseCase } from '../application/use-cases/novedad/obtener-novedad-pendientes-usuario.use-case';
import { SincronizarRolesNovedadUseCase } from '../application/use-cases/novedad/sincronizar-roles-novedad.use-case';
import { GenerarPdfDemoUseCase } from '../application/use-cases/pdf/generar-pdf-demo.use-case';
import { CrearPermisoUseCase } from '../application/use-cases/permiso/crear-permiso.use-case';
import { EditarPermisoUseCase } from '../application/use-cases/permiso/editar-permiso.use-case';
import { EliminarPermisoUseCase } from '../application/use-cases/permiso/eliminar-permiso.use-case';
import { ListarPermisosUseCase } from '../application/use-cases/permiso/listar-permisos.use-case';
import { ObtenerPermisoUseCase } from '../application/use-cases/permiso/obtener-permiso.use-case';
import { ActualizarDocumentoProyectoUseCase } from '../application/use-cases/proyecto/actualizar-documento-proyecto.use-case';
import { ActualizarEntregableProyectoUseCase } from '../application/use-cases/proyecto/actualizar-entregable-proyecto.use-case';
import { ActualizarNivelAccesoProyectoUseCase } from '../application/use-cases/proyecto/actualizar-nivel-acceso-proyecto.use-case';
import { AsignarAccesoProyectoUseCase } from '../application/use-cases/proyecto/asignar-acceso-proyecto.use-case';
import { CrearDocumentoProyectoUseCase } from '../application/use-cases/proyecto/crear-documento-proyecto.use-case';
import { CrearEntregableProyectoUseCase } from '../application/use-cases/proyecto/crear-entregable-proyecto.use-case';
import { CrearProyectoUseCase } from '../application/use-cases/proyecto/crear-proyecto.use-case';
import { EditarProyectoUseCase } from '../application/use-cases/proyecto/editar-proyecto.use-case';
import { EliminarDocumentoProyectoUseCase } from '../application/use-cases/proyecto/eliminar-documento-proyecto.use-case';
import { EliminarEntregableProyectoUseCase } from '../application/use-cases/proyecto/eliminar-entregable-proyecto.use-case';
import { EliminarProyectoUseCase } from '../application/use-cases/proyecto/eliminar-proyecto.use-case';
import { GuardarCoordinadoresProyectoUseCase } from '../application/use-cases/proyecto/guardar-coordinadores-proyecto.use-case';
import { ListarCoordinadoresProyectoUseCase } from '../application/use-cases/proyecto/listar-coordinadores-proyecto.use-case';
import { ListarDocumentosProyectoUseCase } from '../application/use-cases/proyecto/listar-documentos-proyecto.use-case';
import { ListarEntregablesProyectoUseCase } from '../application/use-cases/proyecto/listar-entregables-proyecto.use-case';
import { ListarEntregablesSelectProyectoUseCase } from '../application/use-cases/proyecto/listar-entregables-select-proyecto.use-case';
import { ListarEstadisticasProyectosPorEstadoUseCase } from '../application/use-cases/proyecto/listar-estadisticas-proyectos-por-estado.use-case';
import { ListarProyectosUseCase } from '../application/use-cases/proyecto/listar-proyectos.use-case';
import { ListarUsuariosDisponiblesProyectoUseCase } from '../application/use-cases/proyecto/listar-usuarios-disponibles-proyecto.use-case';
import { ListarUsuariosProyectoUseCase } from '../application/use-cases/proyecto/listar-usuarios-proyecto.use-case';
import { ObtenerEntregableProyectoUseCase } from '../application/use-cases/proyecto/obtener-entregable-proyecto.use-case';
import { ObtenerProyectoUseCase } from '../application/use-cases/proyecto/obtener-proyecto.use-case';
import { RemoverAccesoProyectoUseCase } from '../application/use-cases/proyecto/remover-acceso-proyecto.use-case';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { AsignarPermisoRolUseCase } from '../application/use-cases/rol/asignar-permiso-rol.use-case';
import { AsignarPermisosRolUseCase } from '../application/use-cases/rol/asignar-permisos-rol.use-case';
import { CrearRolUseCase } from '../application/use-cases/rol/crear-rol.use-case';
import { EditarRolUseCase } from '../application/use-cases/rol/editar-rol.use-case';
import { EliminarRolUseCase } from '../application/use-cases/rol/eliminar-rol.use-case';
import { GestionarRolesUsuarioUseCase } from '../application/use-cases/rol/gestionar-roles-usuario.use-case';
import { ListarPermisosDisponiblesUseCase } from '../application/use-cases/rol/listar-permisos-disponibles.use-case';
import { ListarPermisosRolUseCase } from '../application/use-cases/rol/listar-permisos-rol.use-case';
import { ListarRolesForListUseCase } from '../application/use-cases/rol/listar-roles-for-list.use-case';
import { ListarRolesUseCase } from '../application/use-cases/rol/listar-roles.use-case';
import { ObtenerDetalleRolUseCase } from '../application/use-cases/rol/obtener-detalle-rol.use-case';
import { ObtenerRolUseCase } from '../application/use-cases/rol/obtener-rol.use-case';
import { RemoverPermisoRolUseCase } from '../application/use-cases/rol/remover-permiso-rol.use-case';
import { SincronizarPermisosRolUseCase } from '../application/use-cases/rol/sincronizar-permisos-rol.use-case';
import { ActivarTrabajadorUseCase } from '../application/use-cases/trabajador/activar-trabajador.use-case';
import { ActualizarContratoTrabajadorUseCase } from '../application/use-cases/trabajador/actualizar-contrato-trabajador.use-case';
import { CrearContratoTrabajadorUseCase } from '../application/use-cases/trabajador/crear-contrato-trabajador.use-case';
import { CrearTrabajadorUseCase } from '../application/use-cases/trabajador/crear-trabajador.use-case';
import { EditarTrabajadorUseCase } from '../application/use-cases/trabajador/editar-trabajador.use-case';
import { EliminarContratoTrabajadorUseCase } from '../application/use-cases/trabajador/eliminar-contrato-trabajador.use-case';
import { EliminarTrabajadorUseCase } from '../application/use-cases/trabajador/eliminar-trabajador.use-case';
import { ListarAdministrativosUseCase } from '../application/use-cases/trabajador/listar-administrativos.use-case';
import { ListarTrabajadoresUseCase } from '../application/use-cases/trabajador/listar-trabajadores.use-case';
import { ObtenerFirmaTrabajadorUseCase } from '../application/use-cases/trabajador/obtener-firma-trabajador.use-case';
import { ObtenerFotoPerfilTrabajadorUseCase } from '../application/use-cases/trabajador/obtener-foto-perfil-trabajador.use-case';
import { ObtenerTrabajadorUseCase } from '../application/use-cases/trabajador/obtener-trabajador.use-case';
import { ResetearContrasenaUseCase } from '../application/use-cases/trabajador/resetear-contrasena.use-case';
import { SubirFirmaTrabajadorUseCase } from '../application/use-cases/trabajador/subir-firma-trabajador.use-case';
import { ListarDepartamentosUseCase } from '../application/use-cases/ubicacion/listar-departamentos.use-case';
import { ListarDistritosUseCase } from '../application/use-cases/ubicacion/listar-distritos.use-case';
import { ListarPaisesUseCase } from '../application/use-cases/ubicacion/listar-paises.use-case';
import { ListarProvinciasUseCase } from '../application/use-cases/ubicacion/listar-provincias.use-case';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../domain/repositories/acc-document-config.repository.interface';
import { ACC_RECURSOS_REPOSITORY } from '../domain/repositories/acc-recursos.repository.interface';
import { ACC_RESOURCES_REPOSITORY } from '../domain/repositories/acc-resources.repository.interface';
import { ACC_VISOR_ELEMENTO_FOTO_REPOSITORY } from '../domain/repositories/acc-visor-elemento-foto.repository.interface';
import { ACC_VISOR_MARCA_REVISION_REPOSITORY } from '../domain/repositories/acc-visor-marca-revision.repository.interface';
import { ACC_REPOSITORY } from '../domain/repositories/acc.repository.interface';
import { AUDITORIA_REPOSITORY } from '../domain/repositories/auditoria.repository.interface';
import { AUTH_REPOSITORY } from '../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../domain/repositories/control-operativo.repository.interface';
import { DASHBOARD_REPOSITORY } from '../domain/repositories/dashboard.repository.interface';
import { EMAIL_DISPATCH_LOG_REPOSITORY } from '../domain/repositories/email-dispatch-log.repository.interface';
import { EMPRESA_REPOSITORY } from '../domain/repositories/empresa.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../domain/repositories/mail-plantilla-correo.repository.interface';
import { MENU_GESTION_REPOSITORY } from '../domain/repositories/menu-gestion.repository.interface';
import { MENU_REPOSITORY } from '../domain/repositories/menu.repository.interface';
import { NOTIFICACIONES_REPOSITORY } from '../domain/repositories/notificaciones.repository.interface';
import { NOVEDAD_REPOSITORY } from '../domain/repositories/novedad.repository.interface';
import { PERMISO_REPOSITORY } from '../domain/repositories/permiso.repository.interface';
import { PROYECTO_REPOSITORY } from '../domain/repositories/proyecto.repository.interface';
import { ROL_REPOSITORY } from '../domain/repositories/rol.repository.interface';
import { SESION_REPOSITORY } from '../domain/repositories/sesion.repository.interface';
import { TRABAJADOR_REPOSITORY } from '../domain/repositories/trabajador.repository.interface';
import { UBICACION_REPOSITORY } from '../domain/repositories/ubicacion.repository.interface';
import { USUARIOS_REPOSITORY } from '../domain/repositories/usuarios.repository.interface';
import { HTML_PDF_GENERATOR } from '../application/ports/html-pdf-generator.interface';
import { MAIL_JOB_PUBLISHER } from '../application/ports/mail-job-publisher.interface';
import { MAIL_RENDERER } from '../application/ports/mail-renderer.interface';
import { MAIL_TRANSPORT } from '../application/ports/mail-transport.interface';
import { BroadcastService } from '../infrastructure/events/broadcast.service';
import { SharpAccProjectImagePreparerService } from '../infrastructure/images/sharp-acc-project-image-preparer.service';
import { MailPlantillaRenderService } from '../infrastructure/mail/mail-plantilla-render.service';
import { MjmlCompilerService } from '../infrastructure/mail/mjml-compiler.service';
import { PostgresInternalReviewsRepository } from '../infrastructure/repositories/internal-reviews.repository';
import { applicationDependency } from '../infrastructure/runtime/application-failure.adapter';
import {
  ArchiverZipArchive,
  BcryptPasswordHasher,
  EnvironmentApplicationSettings,
  NestLoggerFactory,
} from '../infrastructure/runtime/application-runtime.adapters';
import { AutodeskApiService } from '../infrastructure/services/autodesk-api.service';
import { ExportacionIncidenciasService } from '../infrastructure/services/exportacion-incidencias.service';
import { ExportacionPermisosCarpetaPdfService } from '../infrastructure/services/exportacion-permisos-carpeta-pdf.service';
import { ExportacionRegistroArchivosPdfService } from '../infrastructure/services/exportacion-registro-archivos-pdf.service';
import { ExportacionRevisionDetallePdfService } from '../infrastructure/services/exportacion-revision-detalle-pdf.service';
import { ExportacionRevisionesPdfService } from '../infrastructure/services/exportacion-revisiones-pdf.service';
import { NovedadTarjetaMediaStorageService } from '../infrastructure/services/novedad-tarjeta-media-storage.service';
import { ProfilePhotoStorageService } from '../infrastructure/services/profile-photo-storage.service';
import { WorkerSignatureStorageService } from '../infrastructure/services/worker-signature-storage.service';
import { MinioStorageService } from '../infrastructure/storage/minio-storage.service';
import { ActivityDocumentsAdapter } from '../infrastructure/word/activity-documents.adapter';

/** Ensamblaje de dependencias fuera de aplicación; los casos de uso son clases TypeScript puras. */
const dependencies = new Map<Type<any>, InjectionToken[]>([
  [ListarCalendariosUseCase, [CALENDARIOS_REPOSITORY]],
  [ObtenerCalendarioUseCase, [CALENDARIOS_REPOSITORY]],
  [CrearCalendarioUseCase, [CALENDARIOS_REPOSITORY]],
  [ActualizarCalendarioUseCase, [CALENDARIOS_REPOSITORY]],
  [DuplicarCalendarioUseCase, [CALENDARIOS_REPOSITORY]],
  [CrearVersionCalendarioUseCase, [CALENDARIOS_REPOSITORY]],
  [GuardarSemanaCalendarioUseCase, [CALENDARIOS_REPOSITORY]],
  [GuardarExcepcionCalendarioUseCase, [CALENDARIOS_REPOSITORY]],
  [EliminarExcepcionCalendarioUseCase, [CALENDARIOS_REPOSITORY]],
  [PublicarVersionCalendarioUseCase, [CALENDARIOS_REPOSITORY]],
  [CambiarEstadoCalendarioUseCase, [CALENDARIOS_REPOSITORY]],
  [ObtenerDisponibilidadCalendarioUseCase, [CALENDARIOS_REPOSITORY]],
  [ListarPaisesUseCase, [UBICACION_REPOSITORY]],
  [ListarDepartamentosUseCase, [UBICACION_REPOSITORY]],
  [ListarProvinciasUseCase, [UBICACION_REPOSITORY]],
  [ListarDistritosUseCase, [UBICACION_REPOSITORY]],
  [MailService, [EnqueueOutboundEmailUseCase]],
  [
    LoginUseCase,
    [
      AUTH_REPOSITORY,
      SESION_REPOSITORY,
      JwtService,
      MinioStorageService,
      BcryptPasswordHasher,
    ],
  ],
  [RegisterUseCase, [AUTH_REPOSITORY, BcryptPasswordHasher]],
  [CallbackAutorizacionUseCase, [ACC_REPOSITORY, AutodeskApiService]],
  [
    CronRefrescarTokensAccUseCase,
    [ACC_REPOSITORY, RefrescarToken3LeggedUseCase, NestLoggerFactory],
  ],
  [GenerarUrlAutorizacionUseCase, [AutodeskApiService]],
  [ObtenerMiTokenUseCase, [ACC_REPOSITORY, AutodeskApiService]],
  [ObtenerToken2LeggedUseCase, [AutodeskApiService]],
  [RefrescarToken3LeggedUseCase, [ACC_REPOSITORY, AutodeskApiService]],
  [RevocarTokenUseCase, [ACC_REPOSITORY]],
  [ValidarExpiracionUseCase, [AutodeskApiService]],
  [ActualizarRecursoUseCase, [ACC_RECURSOS_REPOSITORY, AUDITORIA_REPOSITORY]],
  [GuardarRecursoUseCase, [ACC_RECURSOS_REPOSITORY, AUDITORIA_REPOSITORY]],
  [ObtenerRecursoUseCase, [ACC_RECURSOS_REPOSITORY]],
  [ObtenerRecursosHijosUseCase, [ACC_RECURSOS_REPOSITORY]],
  [ObtenerRecursosProyectoUseCase, [ACC_RECURSOS_REPOSITORY]],
  [ObtenerRecursosUsuarioUseCase, [ACC_RECURSOS_REPOSITORY]],
  [ListarAuditoriasUseCase, [AUDITORIA_REPOSITORY]],
  [ObtenerAuditoriaPorIdUseCase, [AUDITORIA_REPOSITORY]],
  [ObtenerEstadisticasUseCase, [AUDITORIA_REPOSITORY]],
  [ObtenerHistorialEntidadUseCase, [AUDITORIA_REPOSITORY]],
  [ObtenerHistorialUsuarioUseCase, [AUDITORIA_REPOSITORY]],
  [
    ActualizarCredencialesUseCase,
    [AUTH_REPOSITORY, JwtService, BcryptPasswordHasher],
  ],
  [
    CambiarContrasenaPerfilUseCase,
    [AUTH_REPOSITORY, JwtService, BcryptPasswordHasher],
  ],
  [CerrarTodasSesionesUseCase, [SESION_REPOSITORY, JwtService]],
  [LogoutUseCase, [SESION_REPOSITORY, AUTH_REPOSITORY, JwtService]],
  [ObtenerEstadisticasUsuariosUseCase, [AUTH_REPOSITORY]],
  [
    ObtenerPerfilUsuarioUseCase,
    [AUTH_REPOSITORY, JwtService, MinioStorageService],
  ],
  [
    ObtenerPerfilUseCase,
    [SESION_REPOSITORY, AUTH_REPOSITORY, JwtService, MinioStorageService],
  ],
  [
    RefreshTokenUseCase,
    [SESION_REPOSITORY, AUTH_REPOSITORY, JwtService, ConfigService],
  ],
  [
    SubirFotoPerfilUseCase,
    [
      AUTH_REPOSITORY,
      JwtService,
      ProfilePhotoStorageService,
      MinioStorageService,
    ],
  ],
  [ValidarSesionUseCase, [SESION_REPOSITORY]],
  [
    ActualizarActividadUseCase,
    [
      CONTROL_OPERATIVO_REPOSITORY,
      PROYECTO_REPOSITORY,
      BroadcastService,
      NestLoggerFactory,
    ],
  ],
  [ActualizarEstadoJornadaUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [HabilitarJornadasUsuariosUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [CerrarHabilitacionesVencidasUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [AgregarEvidenciasActividadUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [
    CrearActividadUseCase,
    [
      CONTROL_OPERATIVO_REPOSITORY,
      PROYECTO_REPOSITORY,
      BroadcastService,
      NestLoggerFactory,
    ],
  ],
  [CrearJornadaUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [
    CronAlertaActividadesSinValidarUseCase,
    [CONTROL_OPERATIVO_REPOSITORY, BroadcastService, NestLoggerFactory],
  ],
  [CronCierreJornadasUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [EliminarActividadUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [
    EliminarEvidenciaActividadUseCase,
    [CONTROL_OPERATIVO_REPOSITORY, MinioStorageService],
  ],
  [
    ExportarActividadesJornadasWordMasivoUseCase,
    [
      ExportarActividadesJornadasWordUseCase,
      NestLoggerFactory,
      ArchiverZipArchive,
    ],
  ],
  [
    ExportarActividadesJornadasWordUseCase,
    [CONTROL_OPERATIVO_REPOSITORY, ActivityDocumentsAdapter],
  ],
  [ListarActividadesObservadasSubsanarUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [
    ListarActividadesValidacionUseCase,
    [CONTROL_OPERATIVO_REPOSITORY, AUTH_REPOSITORY],
  ],
  [ListarActividadesUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [ListarDesempenoUseCase, [CONTROL_OPERATIVO_REPOSITORY, AUTH_REPOSITORY]],
  [ListarJornadasTrabajadorUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [
    ListarLideresEquipoReporteGeneralUseCase,
    [CONTROL_OPERATIVO_REPOSITORY, AUTH_REPOSITORY],
  ],
  [ListarObservacionesActividadUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [ListarProyectosAccesoTrabajadorUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [ListarProyectosParaValidacionUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [
    ListarReporteGeneralUseCase,
    [CONTROL_OPERATIVO_REPOSITORY, AUTH_REPOSITORY],
  ],
  [
    ListarReporteHorasMesProyectoTrabajadorUseCase,
    [CONTROL_OPERATIVO_REPOSITORY, AUTH_REPOSITORY],
  ],
  [
    ListarReporteHorasRangoDetalleProyectoUseCase,
    [CONTROL_OPERATIVO_REPOSITORY, AUTH_REPOSITORY],
  ],
  [ListarTrabajadoresParaFiltroUseCase, [CONTROL_OPERATIVO_REPOSITORY]],
  [
    ListarTrabajadoresPorProyectoUseCase,
    [CONTROL_OPERATIVO_REPOSITORY, AUTH_REPOSITORY],
  ],
  [
    ListarTrabajadoresSinActividadesHoyUseCase,
    [CONTROL_OPERATIVO_REPOSITORY, AUTH_REPOSITORY],
  ],
  [
    ListarTrabajadoresSinJornadaHoyUseCase,
    [CONTROL_OPERATIVO_REPOSITORY, AUTH_REPOSITORY],
  ],
  [ListarValorizacionUseCase, [CONTROL_OPERATIVO_REPOSITORY, AUTH_REPOSITORY]],
  [ObtenerActividadUseCase, [CONTROL_OPERATIVO_REPOSITORY, AUTH_REPOSITORY]],
  [
    ValidarActividadUseCase,
    [
      CONTROL_OPERATIVO_REPOSITORY,
      AUTH_REPOSITORY,
      BroadcastService,
      NestLoggerFactory,
    ],
  ],
  [ObtenerCantidadActividadesObservadasUseCase, [DASHBOARD_REPOSITORY]],
  [ObtenerCantidadActividadesPendientesUseCase, [DASHBOARD_REPOSITORY]],
  [ObtenerCantidadActividadesRechazadasUseCase, [DASHBOARD_REPOSITORY]],
  [ObtenerCantidadJornadasCompletasSemanaUseCase, [DASHBOARD_REPOSITORY]],
  [ObtenerCantidadProyectosVigentesUseCase, [DASHBOARD_REPOSITORY]],
  [ObtenerCantidadTrabajadoresActivosUseCase, [DASHBOARD_REPOSITORY]],
  [ObtenerCantidadTrabajadoresConectadoSemanaUseCase, [DASHBOARD_REPOSITORY]],
  [ObtenerCantidadTrabajadoresPorProyectoUseCase, [DASHBOARD_REPOSITORY]],
  [ObtenerHorasEsperadasVsRegistradasMesUseCase, [DASHBOARD_REPOSITORY]],
  [ObtenerProyectosConProgresoUseCase, [DASHBOARD_REPOSITORY]],
  [ObtenerTopTrabajadoresHorasMesUseCase, [DASHBOARD_REPOSITORY]],
  [ObtenerHubsUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerItemPorIdUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerItemsUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerProyectoPorIdUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerProyectosUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerVersionesItemUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [
    EnviarCorreoBienvenidaDemoUseCase,
    [TRABAJADOR_REPOSITORY, EnviarCorreoBienvenidaUseCase],
  ],
  [CrearEmpresaUseCase, [EMPRESA_REPOSITORY]],
  [EditarEmpresaUseCase, [EMPRESA_REPOSITORY]],
  [EliminarEmpresaUseCase, [EMPRESA_REPOSITORY]],
  [ListarEmpresasUseCase, [EMPRESA_REPOSITORY, MinioStorageService]],
  [ObtenerEmpresaUseCase, [EMPRESA_REPOSITORY, MinioStorageService]],
  [CrearOpcionListaUseCase, [MENU_REPOSITORY]],
  [ListarMenuOpcionesUseCase, [MENU_REPOSITORY]],
  [ListarMenuRecursivoUseCase, [MENU_REPOSITORY, JwtService]],
  [ObtenerCatalogosTrabajadorUseCase, [MENU_REPOSITORY]],
  [ObtenerMenuOpcionUseCase, [MENU_REPOSITORY]],
  [ObtenerOpcionesListaUseCase, [MENU_REPOSITORY]],
  [
    ActualizarAdjuntoBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ActualizarIncidenciaBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    CrearAdjuntoBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    CrearComentarioBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    CrearIncidenciaBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerAdjuntosBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerCategoriasRaizBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerComentariosBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerDefinicionesAtributosBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerIncidenciaPorIdBim360UseCase,
    [
      AutodeskApiService,
      obtener_token_valido_helper,
      AUDITORIA_REPOSITORY,
      ACC_RECURSOS_REPOSITORY,
    ],
  ],
  [
    ObtenerIncidenciasPorDocumentoBim360UseCase,
    [
      AutodeskApiService,
      obtener_token_valido_helper,
      AUDITORIA_REPOSITORY,
      ACC_RECURSOS_REPOSITORY,
    ],
  ],
  [
    ObtenerIncidenciasBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerMapeosAtributosBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerPerfilUsuarioBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerTiposIncidenciasBim360UseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [EnqueueOutboundEmailUseCase, [MAIL_JOB_PUBLISHER]],
  [
    EnviarCorreoBienvenidaUseCase,
    [MailService, ConfigService, NestLoggerFactory],
  ],
  [
    SendOutboundEmailUseCase,
    [
      MAIL_RENDERER,
      MAIL_TRANSPORT,
      EMAIL_DISPATCH_LOG_REPOSITORY,
      ConfigService,
      NestLoggerFactory,
    ],
  ],
  [ListarCoberturaEnviosMailUseCase, [EMAIL_DISPATCH_LOG_REPOSITORY]],
  [ListarLogsEnvioMailUseCase, [EMAIL_DISPATCH_LOG_REPOSITORY]],
  [
    ReenviarMailEnvioUseCase,
    [TRABAJADOR_REPOSITORY, EnviarCorreoBienvenidaUseCase],
  ],
  [
    ReenviarPendientesMailEnvioUseCase,
    [EMAIL_DISPATCH_LOG_REPOSITORY, ReenviarMailEnvioUseCase],
  ],
  [
    ActualizarMailPlantillaUseCase,
    [MAIL_PLANTILLA_CORREO_REPOSITORY, MjmlCompilerService],
  ],
  [
    ActualizarVariablesPruebaMailPlantillaUseCase,
    [MAIL_PLANTILLA_CORREO_REPOSITORY],
  ],
  [
    CrearMailPlantillaUseCase,
    [MAIL_PLANTILLA_CORREO_REPOSITORY, MjmlCompilerService],
  ],
  [EliminarHistorialMailPlantillaUseCase, [MAIL_PLANTILLA_CORREO_REPOSITORY]],
  [EliminarMailPlantillaUseCase, [MAIL_PLANTILLA_CORREO_REPOSITORY]],
  [ListarHistorialMailPlantillaUseCase, [MAIL_PLANTILLA_CORREO_REPOSITORY]],
  [ListarMailPlantillasUseCase, [MAIL_PLANTILLA_CORREO_REPOSITORY]],
  [ObtenerHistorialMailPlantillaUseCase, [MAIL_PLANTILLA_CORREO_REPOSITORY]],
  [ObtenerMailPlantillaUseCase, [MAIL_PLANTILLA_CORREO_REPOSITORY]],
  [
    PreviewMailPlantillaUseCase,
    [MAIL_PLANTILLA_CORREO_REPOSITORY, MailPlantillaRenderService],
  ],
  [SembrarMailPlantillasSistemaUseCase, [MAIL_PLANTILLA_CORREO_REPOSITORY]],
  [
    TestSendMailPlantillaUseCase,
    [
      MAIL_PLANTILLA_CORREO_REPOSITORY,
      MailPlantillaRenderService,
      MAIL_TRANSPORT,
      EMAIL_DISPATCH_LOG_REPOSITORY,
      ConfigService,
      NestLoggerFactory,
    ],
  ],
  [AsignarRolMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [AsignarRolesMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [ClonarMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [CrearMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [EditarMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [EliminarMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [ListarMenuPadresDisponiblesUseCase, [MENU_GESTION_REPOSITORY]],
  [ListarMenusTreeUseCase, [MENU_GESTION_REPOSITORY]],
  [ListarMenusUseCase, [MENU_GESTION_REPOSITORY]],
  [ListarRolesDisponiblesMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [ListarRolesMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [MoverMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [ObtenerDetalleMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [ObtenerMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [RemoverRolMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [ReordenarMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [SincronizarRolesMenuUseCase, [MENU_GESTION_REPOSITORY]],
  [EliminarNotificacionUseCase, [NOTIFICACIONES_REPOSITORY]],
  [EliminarTodasNotificacionesUseCase, [NOTIFICACIONES_REPOSITORY]],
  [MarcarNotificacionesEntregadasUseCase, [NOTIFICACIONES_REPOSITORY]],
  [ObtenerNotificacionesPendientesUseCase, [NOTIFICACIONES_REPOSITORY]],
  [ObtenerNotificacionesUseCase, [NOTIFICACIONES_REPOSITORY]],
  [CrearNovedadLanzamientoUseCase, [NOVEDAD_REPOSITORY]],
  [
    CrearNovedadTarjetaUseCase,
    [NOVEDAD_REPOSITORY, NovedadTarjetaMediaStorageService],
  ],
  [EditarNovedadLanzamientoUseCase, [NOVEDAD_REPOSITORY]],
  [
    EditarNovedadTarjetaUseCase,
    [NOVEDAD_REPOSITORY, NovedadTarjetaMediaStorageService],
  ],
  [EliminarNovedadLanzamientoUseCase, [NOVEDAD_REPOSITORY]],
  [
    EliminarNovedadTarjetaUseCase,
    [NOVEDAD_REPOSITORY, NovedadTarjetaMediaStorageService],
  ],
  [ListarNovedadLanzamientosUseCase, [NOVEDAD_REPOSITORY]],
  [MarcarNovedadVistaUseCase, [NOVEDAD_REPOSITORY]],
  [ObtenerNovedadLanzamientoUseCase, [NOVEDAD_REPOSITORY, MinioStorageService]],
  [
    ObtenerNovedadPendientesUsuarioUseCase,
    [NOVEDAD_REPOSITORY, MinioStorageService],
  ],
  [SincronizarRolesNovedadUseCase, [NOVEDAD_REPOSITORY]],
  [GenerarPdfDemoUseCase, [HTML_PDF_GENERATOR]],
  [CrearPermisoUseCase, [PERMISO_REPOSITORY]],
  [EditarPermisoUseCase, [PERMISO_REPOSITORY]],
  [EliminarPermisoUseCase, [PERMISO_REPOSITORY]],
  [ListarPermisosUseCase, [PERMISO_REPOSITORY]],
  [ObtenerPermisoUseCase, [PERMISO_REPOSITORY]],
  [ActualizarDocumentoProyectoUseCase, [PROYECTO_REPOSITORY]],
  [
    ActualizarEntregableProyectoUseCase,
    [PROYECTO_REPOSITORY, BroadcastService, NestLoggerFactory],
  ],
  [ActualizarNivelAccesoProyectoUseCase, [PROYECTO_REPOSITORY]],
  [AsignarAccesoProyectoUseCase, [PROYECTO_REPOSITORY]],
  [CrearDocumentoProyectoUseCase, [PROYECTO_REPOSITORY]],
  [
    CrearEntregableProyectoUseCase,
    [PROYECTO_REPOSITORY, BroadcastService, NestLoggerFactory],
  ],
  [CrearProyectoUseCase, [PROYECTO_REPOSITORY]],
  [EditarProyectoUseCase, [PROYECTO_REPOSITORY]],
  [EliminarDocumentoProyectoUseCase, [PROYECTO_REPOSITORY]],
  [EliminarEntregableProyectoUseCase, [PROYECTO_REPOSITORY]],
  [EliminarProyectoUseCase, [PROYECTO_REPOSITORY]],
  [GuardarCoordinadoresProyectoUseCase, [PROYECTO_REPOSITORY]],
  [ListarCoordinadoresProyectoUseCase, [PROYECTO_REPOSITORY]],
  [ListarDocumentosProyectoUseCase, [PROYECTO_REPOSITORY]],
  [ListarEntregablesProyectoUseCase, [PROYECTO_REPOSITORY]],
  [ListarEntregablesSelectProyectoUseCase, [PROYECTO_REPOSITORY]],
  [ListarEstadisticasProyectosPorEstadoUseCase, [PROYECTO_REPOSITORY]],
  [ListarProyectosUseCase, [PROYECTO_REPOSITORY]],
  [ListarUsuariosDisponiblesProyectoUseCase, [PROYECTO_REPOSITORY]],
  [ListarUsuariosProyectoUseCase, [PROYECTO_REPOSITORY]],
  [ObtenerEntregableProyectoUseCase, [PROYECTO_REPOSITORY]],
  [ObtenerProyectoUseCase, [PROYECTO_REPOSITORY]],
  [RemoverAccesoProyectoUseCase, [PROYECTO_REPOSITORY]],
  [AsignarPermisoRolUseCase, [ROL_REPOSITORY]],
  [AsignarPermisosRolUseCase, [ROL_REPOSITORY]],
  [CrearRolUseCase, [ROL_REPOSITORY]],
  [EditarRolUseCase, [ROL_REPOSITORY]],
  [EliminarRolUseCase, [ROL_REPOSITORY]],
  [GestionarRolesUsuarioUseCase, [ROL_REPOSITORY, BroadcastService]],
  [ListarPermisosDisponiblesUseCase, [ROL_REPOSITORY]],
  [ListarPermisosRolUseCase, [ROL_REPOSITORY]],
  [ListarRolesForListUseCase, [ROL_REPOSITORY]],
  [ListarRolesUseCase, [ROL_REPOSITORY]],
  [ObtenerDetalleRolUseCase, [ROL_REPOSITORY]],
  [ObtenerRolUseCase, [ROL_REPOSITORY]],
  [RemoverPermisoRolUseCase, [ROL_REPOSITORY]],
  [SincronizarPermisosRolUseCase, [ROL_REPOSITORY]],
  [ActivarTrabajadorUseCase, [TRABAJADOR_REPOSITORY]],
  [ActualizarContratoTrabajadorUseCase, [TRABAJADOR_REPOSITORY]],
  [CrearContratoTrabajadorUseCase, [TRABAJADOR_REPOSITORY]],
  [
    CrearTrabajadorUseCase,
    [TRABAJADOR_REPOSITORY, EnviarCorreoBienvenidaUseCase],
  ],
  [EditarTrabajadorUseCase, [TRABAJADOR_REPOSITORY]],
  [EliminarContratoTrabajadorUseCase, [TRABAJADOR_REPOSITORY]],
  [EliminarTrabajadorUseCase, [TRABAJADOR_REPOSITORY]],
  [ListarAdministrativosUseCase, [TRABAJADOR_REPOSITORY]],
  [ListarTrabajadoresUseCase, [TRABAJADOR_REPOSITORY]],
  [ObtenerFirmaTrabajadorUseCase, [TRABAJADOR_REPOSITORY, MinioStorageService]],
  [
    ObtenerFotoPerfilTrabajadorUseCase,
    [TRABAJADOR_REPOSITORY, MinioStorageService],
  ],
  [ObtenerTrabajadorUseCase, [TRABAJADOR_REPOSITORY]],
  [ResetearContrasenaUseCase, [TRABAJADOR_REPOSITORY]],
  [
    SubirFirmaTrabajadorUseCase,
    [
      TRABAJADOR_REPOSITORY,
      JwtService,
      WorkerSignatureStorageService,
      MinioStorageService,
    ],
  ],
  [ActualizarUsuarioUseCase, [AutodeskApiService]],
  [BuscarUsuariosUseCase, [AutodeskApiService]],
  [CrearUsuarioUseCase, [AutodeskApiService]],
  [ImportarUsuariosUseCase, [AutodeskApiService]],
  [ObtenerProductosUsuarioUseCase, [AutodeskApiService]],
  [ObtenerProyectosUsuarioUseCase, [AutodeskApiService]],
  [ObtenerRolesUsuarioUseCase, [AutodeskApiService]],
  [ObtenerUsuarioPorIdUseCase, [AutodeskApiService]],
  [ObtenerUsuariosUseCase, [AutodeskApiService]],
  [BuscarBusinessUnitsUseCase, [AutodeskApiService]],
  [CrearOActualizarBusinessUnitsUseCase, [AutodeskApiService]],
  [ObtenerArbolBusinessUnitsUseCase, [AutodeskApiService]],
  [ObtenerBusinessUnitPorIdUseCase, [AutodeskApiService]],
  [ObtenerBusinessUnitsHijasUseCase, [AutodeskApiService]],
  [ObtenerBusinessUnitsUseCase, [AutodeskApiService]],
  [ActualizarCompanyUseCase, [AutodeskApiService]],
  [BuscarCompaniesUseCase, [AutodeskApiService]],
  [CrearCompanyUseCase, [AutodeskApiService]],
  [ImportarCompaniesUseCase, [AutodeskApiService]],
  [ObtenerCompaniesProyectoUseCase, [AutodeskApiService]],
  [ObtenerCompaniesUseCase, [AutodeskApiService]],
  [ObtenerCompanyPorIdUseCase, [AutodeskApiService]],
  [SubirImagenCompanyUseCase, [AutodeskApiService]],
  [CreateNamingStandardFromTemplateUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [EliminarFolderNamingRuleUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [GenerarNombreDocumentoUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [ListarDocumentAttributesUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [ListarDocumentMetadataPorCarpetaUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [ListarDocumentNamingStandardsUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [ObtenerDocumentMetadataUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [ObtenerFolderNamingRuleUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [ObtenerNamingTemplatePreviewUseCase, []],
  [UpsertDocumentAttributeUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [UpsertDocumentMetadataUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [UpsertDocumentNamingStandardUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [UpsertFolderNamingRuleUseCase, [ACC_DOCUMENT_CONFIG_REPOSITORY]],
  [
    ActualizarIncidenciaUseCase,
    [AutodeskApiService, obtener_token_valido_helper, AUDITORIA_REPOSITORY],
  ],
  [
    AsignarIncidenciaUseCase,
    [
      ACC_RECURSOS_REPOSITORY,
      AUDITORIA_REPOSITORY,
      AUTH_REPOSITORY,
      BroadcastService,
    ],
  ],
  [
    CrearAdjuntoUseCase,
    [AutodeskApiService, obtener_token_valido_helper, AUDITORIA_REPOSITORY],
  ],
  [
    CrearComentarioUseCase,
    [AutodeskApiService, obtener_token_valido_helper, AUDITORIA_REPOSITORY],
  ],
  [
    CrearIncidenciaUseCase,
    [AutodeskApiService, obtener_token_valido_helper, AUDITORIA_REPOSITORY],
  ],
  [EliminarAdjuntoUseCase, [AutodeskApiService, obtener_token_valido_helper]],
  [ExportarIncidenciasUseCase, [ExportacionIncidenciasService]],
  [
    ObtenerActividadIncidenciaUseCase,
    [AUDITORIA_REPOSITORY, ObtenerComentariosUseCase, NestLoggerFactory],
  ],
  [
    ObtenerAdjuntosUseCase,
    [AutodeskApiService, obtener_token_valido_helper, AUDITORIA_REPOSITORY],
  ],
  [
    ObtenerCategoriasRaizUseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerComentariosUseCase,
    [AutodeskApiService, obtener_token_valido_helper, AUDITORIA_REPOSITORY],
  ],
  [
    ObtenerDefinicionesAtributosUseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerIncidenciaPorIdUseCase,
    [
      AutodeskApiService,
      obtener_token_valido_helper,
      AUDITORIA_REPOSITORY,
      ACC_RECURSOS_REPOSITORY,
    ],
  ],
  [
    ObtenerIncidenciasPorDocumentoUseCase,
    [
      AutodeskApiService,
      obtener_token_valido_helper,
      AUDITORIA_REPOSITORY,
      ACC_RECURSOS_REPOSITORY,
    ],
  ],
  [
    ObtenerIncidenciasUseCase,
    [
      AutodeskApiService,
      obtener_token_valido_helper,
      AUDITORIA_REPOSITORY,
      ACC_RECURSOS_REPOSITORY,
    ],
  ],
  [
    ObtenerMapeosAtributosUseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerPerfilUsuarioUseCase2,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerTiposIncidenciasUseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [obtener_token_valido_helper, [ACC_REPOSITORY, AutodeskApiService]],
  [
    ObtenerUrlMiniaturaUseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [ObtenerUsuariosDisponiblesUseCase, [USUARIOS_REPOSITORY]],
  [ActualizarUsuarioProyectoUseCase, [AutodeskApiService]],
  [AgregarUsuarioProyectoUseCase, [AutodeskApiService]],
  [BuscarUsuariosProyectoUseCase, [AutodeskApiService]],
  [EliminarUsuarioProyectoUseCase, [AutodeskApiService]],
  [ImportarUsuariosProyectoUseCase, [AutodeskApiService]],
  [ObtenerUsuarioProyectoPorIdUseCase, [AutodeskApiService]],
  [ObtenerUsuariosProyectoUseCase, [AutodeskApiService]],
  [
    ActivarServicioProyectoUseCase,
    [AutodeskApiService, obtener_token_valido_helper, AUDITORIA_REPOSITORY],
  ],
  [ActualizarProyectoUseCase, [AutodeskApiService, AUDITORIA_REPOSITORY]],
  [
    ClonarProyectoUseCase,
    [AutodeskApiService, AUDITORIA_REPOSITORY, ACC_RESOURCES_REPOSITORY],
  ],
  [
    CrearProyectoUseCase2,
    [
      AutodeskApiService,
      obtener_token_valido_helper,
      AUDITORIA_REPOSITORY,
      ACC_RESOURCES_REPOSITORY,
    ],
  ],
  [
    DesactivarServicioProyectoUseCase,
    [AutodeskApiService, obtener_token_valido_helper, AUDITORIA_REPOSITORY],
  ],
  [GetPlantillasUseCase, [AutodeskApiService]],
  [GetProyectoPorIdUseCase, [AutodeskApiService, AUDITORIA_REPOSITORY]],
  [GetProyectosActivosUseCase, [AutodeskApiService]],
  [GetProyectosPorTipoUseCase, [AutodeskApiService]],
  [
    GetProyectosUseCase,
    [AutodeskApiService, AUDITORIA_REPOSITORY, ACC_RESOURCES_REPOSITORY],
  ],
  [
    SubirImagenProyectoUseCase,
    [
      AutodeskApiService,
      SharpAccProjectImagePreparerService,
      AUDITORIA_REPOSITORY,
      EnvironmentApplicationSettings,
    ],
  ],
  [ActualizarNivelPermisoUsuarioUseCase, [ACC_RESOURCES_REPOSITORY]],
  [ActualizarRecursoUseCase2, [ACC_RESOURCES_REPOSITORY]],
  [AsignarPermisoUsuarioUseCase, [ACC_RESOURCES_REPOSITORY]],
  [AsignarPermisoUseCase, [ACC_RESOURCES_REPOSITORY]],
  [CrearRecursoUseCase, [ACC_RESOURCES_REPOSITORY]],
  [EliminarRecursoUseCase, [ACC_RESOURCES_REPOSITORY]],
  [ListarNivelesPermisoUseCase, [ACC_RESOURCES_REPOSITORY]],
  [ListarPermisosRolUseCase2, [ACC_RESOURCES_REPOSITORY]],
  [ListarPermisosUsuarioUseCase, [ACC_RESOURCES_REPOSITORY]],
  [ListarRecursosUseCase, [ACC_RESOURCES_REPOSITORY]],
  [ListarRolesRecursoUseCase, [ACC_RESOURCES_REPOSITORY]],
  [ListarUsuariosDisponiblesRecursoUseCase, [ACC_RESOURCES_REPOSITORY]],
  [ListarUsuariosRecursoUseCase, [ACC_RESOURCES_REPOSITORY]],
  [ObtenerRecursoPorIdUseCase, [ACC_RESOURCES_REPOSITORY]],
  [RemoverPermisoUsuarioUseCase, [ACC_RESOURCES_REPOSITORY]],
  [RemoverPermisoUseCase, [ACC_RESOURCES_REPOSITORY]],
  [SincronizarPermisosRolUseCase2, [ACC_RESOURCES_REPOSITORY]],
  [SincronizarPermisosUsuarioUseCase, [ACC_RESOURCES_REPOSITORY]],
  [ActualizarFlujoRevisionGvrUseCase, [PostgresInternalReviewsRepository]],
  [AddComentarioArchivoUseCase, [PostgresInternalReviewsRepository]],
  [AgregarReferenciaRevisionUseCase, [PostgresInternalReviewsRepository]],
  [AnularRevisionEntireUseCase, [PostgresInternalReviewsRepository]],
  [CambiarEstadoFlujoGvrUseCase, [PostgresInternalReviewsRepository]],
  [CrearFlujoRevisionGvrUseCase, [PostgresInternalReviewsRepository]],
  [
    CrearRevisionUseCase,
    [PostgresInternalReviewsRepository, AUDITORIA_REPOSITORY],
  ],
  [
    CrearWorkflowUseCase,
    [AutodeskApiService, obtener_token_valido_helper, AUDITORIA_REPOSITORY],
  ],
  [DelegarPasoRevisionUseCase, [PostgresInternalReviewsRepository]],
  [EliminarReferenciaRevisionUseCase, [PostgresInternalReviewsRepository]],
  [EnviarResenaPasoUseCase, [PostgresInternalReviewsRepository]],
  [ExportarRevisionDetallePdfUseCase, [ExportacionRevisionDetallePdfService]],
  [ExportarRevisionesPdfUseCase, [ExportacionRevisionesPdfService]],
  [GetComentariosArchivoUseCase, [PostgresInternalReviewsRepository]],
  [GuardarWorkflowCandidatosUseCase, [PostgresInternalReviewsRepository]],
  [IniciarPasoRevisionUseCase, [PostgresInternalReviewsRepository]],
  [
    NotificarRevisoresRevisionUseCase,
    [
      MailService,
      ObtenerRevisionPorIdUseCase,
      EnvironmentApplicationSettings,
      NestLoggerFactory,
    ],
  ],
  [
    ObtenerApprovalStatusesVersionUseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [
    ObtenerProgresoRevisionUseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [ObtenerReferenciasRevisionUseCase, [PostgresInternalReviewsRepository]],
  [
    ObtenerRevisionPorIdUseCase,
    [
      AutodeskApiService,
      obtener_token_valido_helper,
      PostgresInternalReviewsRepository,
    ],
  ],
  [
    ObtenerRevisionesUseCase,
    [PostgresInternalReviewsRepository, MinioStorageService],
  ],
  [
    ObtenerVersionesRevisionUseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [ObtenerWorkflowCandidatosUseCase, [PostgresInternalReviewsRepository]],
  [
    ObtenerWorkflowPorIdUseCase,
    [
      AutodeskApiService,
      obtener_token_valido_helper,
      PostgresInternalReviewsRepository,
    ],
  ],
  [
    ObtenerWorkflowRevisionUseCase,
    [AutodeskApiService, obtener_token_valido_helper],
  ],
  [ObtenerWorkflowsUseCase, [PostgresInternalReviewsRepository]],
  [SaltarPasoRevisionUseCase, [PostgresInternalReviewsRepository]],
  [VolverPasoAnteriorRevisionUseCase, [PostgresInternalReviewsRepository]],
  [GenerarTokenViewerUseCase, [AutodeskApiService]],
  [ObtenerManifiestoUseCase, [AutodeskApiService]],
  [ObtenerMetadatosUseCase, [AutodeskApiService]],
  [ObtenerTokenPublicoUseCase, [AutodeskApiService]],
  [ActualizarVisorElementoFotoUseCase, [ACC_VISOR_ELEMENTO_FOTO_REPOSITORY]],
  [
    AgregarArchivosVisorElementoFotoUseCase,
    [ACC_VISOR_ELEMENTO_FOTO_REPOSITORY],
  ],
  [CrearVisorElementoFotoUseCase, [ACC_VISOR_ELEMENTO_FOTO_REPOSITORY]],
  [
    EliminarArchivoVisorElementoFotoUseCase,
    [ACC_VISOR_ELEMENTO_FOTO_REPOSITORY, MinioStorageService],
  ],
  [
    EliminarVisorElementoFotoUseCase,
    [ACC_VISOR_ELEMENTO_FOTO_REPOSITORY, MinioStorageService],
  ],
  [
    ListarVisorElementoFotosPorDocumentoUseCase,
    [ACC_VISOR_ELEMENTO_FOTO_REPOSITORY],
  ],
  [
    ObtenerVisorElementoFotoPorElementoUseCase,
    [ACC_VISOR_ELEMENTO_FOTO_REPOSITORY],
  ],
  [ObtenerVisorElementoFotoUseCase, [ACC_VISOR_ELEMENTO_FOTO_REPOSITORY]],
  [
    ActualizarVisorMarcaRevisionUseCase,
    [ACC_VISOR_MARCA_REVISION_REPOSITORY, VisorMarcaRevisionSyncService],
  ],
  [
    AnularPublicacionVisorMarcaRevisionUseCase,
    [ACC_VISOR_MARCA_REVISION_REPOSITORY, VisorMarcaRevisionSyncService],
  ],
  [ContarVisorMarcasRevisionUseCase, [ACC_VISOR_MARCA_REVISION_REPOSITORY]],
  [
    CrearVisorMarcaRevisionUseCase,
    [ACC_VISOR_MARCA_REVISION_REPOSITORY, VisorMarcaRevisionSyncService],
  ],
  [
    DuplicarVisorMarcaRevisionUseCase,
    [ACC_VISOR_MARCA_REVISION_REPOSITORY, VisorMarcaRevisionSyncService],
  ],
  [ListarVisorMarcasRevisionUseCase, [ACC_VISOR_MARCA_REVISION_REPOSITORY]],
  [ObtenerVisorMarcaRevisionUseCase, [ACC_VISOR_MARCA_REVISION_REPOSITORY]],
  [
    PublicarVisorMarcaRevisionUseCase,
    [ACC_VISOR_MARCA_REVISION_REPOSITORY, VisorMarcaRevisionSyncService],
  ],
  [
    SincronizarMarkupIdApsVisorMarcaRevisionUseCase,
    [ACC_VISOR_MARCA_REVISION_REPOSITORY],
  ],
  [
    SuprimirVisorMarcaRevisionUseCase,
    [ACC_VISOR_MARCA_REVISION_REPOSITORY, VisorMarcaRevisionSyncService],
  ],
  [VisorMarcaRevisionSyncService, [BroadcastService, NestLoggerFactory]],
  [ActualizarImagenProyectoBim360UseCase, [AutodeskApiService]],
  [ActualizarProyectoBim360UseCase, [AutodeskApiService]],
  [CrearProyectoBim360UseCase, [AutodeskApiService]],
  [ObtenerIssueContainerIdUseCase, [AutodeskApiService]],
  [ObtenerProyectoPorIdLegacyUseCase, [AutodeskApiService]],
  [ObtenerProyectoPorIdNewUseCase, [AutodeskApiService]],
  [ObtenerProyectosLegacyUseCase, [AutodeskApiService]],
  [ObtenerProyectosNewUseCase, [AutodeskApiService]],
  [CrearBucketUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [EliminarBucketUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerBucketsUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerDetallesBucketUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [
    ActualizarCarpetaUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY],
  ],
  [BuscarEnCarpetaUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [BuscarEnContenidoCarpetaUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [
    CrearCarpetaUseCase,
    [
      AutodeskApiService,
      ACC_REPOSITORY,
      AUDITORIA_REPOSITORY,
      ACC_RESOURCES_REPOSITORY,
    ],
  ],
  [CrearReferenciaCarpetaUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [
    CrearSubcarpetaUseCase,
    [
      AutodeskApiService,
      ACC_REPOSITORY,
      AUDITORIA_REPOSITORY,
      ACC_RESOURCES_REPOSITORY,
    ],
  ],
  [
    EliminarCarpetaUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY],
  ],
  [ExportarPermisosCarpetaPdfUseCase, [ExportacionPermisosCarpetaPdfService]],
  [ExportarRegistroArchivosPdfUseCase, [ExportacionRegistroArchivosPdfService]],
  [ObtenerCarpetaPadreUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerCarpetaPorIdUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [
    ObtenerContenidoCarpetaUseCase,
    [
      AutodeskApiService,
      ACC_REPOSITORY,
      AUDITORIA_REPOSITORY,
      ACC_RESOURCES_REPOSITORY,
    ],
  ],
  [
    ObtenerElementosEliminadosUseCase,
    [
      AutodeskApiService,
      ACC_REPOSITORY,
      AUDITORIA_REPOSITORY,
      ACC_RESOURCES_REPOSITORY,
    ],
  ],
  [ObtenerReferenciasUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerRelacionesLinksUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerRelacionesRefsUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [
    RestaurarCarpetaUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY],
  ],
  [
    SincronizarCarpetasProyectoUseCase,
    [AutodeskApiService, ACC_REPOSITORY, ACC_RESOURCES_REPOSITORY],
  ],
  [
    ActualizarItemUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY],
  ],
  [
    CompletarSubidaChunkedUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY, AUTH_REPOSITORY],
  ],
  [
    CopiarItemUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY],
  ],
  [CrearItemUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [CrearReferenciaItemUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [
    DescargarItemUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY],
  ],
  [
    DesplazarItemUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY],
  ],
  [
    EliminarItemUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY],
  ],
  [
    IniciarSubidaChunkedUseCase,
    [AutodeskApiService, ACC_REPOSITORY, EnvironmentApplicationSettings],
  ],
  [
    ObtenerActividadesArchivoUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY],
  ],
  [ObtenerItemPadreUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerItemPorIdUseCase2, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerReferenciasItemUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerRelacionesLinksItemUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerRelacionesRefsItemUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerStorageUrlItemUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerTipVersionUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [
    ObtenerUrlsSubidaChunkedUseCase,
    [AutodeskApiService, ACC_REPOSITORY, EnvironmentApplicationSettings],
  ],
  [
    ObtenerVersionesUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY],
  ],
  [
    RestaurarItemUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY],
  ],
  [
    SubirArchivoUseCase,
    [AutodeskApiService, ACC_REPOSITORY, AUDITORIA_REPOSITORY, AUTH_REPOSITORY],
  ],
  [CrearDescargaUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [CrearStorageUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [
    ObtenerCarpetasPrincipalesUseCase,
    [AutodeskApiService, ACC_REPOSITORY, ACC_RESOURCES_REPOSITORY],
  ],
  [ObtenerEstadoDescargaUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerEstadoJobUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerHubDeProyectoUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerProyectoHubPorIdUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerProyectosHubUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ActualizarVersionUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [CrearReferenciaUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [CrearVersionUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerDescargasUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerFormatosDescargaUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerItemUseCase, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerReferenciasUseCase2, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerRelacionesLinksUseCase2, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerRelacionesRefsUseCase2, [AutodeskApiService, ACC_REPOSITORY]],
  [ObtenerVersionPorIdUseCase, [AutodeskApiService, ACC_REPOSITORY]],
]);

export function applicationProvider<T>(target: Type<T>): FactoryProvider<T> {
  const inject = dependencies.get(target);
  if (!inject)
    throw new Error('No se registraron las dependencias de ' + target.name);
  return {
    provide: target,
    inject,
    useFactory: (...args: any[]) =>
      new target(...args.map(applicationDependency)),
  };
}

export const applicationProviderTargets = [...dependencies.keys()];
