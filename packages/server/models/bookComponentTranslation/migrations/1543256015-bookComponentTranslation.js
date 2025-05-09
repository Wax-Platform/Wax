exports.up = knex => {
  return knex.schema.createTable('book_component_translation', table => {
    // base
    table.uuid('id').primary();
    table.text('type').notNullable();
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp('updated', { useTz: true });

    // ketida base
    table.boolean('deleted').defaultTo(false);

    // translation
    table.text('language_iso').notNullable();

    // foreign
    table.uuid('book_component_id').notNullable().references('id').inTable('book_component');

    // own
    table.text('content');
    table.jsonb('notes');
    table.text('title');

    table.text('y_state').defaultTo(null);

    // constraints
    table.unique(['book_component_id', 'language_iso']);
  });
};

exports.down = knex => {
  return knex.schema.dropTable('book_component_translation');
};

