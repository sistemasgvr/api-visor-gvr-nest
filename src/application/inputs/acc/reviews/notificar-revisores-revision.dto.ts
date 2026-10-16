export const NOTIFY_REVIEW_SCENARIOS = [
  'skip',
  'return',
  'submit',
  'sidebar',
] as const;
export type NotifyReviewScenario = (typeof NOTIFY_REVIEW_SCENARIOS)[number];

export class NotificarRevisorDestinatarioDto {
  email: string;

  name?: string;
}

export class NotificarRevisoresRevisionDto {
  recipients: NotificarRevisorDestinatarioDto[];

  scenario: NotifyReviewScenario;

  message?: string;

  stepTitle: string;

  /** Para construir enlace al detalle en el front: /gestionbim/docs/:idHub/:projectId/revisiones/:id */

  idHub: string;
}
