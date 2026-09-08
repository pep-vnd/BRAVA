# BRAVA · Publicar en Cloudflare

Esta carpeta es una copia independiente preparada para Cloudflare Workers. La web actual sigue donde estaba. No se ha publicado ni sustituido ningún sitio en tu cuenta.

## Qué hace cada servicio

- GitHub guarda los archivos de la web. Puedes usar un repositorio privado.
- Cloudflare Workers muestra la web y consulta DatoCMS desde el servidor.
- DatoCMS sigue siendo tu panel para añadir viviendas, fotos, precios y Venta/Alquiler.
- EmailJS sigue gestionando los formularios configurados.

Workers tiene un plan gratuito con límites de uso; DatoCMS y EmailJS mantienen sus propios límites. No hace falta contratar un plan de pago para probar esta configuración. Un dominio propio puede tener un coste aparte.

Esta versión utiliza servidor, así que el ZIP no sirve para arrastrarlo a la subida de archivos estáticos de Pages. Usa Workers con GitHub como se indica aquí.

## 1. Subir los archivos a GitHub

Crea un repositorio privado vacío llamado `brava-inmobiliaria` en https://github.com/new (sin añadir README, licencia ni .gitignore: ya están aquí).

Abre una terminal dentro de esta carpeta y ejecuta:

```sh
git init -b main
git add .
git commit -m "Preparar BRAVA para Cloudflare"
git remote add origin https://github.com/TU-USUARIO/brava-inmobiliaria.git
git push -u origin main
```

Sustituye `TU-USUARIO` por tu usuario de GitHub. GitHub te pedirá autenticarte; no compartas tu contraseña ni claves en un chat. Si prefieres hacerlo con ayuda, basta con facilitar el enlace del repositorio vacío.

Sube el contenido descomprimido, no el ZIP como un único archivo. `package.json` y `wrangler.jsonc` deben quedar en la raíz del repositorio. El archivo `.gitignore` excluye claves locales, dependencias y archivos generados.

## 2. Conectar Cloudflare

En https://dash.cloudflare.com abre **Workers & Pages → Create application** y elige conectar/importar un repositorio de GitHub para crear un Worker. Autoriza el acceso al repositorio que acabas de crear.

Configura:

| Campo | Valor |
| --- | --- |
| Nombre del Worker | `brava-inmobiliaria` |
| Rama de producción | `main` |
| Directorio raíz | raíz del repositorio (`/`) |
| Comando de compilación (Build command) | `npm run build` |
| Comando de despliegue (Deploy command) | `npm run deploy` |

La instalación utiliza `package-lock.json`. El archivo `.node-version` fija una versión de Node compatible. Si el panel pide explícitamente la versión de Node, usa `22.16.0`.

El nombre del Worker debe coincidir con `name` en `wrangler.jsonc`. Si ya tienes un Worker llamado así, utiliza otro nombre en ambos sitios. No selecciones tu web antigua para reemplazarla durante la prueba.

Al pulsar Deploy se publicará una URL de Cloudflare terminada en `workers.dev`. Si todavía no has configurado las claves, mostrará las seis viviendas de demostración y los formularios no enviarán correos.

## 3. Conectar tu catálogo y los formularios

En el Worker creado, abre **Settings → Variables and Secrets**. Estas son variables de ejecución del Worker; no las añadas solo a la sección Build.

Añade los siguientes nombres. Puedes guardarlos todos como Secret para que Cloudflare conserve los valores fuera del código:

| Nombre | Valor que debes introducir |
| --- | --- |
| `DATOCMS_READONLY_TOKEN` | Token de DatoCMS con acceso de lectura al Content Delivery API |
| `EMAILJS_SERVICE_ID` | ID de tu servicio de EmailJS |
| `EMAILJS_TEMPLATE_ID` | ID de tu plantilla de EmailJS |
| `EMAILJS_PUBLIC_KEY` | Clave pública de EmailJS |
| `CONTACT_ENABLED` | `true` |

Los valores de la integración actual ya están guardados localmente en `brava/.dev.vars`, en la carpeta original junto a esta copia. Ese archivo NO se incluye en el ZIP ni debe subirse a GitHub. El token de DatoCMS solo lo necesita el servidor. Los identificadores públicos de EmailJS sí se utilizan en el navegador.

Guarda/aplica los cambios del Worker. La plantilla de EmailJS ya tiene como destinatario confirmado `pepecarmona2904@gmail.com`; el destinatario se cambia allí. Si has restringido dominios en EmailJS, añade la nueva dirección `workers.dev` y, después, tu dominio propio.

## 4. Comprobar antes de cambiar tu dominio

Abre la nueva URL y verifica:

- Aparecen las ocho viviendas publicadas en DatoCMS.
- Venta y Alquiler filtran correctamente. En DatoCMS, elige la operación de las dos viviendas antiguas y publica los cambios; mientras no la tengan, aparecerán como «Consultar».
- Las seis viviendas ficticias conservan su indicación de demostración; sus formularios no envían solicitudes reales.
- Puedes abrir una vivienda y recorrer sus fotos en escritorio y móvil.
- Para comprobar el correo, envía tú una solicitud de prueba desde Contacto y revisa el buzón receptor. La preparación del ZIP no ha enviado ningún correo.

Para añadir o cambiar casas no necesitas volver a subir la web: guarda y publica en DatoCMS. La caché del catálogo puede tardar unos cinco minutos en actualizarse. Consulta también `GUIA-CATALOGO.md`.

Cuando todo esté bien, puedes añadir un dominio desde **Settings → Domains & Routes → Add → Custom Domain**. Si ese dominio está conectado a tu Pages antiguo, habrá que trasladar su conexión; conserva la web anterior hasta comprobar la nueva. La dirección antigua `chatgpt.site` no se transfiere a Cloudflare.

## Cambios de diseño y desarrollo local

- Marca, email y datos públicos: `content/site.ts`.
- Viviendas reales: DatoCMS.
- Fotos generales: `public/images/`.
- Diseño y textos de la página: `components/brava-home.tsx` y `app/globals.css`.
- Animaciones: `components/scroll-experience.tsx`.

Para probar localmente con Node 22.16 o posterior:

```sh
npm ci
npm run dev
```

Para revisar el paquete sin publicarlo:

```sh
npm run build
npx wrangler deploy --config dist/server/wrangler.json --dry-run
```

Cada cambio que envíes a la rama `main` conectada a Cloudflare activará una nueva publicación. La configuración conserva el framework Vinext de la web actual, que aún está en versión beta.

Documentación oficial:
- https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/platform/pricing/
