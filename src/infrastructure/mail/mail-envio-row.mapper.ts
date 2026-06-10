import type {
  MailEnvioCoberturaItem,
  MailEnvioCoberturaResumen,
  MailEnvioLogItem,
} from '../../domain/entities/mail-envio.entity';

export function mapMailEnvioCoberturaRow(
  row: Record<string, unknown>,
): MailEnvioCoberturaItem {
  return {
    idTrabajador: Number(row.id_trabajador),
    nombreCompleto: String(row.nombre_completo ?? ''),
    correo: row.correo != null ? String(row.correo) : null,
    estadoEnvio: String(row.estado_envio ?? 'no_enviado') as MailEnvioCoberturaItem['estadoEnvio'],
    fechaUltimoEnvio: row.fecha_ultimo_envio
      ? new Date(String(row.fecha_ultimo_envio)).toISOString()
      : null,
    errorMensaje: row.error_mensaje != null ? String(row.error_mensaje) : null,
    idLog: row.id_log != null ? String(row.id_log) : null,
  };
}

export function mapMailEnvioResumenRow(
  row: Record<string, unknown>,
): MailEnvioCoberturaResumen {
  return {
    total: Number(row.total ?? 0),
    enviados: Number(row.enviados ?? 0),
    fallidos: Number(row.fallidos ?? 0),
    omitidos: Number(row.omitidos ?? 0),
    noEnviados: Number(row.no_enviados ?? 0),
    noAplica: Number(row.no_aplica ?? 0),
  };
}

export function mapMailEnvioLogRow(
  row: Record<string, unknown>,
): MailEnvioLogItem {
  const recipientsRaw = row.recipients;
  let recipients: string[] = [];
  if (Array.isArray(recipientsRaw)) {
    recipients = recipientsRaw.map(String);
  } else if (typeof recipientsRaw === 'string') {
    try {
      const parsed = JSON.parse(recipientsRaw) as unknown;
      if (Array.isArray(parsed)) {
        recipients = parsed.map(String);
      }
    } catch {
      recipients = [];
    }
  }

  return {
    id: String(row.id),
    templateId: String(row.template_id ?? ''),
    recipients,
    status: String(row.status ?? ''),
    errorMessage: row.error_message != null ? String(row.error_message) : null,
    jobId: row.job_id != null ? String(row.job_id) : null,
    correlationId:
      row.correlation_id != null ? String(row.correlation_id) : null,
    createdAt: row.created_at
      ? new Date(String(row.created_at)).toISOString()
      : new Date().toISOString(),
  };
}
