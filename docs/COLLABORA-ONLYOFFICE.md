# Edición colaborativa de documentos Office (Collabora y alternativa OnlyOffice)

Este documento describe cómo está integrada la edición colaborativa con **Collabora Online**, cómo diagnosticar y mejorar su funcionamiento, y la **alternativa con OnlyOffice Document Server** si necesitas mayor estabilidad o compatibilidad.

---

## 1. Situación actual: Collabora Online + WOPI

- **Backend (NestJS)**: Implementa el protocolo WOPI (CheckFileInfo, GetFile, PutFile). El archivo se obtiene de Autodesk ACC (URL firmada S3) y se sirve a Collabora; al guardar, se sube una nueva versión a ACC.
- **Edición colaborativa**: Para que varios usuarios compartan la misma sesión (ver quién está conectado y ver las ediciones en vivo), el backend usa un **ID de documento estable** por `(projectId, itemId)` y un **access_token** por usuario en la URL WOPI. Así todos abren el mismo documento en Collabora y Collabora muestra la lista de coeditores y sincroniza los cambios en tiempo real.
- **Frontend (Vue)**: `OfficeViewer.vue` obtiene la config desde `GET /api/collabora/config/:projectId/:itemId` y carga la URL de Collabora en un iframe. La lista de usuarios conectados y los cambios en vivo se ven **dentro del editor** (barra de Collabora).
- **Collabora**: Se despliega en un contenedor (ej. en EasyPanel) y se comunica con el backend mediante WOPI usando `BACKEND_PUBLIC_URL`.

---

## 2. Diagnóstico: por qué Collabora “no funciona al 100%”

Sigue esta checklist para asegurar que todo esté bien configurado.

### 2.1 Backend (NestJS)

| Punto | Variable / Comportamiento | Qué comprobar |
|-------|---------------------------|----------------|
| URL pública | `BACKEND_PUBLIC_URL` | Debe ser la URL **pública** del backend (ej. `https://api.tudominio.com`), **no** `localhost`. Collabora (en otro servidor) llama a tu backend por esta URL. |
| CORS | `FRONTEND_URLS` y `COLLABORA_URL` | En `main.ts` se permiten orígenes de `FRONTEND_URLS` y `COLLABORA_URL`. Incluye el dominio de Collabora (ej. `https://gvr-collabora.0diobd.easypanel.host`). |
| Raw body WOPI | `req.rawBody` en PutFile | En `main.ts` el middleware `json()` guarda `req.rawBody` para rutas que contienen `/collabora/wopi/files/` y `/contents`. Si PutFile recibe body vacío o no Buffer, revisa que la petición no pase por otro middleware que consuma el body. |
| Token WOPI | `DocumentTokenService` | El token que se devuelve en `config` (y que va en la URL de Collabora) tiene una vida limitada (ej. 60 min). Si el usuario deja la pestaña abierta mucho tiempo, el token puede expirar y dejar de poder guardar. |
| Autodesk | Token 3-legged y permisos | El usuario debe tener token de Autodesk válido y permisos sobre el proyecto/archivo. Si falla GetFile o PutFile, revisa logs del backend (CheckFileInfo, GetFile, PutFile). |

### 2.2 Servidor Collabora (contenedor)

| Punto | Variable / Comportamiento | Qué comprobar |
|-------|---------------------------|----------------|
| Dominio permitido | `domain` | Debe ser una **expresión regular** que coincida con el dominio del **frontend** (donde se carga el iframe). Ej: `domain=gestion\.proyectosgvr\.com`. Los puntos deben ir escapados (`\.`). **No** incluyas `https://`. |
| Discovery | `/hosting/discovery` | Abre `https://tu-collabora.com/hosting/discovery`. Debe responder con un XML. Si da 404 o error, el contenedor no está bien levantado o la ruta no está expuesta. |
| SSL | `extra_params` | Si usas proxy inverso (EasyPanel) con SSL delante de Collabora, suele usarse `extra_params=--o:ssl.enable=false --o:ssl.termination=true`. Ajusta según la documentación de tu imagen. |
| frame-ancestors | `net.frame_ancestors` | Si el navegador muestra error de CSP `frame-ancestors`, hay que permitir el origen del frontend. En algunas imágenes se hace con `extra_params=... --o:net.frame_ancestors=https://tudominio.com`. |
| Recursos | RAM / CPU | Collabora es pesado. Menos de 2 GB RAM puede dar fallos o cierres inesperados. |

