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

-- Insertar partidos predefinidos (ACTUALIZADOS)
insert into partidos (nombre, abreviatura, orden) values
  ('Juntos por la Libertad y la Republica','JxLR',1),
  ('La Libertad Avanza','LLA',2),
  ('Frente de la Victoria','FV',3),
  ('Partido del Obrero','PO',4),
  ('Principios y Conviccion','PyC',5)
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
