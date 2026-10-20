import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { controlWorkerPolicies } from '../../../infrastructure/auth/control-worker-policies';
import {
  catalogGlobalPolicies,
  gvrProjectPolicies,
  selfPolicies,
} from '../../../infrastructure/auth/catalog-policies';
import { DatabaseFunctionService } from '../../../infrastructure/database/database-function.service';
import { APP_GUARD, DiscoveryModule } from '@nestjs/core';
import { AuthorizationReadinessService } from '../../../infrastructure/auth/authorization-readiness.service';
import { AUTHORIZATION_POLICIES } from '../../../application/ports/authorization.port';
import { GRANULAR_PERMISSIONS } from '../../../application/ports/granular-permissions.port';
import { applicationProvider } from '../../application.providers';
import type {
  AuthorizationPolicy,
  AuthorizationPolicyRegistry,
  AuthorizationReader,
} from '../../../application/ports/authorization.port';
import {
  DOCUMENT_ACCESS_READER,
  type DocumentAccessReader,
} from '../../../application/ports/document-access.port';
import { normalizeAccProjectId } from '../../../application/services/document-access.service';
import { DocumentAccessRepository } from '../../../infrastructure/repositories/document-access.repository';
import { AuthorizationService } from '../../../application/services/authorization.service';
import { GranularPermissionsService } from '../../../application/services/granular-permissions.service';
import { IssueAccessService } from '../../../application/services/issue-access.service';
import { GranularPermissionsRepository } from '../../../infrastructure/repositories/granular-permissions.repository';
import { GranularPermissionGuard } from '../../../infrastructure/auth/granular-permission.guard';
import { ControlOperativoAccess } from '../../../infrastructure/auth/control-operativo-access.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/jwt-auth.guard';
import { AuthorizationController } from '../../../presentation/controllers/authorization.controller';
import { DatabaseModule } from './database.module';
import { AuthenticationModule } from './authentication.module';

/** Sólo acciones administrativas globales. Los recursos requieren su propio resolvedor autorizado. */
export function securityPolicies(): AuthorizationPolicyRegistry {
  const groups = {
    'seguridad.roles': [
      'ver',
      'crear',
      'editar',
      'eliminar',
      'clonar',
      'asignar_permisos',
    ],
    'seguridad.menus': [
      'ver',
      'crear',
      'editar',
      'eliminar',
      'clonar',
      'reordenar',
      'asignar_roles',
      'vincular_permisos',
      'mover',
    ],
    'seguridad.catalogo_permisos': ['ver', 'crear', 'editar', 'eliminar'],
    'usuarios.roles_usuario': ['asignar'],
    'gestion_bim.documentos': ['acceso_total', 'ver_todos'],
    'gestion_bim.proyectos': ['crear', 'clonar'],
    'gestion_bim.cuentas': ['ver'],
  };
  const policies = new Map<string, AuthorizationPolicy>();
  for (const [option, actions] of Object.entries(groups))
    for (const action of actions)
      policies.set(`${option}.${action}`, {
        mode: 'global',
        allowedScopes: ['global'],
        resolve: () =>
          Promise.resolve({
            resource: null,
            activeBoundary: true,
            businessRulesAllow: true,
          }),
      });
  return policies;
}

export const ACC_PROJECT_RESOURCE = 'acc_project';
/** Recurso de proyecto: su ID ACC, o '*' para «todos los proyectos». */
export const ALL_PROJECTS = '*';
export const PROJECT_ACTIONS = [
  'ver',
  'editar',
  'configurar',
  'editar_imagen',
  'gestionar_servicios',
] as const;

/**
 * Proyectos BIM por rol. «asignados» = proyectos donde la persona participa
 * (asignación activa en el proyecto o en alguna carpeta); «todos» = cualquiera.
 * La configuración interna (usuarios y niveles) se controla por nivel del proyecto.
 */
export function projectPolicies(
  reader: DocumentAccessReader,
): AuthorizationPolicyRegistry {
  const policies = new Map<string, AuthorizationPolicy>();
  for (const action of PROJECT_ACTIONS)
    policies.set(`gestion_bim.proyectos.${action}`, {
      mode: 'resource',
      resourceType: ACC_PROJECT_RESOURCE,
      allowedScopes: ['asignados', 'todos'],
      resolve: async (userId, resource) => {
        const project = normalizeAccProjectId(resource?.id ?? '');
        const member =
          !!project &&
          project !== ALL_PROJECTS &&
          (await reader.isProjectMember(userId, project));
        return {
          resource,
          activeBoundary: project.length > 0,
          businessRulesAllow: true,
          assignedUserIds: member ? [userId] : [],
        };
      },
    });
  return policies;
}

