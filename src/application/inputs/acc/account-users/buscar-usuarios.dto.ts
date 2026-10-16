export class BuscarUsuariosDto {
  name: string;

  limit?: number;

  offset?: number;

  operator?: string;

  partial?: boolean;

  region?: string;
}
