# Cómo hacer que una plantilla de correo funcione en GVR

Guía simple para otro desarrollador. Sin asumir que ya conoce el sistema de mails.

---

## ¿Qué hay que entender primero?

Un correo automático en GVR tiene **3 partes**:

1. **La plantilla** — el diseño del correo (texto, colores, botones). Se arma en el admin web.
2. **Los datos** — nombre, correo, etc. Cambian en cada envío.
3. **El disparador** — el código que dice *"cuando pase X, manda este correo"*.

La plantilla **no se envía sola**. Alguien tiene que programar el disparador en el backend.

---

## Idea general (en 3 pasos)

```
PASO 1 — Diseñador / dev front
   Crea la plantilla en "Plantillas de correo"
   y la prueba con Vista previa / Enviar prueba

PASO 2 — Dev backend
   Escribe código que diga: "cuando ocurra el evento,
   manda la plantilla X con estos datos"

PASO 3 — Servidor
   Configura el correo en .env (SMTP) para que
   el mail salga de verdad
```

---

# PARTE 1 — Crear y probar la plantilla (admin web)

Entra a: **Administración → Plantillas de correo**

## Paso 1: Datos básicos

| Campo | Qué poner | Ejemplo |
|-------|-----------|---------|
| **Slug** | Código único de la plantilla. El backend lo usará tal cual. | `welcome` |
| **Nombre** | Solo para identificarla en la lista | `Bienvenida` |
| **Asunto** | Título del correo. Puede llevar variables | `Bienvenido a {{appName}}` |
| **Estado** | Debe estar **Activa** | Activa |

**Regla del slug:** minúsculas, sin espacios, palabras separadas con guión.  
Ejemplos válidos: `welcome`, `reset-password`, `aviso-revision`

## Paso 2: Diseñar el correo

En el editor visual (GrapesJS):

- Todo lo que **no cambia** (textos fijos, logos, URLs de botones) → escríbelo normal.
- Lo que **sí cambia** por persona → usa variables con doble llave:

```
Hola, {{name}}!
Tu usuario es: {{userEmail}}
Equipo de {{appName}}
```

**Importante:**

- El nombre de la variable debe ser **exactamente igual** en el diseño, en el JSON de prueba y en el código backend.
- `{{userEmail}}` y `{{userEmil}}` son cosas distintas. Un typo = la variable no se reemplaza.

## Paso 3: Probar con el JSON de la izquierda

A la izquierda del editor hay **Variables de prueba** (un JSON).

- Al abrir la plantilla, el sistema detecta las variables del diseño y crea las claves vacías.
- Pon valores de ejemplo:

```json
{
  "name": "Juan Pérez",
  "appName": "GVR PE",
  "userEmail": "juan@ejemplo.com"
}
```

- Si agregaste una variable nueva al diseño → clic en **Detectar del template**.
- **Guardar** la plantilla.

> El JSON de prueba solo sirve para probar en el admin. **No** es lo que se usa en producción.

## Paso 4: Confirmar que funciona

Antes de tocar código backend:

1. **Vista previa** → las variables deben verse reemplazadas (no debe aparecer `{{name}}` crudo).
2. **Enviar prueba** → llega un correo real a tu bandeja.
3. En el listado, la plantilla debe estar **Activa**.

Si esto falla, arregla la plantilla antes de seguir.

---

# PARTE 2 — Conectar la plantilla al backend (NestJS)

Aquí entra el dev backend. Objetivo: **mandar el correo cuando pase algo** (crear trabajador, aprobar algo, etc.).

## ¿De dónde salen los datos? (pregunta frecuente)

| Dato | De dónde viene |
|------|----------------|
| Diseño del correo (HTML, asunto) | Base de datos, tabla `mailPlantillaCorreo`, buscado por **slug** |
| `name`, `userEmail`, etc. | El **código backend** los arma cuando ocurre el evento |
| `appName` (ejemplo) | Suele salir del `.env` → `MAIL_FROM_NAME` |

**No hace falta crear una función SQL solo para enviar el correo.**  
La función SQL (ej. `tra_CrearTrabajador`) guarda al trabajador. El mail se manda **después**, en TypeScript.

---

## Paso 5: Anotar el slug en el código (recomendado)

Archivo: `src/domain/mail/email-template-id.ts`

```typescript
export const EMAIL_TEMPLATE_IDS = {
  WELCOME: 'welcome',
  // Agregar la tuya:
  MI_PLANTILLA: 'mi-plantilla',  // mismo slug que en el admin
} as const;
```

Así evitas escribir mal el slug en el código.

---

## Paso 6: Crear un "use case" que envía el correo

Un **use case** es una clase que hace **una sola cosa**: preparar datos y encolar el envío.

Copia el patrón de:  
`src/application/use-cases/mail/enviar-correo-bienvenida.use-case.ts`

Ejemplo simplificado:

```typescript
await this.mailService.enqueue({
  templateId: 'welcome',           // = slug de la plantilla
  to: [{ email: 'a@b.com', name: 'Juan' }],
  variables: {
    name: 'Juan Pérez',
    appName: 'GVR PE',
    userEmail: 'a@b.com',
  },
});
```

