create table book_component_translation (
  -- base
  id uuid primary key,
  type text not null,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,

  -- ketida base
  deleted boolean default false,

  -- translation
  language_iso text not null,

  -- foreign
  book_component_id uuid not null references book_component,

  -- own
  content text,
  notes jsonb,
  title text,

  y_state text default null,

  -- constraints
  unique(book_component_id, language_iso)
);
