# Guia ultra clara para adaptar el `react-demo` del profesor al parcial de Frontend

Esta guia esta hecha para usar el repo demo del profesor como base durante el parcial.

El objetivo no es construir una app desde cero. El objetivo es tomar la forma que ya trae el profesor y cambiar solo lo que el enunciado pida.

El repo del profesor ya trae:

```txt
Login
AuthContext
ProtectedRoute
Pagina protegida de animales
Formulario para agregar animales
Componente individual de animal
```

En el parcial, casi siempre el backend ya existe y NO se toca. Tu trabajo sera consumir la API REST desde React.

---

## 1. La idea central

El demo del profesor funciona con animales locales.

```txt
LoginPage
  -> llama authService.login()
  -> marca isAuthenticated
  -> navega a /animals

ProtectedRoute
  -> revisa isAuthenticated
  -> si es true deja entrar a /animals
  -> si es false manda a /login

AnimalPages
  -> muestra una lista local de animales
  -> permite agregar animales localmente
```

En el parcial necesitamos convertir eso en una app REST:

```txt
LoginPage
  -> llama authService.login()
  -> recibe token del backend
  -> guarda token en localStorage
  -> marca isAuthenticated
  -> navega a la pagina principal

ProtectedRoute
  -> bloquea rutas privadas

ResourcePage
  -> carga datos desde backend
  -> muestra lista
  -> crea registros
  -> si lo piden: actualiza, elimina, muestra detalle o ejecuta acciones especiales
```

`Resource` significa "el recurso del enunciado".

Ejemplos:

```txt
Si el parcial habla de cursos:
  Resource = Course
  ResourcePage = CoursesPage
  ResourceForm = CourseForm
  ResourceCard = CourseCard
  service = courseService

Si habla de vuelos:
  Resource = Flight
  ResourcePage = FlightsPage
  ResourceForm = FlightForm
  ResourceCard = FlightCard
  service = flightService

Si habla de posts:
  Resource = Post
  ResourcePage = FeedPage o PostsPage
  ResourceForm = PostForm
  ResourceCard = PostCard
  service = postService
```

La frase clave:

```txt
No cambio la arquitectura. Cambio el recurso, los endpoints y los campos.
```

---

## 2. Que leer primero en el enunciado

Antes de editar codigo, responde esto en una hoja o comentario:

```txt
1. Cual es el recurso principal?
2. Cual es la URL base del backend?
3. Cual es el endpoint de login?
4. Que campos pide el login?
5. Que responde el login?
6. Cual es el endpoint para listar?
7. Cual es el endpoint para crear?
8. Hay endpoint para actualizar?
9. Hay endpoint para eliminar?
10. Hay endpoint para detalle?
11. Hay accion especial? Ej: comentar, calificar, cambiar estado, matricular.
12. Que campos debe tener el formulario?
13. Que campos se deben mostrar en pantalla?
```

Ejemplo cursos:

```txt
Recurso: cursos
Login: POST /api/auth/login
Listar: GET /api/courses
Crear: POST /api/courses
Actualizar: PUT /api/courses/{id}
Eliminar: DELETE /api/courses/{id}
Campos:
  name
  description
  code
  credits
  teacherId
```

Ejemplo vuelos:

```txt
Recurso: vuelos
Login: POST /api/v1/auth/login
Listar: GET /api/v1/vuelos
Crear: POST /api/v1/vuelos
Actualizar: PUT /api/v1/vuelos/{id}
Eliminar: DELETE /api/v1/vuelos/{id}
Campos:
  numeroVuelo
  estado
  aerolineaId
```

Regla:

```txt
El frontend no inventa nombres de campos.
El frontend envia exactamente lo que el backend espera.
```

Si el backend espera `teacherId`, no envies `teacher`.
Si espera `numeroVuelo`, no envies `flightNumber`.
Si espera `content`, no envies `description`.

---

## 3. Mapa del repo del profesor

Estos son los archivos importantes:

