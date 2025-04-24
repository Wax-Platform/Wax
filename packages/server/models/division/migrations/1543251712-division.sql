create table division (
  -- base
  id uuid primary key,
  type text not null,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,

  -- ketida base
  deleted boolean default false,

  --foreign
  book_id uuid not null references book,
  /* Same note as divisions in book */
  book_components jsonb not null,

  --own
  label text not null
);
