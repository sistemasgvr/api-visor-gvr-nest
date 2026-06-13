import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { validate } from './config/env.validation';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './presentation/modules/auth.module';
import { AccModule } from './presentation/modules/acc.module';
import { AccProjectsModule } from './presentation/modules/acc-projects.module';
import { UserModule } from './presentation/modules/user.module';
import { GeneralModule } from './presentation/modules/general.module';
import { EmpresaModule } from './presentation/modules/empresa.module';
import { TrabajadorModule } from './presentation/modules/trabajador.module';
import { ProyectoModule } from './presentation/modules/proyecto.module';
import { RolModule } from './presentation/modules/rol.module';
import { PermisoModule } from './presentation/modules/permiso.module';
import { MenuGestionModule } from './presentation/modules/menu-gestion.module';
import { NovedadModule } from './presentation/modules/novedad.module';
import { DataManagementModule } from './presentation/modules/data-management.module';
import { DataManagementFoldersModule } from './presentation/modules/data-management-folders.module';
import { DataManagementProjectsModule } from './presentation/modules/data-management-projects.module';
import { DataManagementItemsModule } from './presentation/modules/data-management-items.module';
import { DataManagementVersionsModule } from './presentation/modules/data-management-versions.module';
import { AccViewerModule } from './presentation/modules/acc-viewer.module';
import { AccVisorElementoFotoModule } from './presentation/modules/acc-visor-elemento-foto.module';
import { AccVisorMarcaRevisionModule } from './presentation/modules/acc-visor-marca-revision.module';
import { AccIssuesModule } from './presentation/modules/acc-issues.module';
import { AccReviewsModule } from './presentation/modules/acc-reviews.module';
import { IssuesBim360Module } from './presentation/modules/issues-bim360.module';
import { AccResourcesModule } from './presentation/modules/acc-resources.module';
import { CompaniesModule } from './presentation/modules/companies.module';
import { AccAccountUsersModule } from './presentation/modules/acc-account-users.module';
import { AccProjectUsersModule } from './presentation/modules/acc-project-users.module';
import { BusinessUnitsModule } from './presentation/modules/business-units.module';
import { Bim360ProjectsModule } from './presentation/modules/bim360-projects.module';
import { DataManagementBucketsModule } from './presentation/modules/data-management-buckets.module';
import { AuditoriaModule } from './presentation/modules/auditoria.module';
import { AccRecursosModule } from './presentation/modules/acc-recursos.module';
import { AccDocumentConfigModule } from './presentation/modules/acc-document-config.module';
import { BroadcastModule } from './presentation/modules/broadcast.module';
import { NotificacionesModule } from './presentation/modules/notificaciones.module';
import { HealthModule } from './presentation/modules/health.module';
import { OfficeDocumentModule } from './presentation/modules/office-document.module';
import { CollaboraModule } from './presentation/modules/collabora.module';
import { ControlOperativoModule } from './presentation/modules/control-operativo.module';

// MODULO - DASHBOARD
import { DashboardModule } from './presentation/modules/dashboard/dashboard.module';
import { DemoModule } from './presentation/modules/demo.module';
import { MailModule } from './presentation/modules/mail.module';
import { MailPlantillaModule } from './presentation/modules/mail-plantilla.module';
import { PdfModule } from './infrastructure/pdf/pdf.module';
import { StorageModule } from './infrastructure/storage/storage.module';

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
    PdfModule,
    StorageModule,
    // Módulo de broadcasting
    BroadcastModule,
    // Módulo de health check
    HealthModule,
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
