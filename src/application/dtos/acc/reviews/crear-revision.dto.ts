import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CrearRevisionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    /** ID interno GVR del flujo (numérico en string). */
    @IsNotEmpty()
    @IsString()
    workflowId: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    linkedDocuments?: Array<{ versionUrn?: string; urn?: string; itemUrn?: string; itemId?: string }>;
}
