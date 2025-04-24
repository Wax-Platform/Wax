create table service_callback_token (
  -- base
  id uuid primary key,
  type text not null,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,

  -- ketida base
  deleted boolean default false,
  -- foreign
  book_component_id uuid not null references book_component,
  -- service_credential_id uuid not null references service_credential,

  -- own
  response_token text,

  -- constraints
  -- unique(book_component_id, response_token, service_credential_id)
  unique(book_component_id, response_token)
);
