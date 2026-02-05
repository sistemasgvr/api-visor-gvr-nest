# Docker Setup para api-visor-gvr-nest

Este documento explica cómo construir, subir y desplegar la imagen Docker de la aplicación.

## 📦 Construir la imagen Docker

### Construcción local

```bash
docker build -t api-visor-gvr-nest:latest .
```

### Construcción con tag para Docker Hub

```bash
docker build -t tu-usuario/api-visor-gvr-nest:latest .
```

Reemplaza `tu-usuario` con tu nombre de usuario de Docker Hub.

## 🚀 Subir a Docker Hub

### 1. Iniciar sesión en Docker Hub

```bash
docker login
```

### 2. Etiquetar la imagen (si no lo hiciste en el build)

```bash
docker tag api-visor-gvr-nest:latest tu-usuario/api-visor-gvr-nest:latest
```

### 3. Subir la imagen

```bash
docker push tu-usuario/api-visor-gvr-nest:latest
```

### 4. Subir con versión específica (recomendado)

```bash
# Construir con versión
docker build -t tu-usuario/api-visor-gvr-nest:1.0.0 .
docker build -t tu-usuario/api-visor-gvr-nest:latest .

# Subir ambas
docker push tu-usuario/api-visor-gvr-nest:1.0.0
docker push tu-usuario/api-visor-gvr-nest:latest
```

## 🎯 Desplegar en Easy Panel

### Configuración en Easy Panel

1. **Crear nueva aplicación**
   - Tipo: Docker
   - Imagen: `tu-usuario/api-visor-gvr-nest:latest`

2. **Variables de entorno**

   **Requeridas:**

   ```env
   # Requeridas
   NODE_ENV=production
   PORT=4001
   DB_HOST=tu-host-postgres
   DB_PORT=5432
   DB_USERNAME=tu-usuario
   DB_PASSWORD=tu-password
   DB_DATABASE=tu-database
   DB_SYNCHRONIZE=false
   DB_LOGGING=false
   AUTODESK_CLIENT_ID=tu-client-id
   AUTODESK_CLIENT_SECRET=tu-client-secret
   AUTODESK_CALLBACK_URL=tu-callback-url
   ALLOWED_ORIGINS=https://tu-frontend.com,https://otro-origen.com
   
   # Opcionales
   APP_URL=https://tu-api.com  # Solo para logging/información en consola
   ```

3. **Configuración de puerto**
   - Puerto del contenedor: `4001`
   - Puerto expuesto: El que Easy Panel asigne (o el que configures)

4. **Health Check** (opcional pero recomendado)
   - Endpoint: `/api/health`
   - Intervalo: 30s
   - Timeout: 3s

5. **Recursos**
   - Memoria: Mínimo 512MB, recomendado 1GB
   - CPU: 0.5-1 core

### Notas importantes

- Asegúrate de que la base de datos PostgreSQL sea accesible desde el contenedor
- Configura `ALLOWED_ORIGINS` con los dominios de tu frontend
- `DB_SYNCHRONIZE` debe estar en `false` en producción
- El health check está configurado en el Dockerfile, pero necesitarás crear el endpoint `/api/health` en tu aplicación

## 🔧 Desarrollo local con Docker Compose

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 📝 Comandos útiles

```bash
# Ver imágenes locales
docker images | grep api-visor-gvr-nest

# Ejecutar contenedor localmente
docker run -p 4001:4001 --env-file .env tu-usuario/api-visor-gvr-nest:latest

# Ver logs del contenedor
docker logs -f <container-id>

# Entrar al contenedor
docker exec -it <container-id> sh
```

## 🐛 Troubleshooting

### La aplicación no inicia
- Verifica las variables de entorno
- Revisa los logs: `docker logs <container-id>`
- Asegúrate de que la base de datos sea accesible

### Error de conexión a la base de datos
- Verifica `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`
- Asegúrate de que el contenedor pueda acceder a la base de datos
- En Easy Panel, verifica la configuración de red

### CORS errors
- Configura `ALLOWED_ORIGINS` con los dominios correctos
- No uses `*` en producción

## Comandos para crear y subir imagen a Docker

# 1. Construir nueva imagen
docker build -t tuusuario/mi-proyecto-nestjs:latest .
docker build -t santossjba/visor-gvr:latest .
docker build -t sistemasgvr/visor-gvr:latest .

# 2. Subir a Docker Hub
docker push tuusuario/mi-proyecto-nestjs:latest
docker push santossjba/visor-gvr:latest
docker push sistemasgvr/visor-gvr:latest

---

