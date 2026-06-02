# 🎯 Prep Pack — Examen Final de Frontend (React)

> Computación en Internet II · Ingeniería de Sistemas · ICESI
> Generado para estudiar. **El día del examen NO puedes usar IA.** Esto es para que aprendas
> los patrones AHORA y los reproduzcas tú solo el día del examen.

---

## ¿Qué es este examen? (en una frase)

Te entregan un **backend Spring Boot ya funcionando** (no lo tocas) y un **front React en blanco**
(Vite). Tu trabajo: construir un **tablero (dashboard) tipo CRUD con login JWT** que consume ese backend.

Da igual si el dominio es **Pedidos**, **Vuelos**, **Reservas**, etc.: **la estructura es siempre la misma.**

| % | Qué te piden | Lo que practicas |
|---|--------------|------------------|
| 20% | **Login** (credenciales → token JWT → guardar → redirigir) | Formulario, axios, Context, localStorage, navegación |
| 20% | **Crear** un ítem (con token, refrescar lista) | Formulario + POST + refrescar |
| 20% | **Componente** que pinta UN ítem (muestra info + acciones) | Crear componente, **props**, **callbacks** |
| 20% | **Cambiar el estado** del ítem (enum de 3 valores) | PUT + reflejar en UI |
| 20% | **Eliminar** el ítem | DELETE + quitar de la vista |

> ⚠️ El profe recalcó: **pasar funciones (callbacks) entre componentes**, no solo textos/números.
> Eso vive en el bloque del "Componente" (la `Card`). Es lo que más se equivoca la gente. Practícalo.

---

## 📚 Cómo usar este pack (orden recomendado)

1. **`01-guia-paso-a-paso.md`** ← **EMPIEZA AQUÍ.** Es el plan de batalla completo, con los conceptos
   de React explicados para principiante justo donde los necesitas. Léelo entero una vez.
2. **`02-cheatsheet-codigo.md`** ← Todos los snippets listos para reproducir, en el orden en que
   construyes la app. Tenlo al lado mientras practicas. **Apréndete el flujo, no lo memorices letra a letra.**
3. **`simulacro/`** ← Un mini-examen de OTRO dominio (*Reservas de Hotel*) con backend mock que corre
   con Node. Resuélvelo **a libro cerrado**, y solo después mira `simulacro/solucion/`.
4. **`flashcards.html`** y **`quiz.html`** ← Ábrelos en el navegador (doble clic) para repasar conceptos
   en ratos muertos.

### Si solo tienes 2 horas
- Lee `01-guia-paso-a-paso.md` secciones 1 a 8.
- Reproduce DOS VECES, sin mirar, el flujo: `axiosClient` → `login.service` → `Login` → `Board` (fetch + lista) → `Card` con callbacks → crear → cambiar estado → borrar.
- Si te queda tiempo, haz el simulacro.

---

## 🔑 Datos que se repiten (del backend de Pedidos de ejemplo)

```
Login:    POST /api/v1/auth/login   body: { "username": "...", "password": "..." }  → { "accessToken": "..." }
Credenciales sembradas: usuario1@correo.com / 123456   (y usuario2@correo.com / 123456)
Header en TODO lo demás:  Authorization: Bearer <accessToken>
Backend corre en:         http://localhost:8080   (puerto Spring por defecto)
Estados Pedido (enum):    EN_CAMINO, EN_REPARTO, ENTREGADO
```

> El día del examen, **lo primero** es abrir el backend y leer: el `RestController` (rutas), los DTOs
> `*Request`/`*Response` (qué campos mandar/recibir), el `enum` de estados, y `data.sql` (credenciales).
> Eso te da el contrato exacto. La guía te enseña a hacerlo en la **Sección 1**.

---

## ✅ Cómo revisar este pack
Al final de todo, en la última sección de `01-guia-paso-a-paso.md` (#13) tienes una **checklist de
autoevaluación**. Si puedes marcar todo sin mirar el cheat-sheet, estás listo. 🚀
