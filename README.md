# LumaDrinks

E-commerce de bebidas funcionales. Stack: **Next.js 16** (frontend) + **NestJS 11** (backend) + **Supabase** (auth + Postgres).

---

## Arranque rápido

### Requisitos
- Node 20+
- Cuenta de [Supabase](https://supabase.com) con proyecto creado

### 1. Variables de entorno

**`backend/.env`**
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

### 2. Backend
```bash
cd backend
npm install
npm run start:dev   # puerto 3001
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev         # puerto 3000
```

---

## Arquitectura

```
Browser
  ↕  HTTPS
Next.js frontend (:3000)
  ├── pages/         — rutas (index, products, login, register)
  ├── components/    — UI reutilizable
  ├── src/context/   — AuthContext, CartContext
  ├── src/hooks/     — useProducts
  └── src/services/  — authService (→ NestJS), api (→ NestJS)

NestJS backend (:3001)
  ├── auth/          — register, login, me, profile
  ├── products/      — CRUD productos
  ├── users/         — perfil en public.users
  └── database/      — conexión Supabase/Postgres

Supabase
  ├── auth.users     — identidades gestionadas por Supabase Auth
  ├── public.users   — perfiles (sincronizado por trigger)
  ├── products       — catálogo
  └── orders         — pedidos (FK → users.id)
```

---

## Auth

**Flujo:**
1. El usuario envía email + password al frontend.
2. El frontend llama a `POST /auth/register` o `POST /auth/login` en NestJS.
3. NestJS valida el DTO (class-validator) y delega en Supabase Auth.
4. Supabase devuelve un JWT firmado con RS256.
5. NestJS reenvía el JWT al frontend; el frontend llama a `supabase.auth.setSession()`.
6. Rutas protegidas: el cliente envía el JWT en `Authorization: Bearer <token>`.
7. NestJS verifica la firma mediante el JWKS endpoint de Supabase (`/auth/v1/.well-known/jwks.json`).

**Rutas del backend:**

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/auth/register` | público | Crea cuenta en Supabase |
| POST | `/auth/login` | público | Devuelve sesión JWT |
| GET | `/auth/me` | JWT | Perfil del usuario |
| PATCH | `/auth/profile` | JWT | Actualiza nombre |
| POST | `/orders` | JWT | Crea un pedido con items del carrito |
| GET | `/orders/my` | JWT | Lista pedidos del usuario autenticado |

---

## Base de datos (Supabase)

Scripts SQL para reproducir el esquema:

```sql
-- Tabla de perfiles
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz default now()
);

-- Trigger: crea perfil al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users(id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.users enable row level security;
create policy "Users can read own profile"
  on public.users for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);
```

---

## Seguridad

| Medida | Implementación |
|--------|---------------|
| Headers HTTP seguros | `helmet` en NestJS (`main.ts`) |
| CORS restringido | `FRONTEND_URL` env var; `'*'` solo en dev |
| Rate limiting global | `@nestjs/throttler` — 60 req / 60 s por IP |
| Rate limiting en auth | 10 req / 60 s en `/auth/register` y `/auth/login` |
| Validación de entradas | `class-validator` DTOs + `ValidationPipe` global |
| Tokens JWT RS256 | Verificación mediante JWKS de Supabase (sin secreto compartido) |
| Row Level Security | RLS habilitado en `users` y `orders` |
| Variables sensibles | `.env` / `.env.local` excluidos de git |

---

## Estructura de carpetas

```
backend/src/
├── app.module.ts
├── main.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt-auth.guard.ts
│   ├── jwt.strategy.ts
│   └── dto/
│       ├── login.dto.ts
│       ├── register.dto.ts
│       └── update-profile.dto.ts
├── users/
│   ├── users.module.ts
│   └── users.service.ts
└── products/
    ├── products.controller.ts
    ├── products.module.ts
    └── products.service.ts

frontend/src/
├── pages/         (_app, index, products, login, register)
├── components/    (Navbar, Hero, ProductCard, CartModal, ...)
├── context/       (AuthContext, CartContext)
├── hooks/         (useProducts)
├── services/      (api, authService)
└── lib/           (supabaseClient, validation)
```

---

## Estado de implementación

### Completado
- [x] Página `/checkout` — formulario con email/nombre pre-rellenos, resumen y `POST /orders`
- [x] Página `/order-confirmation` — pantalla de éxito con referencia de pedido
- [x] `CartSync` — merge de carrito anónimo con carrito de usuario al hacer login (localStorage por usuario `luma_cart_<userId>`)
- [x] `OrdersModule` — `POST /orders` + `GET /orders/my` protegidos con `JwtAuthGuard`
- [x] Migración completa de estilos a tokens `brand-*` (identidad Luma aplicada a todos los componentes)

### Pendiente para producción
- [ ] Página `/orders` — historial de pedidos del usuario (backend `GET /orders/my` ya existe)
- [ ] Carrito multi-dispositivo — persistir carrito en DB (actualmente solo en `localStorage`)
- [ ] Activar confirmación de email en Supabase (Authentication → Email)
- [ ] Configurar `FRONTEND_URL` en backend para el dominio de producción
- [ ] Habilitar HTTPS (Vercel/Railway/Fly.io lo hacen automáticamente)
- [ ] Revisar límites de rate limiting según tráfico esperado
- [ ] Configurar dominio personalizado en Supabase Auth
