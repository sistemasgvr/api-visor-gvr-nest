class ProductDto {
  key: string;

  access: string;
}

export class ActualizarUsuarioProyectoDto {
  companyId?: string;

  roleIds?: string[];

  products?: ProductDto[];

  region?: string;

  user_id?: string;
}
