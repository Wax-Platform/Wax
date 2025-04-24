create table custom_tag (
  -- base
  id uuid primary key,
  type text not null,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,
  -- ketida base
  deleted boolean default false,
  -- own
  label text,
  tag_type text
);
