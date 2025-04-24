create table book (
  -- base
  id uuid primary key,
  type text not null,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,

  -- ketida base
  deleted boolean default false,

  -- foreign
  collection_id uuid not null references book_collection,
  /*
    to do
    we ceannot enforc the integrity of division id's, as an array of foreign
    keys is not yet supported in postgres. there seems to be some work on this,
    so we should update when the feature is in postgres.
  */
  divisions jsonb not null,

  -- own
  archived boolean default false,
  copyright_statement text,
  copyright_holder text,
  copyright_year int,
  edition int,
  license text,
  publication_date text,
  reference_id uuid
);