```txt
src/main.jsx
  Define las rutas.
  Aqui cambias /animals por /courses, /flights, /feed, etc.

src/context/AuthContext.jsx
  Guarda el estado global de autenticacion.
  En el demo guarda isAuth.
  En el parcial tambien debes guardar token.

src/pages/LoginPage/LoginPage.jsx
  Formulario de login.
  Aqui llamas al login.
  Aqui guardas token.
  Aqui navegas a la pagina principal.

src/services/authService.js
  Hace la peticion HTTP de login.
  Aqui cambias la URL del login.

src/components/ProtectedRoute/ProtectedRoute.jsx
  Protege rutas privadas.
  Casi nunca se toca.

src/pages/AnimalPages.jsx
  Pagina protegida de ejemplo.
  Se copia y se adapta al recurso del parcial.

src/components/AnimalForm/AnimalForm.jsx
  Formulario de ejemplo.
  Se copia y se adapta a los campos del parcial.

src/components/AnimalCard/Animal.jsx
  Tarjeta individual de ejemplo.
  Se copia y se adapta para mostrar un registro individual.
```

---

## 4. Flujo de la aplicacion, explicado simple

### Paso 1: React arranca

React inicia desde:

```txt
src/main.jsx
```

Ese archivo dice:

```txt
Si la URL es /login:
  mostrar LoginPage

Si la URL es /animals:
  pasar por ProtectedRoute
  si hay login, mostrar AnimalPage
  si no hay login, mandar a /login
```

En el parcial, la ruta protegida sera otra:

```txt
/courses
/flights
/feed
/activities
/submissions
/products
```

### Paso 2: El usuario hace login

`LoginPage.jsx` tiene inputs para:

```txt
username
password
```

Cuando el usuario da click en el boton:

```txt
LoginPage llama login(username, password)
```

`login` vive en:

```txt
src/services/authService.js
```

Esa funcion hace `fetch` al backend.

Si el backend responde bien, devuelve algo como:

```json
{
  "token": "eyJ..."
}
```

### Paso 3: Se guarda el token

El token se guarda en:

```txt
localStorage
```

Ejemplo:

```js
localStorage.setItem('token', response.token);
```

### Paso 4: Se marca autenticado

Tambien se marca:

```js
setIsAuthenticated(true);
```

Eso permite que `ProtectedRoute` deje entrar.

### Paso 5: Se navega a la pagina principal

Ejemplos:

```js
navigate('/courses');
navigate('/flights');
navigate('/feed');
```

### Paso 6: La pagina principal carga datos

La pagina principal usa `useEffect`.

`useEffect` significa:

```txt
Cuando esta pagina se abre, ejecuta esta funcion.
```

Ejemplo:

```js
useEffect(() => {
  loadResources();
}, []);
```

`loadResources` llama al backend:

```txt
getCourses()
getFlights()
getPosts()
```

Luego guarda la respuesta en un estado:

```js
setCourses(data);
```

Y React pinta la lista con:

```js
courses.map(...)
```

---

## 5. Token: la parte mas importante

El demo del profesor guarda `isAuth`.

Eso sirve para esto:

```txt
React sabe si debe dejar entrar a una ruta privada.
```

Pero eso NO sirve para esto:

```txt
El backend no acepta peticiones protegidas solo porque React tenga isAuth.
```

Para el backend necesitas token JWT.

### Diferencia entre `isAuth` y `token`

```txt
isAuth:
  Lo usa React.
  Sirve para ProtectedRoute.
  Es una bandera local: true o false.

token:
  Lo usa el backend.
  Se manda en cada peticion privada.
  Va en Authorization: Bearer TOKEN.
```

Frase clave:

```txt
isAuth sirve para React.
token sirve para el backend.
```

Si solo guardas `isAuth`, la ruta puede abrir, pero el backend puede responder:

```txt
401 Unauthorized
```

porque no le mandaste token.

---

## 6. Cambio obligatorio: LoginPage debe guardar token

Archivo:

```txt
src/pages/LoginPage/LoginPage.jsx
```

En el demo, despues del login se hace algo asi:

```js
setIsAuthenticated(true);
navigate('/animals');
```

En el parcial debe ser:

```js
const response = await login(username, password);

localStorage.setItem('token', response.token);

setIsAuthenticated(true);
navigate('/ruta-principal');
```

Ejemplos:

```js
navigate('/courses');
navigate('/flights');
navigate('/feed');
```

Si el backend responde el token con otro nombre:

```json
{
  "accessToken": "eyJ..."
}
```

entonces guardas:

