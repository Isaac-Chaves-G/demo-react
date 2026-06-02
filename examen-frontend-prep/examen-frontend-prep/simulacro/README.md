# 🧪 SIMULACRO — Examen de Frontend: Reservas de Hotel

> Resuélvelo **a libro cerrado** (sin mirar el cheat-sheet ni la solución). Date **45–60 min**, como el real.
> El objetivo es que sientas el examen de verdad. Solo después, compara con `solucion/`.

---

## Enunciado (estilo examen)

### Objetivo
Desarrollar una aplicación web de frontend con **React** que se conecte y consuma un **REST API**.

### Contexto
Una cadena hotelera está modernizando su recepción y quiere un **tablero interactivo** para gestionar
las **reservas** del día. El personal autorizado debe poder **registrar nuevas reservas, actualizar su
información, cambiar su estado y eliminar** reservas que ya no apliquen.

Cada reserva puede estar en uno de estos estados:
- **PENDIENTE**
- **CONFIRMADA**
- **CANCELADA**

### Desarrollo (cada bloque vale 20%)
- **(20%) Inicio de sesión:** ingresar credenciales → consumir el endpoint de login → obtener token JWT →
  almacenarlo y usarlo en todas las solicitudes → al loguear, redirigir al tablero.
- **(20%) Creación de reservas:** registrar una reserva nueva desde la interfaz (con el token) y **refrescar la lista**.
- **(20%) Componente:** un componente React que represente **una** reserva, muestre **toda** su info e incluya
  las acciones de **actualizar** y **eliminar**.
- **(20%) Actualización de estado:** cambiar el estado entre PENDIENTE / CONFIRMADA / CANCELADA; reflejarlo en backend y UI.
- **(20%) Eliminación:** borrar la reserva del backend y removerla de la vista.

### Backend
Está en `mock-backend/`. **NO LO MODIFIQUES.** Solo léelo y córrelo.

---

## 1) Levantar el backend mock
```bash
cd simulacro/mock-backend
npm install
npm start
# ✅ Mock backend (Reservas) en http://localhost:8080
```
> Si el **8080 está ocupado** (p. ej. tu backend Spring real corriendo), usa otro puerto:
> `PORT=8090 npm start` y ajusta tu `.env` a `VITE_API_URL=http://localhost:8090/api/v1`.
Pruébalo:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"recepcion1@hotel.com","password":"123456"}'
# -> {"accessToken":"eyJ..."}
```

## 2) Crear tu front (como en el examen real)
En otra terminal, en la carpeta `simulacro/`:
```bash
npm create vite@latest mi-front -- --template react
cd mi-front
npm install
npm install axios react-router
# crea el archivo .env:   VITE_API_URL=http://localhost:8080/api/v1
npm run dev
```
Y ahí construyes la solución tú mismo (usa lo que sabes; el cheat-sheet es tu "apunte" si te trabas).

---

## 🔎 Lo que debes descubrir leyendo `mock-backend/server.js`
(igual que el día del examen lees el backend Spring)
- Las **rutas** y métodos del API.
- Qué **campos** lleva el body al crear/actualizar.
- Los **valores exactos** del enum de estado.
- Las **credenciales** sembradas.
- **El gotcha:** ¿el token trae `userId`? ¿el create lo pide? ¿de dónde lo sacas?

---

## ✅ Te fue bien si lograste:
- [ ] Loguearte y que el token quede guardado (y se mande en cada request).
- [ ] Ver la lista de reservas de tu usuario al entrar al tablero.
- [ ] Un componente `ReservaCard` que recibe la reserva **y** callbacks (`onEliminar`, `onCambiarEstado`).
- [ ] Crear una reserva y verla aparecer (lista refrescada).
- [ ] Cambiar el estado de una reserva y que persista al recargar.
- [ ] Eliminar una reserva y que desaparezca.

Cuando termines (o si te bloqueas 10 min), abre **`solucion/`** y compara.

---

## 💡 Pistas (úsalas solo si llevas rato trabado)
<details>
<summary>Pista 1 — el login no manda el token en las siguientes llamadas</summary>

Revisa que guardaste el token con la misma clave que lee tu `axiosClient` (`localStorage.getItem("token")`),
y que el interceptor pone `Authorization: Bearer ${token}`.
</details>

<details>
<summary>Pista 2 — al crear me da "Usuario no encontrado con id: undefined"</summary>

El create pide `userId`, pero el token NO lo trae. Sácalo de la lista que ya cargaste:
`data.userId = reservas[0]?.userId;`. Por eso conviene cargar la lista antes de permitir crear.
</details>

<details>
<summary>Pista 3 — cambio el estado y se "pierden" el nombre o la habitación</summary>

En el `PUT` manda el **objeto completo** (nombreHuesped, numeroHabitacion, estado, userId), no solo el estado.
</details>
