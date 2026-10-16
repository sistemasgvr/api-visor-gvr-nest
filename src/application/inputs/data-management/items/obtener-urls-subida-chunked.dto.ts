export class ObtenerUrlsSubidaChunkedDto {
  bucketKey: string;

  objectKey: string;

  uploadKey: string;

  firstPart: number;

  parts?: number;
}
