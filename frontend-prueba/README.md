# Frontend — Cursos y Aprendices

Vue 3 + Quasar + vue-router + axios + Pinia + pinia-plugin-persistedstate, para el backend `backend_prueba`.

## Uso

```bash
npm install
npm run dev            # http://localhost:5173  (coincide con URL_FRONTEND del backend)
```

Requisitos: backend corriendo en `http://localhost:4500` (`npm run seed` y `npm run dev` allá).
Usuario de prueba: `admin@sena.edu.co` / `123456`.

La URL de la API está en `.env` (`VITE_API_URL`). Reinicia `npm run dev` si la cambias.

## Estructura

```
src/
├── main.js              Quasar + Pinia (con persistedstate) + router + interceptores
├── router/              rutas, guard de sesión (requiresAuth / guestOnly)
├── stores/
│   ├── auth.js          token + usuario (persistido)
│   ├── ui.js            modo oscuro (persistido)
│   ├── cursos.js        lista y acciones de cursos
│   └── aprendices.js    lista y acciones de aprendices
├── services/            api.js (axios + x-token + 401) y un servicio por recurso
├── layouts/MainLayout.vue
├── views/               Login, Cursos, Aprendices, Usuarios
└── utils/errors.js      errores del backend -> mensajes / Notify
```
