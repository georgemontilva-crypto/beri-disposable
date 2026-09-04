# Beri Disposable — Guía de Despliegue (Railway + Cloudflare R2)

Esta aplicación es un proyecto **Node.js full‑stack** (React 19 + Vite en el cliente,
Express + tRPC en el servidor, base de datos MySQL/TiDB con Drizzle ORM). Está
preparada para desplegarse en **Railway** con almacenamiento de imágenes en
**Cloudflare R2** y envío de correos transaccionales.

> El sistema de login (admin y wholesale) es **propio** (email + contraseña con JWT).
> No depende de ningún proveedor externo de identidad.

---

## 1. Resumen de arquitectura

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, Vite, Tailwind 4, wouter |
| Backend | Express 4, tRPC 11 |
| Base de datos | MySQL 8 / TiDB (Drizzle ORM) |
| Auth | JWT propio (admin + wholesale), bcrypt |
| Almacenamiento de imágenes | Cloudflare R2 (S3‑compatible) |
| Email | Resend / SMTP (configurable) |

Scripts relevantes (`package.json`):

```bash
pnpm install          # instala dependencias
pnpm build            # compila cliente (Vite) y servidor (esbuild) -> dist/
pnpm start            # arranca el servidor de producción (node dist/index.js)
pnpm drizzle-kit generate   # genera SQL de migración a partir de drizzle/schema.ts
pnpm test             # ejecuta la suite de tests (vitest)
```

El servidor sirve los archivos estáticos del cliente y la API bajo `/api`.
**No hardcodees el puerto**: el servidor usa `process.env.PORT` (Railway lo inyecta).

---

## 2. Variables de entorno

Configura estas variables en **Railway → Variables**:

### Base de datos
| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión MySQL. Ej: `mysql://user:pass@host:3306/beri` |

> Si usas el plugin MySQL de Railway, **no copies la contraseña a mano**: usa una
> referencia entre servicios. En tu servicio de la app → Variables → nueva
> variable `DATABASE_URL` con el valor `${{MySQL.MYSQL_URL}}` (escrito tal cual).
> Railway la resuelve en cada deploy, así que si rota las credenciales la app
> sigue funcionando. Usa `MYSQL_URL` (red interna) y no `MYSQL_PUBLIC_URL`.

> **Las tablas se crean solas.** El servidor ejecuta las migraciones pendientes
> al arrancar (`server/migrate.ts`), así que una base recién creada se
> provisiona en el primer deploy sin ningún comando manual. Es el migrador de
> Drizzle, que lleva registro en la tabla `__drizzle_migrations` y es
> idempotente: sobre una base al día no hace nada.
>
> Deliberadamente **no** se usa `drizzle-kit push`, que compara el esquema vivo
> contra `schema.ts` y puede ofrecer truncar tablas cuando ve una diferencia que
> no sabe reconciliar. Para cambios de esquema futuros: generar la migración con
> `pnpm drizzle-kit generate` y commitearla; el deploy la aplica.

### Sesiones / Seguridad
| Variable | Descripción |
| --- | --- |
| `JWT_SECRET` | Cadena aleatoria larga para firmar las cookies de sesión (admin y wholesale). Genera con `openssl rand -hex 32`. |
| `ADMIN_SETUP_TOKEN` | Secreto **temporal** requerido para crear la primera cuenta de admin. Genera con `openssl rand -hex 24`. |

> **Importante — creación del primer admin.** El endpoint de bootstrap
> (`adminAuth.setup`) es público por necesidad: se usa cuando todavía no existe
> ninguna cuenta. Para que nadie pueda reclamar el panel, ahora exige el valor de
> `ADMIN_SETUP_TOKEN`. El flujo correcto es:
>
> 1. Define `ADMIN_SETUP_TOKEN` en Railway y redespliega.
> 2. Entra a `/admin/login`, pega el token y crea tu cuenta.
> 3. **Borra la variable `ADMIN_SETUP_TOKEN`** de Railway y redespliega.
>
> Sin la variable definida, el formulario de setup ni siquiera se ofrece y el
> endpoint responde `FORBIDDEN`.

