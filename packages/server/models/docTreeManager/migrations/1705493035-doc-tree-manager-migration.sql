CREATE TABLE doc_tree_manager (
  id UUID PRIMARY KEY NOT NULL DEFAULT public.gen_random_uuid(),
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  title TEXT,
  parent_id uuid,
  children jsonb not null,
  is_folder Boolean NOT NULL default false,

  -- foreign
  doc_id uuid references docs
);