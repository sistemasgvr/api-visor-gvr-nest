import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CrearRevisionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUUID()
    @IsNotEmpty()
    workflowId: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    reviewers?: any[];

    @IsOptional()
    linkedDocuments?: any[];
}
