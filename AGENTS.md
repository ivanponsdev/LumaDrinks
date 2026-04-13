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
- Persistencia: `localStorage` con key `luma_cart` (anónimo) y `luma_cart_<userId>` (usuario logueado) como fallback offline.
- Persistencia en servidor: `PUT /cart` guarda el carrito en la tabla `cart` de la DB. `GET /cart` lo recupera al hacer login.
- El campo `price` en `products.ts` es string; `ProductCard` lo parsea con `parseFloat(price.replace(/[^0-9.]/g, ''))` antes de llamar a `add()`.
- `_app.tsx` estructura: `CartProvider` > `CartSync` > `Layout` > `Component`.
- `CartSync`: al login (`null → userId`) carga el carrito desde el servidor (DB) y mergea con el carrito anónimo. Fallback a `localStorage` si el servidor no responde. `hydratedRef` evita escrituras en DB hasta que el carrito esté hidratado.
- Cada cambio en `items` persiste en DB (fire-and-forget) + localStorage como backup offline.

Estado de estilos (actualizado 2026-04-08)
- Tailwind v4 → `globals.css` usa `@import "tailwindcss"` (NO directivas `@tailwind`)
- Tokens de marca definidos en `tailwind.config.js` → `brand-bg`, `brand-surface`, `brand-muted`, `brand-primary`, `brand-accent`, `font-sans`, `font-editorial`
- Pendiente: todos los componentes aún tienen colores hardcodeados (tema oscuro `#111827`/neón o blancos/grises crudos). Ningún componente usa los tokens `brand-*` todavía.
- Cambios de fondo urgentes: `globals.css` body tiene `#030712` (negro puro) → debe ser `#F7F5F2` (brand-bg)
- `ProductCard`, `CartModal`, `ProductDetailModal` → tema oscuro completo, pendientes de migrar a paleta cálida clara
- Detalles completos del estado de cada componente en `/memories/repo/frontend-style-state.md`

Auth — decisiones de diseño tomadas
- Estrategia: Supabase Auth (opción A). El frontend usa `@supabase/supabase-js`; el backend verifica el JWT contra el JWKS endpoint de Supabase (`SUPABASE_URL/auth/v1/.well-known/jwks.json`).
- NestJS: `AuthModule` con `JwtStrategy` (RS256, `jwks-rsa`) + `JwtAuthGuard` reutilizable.
- `UsersModule`: `UsersService.findOrCreate()` sincroniza el perfil en la tabla `public.users` al primer login.
- Variables de entorno requeridas en backend: `SUPABASE_URL` (ya existía `DATABASE_URL`).
- Rutas protegidas: `GET /auth/me` (devuelve perfil), `PATCH /auth/profile` (actualiza nombre).
- Para proteger cualquier ruta: `@UseGuards(JwtAuthGuard)`.

Estado de implementación (Fase 1 — Tienda)
- [x] `CartContext` + `localStorage`
- [x] Badge de cantidad en icono 🛒 del Navbar
- [x] Modal del carrito (lista de items, totales, vaciar)
- [x] `useProducts` hook (CSR, llama a `GET /products`)
- [x] Página `/products` — catálogo con filtros por categoría
- [x] `ProductSection` en home — muestra los 4 primeros productos (datos del API) + CTA "Ver todos →" a `/products`
- [x] Navbar saneado: `/#por-que`; botón "Haz el Quiz" abre `QuizModal`
- [x] `ProductDetailModal` — modal con descripción detallada, beneficios y botón "Añadir al carrito"
- [x] Página `/checkout` — formulario con datos del usuario pre-rellenos + resumen + `POST /orders`
- [x] Página `/order-confirmation` — pantalla de éxito con referencia de pedido

