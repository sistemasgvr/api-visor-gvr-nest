import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type {
  IMailTransport,
  MailTransportMessage,
} from '../../domain/services/mail-transport.interface';
import type { EmailRecipient } from '../../domain/mail/outbound-mail.types';
import {
  MailNotConfiguredException,
  MailSendFailedException,
} from '../../shared/exceptions/mail.exceptions';

@Injectable()
export class NodemailerMailTransportService implements IMailTransport {
  private readonly logger = new Logger(NodemailerMailTransportService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }
    const host = (
      this.configService.get<string>('MAIL_SMTP_HOST') ?? ''
    ).trim();
    const port = this.configService.get<number>('MAIL_SMTP_PORT') ?? 587;
    const secure =
      this.configService.get<string>('MAIL_SMTP_SECURE') === 'true' ||
      port === 465;
    const user = (
      this.configService.get<string>('MAIL_SMTP_USER') ?? ''
    ).trim();
    const pass = this.configService.get<string>('MAIL_SMTP_PASS') ?? '';

    if (!host) {
      throw new MailNotConfiguredException(
        'MAIL_SMTP_HOST no está definido. Configure SMTP o use MAIL_ENABLED=false para omitir envíos.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });

    return this.transporter;
  }

  private formatRecipients(list: EmailRecipient[]): string {
    return list
      .map((r) => {
        const email = (r.email ?? '').trim();
        if (r.name?.trim()) {
          return `"${r.name.trim()}" <${email}>`;
        }
        return email;
      })
      .filter(Boolean)
      .join(', ');
  }

  async send(message: MailTransportMessage): Promise<void> {
    const fromAddress =
      this.configService.get<string>('MAIL_FROM_ADDRESS') ??
      'no-reply@localhost';
    const fromName =
      this.configService.get<string>('MAIL_FROM_NAME') ?? 'Visor GVR';
    const from = `"${fromName}" <${fromAddress}>`;

    const transport = this.getTransporter();
    const to = this.formatRecipients(message.to);
    const mail: nodemailer.SendMailOptions = {
      from,
      to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    };
    if (message.cc?.length) {
      mail.cc = this.formatRecipients(message.cc);
    }
    if (message.bcc?.length) {
      mail.bcc = this.formatRecipients(message.bcc);
    }

    try {
      const info = await transport.sendMail(mail);
      this.logger.debug(`MessageId=${String(info.messageId)} to=${to}`);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code?: string }).code ?? '')
          : '';
      this.logger.error(
        `SMTP sendMail falló to=${to} code=${code || 'n/a'}: ${raw}`,
        err instanceof Error ? err.stack : undefined,
      );
      let message = 'No se pudo enviar el correo por SMTP.';
      if (code === 'EAUTH' || /auth|credentials|535|534/i.test(raw)) {
        message =
          'SMTP rechazó la autenticación. Revise MAIL_SMTP_USER y MAIL_SMTP_PASS.';
      } else if (
        code === 'ECONNECTION' ||
        code === 'ETIMEDOUT' ||
        /ECONNREFUSED/i.test(raw)
      ) {
        message =
          'No hay conexión con el servidor SMTP. Revise MAIL_SMTP_HOST, puerto y firewall.';
      } else if (code === 'certificate' || /certificate|TLS|SSL/i.test(raw)) {
        message =
          'Error de certificado/TLS con el servidor SMTP. Revise MAIL_SMTP_SECURE y el puerto.';
      } else if (raw.length > 0 && raw.length < 280) {
        message = raw;
      }
      throw new MailSendFailedException(message);
    }
  }
}
