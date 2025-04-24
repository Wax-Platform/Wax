create table application_parameter (
  -- base
  id uuid primary key,
  type text not null,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,

  --own
  context text not null,
  area text not null,
  config jsonb
);

CREATE INDEX ON application_parameter (context);
CREATE INDEX ON application_parameter (area);
