# 🧭 Guía paso a paso — Cómo resolver el examen de Frontend

> Léela una vez de corrido. Las **🟦 cajas de concepto** explican el "por qué" para principiante.
> Los **⚠️ gotchas** son los errores que más se cometen. El código completo está en `02-cheatsheet-codigo.md`.

---

## Sección 0 — Mentalidad y mapa mental

El examen es **un CRUD con login**. CRUD = **C**reate, **R**ead, **U**pdate, **D**elete.
Todo lo que vas a hacer es:

1. Pedir un **token** al backend (login) y guardarlo.
2. Con el token, **leer** una lista de cosas y pintarlas.
3. Pintar cada cosa con un **componente** que tiene botones.
4. Esos botones **crean / actualizan / borran** cosas en el backend.

Si entiendes ese ciclo, ya entendiste el 90% del examen. El otro 10% son detalles (gotchas).

> 🟦 **¿Qué es React, en cristiano?**
> Una librería para construir interfaces partiendo la pantalla en **componentes** (piezas de UI
> reutilizables que son funciones que devuelven HTML/JSX). React **vuelve a dibujar** (re-render) un
> componente cuando cambia su **estado** o sus **props**. Tú no tocas el HTML a mano: cambias datos
> y React redibuja.

---

## Sección 0.1 — Los 6 conceptos de React que SÍ o SÍ necesitas

Lee esto antes de programar. Lo vas a usar todo el examen.

### 1. Componente
Una **función** que devuelve JSX (HTML con superpoderes). Su nombre va en **Mayúscula**.
```jsx
function Saludo() {
  return <h1>Hola</h1>;
}
// se usa como una etiqueta:  <Saludo />
```

### 2. Props (propiedades) — datos que el padre le pasa al hijo
Las props **bajan** del componente padre al hijo. Son de **solo lectura** para el hijo.
```jsx
function Saludo({ nombre }) {        // recibe la prop 'nombre'
  return <h1>Hola {nombre}</h1>;
}
// el padre la pasa así:
<Saludo nombre="Andrés" />
```
> 🟦 `{ nombre }` es **destructuring**: saca la propiedad `nombre` del objeto de props.
> Equivale a `function Saludo(props) { ... props.nombre ... }`.

### 3. `useState` — estado (memoria) del componente
Cuando un dato cambia y quieres que la pantalla se actualice, va en **estado**.
```jsx
const [contador, setContador] = useState(0);
//     ^valor      ^función para cambiarlo   ^valor inicial
setContador(contador + 1);   // esto provoca un re-render
```
> ⚠️ **Nunca** cambies el estado a mano (`contador = 5` ❌). Siempre con su setter (`setContador(5)` ✅),
> porque solo el setter avisa a React para redibujar.

### 4. `useEffect` — ejecutar algo "cuando pasa X" (típicamente: al montar)
Sirve para **efectos secundarios**: pedir datos a un API, suscripciones, timers.
```jsx
useEffect(() => {
  cargarDatos();          // se ejecuta...
}, []);                   // ...UNA vez, al montar el componente (array vacío = "solo al inicio")
```
> 🟦 El **array de dependencias** `[]` controla cuándo se vuelve a ejecutar. `[]` = solo al montar.
> `[algo]` = cada vez que `algo` cambie. Para "cargar la lista al entrar a la página" usas `[]`.

### 5. Manejo de eventos (`onClick`, `onSubmit`)
```jsx
<button onClick={() => alert('clic!')}>Dame</button>
<button onClick={miFuncion}>Dame</button>   // pasas la función SIN paréntesis
```
> ⚠️ `onClick={miFuncion()}` (con paréntesis) la **ejecuta de una vez** al renderizar. ❌
> `onClick={miFuncion}` o `onClick={() => miFuncion(arg)}` la ejecuta **al hacer clic**. ✅

### 6. Callback (función pasada como prop) — ⭐ LO QUE EL PROFE RECALCÓ
Una prop **también puede ser una función**. El padre le pasa al hijo "qué hacer cuando pase algo".
```jsx
// PADRE: le pasa al hijo una función llamada onBorrar
<Tarjeta texto="Pedido 1" onBorrar={() => borrar(1)} />

// HIJO: recibe onBorrar como prop y la LLAMA cuando hacen clic
function Tarjeta({ texto, onBorrar }) {
  return (
    <div>
      <p>{texto}</p>
      <button onClick={onBorrar}>Borrar</button>   {/* llama a la función del padre */}
    </div>
  );
}
```
> 🟦 **¿Para qué sirve?** El hijo (la `Tarjeta`) no sabe NI le importa cómo se borra algo del backend.
> Solo avisa "me hicieron clic en borrar" llamando `onBorrar()`. El **padre** decide qué hacer.
> Esto se llama **"levantar el estado"** (lifting state up) y es el patrón estrella del examen.

