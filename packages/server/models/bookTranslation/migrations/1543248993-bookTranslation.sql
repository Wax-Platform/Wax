create table book_translation (
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
  book_id uuid not null references book,

  -- own
  abstract_content text,
  abstract_title text,
  alternative_title text,
  keywords text [],
  subtitle text,
  title text not null,

  -- constraints
  unique(book_id, language_iso)
);
