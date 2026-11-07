# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Progressive Web App

The production Vite build generates a web app manifest and service worker using
`vite-plugin-pwa`. The worker precaches the built app shell and static assets;
translation/API responses are not cached. When an update is ready, TALKBRIDGE
shows a refresh prompt so an active session is not interrupted.

App icons are in `public/`:

- `pwa-192x192.png` — standard manifest icon, 192 × 192 pixels.
- `pwa-512x512.png` — standard manifest icon, 512 × 512 pixels.
- `pwa-maskable-512x512.png` — maskable manifest icon, 512 × 512 pixels, with
  the logo kept inside the central safe area.
- `apple-touch-icon.png` — iOS home-screen icon, 180 × 180 pixels.

These are starter icons based on the existing TALKBRIDGE brand mark. To use
final brand artwork, replace the files at the same paths and dimensions. Keep
the maskable artwork clear of the outer 20% so Android icon masks do not crop
the mark.

To test the production service worker locally, run `npm run build`, then
`npm run preview` from `frontend/`. Open the preview in a browser and inspect
the manifest and service worker in developer tools. iPhone Safari requires the
site to be deployed over HTTPS; to add it to the Home Screen, use Share >
Add to Home Screen. Installability has not been verified against a production
HTTPS deployment.
