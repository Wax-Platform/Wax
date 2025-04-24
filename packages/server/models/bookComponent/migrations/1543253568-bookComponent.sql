create table book_component (
  -- base
  id uuid primary key,
  type text not null,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,
  
  -- ketida base
  deleted boolean default false,

  -- foreign
  book_id uuid not null references book,
  division_id uuid not null references division,

  -- own
  archived boolean default false,
  component_type text,
  pagination jsonb not null,
  reference_id uuid not null,
  
  -- own -> counters
  equation_counter int,
  figure_counter int,
  note_counter int,
  page_counter int,
  table_counter int,
  word_counter int
);
