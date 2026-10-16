class ProductImportDto {
  key: string;

  access: string;
}

class UsuarioProyectoImportDto {
  email: string;

  companyId?: string;

  roleIds?: string[];

  products?: ProductImportDto[];
}

export class ImportarUsuariosProyectoDto {
  users: UsuarioProyectoImportDto[];

  region?: string;

  user_id?: string;
}
