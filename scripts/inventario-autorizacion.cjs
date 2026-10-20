// Inventario declarativo actual. Sólo reflexión: no inicia Nest ni consulta SQL/proveedores.
require('reflect-metadata');
require('ts-node/register/transpile-only');
const fs = require('node:fs');
const path = require('node:path');
const { PATH_METADATA, METHOD_METADATA } = require('@nestjs/common/constants');
const { GRANULAR_REQUIREMENT, GRANULAR_CONTEXTUAL, GRANULAR_AUTHENTICATED } = require('../src/infrastructure/auth/granular-permission.guard');
const { isSessionEndpoint } = require('../src/infrastructure/auth/http-authorization-exceptions');
const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ALL', 'OPTIONS', 'HEAD', 'SEARCH'];
const dir = path.resolve(__dirname, '../src/presentation/controllers');
const endpoints = [];
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.controller.ts'))) {
  for (const type of Object.values(require(path.join(dir, file)))) {
    if (typeof type !== 'function' || !Reflect.hasMetadata(PATH_METADATA, type)) continue;
    const visited = new Set();
    for (let proto = type.prototype; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
      for (const name of Object.getOwnPropertyNames(proto)) {
        if (visited.has(name)) continue;
        visited.add(name);
        const handler = Object.getOwnPropertyDescriptor(proto, name)?.value;
        if (typeof handler !== 'function' || !Reflect.hasMetadata(METHOD_METADATA, handler)) continue;
        const meta = (key) => Reflect.getMetadata(key, handler) ?? Reflect.getMetadata(key, type);
        const bases = [Reflect.getMetadata(PATH_METADATA, type)].flat();
        const routes = [Reflect.getMetadata(PATH_METADATA, handler)].flat();
        for (const base of bases) for (const route of routes) {
          endpoints.push({ controlador: type.name, funcion: name,
            metodo: methods[Reflect.getMetadata(METHOD_METADATA, handler)],
            ruta: '/' + [base, route].filter(Boolean).join('/').replace(/\/+/g, '/').replace(/^\/|\/$/g, ''),
            claves: meta(GRANULAR_REQUIREMENT) || [],
            contexto: meta(GRANULAR_CONTEXTUAL) ?? meta(GRANULAR_AUTHENTICATED) ?? null,
            sesionOProtocolo: isSessionEndpoint(type.name, name) });
        }
      }
    }
  }
}
process.stdout.write(JSON.stringify({ endpoints }));
