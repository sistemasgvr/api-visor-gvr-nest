import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../../services/mail.service';
import { ObtenerRevisionPorIdUseCase } from './obtener-revision-por-id.use-case';
import { envs } from '../../../../config/envs';
import type { NotificarRevisoresRevisionDto } from '../../../dtos/acc/reviews/notificar-revisores-revision.dto';
import { EMAIL_TEMPLATE_IDS } from '../../../../domain/mail/email-template-id';

const SCENARIO_HEADINGS: Record<string, string> = {
    skip: 'Se ha saltado un paso en la revisión',
    return: 'La revisión ha vuelto al paso anterior',
    submit: 'Se ha entregado una reseña en la revisión',
    sidebar: 'Notificación sobre la revisión',
};

@Injectable()
export class NotificarRevisoresRevisionUseCase {
    private readonly logger = new Logger(NotificarRevisoresRevisionUseCase.name);

    constructor(
        private readonly mailService: MailService,
        private readonly obtenerRevisionPorIdUseCase: ObtenerRevisionPorIdUseCase,
    ) { }

    async execute(
        userId: number,
        projectId: string,
        reviewId: string,
        dto: NotificarRevisoresRevisionDto,
    ): Promise<{ sent: number }> {
        const review = await this.obtenerRevisionPorIdUseCase.execute(userId, projectId, reviewId);
        if (review == null) {
            throw new BadRequestException('Revisión no encontrada.');
        }

        const rec = (dto.recipients ?? [])
            .map((r) => ({
                email: (r.email ?? '').trim().toLowerCase(),
                name: r.name?.trim() || undefined,
            }))
            .filter((r) => r.email.length > 0);
        if (rec.length === 0) {
            throw new BadRequestException('Se requiere al menos un destinatario con correo válido.');
        }

        const baseUrl = (envs.frontendUrls[0] ?? '').replace(/\/$/, '');
        const reviewDetailUrl = `${baseUrl}/gestionbim/docs/${dto.idHub}/${projectId}/revisiones/${encodeURIComponent(reviewId)}`;

        const seq = (review as { sequenceId?: number }).sequenceId;
        const name = String((review as { name?: string }).name ?? '').trim();
        const reviewLabel =
            seq != null && Number.isFinite(Number(seq))
                ? `#${seq}${name ? ` — ${name}` : ''}`
                : name || reviewId;

        const actionHeading = SCENARIO_HEADINGS[dto.scenario] ?? SCENARIO_HEADINGS.sidebar;
        const appName = 'GVR PE';
        const message = (dto.message ?? '').trim();

        let sent = 0;
        for (const r of rec) {
            try {
                await this.mailService.enqueue({
                    templateId: EMAIL_TEMPLATE_IDS.REVISION_REVIEWER_NOTIFY,
                    to: [{ email: r.email, name: r.name }],
                    variables: {
                        appName,
                        title: actionHeading,
                        actionHeading,
                        reviewLabel,
                        stepTitle: dto.stepTitle,
                        message,
                        reviewDetailUrl,
                        recipientName: r.name || '',
                    },
                });
                sent += 1;
            } catch (e) {
                this.logger.warn(
                    `No se pudo encolar correo a ${r.email}: ${e instanceof Error ? e.message : String(e)}`,
                );
            }
        }

        if (sent === 0) {
            throw new BadRequestException('No se pudo encolar ningún correo.');
        }

        return { sent };
    }
}
