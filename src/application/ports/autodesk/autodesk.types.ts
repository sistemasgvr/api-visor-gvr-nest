export interface Token2LeggedResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: Date;
}

export interface Token3LeggedResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  expires_at: Date;
}