Estado de implementación (Fase 2 — Cuentas y Auth)
- [x] Backend: `AuthModule` + `JwtStrategy` (RS256, JWKS de Supabase) + `JwtAuthGuard`
- [x] Backend: `UsersModule` + `UsersService` (`findOrCreate`, `updateProfile`)
- [x] Backend: `GET /auth/me` + `PATCH /auth/profile` protegidos con `JwtAuthGuard`
- [x] Backend: `OrdersModule` — `POST /orders` + `GET /orders/my` protegidos con `JwtAuthGuard`
- [x] Backend: `CartModule` — `GET /cart` + `PUT /cart` protegidos con `JwtAuthGuard`
- [x] Supabase: tabla `public.users` vinculada a `auth.users`
- [x] Supabase: FK `orders.customer_id` → `users.id`
- [x] Supabase: trigger `on_auth_user_created` → crea perfil automáticamente al registrarse
- [x] Supabase: RLS habilitado en `users` y `orders` con policies por `auth.uid()`
- [x] Frontend: `src/lib/supabaseClient.ts` — cliente singleton
- [x] Frontend: `AuthContext.tsx` — `user`, `session`, `login()`, `register()`, `logout()`
- [x] Frontend: `_app.tsx` — `AuthProvider` > `CartProvider` + `CartSync` > `Layout`
- [x] Frontend: páginas `/login` y `/register`
- [x] Frontend: Navbar — botón 👤 condicional (Entrar / Salir según sesión)
- [x] Carrito: sincronización al login — carga desde DB (`GET /cart`), merge con carrito anónimo, fallback a localStorage
- [x] Carrito: multi-dispositivo — cada cambio persiste en DB (`PUT /cart`) + localStorage como backup
- [x] Página `/orders` — historial de pedidos del usuario con estado y detalle de items

---

## Cambios recientes (2026-04-14 — Simulación de pago)

### Flujo de checkout actualizado (2 pasos)
1. **Paso 1 — Datos de envío**: nombre, email (readonly), dirección. Al continuar → `POST /orders` → guarda el `orderId` en estado local.
2. **Paso 2 — Pago**: `PaymentForm` con tarjeta prefilled (`4242 4242 4242 4242`, `12/34`, `123`). Al pagar → `POST /payments/simulate` → redirect a `/order-confirmation?orderId=&paymentId=`.
- Indicador de progreso visual de 2 pasos en la cabecera.
- El carrito se limpia solo después del pago exitoso.

### Backend — PaymentsModule
- `backend/src/payments/dto/simulate-payment.dto.ts`: validación con `class-validator` — 16 dígitos, formato MM/AA, CVC 3-4 dígitos.
- `backend/src/payments/payments.service.ts`: simulación siempre exitosa (`status: 'succeeded'`), solo guarda `last4` (nunca número completo ni CVC), inserta en `public.payments`.
- `backend/src/payments/payments.controller.ts`: `POST /payments/simulate` (JwtAuthGuard), `GET /payments` (JwtAuthGuard + AdminRoleGuard, paginado).
- `backend/src/payments/payments.module.ts`: imports `AuthModule`, providers `[PaymentsService, AdminRoleGuard]`.
- `PaymentsModule` registrado en `app.module.ts`.

### Frontend — componentes y páginas
- `frontend/src/components/PaymentForm.tsx`: formulario con banner "Pago simulado", validación inline en tiempo real, delay de 1.5 s, spinner de procesando, prefilled con datos demo.
- `frontend/src/pages/checkout.tsx`: refactorizado a 2 pasos (`details` → `payment`), paso 1 crea el pedido, paso 2 procesa el pago.
- `frontend/src/pages/order-confirmation.tsx`: muestra `orderId` + `paymentId` si está presente.
- `frontend/src/pages/admin/payments.tsx`: tabla admin de todos los pagos (UUID, order_id, importe, estado, tarjeta ofuscada, fecha).
- `frontend/src/components/AdminLayout.tsx`: nav item "Pagos" añadido entre Productos y Analítica.
- `frontend/src/services/api.ts`: `simulatePayment()` y `getAdminPayments()` añadidos.

