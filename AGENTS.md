# AGENTS — Project conventions and onboarding

Regla para el agente de IA
- **Auto-actualización obligatoria:** cada vez que el agente cree un archivo nuevo, cambie la arquitectura, añada una dependencia, establezca una convención o tome una decisión de diseño relevante, debe actualizar este archivo (`AGENTS.md`) en esa misma sesión, sin que el usuario lo pida explícitamente. Solo se omite si el cambio es trivial (corrección de estilo, texto de UI, etc.).

Propósito
- Documento único con contexto, convenciones y reglas mínima para que cualquier desarrollador entienda y trabaje en este proyecto.

Resumen del repo
- `backend/` — NestJS (controllers, modules, services). API REST.
- `frontend/` — Next.js + React + TypeScript. Pages en `pages/`, UI en `components/`, lógica de acceso a datos en `src/services/` y hooks en `src/hooks/`.

Arranque rápido (local)
1. Backend: `cd backend && npm install && npm run start:dev` (arranca en :3000 por defecto).
2. Frontend: `cd frontend && npm install && npm run dev` (arranca Next en :3000 o :3001 si está ocupado).

Principios y buenas prácticas
- Simplicidad y claridad: preferir código legible y explícito.
- Separación de responsabilidades: UI (componentes) vs datos (services) vs estado (context/hooks).
- Convenciones TypeScript: mantén `strict` cuando sea posible; usar tipos explícitos en exports públicos.
- Nombres en inglés para archivos y símbolos públicos (funciones, componentes); textos de UI pueden mantenerse en el idioma del producto.

Frontend (Next.js + React)
- Estructura:
  - `pages/` → rutas y funciones de datos (`getServerSideProps` / `getStaticProps`) si se usan.
  - `components/` → componentes UI reutilizables (`Header.tsx`, `Footer.tsx`, `Layout.tsx`, `ProductCard.tsx`).
  - `src/services/api.ts` → cliente HTTP (axios) y funciones de acceso (`getProducts`, `getProductById`, etc.).
  - `src/hooks/` → hooks para lógica reutilizable (e.g. `useProducts.ts`).
  - `src/context/` → providers (e.g. `CartContext.tsx`).
- Fetching: para desarrollo local preferimos CSR (hooks + useEffect) por simplicidad; pasaremos a SSR/SSG cuando hagamos optimizaciones.
- Estilos: Tailwind configurado vía `styles/globals.css` + utilidades en componentes.
- Archivos legacy: si hay código o config de Vite, archívalo en `frontend/legacy-vite/` para no mezclarlos.

Backend (NestJS)
- Organización: módulos por dominio (`products/`), un `database/` module para conexión.
- Servicios: la lógica de negocio en `*.service.ts`, controladores sólo mapean rutas y validan entradas.
- DTOs y validación: usar `class-validator` y DTOs definidos con types/DTOs.

Estado y persistencia local
- Carrito inicial: `CartContext` con persistencia en `localStorage`.

Linting y formateo
- `eslint` configurado en ambos repos; usa `npm run lint` antes de commits.

Commits / PRs
- Mensajes cortos y claros: `feat: add product card`, `fix: api baseURL`.
- PR: describir cambios, cómo probar localmente y cualquier migración de schema.

Dependencias y versiones
- Mantén versiones coherentes (React 18 con Next 14 en este repo). Si actualizas dependencias, prueba `npm run dev` y `npx tsc --noEmit`.

Notas para contribuidores
- Lee este archivo y `README.md` del subproyecto antes de cambiar arquitectura.
- Si necesitas añadir reglas de ESLint o TypeScript, agrégalas a `frontend/tsconfig.*.json` y `eslint.config.js` con cuidado.

Contacto y seguimiento
- Añadir issues/PRs para cambios grandes. Mantener commits pequeños y reversibles.

Site structure & UI conventions (ejemplo)
- **Header / Navegación**
  - Logo (izquierda)
  - Links principales: `Por qué NeuroFuel`, `Tienda` (catalogo), `Quiz`
  - Iconos/acciones (derecha): `Cuenta`, `Carrito` y un botón CTA destacado para `Quiz`.

- **Home / Hero**
  - Layout 2 columnas: texto grande + subtítulo + CTA (izquierda) / imagen destacada (derecha, card redondeada).
  - Secciones siguientes: beneficios, productos destacados (grid), testimonios y footer.

