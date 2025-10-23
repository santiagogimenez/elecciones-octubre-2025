# 🔧 Guía de Configuración de Supabase

Esta guía te ayudará a completar la configuración de tu proyecto **VotoP** en Supabase.

## ✅ Checklist de configuración

### 1. Ejecutar el script SQL

En Supabase:
1. Ir a **SQL Editor** → **New query**
2. Copiar y pegar el contenido del archivo `supabase-setup.sql` (ver abajo)
3. Hacer clic en **Run**

### 2. Verificar tablas creadas

En **Table Editor**, deberías ver:
- ✅ `partidos` (5 registros: JxLR, LLA, FV, PO, PyC)
- ✅ `circuitos` (vacía al inicio)
- ✅ `mesas` (vacía al inicio)
- ✅ `resultados` (vacía al inicio)
- ✅ `actas` (vacía al inicio)

### 3. Habilitar Realtime

Para que el dashboard se actualice en tiempo real:

1. Ir a **Database** → **Replication**
2. Buscar la tabla `resultados`
3. Activar el switch **Realtime**

### 4. Verificar políticas RLS

En cada tabla, ir a **Policies** y verificar que existan:
- `public select [tabla]`
- `public insert [tabla]`
- `public update [tabla]`

### 5. Obtener credenciales

1. Ir a **Project Settings** → **API**
2. Copiar:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public key** (JWT largo)
3. Pegar en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📄 Script SQL completo

**Nombre sugerido**: `supabase-setup.sql`

```sql
-- =============================================
-- SCRIPT DE SETUP - Elecciones Formosa MVP
-- Base de datos: VotoP
-- =============================================

-- TABLA: PARTIDOS
create table if not exists partidos (
  id uuid primary key default gen_random_uuid(),
  nombre text unique not null,
  abreviatura text,
  orden int default 0
);

-- Insertar partidos predefinidos
insert into partidos (nombre, abreviatura, orden) values
  ('Frente de la Victoria','FV',1),
  ('Juntos por la Libertad y la República','JxLR',2),
  ('La Libertad Avanza','LLA',3),
  ('Partido Obrero','PO',4)
on conflict (nombre) do nothing;

-- TABLA: CIRCUITOS
create table if not exists circuitos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  codigo text unique
);

-- TABLA: MESAS
create table if not exists mesas (
  id uuid primary key default gen_random_uuid(),
  numero int not null,
  circuito_id uuid references circuitos(id) on delete cascade,
  unique (numero, circuito_id)
);

-- TABLA: RESULTADOS (votos por partido en cada mesa)
create table if not exists resultados (
  id uuid primary key default gen_random_uuid(),
  mesa_id uuid references mesas(id) on delete cascade,
  partido_id uuid references partidos(id) on delete restrict,
  votos int not null check (votos >= 0),
  created_at timestamptz default now(),
  unique (mesa_id, partido_id)
);

-- TABLA: ACTAS (metadatos de escrutinio por mesa)
create table if not exists actas (
  mesa_id uuid primary key references mesas(id) on delete cascade,
  blancos int default 0 check (blancos >= 0),
  nulos int default 0 check (nulos >= 0),
  recurridos int default 0 check (recurridos >= 0),
  total_escrutados int check (total_escrutados >= 0),
  cerrada boolean default false,
  updated_at timestamptz default now()
);

-- VISTA: Totales por partido (para el dashboard)
create or replace view v_totales_partido as
select r.partido_id, p.nombre, sum(r.votos) as total_votos
from resultados r
join partidos p on p.id = r.partido_id
group by r.partido_id, p.nombre;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
alter table resultados enable row level security;
alter table actas     enable row level security;
alter table circuitos enable row level security;
alter table mesas     enable row level security;

-- POLÍTICAS: RESULTADOS
drop policy if exists "public select resultados" on resultados;
drop policy if exists "public insert resultados" on resultados;
drop policy if exists "public update resultados" on resultados;

create policy "public select resultados"
  on resultados for select
  using (true);

create policy "public insert resultados"
  on resultados for insert
  with check (true);

create policy "public update resultados"
  on resultados for update
  using (true)
  with check (true);

-- POLÍTICAS: ACTAS
drop policy if exists "public select actas" on actas;
drop policy if exists "public insert actas" on actas;
drop policy if exists "public update actas" on actas;

create policy "public select actas"
  on actas for select
  using (true);

create policy "public insert actas"
  on actas for insert
  with check (true);

create policy "public update actas"
  on actas for update
  using (true)
  with check (true);

-- POLÍTICAS: CIRCUITOS
drop policy if exists "public select circuitos" on circuitos;
drop policy if exists "public insert circuitos" on circuitos;
drop policy if exists "public update circuitos" on circuitos;

create policy "public select circuitos"
  on circuitos for select
  using (true);

create policy "public insert circuitos"
  on circuitos for insert
  with check (true);

create policy "public update circuitos"
  on circuitos for update
  using (true)
  with check (true);

-- POLÍTICAS: MESAS
drop policy if exists "public select mesas" on mesas;
drop policy if exists "public insert mesas" on mesas;
drop policy if exists "public update mesas" on mesas;

create policy "public select mesas"
  on mesas for select
  using (true);

create policy "public insert mesas"
  on mesas for insert
  with check (true);

create policy "public update mesas"
  on mesas for update
  using (true)
  with check (true);

-- =============================================
-- VERIFICACIÓN
-- =============================================

-- Verificar que los partidos se insertaron
select * from partidos order by orden;

-- Resultado esperado:
-- FV, JxLR, LLA, PO
```

