-- 011_rent_roll.sql
-- Rent roll: units table + occupancy tracking + neighborhood on properties
-- Run in Supabase SQL Editor

-- Add neighborhood and occupancy columns to properties
alter table properties
  add column if not exists neighborhood   text,
  add column if not exists occupied_units integer;

-- Individual units for a property (populated from rent roll upload)
create table if not exists units (
  id                uuid        primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  property_id       uuid        not null references properties(id) on delete cascade,

  unit_name         text        not null,   -- "101", "2A", "Studio 3"
  unit_type         text,                   -- "studio" | "1br" | "2br" | "3br" | "4br"
  bedrooms          smallint,
  sq_ft             integer,

  status            text        not null default 'vacant',
    -- 'vacant' | 'occupied' | 'notice' | 'unavailable'
  current_resident  text,                   -- name of current tenant
  lease_start       date,
  lease_end         date,
  monthly_rent      integer,                -- in dollars

  unique (property_id, unit_name)
);

create index if not exists units_property_idx on units(property_id);
create index if not exists units_status_idx   on units(property_id, status);

-- Auto-update updated_at
create or replace function set_units_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_units_updated_at
  before update on units
  for each row execute function set_units_updated_at();