### 2.3 Frontend (Vue)

| Punto | Comportamiento | Qué comprobar |
|-------|----------------|----------------|
| URL de Collabora | `VITE_COLLABORA_URL` | Solo se usa si en algún sitio construyes URLs a mano. La URL que abre el iframe viene del backend (`collaboraUrl` en la respuesta de `/api/collabora/config/...`). |
| Iframe | `OfficeViewer.vue` | El iframe usa `collaboraUrl` que devuelve el backend. Comprueba que no haya políticas CSP en tu app que bloqueen el iframe desde el dominio de Collabora. |
| Parámetros | `idProyecto`, `idItem` | Se pasan por `route.query`. Si faltan, verás “Parámetros de documento no válidos”. |

### 2.4 Flujo rápido de pruebas

1. **Discovery**: `curl -I https://tu-collabora.com/hosting/discovery` → 200 y contenido XML.
2. **Config**: Con usuario logueado, `GET /api/collabora/config/{projectId}/{itemId}` con Bearer JWT → 200 y `collaboraUrl` en el JSON.
3. **CheckFileInfo**: Abre en el navegador la URL que tenga `WOPISrc=...` (codificada). Es una petición GET a tu backend; debe devolver JSON con `BaseFileName`, `Size`, etc.
4. **GetFile**: Es la que hace Collabora para descargar el contenido. Revisa logs del backend (“WOPI GetFile”) y que no haya 403/404/500.
5. **PutFile**: Edita algo y guarda. Revisa logs “WOPI PutFile” y que la nueva versión aparezca en ACC.

Si algo falla en 3–5, el problema suele ser: token expirado, `BACKEND_PUBLIC_URL` incorrecta, CORS, o que el body de PutFile no llegue como binary (raw body).

---

## 3. Alternativa: OnlyOffice Document Server

Si tras revisar lo anterior Collabora sigue sin cumplir tus expectativas, **OnlyOffice Document Server** es una alternativa sólida para edición colaborativa de Office (.docx, .xlsx, .pptx). Usa un modelo distinto a WOPI: tú generas una **configuración del editor** (document.key, url, callback, etc.) y OnlyOffice hace **callbacks** a tu backend para descargar y guardar el archivo.

### 3.1 Diferencias resumidas

| Aspecto | Collabora (actual) | OnlyOffice |
|---------|--------------------|------------|
| Protocolo | WOPI (CheckFileInfo, GetFile, PutFile) | Document Server API: config JSON + callbacks |
| Quién inicia la descarga | Collabora llama a tu GetFile | Tú pasas en la config la URL de descarga (o OnlyOffice llama a tu “document server” según doc) |
| Guardado | Collabora envía PUT/POST a tu PutFile | OnlyOffice hace POST al `callbackUrl` con estado (ej. 2 = listo para guardar); tú descargas el binario desde OnlyOffice y lo subes a ACC |
| Autenticación | Token en la URL (WOPI) | JWT recomendado (firmas en config y en callbacks) |
| Edición colaborativa | Sí | Sí |

### 3.2 Despliegue de OnlyOffice en EasyPanel

- Imagen recomendada: `onlyoffice/documentserver` (revisa en Docker Hub la tag estable).
- Variables típicas:
  - `JWT_SECRET=<clave_secreta_larga>` (la misma que usará tu backend para firmar la config y validar callbacks).
  - Otros según documentación oficial (idioma, límites, etc.).
- Puerto interno típico: 80. Exponer HTTPS por delante (EasyPanel suele encargarse).

