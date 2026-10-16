import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ObtenerUrlsSubidaChunkedDto {
  @IsNotEmpty()
  @IsString()
  bucketKey: string;

  @IsNotEmpty()
  @IsString()
  objectKey: string;

  @IsNotEmpty()
  @IsString()
  uploadKey: string;

  @IsInt()
  @Min(1)
  firstPart: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  parts?: number;
}
