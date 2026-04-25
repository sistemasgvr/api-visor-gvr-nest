import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type {
  EmailDispatchLogEntry,
  IEmailDispatchLogRepository,
} from '../../domain/repositories/email-dispatch-log.repository.interface';

/** DDL en el proyecto BD: `api-visor-gvr-sql/schema/01-tables/mail/email_dispatch_logs.sql` */
@Injectable()
export class EmailDispatchLogRepository implements IEmailDispatchLogRepository {
  private readonly logger = new Logger(EmailDispatchLogRepository.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
}
