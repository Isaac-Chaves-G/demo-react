/**
 * BACKEND MOCK — Simulacro Examen Frontend (Reservas de Hotel)
 * ------------------------------------------------------------
 * Imita el backend Spring del examen real: login JWT + CRUD protegido + CORS abierto.
 * NO lo modifiques (haz de cuenta que es el backend que te dan en el examen). Solo léelo y córrelo.
 *
 * Cómo correr:
 *   cd simulacro/mock-backend
 *   npm install
 *   npm start            -> queda en http://localhost:8080
 *
 * Contrato del API (esto es lo que tú debes leer para construir el front):
 *   POST   /api/v1/auth/login        body { username, password }            -> { accessToken }
 *   GET    /api/v1/reservas                                                 -> [ ReservaResponse ]   (requiere token)
 *   POST   /api/v1/reservas          body { nombreHuesped, numeroHabitacion, estado, userId } -> 201 ReservaResponse
 *   PUT    /api/v1/reservas/:id       body { nombreHuesped, numeroHabitacion, estado, userId } -> 200 ReservaResponse
 *   DELETE /api/v1/reservas/:id                                             -> 200 { message }
 *
 *   ReservaResponse = { id, nombreHuesped, numeroHabitacion, estado, userId, username }
 *   estado (enum): "PENDIENTE" | "CONFIRMADA" | "CANCELADA"
 *
 * Usuarios sembrados (como el data.sql del real):
 *   recepcion1@hotel.com / 123456   (id 1)
 *   recepcion2@hotel.com / 123456   (id 2)
 *
 * ⚠️ GOTCHA (igual al examen real): el token NO trae el userId, solo el email.
 *    Pero POST /reservas EXIGE userId. Truco: sácalo de la lista del GET (reservas[0].userId).
 */

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const SECRET = "simulacro-icesi-secret-key-no-importa-cual-sea";
const PORT = process.env.PORT || 8080;   // por defecto 8080 (como el real); cámbialo con PORT=8090 npm start

app.use(cors());            // CORS abierto: igual que el backend real (ya viene resuelto)
app.use(express.json());    // parsear bodies JSON

// ---- "Base de datos" en memoria ----
const ESTADOS = ["PENDIENTE", "CONFIRMADA", "CANCELADA"];

const users = [
  { id: 1, username: "recepcion1@hotel.com", password: "123456" },
  { id: 2, username: "recepcion2@hotel.com", password: "123456" },
];

let reservas = [
  { id: 1, nombreHuesped: "Carlos Rodríguez", numeroHabitacion: 101, estado: "PENDIENTE", userId: 1 },
  { id: 2, nombreHuesped: "María González",   numeroHabitacion: 102, estado: "CONFIRMADA", userId: 1 },
  { id: 3, nombreHuesped: "Pedro Martínez",   numeroHabitacion: 205, estado: "CANCELADA",  userId: 1 },
  { id: 4, nombreHuesped: "Ana López",        numeroHabitacion: 301, estado: "PENDIENTE",  userId: 2 },
  { id: 5, nombreHuesped: "Luis Fernández",   numeroHabitacion: 302, estado: "CONFIRMADA", userId: 2 },
];
let nextId = 6;

// ---- Helpers ----
function username(userId) {
  return users.find((u) => u.id === userId)?.username ?? null;
}
function toResponse(r) {
  return { ...r, username: username(r.userId) };
}

// Middleware: valida el header Authorization: Bearer <token> (como el TokenValidationFilter del real)
function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(header.replace("Bearer ", ""), SECRET);
    req.user = payload;     // { sub, email }  ← OJO: NO trae userId (igual que el real)
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// ---- LOGIN (público) ----
app.post("/api/v1/auth/login", (req, res) => {
  const { username: u, password } = req.body || {};
  const found = users.find((x) => x.username === u && x.password === password);
  if (!found) return res.status(401).json({ message: "Credenciales inválidas" });

  // El token solo lleva email (replica el gotcha: no hay userId en el token)
  const accessToken = jwt.sign({ sub: found.username, email: found.username }, SECRET, {
    expiresIn: "60m",
  });
  res.status(200).json({ accessToken });
});

// ---- GET (reservas del usuario logueado) ----
app.get("/api/v1/reservas", auth, (req, res) => {
  const me = users.find((u) => u.username === req.user.email);
  res.status(200).json(reservas.filter((r) => r.userId === me.id).map(toResponse));
});

// ---- CREATE ----
app.post("/api/v1/reservas", auth, (req, res) => {
  const { nombreHuesped, numeroHabitacion, estado, userId } = req.body || {};
  if (!users.find((u) => u.id === userId)) {
    return res.status(400).json({ message: "Usuario no encontrado con id: " + userId });
  }
  if (!ESTADOS.includes(estado)) {
    return res.status(400).json({ message: "Estado inválido. Use: " + ESTADOS.join(", ") });
  }
  const nueva = { id: nextId++, nombreHuesped, numeroHabitacion, estado, userId };
  reservas.push(nueva);
  res.status(201).json(toResponse(nueva));
});

// ---- UPDATE ----
app.put("/api/v1/reservas/:id", auth, (req, res) => {
  const id = Number(req.params.id);
  const r = reservas.find((x) => x.id === id);
  if (!r) return res.status(404).json({ message: "Reserva no encontrada con id: " + id });

  const { nombreHuesped, numeroHabitacion, estado } = req.body || {};
  if (estado && !ESTADOS.includes(estado)) {
    return res.status(400).json({ message: "Estado inválido. Use: " + ESTADOS.join(", ") });
  }
  r.nombreHuesped = nombreHuesped ?? r.nombreHuesped;
  r.numeroHabitacion = numeroHabitacion ?? r.numeroHabitacion;
  r.estado = estado ?? r.estado;
  res.status(200).json(toResponse(r));
});

// ---- DELETE ----
app.delete("/api/v1/reservas/:id", auth, (req, res) => {
  const id = Number(req.params.id);
  const before = reservas.length;
  reservas = reservas.filter((x) => x.id !== id);
  if (reservas.length === before) {
    return res.status(404).json({ message: "Reserva no encontrada con id: " + id });
  }
  res.status(200).json({ message: "Reserva eliminada exitosamente" });
});

app.listen(PORT, () => {
  console.log(`✅ Mock backend (Reservas) en http://localhost:${PORT}`);
  console.log(`   Login: recepcion1@hotel.com / 123456`);
});