```js
localStorage.setItem('token', response.accessToken);
```

Si responde:

```json
{
  "jwt": "eyJ..."
}
```

entonces:

```js
localStorage.setItem('token', response.jwt);
```

Regla:

```txt
Mira como se llama el campo del token en la respuesta del login.
Ese mismo campo usas para guardar el token.
```

---

## 7. Cambio obligatorio: authService.js debe apuntar al login correcto

Archivo:

```txt
src/services/authService.js
```

El demo usa una URL especifica del backend del profesor.

En el parcial debes cambiarla segun el backend que te den.

Plantilla recomendada:

```js
const API_URL = 'http://localhost:8080';

export const login = async (username, password) => {
  const request = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!request.ok) {
    throw new Error('Credenciales incorrectas');
  }

  return request.json();
};
```

Que cambias:

```txt
API_URL
endpoint de login
body si el backend no usa username/password
```

### Si el backend usa `/auth`

```js
const API_URL = 'http://localhost:8080/auth';
fetch(`${API_URL}/api/auth/login`, ...)
```

### Si el backend usa `/api/v1/auth/login`

```js
const API_URL = 'http://localhost:8080';
fetch(`${API_URL}/api/v1/auth/login`, ...)
```

### Si el backend usa email

```js
body: JSON.stringify({
  email: username,
  password,
})
```

---

## 8. Cambio obligatorio: crear apiService.js

Este archivo no viene en el demo, pero conviene agregarlo.

Crea:

```txt
src/services/apiService.js
```

Contenido:

```js
export const API_URL = 'http://localhost:8080';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};
```

Para que sirve:

```txt
Evita repetir Authorization en todos los fetch.
```

Despues, cada service lo usa:

```js
headers: getAuthHeaders()
```

Si la URL base cambia, solo cambias:

```js
export const API_URL = '...';
```

Ejemplos:

```js
export const API_URL = 'http://localhost:8080/auth';
export const API_URL = 'http://localhost:8080';
export const API_URL = 'http://localhost:8080/post-manager';
```

---

## 9. Crear service del recurso

Un service es un archivo para hablar con el backend.

Ejemplos:

```txt
courseService.js
flightService.js
postService.js
activityService.js
submissionService.js
productService.js
```

Plantilla generica:

```js
import { API_URL, getAuthHeaders } from './apiService';

const RESOURCE_PATH = '/api/resources';

export const getResources = async () => {
  const response = await fetch(`${API_URL}${RESOURCE_PATH}`, {
    headers: getAuthHeaders(),
  });

  return response.json();
};

export const createResource = async (resource) => {
  const response = await fetch(`${API_URL}${RESOURCE_PATH}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(resource),
  });

  return response.json();
};

export const updateResource = async (id, resource) => {
  const response = await fetch(`${API_URL}${RESOURCE_PATH}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(resource),
  });

  return response.json();
};

export const deleteResource = async (id) => {
  await fetch(`${API_URL}${RESOURCE_PATH}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
};
```

Que cambias:

```txt
RESOURCE_PATH
nombres de funciones
si existe o no update/delete
```

### Ejemplo cursos

```js
import { API_URL, getAuthHeaders } from './apiService';

export const getCourses = async () => {
  const response = await fetch(`${API_URL}/api/courses`, {
    headers: getAuthHeaders(),
  });

  return response.json();
};

export const createCourse = async (course) => {
  const response = await fetch(`${API_URL}/api/courses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(course),
  });

  return response.json();
};
```

### Ejemplo vuelos

```js
import { API_URL, getAuthHeaders } from './apiService';

export const getFlights = async () => {
  const response = await fetch(`${API_URL}/api/v1/vuelos`, {
    headers: getAuthHeaders(),
  });

  return response.json();
};

export const createFlight = async (flight) => {
  const response = await fetch(`${API_URL}/api/v1/vuelos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(flight),
  });

  return response.json();
};
```

---

## 10. Cambiar rutas en main.jsx

Archivo:

```txt
src/main.jsx
```

El demo importa:

```js
import AnimalPage from './pages/AnimalPages.jsx'
```

Y tiene:

```jsx
{
  path: '/animals',
  element: <AnimalPage />,
}
```

Si el parcial pide cursos:

```js
import CoursesPage from './pages/CoursesPage.jsx'
```

```jsx
{
  path: '/courses',
  element: <CoursesPage />,
}
```

Si pide vuelos:

```js
import FlightsPage from './pages/FlightsPage.jsx'
```

```jsx
{
  path: '/flights',
  element: <FlightsPage />,
}
```

Si pide posts:

```js
import FeedPage from './pages/FeedPage.jsx'
```

```jsx
{
  path: '/feed',
  element: <FeedPage />,
}
```

Tambien cambia el `navigate` del login para que mande a esa misma ruta.

---

## 11. Convertir AnimalPages.jsx en pagina REST

Archivo original:

```txt
src/pages/AnimalPages.jsx
```

El demo usa:

```js
const [animalState, setAnimalState] = useState(animals)
```

En el parcial eso cambia porque los datos vienen del backend.

Plantilla:

```jsx
import { useEffect, useState } from 'react';
import ResourceForm from '../components/ResourceForm/ResourceForm.jsx';
import ResourceCard from '../components/ResourceCard/ResourceCard.jsx';
import { getResources } from '../services/resourceService.js';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadResources = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getResources();
      setResources(data);
    } catch {
      setError('No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  return (
    <>
      <h1>Recursos</h1>

      {error && <p>{error}</p>}
      {loading && <p>Cargando...</p>}

      {!loading && (
        <div>
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onChange={loadResources}
            />
          ))}
        </div>
      )}

      <ResourceForm onCreated={loadResources} />
    </>
  );
};

