-- 010_org_team.sql
-- Team / sub-account system: organizations, members, invitations, property access
-- Run in Supabase SQL Editor

-- An organization is created when an operator first invites a team member.
-- Until then, operators work in single-owner mode (no org row needed).
create table if not exists organizations (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  operator_id uuid        not null references operators(id) on delete cascade unique,
  name        text        not null,
  plan        text        not null default 'starter'
);

create index if not exists organizations_operator_idx on organizations(operator_id);

-- Active and deactivated team members
create table if not exists organization_members (
  id               uuid        primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  organization_id  uuid        not null references organizations(id) on delete cascade,
  user_id          text        not null,   -- email used as user_id in demo mode
  email            text        not null,
  role             text        not null default 'leasing_agent',
    -- 'viewer' | 'leasing_agent' | 'manager' | 'admin' | 'owner'
  status           text        not null default 'active',
    -- 'active' | 'deactivated'
  accepted_at      timestamptz,
  unique (organization_id, email)
);

create index if not exists org_members_org_idx on organization_members(organization_id);
create index if not exists org_members_email_idx on organization_members(email);

-- Pending invitations (expire after 7 days)
create table if not exists organization_invitations (
  id               uuid        primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  organization_id  uuid        not null references organizations(id) on delete cascade,
  email            text        not null,
  role             text        not null default 'leasing_agent',
  property_ids     uuid[]      default '{}',
  token            text        not null unique default gen_random_uuid()::text,
  invited_by       text,
  expires_at       timestamptz not null default (now() + interval '7 days'),
  accepted_at      timestamptz
);

create index if not exists org_invitations_org_idx   on organization_invitations(organization_id);
create index if not exists org_invitations_token_idx on organization_invitations(token);

-- Per-user property access restrictions (only applies to non-owner/non-admin roles)
create table if not exists user_property_access (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  user_id          text not null,
  property_id      uuid not null references properties(id) on delete cascade,
  unique (organization_id, user_id, property_id)
);

create index if not exists user_property_access_user_idx on user_property_access(organization_id, user_id);
