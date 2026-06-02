# 📋 Cheat-sheet de código — Examen Frontend React

> Snippets **completos y en orden de construcción**. Sacados de tu código del curso y corregidos para el examen.
> Uso **HTML plano** (más rápido y seguro bajo presión). Al final hay una nota de **MUI** por si lo prefieres.
> Dominio de ejemplo: **Pedidos** (`domicilio`). Cambia los nombres según tu examen.

Estructura de carpetas sugerida dentro de `/front/src`:
```
src/
├── lib/axios/axiosClient.js     # axios + token
├── services/
│   ├── auth.service.js          # login
│   └── domicilios.service.js    # CRUD
├── context/AuthContext.jsx      # token global (si hay login)
├── components/
│   ├── ProtectedRoute.jsx       # rutas privadas (si hay login)
│   └── DomicilioCard.jsx        # ⭐ componente de 1 ítem (props + callbacks)
├── pages/
│   ├── Login/Login.jsx
│   └── Board/Board.jsx          # tablero: fetch + lista + crear
├── router/Router.jsx
└── main.jsx
```

---

## 0. `.env` (raíz de `/front`, junto a package.json)
```bash
VITE_API_URL=http://localhost:8080/api/v1
```
> Reinicia `npm run dev` tras crearlo.

---

## 1. `src/lib/axios/axiosClient.js` — base + token automático
```js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,        // http://localhost:8080/api/v1
  headers: { "Content-Type": "application/json" },
});

// Interceptor: antes de CADA petición, mete el token si existe
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
```
> 🔑 Esto es lo que hace que TODAS tus llamadas vayan autenticadas sin repetir el header.

---

## 2. `src/services/auth.service.js` — login
```js
import axiosClient from "../lib/axios/axiosClient";

export async function login(username, password) {
  const response = await axiosClient.post("/auth/login", { username, password });
  return response.data;                 // { accessToken: "eyJ..." }
}
```

---

## 3. `src/services/domicilios.service.js` — CRUD completo
```js
import axiosClient from "../lib/axios/axiosClient";

const URL = "/domicilios";              // cambia según tu examen (/vuelos, /reservas, ...)

export async function getDomicilios() {
  const res = await axiosClient.get(URL);
  return res.data;                      // [{ id, nombreDomiciliario, estado, userId, username }]
}

export async function createDomicilio(data) {
  const res = await axiosClient.post(URL, data);     // data = { nombreDomiciliario, estado, userId }
  return res.data;
}

export async function updateDomicilio(id, data) {
  const res = await axiosClient.put(`${URL}/${id}`, data);
  return res.data;
}

export async function deleteDomicilio(id) {
  const res = await axiosClient.delete(`${URL}/${id}`);
  return res.data;
}
```

---

## 4. `src/context/AuthContext.jsx` — token global (solo si hay login)
```jsx
import { createContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const value = {
    token,
    isAuthenticated: Boolean(token),
    login: (newToken) => {
      localStorage.setItem("token", newToken);   // persiste
      setToken(newToken);                          // estado global
    },
    logout: () => {
      localStorage.removeItem("token");
      setToken(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
```
> 🟦 Versión simple (sin `jwt-decode`). Si necesitas datos del token, instala `jwt-decode` y haz
> `jwtDecode(token)` — pero para el examen, con saber "hay token = estás logueado" suele bastar.

---

## 5. `src/main.jsx` — envolver la app
```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import router from "./router/Router";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
```
> Si NO hay login, quita `<AuthProvider>` y déjalo solo con `<RouterProvider>`.

---

## 6. `src/router/Router.jsx` — navegación
```jsx
import { createBrowserRouter } from "react-router";
import Login from "../pages/Login/Login";
import Board from "../pages/Board/Board";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute />,        // todo lo de adentro requiere token
    children: [
      { path: "/dashboard", element: <Board /> },
    ],
  },
]);

export default router;
```
> ⚠️ **No pongas `{ basename: "..." }`** para correr local. Eso era solo para el deploy en Tomcat.
> Si NO hay login: borra `ProtectedRoute` y deja `{ path: "/dashboard", element: <Board/> }` directo.

---

## 7. `src/components/ProtectedRoute.jsx` — ruta privada (solo si hay login)
```jsx
import { Navigate, Outlet } from "react-router";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;                    // pinta la ruta hija (ej. el Board)
}
```

---

## 8. `src/pages/Login/Login.jsx` — formulario de login
```jsx
import { useContext } from "react";
import { useNavigate } from "react-router";
import { login } from "../../services/auth.service";
import AuthContext from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login: guardarToken } = useContext(AuthContext);

  async function onSubmit(e) {
    e.preventDefault();                                   // ⚠️ no recargar
    const data = Object.fromEntries(new FormData(e.target));  // { username, password }
    try {
      const res = await login(data.username, data.password);  // { accessToken }
      guardarToken(res.accessToken);                      // ⚠️ ojo: accessToken
      navigate("/dashboard");                             // redirige
    } catch (err) {
      alert("Credenciales inválidas");
      console.error(err);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Login</h1>
      <input name="username" placeholder="Usuario" />
      <input name="password" type="password" placeholder="Contraseña" />
      <button type="submit">Entrar</button>
    </form>
  );
}
```
> 🟦 `Object.fromEntries(new FormData(e.target))` lee todos los inputs por su `name`. Por eso cada input
> necesita un `name`. Alternativa: `useState` controlado (más verboso). Para el examen, FormData es rápido.