### SQL para tabla `payments` (ejecutar en Supabase)
```sql
create table public.payments (
  id uuid primary key,
  order_id uuid,
  amount numeric,
  status text,
  provider text default 'simulator',
  last4 text,
  metadata jsonb,
  created_at timestamptz default now(),
  processed_at timestamptz
);
-- RLS
alter table public.payments enable row level security;
create policy "Admin full access" on public.payments
  for all using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    )
  );
```

Estado de implementación (Fase 3 — Pago simulado)
- [x] `PaymentsModule` backend (DTO, service, controller, module)
- [x] `POST /payments/simulate` (JwtAuthGuard) + `GET /payments` (AdminRoleGuard)
- [x] `PaymentForm.tsx` — formulario con validación en tiempo real y delay simulado
- [x] `checkout.tsx` — flujo de 2 pasos con indicador de progreso
- [x] `order-confirmation.tsx` — muestra `orderId` + `paymentId`
- [x] `admin/payments.tsx` — tabla de pagos para admin
- [x] `AdminLayout.tsx` — nav item "Pagos"
- [ ] SQL: crear tabla `payments` en Supabase (ver SQL arriba)

Pendiente (Fase 4 — Pre-producción)
- [ ] Supabase: crear tabla `cart` (ver SQL abajo)
- [ ] Supabase: RLS en tabla `cart` por `auth.uid()`
- [ ] Configurar `FRONTEND_URL` real en backend `.env` para producción
- [ ] Deploy: Vercel (frontend) + Railway o Fly.io (backend)
- [ ] Dominio personalizado en Supabase Auth

---

## Testing (Fase 5 — implementada 2026-04-13)

### Stack de tests
- **Backend (Jest)**: `npm run test` — unit tests; `npm run test:e2e` — guards e2e con Supertest
- **Frontend (Vitest)**: `npm run test` — unit tests puros (sin navegador, ~1 s)
- **Frontend E2E (Playwright)**: `npm run test:e2e` — tests de flujo completo contra Chrome real

### Archivos creados
| Archivo | Qué testea |
|---------|-----------|
| `backend/src/payments/payments.service.spec.ts` | `simulate()`: last4, no fullcard, no CVC; `findAll()`: paginación |
| `backend/src/orders/orders.service.spec.ts` | `create()`: SQL correcto, status inicial; `findByCustomer()`: isolation por customer_id |
| `backend/src/admin/admin-role.guard.spec.ts` | permite admin, rechaza customer, rechaza sin userId |
| `backend/src/products/products.service.spec.ts` | findAll, findOne, null si no existe *(reescrito)* |
| `backend/src/products/products.controller.spec.ts` | delega a service, guards mockeados con `overrideGuard()` *(reescrito)* |
| `backend/test/auth-guards.e2e-spec.ts` | todas las rutas protegidas devuelven 401 sin token |
| `frontend/src/context/CartContext.test.ts` | reducer: ADD, REMOVE, UPDATE_QUANTITY, CLEAR, HYDRATE, MERGE, totales |
| `frontend/src/components/PaymentForm.test.ts` | `validate()`: casos válidos/inválidos; `formatCardNumber()` y `formatExpiry()` |
| `frontend/e2e/auth.spec.ts` | páginas login/register cargan, credenciales erróneas muestran error |
| `frontend/e2e/cart.spec.ts` | home carga, productos carga, checkout sin auth |
| `frontend/e2e/admin.spec.ts` | rutas admin redirigen si no hay sesión |

