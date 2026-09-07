-- Esquema de DesdeChina LLM.
-- Se aplica solo con: npm run db:migrate

create extension if not exists pgcrypto;

create table if not exists users (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  name           text not null default '',
  password_hash  text not null,
  role           text not null default 'user'   check (role in ('user', 'admin')),
  status         text not null default 'active' check (status in ('active', 'suspended')),
  monthly_limit  integer not null default 50    check (monthly_limit >= 0),
  created_at     timestamptz not null default now(),
  last_login_at  timestamptz
);

-- El correo se guarda ya normalizado en minúsculas; este índice lo deja explícito.
create unique index if not exists users_email_lower_idx on users (lower(email));

create table if not exists sessions (
  token_hash  text primary key,
  user_id     uuid not null references users(id) on delete cascade,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists sessions_user_idx on sessions (user_id);
create index if not exists sessions_expires_idx on sessions (expires_at);

-- Una fila por mensaje enviado a OpenRouter. Es la base de la cuota mensual.
create table if not exists usage_events (
  id                bigserial primary key,
  user_id           uuid not null references users(id) on delete cascade,
  task_id           text not null,
  model             text not null,
  prompt_tokens     integer not null default 0,
  completion_tokens integer not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists usage_events_user_created_idx on usage_events (user_id, created_at desc);