---

## 9. ⭐ `src/components/DomicilioCard.jsx` — componente de 1 ítem (props + CALLBACKS)
```jsx
const ESTADOS = ["EN_CAMINO", "EN_REPARTO", "ENTREGADO"];   // valores EXACTOS del enum

export default function DomicilioCard({ domicilio, onCambiarEstado, onEliminar }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 16, margin: 8, borderRadius: 8 }}>
      {/* muestra TODA la info */}
      <h3>{domicilio.nombreDomiciliario}</h3>
      <p>ID: {domicilio.id}</p>
      <p>Estado actual: <strong>{domicilio.estado}</strong></p>

      {/* CAMBIAR ESTADO: avisa al padre con (id, nuevoEstado) */}
      <label>Cambiar estado: </label>
      <select
        value={domicilio.estado}
        onChange={(e) => onCambiarEstado(domicilio.id, e.target.value)}
      >
        {ESTADOS.map((es) => (
          <option key={es} value={es}>{es}</option>
        ))}
      </select>

      {/* ELIMINAR: avisa al padre con el id */}
      <button onClick={() => onEliminar(domicilio.id)} style={{ marginLeft: 8 }}>
        Eliminar
      </button>
    </div>
  );
}
```
> ⭐ **Las 3 props clave:** `domicilio` (DATOS), `onCambiarEstado` y `onEliminar` (FUNCIONES/callbacks).
> La Card no sabe de axios: solo **llama** a las funciones que le pasó el padre. Esto es lo que el profe evalúa.

---

## 10. `src/pages/Board/Board.jsx` — tablero: fetch + lista + crear + editar + borrar (el padre)
```jsx
import { useEffect, useState } from "react";
import {
  getDomicilios, createDomicilio, updateDomicilio, deleteDomicilio,
} from "../../services/domicilios.service";
import DomicilioCard from "../../components/DomicilioCard";

const ESTADOS = ["EN_CAMINO", "EN_REPARTO", "ENTREGADO"];

export default function Board() {
  const [domicilios, setDomicilios] = useState([]);   // la lista

  // 1) cargar al montar
  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const data = await getDomicilios();
    setDomicilios(data);
  }

  // 2) crear
  async function onCrear(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));   // { nombreDomiciliario, estado }
    data.userId = domicilios[0]?.userId;                       // ⚠️ gotcha userId (saca de la lista)
    await createDomicilio(data);
    e.target.reset();                                          // limpia el form
    await cargar();                                            // refresca
  }

  // 3) cambiar estado (callback que recibe la Card)
  async function onCambiarEstado(id, nuevoEstado) {
    const d = domicilios.find((x) => x.id === id);
    await updateDomicilio(id, {
      nombreDomiciliario: d.nombreDomiciliario,   // manda el objeto COMPLETO
      estado: nuevoEstado,
      userId: d.userId,
    });
    await cargar();
  }

  // 4) eliminar (callback que recibe la Card)
  async function onEliminar(id) {
    await deleteDomicilio(id);
    await cargar();
  }

  return (
    <div>
      <h1>Tablero de Pedidos</h1>

      {/* FORM CREAR */}
      <form onSubmit={onCrear}>
        <input name="nombreDomiciliario" placeholder="Nombre domiciliario" />
        <select name="estado" defaultValue="EN_CAMINO">
          {ESTADOS.map((es) => <option key={es} value={es}>{es}</option>)}
        </select>
        <button type="submit">Crear</button>
      </form>

      {/* LISTA: pasa DATOS y CALLBACKS a cada Card */}
      <p>Total: {domicilios.length}</p>
      {domicilios.map((d) => (
        <DomicilioCard
          key={d.id}                          // ⚠️ key única
          domicilio={d}                        // dato
          onCambiarEstado={onCambiarEstado}    // callback
          onEliminar={onEliminar}              // callback
        />
      ))}
    </div>
  );
}
```

---

## 11. (Opcional) Versión con MUI — si prefieres como en el curso
Si quieres usar Material UI (ya está instalado), cambia los elementos planos por:
```jsx
import { Box, Button, Card, TextField, Typography, MenuItem, Select } from "@mui/material";

// input  →  <TextField name="..." label="..." />
// button →  <Button variant="contained" type="submit">...</Button>
// div    →  <Card sx={{ p: 2, m: 1 }}> ... </Card>
// select →  <Select name="estado" defaultValue="EN_CAMINO">
//             <MenuItem value="EN_CAMINO">EN_CAMINO</MenuItem> ...
//           </Select>
```
> 🟦 Funciona igual; solo es estética. Bajo presión, **HTML plano es más rápido**. Decide tú.

---

## 12. Resumen del flujo de datos (para que lo "veas")
```
[Login] --login()--> backend --accessToken--> localStorage + AuthContext
                                                     |
[Board] --getDomicilios()--> backend --lista--> setDomicilios() --> .map --> [DomicilioCard x N]
   ^                                                                              |
   |                                                          clic en botón --> onEliminar(id) / onCambiarEstado(id, estado)
   |                                                                              |
   +------------------ cargar() (refresca la lista) <--- updateDomicilio/deleteDomicilio/createDomicilio
```
El **token** lo inyecta el interceptor de axios en cada flecha hacia "backend". Eso es todo el examen.
