# Museo de lo Efímero — landing page

Sitio estático (HTML + CSS + JS) con GSAP incluido en `vendor/` (no depende de CDN).

## Publicar en Railway
1. Sube esta carpeta a un repositorio de GitHub (o usa `railway up` con la CLI).
2. En Railway: New Project → Deploy from GitHub repo → elige el repositorio.
3. Railway detecta `package.json` y ejecuta `npm start` (servidor `server.js`, usa la variable `PORT`).
4. En Settings → Networking, pulsa "Generate Domain".

## Antes de publicar
- Cambia `CONTACT_EMAIL` en `script.js` y el correo en `index.html`.
- Reemplaza los testimonios de ejemplo por reales.

## Probar en local
    npm start   # http://localhost:3000
