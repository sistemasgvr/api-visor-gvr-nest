import {
    IsArray,
    IsEmail,
    IsIn,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export const NOTIFY_REVIEW_SCENARIOS = ['skip', 'return', 'submit', 'sidebar'] as const;
export type NotifyReviewScenario = (typeof NOTIFY_REVIEW_SCENARIOS)[number];

export class NotificarRevisorDestinatarioDto {
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    name?: string;
}

export class NotificarRevisoresRevisionDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => NotificarRevisorDestinatarioDto)
    recipients: NotificarRevisorDestinatarioDto[];

    @IsIn(NOTIFY_REVIEW_SCENARIOS)
    scenario: NotifyReviewScenario;

    @IsString()
    @MaxLength(5000)
    @IsOptional()
    message?: string;

    @IsString()
    @MinLength(1)
    @MaxLength(500)
    stepTitle: string;

    /** Para construir enlace al detalle en el front: /gestionbim/docs/:idHub/:projectId/revisiones/:id */
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    idHub: string;
}
