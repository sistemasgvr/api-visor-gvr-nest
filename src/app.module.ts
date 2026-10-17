import { CalendariosModule } from './composition/modules/calendarios.module';
import { AuthorizationModule } from './composition/modules/platform/authorization.module';
import { DocumentAccessModule } from './composition/modules/platform/document-access.module';
import { Module } from '@nestjs/common';
import { ApplicationRuntimeModule } from './composition/modules/platform/application-runtime.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { validate } from './config/env.validation';
import { DatabaseModule } from './composition/modules/platform/database.module';
import { AuthModule } from './composition/modules/auth.module';
import { AccModule } from './composition/modules/acc.module';
import { AccProjectsModule } from './composition/modules/acc-projects.module';
import { UserModule } from './composition/modules/user.module';
import { GeneralModule } from './composition/modules/general.module';
import { EmpresaModule } from './composition/modules/empresa.module';
import { TrabajadorModule } from './composition/modules/trabajador.module';
import { ProyectoModule } from './composition/modules/proyecto.module';
import { RolModule } from './composition/modules/rol.module';
import { PermisoModule } from './composition/modules/permiso.module';
import { MenuGestionModule } from './composition/modules/menu-gestion.module';
import { NovedadModule } from './composition/modules/novedad.module';
import { DataManagementModule } from './composition/modules/data-management.module';
import { DataManagementFoldersModule } from './composition/modules/data-management-folders.module';
import { DataManagementProjectsModule } from './composition/modules/data-management-projects.module';
import { DataManagementItemsModule } from './composition/modules/data-management-items.module';
import { DataManagementVersionsModule } from './composition/modules/data-management-versions.module';
import { AccViewerModule } from './composition/modules/acc-viewer.module';
import { AccVisorElementoFotoModule } from './composition/modules/acc-visor-elemento-foto.module';
import { AccVisorMarcaRevisionModule } from './composition/modules/acc-visor-marca-revision.module';
import { AccIssuesModule } from './composition/modules/acc-issues.module';
import { AccReviewsModule } from './composition/modules/acc-reviews.module';
import { IssuesBim360Module } from './composition/modules/issues-bim360.module';
import { AccResourcesModule } from './composition/modules/acc-resources.module';
import { CompaniesModule } from './composition/modules/companies.module';
import { AccAccountUsersModule } from './composition/modules/acc-account-users.module';
import { AccProjectUsersModule } from './composition/modules/acc-project-users.module';
import { BusinessUnitsModule } from './composition/modules/business-units.module';
import { Bim360ProjectsModule } from './composition/modules/bim360-projects.module';
import { DataManagementBucketsModule } from './composition/modules/data-management-buckets.module';
import { AuditoriaModule } from './composition/modules/auditoria.module';
import { AccRecursosModule } from './composition/modules/acc-recursos.module';
import { AccDocumentConfigModule } from './composition/modules/acc-document-config.module';
import { BroadcastModule } from './composition/modules/broadcast.module';
import { NotificacionesModule } from './composition/modules/notificaciones.module';
import { HealthModule } from './composition/modules/health.module';
import { OfficeDocumentModule } from './composition/modules/office-document.module';
import { CollaboraModule } from './composition/modules/collabora.module';
import { ControlOperativoModule } from './composition/modules/control-operativo.module';

// MODULO - DASHBOARD
import { DashboardModule } from './composition/modules/dashboard.module';
import { DemoModule } from './composition/modules/demo.module';
import { MailModule } from './composition/modules/mail.module';
import { MailPlantillaModule } from './composition/modules/mail-plantilla.module';
import { PdfModule } from './composition/modules/platform/pdf.module';
import { StorageModule } from './composition/modules/platform/storage.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 300 }],
    }),
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    // Módulo de base de datos
    DatabaseModule,
    ApplicationRuntimeModule,
    AuthorizationModule,
    DocumentAccessModule,
    PdfModule,
    StorageModule,
    // Módulo de broadcasting
    BroadcastModule,
    // Módulo de health check
    HealthModule,
    CalendariosModule,
    // Módulos de funcionalidad
    AuthModule,
    AccModule,
    AccProjectsModule,
    AccIssuesModule,
    AccVisorElementoFotoModule,
    AccVisorMarcaRevisionModule,
    AccReviewsModule,
    IssuesBim360Module,
    AccResourcesModule,
    CompaniesModule,
    AccAccountUsersModule,
    AccProjectUsersModule,
    BusinessUnitsModule,
    Bim360ProjectsModule,
    DataManagementBucketsModule,
    AuditoriaModule,
    AccRecursosModule,
    AccDocumentConfigModule,
    NotificacionesModule,
    UserModule,
    GeneralModule,
    EmpresaModule,
    TrabajadorModule,
    ProyectoModule,
    RolModule,
    PermisoModule,
    MenuGestionModule,
    NovedadModule,
    DataManagementModule,
    DataManagementFoldersModule,
    DataManagementProjectsModule,
    DataManagementItemsModule,
    DataManagementVersionsModule,
    AccViewerModule,
    OfficeDocumentModule,
    CollaboraModule,
    ControlOperativoModule,

    // Módulo de dashboard
    DashboardModule,
    DemoModule,
    MailModule.register(),
    MailPlantillaModule,
  ],
})
export class AppModule {}
