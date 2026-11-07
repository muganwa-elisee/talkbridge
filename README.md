# TalkBridge AI

TalkBridge is a Vue 3 and Vite frontend with an Express API scaffold for a
language translation application.

## Project structure

```text
frontend/
  public/
  src/
    assets/
    components/
    views/
    router/
    services/
    App.vue
    main.js
    style.css
  index.html
  package.json
  vite.config.js
backend/
  config/
  controllers/
  middleware/
  routes/
  services/
  .env.example
  .gitignore
  server.js
  package.json
```

## Run locally

From the project root, start the frontend and backend together:

```powershell
npm run dev
```

Or start either service in its own terminal:

```powershell
npm run dev:frontend
npm run dev:backend
```

The API listens on port `5000` by default and exposes `GET /api/health`.
If needed, install frontend and backend dependencies with `npm install
--prefix frontend` and `npm install --prefix backend`.
Set `VITE_API_URL` in the frontend environment if the API is hosted elsewhere.

Translations use the MyMemory service. Text submitted for translation is sent
to that provider, which applies its own availability and usage limits.
Authentication endpoints are still scaffolds.

## Live voice translation

The Live translator uses the browser's Web Speech recognition when available,
then sends the recognized text to the existing backend translation endpoint.
Microphone access requires the user's permission and a secure page (HTTPS or
localhost). Speech recognition support and language coverage vary by browser;
the page keeps text input available when voice recognition is unsupported.

The backend currently calls MyMemory and does not require an AI-provider API
key. It does require the backend to be running and an internet connection to
reach MyMemory. The frontend reports the translation service as connected only
after a successful translation. Set `VITE_API_URL` when the backend is hosted
somewhere other than `http://localhost:5000/api`.
