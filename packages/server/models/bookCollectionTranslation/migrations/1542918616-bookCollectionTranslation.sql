create table book_collection_translation (
  -- base
  id uuid primary key,
  type text not null,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,

  -- ketida base
  deleted boolean default false,

  -- translation
  language_iso text not null,

  --foreign
  collection_id uuid not null references book_collection,

  --own
  description text,
  title text not null,

  -- constraints
  unique(collection_id, language_iso)
);
