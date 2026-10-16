class ProductDto {
  key: string;

  access: string;
}

export class AgregarUsuarioProyectoDto {
  email: string;

  companyId?: string;

  roleIds?: string[];

  products?: ProductDto[];

  region?: string;

  user_id?: string;
}