### Convenciones de tests
- Backend: mocks de `DATABASE_POOL` con `jest.fn()`, nunca se toca la DB real
- `uuid` se mockea en payments.service.spec.ts por incompatibilidad ESM con Jest
- Guards NestJS se sobreescriben con `.overrideGuard().useValue()` en controller specs
- Frontend unit: funciones puras exportadas (`cartReducer`, `validate`, `formatCardNumber`, `formatExpiry`)
- Frontend E2E: usan `baseURL: http://localhost:3000`; `webServer` arranca el frontend automáticamente
- Playwright: `reuseExistingServer: true` para no reiniciar si ya está corriendo

### Cómo ejecutar
```bash
# Backend — todos los tests unitarios
cd backend && npm run test

# Backend — e2e guards (sin DB real)
cd backend && npm run test:e2e

# Frontend — unit tests (vitest, ~1 s)
cd frontend && npm run test

# Frontend — E2E (necesita backend corriendo en :3001)
cd frontend && npm run test:e2e          # headless
cd frontend && npm run test:e2e:headed   # con ventana visible
cd frontend && npm run test:e2e:ui       # interfaz gráfica Playwright
```

Arquitectura de tienda — decisión tomada
- La tienda completa vive en `/products` (datos del API, filtros por categoría).
- El home solo muestra un bloque "PRODUCTOS DESTACADOS" con los 4 primeros productos del API como preview, con CTA a `/products`.
- No se usan datos estáticos de `data/products.ts` en producción; ese archivo queda como referencia de estructura.
- El botón "Ver detalles →" en `ProductCard` abre `ProductDetailModal` (modal, no página separada).
- Categorías en la DB (enum Supabase): `Enfoque`, `Claridad`, `Zen`, `Social`. El frontend mapea: Enfoque→Focus, Claridad→Clarity, Zen→Zen, Social→Social.
- Backend NestJS en puerto **3001**; Frontend Next.js en puerto **3000**.

Accesibilidad y estilos
- Usa utilidades de Tailwind para consistencia. Asegura contraste, foco visible y `aria-*` en elementos interactivos.

---

## Cambios recientes (2026-04-13 — Admin CRUD + redirección)

- **Admin redirect on login**: tras un login exitoso, si `role === 'admin'` la app redirige automáticamente a `/admin/products` (a menos que haya un query param `?redirect=`).
- **`AuthContext` expone `role`**: al cargar la sesión (y al hacer login) se llama a `GET /auth/me` para obtener el rol del usuario desde `public.users`. El rol se almacena en contexto y se limpia al logout.
- **`users.service.ts`**: `UserProfile` incluye ahora el campo `role`; todas las queries SELECT lo incluyen.
- **Backend: CRUD de productos**: `ProductsService` tiene `findOne`, `update` y `remove`. `ProductsController` expone `GET /:id` (público), `PATCH /:id` y `DELETE /:id` (admin). El POST también está protegido. `ProductsModule` importa `AuthModule` y registra `AdminRoleGuard`.
- **`update-product.dto.ts`**: nuevo DTO con todos los campos opcionales y validación con `class-validator`.
- **`AdminLayout.tsx`**: layout compartido para todas las páginas admin. Sidebar con nav (Productos, Analítica), enlace a la tienda pública y botón de logout. No incluye el Navbar/Footer público (el `_app.tsx` ya excluía el Layout global para rutas `/admin/*`).
- **`/admin/products`**: nueva página con tabla de productos + modal para crear/editar y confirmación de borrado. Ruta inicial del admin tras login.
- **`/admin/dashboard`**: ahora usa `AdminLayout` (sustituye el wrapper `min-h-screen` y el header custom).
- **`api.ts`**: añadidas funciones `adminCreateProduct`, `adminUpdateProduct`, `adminDeleteProduct`.

Flujo admin completo:
1. Admin hace login → `AuthContext.login()` llama `GET /auth/me` → obtiene `role='admin'`
2. `login.tsx` detecta el rol y redirige a `/admin/products`  
3. Sidebar de `AdminLayout` permite navegar entre Productos y Analítica
4. Botón "Ver tienda" vuelve a la tienda pública sin cerrar sesión