### Cloudflare R2 (almacenamiento de medios)
| Variable | Descripción |
| --- | --- |
| `R2_ACCOUNT_ID` | Account ID de Cloudflare (R2 → esquina superior derecha) |
| `R2_ACCESS_KEY_ID` | Access Key del token de API de R2 |
| `R2_SECRET_ACCESS_KEY` | Secret Key del token (se muestra **una sola vez**) |
| `R2_BUCKET` | Nombre del bucket, ej. `beri-media` |
| `R2_PUBLIC_URL` | URL pública del bucket, sin barra final. Ej. `https://pub-xxxx.r2.dev` o tu dominio propio |

> **CORS del bucket es obligatorio.** El navegador sube los archivos
> directamente a R2 con una URL prefirmada, así que R2 tiene que aceptar
> peticiones desde tu dominio. En Cloudflare → R2 → tu bucket → **Settings →
> CORS policy**, pegá:
>
> ```json
> [
>   {
>     "AllowedOrigins": ["https://TU-DOMINIO.com"],
>     "AllowedMethods": ["PUT", "GET"],
>     "AllowedHeaders": ["Content-Type"],
>     "ExposeHeaders": ["ETag"],
>     "MaxAgeSeconds": 3600
>   }
> ]
> ```
>
> Agregá también la URL que te dio Railway (`https://xxx.up.railway.app`) si
> vas a administrar el sitio desde ahí. Sin esto, cada subida falla con un
> error de CORS en la consola del navegador.

> **Acceso público al bucket.** En **Settings → Public access**, habilitá el
> dominio `r2.dev` o conectá un dominio propio. `R2_PUBLIC_URL` debe ser esa
> URL: es la que se guarda en la base de datos y con la que el sitio sirve
> las imágenes y los modelos 3D por el CDN de Cloudflare.

> **Cómo funcionan las subidas.** El panel de admin pide al servidor una URL
> prefirmada y el navegador manda el archivo directo a R2. El archivo nunca
> pasa por el contenedor de Railway, así que no hay límite práctico de tamaño
> ni consumo de memoria del servidor — importante para los modelos 3D y el
> video. Si falta alguna variable, el panel muestra un aviso indicando
> exactamente cuáles.

