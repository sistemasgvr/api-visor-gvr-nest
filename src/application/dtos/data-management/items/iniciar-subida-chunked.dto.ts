import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class IniciarSubidaChunkedDto {
  @IsNotEmpty()
  @IsString()
  folderId: string;

  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsInt()
  @Min(1)
  fileSize: number;

  @IsOptional()
  @IsInt()
  @Min(1024 * 1024)
  @Max(512 * 1024 * 1024)
  partSizeBytes?: number;
}
