create table template (
  -- base
  id uuid primary key,
  type text not null,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,

  -- ketida base
  deleted boolean default false,

  reference_id uuid,
  author text,
  name text not null,
  target text,
  trim_size text
);