---

## Sección 1 — Setup (los primeros 10 minutos del examen)

### 1.1 Clonar y mirar qué te dieron
El repo del classroom trae dos carpetas:
```
/back    → Spring Boot. NO LO TOCAS. Solo lo ejecutas y lo LEES.
/front   → React + Vite. Aquí trabajas TODO.
```

### 1.2 🔎 Leer el backend para sacar el "contrato" (¡clave!)
Antes de escribir una línea de React, abre estos archivos del backend y anota:

| Archivo a abrir | Qué anotas |
|---|---|
| `**/api/*RestController.java` | Las **rutas** y métodos: `@RequestMapping("/api/v1/...")`, `@GetMapping`, `@PostMapping`, `@PutMapping("/{id}")`, `@DeleteMapping("/{id}")` |
| `**/dto/*Request.java` | **Qué campos MANDAS** en el body al crear/editar |
| `**/dto/*Response.java` | **Qué campos RECIBES** (para pintarlos) |
| `**/entity/*.java` (el `enum`) | Los **valores exactos** del estado (ej. `EN_CAMINO`) — copia-pégalos, respeta mayúsculas/guiones |
| `**/resources/data.sql` | Las **credenciales** sembradas (usuario + password) |
| `**/AuthRestController.java` | La ruta de login y el nombre del campo del token en la respuesta (`accessToken`) |

> 🟦 **Esto es lo más importante que aprenderás hoy.** El examen no es "adivina el API", es "lee el API".
> Si lees bien estos 6 archivos, ya sabes exactamente qué pedir y qué mandar.

**Ejemplo real (backend Pedidos):**
```
POST /api/v1/auth/login   body {username, password}            → {accessToken}
GET  /api/v1/domicilios                                        → [{id, nombreDomiciliario, estado, userId, username}]
POST /api/v1/domicilios   body {nombreDomiciliario, estado, userId}  → 201 {id, ...}
PUT  /api/v1/domicilios/{id}  body {nombreDomiciliario, estado, userId} → 200 {id, ...}
DELETE /api/v1/domicilios/{id}                                → 200 {message}
Estados: EN_CAMINO | EN_REPARTO | ENTREGADO
Credenciales: usuario1@correo.com / 123456
```

### 1.3 Levantar el backend
Ábrelo en IntelliJ y corre la clase `*Application.java` (botón ▶). O por terminal en `/back`:
```bash
./mvnw spring-boot:run      # Mac/Linux
mvnw.cmd spring-boot:run     # Windows
```
Verifica que arrancó: debe quedar escuchando en **http://localhost:8080**. (Tiene consola H2 en `/h2`.)

### 1.4 Levantar el front
En `/front`:
```bash
npm install
npm run dev          # abre http://localhost:5173
```

### 1.5 Configurar la URL del backend (`.env`)
Crea un archivo **`.env`** en la raíz de `/front`:
```bash
VITE_API_URL=http://localhost:8080/api/v1
```
> ⚠️ **GOTCHAS de `.env` (muy comunes):**
> - La variable **DEBE** empezar con `VITE_` o Vite la ignora.
> - Se lee con `import.meta.env.VITE_API_URL` (NO `process.env`).
> - Tras crear/cambiar el `.env`, **reinicia `npm run dev`** (Vite no recarga el .env en caliente).