## 📄 Collabora Online: Integración para edición de documentos

### **Descripción**
Collabora Online es el servidor de edición de documentos Office integrado en este proyecto. Permite editar documentos Word, Excel y PowerPoint directamente en el navegador.

### **Configuración del servidor Collabora**

#### **1. Variables de entorno en EasyPanel/Docker**

```env
# Imagen Docker
collabora/code:25.04.8.1.1

# Variables de entorno OBLIGATORIAS
domain=gestion\.proyectosgvr\.com
extra_params=--o:ssl.enable=true

# Puerto interno
9980
```

**Notas importantes:**
- `domain` es una expresión regular. Los puntos (`.`) deben escaparse como `\.`
- No incluir `https://` en el dominio
- El dominio debe ser el del **frontend** (donde se embede el iframe)
- Reiniciar el contenedor después de cambiar variables de entorno

#### **2. Verificación**

Accede a `https://tu-servidor-collabora.com/hosting/discovery`. Si ves un XML, Collabora está funcionando correctamente.

### **Configuración del backend (NestJS)**

#### **1. Variables de entorno**

Agrega a tu `.env`:

```env
# Collabora Online Configuration
COLLABORA_URL=https://gvr-collabora.0diobd.easypanel.host

# Backend public URL (para que Collabora pueda descargar archivos)
BACKEND_PUBLIC_URL=https://tu-backend.com
```

#### **2. Endpoints disponibles**

- `GET /api/collabora/config/:projectId/:itemId` - Obtiene la configuración y URL de Collabora para un documento
- `GET /api/collabora/download/:token` - Sirve el archivo a Collabora (proxy desde Autodesk ACC)
- `GET /api/collabora/health` - Health check de Collabora

### **Configuración del frontend (Vue.js)**

#### **1. Variables de entorno**

Agrega a tu `.env`:

```env
VITE_COLLABORA_URL=https://gvr-collabora.0diobd.easypanel.host
VITE_API_URL=https://tu-backend.com/api
```

#### **2. Uso**

El componente `OfficeViewer.vue` ya está configurado para usar Collabora. Simplemente carga un documento y el iframe de Collabora se mostrará automáticamente.

### **Arquitectura**

```
Usuario → Frontend (Vue)
         ↓
         Backend (NestJS)
         ├─ Valida permisos
         ├─ Obtiene archivo de Autodesk ACC
         ├─ Genera URL de Collabora
         └─ Devuelve config al frontend
         ↓
         Frontend abre iframe con Collabora
         ↓
         Collabora descarga archivo desde backend
         (Backend hace proxy desde Autodesk ACC)
```

### **Diferencias con ONLYOFFICE**

| Característica | Collabora | ONLYOFFICE |
|---------------|-----------|------------|
| Protocolo | Iframe directo | JWT + Callback |
| Complejidad | Baja | Alta |
| JWT | No requiere | Requiere |
| WOPI | No requiere | No requiere |
| Callbacks | No | Sí (para guardar) |
| Edición colaborativa | Sí | Sí |
| Límite de usuarios | ~20 concurrentes | Según licencia |

### **Troubleshooting**

#### **Error: CSP `frame-ancestors` violation**

**Problema:** El navegador bloquea el iframe de Collabora.

**Solución:**
1. Verifica que `domain` en las variables de entorno de Collabora incluya el dominio de tu frontend
2. El formato correcto es: `domain=tudominio\.com` (escapar puntos)
3. Reinicia el contenedor de Collabora

#### **Error: Collabora no descarga el archivo**

**Problema:** Collabora muestra "Error loading document".

**Solución:**
1. Verifica que `BACKEND_PUBLIC_URL` apunte a tu backend público (no `localhost`)
2. Asegúrate de que el backend pueda acceder a Autodesk ACC
3. Revisa los logs del backend: `docker logs <backend-container-id>`

#### **Error: Discovery XML no aparece**

**Problema:** `https://tu-collabora.com/hosting/discovery` devuelve 404 o error.

**Solución:**
1. Verifica que el contenedor de Collabora esté corriendo
2. Revisa las variables de entorno del contenedor
3. Reinicia el contenedor

### **Limitaciones**

- **Usuarios concurrentes:** ~20 usuarios simultáneos (edición colaborativa)
- **Tamaño de archivo:** Limitado por la memoria del contenedor
- **Formatos soportados:** Office (doc, xls, ppt) y OpenDocument (odt, ods, odp)

### **Recursos recomendados**

```yaml
# Docker Compose / EasyPanel
services:
  collabora:
    memory: 2GB
    cpus: "1.0"
```