import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type {
  EmailDispatchLogEntry,
  IEmailDispatchLogRepository,
  ListarCoberturaEnviosParams,
  ListarCoberturaEnviosResponse,
  ListarLogsEnvioParams,
  ListarLogsEnvioResponse,
} from '../../domain/repositories/email-dispatch-log.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';
import {
  mapMailEnvioCoberturaRow,
  mapMailEnvioLogRow,
  mapMailEnvioResumenRow,
} from '../mail/mail-envio-row.mapper';

/** DDL en el proyecto BD: `api-visor-gvr-sql/schema/01-tables/mail/email_dispatch_logs.sql` */
@Injectable()
export class EmailDispatchLogRepository implements IEmailDispatchLogRepository {
  private readonly logger = new Logger(EmailDispatchLogRepository.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

  async record(entry: EmailDispatchLogEntry): Promise<void> {
    try {
      await this.dataSource.query(
        `INSERT INTO email_dispatch_logs (template_id, recipients, status, error_message, job_id, correlation_id)
         VALUES ($1, $2::jsonb, $3, $4, $5, $6)`,
        [
          entry.templateId,
          JSON.stringify(entry.recipientEmails),
          entry.status,
          entry.errorMessage ?? null,
          entry.jobId ?? null,
          entry.correlationId ?? null,
        ],
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `No se pudo escribir en email_dispatch_logs (¿existe la tabla?): ${msg}`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }

  async listarCobertura(
    params: ListarCoberturaEnviosParams,
  ): Promise<ListarCoberturaEnviosResponse> {
    const {
      templateId,
      busqueda = '',
      estadoEnvio,
      limit = 20,
      offset = 0,
    } = params;

    const resumenRow = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('mail_ResumenCoberturaEnvios', [templateId]);

    const rows = await this.databaseFunctionService.callFunction<
      Record<string, unknown>
    >('mail_ListarCoberturaEnvios', [
      templateId,
      busqueda,
      estadoEnvio ?? null,
      limit,
      offset,
    ]);

    const total = rows.length ? Number(rows[0]?.total_registros ?? 0) : 0;

    return {
      data: rows.map(mapMailEnvioCoberturaRow),
      resumen: mapMailEnvioResumenRow(resumenRow ?? {}),
      pagination: {
        total,
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(total / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
    };
  }

  async listarLogs(
    params: ListarLogsEnvioParams,
  ): Promise<ListarLogsEnvioResponse> {
    const {
      templateId,
      busqueda = '',
      status,
      limit = 20,
      offset = 0,
    } = params;

    const rows = await this.databaseFunctionService.callFunction<
      Record<string, unknown>
    >('mail_ListarLogsEnvio', [
      templateId ?? null,
      busqueda,
      status ?? null,
      limit,
      offset,
    ]);

    const total = rows.length ? Number(rows[0]?.total_registros ?? 0) : 0;

    return {
      data: rows.map(mapMailEnvioLogRow),
      pagination: {
        total,
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(total / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
    };
  }
}