### Email (aprobación wholesale)
| Variable | Descripción |
| --- | --- |
| `RESEND_API_KEY` | API key de [Resend](https://resend.com) (recomendado). Si se omite, los correos se registran en consola (modo dev). |
| `EMAIL_FROM` | Remitente verificado, ej. `wholesale@beridisposable.com` |
| `APP_BASE_URL` | URL pública del sitio, ej. `https://beridisposable.com` (usada en los enlaces de los correos) |

---

## 3. Conectar Cloudflare R2

El código de subida de imágenes vive en `server/storage.ts`. En el entorno de
Manus usa el almacenamiento integrado; **para producción en Railway debes
apuntarlo a R2**, que es 100% compatible con la API S3.

### 3.1 Crear el bucket y el token
1. En el panel de Cloudflare ve a **R2 → Create bucket** (ej. `beri-images`).
2. (Opcional pero recomendado) Conecta un **dominio personalizado** al bucket
   para servir las imágenes desde, por ejemplo, `images.beridisposable.com`.
3. Ve a **R2 → Manage R2 API Tokens → Create API Token** con permisos de
   *Object Read & Write* sobre el bucket. Guarda `Access Key ID` y `Secret`.

### 3.2 Reemplazar el helper de almacenamiento
Instala el SDK de S3 (ya incluido en el template):

```bash
pnpm add @aws-sdk/client-s3
```

Sustituye el contenido de `server/storage.ts` por una implementación R2 como esta
(plantilla lista para pegar):

```ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(relKey.replace(/^\/+/, ""));
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: data as any,
      ContentType: contentType,
    }),
  );
  // URL pública servida por el dominio del bucket
  return { key, url: `${process.env.R2_PUBLIC_URL}/${key}` };
}

export async function storageGet(relKey: string) {
  const key = relKey.replace(/^\/+/, "");
  return { key, url: `${process.env.R2_PUBLIC_URL}/${key}` };
}
```

> El resto de la aplicación (router `images`, panel admin, frontend) **no necesita
> cambios**: ya guarda en la base de datos tanto la `storageKey` como la `url`
> devueltas por `storagePut`, y el frontend usa esa `url` directamente.

---

## 4. Configurar el email de aprobación wholesale

El helper de email está en `server/email.ts`. Por defecto, si no hay
`RESEND_API_KEY`, los correos se imprimen en consola (útil para pruebas).
Para producción:

1. Crea una cuenta en [Resend](https://resend.com) y verifica tu dominio
   `beridisposable.com`.
2. Genera una API key y configúrala como `RESEND_API_KEY` en Railway.
3. Configura `EMAIL_FROM=wholesale@beridisposable.com` y `APP_BASE_URL` con tu
   dominio público.

Flujo: cuando el admin **aprueba** una solicitud wholesale, el sistema genera un
token de un solo uso y envía un correo con un enlace
`{APP_BASE_URL}/wholesale/complete?token=...` para que el usuario establezca su
contraseña y active su cuenta.

> Alternativa SMTP: si prefieres SMTP en lugar de Resend, ajusta `server/email.ts`
> para usar `nodemailer` (`pnpm add nodemailer`) con las variables
> `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.

---

## 5. Migrar la base de datos (incluida la tabla de códigos)

La tabla `auth_codes` almacena los códigos secretos de verificación de productos.

1. Asegúrate de que `DATABASE_URL` apunta a tu base de datos de Railway.
2. Genera y aplica las migraciones:

```bash
pnpm drizzle-kit generate     # genera el SQL desde drizzle/schema.ts
pnpm drizzle-kit migrate      # aplica las migraciones a la base de datos
```

3. **Importar tus códigos existentes**: inicia sesión en el panel admin
   (`/admin`), ve a **Verify Codes → Import codes** y sube tu archivo CSV/TXT
   (un código por línea, o separados por comas). Los duplicados se ignoran.

   También puedes importarlos por SQL directo:
   ```sql
   INSERT IGNORE INTO auth_codes (code) VALUES ('708839800535'), ('708875264907');
   ```

> Así es como organizas tu base de datos de códigos directamente en Railway,
> tal como pediste, sin gestionarla desde Manus.

---

## 6. Desplegar en Railway

1. **Crea un proyecto** en Railway y conecta este repositorio de GitHub.
2. Añade el plugin **MySQL** (o usa una base externa) y copia su URL a `DATABASE_URL`.
3. Configura **todas las variables** de la sección 2.
4. Railway detecta Node automáticamente. Configura los comandos:
   - **Build:** `pnpm install && pnpm build`
   - **Start:** `pnpm start`
5. Ejecuta las migraciones (sección 5) — puedes hacerlo desde un *one‑off command*
   en Railway o localmente apuntando a la BD de producción.
6. Crea el **primer administrador**: visita `/admin` la primera vez; el sistema
   te pedirá crear la cuenta de admin inicial.

---

## 7. Checklist post‑deploy

- [ ] `DATABASE_URL` y `JWT_SECRET` configurados
- [ ] Migraciones aplicadas — **automático**: el servidor las corre al arrancar (incluye `site_settings`, `newsletter_subscribers` y las columnas de documentos en `wholesale_inquiries`)
- [ ] R2 conectado (5 variables `R2_*`)
- [ ] CORS del bucket R2 configurado con el dominio del sitio
- [ ] Acceso público del bucket habilitado
- [ ] Email configurado (`RESEND_API_KEY`, `EMAIL_FROM`, `APP_BASE_URL`)
- [ ] `ADMIN_SETUP_TOKEN` definido temporalmente
- [ ] Primer admin creado en `/admin`
- [ ] `ADMIN_SETUP_TOKEN` **eliminado** de Railway tras crear el admin
- [ ] Códigos importados desde el panel admin
- [ ] Imágenes subidas a sus slots desde **Site Images**
- [ ] Dominio personalizado apuntando a Railway

---

## 8. Mapa de slots de imágenes

El panel **Site Images** permite subir una imagen por cada *slot*. Mientras un
slot esté vacío, el sitio muestra un **placeholder gris con las dimensiones
recomendadas** visibles (pensado para que el diseñador sepa exactamente qué medida
debe producir). Slots principales:

| Slot | Sección | Medida recomendada |
| --- | --- | --- |
| `home_hero` | Home (hero) | 720×840 |
| `home_feature_1/2` | Home | 800×600 |
| `authenticate_banner` | Authenticate | 1600×600 |
| `wholesale_banner` | Wholesale | 1280×360 |
| `crush_hero` / `cliq_hero` | Producto | 680×760 |
| `crush_flavor_*` / `cliq_flavor_*` | Sabores | 400×500 |

Las medidas exactas mostradas en cada placeholder son la referencia oficial.
