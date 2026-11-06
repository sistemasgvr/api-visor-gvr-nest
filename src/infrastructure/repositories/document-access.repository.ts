import { Injectable } from '@nestjs/common';
import type {
  DocumentAccessReader,
  DocumentAnnotation,
  DocumentLevel,
  DocumentResource,
} from '../../application/ports/document-access.port';
import { DatabaseFunctionService } from '../database/database-function.service';
import {
  granularDatabaseFailure,
  granularScalar,
} from '../auth/granular-function-result';

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : null;

/** Lee niveles documentales y pertenencia a proyectos desde las funciones acc_*. */
@Injectable()
export class DocumentAccessRepository implements DocumentAccessReader {
  constructor(private readonly database: DatabaseFunctionService) {}

  async level(userId: number, externalId: string): Promise<DocumentLevel> {
    try {
      return await this.readLevel(userId, externalId);
    } catch (error) {
      return granularDatabaseFailure(error);
    }
  }

  async isProjectMember(userId: number, projectId: string): Promise<boolean> {
    try {
      return await this.readMembership(userId, projectId);
    } catch (error) {
      return granularDatabaseFailure(error);
    }
  }

  async isIssueAssignee(userId: number, issueId: string): Promise<boolean> {
    const name = 'acc_UsuarioAsignadoIncidencia';
    try {
      const value = granularScalar(
        await this.database.callFunctionSingle<unknown>(name, [
          userId,
          issueId,
        ]),
        name,
      );
      return value === true;
    } catch (error) {
      return granularDatabaseFailure(error);
    }
  }

  async annotation(
    kind: 'marca' | 'foto',
    id: number,
  ): Promise<DocumentAnnotation> {
    const name = 'acc_ObtenerDocumentoAnotacion';
    try {
      const value = granularScalar(
        await this.database.callFunctionSingle<unknown>(name, [kind, id]),
        name,
      );
      if (!isObject(value) || typeof value.encontrado !== 'boolean')
        throw new Error('Anotación inválida');
      return {
        found: value.encontrado,
        project: text(value.proyecto),
        itemId: text(value.itemid),
      };
    } catch (error) {
      return granularDatabaseFailure(error);
    }
  }

  async reviewInProject(
    reviewId: number,
    projectId: string,
    referenceId: number | null = null,
  ): Promise<boolean> {
    const name = 'acc_RevisionPerteneceProyecto';
    try {
      const value = granularScalar(
        await this.database.callFunctionSingle<unknown>(name, [
          reviewId,
          projectId,
          referenceId,
        ]),
        name,
      );
      return value === true;
    } catch (error) {
      return granularDatabaseFailure(error);
    }
  }

  async resource(
    resourceId: number | null,
    assignmentId: number | null = null,
  ): Promise<DocumentResource> {
    const name = 'acc_ObtenerRecursoDocumental';
    try {
      const value = granularScalar(
        await this.database.callFunctionSingle<unknown>(name, [
          resourceId,
          assignmentId,
        ]),
        name,
      );
      if (!isObject(value) || typeof value.encontrado !== 'boolean')
        throw new Error('Recurso documental inválido');
      return {
        found: value.encontrado,
        externalId: text(value.externalid),
        type: text(value.tipo),
        project: text(value.proyecto),
      };
    } catch (error) {
      return granularDatabaseFailure(error);
    }
  }

  private async readLevel(
    userId: number,
    externalId: string,
  ): Promise<DocumentLevel> {
    const name = 'acc_ObtenerNivelDocumentoUsuario';
    const value = granularScalar(
      await this.database.callFunctionSingle<unknown>(name, [
        userId,
        externalId,
      ]),
      name,
    );
    if (!isObject(value) || typeof value.encontrado !== 'boolean')
      throw new Error('Nivel documental inválido');
    const level = value.nivel;
    const id = (key: string) =>
      Number.isSafeInteger(Number(value[key])) && Number(value[key]) > 0
        ? Number(value[key])
        : null;
    return {
      found: value.encontrado,
      resourceId: id('idrecurso'),
      parentId: id('idpadre'),
      project: text(value.proyecto),
      level:
        Number.isSafeInteger(level) && (level as number) > 0
          ? (level as number)
          : null,
      code: text(value.codigo),
      origin: text(value.origen),
    };
  }

  private async readMembership(
    userId: number,
    projectId: string,
  ): Promise<boolean> {
    const name = 'acc_UsuarioEsMiembroProyecto';
    const value = granularScalar(
      await this.database.callFunctionSingle<unknown>(name, [
        userId,
        projectId,
      ]),
      name,
    );
    return value === true;
  }
}
