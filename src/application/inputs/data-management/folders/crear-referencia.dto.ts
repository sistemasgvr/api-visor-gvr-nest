export class CrearReferenciaDto {
  data: {
    type: string;
    id?: string;
    meta: {
      extension?: {
        type: string;
        version: string;
      };
    };
  };
}
