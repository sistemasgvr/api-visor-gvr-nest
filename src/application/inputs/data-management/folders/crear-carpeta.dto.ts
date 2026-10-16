export class CrearCarpetaDto {
  data: {
    type: string;
    attributes: {
      name: string;
      extension?: {
        type: string;
        version: string;
      };
    };
    relationships: {
      parent: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  };
}
