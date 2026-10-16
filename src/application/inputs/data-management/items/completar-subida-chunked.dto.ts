export class CompletarSubidaChunkedDto {
  folderId: string;

  fileName: string;

  storageId: string;

  bucketKey: string;

  objectKey: string;

  uploadKey: string;

  fileSize: number;

  eTags?: string[];
}
