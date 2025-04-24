create table lock (
  -- base
  id uuid primary key,
  type text not null,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,

  -- ketida base
  deleted boolean default false,

  -- foreign
  -- TODO: add reference when user table exists
  user_id uuid not null, -- references user

  --own
  foreign_id uuid not null, -- no reference as we don't know which table
  foreign_type text not null
);
