# Literario — blog Next.js

Blog personal con [Next.js](https://nextjs.org) (App Router) y contenido en archivos Markdown con frontmatter, editable desde [Decap CMS](https://decapcms.org/) en `/admin`.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura del contenido

Todos los artículos viven en `content/<slug>.md` con frontmatter YAML:

```markdown
---
id: '052'
slug: nuevo-post
indexNumber: '052'
year: '2026'
kind: ENSAYO          # ENSAYO | FICCIÓN | TEORÍA | RELATO | CRÓNICA | HAYLA | PODCAST
title: Título visible
summary: >-
  Resumen breve que aparece en listados.
author: Luis
publishedAt: '10 de Mayo, 2026'
draft: false          # true = no aparece en el sitio público

# Solo para PODCAST:
audioUrl: https://soundcloud.com/usuario/episodio-01
episodeNumber: 1
audioDurationSec: 1240
---

Cuerpo del post en Markdown.

Para insertar audio inline en cualquier post:

::soundcloud{url="https://soundcloud.com/usuario/track"}
```

`src/lib/articles.ts` lee y cachea todos los `.md` con frontmatter válido. No hay base de datos.

## Borradores y preview

- En Decap, cada artículo tiene una checkbox **"Borrador"** (marcada por defecto al crear). Mientras esté marcada, el post **no aparece** en la home, las categorías, ni en `generateStaticParams` (no se prerenderiza su URL).
- Para previsualizar un borrador en producción, define `PREVIEW_TOKEN` en las env vars y abre la URL con `?preview=<token>`:
  ```
  https://literario.vercel.app/archivo/mi-borrador?preview=mi-token-secreto
  ```
- Si `PREVIEW_TOKEN` está vacío, el preview queda inhabilitado (los borradores no son accesibles ni con token).

## Editor (`/admin`) con Decap CMS

### Local (sin OAuth, edita archivos reales)

`config.yml` tiene `local_backend: true`, así que Decap detecta `localhost` y habla con `decap-server` en vez de GitHub.

```bash
# En una terminal
npx decap-server

# En otra terminal
npm run dev
```

Abre [http://localhost:3000/admin](http://localhost:3000/admin). Los cambios se escriben directamente sobre los `.md` de `content/` (sin commits ni autenticación). Cuando quieras subirlos, haces `git add . && git commit` como con cualquier otro cambio.

### Producción (Vercel + GitHub OAuth)

1. **Crear OAuth App en GitHub** en [Settings → Developer settings → OAuth Apps](https://github.com/settings/developers):
   - Application name: `Literario CMS` (o el que quieras)
   - Homepage URL: `https://literario.vercel.app`
   - Authorization callback URL: `https://literario.vercel.app/api/auth/callback`
2. Copiar el `Client ID`, generar un `Client Secret`.
3. En Vercel → Settings → Environment Variables, añadir:
   - `OAUTH_GITHUB_CLIENT_ID`
   - `OAUTH_GITHUB_CLIENT_SECRET`
4. Asegurarse que en `public/admin/config.yml` el bloque activo sea el de `backend: github` con `repo: lvelitoruiz/literario`.
5. Deploy. Entrar a `https://literario.vercel.app/admin`, login con GitHub, escribir, "Publish" → commit en `main` → Vercel rebuild → blog actualizado.

El flow OAuth lo maneja este mismo deploy: `src/app/api/auth/route.ts` y `src/app/api/auth/callback/route.ts`. No necesitas Netlify ni servicios externos.

## Variables de entorno

Ver `.env.example`. Resumen:

- `NEXT_PUBLIC_CUSDIS_APP_ID` — comentarios.
- `NEXT_PUBLIC_CUSDIS_HOST` — opcional, instancia self-hosted de Cusdis.
- `NEXT_PUBLIC_SITE_URL` — opcional, útil para SEO/comentarios.
- `OAUTH_GITHUB_CLIENT_ID` / `OAUTH_GITHUB_CLIENT_SECRET` — solo prod, para Decap.
- `OAUTH_ALLOWED_USERS` — opcional, lista de usernames de GitHub (separados por coma) autorizados a entrar a `/admin`. Vacío = todos los que tengan acceso al repo.
- `PREVIEW_TOKEN` — opcional, secreto para `?preview=<token>`. Vacío = sin preview.

## Seguridad y multi-usuario

Esta sección importa cuando invites a colaboradores. Tres capas se combinan:

### 1. Quién puede entrar a `/admin` (allowlist)
Por defecto, cualquiera con acceso al repo de GitHub puede loguearse. Para restringirlo:
- Añade en Vercel la variable `OAUTH_ALLOWED_USERS=lvelitoruiz,otro-username`.
- Cualquier usuario fuera de la lista recibe **403** al terminar el OAuth, aunque tenga acceso al repo.

### 2. Quién puede modificar `main` (branch protection en GitHub)
Esto es **la defensa real** contra colaboradores que borren contenido. Sin esto, cualquier collaborator con permiso "Write" puede `git push` directo a `main` y reemplazar lo que quiera. Pasos en GitHub:

1. Ve a **Settings → Rules → Rulesets → New branch ruleset**.
2. Name: `protect-main`. Enforcement status: `Active`.
3. Target branches: `Include default branch` (es `main`).
4. Activa estas reglas:
   - ✅ **Restrict deletions**
   - ✅ **Restrict force pushes**
   - ✅ **Require a pull request before merging**
     - Required approvals: `1`
     - ✅ **Require review from Code Owners**
     - ✅ **Dismiss stale reviews on push**
5. (Opcional, recomendado) En **Bypass list**, añade tu propio usuario para poder hacer hotfixes urgentes sin PR. Si quieres reglas estrictas para todos (incluso para ti), no añadas a nadie.
6. Save.

Combinado con `.github/CODEOWNERS` (ya incluido en el repo), cualquier cambio sobre `/content/`, `/src/`, `/public/admin/` o config sensible **requiere tu aprobación explícita**, aunque el PR ya tenga otros approvers.

### 3. Cómo añadir un colaborador
1. **GitHub → Settings → Collaborators → Add people**, permiso `Write`.
2. La persona acepta la invitación.
3. Añade su username a `OAUTH_ALLOWED_USERS` en Vercel.
4. Hace login en `/admin`, escribe un post, "Publish" → como `main` está protegida, Decap **abre un PR en lugar de commitear**. Tú lo revisas y mergeas.

### Limitaciones conocidas
- **Privacidad de contenido entre collaborators**: cualquier collaborator del repo puede *leer* todos los `.md`, incluyendo HAYLA. Decap+git no soporta permisos por archivo. Si HAYLA debe ser invisible para colaboradores, hay que separarlo a un repositorio privado aparte.
- Las protecciones de branch no aplican en `local_backend` (modo desarrollo): editas archivos directamente.

## Deploy

Push a la rama configurada en Vercel y listo. Cada commit en `main` (incluyendo los que haga Decap vía PR aprobado) dispara un nuevo build.
