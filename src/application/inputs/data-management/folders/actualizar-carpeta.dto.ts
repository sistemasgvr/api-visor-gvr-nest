export class ActualizarCarpetaDto {
  data: {
    type: string;
    id: string;
    attributes: {
      displayName?: string;
      name?: string;
      hidden?: boolean;
    };
  };
}
