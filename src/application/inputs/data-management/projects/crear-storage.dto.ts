export class CrearStorageDto {
  data: {
    type: string;
    attributes: {
      name: string;
    };
    relationships: {
      target: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  };
}