**Regla:** en `variables` solo manda las claves que **existen** en tu plantilla. Nada más.

Registra la clase nueva en `src/presentation/modules/mail.module.ts` si otros módulos la van a usar.

---

## Paso 7: Llamar ese use case cuando pase el evento

No lo pongas en el controlador. Ponlo en el use case del negocio que ya existe.

**Ejemplo real — correo de bienvenida al crear trabajador:**

| Qué | Dónde |
|-----|-------|
| El usuario llena el formulario en **Usuarios** | Front |
| Se guarda en BD | Función SQL `tra_CrearTrabajador` |
| Se manda el correo | `CrearTrabajadorUseCase` (después de guardar) |

Archivos:

- `src/application/use-cases/trabajador/crear-trabajador.use-case.ts` → dispara el mail
- `src/application/use-cases/mail/enviar-correo-bienvenida.use-case.ts` → arma variables y envía

**Qué datos usa el correo de bienvenida:**

| Variable en plantilla | Valor real |
|-----------------------|------------|
| `name` | Nombres + apellidos del formulario |
| `userEmail` | Correo del formulario |
| `appName` | `MAIL_FROM_NAME` del `.env` |

**Regla de oro:** si el correo no se puede enviar (SMTP caído), **igual debe completarse** la acción principal (crear trabajador, etc.). Solo se registra un aviso en los logs.

---

# PARTE 3 — Configurar el servidor de correo

Archivo: `api-visor-gvr-nest/.env`

```env
MAIL_ENABLED=true
MAIL_SMTP_HOST=smtp.tuproveedor.com
MAIL_SMTP_PORT=587
MAIL_SMTP_SECURE=false
MAIL_SMTP_USER=tu-usuario
MAIL_SMTP_PASS=tu-clave
MAIL_FROM_ADDRESS=no-reply@tudominio.com
MAIL_FROM_NAME=GVR PE
```

- `MAIL_ENABLED=false` → no envía nada (útil en desarrollo).
- Más detalle en `.env.example`, sección **Correo**.

---

# PARTE 4 — Qué pasa por dentro cuando se envía un mail

1. Tu código llama `MailService.enqueue` con el **slug** y las **variables**.
2. El backend busca la plantilla en BD por slug (ej. `welcome`).
3. Reemplaza `{{name}}`, `{{appName}}`, etc. con los valores que mandaste.
4. Envía el correo por SMTP.
5. Guarda un registro en `email_dispatch_logs`.

Si la plantilla no está en BD, intenta usar un archivo `.hbs` de respaldo. En la práctica **usa la de BD** si está Activa en el admin.

---

# Checklist — ¿Lo hice bien?

### Plantilla (admin)

- [ ] Slug claro y en minúsculas (`welcome`, no `Welcome`)
- [ ] Estado **Activa**
- [ ] Variables en el diseño con `{{nombreExacto}}`
- [ ] JSON de prueba con las mismas claves
- [ ] Vista previa OK
- [ ] Enviar prueba OK

### Backend

- [ ] Use case que llama `MailService.enqueue` con el slug correcto
- [ ] Solo las variables que usa la plantilla
- [ ] Se llama **después** de que la acción principal tuvo éxito
- [ ] Si falla el mail, no rompe la acción principal

### Servidor

- [ ] `.env` con SMTP y `MAIL_ENABLED=true`
- [ ] Probado en un flujo real (ej. crear un trabajador de prueba)

---

# Problemas comunes

**Veo `{{name}}` en el correo y no el nombre**  
→ El nombre de la variable no coincide entre plantilla, JSON y código. Revisa typos.

**Vista previa bien, pero en producción no llega el mail**  
→ Revisa `.env`: `MAIL_ENABLED`, SMTP, usuario y clave.

**Llega un diseño viejo, no el del editor**  
→ ¿Guardaste la plantilla? ¿Está Activa? ¿El slug en código es el mismo?

**¿Necesito una función en PostgreSQL para el mail?**  
→ **No.** SQL guarda datos. TypeScript manda el correo.

---

# Ejemplo completo: bienvenida al crear trabajador

```
Usuario crea trabajador en "Usuarios" (front)
        ↓
POST /api/trabajadores
        ↓
tra_CrearTrabajador → guarda en BD
        ↓
CrearTrabajadorUseCase → llama EnviarCorreoBienvenidaUseCase
        ↓
Busca plantilla slug "welcome" en BD
        ↓
Reemplaza {{name}}, {{appName}}, {{userEmail}}
        ↓
Envía correo al trabajador
```

**Prueba manual (solo desarrollo):**  
`GET /api/demo/mail-bienvenida/:idTrabajador`

---

# Resumen en 5 líneas

1. Diseña la plantilla en el admin y pruébala ahí.
2. Anota el **slug** — es el ID que usará el backend.
3. En Nest, crea un use case que llame `MailService.enqueue` con ese slug y las variables.
4. Llama ese use case cuando ocurra el evento (crear usuario, etc.).
5. Configura SMTP en `.env`.

Con eso, lo que diseñaste en el admin es lo que recibirá el usuario en producción.