- **Tienda** (`/products`) y **Product page** (`/product/[id]`)
  - Grid responsivo de `ProductCard` con imagen, nombre, precio y botón `Añadir al carrito`.
  - Product page con galería, descripción, selector de cantidad y CTA.

- **Carrito** (modal o `/cart`)
  - Lista de items, totales y acciones (checkout, vaciar). Persistencia en `localStorage`.

Componentes base recomendados
- `Header.tsx` — navegación y CTA
- `Footer.tsx` — enlaces institucionales
- `Layout.tsx` — wrapper global con `Header`/`Footer`
- `Hero.tsx` — bloque reutilizable hero (texto + imagen)
- `ProductCard.tsx` — tarjeta de producto
- `ProductGrid.tsx` — grid responsivo para productos

Flujo y responsabilidades
- `src/services/api.ts` → funciones HTTP (axios) hacia backend
- `src/hooks/useProducts.ts` → hook para obtener y cachear productos (CSR por defecto)
- `src/context/CartContext.tsx` → proveedor con `add`, `remove`, `updateQuantity`, `clear` y persistencia en `localStorage`. Expone también `totalItems` y `totalPrice`. Precio parseado de string (`'29.99€'`) a número al llamar `add()`.

Carrito — decisiones de diseño tomadas
- UI: modal centrado (no drawer, no página separada).
- Persistencia: `localStorage` con key `luma_cart`.
- El campo `price` en `products.ts` es string; `ProductCard` lo parsea con `parseFloat(price.replace(/[^0-9.]/g, ''))` antes de llamar a `add()`.
- `_app.tsx` estructura: `CartProvider` > `Layout` > `Component`.

Estado de estilos (actualizado 2026-04-08)
- Tailwind v4 → `globals.css` usa `@import "tailwindcss"` (NO directivas `@tailwind`)
- Tokens de marca definidos en `tailwind.config.js` → `brand-bg`, `brand-surface`, `brand-muted`, `brand-primary`, `brand-accent`, `font-sans`, `font-editorial`
- Pendiente: todos los componentes aún tienen colores hardcodeados (tema oscuro `#111827`/neón o blancos/grises crudos). Ningún componente usa los tokens `brand-*` todavía.
- Cambios de fondo urgentes: `globals.css` body tiene `#030712` (negro puro) → debe ser `#F7F5F2` (brand-bg)
- `ProductCard`, `CartModal`, `ProductDetailModal` → tema oscuro completo, pendientes de migrar a paleta cálida clara
- Detalles completos del estado de cada componente en `/memories/repo/frontend-style-state.md`

Estado de implementación (Fase 1 — Tienda)
- [x] `CartContext` + `localStorage`
- [x] Badge de cantidad en icono 🛒 del Navbar
- [x] Modal del carrito (lista de items, totales, vaciar)
- [x] `useProducts` hook (CSR, llama a `GET /products`)
- [x] Página `/products` — catálogo con filtros por categoría
- [x] `ProductSection` en home — muestra los 4 primeros productos (datos del API) + CTA "Ver todos →" a `/products`
- [x] Navbar saneado: `/#por-que`; botón "Haz el Quiz" abre `QuizModal`
- [x] `ProductDetailModal` — modal con descripción detallada, beneficios y botón "Añadir al carrito"
- [ ] Página `/checkout` — formulario simulado
- [ ] Página `/order-confirmation`

Arquitectura de tienda — decisión tomada
- La tienda completa vive en `/products` (datos del API, filtros por categoría).
- El home solo muestra un bloque "PRODUCTOS DESTACADOS" con los 4 primeros productos del API como preview, con CTA a `/products`.
- No se usan datos estáticos de `data/products.ts` en producción; ese archivo queda como referencia de estructura.
- El botón "Ver detalles →" en `ProductCard` abre `ProductDetailModal` (modal, no página separada).
- Categorías en la DB (enum Supabase): `Enfoque`, `Claridad`, `Zen`, `Social`. El frontend mapea: Enfoque→Focus, Claridad→Clarity, Zen→Zen, Social→Social.
- Backend NestJS en puerto **3001**; Frontend Next.js en puerto **3000**.

Accesibilidad y estilos
- Usa utilidades de Tailwind para consistencia. Asegura contraste, foco visible y `aria-*` en elementos interactivos.
