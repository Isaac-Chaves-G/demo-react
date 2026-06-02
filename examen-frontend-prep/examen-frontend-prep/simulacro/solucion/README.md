# ✅ Solución de referencia — Simulacro Reservas

> **Solo mira esto DESPUÉS de intentar el simulacro tú solo.** Comparar tu intento con esto es donde
> más se aprende: fíjate en qué hiciste distinto, no solo en "si funciona".

## Cómo correrla
1. Levanta el backend mock (`../mock-backend`, `npm install && npm start`).
2. Crea un proyecto Vite y copia la carpeta `src/` de aquí encima de la suya:
   ```bash
   npm create vite@latest solucion-front -- --template react
   cd solucion-front
   npm install
   npm install axios react-router
   cp -r ../solucion/src/* src/          # copia estos archivos
   cp ../solucion/.env.example .env       # crea el .env
   npm run dev
   ```
3. Entra a http://localhost:5173 → login con `recepcion1@hotel.com` / `123456`.

## Mapa de archivos (mismo patrón que el cheat-sheet)
```
src/lib/axios/axiosClient.js      → axios + token
src/services/auth.service.js      → login
src/services/reservas.service.js  → CRUD
src/context/AuthContext.jsx       → token global
src/components/ProtectedRoute.jsx → ruta privada
src/components/ReservaCard.jsx    → ⭐ componente de 1 reserva (props + callbacks)
src/pages/Login/Login.jsx         → formulario login
src/pages/Board/Board.jsx         → tablero (fetch + lista + crear + editar + borrar)
src/router/Router.jsx             → navegación
src/main.jsx                      → providers + router
```

> 🔑 Fíjate especialmente en `ReservaCard.jsx` (recibe `onEliminar` y `onCambiarEstado` como props) y en
> `Board.jsx` (define esas funciones y las pasa hacia abajo). Ese es el corazón del examen.
