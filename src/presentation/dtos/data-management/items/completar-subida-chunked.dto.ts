import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CompletarSubidaChunkedDto {
  @IsNotEmpty()
  @IsString()
  folderId: string;

  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  storageId: string;

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
  fileSize: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10000)
  eTags?: string[];
}
