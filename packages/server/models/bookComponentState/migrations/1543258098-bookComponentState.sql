create table book_component_state (
  -- base
  id uuid primary key,
  type text not null,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,

  -- ketida base
  deleted boolean default false,

  -- foreign
  book_component_id uuid not null references book_component,

  -- own
  comments jsonb,
  track_changes_enabled boolean default false,
  workflow_stages jsonb,
  uploading boolean default false
);
