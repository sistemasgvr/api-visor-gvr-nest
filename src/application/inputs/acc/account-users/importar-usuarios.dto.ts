class UsuarioImportDto {
  email: string;

  company_id?: string;

  first_name?: string;

  last_name?: string;
}

export class ImportarUsuariosDto {
  users: UsuarioImportDto[];

  region?: string;
}