### 1.6 Probar que el backend responde (antes de pelear con React)
Usa el navegador o Postman o un `curl`:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario1@correo.com","password":"123456"}'
# Debe responder: {"accessToken":"eyJ..."}
```
Si esto funciona, el resto es solo React.

---

## Sección 2 — Orden de ataque (el plan de batalla)

Hazlo **en este orden**. Cada paso deja algo que puedes probar antes de seguir:

```
1. axiosClient.js        (la base para hablar con el backend + meter el token)   [5 min]
2. login.service.js      (función que llama al endpoint de login)                [5 min]
3. AuthContext.jsx       (guardar token / saber si estás logueado)               [10 min]
4. main.jsx + Router.jsx (envolver la app y definir rutas)                       [10 min]
5. Login.jsx             (formulario → token → guardar → navegar)        20% ✅   [15 min]
6. service CRUD (get)    + Board/Dashboard (fetch + pintar lista)                [15 min]
7. Card.jsx              (componente de 1 ítem + props + CALLBACKS)      20% ✅   [20 min]
8. Crear (form + POST + refrescar)                                       20% ✅   [15 min]
9. Cambiar estado (PUT)                                                  20% ✅   [10 min]
10. Eliminar (DELETE)                                                    20% ✅   [10 min]
11. ProtectedRoute (si hay login)                                                [5 min]
12. Repasar checklist y probar todo                                              [10 min]
```
> 💡 **Estrategia de puntos:** si te bloqueas en el login (20%), **igual puedes ganar el otro 80%**
> dejando el token "a mano" temporalmente (haces login con curl, copias el token a `localStorage`)
> y construyes lista/card/crear/editar/borrar. Nunca te quedes pegado en un solo bloque.

---

## Sección 3 — Bloque LOGIN (20%)

**Qué pide:** ingresar credenciales → pedir token al endpoint → **guardar** el token → usarlo en TODO
lo demás → redirigir al tablero.

**Archivos:** `axiosClient.js`, `login.service.js`, `AuthContext.jsx`, `Login.jsx`, `main.jsx`.

### Cómo funciona (el flujo)
1. El usuario llena el form y da "Entrar".
2. `Login.jsx` llama a `login(username, password)` del service.
3. El service hace `POST /auth/login` con axios y devuelve `{accessToken}`.
4. Guardas el token: en `localStorage` **y** en el `AuthContext` (estado global).
5. `navigate('/dashboard')`.

> 🟦 **¿Por qué `localStorage`?** Es una "cajita" del navegador que **sobrevive recargas**. Guardas el
> token ahí para que, si el usuario refresca la página, sigas logueado. El `axiosClient` lo lee de ahí
> para meter el header `Authorization` automáticamente en cada petición.

> 🟦 **¿Por qué Context?** El token lo necesitan muchos componentes (el dashboard, las rutas protegidas).
> En vez de pasarlo por props uno a uno, lo pones en un **Context** (estado global) y cualquier componente
> lo lee con `useContext(AuthContext)`.

> ⚠️ **GOTCHAS del login:**
> - El campo del token se llama **`accessToken`** (no `token` ni `jwt`). Léelo del backend: `AuthResponse`.
> - La ruta es **`/api/v1/auth/login`**. En tu código del curso decía `/public/auth/login` → **CÁMBIALA**.
> - `e.preventDefault()` en el submit, o la página se recarga y pierdes todo.
> - Guarda el token con la MISMA clave (`'token'`) que lee el `axiosClient`. Si guardas con `'jwt'` y lees `'token'`, nunca mandas el header → 401 en todo.

---

## Sección 4 — Bloque LEER LISTA (fetch) — base del tablero

**Qué pide:** mostrar la lista de ítems del usuario logueado.

### El patrón "fetch al montar" (memorízalo, lo usarás siempre)
```jsx
const [items, setItems] = useState([]);          // 1. estado para la lista, empieza vacía

useEffect(() => {                                 // 2. al montar la página...
  cargarItems();                                  //    ...pide los datos
}, []);

