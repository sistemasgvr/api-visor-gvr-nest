export interface RenderedMail {
    subject: string;
    html: string;
    text?: string;
}

export interface IMailRenderer {
    render(
        templateId: string,
        variables: Record<string, unknown>,
        subjectOverride?: string,
    ): Promise<RenderedMail>;
}

export const MAIL_RENDERER = 'MAIL_RENDERER';