export default ResourcesPage;
```

Que cambias:

```txt
ResourcesPage -> CoursesPage, FlightsPage, FeedPage
resources -> courses, flights, posts
getResources -> getCourses, getFlights, getPosts
ResourceCard -> CourseCard, FlightCard, PostCard
ResourceForm -> CourseForm, FlightForm, PostForm
```

---

## 12. Convertir AnimalForm.jsx en formulario real

Archivo original:

```txt
src/components/AnimalForm/AnimalForm.jsx
```

El demo tiene:

```js
const [newAnimal, setNewAnimal] = useState({
  especie: '',
  raza: '',
  imgs: ''
})
```

En el parcial cambias esos campos por los campos del backend.

### Plantilla generica

```jsx
import { useState } from 'react';
import { createResource } from '../../services/resourceService.js';

const ResourceForm = ({ onCreated }) => {
  const [resource, setResource] = useState({
    campo1: '',
    campo2: '',
    campo3: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createResource({
      campo1: resource.campo1,
      campo2: resource.campo2,
      campo3: resource.campo3,
    });

    setResource({
      campo1: '',
      campo2: '',
      campo3: '',
    });

    onCreated();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Campo 1"
        value={resource.campo1}
        onChange={(e) => setResource({ ...resource, campo1: e.target.value })}
      />

      <input
        placeholder="Campo 2"
        value={resource.campo2}
        onChange={(e) => setResource({ ...resource, campo2: e.target.value })}
      />

      <input
        placeholder="Campo 3"
        value={resource.campo3}
        onChange={(e) => setResource({ ...resource, campo3: e.target.value })}
      />

      <button type="submit">Crear</button>
    </form>
  );
};

export default ResourceForm;
```

### Si el recurso tiene mas atributos

Agregas mas propiedades al estado:

```js
const [course, setCourse] = useState({
  name: '',
  description: '',
  code: '',
  credits: '',
  teacherId: '',
});
```

Agregas mas inputs:

```jsx
<input
  placeholder="Creditos"
  value={course.credits}
  onChange={(e) => setCourse({ ...course, credits: e.target.value })}
/>
```

Agregas el campo en el POST:

```js
await createCourse({
  name: course.name,
  description: course.description,
  code: course.code,
  credits: Number(course.credits),
  teacherId: Number(course.teacherId),
});
```

### Si un campo es numero

Los inputs devuelven texto.

Por eso debes convertir:

```js
Number(course.credits)
Number(course.teacherId)
```

### Si un campo es fecha

Puedes usar:

```jsx
<input
  type="datetime-local"
  value={activity.deadline}
  onChange={(e) => setActivity({ ...activity, deadline: e.target.value })}
/>
```

Si el backend necesita segundos:

```js
deadline: `${activity.deadline}:00`
```

### Si un campo tiene opciones fijas

Usa `select`.

```jsx
<select
  value={flight.estado}
  onChange={(e) => setFlight({ ...flight, estado: e.target.value })}
>
  <option value="PROGRAMADO">PROGRAMADO</option>
  <option value="EN_VUELO">EN_VUELO</option>
  <option value="ATERRIZADO">ATERRIZADO</option>
</select>
```

---

## 13. Convertir Animal.jsx en tarjeta real

Archivo original:

```txt
src/components/AnimalCard/Animal.jsx
```

El demo muestra:

```jsx
<img src={animal.imgs}></img>
<h1>{animal.especie}</h1>
<h1>{animal.raza}</h1>
```

En el parcial muestras los campos importantes.

### Curso

```jsx
const CourseCard = ({ course }) => {
  return (
    <div>
      <h2>{course.name}</h2>
      <p>{course.description}</p>
      <p>Codigo: {course.code}</p>
      <p>Creditos: {course.credits}</p>
    </div>
  );
};
```

### Vuelo

```jsx
const FlightCard = ({ flight }) => {
  return (
    <div>
      <h2>{flight.numeroVuelo}</h2>
      <p>Estado: {flight.estado}</p>
      <p>Aerolinea: {flight.nombreAerolinea}</p>
    </div>
  );
};
```

### Post

```jsx
const PostCard = ({ post }) => {
  return (
    <div>
      <p>{post.content}</p>
      <p>Comentarios: {post.commentsCount}</p>
    </div>
  );
};
```

---

## 14. Si piden actualizar

Actualizar significa:

```txt
Mandar PUT o PATCH al backend con el id.
```

Service:

```js
export const updateResource = async (id, resource) => {
  const response = await fetch(`${API_URL}/api/resources/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(resource),
  });

  return response.json();
};
```

Componente:

```jsx
const handleUpdate = async () => {
  await updateResource(resource.id, {
    ...resource,
    estado: nuevoEstado,
  });

  onChange();
};
```

Si solo se actualiza estado:

```jsx
<select value={resource.estado} onChange={handleStatusChange}>
  <option value="ACTIVO">ACTIVO</option>
  <option value="INACTIVO">INACTIVO</option>
</select>
```

```js
const handleStatusChange = async (e) => {
  await updateResource(resource.id, {
    ...resource,
    estado: e.target.value,
  });

  onChange();
};
```

`onChange()` vuelve a cargar la lista.

---

## 15. Si piden eliminar

Eliminar significa:

```txt
Mandar DELETE al backend con el id.
```

Service:

```js
export const deleteResource = async (id) => {
  await fetch(`${API_URL}/api/resources/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
};
```

Componente:

```jsx
const handleDelete = async () => {
  await deleteResource(resource.id);
  onChange();
};
```

Boton:

```jsx
<button onClick={handleDelete}>Eliminar</button>
```

---

## 16. Si piden detalle

Detalle significa:

```txt
Click en un item
ir a otra pagina
cargar ese item por id
```

Ruta:

```jsx
{
  path: '/resources/:id',
  element: <ResourceDetailPage />,
}
```

En tarjeta:

```jsx
const navigate = useNavigate();

<button onClick={() => navigate(`/resources/${resource.id}`)}>
  Ver detalle
</button>
```

En pagina detalle:

```jsx
const { id } = useParams();
```

Service:

```js
export const getResourceById = async (id) => {
  const response = await fetch(`${API_URL}/api/resources/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.json();
};
```

---

## 17. Si piden accion especial

Acciones especiales:

```txt
Agregar comentario
Calificar entrega
Matricular estudiante
Cambiar estado
Asignar usuario
```

Crea una funcion especial en el service.

Ejemplo matricular:

```js
export const enrollUser = async (courseId, userId) => {
  const response = await fetch(`${API_URL}/api/courses/${courseId}/enroll/${userId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return response.json();
};
```

Ejemplo calificar:

```js
export const gradeSubmission = async (id, grade, feedback) => {
  const response = await fetch(
    `${API_URL}/api/submissions/${id}/grade?grade=${grade}&feedback=${feedback}`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }
  );

  return response.json();
};
```

---

## 18. Donde va cada cosa

### Va en service si:

```txt
Tiene fetch.
Construye URL.
Manda token.
Habla con backend.
```

### Va en page si:

```txt
Tiene useEffect.
Carga lista.
Guarda lista en useState.
Coordina formulario y tarjetas.
```

### Va en form si:

```txt
Tiene inputs.
Guarda lo que escribe el usuario.
Arma el objeto del POST.
```

### Va en card si:

```txt
Muestra un registro individual.
Tiene boton eliminar.
Tiene select para actualizar.
Tiene boton ver detalle.
```

---

## 19. Errores comunes

### Login funciona pero listar falla

Probable causa:

```txt
No estas mandando token.
```

Debe estar:

```js
headers: getAuthHeaders()
```

### 401 Unauthorized

Probable causa:

```txt
No hay token, token mal guardado o header mal escrito.
```

Debe verse:

```txt
Authorization: Bearer eyJ...
```

### 403 Forbidden

Probable causa:

```txt
El token es valido, pero el usuario no tiene permiso.
```

Si existe usuario admin, prueba con admin.

### 400 Bad Request

Probable causa:

```txt
El body no coincide con el DTO.
```

Revisa nombres y tipos.

```txt
teacherId no es teacher
numeroVuelo no es number
credits debe ser numero, no texto
```

### La pagina privada siempre manda al login

Probable causa:

```txt
No hiciste setIsAuthenticated(true).
```

### El map falla

Probable causa:

```txt
El estado inicial no es arreglo.
```

Correcto:

```js
const [resources, setResources] = useState([]);
```

---

## 20. Checklist para el parcial

```txt
1. Leer enunciado.
2. Anotar recurso principal.
3. Anotar URL base.
4. Anotar endpoint login.
5. Anotar endpoint listar.
6. Anotar endpoint crear.
7. Anotar endpoint actualizar si existe.
8. Anotar endpoint eliminar si existe.
9. Anotar campos exactos del request.
10. Cambiar authService.js.
11. Cambiar LoginPage.jsx para guardar token.
12. Cambiar LoginPage.jsx para navegar a la ruta principal.
13. Crear apiService.js.
14. Crear service del recurso.
15. Cambiar main.jsx.
16. Copiar AnimalPages.jsx como ResourcePage.
17. Copiar AnimalForm.jsx como ResourceForm.
18. Copiar Animal.jsx como ResourceCard.
19. Conectar Page con service.
20. Conectar Form con create.
21. Conectar Card con update/delete si aplica.
22. Probar login.
23. Probar listar.
24. Probar crear.
25. Probar actualizar/eliminar si aplica.
```

---

## 21. Traduccion rapida

| Demo profesor | En el parcial |
|---|---|
| AnimalPages.jsx | ResourcePage.jsx |
| AnimalForm.jsx | ResourceForm.jsx |
| Animal.jsx | ResourceCard.jsx |
| animals.js | ya no se usa si hay backend |
| animalState | resources |
| addAnimal | createResource o loadResources |
| especie, raza, imgs | campos reales del backend |
| /animals | /courses, /flights, /feed, etc. |
| authService.js | se conserva, pero se cambia URL |
| AuthContext.jsx | se conserva, pero isAuth no reemplaza token |
| ProtectedRoute.jsx | se conserva casi igual |

---

## 22. Resumen final

El demo del profesor no esta completo para un parcial REST real porque:

```txt
usa animales locales
solo guarda isAuth
no manda token a una API protegida
```

Pero es buena base porque ya trae:

```txt
LoginPage
AuthContext
ProtectedRoute
Pagina protegida
Formulario
Componente individual
Rutas
```

Lo que debes agregar o cambiar:

```txt
1. Guardar token en LoginPage.
2. Crear apiService.js con Authorization: Bearer token.
3. Crear service del recurso.
4. Convertir AnimalPages en pagina REST.
5. Convertir AnimalForm en formulario del recurso.
6. Convertir Animal en tarjeta del recurso.
7. Cambiar rutas en main.jsx.
```

Frases para memorizar:

```txt
isAuth sirve para React.
token sirve para el backend.
```

```txt
No invento campos.
Uso exactamente los nombres que pide el backend.
```

```txt
Despues de crear, actualizar o eliminar, recargo la lista.
```
