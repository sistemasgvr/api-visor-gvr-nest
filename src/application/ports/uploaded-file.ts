import type { Readable } from 'node:stream';

/** Archivo recibido por un adaptador; compatible con Multer sin depender de Express. */
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  stream: Readable;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}