Documentación oficial:
- [Document Server API](https://api.onlyoffice.com/editors/basic)
- [Callback handler](https://api.onlyoffice.com/docs/docs-api/usage-api/callback-handler/)
- [JWT](https://helpcenter.onlyoffice.com/docs/installation/docs-configure-jwt.aspx)

### 3.3 Integración con tu stack (NestJS + Vue + ACC)

Pasos conceptuales (para implementar cuando decidas cambiar):

1. **Backend**
   - Añadir variables de entorno: `ONLYOFFICE_SERVER_URL`, `ONLYOFFICE_JWT_SECRET` (y opcionalmente `BACKEND_PUBLIC_URL` si ya no lo tienes).
   - Crear un módulo “OnlyOffice” (o ampliar el de documentos) con:
     - **GET** (o POST) **config del editor**: mismo flujo que Collabora hasta tener `projectId`, `itemId`, usuario y token de Autodesk; generar una clave de documento estable (ej. `projectId_itemId` o un UUID por sesión) y una URL de descarga temporal (endpoint de tu backend que, con token/JWT, devuelve el binario del archivo desde ACC).
     - Construir el [document config](https://api.onlyoffice.com/editors/basic) de OnlyOffice: `url` = URL de descarga del documento, `callbackUrl` = URL de tu backend que recibirá los callbacks, `key` = clave única por documento/versión, `document.type`, `document.title`, `editorConfig.lang`, etc. Si usas JWT, firmar este objeto con `ONLYOFFICE_JWT_SECRET`.
     - Devolver al frontend la config (o la URL del iframe de OnlyOffice con la config pasada por query/postMessage según cómo lo exponga OnlyOffice).
   - **Endpoint de callback** (POST): OnlyOffice enviará aquí el estado del documento. Cuando `status` sea 2 o 6 (documento listo para guardar), descargar el archivo desde la URL que OnlyOffice indica en el callback (o desde el cuerpo si aplica), y subir esa versión a ACC (misma lógica que en tu PutFile actual: storage, S3, completar, crear versión). Respuesta esperada por OnlyOffice: `{ "error": 0 }` en éxito.
   - Opcional: endpoint que sirva el binario del documento (para la `url` del config) con autenticación por token/JWT, reutilizando la lógica actual de descarga desde ACC.

2. **Frontend**
   - Crear un componente “OnlyOffice Viewer” (o una variante de `OfficeViewer`) que:
     - Llame al nuevo endpoint de config del editor (NestJS).
     - Inserte el iframe de OnlyOffice con la URL que devuelva el backend (o cargue el editor con la config según el método que elijas). OnlyOffice suele ofrecer una URL que recibe la config por parámetro o por postMessage.

3. **Seguridad**
   - Usar JWT en todas las peticiones entre tu app y OnlyOffice (config y callbacks). Validar en el callback la firma que envíe OnlyOffice.
   - La URL de descarga del documento debe ser temporal y asociada al usuario/sesión para no exponer ACC.

4. **Guardado en ACC**
   - En el callback, al recibir “guardar”, descargar el binario desde OnlyOffice (según la doc del callback) y reutilizar la misma lógica que ya tienes en `wopiPutFile` (crear storage, S3, completar, crear versión en el item).

Con esto puedes mantener Collabora como está y, en paralelo, implementar OnlyOffice para comparar rendimiento y estabilidad, o cambiar por completo cuando estés satisfecho.

---

## 4. Resumen

- Para que **Collabora** funcione bien: revisa `BACKEND_PUBLIC_URL`, `domain` (y frame-ancestors) en Collabora, CORS, raw body en PutFile, y tokens/permisos de Autodesk.
- Si aun así no te convence: **OnlyOffice Document Server** es una alternativa con otro modelo (config + callback) que se integra con tu backend actual descargando desde ACC y subiendo la nueva versión en el callback.

Si indicas qué falla exactamente con Collabora (ej. “no carga el documento”, “no guarda”, “error en discovery”), se puede afinar el diagnóstico o priorizar los endpoints de OnlyOffice en el backend.