## 🧪 Pruebas rápidas desde Supabase

### Insertar circuito y mesa de prueba

```sql
-- Insertar un circuito
insert into circuitos (nombre, codigo) values ('Formosa Capital', 'FC');

-- Obtener el ID del circuito
select id, nombre from circuitos;

-- Insertar una mesa (reemplazar <CIRCUITO_ID> con el UUID real)
insert into mesas (numero, circuito_id) 
values (1, '<CIRCUITO_ID>');

-- Verificar
select m.numero, c.nombre as circuito
from mesas m
join circuitos c on m.circuito_id = c.id;
```

### Insertar resultados de prueba

```sql
-- Obtener IDs de mesa y partidos
select id, numero from mesas limit 1;
select id, nombre from partidos;

-- Insertar votos (reemplazar <MESA_ID> y <PARTIDO_ID>)
insert into resultados (mesa_id, partido_id, votos) values
  ('<MESA_ID>', '<FV_ID>', 150),
  ('<MESA_ID>', '<JxLR_ID>', 200),
  ('<MESA_ID>', '<LLA_ID>', 100),
  ('<MESA_ID>', '<PO_ID>', 50);

-- Insertar acta
insert into actas (mesa_id, blancos, nulos, recurridos, total_escrutados)
values ('<MESA_ID>', 10, 5, 0, 515);

-- Ver totales
select * from v_totales_partido;
```

## 🚨 Troubleshooting

### Error: "permission denied for table X"
**Causa**: Falta política RLS  
**Solución**: Ejecutar las políticas del script SQL nuevamente

### Error: "relation X does not exist"
**Causa**: Tabla no creada  
**Solución**: Ejecutar todo el script SQL desde el inicio

### Dashboard no se actualiza en tiempo real
**Causa**: Realtime no habilitado  
**Solución**: Database → Replication → Activar `resultados`

### No se puede insertar circuito/mesa desde el front
**Causa**: Falta política INSERT en circuitos o mesas  
**Solución**: Verificar que existan las policies `public insert circuitos` y `public insert mesas`

## 🔒 Seguridad para producción

⚠️ **Las políticas actuales son ABIERTAS** (permiten acceso público sin autenticación).

Para producción, considerar:

1. **Implementar autenticación**:
```sql
-- Ejemplo: solo usuarios autenticados
create policy "authenticated insert resultados"
  on resultados for insert
  to authenticated
  with check (true);
```

2. **Agregar roles**:
```sql
-- Tabla de fiscales con roles
create table fiscales (
  id uuid primary key references auth.users(id),
  circuito_id uuid references circuitos(id),
  role text check (role in ('fiscal', 'admin'))
);

-- Policy: fiscal solo puede cargar su circuito
create policy "fiscal own circuito"
  on resultados for insert
  with check (
    exists (
      select 1 from fiscales f
      join mesas m on m.circuito_id = f.circuito_id
      where f.id = auth.uid()
        and m.id = resultados.mesa_id
    )
  );
```

3. **Rate limiting** con Supabase Edge Functions

---

**✅ Setup completado**. Tu base de datos **VotoP** está lista para recibir datos de las mesas electorales.