export const ACC_ISSUE_RESOURCE = 'acc_issue';
/** Recurso de incidencias: «proyecto», «proyecto/*» (todas) o «proyecto/idIncidencia». */
export const ALL_ISSUES = '*';
export const ISSUE_ACTIONS = [
  'ver',
  'crear',
  'editar',
  'cambiar_estado',
  'asignar',
  'desasignar',
  'comentar',
  'adjuntar',
  'editar_adjuntos',
  'eliminar_adjuntos',
  'exportar',
] as const;

/**
 * Incidencias por proyecto ACC. El ámbito son los proyectos donde la persona
 * participa (asignación activa en el proyecto o en alguna carpeta), o todos si
 * tiene acceso total a documentos. «todos» abarca cualquier incidencia del
 * ámbito; «asignados» sólo las incidencias asignadas a la persona.
 */
export function issuePolicies(
  reader: DocumentAccessReader,
  permissions: AuthorizationReader,
): AuthorizationPolicyRegistry {
  // Acceso total o «ver todos» de documentos: el ámbito son todos los proyectos.
  const fullAccess = async (userId: number) =>
    (await permissions.readCurrent(userId)).grants.some(
      (grant) =>
        (grant.code === 'gestion_bim.documentos.acceso_total' ||
          grant.code === 'gestion_bim.documentos.ver_todos') &&
        grant.scopes.includes('global'),
    );
  const policies = new Map<string, AuthorizationPolicy>();
  for (const action of ISSUE_ACTIONS)
    policies.set(`gestion_bim.incidencias.${action}`, {
      mode: 'resource',
      resourceType: ACC_ISSUE_RESOURCE,
      allowedScopes: ['asignados', 'todos'],
      resolve: async (userId, resource) => {
        const [rawProject = '', issue = ''] = (resource?.id ?? '').split('/');
        const project = normalizeAccProjectId(rawProject);
        const inScope =
          !!project &&
          ((await reader.isProjectMember(userId, project)) ||
            (await fullAccess(userId)));
        const assigned =
          inScope &&
          (issue === ''
            ? true
            : issue !== ALL_ISSUES &&
              (await reader.isIssueAssignee(userId, issue)));
        return {
          resource,
          activeBoundary: inScope,
          businessRulesAllow: true,
          assignedUserIds: assigned ? [userId] : [],
        };
      },
    });
  return policies;
}

@Global()
@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    DiscoveryModule,
    ConfigModule,
  ],
  controllers: [AuthorizationController],
  providers: [
    { provide: GRANULAR_PERMISSIONS, useClass: GranularPermissionsRepository },
    { provide: DOCUMENT_ACCESS_READER, useClass: DocumentAccessRepository },
    {
      provide: AUTHORIZATION_POLICIES,
      inject: [
        DOCUMENT_ACCESS_READER,
        GRANULAR_PERMISSIONS,
        DatabaseFunctionService,
      ],
      useFactory: (
        reader: DocumentAccessReader,
        permissions: AuthorizationReader,
        database: DatabaseFunctionService,
      ) =>
        new Map([
          ...catalogGlobalPolicies(),
          ...selfPolicies(),
          ...gvrProjectPolicies(database),
          ...securityPolicies(),
          ...issuePolicies(reader, permissions),
          ...projectPolicies(reader),
          ...controlWorkerPolicies(database),
        ]),
    },
    AuthorizationReadinessService,
    JwtAuthGuard,
    applicationProvider(AuthorizationService),
    applicationProvider(GranularPermissionsService),
    applicationProvider(IssueAccessService),
    ControlOperativoAccess,
    { provide: APP_GUARD, useClass: GranularPermissionGuard },
  ],
  exports: [
    AuthorizationService,
    GranularPermissionsService,
    IssueAccessService,
    ControlOperativoAccess,
    DOCUMENT_ACCESS_READER,
  ],
})
export class AuthorizationModule {}