async function cargarItems() {
  const data = await getAll();                    // 3. service GET con axios (ya manda el token)
  setItems(data);                                 // 4. guarda en estado → React pinta la lista
}
```
Y pintas con `.map`:
```jsx
{items.map(item => (
  <Card key={item.id} item={item} onBorrar={...} onCambiarEstado={...} />
))}
```
> ⚠️ **GOTCHA:** cada elemento de un `.map` necesita una prop **`key`** única (usa `item.id`).
> Sin `key`, React se queja y puede pintar mal al actualizar/borrar.

> ⚠️ **GOTCHA del `userId` (backend Pedidos):** el JWT solo trae el `email`, **no** el `userId`,
> pero `POST /domicilios` exige `userId`. **Truco:** sácalo de la lista que ya cargaste:
> `const userId = items[0]?.userId;`. (En el examen real revisa el `*Request`: si NO pide userId,
> ignora esto; si lo pide y el token no lo tiene, este es el camino.)

---

## Sección 5 — Bloque COMPONENTE: la `Card` (20%) ⭐

**Qué pide:** un componente React que pinta **UN** ítem, muestra **toda** su info, e incluye las
**acciones** de actualizar y eliminar.

Aquí es donde el profe mira si sabes **props + callbacks**. La `Card`:
- **Recibe datos** por props: `item` (o `nombre`, `estado`, etc.).
- **Recibe funciones** por props: `onBorrar`, `onCambiarEstado` (callbacks).
- Cuando el usuario hace clic en un botón, la `Card` **llama** a la función que le pasaron.
- La `Card` **NO** sabe de axios ni del backend. Solo avisa al padre.

```jsx
export default function Card({ item, onBorrar, onCambiarEstado }) {
  return (
    <div>
      <h3>{item.nombreDomiciliario}</h3>
      <p>Estado: {item.estado}</p>

      {/* cambiar estado: avisa al padre con el nuevo valor */}
      <select value={item.estado} onChange={(e) => onCambiarEstado(item.id, e.target.value)}>
        <option value="EN_CAMINO">EN_CAMINO</option>
        <option value="EN_REPARTO">EN_REPARTO</option>
        <option value="ENTREGADO">ENTREGADO</option>
      </select>

      {/* borrar: avisa al padre con el id */}
      <button onClick={() => onBorrar(item.id)}>Eliminar</button>
    </div>
  );
}
```
> 🟦 **El flujo del callback, paso a paso:**
> 1. El padre (Board) tiene la función real `borrar(id)` que llama a axios `DELETE`.
> 2. El padre se la pasa a la Card: `<Card onBorrar={borrar} />`.
> 3. Dentro de la Card, el botón hace `onClick={() => onBorrar(item.id)}`.
> 4. Al hacer clic → se ejecuta la función del padre → se borra en el backend → el padre refresca la lista.
>
> **Esto es lo que significa "pasar funciones entre componentes".** Si te preguntan en la sustentación,
> di exactamente esto.

---

## Sección 6 — Bloque CREAR (20%)

**Qué pide:** un formulario para registrar un ítem nuevo, mandarlo con el token, y **refrescar la lista**.

```jsx
async function crear(e) {
  e.preventDefault();                              // no recargar
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);       // {nombreDomiciliario, estado}
  data.userId = items[0]?.userId;                  // (gotcha userId, ver Sección 4)
  await createItem(data);                          // service POST con axios
  await cargarItems();                             // ⭐ refrescar la lista (vuelve a hacer GET)
}
```
> 🟦 **Dos formas de "refrescar la lista":**
> - **(A) Volver a pedir el GET** (`cargarItems()`): la más simple y segura. **Úsala.**
> - **(B)** Agregar el ítem nuevo al estado: `setItems([...items, nuevo])`. Más rápida pero más fácil de equivocar.
> Para el examen, **(A)** te garantiza datos correctos sin pensar.

> ⚠️ **GOTCHA:** el `estado` debe ser uno de los valores EXACTOS del enum (`EN_CAMINO`...), no texto libre.
> Por eso usa un `<select>` con esos valores, no un input de texto.

---

## Sección 7 — Bloque CAMBIAR ESTADO (20%)

**Qué pide:** cambiar el estado entre los 3 valores; reflejarlo en backend y en la UI.

El `PUT` normalmente reenvía **todo** el objeto con el campo cambiado (mira el `*Request`):
```jsx
async function cambiarEstado(id, nuevoEstado) {
  const item = items.find(i => i.id === id);       // el ítem actual
  await updateItem(id, {                           // service PUT /items/{id}
    nombreDomiciliario: item.nombreDomiciliario,
    estado: nuevoEstado,                           // el cambio
    userId: item.userId,
  });
  await cargarItems();                             // refrescar
}
```
> ⚠️ **GOTCHA:** si el `*Request` del PUT pide `nombreDomiciliario` y `userId` además del `estado`, y solo
> mandas `{estado}`, el backend puede ponerlos en `null`. **Manda el objeto completo** con lo que ya tenías.

---

## Sección 8 — Bloque ELIMINAR (20%)

**Qué pide:** botón claro que borra del backend y quita de la vista.
```jsx
async function borrar(id) {
  await deleteItem(id);     // service DELETE /items/{id}
  await cargarItems();      // refrescar (el ítem ya no viene)
}
```
Eso es todo. El botón vive en la `Card` (Sección 5) y llama `onBorrar(item.id)`.

---

## Sección 9 — Rutas protegidas (si hay login)

Evita que entren al dashboard sin token. Patrón con `<Outlet/>`:
```jsx
// ProtectedRoute.jsx
export default function ProtectedRoute() {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}
```
Y en el `Router.jsx` envuelves las rutas privadas con `{ element: <ProtectedRoute/>, children: [...] }`.
> 🟦 El profe dijo que **no es seguro** que pidan login. Si NO lo piden, **sáltate** Context/ProtectedRoute
> y haz el dashboard directo. Menos código = menos errores.

---

## Sección 10 — "action o fetch": ¿qué uso?

El profe mencionó "**action o fetch**". Traducción:
- **fetch** = el enfoque que **viste en el curso**: services con `axios` + `useEffect`/`useState`. **USA ESTE.**
- **action/loader** = una forma alternativa de React Router v7 (funciones `action`/`loader` y `useFetcher`).
  Es más avanzada y **no la viste a fondo**. No la necesitas para sacar el 100%.

👉 **Ve con axios + useEffect/useState.** Es lo que dominas y cubre los 5 bloques.

---

## Sección 11 — ⚠️ Gotchas / errores comunes (lee esto la noche antes)

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Todo da **401 Unauthorized** | No mandas el header `Authorization`, o guardaste el token con otra clave | Verifica que `axiosClient` lee la MISMA clave de `localStorage` que usaste al guardar |
| Login no hace nada / recarga la página | Falta `e.preventDefault()` | Agrégalo al inicio del submit |
| El `.env` no se aplica | No empieza con `VITE_`, o no reiniciaste Vite | Renombra a `VITE_...` y reinicia `npm run dev` |
| `import.meta.env.VITE_API_URL` es `undefined` | El `.env` está en la carpeta equivocada | Debe estar en la raíz de `/front`, junto a `package.json` |
| 404 en las llamadas | Ruta mal (ej. `/public/...` del curso) | Usa la ruta real del `RestController` (`/api/v1/...`) |
| Error de **CORS** | (Raro: el backend ya lo trae resuelto) | No toques el backend; revisa que la URL/puerto del `.env` sea correcta |
| El estado no se actualiza en pantalla | Mutaste el estado a mano | Usa siempre el `setX(...)` |
| Warning de `key` en consola | Falta `key` en el `.map` | `key={item.id}` |
| Crear/editar manda `null` | El `*Request` pedía más campos | Manda el objeto completo (Sección 7) |
| Al crear falla con "Usuario no encontrado" | Falta o va mal el `userId` | Saca el `userId` de la lista (Sección 4) |
| La app carga en blanco tras `npm run build`/deploy | `basename` raro en el Router | Para local, quita `{ basename: "..." }` del `createBrowserRouter` |

---

## Sección 12 — Sustentación (por si el profe pregunta)

Ten lista la respuesta a estas 4 preguntas (las hace seguido):
1. **¿Cómo pasas datos del padre al hijo?** → Por **props**. (Muestra la `Card`.)
2. **¿Cómo avisa el hijo al padre que pasó algo (ej. borrar)?** → Le paso una **función como prop**
   (callback, `onBorrar`); el hijo la llama y el padre decide qué hacer.
3. **¿Cómo proteges las llamadas con el token?** → Lo guardo en `localStorage`; un **interceptor** de
   axios mete `Authorization: Bearer <token>` en cada request.
4. **¿Cómo refrescas la lista al crear/borrar?** → Vuelvo a hacer el `GET` (`cargarItems()`) tras la operación.

---

## Sección 13 — ✅ Checklist de autoevaluación (revísate aquí)

Marca lo que puedas hacer **sin mirar el cheat-sheet**. Si marcas todo, estás listo.

**Setup**
- [ ] Sé leer el backend y sacar rutas, DTOs, enum y credenciales.
- [ ] Sé crear el `.env` con `VITE_API_URL` y leerlo con `import.meta.env`.
- [ ] Sé levantar back (8080) y front (5173) y probar el login con curl/Postman.

**Auth**
- [ ] Escribo el `axiosClient` con el interceptor que mete el token.
- [ ] Escribo `login.service` y el `Login.jsx` (form → token → guardar → navegar).
- [ ] Sé qué es el Context y por qué guardo el token ahí + en localStorage.

**CRUD**
- [ ] Escribo el patrón fetch-al-montar (`useState` + `useEffect` + `.map`).
- [ ] Escribo la `Card` que recibe **props** Y **callbacks** (`onBorrar`, `onCambiarEstado`).
- [ ] Explico con mis palabras cómo viaja un callback del padre al hijo y de vuelta.
- [ ] Hago crear (POST) + refrescar la lista.
- [ ] Hago cambiar estado (PUT) mandando el objeto completo.
- [ ] Hago eliminar (DELETE) + refrescar.

**Gotchas**
- [ ] Me sé los 3 errores top: clave del token, `e.preventDefault()`, valores exactos del enum.
- [ ] Sé de dónde sacar el `userId` si el create lo pide.

👉 Ahora ve a `02-cheatsheet-codigo.md` para ver TODO el código junto, y luego al `simulacro/`.
