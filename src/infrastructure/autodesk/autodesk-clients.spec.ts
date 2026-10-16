import { ConfigService } from '@nestjs/config';
import type { HttpClientService } from '../http/http-client.service';
import { AutodeskApiService } from '../services/autodesk-api.service';

describe('Clientes de Autodesk detrás de la fachada compatible', () => {
  const get = jest.fn();
  const post = jest.fn();
  let service: AutodeskApiService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new AutodeskApiService(
      { get, post } as unknown as HttpClientService,
      new ConfigService({
        AUTODESK_CLIENT_ID: 'fixture-client',
        AUTODESK_CLIENT_SECRET: 'fixture-secret',
        AUTODESK_CALLBACK_URL: 'https://callback.test',
      }),
    );
  });

  it('conserva el flujo entre administración y autenticación cuando no se proporciona token', async () => {
    post.mockResolvedValue({
      data: {
        access_token: 'fixture-token',
        token_type: 'Bearer',
        expires_in: 3600,
      },
    });
    get.mockResolvedValue({ data: { results: [{ id: 'project-1' }] } });
    const result = await service.getAccProjects('account/one', { limit: 10 });
    expect(post).toHaveBeenCalledWith(
      'https://developer.api.autodesk.com/authentication/v2/token',
      'grant_type=client_credentials&scope=account%3Aread',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      }),
    );
    expect(get).toHaveBeenCalledWith(
      'https://developer.api.autodesk.com/construction/admin/v1/accounts/account%2Fone/projects?limit=10',
      { headers: { Authorization: 'Bearer fixture-token' } },
    );
    expect(result).toEqual({ results: [{ id: 'project-1' }] });
  });

  it('conserva los métodos síncronos y evita pedir un token si ya se proporcionó', async () => {
    get.mockResolvedValue({ data: { results: [] } });
    await service.getAccProjects('account', {}, 'existing-token');
    expect(post).not.toHaveBeenCalled();
    const url = new URL(service.generarUrlAutorizacion(['data:read'], 'state'));
    expect(url.searchParams.get('client_id')).toBe('fixture-client');
    expect(url.searchParams.get('redirect_uri')).toBe('https://callback.test');
    expect(url.searchParams.get('state')).toBe('state');
  });
});
